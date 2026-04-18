import json
import base64
import os
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Digital Khata AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

VOICE_SYSTEM_PROMPT = """You are a financial transaction parser for Pakistani users.
Extract transaction details from Urdu/English text and return a JSON object.
Return ONLY valid JSON with these exact fields:
{
  "amount": <number>,
  "entity": "<person or shop name>",
  "category": "<one of: groceries, utilities, food, transport, shopping, healthcare, education, misc>",
  "type": "<credit or debt>",
  "description": "<brief English summary>"
}
Rules:
- "credit" means the user GAVE money (diye, dia, gave)
- "debt" means the user RECEIVED money or OWES money (liye, lena hai, owe)
- Extract numeric amount only (no currency symbols)
- Keep entity as a proper name"""

OCR_SYSTEM_PROMPT = """You are a receipt OCR parser. Extract all data from this receipt image.
The receipt may be in Urdu, English, or mixed. Translate everything to English.
Return ONLY valid JSON with these exact fields:
{
  "shop_name": "<store name>",
  "items": [{"item": "<item name>", "price": <number>}],
  "total_amount": <number>,
  "category": "<one of: groceries, utilities, food, transport, shopping, healthcare, education, misc>",
  "currency": "PKR",
  "description": "<one line English summary>"
}
If you cannot read the receipt clearly, make your best attempt at extraction."""


@app.get("/")
async def root():
    return {"status": "Digital Khata AI Backend running"}


@app.post("/voice-to-ledger")
async def voice_to_ledger(audio: UploadFile = File(...)):
    try:
        audio_bytes = await audio.read()

        transcript = client.audio.transcriptions.create(
            model="whisper-1",
            file=(audio.filename or "recording.webm", audio_bytes, audio.content_type or "audio/webm"),
            language="ur",
        )

        completion = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": VOICE_SYSTEM_PROMPT},
                {"role": "user", "content": f"Parse this transaction: {transcript.text}"},
            ],
            response_format={"type": "json_object"},
        )

        data = json.loads(completion.choices[0].message.content)
        return {"transcription": transcript.text, "data": data}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ocr-to-ledger")
async def ocr_to_ledger(image: UploadFile = File(...)):
    try:
        image_bytes = await image.read()
        b64_image = base64.b64encode(image_bytes).decode("utf-8")
        mime = image.content_type or "image/jpeg"

        completion = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": OCR_SYSTEM_PROMPT},
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:{mime};base64,{b64_image}"},
                        },
                    ],
                }
            ],
            response_format={"type": "json_object"},
        )

        data = json.loads(completion.choices[0].message.content)
        return {"data": data}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
