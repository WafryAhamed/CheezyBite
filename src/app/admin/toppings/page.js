"use client";

import { useAdmin } from '../../context/AdminContext';
import { useState } from 'react';
import { Plus, Pencil, ToggleLeft, ToggleRight, X, Flame, Leaf, Pizza, Drumstick, CircleDot, CheckCircle, Ban } from 'lucide-react';
import AdminCard from '../../components/admin/AdminCard';

export default function ToppingsPage() {
    const { toppings, updateTopping, toggleToppingEnabled, addTopping } = useAdmin();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTopping, setEditingTopping] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        type: 'veg', // replacing image with type for icon selection
        price: 2,
    });

    const toppingTypes = [
        { id: 'veg', name: 'Vegetable', icon: Leaf },
        { id: 'spicy', name: 'Spicy', icon: Flame },
        { id: 'cheese', name: 'Cheese', icon: Pizza }, // Fallback for Cheese
        { id: 'meat', name: 'Meat', icon: Drumstick },
        { id: 'other', name: 'Other', icon: CircleDot },
    ];

    // Helper to determine icon based on name/type
    const getToppingIcon = (name) => {
        const lower = name.toLowerCase();
        if (lower.includes('chicken') || lower.includes('beef') || lower.includes('meat') || lower.includes('sausage')) return Drumstick;
        if (lower.includes('pepper') || lower.includes('chilli') || lower.includes('jalapeno') || lower.includes('spicy')) return Flame;
        if (lower.includes('cheese') || lower.includes('paneer') || lower.includes('mozzarella')) return Pizza;
        if (lower.includes('corn') || lower.includes('tomato') || lower.includes('mushroom') || lower.includes('olive') || lower.includes('onion')) return Leaf;
        return CircleDot;
    };

    const openAddModal = () => {
        setEditingTopping(null);
        setFormData({ name: '', type: 'veg', price: 2 });
        setIsModalOpen(true);
    };

    const openEditModal = (topping) => {
        setEditingTopping(topping);
        setFormData({
            name: topping.name,
            type: 'veg', // Default, logic to auto-detect could be added
            price: topping.price,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Generate icon mapping metadata if needed, for now we infer from name dynamically
        if (editingTopping) {
            updateTopping(editingTopping.id, formData);
        } else {
            addTopping(formData);
        }
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Topping Management</h1>
                    <p className="text-gray-400">Manage pizza toppings and prices</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Topping
                </button>
            </div>

            {/* Toppings Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {toppings.map((topping) => {
                    const Icon = getToppingIcon(topping.name);
                    return (
                        <AdminCard
                            key={topping.id}
                            variant={topping.enabled ? 'green' : 'gray'}
                            className={`relative group transition-all duration-300 ${!topping.enabled ? 'opacity-75' : ''}`}
                        >
                            <div className="flex flex-col items-center text-center gap-3">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 ${topping.enabled ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
                                    <Icon className="w-8 h-8" />
                                </div>

                                <h3 className="text-lg font-bold text-white capitalize">{topping.name}</h3>
                                <p className="text-xl font-bold text-primary">Rs. {topping.price.toFixed(0)}</p>

                                {/* Actions */}
                                <div className="flex items-center gap-2 mt-4 w-full">
                                    <button
                                        onClick={() => toggleToppingEnabled(topping.id)}
                                        className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors ${topping.enabled
                                                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                                            }`}
                                    >
                                        {topping.enabled ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                                        {topping.enabled ? 'Available' : 'Disabled'}
                                    </button>
                                    <button
                                        onClick={() => openEditModal(topping)}
                                        className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </AdminCard>
                    );
                })}
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="bg-gray-800 rounded-xl w-full max-w-md border border-gray-700 shadow-2xl">
                        <div className="flex items-center justify-between p-4 border-b border-gray-700">
                            <h2 className="text-xl font-semibold text-white">
                                {editingTopping ? 'Edit Topping' : 'Add New Topping'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-4 space-y-4">
                            <div>
                                <label className="block text-gray-400 text-sm mb-1">Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary"
                                    required
                                    placeholder="e.g., Spicy Chicken"
                                />
                            </div>

                            {/* Icon preview based on name */}
                            <div className="flex items-center gap-2 p-3 bg-gray-700/50 rounded-lg">
                                <span className="text-sm text-gray-400">Icon Preview:</span>
                                {formData.name && (
                                    <div className="flex items-center gap-2 text-primary">
                                        {(() => {
                                            const Icon = getToppingIcon(formData.name);
                                            return <Icon className="w-5 h-5" />;
                                        })()}
                                        <span className="text-xs text-gray-500">(Auto-detected)</span>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-gray-400 text-sm mb-1">Price (Rs.)</label>
                                <input
                                    type="number"
                                    step="1"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary"
                                    required
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                                >
                                    {editingTopping ? 'Update' : 'Add Topping'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
