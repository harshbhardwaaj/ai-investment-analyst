"use client"
import { useState } from "react"
import { LBOResult } from "@/lib/types"

interface LBOScreenProps {
    lbo: LBOResult
    ticker: string
    onRecalculate: (params: {
        entry_multiple: number
        debt_pct: number
        interest_rate: number
        exit_multiple: number
        hold_period: number
    }) => void
}

export default function LBOScreen({ lbo, onRecalculate }: LBOScreenProps) {
    const [entryMultiple, setEntryMultiple] = useState(lbo.entry_multiple)
    const [debtPct, setDebtPct] = useState(lbo.debt_pct * 100)
    const [interestRate, setInterestRate] = useState(
        parseFloat((lbo.interest_rate * 100).toFixed(1))
    )
    const [exitMultiple, setExitMultiple] = useState(lbo.exit_multiple)
    const [holdPeriod, setHoldPeriod] = useState(lbo.hold_period)

    const handleRecalculate = () => {
        onRecalculate({
            entry_multiple: entryMultiple,
            debt_pct: debtPct / 100,
            interest_rate: interestRate / 100,
            exit_multiple: exitMultiple,
            hold_period: holdPeriod,
        })
    }

    const irrGood = lbo.irr >= 20
    const irrOk = lbo.irr >= 15 && lbo.irr < 20

    return (
        <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
                LBO Screen
            </h3>

            {/* Returns */}
            <div className="flex gap-4 mb-6">
                <div className={`flex-1 rounded-lg p-4 ${irrGood ? "bg-green-50 dark:bg-green-950" : irrOk ? "bg-amber-50 dark:bg-amber-950" : "bg-red-50 dark:bg-red-950"}`}>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">IRR</p>
                    <p className={`text-2xl font-bold mt-1 ${irrGood ? "text-green-700 dark:text-green-400" : irrOk ? "text-amber-700 dark:text-amber-400" : "text-red-700 dark:text-red-400"}`}>
                        {lbo.irr.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Target: ≥20%</p>
                </div>
                <div className="flex-1 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">MOIC</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{lbo.moic.toFixed(2)}x</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Target: ≥2.5x</p>
                </div>
                <div className="flex-1 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Entry EV</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                        €{(lbo.entry_ev / 1e9).toFixed(1)}B
                    </p>
                </div>
            </div>

            {/* Configurable inputs */}
            <div className="border border-gray-100 dark:border-gray-800 rounded-lg overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-900 px-4 py-2">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Assumptions</p>
                </div>
                <div className="p-4 grid grid-cols-2 gap-4 bg-white dark:bg-gray-950">
                    {[
                        { label: "Entry Multiple (EV/EBITDA)", value: entryMultiple, set: setEntryMultiple, step: 0.5, min: 4, max: 20 },
                        { label: "Exit Multiple (EV/EBITDA)", value: exitMultiple, set: setExitMultiple, step: 0.5, min: 4, max: 20 },
                        { label: "Debt % of EV", value: debtPct, set: setDebtPct, step: 5, min: 10, max: 80 },
                        { label: "Interest Rate %", value: interestRate, set: setInterestRate, step: 0.5, min: 3, max: 15 },
                        { label: "Hold Period (years)", value: holdPeriod, set: setHoldPeriod, step: 1, min: 3, max: 10 },
                    ].map((input) => (
                        <div key={input.label}>
                            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">{input.label}</label>
                            <input
                                type="number"
                                value={input.value}
                                step={input.step}
                                min={input.min}
                                max={input.max}
                                onChange={(e) => input.set(parseFloat(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-400"
                            />
                        </div>
                    ))}
                </div>
                <div className="px-4 pb-4 bg-white dark:bg-gray-950">
                    <button
                        onClick={handleRecalculate}
                        className="w-full py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-700 dark:hover:bg-gray-300 transition-colors"
                    >
                        Recalculate
                    </button>
                </div>
            </div>
        </div>
    )
}