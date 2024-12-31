import json
import asyncio
import asyncpg
from transformers import MarianMTModel, MarianTokenizer
import os
from dotenv import load_dotenv
import uuid

# Load environment variables
load_dotenv()

# Language configurations
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

async def ensure_table_exists(conn):
    """Create the Translation table if it doesn't exist"""
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
            
            CREATE TRIGGER update_translation_updated_at
                BEFORE UPDATE ON "Translation"
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
        """)
        print("✓ Database table created")
    else:
        print("✓ Using existing Translation table")

def generate_id() -> str:
    return f"tr_{uuid.uuid4().hex[:16]}"

def translate_dict(obj: dict | list | str, translator: Translator):
    """Recursively translate all string values in a dictionary"""
    if isinstance(obj, str):
        return translator.translate(obj)
    elif isinstance(obj, dict):
        return {k: translate_dict(v, translator) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [translate_dict(item, translator) for item in obj]
    return obj

async def translate_and_seed():
    """Main function to translate and seed the database"""
    try:
        # Load source English translations
        with open("translations/translations.json", "r", encoding="utf-8") as f:
            translations = json.load(f)
        
        # Get English content as source
        en_content = translations.get("en", {})
        if not en_content:
            raise ValueError("English translations not found in translations.json")

        # Connect to database
        conn = await asyncpg.connect(os.getenv("DATABASE_URL"))
        
        try:
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
                    # Update existing translations
                    existing_content = existing['content']
                    updated_content = dict(existing_content)
                    
                    # Add or update translations
                    for namespace, translations in en_content.items():
                        if namespace not in updated_content:
                            print(f"Translating namespace: {namespace}")
                            updated_content[namespace] = translate_dict(translations, translator)
                        else:
                            # Update missing keys
                            for key, value in translations.items():
                                if key not in updated_content[namespace]:
                                    print(f"Translating key: {namespace}.{key}")
                                    updated_content[namespace][key] = translator.translate(value) if isinstance(value, str) else value

                    await conn.execute(
                        '''
                        UPDATE "Translation" 
                        SET content = $2::jsonb,
                            "updatedAt" = CURRENT_TIMESTAMP
                        WHERE id = $1
                        ''',
                        existing['id'],
                        json.dumps(updated_content, ensure_ascii=False)
                    )
                    print(f"✓ Updated translations for {lang_info['name']}")
                else:
                    # Create new translation
                    translated_content = translate_dict(en_content, translator)
                    await conn.execute(
                        '''
                        INSERT INTO "Translation" (id, language, content)
                        VALUES ($1, $2, $3::jsonb)
                        ''',
                        generate_id(),
                        lang_code,
                        json.dumps(translated_content, ensure_ascii=False)
                    )
                    print(f"✓ Created translations for {lang_info['name']}")

            print("\n✓ All translations completed!")

        finally:
            await conn.close()

    except Exception as e:
        print(f"Error: {e}")
        raise

if __name__ == "__main__":
    asyncio.run(translate_and_seed())