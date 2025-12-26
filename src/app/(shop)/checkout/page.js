'use client';

import React, { useContext, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CartContext } from '../../context/CartContext';
import { UserContext } from '../../context/UserContext';
import { OrderContext } from '../../context/OrderContext';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle, CreditCard, MapPin, Truck, Plus, Home, Briefcase, Trash2, Loader2, AlertCircle } from 'lucide-react';

import toast from 'react-hot-toast';
import CreditCardForm from '../../components/CreditCardForm';
// Validating card fields
import { validateCardField, isValidLuhn, isValidExpiry, isValidCVV, isValidName } from '../../../utils/cardValidation';
import { isStoreOpen, checkDeliveryAvailability } from '../../../utils/storeLogic';
import OTPModal from '../../components/OTPModal';
import SupportCard from '../../components/SupportCard';

const CheckoutPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { cart, cartTotal, clearCart } = useContext(CartContext);
    const { user, addAddress, removeAddress, loading } = useContext(UserContext);
    const { createOrder } = useContext(OrderContext);

    const [isOTPModalOpen, setIsOTPModalOpen] = useState(false);
    const [isOrderVerified, setIsOrderVerified] = useState(false);
    const [storeStatus, setStoreStatus] = useState({ available: true, reason: '' });
    const [otpRequestInFlight, setOtpRequestInFlight] = useState(false);

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

    // Early redirect: If user is not authenticated, redirect to login with redirect param
    // This prevents unauthenticated users from seeing checkout page
    useEffect(() => {
        // Wait for loading to complete before checking
        if (!loading && !user) {
            // User is not logged in after loading completes
            router.push('/auth?redirect=/checkout');
        }
    }, [user, loading, router]);

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

        // Strict Sri Lankan Phone Validation
        const phoneRegex = /^07[0-9]{8}$/;
        if (!phoneRegex.test(newAddress.phone)) {
            toast.error("Phone must be 10 digits and start with 07");
            return;
        }

        if (newAddress.street.length < 5) {
            toast.error("Street address must be at least 5 characters");
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

    const [couponCode, setCouponCode] = useState('');
    const [appliedOffer, setAppliedOffer] = useState(null);
    const [discountAmount, setDiscountAmount] = useState(0);

    // Store prepared order data before OTP (for single-click ordering)
    const [preparedOrderData, setPreparedOrderData] = useState(null);

    // Auto-apply coupon from URL params (Offers → Menu → Checkout flow)
    useEffect(() => {
        const urlCoupon = searchParams?.get('coupon');
        if (urlCoupon && !appliedOffer && cartTotal > 0) {
            setCouponCode(urlCoupon);
            // Auto-apply the coupon
            const autoApplyCoupon = async () => {
                try {
                    const response = await fetch('/api/offers/apply', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ code: urlCoupon, cartTotal: cartTotal })
                    });
                    const data = await response.json();

                    if (data.success) {
                        setAppliedOffer(data.data);
                        setDiscountAmount(data.data.discountAmount);
                        toast.success(`Coupon ${urlCoupon} applied!`, { icon: '🎉' });
                    } else {
                        toast.error(data.message || "Coupon could not be applied");
                    }
                } catch (error) {
                    console.error('Auto-apply coupon failed:', error);
                }
            };
            autoApplyCoupon();
        }
    }, [searchParams, cartTotal]); // Run when searchParams or cartTotal changes

    // Revalidate coupon on cart changes (Uber Eats-style real-time behavior)
    useEffect(() => {
        const revalidateCoupon = async () => {
            if (!appliedOffer || !couponCode) return;

            try {
                const response = await fetch('/api/offers/apply', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code: couponCode, cartTotal: cartTotal })
                });
                const data = await response.json();

                if (data.success) {
                    // Update discount amount if cart changed
                    setDiscountAmount(data.data.discountAmount);
                    setAppliedOffer(data.data);
                } else {
                    // Coupon no longer valid (e.g., cart below minimum)
                    setAppliedOffer(null);
                    setDiscountAmount(0);
                    toast.error("Coupon removed: " + (data.message || "No longer valid"));
                }
            } catch (error) {
                // Silent fail - keep existing coupon state
                console.error('Coupon revalidation failed:', error);
            }
        };

        revalidateCoupon();
    }, [cart, cartTotal]); // Revalidate whenever cart or cartTotal changes

    const handleApplyCoupon = async () => {
        if (!couponCode) return;

        try {
            const response = await fetch('/api/offers/apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: couponCode, cartTotal: cartTotal })
            });
            const data = await response.json();

            if (data.success) {
                setAppliedOffer(data.data);
                setDiscountAmount(data.data.discountAmount);
                toast.success("Coupon applied successfully!");
            } else {
                setAppliedOffer(null);
                setDiscountAmount(0);
                toast.error(data.message || "Invalid coupon");
            }
        } catch (error) {
            toast.error("Failed to apply coupon");
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedOffer(null);
        setDiscountAmount(0);
        setCouponCode('');
        toast.success("Coupon removed");
    };

    // ... existing imports ...

    const handlePlaceOrder = async () => {
        // Guard against empty cart or duplicate submission
        if (!cart || cart.length === 0) {
            toast.error('Cart is empty. Please add items before placing an order.');
            return;
        }

        if (isProcessing) {
            toast.error('Order is already being processed. Please wait...');
            return;
        }

        // ... (existing validation code) ...
        const { loadToppings } = await import('../../utils/adminStorageHelper');
        const currentToppings = loadToppings();
        const activeToppingIds = new Set(currentToppings.filter(t => t.enabled).map(t => t.id));

        let hasInactiveToppings = false;
        const updatedCart = cart.map(item => {
            if (!item.additionalTopping || item.additionalTopping.length === 0) return item;
            const validToppings = item.additionalTopping.filter(topping => activeToppingIds.has(topping.id));
            if (validToppings.length !== item.additionalTopping.length) {
                hasInactiveToppings = true;
            }
            return { ...item, additionalTopping: validToppings };
        });

        if (hasInactiveToppings) {
            const { setCart } = require('../../context/CartContext');
            toast.error("Some toppings are no longer available and have been removed from your cart. Please review your order.");
            window.location.reload();
            return;
        }

        if (!user) {
            toast.error("Please log in to place an order");
            // Redirect to auth page with redirect param to return to checkout after login
            router.push('/auth?redirect=/checkout');
            return;
        }

        if (!selectedAddressId) {
            toast.error("Please select a delivery address");
            return;
        }

        const deliveryAddress = user.addresses ? user.addresses.find(a => a.id === selectedAddressId) : null;

        if (!deliveryAddress) {
            toast.error("Invalid delivery address. Please select or add a new one.");
            return;
        }

        if (!deliveryAddress.phone && !user.phone) {
            toast.error("Phone number is required for delivery.");
            return;
        }

        if (!storeStatus.available) {
            toast.error(storeStatus.reason);
            return;
        }

        // OTP Verification - PREPARE ORDER DATA FIRST (Single-Click Flow)
        if (!isOrderVerified) {
            // Prepare order data to be used after OTP verification
            const finalTotal = parseFloat(cartTotal) + 350 - discountAmount;

            const orderData = {
                cart,
                finalTotal,
                address: deliveryAddress,
                paymentMethod,
                deliveryTime,
                deliveryInstructions,
                appliedOffer: appliedOffer ? {
                    code: appliedOffer.code,
                    discountAmount: appliedOffer.discountAmount
                } : null,
                discountAmount: discountAmount,
                paymentDetails: paymentMethod === 'card'
                    ? { type: 'card', masked: '**' + cardData.number.slice(-4), token: 'tok_cheezybite_' + Math.random().toString(36).substr(2, 9) }
                    : { type: 'cod' },
                cardData: paymentMethod === 'card' ? cardData : null
            };

            // Store prepared order data
            setPreparedOrderData(orderData);

            // Show OTP modal
            if (!otpRequestInFlight) {
                setOtpRequestInFlight(true);
                setIsOTPModalOpen(true);
            }
            return;
        }

        // After OTP verification: Create order with prepared data
        if (!preparedOrderData) {
            toast.error("Order data not prepared. Please try again.");
            setIsOrderVerified(false);
            return;
        }

        if (paymentMethod === 'card') {
            const errors = {};
            errors.number = validateCardField('number', cardData.number);
            errors.expiry = validateCardField('expiry', cardData.expiry);
            errors.cvv = validateCardField('cvv', cardData.cvv);
            errors.name = validateCardField('name', cardData.name);

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

        setIsProcessing(true);
        setPaymentStatus('processing');
        setPaymentError('');

        try {
            // Process payment if card (using prepared data)
            if (preparedOrderData.paymentMethod === 'card' && preparedOrderData.cardData) {
                await processPayment();
            }

            const orderPayload = {
                address: preparedOrderData.address,
                paymentMethod: preparedOrderData.paymentMethod,
                deliveryTime: preparedOrderData.deliveryTime,
                deliveryInstructions: preparedOrderData.deliveryInstructions,
                appliedOffer: preparedOrderData.appliedOffer,
                discountAmount: preparedOrderData.discountAmount,
                paymentDetails: preparedOrderData.paymentDetails
            };

            const newOrder = await createOrder(preparedOrderData.cart, preparedOrderData.finalTotal, orderPayload);

            if (newOrder && (newOrder._id || newOrder.id)) {
                // Clear cart ONLY after successful order creation
                clearCart();
                setPreparedOrderData(null);
                setPaymentStatus('success');
                setSuccess(true);

                // Use custom id field (ORD-xxxxx) for tracking, not MongoDB _id
                const orderId = newOrder.id || newOrder._id;

                // Direct redirect to order tracking page (bypass /track intermediate page)
                router.push(`/order/${orderId}`);
            } else {
                throw new Error("Failed to generate order reference.");
            }

        } catch (error) {
            console.error(error);
            setPaymentStatus('error');
            setPaymentError(error.message || "Payment processing failed. Please try again.");
            setIsProcessing(false);
            // Reset OTP verification state to allow retry
            setIsOrderVerified(false);
            setPreparedOrderData(null);
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

    const finalTotal = parseFloat(cartTotal) + 350 - discountAmount;

    return (
        <div className='container mx-auto px-4 pt-24 pb-12 min-h-screen'>
            {/* Same header... */}
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
                {/* Left Column - Forms (Delivery, Time, Payment) - UNCHANGED structure logic, kept for context */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Delivery Details */}
                    <div className="bg-charcoalBlack rounded-2xl p-6 border border-cardBorder">
                        {/* ... (Existing Delivery UI) ... */}
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

                        {/* Add Address Form & List (Existing Logic) */}
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
                                        type="tel" placeholder="Phone Number *"
                                        value={newAddress.phone}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                            setNewAddress({ ...newAddress, phone: val });
                                        }}
                                        maxLength={10}
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

                        <div className="grid md:grid-cols-2 gap-4">
                            {user?.addresses && user.addresses.length > 0 ? (
                                user.addresses.map((addr) => (
                                    <div
                                        key={addr.id}
                                        onClick={() => setSelectedAddressId(addr.id)}
                                        className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all hover:shadow-lg group bg-softBlack ${selectedAddressId === addr.id ? 'border-primary bg-primary/5' : 'border-cardBorder hover:border-ashWhite/20'}`}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-full ${selectedAddressId === addr.id ? 'bg-primary text-white' : 'bg-charcoalBlack text-ashWhite/60'}`}>
                                                    {addr.label === 'Home' ? <Home className="w-5 h-5" /> : <Briefcase className="w-5 h-5" />}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-ashWhite text-lg leading-tight">{addr.label}</h4>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-1 pl-1">
                                            <p className="text-ashWhite font-medium leading-snug break-words pr-12">{addr.street}, {addr.area}</p>
                                            <p className="text-sm text-ashWhite/60 break-words">{addr.city}</p>
                                            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-dashed border-ashWhite/10">
                                                <span className="text-xs text-ashWhite/40 font-bold uppercase">Phone</span>
                                                <span className="text-sm text-primary font-mono break-all">{addr.phone}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); removeAddress(addr.id); }}
                                            className="absolute bottom-4 right-4 p-2 text-ashWhite/20 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                !isAddingAddress && <div className="md:col-span-2 text-center text-ashWhite/50">No addresses found.</div>
                            )}
                        </div>
                    </div>

                    {/* Instructions - Kept */}
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

                    {/* Delivery Time & Payment Blocks - Kept... (omitted for brevity in replacement but assumed present) */}
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

                    <div className="bg-charcoalBlack rounded-2xl p-6 border border-cardBorder">
                        {/* Payment Method UI (Existing) */}
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
                        {paymentMethod === 'card' && (
                            <CreditCardForm
                                cardData={cardData}
                                setCardData={setCardData}
                                errors={cardErrors}
                                touched={touched}
                                handleBlur={handleBlur}
                            />
                        )}
                        {paymentMethod === 'cash' && (
                            <div className="bg-softBlack/50 p-4 rounded-xl text-sm text-ashWhite/70 border border-white/5 flex items-center gap-3">
                                <span className="text-xl">ℹ️</span>
                                Email verification required for Cash on Delivery.
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
                                    <div className="w-20 h-20 bg-charcoalBlack rounded-xl flex items-center justify-center relative flex-shrink-0 border border-cardBorder">
                                        <Image src={item.image} alt={item.name} width={70} height={70} className="object-contain" />
                                        <span className="absolute top-1 right-1 w-6 h-6 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-softBlack shadow-lg z-10">
                                            {item.amount}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0 pr-2">
                                        <h4 className="text-sm font-bold text-ashWhite leading-snug break-words">{item.name}</h4>
                                        <p className="text-xs text-ashWhite/60 mt-1 leading-normal">{item.size}, {item.crust}</p>
                                    </div>
                                    <div className="text-sm font-bold text-secondary whitespace-nowrap self-start mt-2">
                                        Rs. {(item.price * item.amount).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Coupon Section */}
                        <div className="mb-6">
                            <label className="text-xs font-bold text-ashWhite/50 uppercase tracking-wider mb-2 block">Promo Code</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Enter Coupon Code"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                    disabled={!!appliedOffer}
                                    className="flex-1 bg-charcoalBlack border border-cardBorder rounded-xl px-4 py-2 text-ashWhite focus:border-primary outline-none disabled:opacity-50"
                                />
                                {appliedOffer ? (
                                    <button
                                        onClick={handleRemoveCoupon}
                                        className="bg-red-500/20 text-red-400 border border-red-500/30 px-4 rounded-xl font-bold hover:bg-red-500/30"
                                    >
                                        Remove
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleApplyCoupon}
                                        className="bg-ashWhite/10 text-ashWhite border border-cardBorder px-4 rounded-xl font-bold hover:bg-ashWhite/20"
                                    >
                                        Apply
                                    </button>
                                )}
                            </div>
                            {appliedOffer && (
                                <div className="mt-2 text-sm text-green-400 flex items-center gap-1">
                                    <CheckCircle className="w-4 h-4" />
                                    Coupon <span className="font-mono font-bold">{appliedOffer.code}</span> applied!
                                </div>
                            )}
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

                        {appliedOffer && (
                            <div className="flex justify-between items-center mb-6 text-green-400 font-bold">
                                <span>Discount</span>
                                <span>- Rs. {discountAmount.toLocaleString()}</span>
                            </div>
                        )}

                        <div className="border-t border-cardBorder mb-6"></div>
                        <div className="flex justify-between items-center mb-8 text-2xl font-bold text-ashWhite">
                            <span>Total</span>
                            <span>Rs. {finalTotal.toLocaleString()}</span>
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
                                    {paymentMethod === 'card' ? `Pay Rs. ${finalTotal.toLocaleString()}` : 'Place Order'}
                                </>
                            )}
                        </button>

                        {/* Support Card and errors... */}
                        <div className="mt-8">
                            <SupportCard />
                        </div>
                        {/* Payment Status Errors - Keep logic */}
                        {paymentStatus === 'error' && (
                            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl animate-in fade-in slide-in-from-top-2">
                                <h4 className="font-bold text-red-500">Transaction Failed</h4>
                                <p className="text-red-400 text-sm">{paymentError}</p>
                            </div>
                        )}

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
                onClose={() => {
                    setIsOTPModalOpen(false);
                    setOtpRequestInFlight(false);
                    setPreparedOrderData(null);
                }}
                email={user?.email}
                purpose="order_place"
                onVerify={() => {
                    setIsOrderVerified(true);
                    setIsOTPModalOpen(false);
                    setOtpRequestInFlight(false);
                    // Auto-continue order creation after OTP verification (no second click needed)
                    setTimeout(() => {
                        handlePlaceOrder();
                    }, 300);
                }}
            />
        </div >
    );
};

export default CheckoutPage;
