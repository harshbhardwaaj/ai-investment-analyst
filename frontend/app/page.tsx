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

export default function Home() {
  const [memo, setMemo] = useState<MemoResponse | null>(null)
  const [loading, setLoading] = useState(false)
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

  const handleFetch = async (ticker: string, ebitdaOverride?: number, lbo = lboParams) => {
    setLoading(true)
    setError(null)
    setCurrentTicker(ticker)
    try {
      const params = new URLSearchParams({
        entry_multiple: lbo.entry_multiple.toString(),
        debt_pct: lbo.debt_pct.toString(),
        interest_rate: lbo.interest_rate.toString(),
        exit_multiple: lbo.exit_multiple.toString(),
        hold_period: lbo.hold_period.toString(),
      })
      if (ebitdaOverride !== undefined) params.append("ebitda_override", ebitdaOverride.toString())

      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
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
      setLoading(false)
    }
  }

  const handleLboRecalculate = (params: typeof lboParams) => {
    setLboParams(params)
    handleFetch(currentTicker, undefined, params)
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
              <div className="text-center py-20 text-gray-400 dark:text-gray-500 text-sm">
                Generating memo...
              </div>
          )}

          {memo && !loading && (
              <div>
                <div className="border-b border-gray-100 dark:border-gray-800 mb-8 pb-2 flex items-center justify-between">
                  <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-widest font-medium">
                    Investment Memo
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {new Date().toLocaleDateString("en-GB", {
                      day: "numeric", month: "long", year: "numeric"
                    })}
                  </p>
                </div>

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
                          targetEvEbitda={memo.wacc ? (memo.company.market_cap + memo.company.total_debt) / (memo.company.normalized_ebitda ?? memo.company.ebitda) : null}
                          targetPe={memo.company.current_price / ((memo.company.ebitda * 0.7) / (memo.company.market_cap / memo.company.current_price))}
                          targetEvRevenue={(memo.company.market_cap + memo.company.total_debt) / memo.company.revenue}
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