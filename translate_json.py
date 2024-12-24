import os
import json
from pathlib import Path
from deep_translator import GoogleTranslator # type: ignore

# Map of language codes
LANGUAGES = {
    "de": "german",
    "es": "spanish", 
    "fr": "french",
    "it": "italian"
}

def translate_text(text: str, target_lang: str) -> str:
    """Translate a single string using Google Translate."""
    try:
        translator = GoogleTranslator(source='english', target=target_lang)
        return translator.translate(text)
    except Exception as e:
        print(f"Error translating '{text}': {e}")
        return text

def translate_recursive(data, target_lang: str):
    """Recursively translate all string values in a JSON-like structure."""
    if isinstance(data, dict):
        return {key: translate_recursive(value, target_lang) for key, value in data.items()}
    elif isinstance(data, list):
        return [translate_recursive(item, target_lang) for item in data]
    elif isinstance(data, str):
        return translate_text(data, target_lang)
    else:
        return data

def translate_file(en_file_path: Path, target_file_path: Path, target_lang: str):
    """Load a JSON file, translate it, and save to target path."""
    print(f"Translating {en_file_path.name} to {target_lang}...")
    
    with open(en_file_path, "r", encoding="utf-8") as infile:
        data = json.load(infile)

    translated_data = translate_recursive(data, target_lang)
    
    # Ensure target directory exists
    target_file_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(target_file_path, "w", encoding="utf-8") as outfile:
        json.dump(translated_data, outfile, ensure_ascii=False, indent=2)

def main():
    base_dir = Path("public/locales")
    en_dir = base_dir / "en"

    # Process each JSON file in the English directory
    for en_file in en_dir.glob("*.json"):
        # For each target language
        for lang_code, lang_name in LANGUAGES.items():
            target_file = base_dir / lang_code / en_file.name
            translate_file(en_file, target_file, lang_name)

    print("Translation completed!")

if __name__ == "__main__":
    main()
