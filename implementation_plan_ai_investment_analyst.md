# Implementation Plan: AI Investment Analyst

**Spec**: spec_ai_investment_analyst.md | **Date**: June 5, 2026

---

## Summary

A two-service architecture: a Python FastAPI backend handling all financial data fetching and calculations, and a Next.js frontend delivering a polished investment memo UI. Both deployed on free tiers. The split is intentional — Python owns the financial logic (Constitution IV), Next.js owns the presentation quality (Constitution III).

---

## Technical Context

**Stack**: Python (FastAPI) + Next.js (TypeScript, Tailwind CSS, shadcn/ui)

**Primary dependencies**:
- `yfinance` — financial data (prices, financials, balance sheet, beta, sector/industry)
- `pandas` + `numpy` — DCF, LBO, sensitivity matrix calculations
- `anthropic` SDK — Claude API for peer ticker suggestions and thesis synthesis
- `fastapi` + `uvicorn` — Python API server
- `pydantic` — request/response validation
- Next.js 14 + Tailwind CSS + shadcn/ui — frontend

**Deployment**:
- Frontend: Vercel (free tier)
- Backend: Railway (free tier, persistent process, no cold start issues)

**Storage**: Stateless. No database. Precedent transactions stored as a static `precedent_transactions.json` in the backend. No user data persisted.

**Target audience**: PE/VC recruiters visiting a shareable URL. Demo company pre-loaded. No login, no setup.

**Performance goals**: Full 7-section memo in under 30 seconds. First paint (demo company) under 3 seconds.

**Constraints**: Free tier only. Solo build. No paid data APIs.

---

## Constitution Check

- ✅ **I. Real Data** — yfinance fetches all financials server-side. Errors surfaced explicitly, never silently swallowed.
- ✅ **II. Recruiter-First** — Demo company pre-loaded. First render shows a complete memo before the user does anything.
- ✅ **III. Investment Memo Format** — Seven dedicated React components, one per section. Document-style layout, not a dashboard. Correct PE terminology throughout.
- ✅ **IV. Financial Logic in Code** — DCF, WACC, LBO, sensitivity table all computed in Python. Claude receives numbers, not calculation tasks.
- ✅ **V. Precedent Transactions** — Static JSON file, manually curated, clearly labeled in UI.
- ✅ **VI. Honest Limitations** — Investment thesis component renders with an "AI-generated" label.
- ✅ **VII. Scope Discipline** — P1/P2/P3 phasing enforced in task list. Nothing outside seven sections gets built in V1.

---

## Architecture

```
ai-investment-analyst/
│
├── backend/                              # Python FastAPI
│   ├── main.py                           # App entry point, CORS config
│   ├── routers/
│   │   ├── financials.py                 # yfinance: fetch company + peer data
│   │   ├── calculations.py               # DCF, WACC, LBO, sensitivity (pure Python)
│   │   └── thesis.py                     # Claude API: peer suggestions + thesis synthesis
│   ├── models/
│   │   └── schemas.py                    # Pydantic request/response models
│   └── data/
│       └── precedent_transactions.json   # Static M&A deal dataset
│
├── frontend/                             # Next.js 14
│   ├── app/
│   │   ├── page.tsx                      # Main page, demo pre-loaded
│   │   └── components/
│   │       ├── TickerInput.tsx           # Search bar + generate button
│   │       ├── CompanySnapshot.tsx       # Section 1
│   │       ├── KeyFinancials.tsx         # Section 2
│   │       ├── TradingComps.tsx          # Section 3
│   │       ├── PrecedentTxns.tsx         # Section 4
│   │       ├── DCFValuation.tsx          # Section 5 (incl. sensitivity table)
│   │       ├── LBOScreen.tsx             # Section 6 (incl. configurable inputs)
│   │       └── InvestmentThesis.tsx      # Section 7 (AI-labeled)
│   ├── lib/
│   │   ├── api.ts                        # Typed fetch calls to FastAPI backend
│   │   └── types.ts                      # Shared TypeScript types
│   └── ...
│
└── README.md
```

**Data flow**:
```
User enters ticker
    → Next.js calls FastAPI /memo/{ticker}
    → FastAPI fetches yfinance data
    → FastAPI calls Claude to suggest peer tickers
    → FastAPI fetches peer data from yfinance
    → FastAPI runs Python calculations (DCF, WACC, LBO, comps)
    → FastAPI calls Claude with numbers + context for thesis synthesis
    → FastAPI returns structured JSON memo
    → Next.js renders 7-section memo
```

---

## Resolved Research Items

- ✅ **[RESOLVED] yfinance data availability** — Confirmed for large-cap tickers (tested on SAP.DE):
  - `beta`, `marketCap`, `totalDebt`, `freeCashflow`, `ebitda` all populated
  - `industry` and `sector` strings available for Claude peer suggestions
  - `financials` dataframe returns 4 years of data (2022–2025)
  - `Normalized EBITDA` available — use this over reported EBITDA where present (PE standard)

- ✅ **[RESOLVED] Railway RAM** — pandas + numpy on yfinance-scale data is well within 512MB free tier limits.

- ✅ **[RESOLVED] Peer tickers** — Claude suggests peer tickers from company name + sector/industry strings returned by yfinance. Demo company gets a hardcoded curated peer list for reliability on first load.

- ✅ **[RESOLVED] Risk-free rate** — No external dependency needed. Hardcoded constants: 4.3% USD (10Y Treasury), 2.5% EUR (10Y Bund). Exposed as a user-adjustable input field defaulting to these values. Auto-detected from ticker suffix (.DE, .PA etc. = EUR, else USD).

- ✅ **[RESOLVED] Export** — Copy shareable link only. No PDF export or additional dependencies in V1.

---

## Decisions & Rationale

| Decision | Why | Alternative Rejected |
|---|---|---|
| FastAPI + Railway for backend | yfinance requires a persistent Python process. Railway keeps the server alive with no cold starts. | Vercel Python serverless — yfinance fails on cold starts due to network timeouts |
| Next.js + Vercel for frontend | Full control over memo layout and typography needed to make output look like real analyst work product (Constitution III). | Streamlit — layout constraints make it hard to render a document-style memo; looks like a student project |
| All financial math in Python backend | Constitution IV is explicit: financial logic in code, not in Claude. This is the proof of competence. | Asking Claude to calculate DCF — defeats the entire purpose of the project |
| Claude for peer ticker suggestions | yfinance does not expose comparable company tickers. Claude + sector/industry strings is a clean, free solution. Demo company has hardcoded peers as fallback. | Hardcoding all peer groups — breaks for non-demo tickers |
| Risk-free rate as hardcoded constant + user input | No free API needed. User can adjust if they want a different rate assumption, which also makes the LBO/DCF feel live and interactive. | FRED API dependency — unnecessary complexity for a portfolio project |
| Normalized EBITDA over reported EBITDA | PE analysts use normalized figures to strip out one-off items. Using it signals financial literacy. yfinance returns both; prefer normalized where available. | Reported EBITDA — less accurate for valuation purposes |
| Static JSON for precedent transactions | No free API exists for M&A deal data. Honest labeling satisfies Constitution V and still demonstrates concept awareness to recruiters. | Scraping Mergermarket/Capital IQ — violates ToS and Constitution I |
| shadcn/ui component library | Pre-built accessible components with clean defaults, Tailwind-native, no extra config. Saves hours on UI polish. | Building components from scratch — unnecessary time spend for a portfolio project |
| Claude called from backend only | API key stays server-side, never exposed to the browser. | Calling Claude from Next.js API routes — adds env var complexity on Vercel |
