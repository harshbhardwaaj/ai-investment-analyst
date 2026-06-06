import { DCFResult } from "@/lib/types"

function pct(value: number): string {
    return `${(value * 100).toFixed(1)}%`
}

function fmtPrice(value: number): string {
    return value.toFixed(2)
}

export default function DCFValuation({ dcf }: { dcf: DCFResult }) {
    const isUpside = dcf.upside_downside_pct > 0

    return (
        <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
                DCF Valuation
            </h3>

            {/* Intrinsic value vs current price */}
            <div className="flex gap-4 mb-6">
                <div className="flex-1 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Intrinsic Value</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                        {dcf.intrinsic_value < 0 ? "N/M" : fmtPrice(dcf.intrinsic_value)}
                    </p>
                </div>
                <div className="flex-1 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Current Price</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                        {fmtPrice(dcf.current_price)}
                    </p>
                </div>
                <div className={`flex-1 rounded-lg p-4 ${isUpside ? "bg-green-50 dark:bg-green-950" : "bg-red-50 dark:bg-red-950"}`}>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Implied Upside</p>
                    <p className={`text-2xl font-bold mt-1 ${isUpside ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}>
                        {dcf.intrinsic_value < 0 ? "Neg." : `${isUpside ? "+" : ""}${dcf.upside_downside_pct.toFixed(1)}%`}
                    </p>
                </div>
            </div>

            {/* WACC decomposition */}
            <div className="border border-gray-100 dark:border-gray-800 rounded-lg overflow-hidden mb-6">
                <div className="bg-gray-50 dark:bg-gray-900 px-4 py-2">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">WACC Decomposition</p>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {[
                        { label: "Risk-Free Rate (Rf)", value: pct(dcf.risk_free_rate) },
                        { label: "Beta (β)", value: dcf.beta.toFixed(3) },
                        { label: "Equity Risk Premium (ERP)", value: pct(dcf.equity_risk_premium) },
                        { label: "Cost of Equity (Ke = Rf + β × ERP)", value: pct(dcf.cost_of_equity), bold: true },
                        { label: "Cost of Debt (Kd, after-tax)", value: pct(dcf.cost_of_debt) },
                        { label: "Equity Weight", value: pct(dcf.equity_weight) },
                        { label: "Debt Weight", value: pct(dcf.debt_weight) },
                        { label: "WACC", value: pct(dcf.wacc), bold: true },
                    ].map((row) => (
                        <div key={row.label} className="flex justify-between px-4 py-3 bg-white dark:bg-gray-950">
              <span className={`text-sm ${row.bold ? "font-semibold text-gray-900 dark:text-gray-100" : "text-gray-600 dark:text-gray-400"}`}>
                {row.label}
              </span>
                            <span className={`text-sm ${row.bold ? "font-semibold text-gray-900 dark:text-gray-100" : "text-gray-700 dark:text-gray-300"}`}>
                {row.value}
              </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Sensitivity table */}
            <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                    Sensitivity: Intrinsic Value vs WACC & Terminal Growth Rate
                </p>
                <div className="overflow-hidden border border-gray-100 dark:border-gray-800 rounded-lg">
                    <table className="w-full text-sm">
                        <thead>
                        <tr className="bg-gray-50 dark:bg-gray-900">
                            <th className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 text-left">TGR \ WACC</th>
                            {dcf.wacc_range.map((w) => (
                                <th key={w} className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 text-right">{w}%</th>
                            ))}
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {dcf.sensitivity_matrix.map((row, i) => (
                            <tr key={i} className="bg-white dark:bg-gray-950">
                                <td className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                                    {dcf.tgr_range[i]}%
                                </td>
                                {row.map((val, j) => {
                                    const isUpside = val > dcf.current_price
                                    const isBase = i === 1 && j === 1
                                    return (
                                        <td
                                            key={j}
                                            className={`px-4 py-2 text-right text-sm font-medium
                          ${isBase ? "ring-2 ring-inset ring-blue-400" : ""}
                          ${isUpside
                                                ? "text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950"
                                                : "text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950"
                                            }`}
                                        >
                                            {val.toFixed(0)}
                                        </td>
                                    )
                                })}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    Blue border = base case. Green = above current price. Red = below current price.
                </p>
            </div>
        </div>
    )
}