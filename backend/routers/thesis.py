import os
import json
import anthropic
from fastapi import APIRouter, HTTPException
from models.schemas import ThesisResult, CompanyData
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()
client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

@router.post("/thesis", response_model=ThesisResult)
def generate_thesis(company: CompanyData):
    try:
        prompt = f"""You are a senior investment analyst. Based on the following company data, provide a concise investment analysis.

Company: {company.name} ({company.ticker})
Sector: {company.sector} | Industry: {company.industry}
Current Price: {company.current_price:,.2f} | Market Cap: {company.market_cap/1e9:.1f}B
Revenue: {company.revenue/1e9:.1f}B | EBITDA: {company.ebitda/1e9:.1f}B
Gross Margin: {company.gross_margin*100:.1f}% | Operating Margin: {company.operating_margin*100:.1f}%
Free Cash Flow: {(company.free_cash_flow or 0)/1e9:.1f}B
Total Debt: {company.total_debt/1e9:.1f}B
Beta: {company.beta}

Respond ONLY with this JSON, no other text:
{{
  "bull_case": "one sentence bull case referencing specific numbers",
  "bear_case": "one sentence bear case referencing specific numbers",
  "verdict": "buy or watch or pass"
}}

Respond with ONLY the raw JSON object. No markdown, no code blocks, no explanation.
Verdict must be exactly one of: buy, watch, pass."""

        message = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=300,
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