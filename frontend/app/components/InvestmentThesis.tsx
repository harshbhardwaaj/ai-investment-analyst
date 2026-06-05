import { ThesisResult } from "@/lib/types"

const verdictConfig = {
    buy: { label: "BUY", className: "bg-green-100 text-green-800" },
    watch: { label: "WATCH", className: "bg-amber-100 text-amber-800" },
    pass: { label: "PASS", className: "bg-red-100 text-red-800" },
}

export default function InvestmentThesis({ thesis }: { thesis: ThesisResult }) {
    const config = verdictConfig[thesis.verdict as keyof typeof verdictConfig] ?? verdictConfig.watch

    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    Investment Thesis
                </h3>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">AI-generated synthesis</span>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${config.className}`}>
            {config.label}
          </span>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex gap-3 p-4 bg-green-50 rounded-lg border border-green-100">
                    <span className="text-green-600 font-bold text-sm mt-0.5">↑</span>
                    <div>
                        <p className="text-xs font-semibold text-green-700 mb-1">Bull Case</p>
                        <p className="text-sm text-gray-700">{thesis.bull_case}</p>
                    </div>
                </div>

                <div className="flex gap-3 p-4 bg-red-50 rounded-lg border border-red-100">
                    <span className="text-red-600 font-bold text-sm mt-0.5">↓</span>
                    <div>
                        <p className="text-xs font-semibold text-red-700 mb-1">Bear Case</p>
                        <p className="text-sm text-gray-700">{thesis.bear_case}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}