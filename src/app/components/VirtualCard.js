import React, { useMemo } from 'react';

const VirtualCard = ({ cardData, isFlipped }) => {
    const { number, name, expiry, cvv } = cardData;

    // Brand Detection
    const brand = useMemo(() => {
        if (number.startsWith('4')) return 'VISA';
        if (number.startsWith('5')) return 'MASTERCARD';
        return 'BANK';
    }, [number]);

    // Format Masked Number for Display
    const displayedNumber = useMemo(() => {
        const raw = number.replace(/\D/g, '');
        let formatted = '';
        for (let i = 0; i < 16; i++) {
            if (i > 0 && i % 4 === 0) formatted += ' ';
            if (i < raw.length) {
                // Mask middle digits: 0-4 visible, 5-11 masked, 12-15 visible
                if (i >= 4 && i < 12) formatted += '*'; // Use asterisk or bullet for cleaner look
                else formatted += raw[i];
            } else {
                formatted += '•'; // Middle dot for placeholders
            }
        }
        return formatted;
    }, [number]);

    return (
        <div className="relative w-full h-[180px] perspective-1000 mt-8">
            <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>

                {/* FRONT */}
                <div
                    className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden border border-white/5 bg-[#0B0B0B] shadow-2xl"
                    style={{ backfaceVisibility: 'hidden' }}
                >
                    {/* Subtle Gradient Shine */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>

                    <div className="relative p-6 h-full flex flex-col justify-between z-10">
                        {/* Top Row: Chip & Brand */}
                        <div className="flex justify-between items-start">
                            {/* Chip */}
                            <div className="w-12 h-9 bg-gradient-to-br from-[#d4af37] to-[#aa8c2c] rounded-md border border-white/10 relative overflow-hidden shadow-sm">
                                <div className="absolute inset-0 border border-black/10 rounded-md"></div>
                                <div className="absolute top-1/2 w-full h-[1px] bg-black/10"></div>
                                <div className="absolute left-1/2 h-full w-[1px] bg-black/10"></div>
                            </div>

                            {/* Brand Logo */}
                            <div>
                                {brand === 'VISA' && <span className="text-white font-serif font-black italic text-2xl tracking-tighter opacity-90">VISA</span>}
                                {brand === 'MASTERCARD' && (
                                    <div className="flex items-center relative w-10">
                                        <div className="w-8 h-8 bg-[#EB001B] rounded-full opacity-90 relative z-10"></div>
                                        <div className="w-8 h-8 bg-[#F79E1B] rounded-full -ml-4 opacity-90 relative z-20 mix-blend-screen"></div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Middle: Number */}
                        <div className="mt-4">
                            <div className="text-xl font-mono text-ashWhite tracking-[0.14em] drop-shadow-sm truncate">
                                {displayedNumber}
                            </div>
                        </div>

                        {/* Bottom: Name & Date */}
                        <div className="flex justify-between items-end">
                            <div className="text-sm font-bold text-ashWhite uppercase tracking-widest opacity-80 truncate max-w-[200px]">
                                {name || 'YOUR NAME'}
                            </div>
                            <div className="text-sm font-mono text-ashWhite tracking-widest opacity-80">
                                {expiry || 'MM/YY'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* BACK */}
                <div
                    className="absolute inset-0 w-full h-full rotate-y-180 rounded-2xl overflow-hidden border border-white/5 bg-[#0B0B0B] shadow-2xl"
                    style={{ backfaceVisibility: 'hidden' }}
                >
                    <div className="mt-6 w-full h-12 bg-black relative z-10"></div>

                    <div className="p-6 relative z-10">
                        {/* CVV Stripe */}
                        <div className="flex items-center gap-4 mt-4">
                            <div className="flex-1 h-10 bg-white/10 rounded flex items-center justify-end px-3">
                                <span className="text-sm text-black bg-white px-3 py-1 rounded-sm font-mono font-bold tracking-widest">
                                    {cvv || '***'}
                                </span>
                            </div>
                            <div className="text-xs text-ashWhite/40 font-bold uppercase tracking-widest">CVV</div>
                        </div>

                        {/* Faint Number on Back */}
                        <div className="absolute bottom-6 left-6 text-[10px] text-ashWhite/20 font-mono tracking-widest">
                            {displayedNumber}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VirtualCard;
