import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowRight, RefreshCw } from 'lucide-react';

interface ConvertersProps {
  eurRate: number;
  usdRate: number;
  onUpdateRates: (eur: number, usd: number) => void;
}

export const Converters: React.FC<ConvertersProps> = ({ eurRate, usdRate, onUpdateRates }) => {
  const [eurAmount, setEurAmount] = useState<string>('100');
  const [usdAmount, setUsdAmount] = useState<string>('100');
  const [isEditing, setIsEditing] = useState(false);
  const [tempEur, setTempEur] = useState(eurRate.toString());
  const [tempUsd, setTempUsd] = useState(usdRate.toString());

  const eurValue = parseFloat(eurAmount) || 0;
  const usdValue = parseFloat(usdAmount) || 0;

  const handleSaveRates = () => {
    const parsedEur = parseFloat(tempEur);
    const parsedUsd = parseFloat(tempUsd);
    if (!isNaN(parsedEur) && !isNaN(parsedUsd)) {
      onUpdateRates(parsedEur, parsedUsd);
      setIsEditing(false);
    }
  };

  return (
    <Card className="p-3 bg-white border border-teal-50/80 shadow-sm rounded-2xl">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
          ვალუტის კონვერტორი (EUR / USD)
        </span>
        <button
          onClick={() => {
            if (isEditing) handleSaveRates();
            setIsEditing(!isEditing);
          }}
          className="text-xs text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1 transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          {isEditing ? 'შენახვა' : `კურსი: 1€=${eurRate} | 1$=${usdRate}`}
        </button>
      </div>

      {isEditing && (
        <div className="flex gap-2 mb-2 p-2 bg-slate-50 rounded-xl text-xs">
          <div className="flex-1">
            <span className="text-slate-500 text-[10px]">EUR to GEL</span>
            <Input
              value={tempEur}
              onChange={(e) => setTempEur(e.target.value)}
              className="h-7 text-xs px-2"
            />
          </div>
          <div className="flex-1">
            <span className="text-slate-500 text-[10px]">USD to GEL</span>
            <Input
              value={tempUsd}
              onChange={(e) => setTempUsd(e.target.value)}
              className="h-7 text-xs px-2"
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        {/* EUR Row */}
        <div className="flex items-center justify-between bg-slate-50/80 px-2.5 py-1.5 rounded-xl border border-slate-100">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-700">€</span>
            <input
              type="number"
              value={eurAmount}
              onChange={(e) => setEurAmount(e.target.value)}
              className="w-12 bg-transparent text-xs font-medium text-slate-800 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-teal-700">
            <ArrowRight className="w-3 h-3 text-slate-300" />
            <span>{(eurValue * eurRate).toFixed(2)} ₾</span>
          </div>
        </div>

        {/* USD Row */}
        <div className="flex items-center justify-between bg-slate-50/80 px-2.5 py-1.5 rounded-xl border border-slate-100">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-700">$</span>
            <input
              type="number"
              value={usdAmount}
              onChange={(e) => setUsdAmount(e.target.value)}
              className="w-12 bg-transparent text-xs font-medium text-slate-800 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-teal-700">
            <ArrowRight className="w-3 h-3 text-slate-300" />
            <span>{(usdValue * usdRate).toFixed(2)} ₾</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
