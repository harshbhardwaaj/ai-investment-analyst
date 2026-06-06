import { CompsData } from "@/lib/types"

function fmt(value: number | null, decimals = 1): string {
    if (value === null || value === 0) return "N/A"
    return `${value.toFixed(decimals)}x`
}

export default function TradingComps({
                                         comps,
                                         targetTicker,
                                         targetEvEbitda,
                                         targetPe,
                                         targetEvRevenue,
                                     }: {
    comps: CompsData[]
    targetTicker: string
    targetEvEbitda?: number | null
    targetPe?: number | null
    targetEvRevenue?: number | null
}) {
    const peerEvEbitda = comps.map(c => c.ev_ebitda).filter(Boolean) as number[]
    const medianEvEbitda = peerEvEbitda.length
        ? peerEvEbitda.sort((a, b) => a - b)[Math.floor(peerEvEbitda.length / 2)]
        : null

    return (
        <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
                Trading Comps
            </h3>
            <div className="overflow-hidden border border-gray-100 dark:border-gray-800 rounded-lg">
                <table className="w-full text-sm">
                    <thead>
                    <tr className="bg-gray-50 dark:bg-gray-900">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Company</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">EV/EBITDA</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">P/E</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">EV/Revenue</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {comps.map((comp) => (
                        <tr key={comp.ticker} className="bg-white dark:bg-gray-950">
                            <td className="px-4 py-3">
                                <span className="font-medium text-gray-900 dark:text-gray-100">{comp.ticker}</span>
                                <span className="text-gray-400 dark:text-gray-500 ml-2">{comp.name}</span>
                            </td>
                            <td className="text-right px-4 py-3 text-gray-700 dark:text-gray-300">{fmt(comp.ev_ebitda)}</td>
                            <td className="text-right px-4 py-3 text-gray-700 dark:text-gray-300">{fmt(comp.pe_ratio)}</td>
                            <td className="text-right px-4 py-3 text-gray-700 dark:text-gray-300">{fmt(comp.ev_revenue)}</td>
                        </tr>
                    ))}

                    {/* Peer median row */}
                    <tr className="bg-gray-50 dark:bg-gray-900 border-t-2 border-gray-200 dark:border-gray-700">
                        <td className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Peer Median</td>
                        <td className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">{fmt(medianEvEbitda)}</td>
                        <td className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">—</td>
                        <td className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">—</td>
                    </tr>

                    {/* Target row */}
                    <tr className="bg-blue-50 dark:bg-blue-950 border-t border-blue-100 dark:border-blue-900">
                        <td className="px-4 py-3">
                            <span className="font-bold text-blue-900 dark:text-blue-300">{targetTicker}</span>
                            <span className="text-blue-600 dark:text-blue-400 ml-2 text-xs">(target)</span>
                        </td>
                        <td className="text-right px-4 py-3 font-bold text-blue-900 dark:text-blue-300">{fmt(targetEvEbitda ?? null)}</td>
                        <td className="text-right px-4 py-3 font-bold text-blue-900 dark:text-blue-300">{fmt(targetPe ?? null)}</td>
                        <td className="text-right px-4 py-3 font-bold text-blue-900 dark:text-blue-300">{fmt(targetEvRevenue ?? null)}</td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}