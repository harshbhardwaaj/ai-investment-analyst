# Specification: AI Investment Analyst

**Status**: Locked | **Date**: June 5, 2026

---

## User Stories

### User Story 1 — Core Memo (Priority: P1) 🎯 MVP
A recruiter lands on the live URL, sees a pre-loaded memo for a well-known company, and immediately understands what the tool does. They can also enter any ticker and generate a fresh memo covering the company snapshot, key financials, and an AI-generated investment thesis.

**Why P1**: Delivers the core value proposition on its own. A recruiter sees a working, impressive output without needing the valuation sections to understand what Harsh built.

**Independent Test**: Deploy to public URL. Load the demo company. Confirm memo renders with real data, no errors, and the thesis section produces a coherent bull case, bear case, and verdict.

**Acceptance Scenarios**:
1. Given the app loads, When a recruiter visits the URL, Then they see a complete memo for the pre-loaded demo company without touching anything
2. Given a user enters a valid ticker (e.g. SAP, BMW.DE, AAPL), When they click generate, Then a memo renders with live yfinance data within 30 seconds
3. Given a user enters an invalid ticker, When they click generate, Then the app surfaces a clear error and does not crash or show empty fields

---

### User Story 2 — Valuation Layer (Priority: P2)
The memo includes four valuation sections that demonstrate financial modelling competence: trading comps benchmarked against sector peers, a DCF with WACC decomposition and intrinsic value output, a sensitivity table across WACC and terminal growth rate assumptions, and an LBO screen with user-configurable assumptions and live IRR/MOIC output.

**Why P2**: This is the section that separates the project from a data dashboard. The financial logic in Python is what proves the builder understands the mechanics, not just the APIs. Comes after P1 because P1 must be stable before layering in the modelling.

**Independent Test**: Run the tool on a known company. Manually verify DCF output against a hand-built model for the same inputs. Confirm the sensitivity table reflects correct directional relationships (higher WACC = lower valuation). Confirm LBO IRR moves correctly when entry multiple changes.

**Acceptance Scenarios**:
1. Given a valid ticker, When the memo generates, Then trading comps pull at least 3 sector peers with EV/EBITDA and P/E ratios, benchmarked against the target
2. Given a valid ticker, When the DCF runs, Then WACC is decomposed into its components (cost of equity via CAPM, cost of debt, capital structure), and intrinsic value vs current price is shown with implied upside/downside
3. Given a DCF runs, When the sensitivity table renders, Then a matrix of at least 9 values (3x3: WACC range x terminal growth rate range) is displayed with correct directional relationships
4. Given a valid ticker, When the LBO screen runs, Then it outputs entry EV, assumed debt/equity split, 5-year debt paydown, exit EV, IRR, and MOIC under user-configurable assumptions with sensible pre-filled defaults

---

### User Story 3 — Full Memo Completeness (Priority: P3)
The memo includes the precedent transactions section with a curated static dataset for the demo company, clearly labeled as manually sourced. The UI is polished to look like an actual investment memo, not a dev tool. The memo is shareable via a clean URL or exportable.

**Why P3**: Adds professional finish and demonstrates awareness of M&A comps as a concept. Comes last because content correctness matters more than polish, and polish without a working P2 is wasted effort.

**Independent Test**: Show the full 7-section memo to someone with a finance background and ask if it reads like an investment memo. Ask if the precedent transactions section is clearly honest about its data source.

**Acceptance Scenarios**:
1. Given the demo company loads, When the precedent transactions section renders, Then it shows at least 3 real historical M&A transactions in the sector, with deal value and EV/EBITDA multiple, labeled as manually sourced
2. Given any memo generates, When a user views it, Then all seven sections are present, correctly ordered, and the output reads like a real analyst memo in terminology and structure
3. Given a memo has generated, When a user wants to share it, Then they can either copy a shareable link or export the memo in a readable format

---

## Functional Requirements

- **FR-001**: System MUST fetch live financial data from yfinance — revenue, EBITDA, margins, growth rates, market cap, debt, cash, beta
- **FR-002**: System MUST compute DCF intrinsic value entirely in Python using fetched inputs — no delegation to Claude for arithmetic
- **FR-003**: System MUST compute WACC from components: cost of equity (CAPM), cost of debt, capital structure weights
- **FR-004**: System MUST generate a sensitivity table with WACC and terminal growth rate as the two axes, computed in Python
- **FR-005**: System MUST run an LBO screen in Python outputting entry EV, debt/equity split, 5-year debt paydown schedule, exit EV, IRR, and MOIC
- **FR-006**: System MUST pull at least 3 sector peers for trading comps using yfinance
- **FR-007**: System MUST pre-load a demo company on first visit with no user input required
- **FR-008**: System MUST surface data fetch errors explicitly — never show empty fields silently
- **FR-009**: System MUST label AI-generated sections (investment thesis, bull/bear/verdict) as AI-generated
- **FR-010**: System MUST label precedent transactions as manually sourced, not from a live API
- **FR-011**: If yfinance cannot return EBITDA for a ticker, the system MUST prompt the user to enter it manually before proceeding. The field is clearly labeled as user-provided in the output.
- **FR-012**: LBO screen assumptions (entry EV/EBITDA multiple, debt/equity split, interest rate, exit multiple, hold period) MUST be user-configurable via input fields or sliders. IRR and MOIC must update when assumptions change. Sensible defaults are pre-filled so the memo works without the user touching anything.

---

## Success Criteria

- **SC-001**: A recruiter from a PE/VC firm opens the URL and says the output looks like analyst work product, not a student project
- **SC-002**: Full 7-section memo generates in under 30 seconds for any valid ticker
- **SC-003**: DCF output is directionally correct when manually verified against the same inputs
- **SC-004**: LBO IRR and MOIC move in the correct direction when entry multiple or leverage assumptions change
- **SC-005**: Zero visible errors or empty states on the pre-loaded demo company
- **SC-006**: The project can be described in one sentence in a job interview and be immediately understood by a finance professional

---

## Assumptions

- yfinance provides sufficient data coverage for large-cap public companies — gaps are more likely for small/mid-cap tickers
- The demo company will be a large-cap stock (DAX or S&P 500) where yfinance data is reliable
- The Claude API is used only for qualitative synthesis — thesis, commentary, interpretation — never for financial calculations
- Sector peers for trading comps are either fetched from yfinance or defined as a static peer group per demo company
- The risk-free rate and equity risk premium for WACC are fetched or set as reasonable constants (e.g. current 10Y Bund yield for European companies)
- The project is solo — no collaboration or version control beyond a personal GitHub repo

---

## Edge Cases

- What happens when yfinance returns no data for a ticker? App must catch the error and show a clear message before any downstream computation runs
- What happens when a peer company in the comps has missing EV/EBITDA? The comp table must flag the missing value rather than showing 0 or crashing
- What happens when the DCF produces a negative intrinsic value due to extreme inputs? Output must be shown with an explanatory note, not silently suppressed
- What happens when beta is negative (e.g. gold stocks)? WACC calculation must handle this case without breaking
- What if the LBO screen produces an IRR below 0%? Show it — a pass verdict is a valid output
