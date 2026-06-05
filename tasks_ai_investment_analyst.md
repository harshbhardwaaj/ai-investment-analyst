# Tasks: AI Investment Analyst

**Plan**: plan_ai_investment_analyst.md | **Date**: June 5, 2026

---

## Phase 1 — Setup
**Purpose**: Foundation both services share. Nothing else starts until this is done.

- [ ] T001: Create Git repo, scaffold monorepo with `backend/` and `frontend/` folders, push to GitHub
- [ ] T002 [P]: Set up Python backend — `cd backend`, create virtualenv, `pip install fastapi uvicorn yfinance pandas numpy anthropic pydantic`, verify imports work
- [ ] T003 [P]: Set up Next.js frontend — `npx create-next-app@latest frontend --typescript --tailwind`, then install shadcn/ui via `npx shadcn@latest init`
- [ ] T004: Define all Pydantic schemas in `backend/models/schemas.py` — `MemoResponse`, `CompanyData`, `DCFResult`, `LBOResult`, `CompsResult`, `ThesisResult`
- [ ] T005 [P]: Define matching TypeScript types in `frontend/lib/types.ts` — mirrors the Pydantic schemas exactly
- [ ] T006: Configure CORS in `backend/main.py` — allow requests from localhost and the Vercel frontend URL

**Checkpoint**: Both services start locally without errors. Schemas defined on both sides. Ready to build.

---

## Phase 2 — User Story 1: Core Memo (P1) 🎯 MVP
**Goal**: Company snapshot + key financials + AI thesis. Demo pre-loaded. Live on a public URL.

**Independent Test**: Visit live URL, see SAP memo. Enter AAPL, get a fresh memo. Enter garbage ticker, get a clear error message.

- [ ] T007 [US1]: Write `backend/routers/financials.py` — fetch from yfinance: `beta`, `marketCap`, `totalDebt`, `freeCashflow`, `normalizedEBITDA` (fallback to `ebitda`), `totalRevenue`, `grossMargins`, `operatingMargins`, `currentPrice`, `sector`, `industry`, `longBusinessSummary`
- [ ] T008 [US1]: Add error handling to `financials.py` — invalid ticker returns a clean error JSON, missing EBITDA triggers a flag in the response telling the frontend to prompt the user for manual input (FR-011)
- [ ] T009 [US1]: Write `backend/routers/thesis.py` — call Claude API with company name, sector, revenue, EBITDA, margins, growth. Prompt it to return bull case (1 sentence), bear case (1 sentence), verdict (buy/pass/watch)
- [ ] T010 [US1]: Wire up `GET /memo/{ticker}` in `backend/main.py` — calls `financials.py`, then `thesis.py`, returns single structured `MemoResponse` JSON
- [ ] T011 [P] [US1]: Build `frontend/app/components/CompanySnapshot.tsx` — company name, sector, market cap, current price, one-line business description
- [ ] T012 [P] [US1]: Build `frontend/app/components/KeyFinancials.tsx` — revenue, normalized EBITDA, gross margin, operating margin, FCF, 3-year revenue growth rate. Use shadcn/ui table.
- [ ] T013 [P] [US1]: Build `frontend/app/components/InvestmentThesis.tsx` — bull case, bear case, verdict. Clear "AI-generated synthesis" label. Verdict styled green/amber/red for buy/watch/pass.
- [ ] T014 [US1]: Build `frontend/app/components/TickerInput.tsx` — search input, generate button, loading spinner, error display, EBITDA manual entry field (shown only when backend flags it missing)
- [ ] T015 [US1]: Build `frontend/lib/api.ts` — typed `fetchMemo(ticker: string)` function calling FastAPI, handles errors cleanly
- [ ] T016 [US1]: Build `frontend/app/page.tsx` — layout with `TickerInput` at top, memo sections below. Pre-load SAP.DE on first render by calling `fetchMemo("SAP.DE")` server-side.
- [ ] T017 [US1]: Deploy backend to Railway — connect GitHub repo, set `ANTHROPIC_API_KEY` env var, confirm `/memo/SAP.DE` returns valid JSON from live URL
- [ ] T018 [US1]: Deploy frontend to Vercel — connect GitHub repo, set `NEXT_PUBLIC_API_URL` to Railway backend URL, confirm live URL renders SAP memo

**Checkpoint**: US1 complete. Live URL shows full SAP memo with snapshot, financials, thesis. Test AAPL and one invalid ticker. Do not proceed to US2 until this is stable.

---

## Phase 3 — User Story 2: Valuation Layer (P2)
**Goal**: Trading comps, DCF + sensitivity table, LBO screen with configurable inputs.

**Independent Test**: Full valuation layer on SAP. Comps shows 3+ peers. DCF output verified manually against a hand-built model. Sensitivity table moves in correct direction. LBO IRR updates live when inputs change.

- [ ] T019 [US2]: Write WACC calculator in `backend/routers/calculations.py` — cost of equity via CAPM (`Rf + β × ERP`), cost of debt (`interest expense / total debt`), capital structure weights, blended WACC. Auto-detect currency from ticker suffix (.DE/.PA = EUR → Rf 2.5%, else USD → Rf 4.3%). ERP fixed at 5.5%.
- [ ] T020 [US2]: Write DCF calculator in `calculations.py` — project FCF for 5 years at fetched growth rate, discount at WACC, terminal value via Gordon Growth Model, sum to intrinsic value. Output: intrinsic value, current price, implied upside/downside %.
- [ ] T021 [US2]: Write sensitivity table generator in `calculations.py` — 3×3 matrix, WACC varies ±1% in 0.5% steps, terminal growth rate varies ±0.5% in 0.25% steps. Returns 9 intrinsic values.
- [ ] T022 [US2]: Write LBO screen in `calculations.py` — entry EV from configurable EV/EBITDA multiple, debt/equity split, 5-year annual debt paydown, exit EV from configurable exit multiple, compute IRR and MOIC. Accept assumption overrides as function parameters.
- [ ] T023 [US2]: Write peer ticker suggester in `backend/routers/thesis.py` — call Claude with company name + sector + industry, return list of 3-5 ticker strings. Hardcode SAP peer list (`["ORCL", "CRM", "MSFT", "NOW", "WDAY"]`) as fallback.
- [ ] T024 [US2]: Write comps fetcher in `financials.py` — for each peer ticker fetch EV/EBITDA, P/E, EV/Revenue from yfinance. Flag missing values as `null` in response, never crash on a missing peer metric.
- [ ] T025 [US2]: Expose `GET /calculations/{ticker}` endpoint in `main.py` — accepts optional LBO assumption overrides as query params, returns DCF result, WACC breakdown, sensitivity matrix, LBO result, comps data
- [ ] T026 [P] [US2]: Build `frontend/app/components/TradingComps.tsx` — table with target + peers, columns: EV/EBITDA, P/E, EV/Revenue. Target row highlighted. Premium/discount vs peer median shown.
- [ ] T027 [P] [US2]: Build `frontend/app/components/DCFValuation.tsx` — WACC decomposition (show each component: Rf, β, ERP, Kd, weights), intrinsic value vs current price, implied upside/downside in large text.
- [ ] T028 [P] [US2]: Build sensitivity table subcomponent inside `DCFValuation.tsx` — 3×3 grid, cells color-coded green (upside vs current price) to red (downside). Current base case cell highlighted with a border.
- [ ] T029 [P] [US2]: Build `frontend/app/components/LBOScreen.tsx` — input fields for entry multiple, debt %, interest rate, exit multiple, hold period (all with sensible defaults). IRR and MOIC update on input change via call to `/calculations/{ticker}` with new params.
- [ ] T030 [US2]: Manually verify DCF output for SAP — build a simple Excel/Google Sheets DCF with same inputs yfinance returns. Confirm Python output matches within rounding. Fix any formula errors.
- [ ] T031 [US2]: Wire all valuation components into `page.tsx` — fetch calculations alongside memo, pass data to each component

**Checkpoint**: US2 complete. All four valuation sections render correctly. DCF verified manually. LBO inputs are live. Do not proceed to US3 until T030 passes.

---

## Phase 4 — User Story 3: Full Memo Completeness (P3)
**Goal**: Precedent transactions added, UI polished, shareable link working.

**Independent Test**: Show the full 7-section memo to someone with a finance background. Does it read like an investment memo? Is the precedent transactions section clearly honest about its data source?

- [ ] T032 [US3]: Research and curate precedent transactions — find 3-5 real M&A deals in enterprise software, record: target name, acquirer, year, deal value (€/$ bn), EV/EBITDA multiple paid. Save to `backend/data/precedent_transactions.json`.
- [ ] T033 [US3]: Add `GET /precedent-transactions/{sector}` endpoint — returns relevant transactions from static JSON matched by sector string
- [ ] T034 [P] [US3]: Build `frontend/app/components/PrecedentTxns.tsx` — table: target, acquirer, year, deal value, EV/EBITDA paid. Footer: "Manually sourced. Production use would require Capital IQ or Mergermarket."
- [ ] T035 [US3]: Wire precedent transactions into `page.tsx` — fetch alongside memo and calculations, render as Section 4 between trading comps and DCF
- [ ] T036 [US3]: UI polish pass — consistent section numbering (1–7), correct PE terminology throughout, typography hierarchy, no raw Tailwind defaults showing through
- [ ] T037 [US3]: Add copy shareable link button — append `?ticker=SAP.DE` to current URL, copy to clipboard on click, show "Copied!" confirmation
- [ ] T038 [US3]: Final validation against all spec success criteria — check SC-001 through SC-006 explicitly, one by one

**Checkpoint**: US3 complete. Seven sections present and correctly ordered. Memo reads like analyst work product. Shareable link works.

---

## Phase 5 — Polish

- [ ] T039 [P]: Write `README.md` — live URL, one-paragraph description, tech stack, how to run locally
- [ ] T040 [P]: Test on 3 tickers beyond SAP — `AAPL`, `BMW.DE`, `ASML.AS`. Log any data gaps or crashes. Fix before calling done.
- [ ] T041: Open live URL in incognito. Time full memo generation. Confirm zero errors or empty states on demo company. Sign off.

---

## Execution Order

- **Phase 1 first** — blocks everything
- **Phase 2 (US1) after setup** — get live URL as fast as possible
- **Phase 3 (US2) after US1 stable** — do not build valuation on a shaky foundation
- **Phase 4 (US3) after T030 passes** — content correctness before polish
- **Phase 5** runs in parallel with late Phase 4 tasks

## Parallel Opportunities

- T002 + T003 — backend and frontend setup touch different folders entirely
- T004 + T005 — schemas and types can be written simultaneously once T001 is done
- T011, T012, T013 — all independent React components, build in any order
- T026, T027, T028, T029 — all independent valuation components, build in any order
- T034 — precedent transactions component has no dependency on T032/T033 once data shape is agreed
- T039 README — can be written any time after T017/T018 deploy
