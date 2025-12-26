import React, { useState, useEffect } from 'react';
import { X, Lock, RefreshCw, CheckCircle, ArrowRight, Mail } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { authService } from '../../services/authService';

const OTPModal = ({ isOpen, onClose, onVerify, email, purpose = 'checkout' }) => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(60);
    const [isVerifying, setIsVerifying] = useState(false);
    const [canResend, setCanResend] = useState(false);
    const [hasSent, setHasSent] = useState(false);
    const [isRequestInFlight, setIsRequestInFlight] = useState(false);

    // Initial Request - only once per open
    useEffect(() => {
        if (isOpen && !hasSent && email && !isRequestInFlight) {
            requestOtp();
        }
    }, [isOpen, email, hasSent, isRequestInFlight]);

    useEffect(() => {
        let interval;
        if (isOpen && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [isOpen, timer]);

    const requestOtp = async () => {
        if (isRequestInFlight) return; // Guard against duplicate requests
        
        try {
            setIsRequestInFlight(true);
            await authService.requestOtp(email, purpose);
            setHasSent(true);
            setTimer(60);
            setCanResend(false);
            // toast.success("Verification code sent to email");
        } catch (error) {
            console.error("Failed to send OTP", error);
            // toast.error("Failed to send verification code");
        } finally {
            setIsRequestInFlight(false);
        }
    };

    const handleChange = (element, index) => {
        if (isNaN(element.value)) return false;

        setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

        // Focus next input
        if (element.nextSibling && element.value !== "") {
            element.nextSibling.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const data = e.clipboardData.getData('text').slice(0, 6).split('');
        if (data.length === 6 && data.every(char => !isNaN(char))) {
            setOtp(data);
            // Auto focus last element if full paste
            const inputs = document.querySelectorAll('.otp-input');
            if (inputs[5]) inputs[5].focus();
        }
    };

    const handleResend = () => {
        requestOtp();
        setOtp(['', '', '', '', '', '']);
        toast.success("Code sent again!");
    };

    const handleSubmit = async () => {
        const code = otp.join('');
        if (code.length !== 6) {
            toast.error("Please enter a valid 6-digit code");
            return;
        }

        setIsVerifying(true);
        try {
            const response = await authService.verifyOtp(email, purpose, code);
            if (response.success) {
                toast.success("Verified successfully!");
                onVerify();
                onClose();
            }
        } catch (error) {
            toast.error(error.message || "Invalid code. Please try again.");
            setOtp(['', '', '', '', '', '']);
        } finally {
            setIsVerifying(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-charcoalBlack border border-white/10 p-8 rounded-2xl w-full max-w-md shadow-2xl relative mx-4 animate-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-ashWhite/40 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/20">
                        <Mail className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-ashWhite mb-2">Verify Your Email</h2>
                    <p className="text-ashWhite/60 text-sm">
                        Please enter the 6-digit code sent to <br />
                        <span className="font-bold text-ashWhite mt-1 inline-block">{email}</span>
                    </p>
                </div>

                <div className="flex gap-2 justify-center mb-8" onPaste={handlePaste}>
                    {otp.map((data, index) => (
                        <input
                            key={index}
                            className="otp-input w-12 h-14 rounded-lg bg-softBlack border border-white/10 text-center text-xl font-bold text-ashWhite focus:border-primary focus:bg-primary/5 outline-none transition-all"
                            type="text"
                            maxLength="1"
                            value={data}
                            onChange={e => handleChange(e.target, index)}
                            onKeyDown={e => {
                                if (e.key === 'Backspace' && !otp[index] && index > 0) {
                                    e.target.previousSibling.focus();
                                }
                            }}
                        />
                    ))}
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={isVerifying || otp.join('').length !== 6}
                    className={`nav-btn w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 mb-4 ${isVerifying || otp.join('').length !== 6
                        ? 'bg-softBlack text-ashWhite/40 border-transparent cursor-not-allowed'
                        : 'bg-primary text-white border-primary hover:shadow-lg hover:shadow-primary/20'
                        }`}
                >
                    {isVerifying ? (
                        <>Verifying...</>
                    ) : (
                        <>Verify & Continue <ArrowRight className="w-4 h-4" /></>
                    )}
                </button>

                <div className="text-center">
                    {canResend ? (
                        <button
                            onClick={handleResend}
                            className="text-sm text-primary font-bold hover:underline flex items-center justify-center gap-2 mx-auto"
                        >
                            <RefreshCw className="w-3 h-3" /> Resend Code
                        </button>
                    ) : (
                        <p className="text-xs text-ashWhite/40 font-mono">
                            Resend code in 00:{timer < 10 ? `0${timer}` : timer}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OTPModal;
