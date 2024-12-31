import json
import asyncio
import asyncpg
from transformers import MarianMTModel, MarianTokenizer
from typing import Dict, Any, List
import os
from dotenv import load_dotenv
import uuid
from collections import OrderedDict

class OrderedJsonEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, OrderedDict):
            return {"__ordered__": True, "items": list(obj.items())}
        return super().default(obj)

def ordered_json_decoder(dct):
    if "__ordered__" in dct:
        return OrderedDict(dct["items"])
    return dct

# Load environment variables
load_dotenv()

# Language configurations - easy to extend
LANGUAGES = OrderedDict([
    ("de", {"name": "Deutsch", "model": "Helsinki-NLP/opus-mt-en-de"}),
    ("fr", {"name": "Français", "model": "Helsinki-NLP/opus-mt-en-fr"}),
    ("es", {"name": "Español", "model": "Helsinki-NLP/opus-mt-en-es"}),
    ("it", {"name": "Italiano", "model": "Helsinki-NLP/opus-mt-en-it"}),
])

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

def translate_dict(obj: Any, translator: Translator) -> Any:
    """Recursively translate all string values in a dictionary while maintaining order"""
    if isinstance(obj, str):
        return translator.translate(obj)
    elif isinstance(obj, dict):
        # Create a new OrderedDict with the same order as the source
        result = OrderedDict()
        for k in obj.keys():  # This preserves the original order
            result[k] = translate_dict(obj[k], translator)
        return result
    elif isinstance(obj, list):
        return [translate_dict(item, translator) for item in obj]
    return obj

async def translate_and_seed():
    """Main function to translate and seed the database"""
    try:
        # Load source English translations with ordered dict
        with open("translations/translations.json", "r", encoding="utf-8") as f:
            translations = json.load(f, object_pairs_hook=OrderedDict)
        
        # Get English content as source
        en_content = translations.get("en", OrderedDict())
        if not en_content:
            raise ValueError("English translations not found in translations.json")

        # Connect to database
        conn = await asyncpg.connect(os.getenv("DATABASE_URL"))
        
        try:
            # Ensure the Translation table exists (don't drop it)
            await ensure_table_exists(conn)

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
                    # Parse existing content with ordered dict
                    existing_content = existing['content']
                    if isinstance(existing_content, str):
                        try:
                            existing_content = json.loads(existing_content, object_pairs_hook=OrderedDict)
                        except json.JSONDecodeError:
                            print(f"Warning: Invalid JSON content for {lang_code}, treating as empty")
                            existing_content = OrderedDict()
                    
                    print(f"Found existing translations for {lang_code}")
                    
                    # Create a new OrderedDict with the same order as the source
                    updated_content = OrderedDict()
                    for namespace in en_content.keys():  # Use source order
                        if namespace not in existing_content:
                            print(f"Translating missing namespace: {namespace}")
                            updated_content[namespace] = translate_dict(en_content[namespace], translator)
                        else:
                            # Maintain order within each namespace
                            namespace_content = OrderedDict()
                            for key in en_content[namespace].keys():  # Use source order for keys
                                if key not in existing_content[namespace]:
                                    print(f"Translating missing key: {namespace}.{key}")
                                    namespace_content[key] = translator.translate(en_content[namespace][key]) if isinstance(en_content[namespace][key], str) else en_content[namespace][key]
                                else:
                                    namespace_content[key] = existing_content[namespace][key]
                            updated_content[namespace] = namespace_content

                    if updated_content != existing_content:
                        # Update only if there are changes
                        await conn.execute(
                            '''
                            UPDATE "Translation" 
                            SET content = $3::jsonb,
                                "updatedAt" = CURRENT_TIMESTAMP
                            WHERE id = $1 AND language = $2
                            ''',
                            existing['id'],
                            lang_code,
                            json.dumps(updated_content, ensure_ascii=False, cls=OrderedJsonEncoder)
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
                        json.dumps(translated_content, ensure_ascii=False, cls=OrderedJsonEncoder)
                    )
                    print(f"✓ Created new translations for {lang_info['name']}")

            print("\n✓ All translations completed successfully!")

            # Verify the content is stored correctly
            rows = await conn.fetch('SELECT language, content FROM "Translation" ORDER BY language')
            print("\nVerifying stored translations:")
            for row in rows:
                content = json.loads(row['content'], object_hook=ordered_json_decoder)
                content_sample = json.dumps(content, ensure_ascii=False, cls=OrderedJsonEncoder)[:100] + "..."
                print(f"{row['language']}: {content_sample}")

        finally:
            await conn.close()

    except Exception as e:
        print(f"Error during translation and seeding: {e}")
        raise

if __name__ == "__main__":
    asyncio.run(translate_and_seed())