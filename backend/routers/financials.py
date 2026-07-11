import time
import yfinance as yf
from fastapi import APIRouter, HTTPException
from models.schemas import CompanyData

router = APIRouter()

# In-memory cache for yfinance lookups. Yahoo Finance rate-limits per outbound
# IP (i.e. per Render instance, not per visitor), so every avoidable call
# matters — this also means a single memo request no longer fetches the same
# ticker's data twice (main.py's get_memo + calculations.get_calculations
# both fetch the target company).
_yf_cache = {}
_CACHE_TTL_SECONDS = 20 * 60   # successful lookups stay fresh for 20 min
_FAILURE_TTL_SECONDS = 60      # don't hammer Yahoo again for a minute after a failure

def _cached_fetch(cache_key, fetch_fn):
    now = time.monotonic()
    entry = _yf_cache.get(cache_key)
    if entry is not None:
        value, expires_at, is_error = entry
        if now < expires_at:
            if is_error:
                raise value
            return value
    try:
        value = fetch_fn()
        _yf_cache[cache_key] = (value, now + _CACHE_TTL_SECONDS, False)
        return value
    except Exception as e:
        _yf_cache[cache_key] = (e, now + _FAILURE_TTL_SECONDS, True)
        raise

def _get_yf_info(ticker: str):
    return _cached_fetch(("info", ticker.upper()), lambda: yf.Ticker(ticker).info)

def _get_yf_financials(ticker: str):
    return _cached_fetch(("financials", ticker.upper()), lambda: yf.Ticker(ticker).financials)

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
        info = _get_yf_info(ticker)

        # Validate ticker — check for a meaningful response
        if not info or info.get("quoteType") is None:
            raise HTTPException(status_code=404, detail=f"Ticker '{ticker}' not found")

        # Try to get Normalized EBITDA from financials dataframe
        normalized_ebitda = None
        try:
            financials = _get_yf_financials(ticker)
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

        raw_growth = info.get("revenueGrowth")
        if raw_growth is not None:
            revenue_growth = max(0.03, min(0.25, float(raw_growth)))
        else:
            revenue_growth = 0.08

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
            ebitda_user_provided=ebitda_user_provided,
            revenue_growth=revenue_growth,
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching data for {ticker}: {str(e)}")

@router.get("/comps/{ticker}")
def get_comps(ticker: str, sector: str = "", industry: str = ""):
    try:
        from routers.thesis import get_peer_tickers
        peers_response = get_peer_tickers(ticker, sector, industry)
        peer_tickers = peers_response["peers"]

        comps = []
        for peer in peer_tickers:
            try:
                info = _get_yf_info(peer)
                if not info or info.get("quoteType") is None:
                    continue
                comps.append({
                    "ticker": peer,
                    "name": info.get("shortName") or peer,
                    "ev_ebitda": safe_float(info.get("enterpriseToEbitda")) or None,
                    "pe_ratio": safe_float(info.get("trailingPE")) or None,
                    "ev_revenue": safe_float(info.get("enterpriseToRevenue")) or None,
                })
            except Exception:
                continue

        return {"comps": comps}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Comps fetch failed: {str(e)}")