export interface CompanyData {
    ticker: string
    name: string
    sector: string
    industry: string
    description: string
    current_price: number
    market_cap: number
    revenue: number
    ebitda: number
    normalized_ebitda: number | null
    gross_margin: number
    operating_margin: number
    free_cash_flow: number | null
    total_debt: number
    beta: number
    ebitda_user_provided: boolean
}

export interface DCFResult {
    intrinsic_value: number
    current_price: number
    upside_downside_pct: number
    wacc: number
    cost_of_equity: number
    cost_of_debt: number
    risk_free_rate: number
    equity_risk_premium: number
    terminal_growth_rate: number
    sensitivity_matrix: number[][]
    wacc_range: number[]
    tgr_range: number[]
}

export interface LBOResult {
    entry_ev: number
    entry_multiple: number
    debt_pct: number
    equity_pct: number
    interest_rate: number
    exit_multiple: number
    hold_period: number
    exit_ev: number
    irr: number
    moic: number
}

export interface CompsData {
    ticker: string
    name: string
    ev_ebitda: number | null
    pe_ratio: number | null
    ev_revenue: number | null
}

export interface ThesisResult {
    bull_case: string
    bear_case: string
    verdict: string
}

export interface MemoResponse {
    company: CompanyData
    thesis: ThesisResult
    comps: CompsData[] | null
    dcf: DCFResult | null
    lbo: LBOResult | null
}