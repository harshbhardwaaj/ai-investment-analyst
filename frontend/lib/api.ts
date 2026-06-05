import { MemoResponse } from "@/lib/types"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"

export async function fetchMemo(
    ticker: string,
    ebitdaOverride?: number
): Promise<MemoResponse> {
    const params = new URLSearchParams()
    if (ebitdaOverride !== undefined) {
        params.append("ebitda_override", ebitdaOverride.toString())
    }

    const url = `${API_BASE}/api/memo/${ticker}${params.toString() ? `?${params}` : ""}`
    const res = await fetch(url)

    if (!res.ok) {
        const error = await res.json()
        throw new Error(error.detail || "Failed to fetch memo")
    }

    return res.json()
}