import { CompanyData } from "@/lib/types"

function pct(value: number): string {
    return `${(value * 100).toFixed(1)}%`
}

function fmt(value: number | null, prefix = "€"): string {
    if (value === null) return "N/A"
    if (Math.abs(value) >= 1e9) return `${prefix}${(value / 1e9).toFixed(1)}B`
    if (Math.abs(value) >= 1e6) return `${prefix}${(value / 1e6).toFixed(1)}M`
    return `${prefix}${value.toLocaleString()}`
}

const rows = [
    { label: "Gross Margin", key: "gross_margin", format: "pct" },
    { label: "Operating Margin", key: "operating_margin", format: "pct" },
    { label: "Free Cash Flow", key: "free_cash_flow", format: "currency" },
    { label: "Total Debt", key: "total_debt", format: "currency" },
    { label: "Beta", key: "beta", format: "raw" },
] as const

export default function KeyFinancials({ company }: { company: CompanyData }) {
    return (
        <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                Key Financials
            </h3>
            <div className="divide-y divide-gray-100 border border-gray-100 rounded-lg overflow-hidden">
                {rows.map((row) => {
                    const value = company[row.key] as number | null
                    const formatted =
                        row.format === "pct"
                            ? pct(value as number)
                            : row.format === "currency"
                                ? fmt(value)
                                : value?.toFixed(2) ?? "N/A"

                    return (
                        <div key={row.label} className="flex justify-between px-4 py-3 bg-white">
                            <span className="text-sm text-gray-600">{row.label}</span>
                            <span className="text-sm font-medium text-gray-900">{formatted}</span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}