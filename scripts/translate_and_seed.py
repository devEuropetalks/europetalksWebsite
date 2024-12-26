import json
import asyncio
import asyncpg
from transformers import MarianMTModel, MarianTokenizer
from typing import Dict, Any, List
import os
from dotenv import load_dotenv
import uuid
from collections import OrderedDict

# Load environment variables
load_dotenv()

# Language configurations - easy to extend
LANGUAGES = {
    "de": {"name": "Deutsch", "model": "Helsinki-NLP/opus-mt-en-de"},
    "fr": {"name": "Français", "model": "Helsinki-NLP/opus-mt-en-fr"},
    "es": {"name": "Español", "model": "Helsinki-NLP/opus-mt-en-es"},
    "it": {"name": "Italiano", "model": "Helsinki-NLP/opus-mt-en-it"},
}

class Translator:
    def __init__(self, target_lang: str):
        model_name = LANGUAGES[target_lang]["model"]
        self.tokenizer = MarianTokenizer.from_pretrained(model_name)
        self.model = MarianMTModel.from_pretrained(model_name)

    def translate(self, text: str) -> str:
        if not isinstance(text, str):
            return text

        try:
            inputs = self.tokenizer(text, return_tensors="pt", padding=True)
            translated = self.model.generate(**inputs)
            result = self.tokenizer.decode(translated[0], skip_special_tokens=True)
            return result
        except Exception as e:
            print(f"Translation error for '{text}': {e}")
            return text

def maintain_json_order(obj: Any) -> Any:
    """Recursively maintain the order of JSON objects"""
    if isinstance(obj, dict):
        return OrderedDict((k, maintain_json_order(v)) for k, v in obj.items())
    elif isinstance(obj, list):
        return [maintain_json_order(item) for item in obj]
    return obj

async def ensure_table_exists(conn):
    """Create the Translation table if it doesn't exist with proper JSONB type"""
    # Check if table exists
    table_exists = await conn.fetchval("""
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = 'Translation'
        );
    """)
    
    if not table_exists:
        await conn.execute("""
            CREATE TABLE "Translation" (
                id TEXT PRIMARY KEY,
                language VARCHAR(10) NOT NULL UNIQUE,
                content JSONB NOT NULL,
                "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
            
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW."updatedAt" = CURRENT_TIMESTAMP;
                RETURN NEW;
            END;
            $$ language 'plpgsql';
            
            CREATE TRIGGER update_translation_updated_at
                BEFORE UPDATE ON "Translation"
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
        """)
        print("✓ Database table created with proper JSONB type")
    else:
        print("✓ Using existing Translation table")

def generate_cuid2() -> str:
    """Generate a CUID2-like ID"""
    return f"cm{uuid.uuid4().hex[:24]}"

async def translate_and_seed():
    """Main function to translate and seed the database"""
    try:
        # Load source English translations
        with open("translations/translations.json", "r", encoding="utf-8") as f:
            translations = json.load(f, object_pairs_hook=OrderedDict)
        
        # Get English content as source
        en_content = translations.get("en", {})
        if not en_content:
            raise ValueError("English translations not found in translations.json")

        # Connect to database
        conn = await asyncpg.connect(os.getenv("DATABASE_URL"))
        
        try:
            # Ensure the Translation table exists (don't drop it)
            await ensure_table_exists(conn)

            # First, ensure English translations are in the database
            existing_en = await conn.fetchrow(
                'SELECT id, content FROM "Translation" WHERE language = $1',
                'en'
            )

            if not existing_en:
                await conn.execute(
                    '''
                    INSERT INTO "Translation" (id, language, content, "updatedAt")
                    VALUES ($1, $2, $3::jsonb, CURRENT_TIMESTAMP)
                    ''',
                    generate_cuid2(),
                    'en',
                    json.dumps(en_content)
                )
                print("✓ Created English translations")
            else:
                await conn.execute(
                    '''
                    UPDATE "Translation" 
                    SET content = $1::jsonb,
                        "updatedAt" = CURRENT_TIMESTAMP
                    WHERE id = $2
                    ''',
                    json.dumps(en_content),
                    existing_en['id']
                )
                print("✓ Updated English translations")

            # Process each target language
            for lang_code, lang_info in LANGUAGES.items():
                print(f"\nProcessing {lang_info['name']} ({lang_code})...")

                # Check for existing translation
                existing = await conn.fetchrow(
                    'SELECT id, content FROM "Translation" WHERE language = $1',
                    lang_code
                )

                translator = Translator(lang_code)
                
                if existing:
                    # Parse existing content if it's a string
                    existing_content = existing['content']
                    if isinstance(existing_content, str):
                        try:
                            existing_content = json.loads(existing_content)
                        except json.JSONDecodeError:
                            print(f"Warning: Invalid JSON content for {lang_code}, treating as empty")
                            existing_content = {}
                    
                    print(f"Found existing translations for {lang_code}")
                    
                    # Only translate missing namespaces or keys
                    updated_content = dict(existing_content)
                    for namespace, translations in en_content.items():
                        if namespace not in updated_content:
                            print(f"Translating missing namespace: {namespace}")
                            updated_content[namespace] = translate_dict(translations, translator)
                        else:
                            # Check for missing keys in existing namespaces
                            for key, value in translations.items():
                                if key not in updated_content[namespace]:
                                    print(f"Translating missing key: {namespace}.{key}")
                                    updated_content[namespace][key] = translator.translate(value) if isinstance(value, str) else value

                    if updated_content != existing_content:
                        # Update only if there are changes
                        await conn.execute(
                            '''
                            UPDATE "Translation" 
                            SET content = $1::jsonb,
                                "updatedAt" = CURRENT_TIMESTAMP
                            WHERE id = $2
                            ''',
                            json.dumps(updated_content),
                            existing['id']
                        )
                        print(f"✓ Updated missing translations for {lang_info['name']}")
                    else:
                        print(f"✓ No new translations needed for {lang_info['name']}")
                else:
                    # Create new translation for language
                    translated_content = translate_dict(en_content, translator)
                    await conn.execute(
                        '''
                        INSERT INTO "Translation" (id, language, content, "updatedAt")
                        VALUES ($1, $2, $3::jsonb, CURRENT_TIMESTAMP)
                        ''',
                        generate_cuid2(),
                        lang_code,
                        json.dumps(translated_content)
                    )
                    print(f"✓ Created new translations for {lang_info['name']}")

            print("\n✓ All translations completed successfully!")

            # Verify the content is stored correctly
            rows = await conn.fetch('SELECT language, content FROM "Translation"')
            print("\nVerifying stored translations:")
            for row in rows:
                content_sample = json.dumps(row['content'])[:100] + "..."
                print(f"{row['language']}: {content_sample}")

        finally:
            await conn.close()

    except Exception as e:
        print(f"Error during translation and seeding: {e}")
        raise

def translate_dict(obj: Any, translator: Translator) -> Any:
    """Recursively translate all string values in a dictionary"""
    if isinstance(obj, str):
        return translator.translate(obj)
    elif isinstance(obj, dict):
        return OrderedDict((k, translate_dict(v, translator)) for k, v in obj.items())
    elif isinstance(obj, list):
        return [translate_dict(item, translator) for item in obj]
    return obj

if __name__ == "__main__":
    asyncio.run(translate_and_seed())