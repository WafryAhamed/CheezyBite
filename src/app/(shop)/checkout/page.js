'use client';

import React, { useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CartContext } from '../context/CartContext';
import { UserContext } from '../context/UserContext';
import { OrderContext } from '../context/OrderContext';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle, CreditCard, MapPin, Truck, Plus, Home, Briefcase, Trash2, Loader2, AlertCircle } from 'lucide-react';

import toast from 'react-hot-toast';
import CreditCardForm from '../components/CreditCardForm';
// Validating card fields
import { validateCardField, isValidLuhn, isValidExpiry, isValidCVV, isValidName } from '../../utils/cardValidation';
import { isStoreOpen, checkDeliveryAvailability } from '../../utils/storeLogic';
import OTPModal from '../components/OTPModal';

const CheckoutPage = () => {
    const router = useRouter();
    const { cart, cartTotal, clearCart } = useContext(CartContext);
    const { user, addAddress, removeAddress, verifyPhone } = useContext(UserContext);
    const { createOrder } = useContext(OrderContext);

    const [isOTPModalOpen, setIsOTPModalOpen] = useState(false);
    const [storeStatus, setStoreStatus] = useState({ available: true, reason: '' });

    const [success, setSuccess] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, processing, success, error
    const [paymentError, setPaymentError] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash'); // Default to Cash for demo
    const [deliveryTime, setDeliveryTime] = useState('asap');
    const [deliveryInstructions, setDeliveryInstructions] = useState('');

    // Card State
    const [cardData, setCardData] = useState({ number: '', name: '', expiry: '', cvv: '', focus: '' });
    const [cardErrors, setCardErrors] = useState({});
    const [touched, setTouched] = useState({});

    const handleBlur = (field, value) => {
        setTouched(prev => ({ ...prev, [field]: true }));
        const error = validateCardField(field, value, cardData);
        setCardErrors(prev => ({ ...prev, [field]: error }));
    };

    // Check strict validity for button state
    const isCardValid = () => {
        return isValidLuhn(cardData.number) &&
            isValidExpiry(cardData.expiry) &&
            isValidCVV(cardData.cvv) &&
            isValidName(cardData.name);
    };

    // Address State
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [isAddingAddress, setIsAddingAddress] = useState(false);

    // New Address Form State
    const [newAddress, setNewAddress] = useState({
        label: 'Home', // Home or Work
        phone: user?.phone || '',
        street: '',
        city: '',
        area: ''
    });

    // Auto-select default address
    useEffect(() => {
        if (user && user.addresses && user.addresses.length > 0 && !selectedAddressId) {
            const defaultAddr = user.addresses.find(a => a.isDefault) || user.addresses[0];
            setSelectedAddressId(defaultAddr.id);
        }
    }, [user, selectedAddressId]);

    const handleAddAddress = () => {
        if (!newAddress.phone || !newAddress.street || !newAddress.city) {
            toast.error("Please fill in required fields (Phone, Street, City)");
            return;
        }
        addAddress({
            ...newAddress,
            type: newAddress.label
        });
        setIsAddingAddress(false);
        // Reset form but keep phone
        setNewAddress({ ...newAddress, street: '', city: '', area: '' });
    };

    // Placeholder for payment processing - Simulating 10% failure rate for realism
    const processPayment = async () => {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call

        // FAIL-SAFE TEST: You can uncomment this to force failure
        // throw new Error("Bank declined the transaction.");

        // Random 20% failure chance to demo error handling logic
        if (Math.random() < 0.2) {
            throw new Error("Transaction declined by bank. Please try another card.");
        }
        return true;
    };

    // Store Availability Check
    useEffect(() => {
        if (selectedAddressId) {
            const address = user.addresses.find(a => a.id === selectedAddressId);
            if (address) {
                const availability = checkDeliveryAvailability(address.city);
                setStoreStatus(availability);
            }
        }
    }, [selectedAddressId, user]);

    const handlePlaceOrder = async () => {
        if (!selectedAddressId) {
            toast.error("Please select a delivery address");
            return;
        }

        const deliveryAddress = user.addresses.find(a => a.id === selectedAddressId);

        // Basic validation for phone number if not already present in user or address
        if (!deliveryAddress.phone && !user.phone) {
            toast.error("Phone number is required for delivery.");
            return;
        }

        if (paymentMethod === 'cash') {
            if (!deliveryAddress.phone && !user.phone) {
                toast.error("Phone number required for Cash on Delivery");
                return;
            }
            if (!user.phone_verified) {
                setIsOTPModalOpen(true);
                return;
            }
        } else if (paymentMethod === 'card') {
            const errors = {};
            errors.number = validateCardField('number', cardData.number);
            errors.expiry = validateCardField('expiry', cardData.expiry);
            errors.cvv = validateCardField('cvv', cardData.cvv);
            errors.name = validateCardField('name', cardData.name);

            // Filter out nulls
            const cleanErrors = Object.entries(errors).reduce((acc, [key, val]) => {
                if (val) acc[key] = val;
                return acc;
            }, {});

            if (Object.keys(cleanErrors).length > 0) {
                setCardErrors(cleanErrors);
                setTouched({ number: true, expiry: true, cvv: true, name: true });
                toast.error("Please enter valid card details");
                return;
            }
        }

        // OTP Check for Card as well if needed, but critical for COD. Let's enforce for all first orders.
        if (!user.phone_verified) {
            setIsOTPModalOpen(true);
            return;
        }

        if (!storeStatus.available) {
            toast.error(storeStatus.reason);
            return;
        }

        setIsProcessing(true);
        setPaymentStatus('processing');
        setPaymentError('');

        try {
            if (paymentMethod === 'card') {
                await processPayment();
            }

            // ONLY HERE do we create the order - after payment success
            const orderData = {
                address: deliveryAddress,
                paymentMethod,
                deliveryTime,
                deliveryInstructions, // Store instructions
                paymentDetails: paymentMethod === 'card'
                    ? { type: 'card', masked: '**' + cardData.number.slice(-4), token: 'tok_cheezybite_' + Math.random().toString(36).substr(2, 9) }
                    : { type: 'cod' }
            };

            // Create Order
            const newOrder = createOrder(cart, cartTotal, orderData);

            if (newOrder && newOrder.id) {
                clearCart();
                setPaymentStatus('success');
                setSuccess(true);
                router.push(`/order/${newOrder.id}`);
            } else {
                throw new Error("Failed to generate order reference.");
            }

        } catch (error) {
            console.error(error);
            setPaymentStatus('error');
            setPaymentError(error.message || "Payment processing failed. Please try again.");
            setIsProcessing(false);
            // CRITICAL: We do NOT clear cart, we do NOT reset address.
            // User stays on this page to retry.
        }
    };

    if (cart.length === 0 && !success) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
                <h2 className="text-3xl font-bold text-ashWhite mb-4">Your cart is empty</h2>
                <Link href="/menu" className="text-primary hover:text-primaryHover underline">
                    Return to Menu
                </Link>
            </div>
        )
    }

    if (success) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 pt-24 pb-12">
                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-green-500/50 shadow-lg animate-in zoom-in">
                    <CheckCircle className="w-12 h-12 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-ashWhite mb-4">Order Placed Successfully!</h1>
                <p className="text-ashWhite/70 text-lg mb-8 max-w-lg">
                    Thank you for your order. We are preparing your delicious pizza right now.
                </p>
                <div className="flex gap-4">
                    <button className="btn btn-lg bg-softBlack text-ashWhite border border-cardBorder px-8 py-3 rounded-xl font-bold hover:bg-white/5">
                        Back to Home
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className='container mx-auto px-4 pt-24 pb-12 min-h-screen'>
            {/* Progress Indicator */}
            <div className="flex items-center justify-center mb-12 text-sm font-bold uppercase tracking-widest gap-4 md:gap-8">
                <div className="text-ashWhite/40 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full border border-ashWhite/40 flex items-center justify-center">1</span>
                    Cart
                </div>
                <div className="w-8 h-px bg-ashWhite/20"></div>
                <div className="text-primary flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center">2</span>
                    Checkout
                </div>
            </div>

            <h1 className="text-4xl font-bold mb-8 text-ashWhite uppercase tracking-wide">Checkout</h1>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Column - Forms */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Delivery Details */}
                    <div className="bg-charcoalBlack rounded-2xl p-6 border border-cardBorder">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <MapPin className="text-primary w-6 h-6" />
                                <h2 className="text-xl font-bold text-ashWhite">Delivery Address</h2>
                            </div>
                            <button
                                onClick={() => setIsAddingAddress(!isAddingAddress)}
                                className="text-primary text-sm font-bold flex items-center gap-1 hover:underline"
                            >
                                <Plus className="w-4 h-4" /> {isAddingAddress ? 'Cancel' : 'Add New'}
                            </button>
                        </div>

                        {/* Add Address Form */}
                        {isAddingAddress && (
                            <div className="bg-softBlack p-6 rounded-xl border border-primary/30 mb-6 animate-in fade-in slide-in-from-top-4">
                                <h3 className="font-bold text-ashWhite mb-4">Add New Address</h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2 flex gap-4 mb-2">
                                        {['Home', 'Work'].map(type => (
                                            <button
                                                key={type}
                                                onClick={() => setNewAddress({ ...newAddress, label: type })}
                                                className={`flex-1 py-2 px-4 rounded-lg font-bold border transition-colors ${newAddress.label === type ? 'bg-primary text-white border-primary' : 'bg-charcoalBlack text-ashWhite/60 border-cardBorder'}`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                    <input
                                        type="text" placeholder="Phone Number *"
                                        value={newAddress.phone}
                                        onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                                        className="input w-full p-3 bg-charcoalBlack border border-cardBorder rounded-lg text-ashWhite focus:border-primary outline-none"
                                    />
                                    <input
                                        type="text" placeholder="City *"
                                        value={newAddress.city}
                                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                                        className="input w-full p-3 bg-charcoalBlack border border-cardBorder rounded-lg text-ashWhite focus:border-primary outline-none"
                                    />
                                    <input
                                        type="text" placeholder="Street / Building *"
                                        value={newAddress.street}
                                        onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                                        className="input w-full md:col-span-2 p-3 bg-charcoalBlack border border-cardBorder rounded-lg text-ashWhite focus:border-primary outline-none"
                                    />
                                    <input
                                        type="text" placeholder="Area / Landmark"
                                        value={newAddress.area}
                                        onChange={(e) => setNewAddress({ ...newAddress, area: e.target.value })}
                                        className="input w-full md:col-span-2 p-3 bg-charcoalBlack border border-cardBorder rounded-lg text-ashWhite focus:border-primary outline-none"
                                    />
                                    <button
                                        onClick={handleAddAddress}
                                        className="md:col-span-2 btn bg-primary hover:bg-primaryHover text-white py-3 rounded-lg font-bold shadow-lg"
                                    >
                                        Save Address
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Address List */}
                        <div className="grid md:grid-cols-2 gap-4">
                            {user?.addresses && user.addresses.length > 0 ? (
                                user.addresses.map((addr) => (
                                    <div
                                        key={addr.id}
                                        onClick={() => setSelectedAddressId(addr.id)}
                                        className={`relative p-4 rounded-xl border cursor-pointer transition-all hover:shadow-lg ${selectedAddressId === addr.id ? 'border-primary bg-primary/10' : 'border-cardBorder bg-softBlack'}`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2 font-bold text-ashWhite">
                                                {addr.label === 'Home' ? <Home className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />}
                                                {addr.label}
                                            </div>
                                            <button onClick={(e) => { e.stopPropagation(); removeAddress(addr.id); }} className="text-ashWhite/40 hover:text-red-500">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <p className="text-sm text-ashWhite/80">{addr.street}</p>
                                        <p className="text-sm text-ashWhite/60">{addr.city} {addr.area && `, ${addr.area}`}</p>
                                        <p className="text-sm text-ashWhite/60 mt-1">📞 {addr.phone}</p>

                                        {selectedAddressId === addr.id && (
                                            <div className="absolute top-4 right-4 text-primary bg-primary/20 rounded-full p-1"><CheckCircle className="w-4 h-4" /></div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                !isAddingAddress && (
                                    <div className="md:col-span-2 text-center py-8 text-ashWhite/50 bg-softBlack/50 rounded-xl border border-dashed border-cardBorder">
                                        No addresses found. Add one to proceed!
                                    </div>
                                )
                            )}
                        </div>
                    </div>

                    {/* Delivery Instructions */}
                    <div className="bg-charcoalBlack rounded-2xl p-6 border border-cardBorder mt-6">
                        <label className="block text-sm font-bold text-ashWhite mb-2">Delivery Instructions (Optional)</label>
                        <textarea
                            className="w-full bg-softBlack border border-cardBorder rounded-xl p-4 text-ashWhite placeholder:text-ashWhite/30 outline-none focus:border-primary transition-colors resize-none"
                            rows="3"
                            placeholder="E.g. Call on arrival, Leave at gate, Ring bell..."
                            value={deliveryInstructions}
                            onChange={(e) => setDeliveryInstructions(e.target.value)}
                        ></textarea>
                    </div>

                    {/* Delivery Time and Payment (Reused from existing, just simplified logic) */}
                    <div className="bg-charcoalBlack rounded-2xl p-6 border border-cardBorder">
                        <div className="flex items-center gap-3 mb-6">
                            <Truck className="text-primary w-6 h-6" />
                            <h2 className="text-xl font-bold text-ashWhite">Delivery Time</h2>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <label className={`cursor-pointer border p-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${deliveryTime === 'asap' ? 'border-primary bg-primary/10 text-ashWhite' : 'border-cardBorder bg-softBlack text-ashWhite/60'}`}>
                                <input type="radio" name="time" className="hidden" checked={deliveryTime === 'asap'} onChange={() => setDeliveryTime('asap')} />
                                <span>⚡ ASAP (30-45 min)</span>
                            </label>
                            <label className={`cursor-pointer border p-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${deliveryTime === 'schedule' ? 'border-primary bg-primary/10 text-ashWhite' : 'border-cardBorder bg-softBlack text-ashWhite/60'}`}>
                                <input type="radio" name="time" className="hidden" checked={deliveryTime === 'schedule'} onChange={() => setDeliveryTime('schedule')} />
                                <span>📅 Schedule for Later</span>
                            </label>
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="bg-charcoalBlack rounded-2xl p-6 border border-cardBorder">
                        <div className="flex items-center gap-3 mb-6">
                            <CreditCard className="text-primary w-6 h-6" />
                            <h2 className="text-xl font-bold text-ashWhite">Payment Method</h2>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <label className={`cursor-pointer border p-4 rounded-xl flex flex-col items-center justify-center gap-2 font-bold transition-all ${paymentMethod === 'card' ? 'border-primary bg-primary/10 text-ashWhite' : 'border-cardBorder bg-softBlack text-ashWhite/60'}`}>
                                <input type="radio" name="payment" className="hidden" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} />
                                <CreditCard className="w-6 h-6" />
                                <span className="text-sm">Card</span>
                            </label>
                            <label className={`cursor-pointer border p-4 rounded-xl flex flex-col items-center justify-center gap-2 font-bold transition-all ${paymentMethod === 'cash' ? 'border-primary bg-primary/10 text-ashWhite' : 'border-cardBorder bg-softBlack text-ashWhite/60'}`}>
                                <input type="radio" name="payment" className="hidden" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} />
                                <span className="text-2xl">💵</span>
                                <span className="text-sm">Cash</span>
                            </label>
                            <label className={`cursor-pointer border p-4 rounded-xl flex flex-col items-center justify-center gap-2 font-bold transition-all ${paymentMethod === 'wallet' ? 'border-primary bg-primary/10 text-ashWhite' : 'border-cardBorder bg-softBlack text-ashWhite/60'}`}>
                                <input type="radio" name="payment" className="hidden" checked={paymentMethod === 'wallet'} onChange={() => setPaymentMethod('wallet')} />
                                <span className="text-2xl">👛</span>
                                <span className="text-sm">Wallet</span>
                            </label>
                        </div>

                        {/* Secured Card Form */}
                        {paymentMethod === 'card' && (
                            <CreditCardForm
                                cardData={cardData}
                                setCardData={setCardData}
                                errors={cardErrors}
                                touched={touched}
                                handleBlur={handleBlur}
                            />
                        )}

                        {/* COD Info */}
                        {paymentMethod === 'cash' && (
                            <div className="bg-softBlack/50 p-4 rounded-xl text-sm text-ashWhite/70 border border-white/5 flex items-center gap-3">
                                <span className="text-xl">ℹ️</span>
                                Phone verification required. Please ensure your contact details are correct.
                            </div>
                        )}
                    </div>


                </div>

                {/* Right Column - Order Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-softBlack sticky top-24 rounded-2xl p-6 border border-cardBorder shadow-xl">
                        <h3 className="text-xl font-bold text-ashWhite mb-6">Your Order</h3>
                        <div className="flex flex-col gap-4 mb-6 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-primary scrollbar-track-softBlack pr-2">
                            {cart.map((item, index) => (
                                <div key={index} className="flex gap-4 items-center">
                                    <div className="w-16 h-16 bg-charcoalBlack rounded-lg flex items-center justify-center relative flex-shrink-0">
                                        <Image src={item.image} alt={item.name} width={60} height={60} className="object-contain" />
                                        <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center border border-softBlack">
                                            {item.amount}
                                        </span>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-bold text-ashWhite line-clamp-1">{item.name}</h4>
                                        <p className="text-xs text-ashWhite/60">{item.size}, {item.crust}</p>
                                    </div>
                                    <div className="text-sm font-bold text-secondary">
                                        Rs. {(item.price * item.amount).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-cardBorder my-4"></div>
                        <div className="flex justify-between items-center mb-2 text-ashWhite/80">
                            <span>Subtotal</span>
                            <span>Rs. {parseFloat(cartTotal).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center mb-6 text-ashWhite/80">
                            <span>Delivery Fee</span>
                            <span>Rs. 350</span>
                        </div>
                        <div className="border-t border-cardBorder mb-6"></div>
                        <div className="flex justify-between items-center mb-8 text-2xl font-bold text-ashWhite">
                            <span>Total</span>
                            <span>Rs. {(parseFloat(cartTotal) + 350).toLocaleString()}</span>
                        </div>

                        <button
                            onClick={handlePlaceOrder}
                            disabled={isProcessing || (paymentMethod === 'card' && !isCardValid()) || !storeStatus.available}
                            className={`w-full btn btn-lg text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${isProcessing || (paymentMethod === 'card' && !isCardValid()) || !storeStatus.available ? 'bg-softBlack border border-cardBorder opacity-50 cursor-not-allowed' : 'bg-gradient-to-r from-primary to-secondary hover:shadow-primary/20 transform hover:-translate-y-1'}`}
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Processing Payment...
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                    {paymentMethod === 'card' ? `Pay Rs. ${(parseFloat(cartTotal) + 350).toLocaleString()}` : 'Place Order'}
                                </>
                            )}
                        </button>

                        {/* Payment Failure UI */}
                        {paymentStatus === 'error' && (
                            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl animate-in fade-in slide-in-from-top-2">
                                <div className="flex items-start gap-3">
                                    <div className="bg-red-500/20 p-2 rounded-full">
                                        <AlertCircle className="w-6 h-6 text-red-500" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-red-500 text-lg">Transaction Failed</h4>
                                        <p className="text-red-400 text-sm mb-4">{paymentError}</p>

                                        <div className="flex gap-3">
                                            <button
                                                onClick={handlePlaceOrder}
                                                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded-lg text-sm transition-colors"
                                            >
                                                🔁 Retry Payment
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setPaymentMethod('cash');
                                                    setPaymentStatus('idle');
                                                    setPaymentError('');
                                                }}
                                                className="flex-1 bg-transparent border border-red-500/30 text-red-400 hover:bg-red-500/10 font-bold py-2 rounded-lg text-sm transition-colors"
                                            >
                                                💵 Switch to Cash
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="flex items-center justify-center gap-2 mt-4 text-xs text-ashWhite/50">
                            <Truck className="w-3 h-3" />
                            <span>Secure Checkout with 256-bit Encryption</span>
                        </div>

                        {!storeStatus.available && (
                            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm text-center">
                                🚫 {storeStatus.reason}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <OTPModal
                isOpen={isOTPModalOpen}
                onClose={() => setIsOTPModalOpen(false)}
                phoneNumber={user?.phone || 'your number'}
                onVerify={() => {
                    verifyPhone();
                    setIsOTPModalOpen(false);
                    // Automatically trigger place order again or ask user to click? 
                    // Better UX: Ask user to click "Place Order" again to confirm final intent, or just toast.
                    toast.success("Phone verified! You can now place your order.");
                }}
            />
        </div >
    );
};

export default CheckoutPage;
