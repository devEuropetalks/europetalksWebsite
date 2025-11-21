import json
import asyncio
import asyncpg
import sys

# Check for PyTorch installation
try:
    import torch
    if not torch.cuda.is_available():
        print("PyTorch is installed but CUDA is not available. Using CPU for translations (slower).")
except ImportError:
    print("PyTorch is not installed. Please install it with one of these commands:")
    print("For CPU only: pip install torch")
    print("For CUDA support (recommended): pip install torch --index-url https://download.pytorch.org/whl/cu118")
    print("\nAfter installing PyTorch, run this script again.")
    sys.exit(1)

from transformers import (
    MarianMTModel,
    MarianTokenizer,
    AutoModelForSeq2SeqLM,
    AutoTokenizer,
)
from typing import Dict, Any, List, Set, Tuple
import os
from dotenv import load_dotenv
import uuid
from collections import OrderedDict
from difflib import SequenceMatcher

#python version 3.12.8

# Load environment variables
load_dotenv()

# Language configurations - easy to extend
LANGUAGES = {
    "de": {"name": "Deutsch", "model": "Helsinki-NLP/opus-mt-en-de"},
    "fr": {"name": "Français", "model": "Helsinki-NLP/opus-mt-en-fr"},
    "es": {"name": "Español", "model": "Helsinki-NLP/opus-mt-en-es"},
    "it": {"name": "Italiano", "model": "Helsinki-NLP/opus-mt-en-it"},
    "nl": {"name": "Nederlands", "model": "Helsinki-NLP/opus-mt-en-nl"},
    "pt": {"name": "Português", "model": "Helsinki-NLP/opus-mt-en-ROMANCE"},
    "uk": {"name": "Українська", "model": "Helsinki-NLP/opus-mt-en-uk"},
    "lv": {"name": "Latviešu", "model": "Helsinki-NLP/opus-mt-en-sla"},
    "lt": {"name": "Lietuvių", "model": "Helsinki-NLP/opus-mt-en-sla"},
    "hr": {"name": "Hrvatski", "model": "Helsinki-NLP/opus-mt-en-sla"},
    "hu": {"name": "Magyar", "model": "Helsinki-NLP/opus-mt-en-sla"},
    "el": {"name": "Greek", "model": "Helsinki-NLP/opus-mt-en-sla"},
}


def string_similarity(a: str, b: str) -> float:
    """Calculate similarity ratio between two strings"""
    return SequenceMatcher(None, a, b).ratio()


class MultiTranslator:
    def __init__(self, target_lang: str):
        # Initialize Marian
        model_name = LANGUAGES[target_lang]["model"]
        self.tokenizer = MarianTokenizer.from_pretrained(model_name)
        self.model = MarianMTModel.from_pretrained(model_name)
        
        # Store target language
        self.target_lang = target_lang

        # Initialize NLLB
        self.nllb_model_name = "facebook/nllb-200-distilled-600M"
        self.nllb_tokenizer = AutoTokenizer.from_pretrained(self.nllb_model_name)
        self.nllb_model = AutoModelForSeq2SeqLM.from_pretrained(self.nllb_model_name)

        # Language code mapping for NLLB
        self.nllb_lang_map = {
            "de": "deu_Latn",
            "fr": "fra_Latn",
            "es": "spa_Latn",
            "it": "ita_Latn",
            "nl": "nld_Latn",
            "pt": "por_Latn",
            "uk": "ukr_Latn",
            "lv": "lav_Latn",
            "hr": "hrv_Latn",
            "hu": "hun_Latn",
            "el": "ell_Grek",
        }

        # Initialize Google Translate
        self.google_translator = GoogleTranslator(source="en", target=target_lang)

        # Initialize DeepL if API key is available and language is supported
        self.deepl_translator = None
        if os.getenv("DEEPL_API_KEY"):
            try:
                self.deepl_translator = DeeplTranslator(
                    api_key=os.getenv("DEEPL_API_KEY"), source="en", target=target_lang
                )
            except Exception as e:
                print(f"DeepL not available for {target_lang}: {str(e)}")
                # Continue without DeepL for this language
                pass

        # Load English NER model
        self.nlp = spacy.load("en_core_web_sm")

    def get_entities(self, text: str) -> Set[str]:
        """Extract named entities from text"""
        doc = self.nlp(text)
        entities = {
            ent.text
            for ent in doc.ents
            if ent.label_
            in {
                "GPE",  # Countries, cities, states
                "PERSON",  # People's names
                "ORG",  # Companies, organizations
                "LOC",  # Non-GPE locations
            }
        }
        entities.update(token.text for token in doc if token.pos_ == "PROPN")
        return entities

    def translate_with_marian(self, text: str) -> str:
        """Translate using Marian model"""
        try:
            inputs = self.tokenizer(text, return_tensors="pt", padding=True)
            translated = self.model.generate(**inputs)
            return self.tokenizer.decode(translated[0], skip_special_tokens=True)
        except Exception as e:
            print(f"Marian translation error: {e}")
            return None

    def translate_with_google(self, text: str) -> str:
        """Translate using Google Translate"""
        try:
            return self.google_translator.translate(text)
        except Exception as e:
            print(f"Google translation error: {e}")
            return None

    def translate_with_deepl(self, text: str) -> str:
        """Translate using DeepL"""
        try:
            if self.deepl_translator:
                return self.deepl_translator.translate(text)
            return None
        except Exception as e:
            print(f"DeepL translation error: {e}")
            return None

    def translate_with_nllb(self, text: str) -> str:
        """Translate using NLLB model"""
        try:
            # Get target language code for NLLB
            target_lang_code = self.nllb_lang_map.get(self.target_lang)
            if not target_lang_code:
                return None

            # Add the source language token for English
            inputs = self.nllb_tokenizer(f"eng_Latn {text}", return_tensors="pt")
            translated_tokens = self.nllb_model.generate(**inputs, max_length=128)
            return self.nllb_tokenizer.batch_decode(
                translated_tokens, skip_special_tokens=True
            )[0]
        except Exception as e:
            print(f"NLLB translation error: {e}")
            return None

    def get_consensus_translation(self, translations: List[str]) -> str:
        """Get the most agreed-upon translation"""
        valid_translations = [t for t in translations if t]
        if not valid_translations:
            return None

        if len(valid_translations) == 1:
            return valid_translations[0]

        # Calculate similarity scores between all translations
        scores = {}
        for i, t1 in enumerate(valid_translations):
            score = 0
            for j, t2 in enumerate(valid_translations):
                if i != j:
                    score += string_similarity(t1, t2)
            scores[t1] = score

        # Return translation with highest similarity to others
        return max(scores.items(), key=lambda x: x[1])[0]

    def translate(self, text: str) -> str:
        if not isinstance(text, str):
            return text

        try:
            # Get named entities before translation
            entities = self.get_entities(text)

            if text in entities:
                return text

            # Try DeepL first if available
            if self.deepl_translator:
                deepl_result = self.translate_with_deepl(text)
                if deepl_result:
                    return self.preserve_entities(deepl_result, entities)

            # Get translations from all available services
            translations = [
                self.translate_with_marian(text),
                self.translate_with_google(text),
                self.translate_with_nllb(text),
            ]

            # Get consensus translation
            result = self.get_consensus_translation(translations)
            if not result:
                return text

            return self.preserve_entities(result, entities)

        except Exception as e:
            print(f"Translation error for '{text}': {e}")
            return text

    def preserve_entities(self, translated_text: str, entities: Set[str]) -> str:
        """Preserve original named entities in the translated text"""
        result = translated_text
        for entity in entities:
            entity_lower = entity.lower()
            result_lower = result.lower()
            if entity_lower not in result_lower:
                # Try to find and replace translated entities
                for translator in [
                    self.translate_with_marian,
                    self.translate_with_google,
                    self.translate_with_nllb,
                ]:
                    if translator:
                        translated_entity = translator(entity)
                        if (
                            translated_entity
                            and translated_entity.lower() in result_lower
                        ):
                            result = result.replace(translated_entity, entity)
                            break
        return result


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
    table_exists = await conn.fetchval(
        """
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = 'Translation'
        );
    """
    )

    if not table_exists:
        await conn.execute(
            """
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
        """
        )
        print("✓ Database table created with proper JSONB type")
    else:
        print("✓ Using existing Translation table")


def generate_cuid2() -> str:
    """Generate a CUID2-like ID"""
    return str(uuid.uuid4())


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

            # Process each target language
            for lang_code, lang_info in LANGUAGES.items():
                print(f"\nProcessing {lang_info['name']} ({lang_code})...")
                
                # Check for existing translation
                existing = await conn.fetchrow(
                    'SELECT id, content FROM "Translation" WHERE language = $1',
                    lang_code,
                )

                translator = MultiTranslator(lang_code)

                if existing:
                    # Parse the JSON string into a dictionary
                    existing_content = (
                        json.loads(existing["content"])
                        if isinstance(existing["content"], str)
                        else existing["content"]
                    )
                    print(f"Found existing translations for {lang_code}")

                    # Update translations with missing keys
                    updated_content = {}
                    for namespace, translations in en_content.items():
                        # Ensure namespace exists in updated_content
                        if namespace not in updated_content:
                            if namespace in existing_content:
                                # If namespace already exists, copy its existing content
                                updated_content[namespace] = dict(existing_content[namespace])
                            else:
                                # Create new namespace
                                updated_content[namespace] = {}
                                print(f"Translating missing namespace: {namespace}")
                                updated_content[namespace] = translate_dict(
                                    translations, translator
                                )
                                continue  # Skip key checking since we translated the whole namespace

                        # Check for missing keys in existing namespaces
                        for key, value in translations.items():
                            if namespace in existing_content and key in existing_content[namespace]:
                                # Key exists, keep the existing translation
                                updated_content[namespace][key] = existing_content[namespace][key]
                            else:
                                # Key doesn't exist or has empty value, translate it
                                print(f"Translating missing key: {namespace}.{key}")
                                updated_content[namespace][key] = (
                                    translator.translate(value)
                                    if isinstance(value, str)
                                    else value
                                )

                    if updated_content != existing_content:
                        # Add debug information
                        print(f"DEBUG: Content differs - will update database")
                        # Update only if there are changes
                        await conn.execute(
                            """
                            UPDATE "Translation" 
                            SET content = $1::jsonb,
                                "updatedAt" = CURRENT_TIMESTAMP
                            WHERE id = $2
                            """,
                            json.dumps(updated_content),
                            existing["id"],
                        )
                        print(f"✓ Updated missing translations for {lang_info['name']}")
                    else:
                        print(f"DEBUG: Content identical - no update needed")
                        print(f"✓ No new translations needed for {lang_info['name']}")
                else:
                    # Create new translation for language
                    translated_content = translate_dict(en_content, translator)
                    await conn.execute(
                        """
                        INSERT INTO "Translation" (id, language, content, "updatedAt")
                        VALUES ($1, $2, $3::jsonb, CURRENT_TIMESTAMP)
                        """,
                        generate_cuid2(),
                        lang_code,
                        json.dumps(translated_content),
                    )
                    print(f"✓ Created new translations for {lang_info['name']}")

            print("\n✓ All translations completed successfully!")

            # Verify the content is stored correctly
            rows = await conn.fetch('SELECT language, content FROM "Translation"')
            print("\nVerifying stored translations:")
            for row in rows:
                content_sample = json.dumps(row["content"])[:100] + "..."
                print(f"{row['language']}: {content_sample}")

        finally:
            await conn.close()
            print("Database connection closed")

    except Exception as e:
        print(f"Error during translation and seeding: {e}")
        raise


def translate_dict(obj: Any, translator: MultiTranslator) -> Any:
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
