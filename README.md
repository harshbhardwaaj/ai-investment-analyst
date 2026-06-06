# AI Investment Analyst

A tool that generates a full investment memo in seconds — the kind of analysis a junior analyst would spend 2-3 hours on.

**Live**: [ai-investment-analyst-harsh.vercel.app](https://ai-investment-analyst-harsh.vercel.app)

## What it does

Enter any public company ticker and get a structured one-page investment memo covering:

- Company snapshot and key financials (live data via yfinance)
- Trading comps benchmarked against sector peers
- Precedent transactions in the sector
- DCF valuation with WACC decomposition and sensitivity table
- LBO screen with configurable assumptions and live IRR/MOIC
- AI-generated investment thesis (bull case, bear case, verdict)

## Stack

- **Backend**: Python, FastAPI, yfinance, NumPy — deployed on Railway
- **Frontend**: Next.js, TypeScript, Tailwind CSS — deployed on Vercel
- **AI**: Claude API (Anthropic) for peer suggestions and thesis synthesis
- **Financial logic**: DCF, WACC, LBO, sensitivity tables all computed in Python

## Run locally

```bash
# Backend
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
echo "ANTHROPIC_API_KEY=your_key" > .env
uvicorn main:app --reload

# Frontend
cd frontend
pnpm install
echo "NEXT_PUBLIC_API_URL=http://127.0.0.1:8000" > .env.local
pnpm dev
```