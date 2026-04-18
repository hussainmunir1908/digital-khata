# Digital Khata — AI Backend

FastAPI backend for voice transcription (Whisper) and receipt OCR (GPT-4o Vision).

## Setup

### 1. Navigate to the backend folder
```bash
cd backend
```

### 2. Create a virtual environment
```bash
python -m venv venv
```

### 3. Activate the virtual environment
```bash
# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate
```

### 4. Install dependencies
```bash
pip install -r requirements.txt
```

### 5. Add your OpenAI API key
```bash
cp .env.example .env
```
Edit `.env` and replace `your-openai-api-key-here` with your actual key from https://platform.openai.com/api-keys

### 6. Run the server
```bash
uvicorn main:app --reload --port 8000
```

The backend will be running at **http://localhost:8000**

---

## API Endpoints

### `POST /voice-to-ledger`
Accepts a voice recording, transcribes it with Whisper, then parses into a ledger entry.

**Request:** `multipart/form-data` with field `audio` (audio file — webm, mp3, wav, etc.)

**Response:**
```json
{
  "transcription": "Ali ko 1500 rupay diye groceries ke liye",
  "data": {
    "amount": 1500,
    "entity": "Ali",
    "category": "groceries",
    "type": "credit",
    "description": "Gave 1500 to Ali for groceries"
  }
}
```

---

### `POST /ocr-to-ledger`
Accepts a receipt image, extracts and parses all items using GPT-4o Vision.

**Request:** `multipart/form-data` with field `image` (image file — jpg, png, heic, etc.)

**Response:**
```json
{
  "data": {
    "shop_name": "Al Rahman Store",
    "items": [
      { "item": "Milk", "price": 150 },
      { "item": "Bread", "price": 50 },
      { "item": "Sugar", "price": 200 }
    ],
    "total_amount": 400,
    "category": "groceries",
    "currency": "PKR",
    "description": "Grocery shopping at Al Rahman Store, total Rs 400"
  }
}
```

---

## Testing with curl

```bash
# Voice endpoint
curl -X POST http://localhost:8000/voice-to-ledger \
  -F "audio=@/path/to/recording.webm"

# OCR endpoint
curl -X POST http://localhost:8000/ocr-to-ledger \
  -F "image=@/path/to/receipt.jpg"
```

## Running both frontend and backend

Open two terminals:

**Terminal 1 — Backend:**
```bash
cd backend
venv\Scripts\activate   # or source venv/bin/activate
uvicorn main:app --reload --port 8000
```

**Terminal 2 — Frontend:**
```bash
cd ..   # back to project root
npm run dev
```

Then open http://localhost:3000 in your browser.
