from pydantic import BaseModel
from typing import Optional

class CompanyData(BaseModel):
    ticker: str
    name: str
    sector: str
    industry: str
    description: str
    current_price: float
    market_cap: float
    revenue: float
    ebitda: float
    normalized_ebitda: Optional[float]
    gross_margin: float
    operating_margin: float
    free_cash_flow: Optional[float]
    total_debt: float
    beta: float
    ebitda_user_provided: bool = False
    revenue_growth: float = 0.08

class DCFResult(BaseModel):
    intrinsic_value: float
    current_price: float
    upside_downside_pct: float
    wacc: float
    cost_of_equity: float
    cost_of_debt: float
    risk_free_rate: float
    equity_risk_premium: float
    terminal_growth_rate: float
    sensitivity_matrix: list[list[float]]
    wacc_range: list[float]
    tgr_range: list[float]

class LBOResult(BaseModel):
    entry_ev: float
    entry_multiple: float
    debt_pct: float
    equity_pct: float
    interest_rate: float
    exit_multiple: float
    hold_period: int
    exit_ev: float
    irr: float
    moic: float

class CompsData(BaseModel):
    ticker: str
    name: str
    ev_ebitda: Optional[float]
    pe_ratio: Optional[float]
    ev_revenue: Optional[float]

class ThesisResult(BaseModel):
    bull_case: str
    bear_case: str
    verdict: str

class MemoResponse(BaseModel):
    company: CompanyData
    thesis: ThesisResult
    comps: Optional[list[CompsData]]
    dcf: Optional[DCFResult]
    lbo: Optional[LBOResult]