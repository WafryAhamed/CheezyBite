import React, { useState } from 'react';
import { Lock, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import VirtualCard from './VirtualCard';

const InputField = ({ label, icon: Icon, className, error, isValid, ...props }) => (
    <div className={twMerge("flex flex-col gap-1.5", className)}>
        <label className="text-xs font-bold text-ashWhite/60 uppercase tracking-wider pl-1">{label}</label>
        <div className="relative group">
            <div className={twMerge(
                "absolute inset-x-0 -bottom-[1px] h-[1px] scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500",
                error ? "bg-red-500" : "bg-gradient-to-r from-transparent via-primary/50 to-transparent"
            )} />
            <div className={twMerge(
                "relative flex items-center bg-softBlack/50 border rounded-lg overflow-hidden transition-all duration-300",
                error ? "border-red-500/50 bg-red-500/5" : "border-white/10 group-focus-within:border-primary/50 group-focus-within:bg-softBlack/80",
                isValid && !error && "border-green-500/50 bg-green-500/5"
            )}>
                <input
                    className={twMerge(
                        "w-full bg-transparent p-3 text-ashWhite text-sm font-medium outline-none placeholder:text-white/10",
                        error && "text-red-200"
                    )}
                    {...props}
                />
                <div className="mr-3 flex items-center gap-2">
                    {isValid && !error && <CheckCircle className="w-4 h-4 text-green-500 animate-in fade-in zoom-in" />}
                    {error && <AlertCircle className="w-4 h-4 text-red-500 animate-in fade-in zoom-in" />}
                    {Icon && !isValid && !error && <Icon className="w-4 h-4 text-ashWhite/40 group-focus-within:text-primary transition-colors" />}
                </div>
            </div>
        </div>
        {error && (
            <div className="flex items-center gap-1 text-[10px] text-red-400 pl-1 font-medium animate-in slide-in-from-top-1">
                <span>{error}</span>
            </div>
        )}
    </div>
);

const CreditCardForm = ({ cardData, setCardData, errors, touched, handleBlur }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        let formattedValue = value;

        if (name === 'number') {
            formattedValue = value.replace(/\D/g, '').substring(0, 16).replace(/(\d{4})/g, '$1 ').trim();
        } else if (name === 'expiry') {
            formattedValue = value.replace(/\D/g, '').substring(0, 4);
            if (formattedValue.length >= 2) {
                formattedValue = formattedValue.substring(0, 2) + '/' + formattedValue.substring(2);
            }
        } else if (name === 'cvv') {
            formattedValue = value.replace(/\D/g, '').substring(0, 3);
        } else if (name === 'name') {
            formattedValue = value.toUpperCase();
        }

        setCardData(prev => ({ ...prev, [name]: formattedValue }));
    };

    return (
        <div className="space-y-6 pt-10">
            {/* Live Virtual Card Preview */}


            <div className="bg-gradient-to-br from-charcoalBlack to-softBlack p-6 rounded-2xl border border-white/5 shadow-2xl animate-in fade-in zoom-in-95 duration-300 relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                            <CreditCard className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-bold text-ashWhite text-sm">Secure Payment</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-full border border-green-500/20">
                        <Lock className="w-3 h-3" />
                        256-BIT ENCRYPTED
                    </div>
                </div>

                <div className="space-y-4">
                    <InputField
                        label="Card Number"
                        name="number"
                        placeholder="0000 0000 0000 0000"
                        value={cardData.number}
                        onChange={handleChange}
                        onBlur={(e) => handleBlur('number', e.target.value)}
                        error={touched.number && errors.number}
                        isValid={!errors.number && cardData.number?.length === 19} // 16 digits + 3 spaces
                        maxLength={19}
                        onFocus={() => setIsFlipped(false)}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <InputField
                                label="Expiry"
                                name="expiry"
                                placeholder="MM/YY"
                                value={cardData.expiry}
                                onChange={handleChange}
                                onBlur={(e) => handleBlur('expiry', e.target.value)}
                                error={touched.expiry && errors.expiry}
                                isValid={!errors.expiry && cardData.expiry?.length === 5}
                                maxLength={5}
                                onFocus={() => setIsFlipped(false)}
                            />
                        </div>
                        <div>
                            <InputField
                                label="CVV"
                                name="cvv"
                                type="password"
                                placeholder="123"
                                value={cardData.cvv}
                                onChange={handleChange}
                                onBlur={(e) => handleBlur('cvv', e.target.value)}
                                error={touched.cvv && errors.cvv}
                                isValid={!errors.cvv && cardData.cvv?.length === 3}
                                maxLength={3}
                                onFocus={() => setIsFlipped(true)}
                                onBlurCapture={(e) => { // Special case for flip animation + validation
                                    handleBlur('cvv', e.target.value);
                                    setIsFlipped(false);
                                }}
                            />
                            {/* Note: type='password' is less common for CVV in advanced forms if masking is done visually on card, 
                                but standard practice is password-like dots or just plain text if short. 
                                User requested 'Masked input'. I'll stick to 'password' or handle logic.
                                Requirement: "Card preview... CVV Masked input".
                                I will change type to 'password' to satisfy 'Masked input' STRICTLY. 
                            */}
                        </div>
                    </div>
                </div>

                <InputField
                    label="Cardholder Name"
                    name="name"
                    placeholder="JOHN DOE"
                    value={cardData.name}
                    onChange={handleChange}
                    onBlur={(e) => handleBlur('name', e.target.value)}
                    error={touched.name && errors.name}
                    isValid={!errors.name && cardData.name?.length >= 3}
                    onFocus={() => setIsFlipped(false)}
                />
            </div>
            {/* Live Virtual Card Preview - Moved Below */}
            <VirtualCard cardData={cardData} isFlipped={isFlipped} />
        </div>

    );
};

export default CreditCardForm;
