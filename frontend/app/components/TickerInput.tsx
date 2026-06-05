"use client"
import { useState } from "react"

interface TickerInputProps {
    onSubmit: (ticker: string, ebitdaOverride?: number) => void
    loading: boolean
    error: string | null
}

export default function TickerInput({ onSubmit, loading, error }: TickerInputProps) {
    const [ticker, setTicker] = useState("")
    const [showEbitda, setShowEbitda] = useState(false)
    const [ebitda, setEbitda] = useState("")

    const handleSubmit = () => {
        if (!ticker.trim()) return
        const ebitdaVal = showEbitda && ebitda ? parseFloat(ebitda) : undefined
        onSubmit(ticker.trim().toUpperCase(), ebitdaVal)
    }

    const isEbitdaMissing = error === "EBITDA_MISSING"

    return (
        <div className="mb-10">
            <div className="flex gap-3">
                <input
                    type="text"
                    value={ticker}
                    onChange={(e) => setTicker(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    placeholder="Enter ticker (e.g. SAP.DE, AAPL, BMW.DE)"
                    className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-400 focus:border-transparent"
                />
                <button
                    onClick={handleSubmit}
                    disabled={loading || !ticker.trim()}
                    className="px-6 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium rounded-lg disabled:opacity-40 hover:bg-gray-700 dark:hover:bg-gray-300 transition-colors"
                >
                    {loading ? "Generating..." : "Generate Memo"}
                </button>
            </div>

            {(isEbitdaMissing || showEbitda) && (
                <div className="mt-3 flex gap-3 items-center">
                    <input
                        type="number"
                        value={ebitda}
                        onChange={(e) => setEbitda(e.target.value)}
                        placeholder="Enter EBITDA manually (in absolute value)"
                        className="flex-1 px-4 py-3 border border-amber-300 dark:border-amber-600 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                    <button
                        onClick={() => { setShowEbitda(true); handleSubmit() }}
                        className="px-6 py-3 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-400 transition-colors"
                    >
                        Retry with EBITDA
                    </button>
                </div>
            )}

            {error && !isEbitdaMissing && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
            )}

            {isEbitdaMissing && (
                <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
                    EBITDA not available for this ticker. Enter it manually above to continue.
                </p>
            )}
        </div>
    )
}