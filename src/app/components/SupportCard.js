'use client';

import React from 'react';
import { Phone, Mail } from 'lucide-react';

const SupportCard = ({ compact = false, className = '' }) => {
    const handleCall = () => {
        window.location.href = 'tel:+94771234567';
    };

    if (compact) {
        return (
            <div className={`flex flex-col gap-2 ${className}`}>
                <h3 className="text-ashWhite font-bold">Need Help?</h3>
                <div className="flex gap-2">
                    <button
                        onClick={handleCall}
                        className="bg-secondary/10 hover:bg-secondary/20 border border-secondary/30 text-secondary px-3 py-2 rounded-lg flex items-center gap-2 text-xs font-bold transition-all"
                    >
                        <Phone className="w-3 h-3" /> Call
                    </button>
                    <a
                        href="mailto:support@cheezybite.lk"
                        className="bg-white/5 hover:bg-white/10 border border-white/10 text-ashWhite px-3 py-2 rounded-lg flex items-center gap-2 text-xs font-bold transition-all"
                    >
                        <Mail className="w-3 h-3" /> Email
                    </a>
                </div>
                {/* Demo contact details — replace in production */}
            </div>
        );
    }

    return (
        <div className={`bg-[#181818] rounded-[16px] p-6 border border-secondary/20 shadow-lg relative overflow-hidden group ${className}`}>
            {/* Glow Effect */}
            <div className="absolute -top-10 -right-10 w-20 h-20 bg-secondary/10 rounded-full blur-2xl group-hover:bg-secondary/20 transition-all"></div>

            <div className="relative z-10">
                <h3 className="text-white font-bold text-lg mb-1">Need help with your order?</h3>
                <p className="text-gray-400 text-sm mb-6">Our support team is available 24/7</p>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={handleCall}
                        className="w-full bg-secondary hover:bg-secondaryHover text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-secondary/20"
                    >
                        <Phone className="w-5 h-5" />
                        Call Support
                    </button>
                    {/* Demo contact details — replace in production */}
                    <p className="text-center text-xs text-gray-500 mt-2">
                        +94 77 123 4567 • support@cheezybite.lk
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SupportCard;
