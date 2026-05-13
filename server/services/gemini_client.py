import os
import google.generativeai as genai
from dotenv import load_dotenv
from pathlib import Path

# server/ klasörünü bul
SERVER_DIR = Path(__file__).resolve().parents[1]

env_path = SERVER_DIR / ".env"

load_dotenv(env_path, override=True)

def get_gemini_model(model_name: str = "gemini-2.0-flash"):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY bulunamadı. server/.env dosyasını kontrol et.")
    genai.configure(api_key=api_key)
    print([m.name for m in genai.list_models()])
    return genai.GenerativeModel(model_name)



async def generate_text(prompt: str, max_tokens: int = 500) -> str:
    """Basit tek seferlik metin üretimi."""
    try:
        model = get_gemini_model()
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                max_output_tokens=max_tokens,
                temperature=0.7,
            ),
        )
        return response.text.strip()
    except Exception as e:
        return f"AI yanıt üretemedi: {str(e)}"