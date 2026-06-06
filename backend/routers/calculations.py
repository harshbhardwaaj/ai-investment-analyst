import numpy as np
from fastapi import APIRouter, HTTPException
from models.schemas import CompanyData, DCFResult, LBOResult

router = APIRouter()

# Constants
EQUITY_RISK_PREMIUM = 0.055
DEFAULT_TAX_RATE = 0.25
DEFAULT_TERMINAL_GROWTH_RATE = 0.025
DEFAULT_GROWTH_RATE = 0.08

EUROPEAN_SUFFIXES = [
    ".DE", ".PA", ".AS", ".MI", ".MC",
    ".L", ".SW", ".VI", ".BR", ".OL", ".ST", ".HE", ".CO"
]

def get_risk_free_rate(ticker: str) -> float:
    if any(ticker.upper().endswith(s) for s in EUROPEAN_SUFFIXES):
        return 0.025  # 10Y Bund
    return 0.043  # 10Y Treasury

def calculate_wacc(company: CompanyData) -> dict:
    rf = get_risk_free_rate(company.ticker)
    beta = max(company.beta, 0.1)  # floor at 0.1

    # Cost of equity (CAPM)
    cost_of_equity = rf + beta * EQUITY_RISK_PREMIUM

    # Cost of debt (risk-free + 2% spread, after-tax)
    cost_of_debt_pretax = rf + 0.02
    cost_of_debt = cost_of_debt_pretax * (1 - DEFAULT_TAX_RATE)

    # Capital structure weights
    equity = company.market_cap
    debt = company.total_debt
    total_capital = equity + debt

    if total_capital == 0:
        raise ValueError("Total capital is zero")

    equity_weight = equity / total_capital
    debt_weight = debt / total_capital

    # Blended WACC
    wacc = (equity_weight * cost_of_equity) + (debt_weight * cost_of_debt)

    return {
        "wacc": wacc,
        "cost_of_equity": cost_of_equity,
        "cost_of_debt": cost_of_debt,
        "risk_free_rate": rf,
        "equity_risk_premium": EQUITY_RISK_PREMIUM,
        "beta": beta,
        "equity_weight": equity_weight,
        "debt_weight": debt_weight,
    }

def calculate_dcf(company: CompanyData, wacc_data: dict,
                  terminal_growth_rate: float = DEFAULT_TERMINAL_GROWTH_RATE) -> dict:
    wacc = wacc_data["wacc"]

    # Base FCF — use reported FCF, fall back to EBITDA proxy
    if company.free_cash_flow and company.free_cash_flow > 0:
        base_fcf = company.free_cash_flow
    else:
        ebitda = company.normalized_ebitda or company.ebitda
        base_fcf = ebitda * (1 - DEFAULT_TAX_RATE) * 0.7

    growth_rate = company.revenue_growth

    # Project FCF for 5 years and discount
    projected_fcfs = []
    for year in range(1, 6):
        fcf = base_fcf * (1 + growth_rate) ** year
        discounted = fcf / (1 + wacc) ** year
        projected_fcfs.append(discounted)

    # Terminal value (Gordon Growth)
    terminal_fcf = base_fcf * (1 + growth_rate) ** 5 * (1 + terminal_growth_rate)
    terminal_value = terminal_fcf / (wacc - terminal_growth_rate)
    discounted_terminal = terminal_value / (1 + wacc) ** 5

    # Enterprise value → equity value
    enterprise_value = sum(projected_fcfs) + discounted_terminal
    equity_value = enterprise_value - company.total_debt

    # Intrinsic value per share
    shares = company.market_cap / company.current_price if company.current_price > 0 else 1
    intrinsic_value = equity_value / shares
    upside_pct = (intrinsic_value - company.current_price) / company.current_price * 100

    return {
        "intrinsic_value": round(intrinsic_value, 2),
        "current_price": company.current_price,
        "upside_downside_pct": round(upside_pct, 2),
        "terminal_growth_rate": terminal_growth_rate,
        "base_fcf": base_fcf,
        "growth_rate": growth_rate,
    }

def calculate_sensitivity(company: CompanyData, wacc_data: dict) -> dict:
    base_wacc = wacc_data["wacc"]
    base_tgr = DEFAULT_TERMINAL_GROWTH_RATE

    wacc_range = [base_wacc - 0.01, base_wacc, base_wacc + 0.01]
    tgr_range = [base_tgr + 0.005, base_tgr, base_tgr - 0.005]  # high to low

    matrix = []
    for tgr in tgr_range:
        row = []
        for w in wacc_range:
            modified = {**wacc_data, "wacc": w}
            result = calculate_dcf(company, modified, terminal_growth_rate=tgr)
            row.append(result["intrinsic_value"])
        matrix.append(row)

    return {
        "matrix": matrix,
        "wacc_range": [round(w * 100, 2) for w in wacc_range],
        "tgr_range": [round(t * 100, 2) for t in tgr_range],
    }

def calculate_lbo(
        company: CompanyData,
        entry_multiple: float = 10.0,
        debt_pct: float = 0.6,
        interest_rate: float = 0.07,
        exit_multiple: float = 12.0,
        hold_period: int = 5
) -> dict:
    ebitda = company.normalized_ebitda or company.ebitda

    # Entry
    entry_ev = entry_multiple * ebitda
    entry_debt = entry_ev * debt_pct
    entry_equity = entry_ev * (1 - debt_pct)

    # Annual FCF for debt paydown
    annual_fcf = company.free_cash_flow or (ebitda * 0.5)

    # Debt paydown schedule
    remaining_debt = entry_debt
    for _ in range(hold_period):
        interest = remaining_debt * interest_rate
        principal = max(annual_fcf - interest, 0)
        remaining_debt = max(remaining_debt - principal, 0)

    # Exit
    exit_ebitda = ebitda * (1 + 0.03) ** hold_period  # 3% EBITDA growth
    exit_ev = exit_multiple * exit_ebitda
    exit_equity = max(exit_ev - remaining_debt, 0)

    # Returns
    moic = exit_equity / entry_equity if entry_equity > 0 else 0
    irr = (moic ** (1 / hold_period) - 1) * 100 if moic > 0 else 0

    return {
        "entry_ev": round(entry_ev, 2),
        "entry_multiple": entry_multiple,
        "debt_pct": debt_pct,
        "equity_pct": round(1 - debt_pct, 2),
        "interest_rate": interest_rate,
        "exit_multiple": exit_multiple,
        "hold_period": hold_period,
        "exit_ev": round(exit_ev, 2),
        "irr": round(irr, 2),
        "moic": round(moic, 2),
    }

@router.get("/calculations/{ticker}")
def get_calculations(
        ticker: str,
        entry_multiple: float = 10.0,
        debt_pct: float = 0.6,
        interest_rate: float = 0.07,
        exit_multiple: float = 12.0,
        hold_period: int = 5,
        ebitda_override: float = None
):
    try:
        from routers.financials import get_company_data
        company = get_company_data(ticker, ebitda_override)

        wacc_data = calculate_wacc(company)
        dcf_data = calculate_dcf(company, wacc_data)
        sensitivity_data = calculate_sensitivity(company, wacc_data)
        lbo_data = calculate_lbo(
            company, entry_multiple, debt_pct,
            interest_rate, exit_multiple, hold_period
        )

        return {
            "wacc": wacc_data,
            "dcf": {**dcf_data, **wacc_data,
                    "sensitivity_matrix": sensitivity_data["matrix"],
                    "wacc_range": sensitivity_data["wacc_range"],
                    "tgr_range": sensitivity_data["tgr_range"]},
            "lbo": lbo_data,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))