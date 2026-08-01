import React, { useState } from 'react';
import { ShieldCheck, Lock, KeyRound, X, AlertCircle } from 'lucide-react';

interface AdminPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  correctPin?: string;
}

export const AdminPinModal: React.FC<AdminPinModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  correctPin = '2026',
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.trim() === correctPin) {
      setError(false);
      setPin('');
      onSuccess();
      onClose();
    } else {
      setError(true);
    }
  };

  const handleKeyClick = (val: string) => {
    setError(false);
    if (val === 'clear') {
      setPin('');
    } else if (val === 'back') {
      setPin(prev => prev.slice(0, -1));
    } else if (pin.length < 6) {
      setPin(prev => prev + val);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-[#2C332D] justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] max-w-md w-full p-6 shadow-2xl border border-[#E6E8E0] relative space-y-5">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#8B9285] hover:text-[#2C332D] p-2 rounded-xl hover:bg-[#F1F3ED] transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2 pt-2">
          <div className="w-14 h-14 bg-[#FAF8F5] text-[#A8763E] border border-[#A8763E]/20 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-[#2C332D]">Администраторски влез</h3>
          <p className="text-xs text-[#8B9285] max-w-xs mx-auto">
            Внесете го администраторскиот PIN код за да добиете пристап до позајмување, додавање и бришење книги.
          </p>
        </div>

        {/* PIN Input Display */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative max-w-xs mx-auto">
            <input
              type="password"
              value={pin}
              maxLength={6}
              onChange={e => {
                setError(false);
                setPin(e.target.value);
              }}
              placeholder="Внесете PIN (2026)"
              className={`w-full text-center text-2xl font-mono tracking-widest py-3 px-4 rounded-2xl border ${
                error
                  ? 'border-rose-500 bg-rose-50 text-rose-900 focus:ring-rose-500'
                  : 'border-[#E6E8E0] bg-[#F1F3ED] text-[#2C332D] focus:ring-[#4A5D4E]'
              } focus:outline-none focus:ring-2 transition-all`}
              autoFocus
            />
            <Lock className="w-5 h-5 text-[#8B9285] absolute left-4 top-1/2 -translate-y-1/2" />
          </div>

          {error && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-rose-600 font-semibold bg-rose-50 p-2 rounded-xl border border-rose-200 animate-in fade-in">
              <AlertCircle className="w-4 h-4" />
              <span>Погрешен PIN код! Стандарден PIN: <strong>2026</strong></span>
            </div>
          )}

          {/* Quick On-screen Number Pad for touchscreen / convenience */}
          <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto pt-1">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'back'].map((key) => {
              if (key === 'clear') {
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleKeyClick('clear')}
                    className="py-3 bg-[#F1F3ED] hover:bg-[#E6E8E0] text-[#2C332D] font-bold text-xs rounded-2xl transition"
                  >
                    Избриши
                  </button>
                );
              }
              if (key === 'back') {
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleKeyClick('back')}
                    className="py-3 bg-[#F1F3ED] hover:bg-[#E6E8E0] text-[#2C332D] font-bold text-xs rounded-2xl transition"
                  >
                    ⌫
                  </button>
                );
              }
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleKeyClick(key)}
                  className="py-3 bg-[#FAF8F5] hover:bg-[#F1F3ED] text-[#2C332D] font-bold text-lg rounded-2xl border border-[#E6E8E0] transition active:scale-95 shadow-2xs"
                >
                  {key}
                </button>
              );
            })}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-2.5 bg-[#F1F3ED] text-[#2C332D] font-bold text-xs rounded-xl hover:bg-[#E6E8E0] transition"
            >
              Откажи
            </button>
            <button
              type="submit"
              className="w-1/2 py-2.5 bg-[#A8763E] hover:bg-[#966835] text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center justify-center gap-1.5"
            >
              <KeyRound className="w-4 h-4" />
              <span>Најави се</span>
            </button>
          </div>
        </form>

        <p className="text-[11px] text-center text-[#8B9285]">
          Забелешка: Стандардниот администраторски код е <strong className="text-[#A8763E]">2026</strong>.
        </p>

      </div>
    </div>
  );
};
