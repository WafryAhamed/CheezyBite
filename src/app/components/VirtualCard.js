import React, { useMemo } from 'react';
import { Wifi } from 'lucide-react';

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
                if (i >= 4 && i < 12) formatted += '*';
                else formatted += raw[i];
            } else {
                formatted += '•'; // Use middle dot for empty
            }
        }
        return formatted;
    }, [number]);

    return (
        <div className="relative w-full aspect-[1.586] perspective-1000 mx-auto max-w-[340px] z-20 -mb-16">
            <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>

                {/* FRONT */}
                <div
                    className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-[#1a1a1a]"
                    style={{ backfaceVisibility: 'hidden' }}
                >
                    {/* Background Design */}
                    <div className="absolute inset-0 bg-gradient-to-br from-softBlack via-charcoalBlack to-black"></div>
                    <div className="absolute -top-[50%] -right-[50%] w-[100%] h-[100%] bg-primary/20 blur-[60px] rounded-full"></div>
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30 mix-blend-overlay"></div>

                    <div className="relative p-6 h-full flex flex-col justify-between z-10">
                        {/* Top Row */}
                        <div className="flex justify-between items-center">
                            {/* Chip */}
                            <div className="w-11 h-8 bg-gradient-to-br from-[#f9d423] to-[#ff4e50] rounded-md border border-yellow-600/30 overflow-hidden relative shadow-inner">
                                <div className="absolute w-full h-[1px] bg-black/20 top-1/2"></div>
                                <div className="absolute h-full w-[1px] bg-black/20 left-1/3"></div>
                                <div className="absolute h-full w-[1px] bg-black/20 right-1/3"></div>
                            </div>
                            <Wifi className="text-ashWhite/60 rotate-90 w-6 h-6" />
                        </div>

                        {/* Number */}
                        <div className="mt-4">
                            <div className="text-[22px] font-mono text-ashWhite tracking-[0.14em] drop-shadow-md">
                                {displayedNumber}
                            </div>
                        </div>

                        {/* Bottom Row */}
                        <div className="flex justify-between items-end mt-2">
                            <div className="flex gap-6">
                                <div>
                                    <div className="text-[9px] text-ashWhite/50 uppercase tracking-widest font-bold mb-0.5">Card Holder</div>
                                    <div className="text-sm font-bold text-ashWhite uppercase tracking-wider truncate max-w-[140px]">
                                        {name || 'YOUR NAME'}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[9px] text-ashWhite/50 uppercase tracking-widest font-bold mb-0.5">Expires</div>
                                    <div className="text-sm font-bold text-ashWhite tracking-wider">
                                        {expiry || 'MM/YY'}
                                    </div>
                                </div>
                            </div>

                            {/* Brand Logo */}
                            <div className="h-8 flex items-end">
                                {brand === 'VISA' && <span className="text-white font-serif font-black italic text-2xl tracking-tighter">VISA</span>}
                                {brand === 'MASTERCARD' && (
                                    <div className="flex items-center relative w-10">
                                        <div className="w-7 h-7 bg-[#EB001B] rounded-full opacity-90 relative z-10"></div>
                                        <div className="w-7 h-7 bg-[#F79E1B] rounded-full -ml-3 opacity-90 relative z-20 mix-blend-overlay"></div>
                                    </div>
                                )}
                                {brand === 'BANK' && <span className="text-ashWhite/20 text-xs font-bold tracking-widest">CHEEZYBITE</span>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* BACK */}
                <div
                    className="absolute inset-0 w-full h-full rotate-y-180 rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-[#1a1a1a]"
                    style={{ backfaceVisibility: 'hidden' }}
                >
                    <div className="absolute inset-0 bg-gradient-to-bl from-softBlack via-charcoalBlack to-black"></div>

                    {/* Magnetic Strip */}
                    <div className="mt-6 w-full h-12 bg-black relative z-10"></div>

                    <div className="p-6 relative z-10">
                        {/* CVV Section */}
                        <div className="flex items-center gap-2 mt-2">
                            <div className="flex-1 h-10 bg-white/10 rounded flex items-center justify-end px-3">
                                <span className="text-xs text-black bg-white px-2 py-0.5 rounded font-mono font-bold tracking-widest">
                                    {cvv || '***'}
                                </span>
                            </div>
                        </div>
                        <div className="text-[9px] text-ashWhite/40 text-right pr-1 mt-1 font-bold">CVV / CVC</div>

                        <div className="mt-8 flex justify-end opacity-20">
                            <Wifi className="w-16 h-16 text-white" />
                        </div>
                        <div className="absolute bottom-6 left-6 text-xs text-ashWhite/30 font-mono tracking-widest">
                            {displayedNumber}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VirtualCard;
