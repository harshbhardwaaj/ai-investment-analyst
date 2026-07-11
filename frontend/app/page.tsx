"use client"
import { useState, useEffect } from "react"
import { fetchMemo } from "@/lib/api"
import { MemoResponse } from "@/lib/types"
import CompanySnapshot from "./components/CompanySnapshot"
import KeyFinancials from "./components/KeyFinancials"
import InvestmentThesis from "./components/InvestmentThesis"
import TickerInput from "./components/TickerInput"
import TradingComps from "./components/TradingComps"
import DCFValuation from "./components/DCFValuation"
import LBOScreen from "./components/LBOScreen"
import PrecedentTxns from "./components/PrecedentTxns"

const DEMO_TICKER = "SAP.DE"
// Rough real-world ceiling for a cold start, used only to pace the fake progress fill.
const WARMUP_ESTIMATE_SECONDS = 45

export default function Home() {
  const [memo, setMemo] = useState<MemoResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingSeconds, setLoadingSeconds] = useState(0)
  const [backendAwake, setBackendAwake] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentTicker, setCurrentTicker] = useState(DEMO_TICKER)
  const [lboParams, setLboParams] = useState({
    entry_multiple: 10,
    debt_pct: 0.6,
    interest_rate: 0.07,
    exit_multiple: 12,
    hold_period: 5,
  })

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tickerParam = params.get("ticker")
    handleFetch(tickerParam || DEMO_TICKER)
  }, [])

  useEffect(() => {
    if (!loading) {
      setLoadingSeconds(0)
      return
    }
    const interval = setInterval(() => setLoadingSeconds(s => s + 1), 1000)
    return () => clearInterval(interval)
  }, [loading])

  const handleFetch = async (ticker: string, ebitdaOverride?: number, lbo = lboParams) => {
    setLoading(true)
    setError(null)
    setCurrentTicker(ticker)
    setBackendAwake(false)

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"

    // Ping the lightweight root endpoint until the server actually responds, so the
    // "waking up" message reflects the real backend state instead of a guessed delay.
    let polling = true
    const pollUntilAwake = async () => {
      while (polling) {
        try {
          const controller = new AbortController()
          const timeout = setTimeout(() => controller.abort(), 4000)
          const res = await fetch(API_BASE, { signal: controller.signal })
          clearTimeout(timeout)
          if (res.ok) {
            setBackendAwake(true)
            return
          }
        } catch {
          // still asleep or unreachable — keep retrying
        }
        await new Promise(r => setTimeout(r, 1500))
      }
    }
    pollUntilAwake()

    try {
      const params = new URLSearchParams({
        entry_multiple: lbo.entry_multiple.toString(),
        debt_pct: lbo.debt_pct.toString(),
        interest_rate: lbo.interest_rate.toString(),
        exit_multiple: lbo.exit_multiple.toString(),
        hold_period: lbo.hold_period.toString(),
      })
      if (ebitdaOverride !== undefined) params.append("ebitda_override", ebitdaOverride.toString())

      const res = await fetch(`${API_BASE}/api/memo/${ticker}?${params}`)
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || "Failed to fetch memo")
      }
      const data = await res.json()
      setMemo(data)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong"
      setError(message)
    } finally {
      polling = false
      setLoading(false)
    }
  }

  const handleLboRecalculate = async (params: typeof lboParams) => {
    setLboParams(params)
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
      const urlParams = new URLSearchParams({
        entry_multiple: params.entry_multiple.toString(),
        debt_pct: params.debt_pct.toString(),
        interest_rate: params.interest_rate.toString(),
        exit_multiple: params.exit_multiple.toString(),
        hold_period: params.hold_period.toString(),
      })
      const res = await fetch(`${API_BASE}/api/calculations/${currentTicker}?${urlParams}`)
      if (!res.ok) return
      const data = await res.json()
      setMemo(prev => prev ? { ...prev, lbo: data.lbo } : prev)
    } catch (err) {
      console.error("LBO recalculate failed:", err)
    }
  }

  return (
      <main className="min-h-screen bg-white dark:bg-gray-950">
        <div className="max-w-3xl mx-auto px-6 py-12">

          <div className="mb-10">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">AI Investment Analyst</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
              One-page investment memo generated in seconds. Powered by real financial data.
            </p>
          </div>

          <TickerInput onSubmit={handleFetch} loading={loading} error={error} />

          {loading && (
              <div className="text-center py-20 px-4">
                <div className="max-w-xs mx-auto h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <div
                      className="h-full rounded-full bg-gray-900 dark:bg-gray-100 transition-all duration-700 ease-out"
                      style={{ width: `${backendAwake ? 100 : Math.min(92, (loadingSeconds / WARMUP_ESTIMATE_SECONDS) * 100)}%` }}
                  />
                </div>
                <p className="mt-4 text-gray-400 dark:text-gray-500 text-sm">
                  {backendAwake ? "Generating memo..." : "Getting things ready..."}
                </p>
              </div>
          )}

          {memo && !loading && (
              <div>
                <div className="border-b border-gray-100 dark:border-gray-800 mb-8 pb-2 flex items-center justify-between">
                  <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-widest font-medium">
                    Investment Memo
                  </p>
                  <div className="flex items-center gap-3">
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {new Date().toLocaleDateString("en-GB", {
                        day: "numeric", month: "long", year: "numeric"
                      })}
                    </p>
                    <button
                        onClick={() => {
                          const url = `${window.location.origin}?ticker=${currentTicker}`
                          navigator.clipboard.writeText(url)
                              .then(() => alert("Link copied!"))
                        }}
                        className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 transition-colors"
                    >
                      Copy link
                    </button>
                  </div>
                </div>

                <CompanySnapshot company={memo.company} />
                <div className="border-t border-gray-100 dark:border-gray-800 my-6" />

                <KeyFinancials company={memo.company} />
                <div className="border-t border-gray-100 dark:border-gray-800 my-6" />

                {memo.comps && memo.comps.length > 0 && (
                    <>
                      <TradingComps
                          comps={memo.comps}
                          targetTicker={memo.company.ticker}
                          targetEvEbitda={(() => {
                              const ebitda = memo.company.normalized_ebitda ?? memo.company.ebitda
                              return ebitda > 0 ? (memo.company.market_cap + memo.company.total_debt) / ebitda : null
                          })()}
                          targetPe={memo.company.ebitda > 0 ? memo.company.market_cap / (memo.company.ebitda * 0.7) : null}
                          targetEvRevenue={memo.company.revenue > 0 ? (memo.company.market_cap + memo.company.total_debt) / memo.company.revenue : null}
                      />
                      <div className="border-t border-gray-100 dark:border-gray-800 my-6" />
                    </>
                )}

                {memo.precedent_transactions && memo.precedent_transactions.length > 0 && (
                    <>
                      <PrecedentTxns transactions={memo.precedent_transactions} />
                      <div className="border-t border-gray-100 dark:border-gray-800 my-6" />
                    </>
                )}

                {memo.dcf && (
                    <>
                      <DCFValuation dcf={memo.dcf} />
                      <div className="border-t border-gray-100 dark:border-gray-800 my-6" />
                    </>
                )}

                {memo.lbo && (
                    <>
                      <LBOScreen
                          lbo={memo.lbo}
                          ticker={memo.company.ticker}
                          onRecalculate={handleLboRecalculate}
                      />
                      <div className="border-t border-gray-100 dark:border-gray-800 my-6" />
                    </>
                )}

                <InvestmentThesis thesis={memo.thesis} />
              </div>
          )}
        </div>
      </main>
  )
}