"use client";

import { useAdmin } from '../../context/AdminContext';
import { useState } from 'react';
import Image from 'next/image';
import { Plus, Pencil, ToggleLeft, ToggleRight, X, DollarSign } from 'lucide-react';

export default function ToppingsPage() {
    const { toppings, updateTopping, toggleToppingEnabled, addTopping } = useAdmin();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTopping, setEditingTopping] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        image: '/cherry.png',
        price: 2,
    });

    const availableImages = [
        '/cherry.png', '/corn.png', '/fresh-tomatoes.png', '/jalapeno.png',
        '/parmesan.png', '/mozzarella.png', '/mushrooms.png', '/olives.png'
    ];

    const openAddModal = () => {
        setEditingTopping(null);
        setFormData({ name: '', image: '/cherry.png', price: 2 });
        setIsModalOpen(true);
    };

    const openEditModal = (topping) => {
        setEditingTopping(topping);
        setFormData({
            name: topping.name,
            image: topping.image,
            price: topping.price,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
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

            {/* Toppings Table */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-700/50">
                        <tr>
                            <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Topping</th>
                            <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Price</th>
                            <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Status</th>
                            <th className="text-right text-gray-400 text-sm font-medium px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {toppings.map((topping) => (
                            <tr key={topping.id} className={`${!topping.enabled ? 'opacity-50' : ''}`}>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 relative rounded-lg overflow-hidden bg-gray-700">
                                            <Image src={topping.image} alt={topping.name} fill className="object-cover" />
                                        </div>
                                        <span className="text-white capitalize">{topping.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-green-400 font-medium">${topping.price.toFixed(2)}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => toggleToppingEnabled(topping.id)}
                                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${topping.enabled
                                            ? 'bg-green-500/20 text-green-400'
                                            : 'bg-red-500/20 text-red-400'
                                            }`}
                                    >
                                        {topping.enabled ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                                        {topping.enabled ? 'Active' : 'Disabled'}
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => openEditModal(topping)}
                                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
                    <div className="bg-gray-800 rounded-xl w-full max-w-md">
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
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm mb-1">Image</label>
                                <select
                                    value={formData.image}
                                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                >
                                    {availableImages.map(img => (
                                        <option key={img} value={img}>{img.replace('/', '').replace('.png', '')}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm mb-1">Price ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
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
