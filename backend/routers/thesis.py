import os
import json
import anthropic
from fastapi import APIRouter, HTTPException
from models.schemas import ThesisResult, CompanyData
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()
client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

@router.get("/peers/{ticker}")
def get_peer_tickers(ticker: str, sector: str = "", industry: str = ""):
    try:
        # Hardcoded peers for demo company
        if ticker.upper() == "SAP.DE":
            return {"peers": ["ORCL", "CRM", "MSFT", "NOW", "WDAY"]}

        prompt = f"""You are a buy-side equity analyst. Return exactly 4 ticker symbols for the closest publicly traded peers of this company.

Target company:
- Ticker: {ticker}
- Sector: {sector}
- Industry: {industry}

Requirements:
- Peers must be in the SAME specific industry as the target: {industry}
- Same core business model — not just same broad sector
- Valid Yahoo Finance ticker symbols only
- Prefer US-listed tickers (NYSE/NASDAQ)

Critical exclusions:
- Do NOT pick companies from adjacent industries even if in the same sector
- Example: if target is semiconductor equipment, exclude EDA software companies
- Example: if target is enterprise software, exclude hardware or semiconductor companies
- Example: if target is auto manufacturing, exclude auto parts suppliers

Return ONLY this JSON, no other text:
{{"peers": ["TICK1", "TICK2", "TICK3", "TICK4"]}}"""

        message = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=100,
            messages=[{"role": "user", "content": prompt}]
        )

        import re
        response_text = message.content[0].text.strip()
        response_text = re.sub(r'```json\s*', '', response_text)
        response_text = re.sub(r'```\s*', '', response_text)
        data = json.loads(response_text.strip())
        return data

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Peer suggestion failed: {str(e)}")

@router.post("/thesis", response_model=ThesisResult)
def generate_thesis(company: CompanyData):
    try:
        prompt = f"""You are a senior investment analyst at a top-tier private equity firm writing a concise investment memo section.

You have been given the following verified financial data for {company.name} ({company.ticker}). Use ONLY these numbers — do not invent, estimate, or reference any figures not listed below. If a metric is not listed, do not mention it.

COMPANY DATA:
- Name: {company.name}
- Ticker: {company.ticker}
- Sector: {company.sector} | Industry: {company.industry}
- Current Share Price: {company.current_price:,.2f}
- Market Capitalisation: {company.market_cap/1e9:.1f}B
- Annual Revenue: {company.revenue/1e9:.1f}B
- EBITDA (reported): {company.ebitda/1e9:.1f}B
- Normalised EBITDA: {(company.normalized_ebitda or company.ebitda)/1e9:.1f}B
- Gross Margin: {company.gross_margin*100:.1f}%
- Operating Margin: {company.operating_margin*100:.1f}%
- Free Cash Flow: {(company.free_cash_flow or 0)/1e9:.1f}B
- Total Debt: {company.total_debt/1e9:.1f}B
- Beta (market sensitivity, NOT market cap): {company.beta:.3f}
- Revenue Growth Rate: {company.revenue_growth*100:.1f}%
- Reporting Currency: {"EUR" if any(company.ticker.upper().endswith(s) for s in [".DE", ".PA", ".AS", ".MI", ".MC", ".L", ".SW"]) else "USD"}

TASK:
Write a concise investment thesis with three components:

1. BULL CASE: The strongest 1-2 sentence argument FOR investing. Reference specific metrics from above. Focus on what makes this company financially compelling.

2. BEAR CASE: The strongest 1-2 sentence argument AGAINST investing. Reference specific metrics from above. Focus on genuine risks visible in the data.

3. VERDICT: A single word — exactly one of: buy, watch, pass. Base this on the balance of evidence above.

RULES:
- Every number you cite must appear exactly as listed in the COMPANY DATA above
- Beta ({company.beta:.3f}) is a volatility measure, NOT a size metric — do not confuse it with market cap or revenue
- Market cap ({company.market_cap/1e9:.1f}B) and revenue ({company.revenue/1e9:.1f}B) are different numbers — cite them correctly
- Do not use vague language like "strong fundamentals" without backing it with a specific number
- Verdict must reflect the overall balance — do not default to "watch" without reason
- Always use the correct Reporting Currency symbol when citing monetary figures — EUR (€) for European companies, USD ($) for US companies

Respond ONLY with this JSON, no other text, no markdown:
{{
  "bull_case": "your bull case here",
  "bear_case": "your bear case here",
  "verdict": "buy or watch or pass"
}}"""

        message = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=500,
            messages=[{"role": "user", "content": prompt}]
        )

        import re
        response_text = message.content[0].text.strip()
        response_text = re.sub(r'```json\s*', '', response_text)
        response_text = re.sub(r'```\s*', '', response_text)
        response_text = response_text.strip()
        data = json.loads(response_text)

        return ThesisResult(
            bull_case=data["bull_case"],
            bear_case=data["bear_case"],
            verdict=data["verdict"]
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Thesis generation failed: {str(e)}")