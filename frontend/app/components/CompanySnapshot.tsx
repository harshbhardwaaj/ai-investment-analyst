"use client"

import { useState } from "react"
import { CompanyData } from "@/lib/types"

function formatCurrency(value: number, currency: string = "€"): string {
    if (value >= 1e9) return `${currency}${(value / 1e9).toFixed(1)}B`
    if (value >= 1e6) return `${currency}${(value / 1e6).toFixed(1)}M`
    return `${currency}${value.toLocaleString()}`
}

export default function CompanySnapshot({ company }: { company: CompanyData }) {
    const [expanded, setExpanded] = useState(false)

    return (
        <div className="mb-8">
            <div className="flex items-start justify-between mb-2">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{company.name}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {company.ticker} · {company.sector} · {company.industry}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {formatCurrency(company.current_price, "")}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Current Price</p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4 my-6">
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Market Cap</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-1">
                        {formatCurrency(company.market_cap)}
                    </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Revenue</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-1">
                        {formatCurrency(company.revenue)}
                    </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">EBITDA</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-1">
                        {formatCurrency(company.normalized_ebitda ?? company.ebitda)}
                        {company.normalized_ebitda && (
                            <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">normalized</span>
                        )}
                    </p>
                </div>
            </div>

            <div className="border-l-4 border-gray-200 dark:border-gray-700 pl-4">
                <p
                    className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed"
                    style={expanded ? undefined : {
                        display: "-webkit-box",
                        WebkitLineClamp: 5,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                    }}
                >
                    {company.description}
                </p>
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="mt-1 text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 bg-transparent border-none cursor-pointer p-0"
                >
                    {expanded ? "Read less" : "Read more"}
                </button>
            </div>
        </div>
    )
}