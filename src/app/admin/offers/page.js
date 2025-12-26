'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Tag, Edit2, Trash2, CheckCircle, XCircle, Calendar, DollarSign, Percent, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '@/services/apiClient';

export default function OffersPage() {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingOffer, setEditingOffer] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        type: 'percent', // fixed, percent
        value: '',
        minOrderAmount: '',
        validFrom: new Date().toISOString().split('T')[0],
        validTo: '',
        usageLimitTotal: '',
        usageLimitPerUser: 1,
        active: true
    });

    useEffect(() => {
        fetchOffers();
    }, []);

    const fetchOffers = async () => {
        try {
            const response = await apiClient.get('/admin/offers');
            if (response.success) {
                setOffers(response.data);
            }
        } catch (error) {
            const errorMsg = error?.message || error?.data?.error || "Failed to load offers";
            toast.error(errorMsg);
            console.error('fetchOffers error:', errorMsg, error?.status);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.name || !formData.code || !formData.value) {
            toast.error("Please fill required fields (Name, Code, Value)");
            return;
        }

        try {
            const payload = {
                ...formData,
                value: parseFloat(formData.value),
                minOrderAmount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : 0,
                usageLimitTotal: formData.usageLimitTotal ? parseInt(formData.usageLimitTotal) : null,
                usageLimitPerUser: formData.usageLimitPerUser ? parseInt(formData.usageLimitPerUser) : 1,
            };

            if (editingOffer) {
                await apiClient.patch(`/admin/offers/${editingOffer._id}`, payload);
                toast.success("Offer updated successfully!");
            } else {
                await apiClient.post('/admin/offers', payload);
                toast.success("Offer created successfully!");
            }
            setShowModal(false);
            setEditingOffer(null);
            resetForm();
            fetchOffers();
        } catch (error) {
            toast.error(error.message || "Operation failed");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this offer?")) return;
        try {
            await apiClient.delete(`/admin/offers/${id}`);
            toast.success("Offer deleted");
            fetchOffers();
        } catch (error) {
            toast.error("Failed to delete offer");
        }
    };

    const handleToggleStatus = async (offer) => {
        try {
            await apiClient.patch(`/admin/offers/${offer._id}`, { active: !offer.active });
            toast.success(`Offer ${!offer.active ? 'Activated' : 'Deactivated'}`);
            fetchOffers();
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            code: '',
            type: 'percent',
            value: '',
            minOrderAmount: '',
            validFrom: new Date().toISOString().split('T')[0],
            validTo: '',
            usageLimitTotal: '',
            usageLimitPerUser: 1,
            active: true
        });
    };

    const openEdit = (offer) => {
        setEditingOffer(offer);
        setFormData({
            name: offer.name,
            code: offer.code,
            type: offer.type,
            value: offer.value,
            minOrderAmount: offer.minOrderAmount || '',
            validFrom: offer.validFrom ? new Date(offer.validFrom).toISOString().split('T')[0] : '',
            validTo: offer.validTo ? new Date(offer.validTo).toISOString().split('T')[0] : '',
            usageLimitTotal: offer.usageLimitTotal || '',
            usageLimitPerUser: offer.usageLimitPerUser || 1,
            active: offer.active
        });
        setShowModal(true);
    };

    const filteredOffers = offers.filter(offer =>
        offer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-ashWhite mb-2">Offers & Coupons</h1>
                    <p className="text-ashWhite/60">Manage distincts and promotional codes</p>
                </div>
                <button
                    onClick={() => { resetForm(); setEditingOffer(null); setShowModal(true); }}
                    className="flex items-center gap-2 bg-primary hover:bg-primaryHover text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/20"
                >
                    <Plus className="w-5 h-5" />
                    Create New Offer
                </button>
            </div>

            {/* Search */}
            <div className="relative mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ashWhite/40 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Search offers by name or code..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-charcoalBlack border border-cardBorder rounded-xl pl-12 pr-4 py-4 text-ashWhite focus:border-primary outline-none transition-all"
                />
            </div>

            {/* List */}
            {loading ? (
                <div className="text-center py-12 text-ashWhite/50">Loading offers...</div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredOffers.map(offer => (
                        <div key={offer._id} className={`bg-softBlack rounded-2xl border transition-all hover:shadow-lg group relative overflow-hidden ${offer.active ? 'border-cardBorder hover:border-primary/50' : 'border-red-500/20 opacity-75'}`}>
                            {/* Active Status Badge */}
                            <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${offer.active ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                {offer.active ? 'Active' : 'Inactive'}
                            </div>

                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-ashWhite mb-1 group-hover:text-primary transition-colors">{offer.name}</h3>
                                        <div className="flex items-center gap-2 cursor-pointer bg-charcoalBlack w-fit px-3 py-1.5 rounded-lg border border-dashed border-ashWhite/20 hover:border-primary/40 hover:text-primary transition-colors"
                                            onClick={() => { navigator.clipboard.writeText(offer.code); toast.success('Code copied!'); }}
                                        >
                                            <Tag className="w-4 h-4" />
                                            <span className="font-mono font-bold tracking-wide">{offer.code}</span>
                                            <Copy className="w-3 h-3 opacity-50" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-ashWhite/50">Discount</span>
                                        <span className="font-bold text-ashWhite text-lg">
                                            {offer.type === 'percent' ? `${offer.value}%` : `Rs. ${offer.value}`}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-ashWhite/50">Min. Order</span>
                                        <span className="text-ashWhite font-mono">Rs. {offer.minOrderAmount}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-ashWhite/50">Expiry</span>
                                        <span className="text-ashWhite">
                                            {offer.validTo ? new Date(offer.validTo).toLocaleDateString() : 'No Expiry'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                                    <button
                                        onClick={() => openEdit(offer)}
                                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-ashWhite text-sm font-bold transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" /> Edit
                                    </button>
                                    <button
                                        onClick={() => handleToggleStatus(offer)}
                                        className={`p-2 rounded-lg transition-colors ${offer.active ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'bg-green-500/10 text-green-500 hover:bg-green-500/20'}`}
                                        title={offer.active ? "Deactivate" : "Activate"}
                                    >
                                        {offer.active ? <XCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(offer._id)}
                                        className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-charcoalBlack border border-cardBorder rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95">
                        <div className="p-6 border-b border-white/5 flex justify-between items-center sticky top-0 bg-charcoalBlack z-10">
                            <h2 className="text-2xl font-bold text-ashWhite">
                                {editingOffer ? 'Edit Offer' : 'Create New Offer'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-ashWhite/40 hover:text-white">
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Basic Info */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-ashWhite/70">Offer Name *</label>
                                    <input
                                        type="text" placeholder="e.g. Summer Sale"
                                        value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-softBlack border border-cardBorder rounded-lg px-4 py-3 text-ashWhite focus:border-primary outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-ashWhite/70">Coupon Code *</label>
                                    <input
                                        type="text" placeholder="e.g. SUMMER25"
                                        value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        className="w-full bg-softBlack border border-cardBorder rounded-lg px-4 py-3 text-ashWhite focus:border-primary outline-none font-mono uppercase"
                                    />
                                </div>
                            </div>

                            {/* Discount Value */}
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-ashWhite/70">Type</label>
                                    <div className="flex bg-softBlack p-1 rounded-lg border border-cardBorder">
                                        <button
                                            onClick={() => setFormData({ ...formData, type: 'percent' })}
                                            className={`flex-1 py-2 rounded-md font-bold text-sm flex items-center justify-center gap-1 ${formData.type === 'percent' ? 'bg-primary text-white shadow-lg' : 'text-ashWhite/50'}`}
                                        >
                                            <Percent className="w-3 h-3" /> %
                                        </button>
                                        <button
                                            onClick={() => setFormData({ ...formData, type: 'fixed' })}
                                            className={`flex-1 py-2 rounded-md font-bold text-sm flex items-center justify-center gap-1 ${formData.type === 'fixed' ? 'bg-primary text-white shadow-lg' : 'text-ashWhite/50'}`}
                                        >
                                            <DollarSign className="w-3 h-3" /> Rs.
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-bold text-ashWhite/70">Value *</label>
                                    <input
                                        type="number" placeholder={formData.type === 'percent' ? "e.g. 15" : "e.g. 500"}
                                        value={formData.value} onChange={e => setFormData({ ...formData, value: e.target.value })}
                                        className="w-full bg-softBlack border border-cardBorder rounded-lg px-4 py-3 text-ashWhite focus:border-primary outline-none"
                                    />
                                </div>
                            </div>

                            {/* Limits */}
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-ashWhite/70">Min Order (Rs.)</label>
                                    <input
                                        type="number" placeholder="0"
                                        value={formData.minOrderAmount} onChange={e => setFormData({ ...formData, minOrderAmount: e.target.value })}
                                        className="w-full bg-softBlack border border-cardBorder rounded-lg px-4 py-3 text-ashWhite focus:border-primary outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-ashWhite/70">Total Uses (Empty=Ultd)</label>
                                    <input
                                        type="number" placeholder="Unlimited"
                                        value={formData.usageLimitTotal} onChange={e => setFormData({ ...formData, usageLimitTotal: e.target.value })}
                                        className="w-full bg-softBlack border border-cardBorder rounded-lg px-4 py-3 text-ashWhite focus:border-primary outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-ashWhite/70">Uses Per User</label>
                                    <input
                                        type="number" placeholder="1"
                                        value={formData.usageLimitPerUser} onChange={e => setFormData({ ...formData, usageLimitPerUser: e.target.value })}
                                        className="w-full bg-softBlack border border-cardBorder rounded-lg px-4 py-3 text-ashWhite focus:border-primary outline-none"
                                    />
                                </div>
                            </div>

                            {/* Dates */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-ashWhite/70">Valid From</label>
                                    <input
                                        type="date"
                                        value={formData.validFrom} onChange={e => setFormData({ ...formData, validFrom: e.target.value })}
                                        className="w-full bg-softBlack border border-cardBorder rounded-lg px-4 py-3 text-ashWhite focus:border-primary outline-none [color-scheme:dark]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-ashWhite/70">Valid To (Optional)</label>
                                    <input
                                        type="date"
                                        value={formData.validTo} onChange={e => setFormData({ ...formData, validTo: e.target.value })}
                                        className="w-full bg-softBlack border border-cardBorder rounded-lg px-4 py-3 text-ashWhite focus:border-primary outline-none [color-scheme:dark]"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/5 flex justify-end gap-4 bg-charcoalBlack sticky bottom-0 rounded-b-2xl">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-6 py-3 rounded-xl font-bold text-ashWhite/60 hover:text-white hover:bg-white/5 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="bg-primary hover:bg-primaryHover text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/20"
                            >
                                {editingOffer ? 'Save Changes' : 'Create Offer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
