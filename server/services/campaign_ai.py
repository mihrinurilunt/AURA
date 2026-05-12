import json
import os
import google.genai as genai
from dotenv import load_dotenv

base_dir = os.path.dirname(os.path.dirname(__file__))
load_dotenv(os.path.join(base_dir, ".env.local"))



def get_client():
    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        raise Exception("GEMINI_API_KEY bulunamadı!")

    return genai.Client(api_key=api_key)
model = "gemini-flash-latest"


def generate_campaign(payload: dict):
    client = get_client()
    
    prompt = f"""
Sen bir e-ticaret büyüme ve kampanya stratejistisin.

Aşağıdaki veriyi analiz et:

ÜRÜN:
{json.dumps(payload.get("product"), ensure_ascii=False)}

İLİŞKİLİ ÜRÜNLER:
{json.dumps(payload.get("relatedProducts", []), ensure_ascii=False)}

SON SİPARİŞ SİNYALLERİ:
{json.dumps(payload.get("recentOrders", []), ensure_ascii=False)}

GÖREV:
1. Cross-sell fırsatlarını bul
2. Bundle önerisi oluştur
3. Satış artış potansiyeli hesapla
4. Kampanya dili üret (insan gibi yaz)

YANIT FORMATI (SADECE JSON):

{{
  "headline": "Kısa dikkat çekici kampanya başlığı",
  "body": "Kullanıcıya gösterilecek açıklama (UI text)",
  "tags": ["cross-sell", "seasonal", "high-potential"],
  "secondary": [
    {{
      "title": "Strateji 1",
      "body": "Açıklama"
    }},
    {{
      "title": "Strateji 2",
      "body": "Açıklama"
    }}
  ]
}}
"""

    response = client.models.generate_content(
        model=model,
        contents=prompt
    )

    raw = response.candidates[0].content.parts[0].text
    clean = raw.replace("```json", "").replace("```", "").strip()

    return json.loads(clean)