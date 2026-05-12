import google.genai as genai
import json
import os

class GeminiAssistant:
    def __init__(self):
        # API Key'i sistemden güvenli alıyoruz
        self.client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
        self.model_name = "gemini-1.5-flash"

    def analyze_cargo_logic(self, cargo_data, user_query=None):
        """
        image_9c0586.png'deki analiz mantığını ve 
        image_9c05de.png'deki asistan yanıtını birleştirir.
        """
        today = "2026-05-12"
        
        # Eğer kullanıcı mesajı yoksa operasyonel rapor hazırlar
        # Eğer mesaj varsa müşteriye yanıt döner
        role_description = "Sen bir lojistik yapay zeka ajanısın."
        
        prompt = f"""
        {role_description} Bugünün tarihi: {today}
        Kargo Verisi: {json.dumps(cargo_data, ensure_ascii=False)}
        {f'Müşteri Mesajı: "{user_query}"' if user_query else 'Görev: Operasyonel rapor sun.'}

        Görevlerin:
        1. Gecikme varsa nedenini açıkla.
        2. Nazik ve profesyonel bir yanıt/rapor hazırla.
        3. Varsa indirim kodunu (TELAFİ15 gibi) belirt.
        """
        
        response = self.client.models.generate_content(
            model=self.model_name, 
            contents=prompt
        )
        return response.text.strip()
