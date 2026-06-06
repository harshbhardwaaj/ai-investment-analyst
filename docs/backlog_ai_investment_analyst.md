# AI Investment Analyst — Improvement Backlog

**Status**: Post-launch improvements. Core product is live and working.

---

## B001 — Dynamic DCF growth rate
**Priority**: High
**Why**: DCF currently uses a hardcoded 8% growth rate for all companies. High-growth companies like ASML (historically 20%+) show unrealistically low intrinsic values as a result.
**Fix**: Fetch `revenueGrowth` from yfinance `.info` dict in `financials.py` and pass it through to the DCF calculator in `calculations.py`. Use it as the base growth rate, capped at a reasonable ceiling (e.g. 25%) to avoid outliers.
**Files**: `backend/routers/financials.py`, `backend/routers/calculations.py`

---

## B002 — Better peer suggestion prompt
**Priority**: Medium
**Why**: Claude sometimes returns adjacent-sector companies as peers (e.g. EDA software companies for semiconductor equipment). The current prompt is too broad.
**Fix**: Update the peer suggestion prompt in `thesis.py` to explicitly exclude companies in adjacent subsectors and require business model similarity, not just sector match. Example addition: "Exclude companies that are in the same broad sector but different business — for example, exclude EDA software companies when the target is semiconductor equipment."
**Files**: `backend/routers/thesis.py`

---

## B003 — Expand precedent transactions to more sectors
**Priority**: Medium
**Why**: The static `precedent_transactions.json` only covers the Technology sector. BMW, ASML, and companies in other sectors fall back to tech deals which are irrelevant.
**Fix**: Add curated, manually verified deal datasets for at least: Consumer Cyclical (auto/manufacturing), Healthcare, Industrials, Semiconductor Equipment, Financial Services. Each deal must have verified deal value and EV/EBITDA multiple before adding.
**Files**: `backend/data/precedent_transactions.json`

---

## B004 — Read more button for company description
**Priority**: Low
**Why**: Company description is currently capped at 5 lines. Full description is useful context but makes the memo long.
**Fix**: Add a "Read more / Read less" toggle button below the description in `CompanySnapshot.tsx`. Default to 5 lines, expand to full on click.
**Files**: `frontend/app/components/CompanySnapshot.tsx`

---

## B005 — Switch Claude model to Sonnet before sharing
**Priority**: High (do before sharing URL with anyone)
**Why**: Currently using Haiku for cost efficiency during development. Sonnet produces noticeably better bull/bear/verdict output.
**Fix**: In `thesis.py`, change `model="claude-haiku-4-5-20251001"` to `model="claude-sonnet-4-6"`.
**Files**: `backend/routers/thesis.py`

---

## B006 — Add disclaimer when DCF shows extreme values
**Priority**: Low
**Why**: When intrinsic value is very far from current price (e.g. -75% for ASML), it can look like a model error rather than a valuation signal.
**Fix**: When `upside_downside_pct` is below -50% or above +100%, add a small note in the DCF section explaining that extreme values often reflect growth expectations not captured by a standard DCF (e.g. "This DCF uses conservative growth assumptions. The market may be pricing in higher long-term growth.").
**Files**: `frontend/app/components/DCFValuation.tsx`
