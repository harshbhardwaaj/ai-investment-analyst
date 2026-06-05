# AI Investment Analyst — Constitution v1.3

**Version**: 1.3 | **Date**: June 5, 2026

---

## Core Principles

### I. Real Data, No Exceptions
All financial figures shown to the user must come from a verified API source (yfinance or equivalent). No hardcoded numbers, no LLM-hallucinated metrics, no web scraping. If data is unavailable for a field, the tool must say so explicitly rather than fill the gap.

### II. Recruiter-First Experience
A recruiter who visits the live URL must see a working, impressive output within 60 seconds — no setup, no instructions, no "enter your API key." Demo data is pre-loaded. The tool earns its credibility in the first interaction, or it fails its purpose.

### III. Investment Memo Format, Not a Dashboard
The output is a structured investment memo — the format PE analysts and VC associates actually produce and read. It is not a chart dashboard, not a data dump, not a chatbot. Seven sections, in order: company snapshot, key financials, trading comps, precedent transactions, DCF valuation, LBO screen, investment thesis. This structure and language is non-negotiable.

### IV. Show the Financial Logic in Code
DCF, WACC decomposition, LBO returns, sensitivity tables — the math lives in Python, not in Claude. Claude synthesizes and interprets; Python calculates. This distinction is what makes the project a proof of financial competence, not just a demo of API calls.

### V. Precedent Transactions — Honest, Not Faked
The precedent transactions section is included to demonstrate awareness of the concept. Since no free API covers M&A deal data, the demo uses a curated static dataset for the pre-loaded company, clearly labeled as sourced manually. The section explicitly notes that production use would pull from Capital IQ or Mergermarket. No fabricated deal data.

### VI. Honest Limitations
The tool does not claim to replace analyst judgment. The investment thesis (bull case, bear case, verdict) is explicitly AI-generated synthesis, labeled as such. No pretense that this is investment advice.

### VII. Scope Discipline
This is a portfolio project, not a product. Scope creep is deferred unless all seven memo sections are shipped and working. Every new feature idea gets parked, not immediately added.

---

## Constraints

- **Solo project, student timeline** — shippable in 2-3 focused sessions
- **Budget: $0** — free tier only: Streamlit Cloud / Vercel, yfinance (free), Claude API (pay-per-call, minimal cost)
- **Free tier, fit for purpose** — Python is the core (financial logic, data fetching). Frontend and deployment are open: Streamlit, Next.js + Vercel, or anything else that's free and genuinely better for the job. No tool gets added just because it's cool — it earns its place by solving a real problem the simpler option can't. Stack decisions get made at the Plan stage.
- **Public deployment required** — live at a shareable URL before it counts as done
- **No backend/database** — stateless app only for V1

---

## Quality Standards

- Works correctly on first recruiter visit, no broken states visible
- Output reads like something a junior PE analyst actually produced — correct terminology, correct memo structure
- Full memo generates in under 30 seconds
- Demo company is a real, well-known name that any finance person recognizes
- Precedent transactions section is clearly labeled, never looks like fabricated data

---

## Governance

- Real financial data requirement cannot be waived — surface errors, do not substitute
- All seven memo sections must be present; none can be silently dropped
- Financial calculations (DCF, WACC, LBO IRR/MOIC) must be computed in Python, not delegated to Claude
- Any change to the memo format requires revisiting the spec, not just patching code
