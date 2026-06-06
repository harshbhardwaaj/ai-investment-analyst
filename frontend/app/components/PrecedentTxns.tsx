import { PrecedentTransaction } from "@/lib/types"

export default function PrecedentTxns({ transactions }: { transactions: PrecedentTransaction[] }) {
    return (
        <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
                Precedent Transactions
            </h3>
            <div className="overflow-hidden border border-gray-100 dark:border-gray-800 rounded-lg">
                <table className="w-full text-sm">
                    <thead>
                    <tr className="bg-gray-50 dark:bg-gray-900">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Target</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Acquirer</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Year</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Deal Value</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">EV/EBITDA</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {transactions.map((txn, i) => (
                        <tr key={i} className="bg-white dark:bg-gray-950">
                            <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{txn.target}</td>
                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{txn.acquirer}</td>
                            <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">{txn.year}</td>
                            <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">
                                ${txn.deal_value_bn.toFixed(1)}B
                            </td>
                            <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">{txn.ev_ebitda.toFixed(1)}x</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                        Manually sourced. Production use would require Capital IQ or Mergermarket.
                    </p>
                </div>
            </div>
        </div>
    )
}