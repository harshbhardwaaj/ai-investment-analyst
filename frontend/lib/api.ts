import { MemoResponse } from "@/lib/types"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"

export interface LboParams {
    entry_multiple: number
    debt_pct: number
    interest_rate: number
    exit_multiple: number
    hold_period: number
}

export async function fetchMemo(
    ticker: string,
    lbo: LboParams,
    ebitdaOverride?: number
): Promise<MemoResponse> {
    const params = new URLSearchParams({
        entry_multiple: lbo.entry_multiple.toString(),
        debt_pct: lbo.debt_pct.toString(),
        interest_rate: lbo.interest_rate.toString(),
        exit_multiple: lbo.exit_multiple.toString(),
        hold_period: lbo.hold_period.toString(),
    })
    if (ebitdaOverride !== undefined) {
        params.append("ebitda_override", ebitdaOverride.toString())
    }

    const url = `${API_BASE}/api/memo/${ticker}?${params}`
    const res = await fetch(url)

    if (!res.ok) {
        const error = await res.json()
        throw new Error(error.detail || "Failed to fetch memo")
    }

    return res.json()
}