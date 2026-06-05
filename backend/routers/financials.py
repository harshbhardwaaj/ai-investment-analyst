import yfinance as yf
from fastapi import APIRouter, HTTPException
from models.schemas import CompanyData

router = APIRouter()

def safe_float(value, default=0.0):
    try:
        if value is None:
            return default
        return float(value)
    except (TypeError, ValueError):
        return default

@router.get("/company/{ticker}", response_model=CompanyData)
def get_company_data(ticker: str, ebitda_override: float = None):
    try:
        stock = yf.Ticker(ticker)
        info = stock.info

        # Validate ticker — check for a meaningful response
        if not info or info.get("quoteType") is None:
            raise HTTPException(status_code=404, detail=f"Ticker '{ticker}' not found")

        # Try to get Normalized EBITDA from financials dataframe
        normalized_ebitda = None
        try:
            financials = stock.financials
            if "Normalized EBITDA" in financials.index:
                normalized_ebitda = float(financials.loc["Normalized EBITDA"].iloc[0])
        except Exception:
            pass

        # Reported EBITDA
        ebitda = info.get("ebitda")
        ebitda_user_provided = False

        # If both missing, check for override or signal frontend
        if ebitda is None and normalized_ebitda is None:
            if ebitda_override is not None:
                ebitda = ebitda_override
                ebitda_user_provided = True
            else:
                raise HTTPException(status_code=422, detail="EBITDA_MISSING")

        if ebitda is None:
            ebitda = normalized_ebitda or 0.0

        current_price = safe_float(
            info.get("currentPrice") or info.get("regularMarketPrice")
        )

        return CompanyData(
            ticker=ticker.upper(),
            name=info.get("longName") or info.get("shortName") or ticker,
            sector=info.get("sector") or "Unknown",
            industry=info.get("industry") or "Unknown",
            description=info.get("longBusinessSummary") or "No description available.",
            current_price=current_price,
            market_cap=safe_float(info.get("marketCap")),
            revenue=safe_float(info.get("totalRevenue")),
            ebitda=safe_float(ebitda),
            normalized_ebitda=normalized_ebitda,
            gross_margin=safe_float(info.get("grossMargins")),
            operating_margin=safe_float(info.get("operatingMargins")),
            free_cash_flow=safe_float(info.get("freeCashflow")) if info.get("freeCashflow") else None,
            total_debt=safe_float(info.get("totalDebt")),
            beta=safe_float(info.get("beta"), default=1.0),
            ebitda_user_provided=ebitda_user_provided
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching data for {ticker}: {str(e)}")