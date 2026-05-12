import os
import json
import google.genai as genai
from dotenv import load_dotenv

# env yükleme (service level güvenli)
base_dir = os.path.dirname(os.path.dirname(__file__))
load_dotenv(os.path.join(base_dir, ".env.local"))


def get_client():
    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        raise Exception("GEMINI_API_KEY bulunamadı")

    return genai.Client(api_key=api_key)


def analyze_inventory_service(products):

    client = get_client()
    model_name = "gemini-flash-latest"

    inventory_context = json.dumps(
        [p.model_dump() for p in products],
        ensure_ascii=False
    )

    prompt = f"""
Sen bir e-ticaret satış analisti ve karar destek sistemisin.

Aşağıdaki ürün listesini analiz et:

{inventory_context}

GÖREVLER:
1. En kritik ürünleri belirle (stok + satış etkisi)
2. Stoğu 10'un altında olanları acil olarak işaretle
3. Satış artırma fırsatlarını bul
4. Kampanya önerisi üret

YANIT FORMATI (SADECE JSON):

{{
  "analiz_notu": "Kısa özet",
  "kritik_stoklar": ["Ürün 1", "Ürün 2"],
  "kampanya_fikri": "Öneri",
  "tedarik_taslagi": "Tedarik mesajı"
}}
"""

    response = client.models.generate_content(
        model=model_name,
        contents=prompt
    )

    ai_response = response.candidates[0].content.parts[0].text

    clean_json = ai_response.replace("```json", "").replace("```", "").strip()

    return json.loads(clean_json)