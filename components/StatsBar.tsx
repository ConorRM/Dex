import React, { useMemo } from 'react';
import { BinderState, BinderEntry } from '../types';

interface StatsBarProps {
    binder: BinderState;
    totalCards: number;
    ownedCards: number;
}

export const StatsBar: React.FC<StatsBarProps> = ({ binder, totalCards, ownedCards }) => {
    const totalValue = useMemo(() => {
        return Object.values(binder).reduce((acc: number, curr: BinderEntry) => {
            if (!curr.value) return acc;
            const val = parseFloat(curr.value.replace(/[^0-9.]/g, ''));
            return acc + (isNaN(val) ? 0 : val);
        }, 0);
    }, [binder]);

    const percentage = totalCards > 0 ? Math.round((ownedCards / totalCards) * 100) : 0;

    return (
        <div className="bg-slate-800 border-b border-slate-700 p-2 md:p-3 bg-[linear-gradient(90deg,rgba(15,23,42,0)_0%,rgba(51,65,85,0.5)_50%,rgba(15,23,42,0)_100%)]">
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-sm">
                <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                        <span className="text-slate-400 text-xs uppercase font-bold">Progress</span>
                        <span className="text-white font-bold">{ownedCards} <span className="text-slate-500">/</span> {totalCards} <span className="text-indigo-400 text-xs">({percentage}%)</span></span>
                    </div>
                    <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden mt-1">
                        <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${percentage}%` }}></div>
                    </div>
                </div>
                
                <div className="flex flex-col text-right">
                    <span className="text-slate-400 text-xs uppercase font-bold">Total Value</span>
                    <span className="text-green-400 font-bold font-mono text-lg">£{totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
            </div>
        </div>
    );
};