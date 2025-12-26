'use client';

import React, { useState, useEffect } from 'react';
import { User, MapPin, Package, Heart, LogOut, Edit2, Save, Phone, Home, RotateCw, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useUser } from '../../context/UserContext';
import { useCart } from '../../context/CartContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import OTPModal from '../../components/OTPModal';
import { formatDate, formatTime, formatOrderTimestamp } from '@/utils/dateFormatter';

export default function ProfilePage() {
    const { user, logout, updateUser } = useUser();
    const { addToCart } = useCart();
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(true);

    // Form State
    const [formData, setFormData] = useState({
        phone: '',
        address: ''
    });
    const [phoneError, setPhoneError] = useState('');
    const [addressError, setAddressError] = useState('');

    const [isOTPModalOpen, setIsOTPModalOpen] = useState(false);

    useEffect(() => {
        if (!user) {
            // router.push('/'); 
        } else {
            setFormData({
                phone: user.phone || '',
                address: user.address || ''
            });

            // Fetch real orders from backend API
            const fetchOrders = async () => {
                try {
                    setOrdersLoading(true);
                    const { default: api } = await import('@/services/apiClient');
                    const response = await api.get('/orders');
                    if (response.success && Array.isArray(response.data)) {
                        // API already returns orders sorted by newest first (createdAt: -1)
                        setOrders(response.data);
                    } else {
                        setOrders([]);
                    }
                } catch (error) {
                    // Silently fail - user might not be authenticated or no orders
                    setOrders([]);
                } finally {
                    setOrdersLoading(false);
                }
            };

            fetchOrders();
        }
    }, [user]);

    const handleSaveRequest = () => {
        // Clear previous errors
        setPhoneError('');
        setAddressError('');

        // Validate both fields
        let hasErrors = false;

        if (!isPhoneValid()) {
            setPhoneError('Phone must be 10 digits starting with 07');
            hasErrors = true;
        }

        if (!isAddressValid()) {
            setAddressError('Address must be at least 10 characters');
            hasErrors = true;
        }

        if (hasErrors) return;

        // Open OTP Modal for verification
        setIsOTPModalOpen(true);
    };

    const isPhoneValid = () => {
        const phoneRegex = /^07[0-9]{8}$/;
        return phoneRegex.test(formData.phone);
    };

    const isAddressValid = () => {
        return formData.address.trim().length >= 10;
    };

    const handlePhoneChange = (e) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
        setFormData({ ...formData, phone: val });
        
        // Real-time validation feedback
        if (val.length === 0) {
            setPhoneError('');
        } else if (val.length < 10) {
            setPhoneError(`${10 - val.length} more digit${10 - val.length > 1 ? 's' : ''} needed`);
        } else if (!val.startsWith('07')) {
            setPhoneError('Must start with 07');
        } else {
            setPhoneError('');
        }
    };

    const handleAddressChange = (e) => {
        const val = e.target.value;
        setFormData({ ...formData, address: val });
        
        // Real-time validation feedback
        if (val.trim().length === 0) {
            setAddressError('');
        } else if (val.trim().length < 10) {
            setAddressError(`Minimum 10 characters (${val.trim().length}/10)`);
        } else {
            setAddressError('');
        }
    };

    const formatPhoneDisplay = (phone) => {
        if (!phone) return '';
        // Format: 07 XXXX XXXX
        return `${phone.slice(0, 2)} ${phone.slice(2, 6)} ${phone.slice(6)}`;
    };

    const handleFinalSave = () => {
        updateUser({
            phone: formData.phone,
            address: formData.address
        });
        setIsEditing(false);
        setIsOTPModalOpen(false);
        // Toast handled by context
    };

    const handleReorder = (order) => {
        order.items.forEach(item => {
            addToCart(
                item.id,
                item.image,
                item.name,
                item.price,
                item.additionalTopping,
                item.size,
                item.crust,
                item.amount
            );
        });
        toast.success("Order items added to cart!", { icon: '🛒' });
        router.push('/cart');
    };

    if (!user) {
        return (
            <div className="container mx-auto px-4 pt-48 pb-12 min-h-screen text-center">
                <h1 className="text-2xl font-bold text-ashWhite mb-4">Please log in to view your profile</h1>
                <Link href="/" className="text-primary hover:underline">Return Home</Link>
            </div>
        );
    }

    return (
        <div className='container mx-auto px-4 pt-24 pb-12 min-h-screen'>
            <div className="grid lg:grid-cols-4 gap-8">

                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-charcoalBlack rounded-2xl p-6 border border-cardBorder shadow-xl sticky top-24">
                        <div className="flex flex-col items-center mb-6">
                            <div className="w-24 h-24 bg-softBlack rounded-full flex items-center justify-center border-2 border-primary mb-4 overflow-hidden relative">
                                {user.photo ? (
                                    <Image src={user.photo} fill alt="Profile" className="object-cover" />
                                ) : (
                                    <User className="text-ashWhite w-10 h-10" />
                                )}
                            </div>
                            <h2 className="text-xl font-bold text-ashWhite">{user.name}</h2>
                            <p className="text-ashWhite/60 text-sm">{user.email}</p>
                            {user.provider === 'google' && (
                                <span className="mt-2 text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20">
                                    Google Account
                                </span>
                            )}
                        </div>

                        <nav className="space-y-2">
                            <button className="w-full flex items-center gap-3 px-4 py-3 bg-primary/10 text-primary rounded-xl font-medium border border-primary/20">
                                <User className="w-5 h-5" />
                                My Profile
                            </button>
                            {/* ... other links ... */}
                        </nav>

                        <div className="border-t border-cardBorder my-6"></div>
                        <button onClick={() => { logout(); router.push('/'); }} className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors w-full">
                            <LogOut className="w-5 h-5" />
                            Log Out
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3 space-y-6">

                    {/* Delivery Profile Card */}
                    <div className="bg-softBlack rounded-2xl p-6 border border-cardBorder shadow-md">
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-2xl font-bold text-ashWhite">Delivery Details</h1>
                            <button
                                onClick={() => isEditing ? handleSaveRequest() : setIsEditing(true)}
                                disabled={isEditing && (!isPhoneValid() || !isAddressValid())}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                                    isEditing 
                                        ? (!isPhoneValid() || !isAddressValid())
                                            ? 'bg-gray-500 text-gray-300 cursor-not-allowed opacity-50'
                                            : 'bg-primary text-white hover:bg-primaryHover'
                                        : 'bg-white/10 text-ashWhite hover:bg-white/20'
                                }`}
                            >
                                {isEditing ? <><Save className="w-4 h-4" /> Save Changes</> : <><Edit2 className="w-4 h-4" /> Edit Details</>}
                            </button>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Phone */}
                            <div className="space-y-2">
                                <label className="text-sm text-ashWhite/60 flex items-center gap-2">
                                    <Phone className="w-4 h-4" /> Phone Number <span className="text-red-500">*</span>
                                </label>
                                {isEditing ? (
                                    <div className="space-y-2">
                                        <div className="relative">
                                            <input
                                                type="tel"
                                                inputMode="numeric"
                                                value={formData.phone}
                                                onChange={handlePhoneChange}
                                                maxLength={10}
                                                placeholder="0712345678"
                                                className={`w-full bg-charcoalBlack border rounded-lg px-4 py-3 text-ashWhite focus:outline-none text-lg tracking-wider transition-all ${
                                                    phoneError
                                                        ? 'border-red-500/50 focus:border-red-500'
                                                        : formData.phone && isPhoneValid()
                                                        ? 'border-green-500/50 focus:border-green-500'
                                                        : 'border-cardBorder focus:border-primary'
                                                }`}
                                            />
                                            {formData.phone && (
                                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs font-mono text-ashWhite/50">
                                                    {formatPhoneDisplay(formData.phone)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-start gap-2">
                                            {phoneError ? (
                                                <p className="text-xs text-red-400 flex items-start gap-1">
                                                    <span className="mt-0.5">⚠</span> {phoneError}
                                                </p>
                                            ) : formData.phone && isPhoneValid() ? (
                                                <p className="text-xs text-green-400 flex items-start gap-1">
                                                    <CheckCircle className="w-3 h-3 mt-0.5" /> Valid phone number
                                                </p>
                                            ) : (
                                                <p className="text-xs text-ashWhite/50">Format: 07XXXXXXXX (10 digits starting with 07)</p>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-3 bg-charcoalBlack rounded-lg border border-white/5 text-ashWhite font-medium min-h-[50px] flex items-center text-lg tracking-wide">
                                        {user.phone ? formatPhoneDisplay(user.phone) : <span className="text-ashWhite/30 italic">Not set</span>}
                                    </div>
                                )}
                            </div>

                            {/* Address */}
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm text-ashWhite/60 flex items-center gap-2">
                                    <Home className="w-4 h-4" /> Delivery Address <span className="text-red-500">*</span>
                                </label>
                                {isEditing ? (
                                    <div className="space-y-2">
                                        <textarea
                                            value={formData.address}
                                            onChange={handleAddressChange}
                                            placeholder="Enter your complete address: Street name and number, Building name, City, Postal code"
                                            className={`w-full bg-charcoalBlack border rounded-lg px-4 py-3 text-ashWhite focus:outline-none min-h-[100px] transition-all resize-none ${
                                                addressError
                                                    ? 'border-red-500/50 focus:border-red-500'
                                                    : formData.address && isAddressValid()
                                                    ? 'border-green-500/50 focus:border-green-500'
                                                    : 'border-cardBorder focus:border-primary'
                                            }`}
                                        />
                                        <div className="flex items-center justify-between">
                                            <div>
                                                {addressError ? (
                                                    <p className="text-xs text-red-400 flex items-start gap-1">
                                                        <span>⚠</span> {addressError}
                                                    </p>
                                                ) : formData.address && isAddressValid() ? (
                                                    <p className="text-xs text-green-400 flex items-start gap-1">
                                                        <CheckCircle className="w-3 h-3 mt-0.5" /> Address looks complete
                                                    </p>
                                                ) : (
                                                    <p className="text-xs text-ashWhite/50">Include street, building, city, and postal code</p>
                                                )}
                                            </div>
                                            <span className="text-xs text-ashWhite/40">{formData.address.trim().length}/10</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-3 bg-charcoalBlack rounded-lg border border-white/5 text-ashWhite font-medium min-h-[100px] whitespace-pre-wrap">
                                        {user.address || <span className="text-ashWhite/30 italic">Not set</span>}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-ashWhite pt-4">Recent Orders</h2>

                    {orders.length > 0 ? (
                        <div className="space-y-4">
                            {orders.map((order) => (
                                <div key={order.id} className="bg-softBlack rounded-2xl p-6 border border-cardBorder hover:border-primary/30 transition-all group">
                                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className="font-bold text-ashWhite text-lg">Order #{order.id}</span>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${order.currentStage >= 4 ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
                                                    {order.currentStage >= 4 ? 'Delivered' : 'In Progress'}
                                                </span>
                                            </div>
                                            <p className="text-ashWhite/40 text-xs flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {formatDate(order.createdAt)} • {formatTime(order.createdAt)}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <div className="text-ashWhite font-bold">Rs. {order.total.toLocaleString()}</div>
                                                <div className="text-xs text-ashWhite/40">{order.items.length} items</div>
                                            </div>
                                            <button
                                                onClick={() => handleReorder(order)}
                                                className="bg-white/5 hover:bg-primary hover:text-white text-ashWhite/60 p-3 rounded-xl transition-all border border-white/5 group-hover:border-primary/30"
                                                title="Re-order"
                                            >
                                                <RotateCw className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Items Preview (First 2) */}
                                    <div className="space-y-2 border-t border-white/5 pt-4">
                                        {order.items.slice(0, 2).map((item, idx) => (
                                            <div key={idx} className="flex items-center justify-between text-sm text-ashWhite/70">
                                                <span className="flex items-center gap-2">
                                                    <span className="w-1 h-1 rounded-full bg-primary"></span>
                                                    {item.amount}x {item.name} <span className="text-white/30 text-xs">({item.size})</span>
                                                </span>
                                            </div>
                                        ))}
                                        {order.items.length > 2 && (
                                            <p className="text-xs text-ashWhite/30 pl-3">+ {order.items.length - 2} more items...</p>
                                        )}
                                    </div>

                                    {/* Link to Tracking */}
                                    <div className="mt-4 pt-4 border-t border-white/5 flex justify-end">
                                        {order.currentStage < 4 && (
                                            <Link href={`/order/${order.id}`} className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
                                                Track Order <Package className="w-3 h-3" />
                                            </Link>
                                        )}
                                        {order.currentStage >= 4 && order.feedback && (
                                            <div className="text-xs text-yellow-500 flex items-center gap-1">
                                                ★ Rated {order.feedback.rating}/5
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-softBlack rounded-2xl p-8 border border-cardBorder text-center">
                            <Package className="w-12 h-12 text-ashWhite/20 mx-auto mb-4" />
                            <h3 className="text-ashWhite font-bold">No orders yet</h3>
                            <p className="text-ashWhite/50 text-sm mt-1">Simulate an order to see it here!</p>
                        </div>
                    )}

                </div>
            </div>

            <OTPModal
                isOpen={isOTPModalOpen}
                onClose={() => setIsOTPModalOpen(false)}
                email={user?.email}
                purpose="profile_update"
                onVerify={handleFinalSave}
            />
        </div>
    );
}
