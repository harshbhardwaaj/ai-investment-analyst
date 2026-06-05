"use client"
import { useState, useEffect } from "react"
import { fetchMemo } from "@/lib/api"
import { MemoResponse } from "@/lib/types"
import CompanySnapshot from "./components/CompanySnapshot"
import KeyFinancials from "./components/KeyFinancials"
import InvestmentThesis from "./components/InvestmentThesis"
import TickerInput from "./components/TickerInput"

const DEMO_TICKER = "SAP.DE"

export default function Home() {
  const [memo, setMemo] = useState<MemoResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    handleFetch(DEMO_TICKER)
  }, [])

  const handleFetch = async (ticker: string, ebitdaOverride?: number) => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchMemo(ticker, ebitdaOverride)
      setMemo(data)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong"
      setError(message)
    } finally {
      setLoading(false)
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

                <CompanySnapshot company={memo.company} />
                <div className="border-t border-gray-100 dark:border-gray-800 my-6" />
                <KeyFinancials company={memo.company} />
                <div className="border-t border-gray-100 dark:border-gray-800 my-6" />
                <InvestmentThesis thesis={memo.thesis} />
              </div>
          )}
        </div>
      </main>
  )
}