from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from routers import financials, thesis, calculations

app = FastAPI(title="AI Investment Analyst")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://ai-investment-analyst-harsh.vercel.app",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(financials.router, prefix="/api", tags=["financials"])
app.include_router(thesis.router, prefix="/api", tags=["thesis"])
app.include_router(calculations.router, prefix="/api", tags=["calculations"])

@app.get("/")
def root():
    return {"status": "AI Investment Analyst API is running"}

@app.get("/api/memo/{ticker}")
def get_memo(
        ticker: str,
        ebitda_override: float = None,
        entry_multiple: float = 10.0,
        debt_pct: float = 0.6,
        interest_rate: float = 0.07,
        exit_multiple: float = 12.0,
        hold_period: int = 5
):
    company = financials.get_company_data(ticker, ebitda_override)
    investment_thesis = thesis.generate_thesis(company)

    comps_data = None
    try:
        comps_response = financials.get_comps(ticker, company.sector, company.industry)
        comps_data = comps_response["comps"]
    except Exception:
        pass

    calc_data = None
    try:
        calc_data = calculations.get_calculations(
            ticker, entry_multiple, debt_pct,
            interest_rate, exit_multiple, hold_period, ebitda_override
        )
    except Exception:
        pass

    return {
        "company": company,
        "thesis": investment_thesis,
        "comps": comps_data,
        "dcf": calc_data["dcf"] if calc_data else None,
        "lbo": calc_data["lbo"] if calc_data else None,
        "wacc": calc_data["wacc"] if calc_data else None,
    }