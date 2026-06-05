from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from routers import financials, thesis

app = FastAPI(title="AI Investment Analyst")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://*.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(financials.router, prefix="/api", tags=["financials"])
app.include_router(thesis.router, prefix="/api", tags=["thesis"])

@app.get("/")
def root():
    return {"status": "AI Investment Analyst API is running"}

@app.get("/api/memo/{ticker}")
def get_memo(ticker: str, ebitda_override: float = None):
    company = financials.get_company_data(ticker, ebitda_override)
    investment_thesis = thesis.generate_thesis(company)
    return {
        "company": company,
        "thesis": investment_thesis,
        "comps": None,
        "dcf": None,
        "lbo": None
    }