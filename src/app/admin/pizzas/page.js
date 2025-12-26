"use client";

import { useAdmin } from '../../context/AdminContext';
import { useState } from 'react';
import Image from 'next/image';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, X } from 'lucide-react';

import AdminCard from '../../components/admin/AdminCard';

export default function PizzasPage() {
    const { pizzas, addPizza, updatePizza, togglePizzaEnabled, deletePizza, toppings } = useAdmin();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPizza, setEditingPizza] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image: '/pizzas/pizza1.jpg',
        priceSm: 1200,
        priceMd: 1600,
        priceLg: 2200,
        category: 'Chicken', // Default
    });

    const categories = ['Chicken', 'Cheese', 'Veg', 'Spicy', 'Special'];
    const availableImages = Array.from({ length: 25 }, (_, i) => `/pizzas/pizza${i + 1}.jpg`);

    const openAddModal = () => {
        setEditingPizza(null);
        setFormData({
            name: '',
            description: '',
            image: '/pizzas/pizza1.jpg',
            priceSm: 1200,
            priceMd: 1600,
            priceLg: 2200,
            category: 'Chicken',
        });
        setIsModalOpen(true);
    };

    const openEditModal = (pizza) => {
        setEditingPizza(pizza);
        setFormData({
            name: pizza.name,
            description: pizza.description,
            image: pizza.image,
            priceSm: pizza.priceSm,
            priceMd: pizza.priceMd,
            priceLg: pizza.priceLg,
            category: pizza.category || 'Chicken',
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingPizza) {
            updatePizza(editingPizza.id, formData);
        } else {
            addPizza(formData);
        }
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Pizza Management</h1>
                    <p className="text-gray-400">Manage your pizza menu</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={openAddModal}
                        className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Add Pizza
                    </button>
                </div>
            </div>

            {/* Pizza Grid */}
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                {pizzas.map((pizza) => (
                    <AdminCard
                        key={pizza.id}
                        variant="orange"
                        className={`relative group overflow-hidden ${!pizza.enabled ? 'opacity-75' : ''}`}
                    >
                        <div className="relative h-48 -mx-6 -mt-6 mb-4 bg-gray-700">
                            <Image
                                src={pizza.image || '/pizzas/pizza1.jpg'}
                                alt={pizza.name}
                                fill
                                className={`object-cover ${!pizza.enabled ? 'grayscale' : ''}`}
                            />
                            {!pizza.enabled && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                                    <span className="text-red-400 font-bold border-2 border-red-400 px-4 py-1 rounded-lg transform -rotate-12">DISABLED</span>
                                </div>
                            )}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-12">
                                <h3 className="text-xl font-bold text-white capitalize shadow-black/50 drop-shadow-md">{pizza.name}</h3>
                                <span className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-md border border-white/10">
                                    {pizza.category}
                                </span>
                            </div>
                        </div>

                        <p className="text-gray-300 text-sm line-clamp-2 mb-4 h-10">{pizza.description}</p>

                        <div className="flex gap-2 mb-4 bg-black/20 p-2 rounded-lg justify-between">
                            <div className="flex flex-col items-center">
                                <span className="text-xs text-gray-400">Small</span>
                                <span className="text-white font-bold">Rs. {pizza.priceSm}</span>
                            </div>
                            <div className="flex flex-col items-center border-l border-white/10 pl-2">
                                <span className="text-xs text-gray-400">Medium</span>
                                <span className="text-white font-bold">Rs. {pizza.priceMd}</span>
                            </div>
                            <div className="flex flex-col items-center border-l border-white/10 pl-2">
                                <span className="text-xs text-gray-400">Large</span>
                                <span className="text-white font-bold">Rs. {pizza.priceLg}</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-white/10">
                            <button
                                onClick={() => togglePizzaEnabled(pizza.id)}
                                className={`flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${pizza.enabled ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'}`}
                            >
                                {pizza.enabled ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                                {pizza.enabled ? 'Enabled' : 'Disabled'}
                            </button>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => openEditModal(pizza)}
                                    className="p-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg transition-colors"
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => deletePizza(pizza.id)}
                                    className="p-2 bg-red-500/10 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </AdminCard>
                ))}
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
                    <div className="bg-gray-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-4 border-b border-gray-700">
                            <h2 className="text-xl font-semibold text-white">
                                {editingPizza ? 'Edit Pizza' : 'Add New Pizza'}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 text-gray-400 hover:text-white"
                            >
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
                                <label className="block text-gray-400 text-sm mb-1">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                    required
                                >
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white resize-none"
                                    rows="3"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm mb-1">Image</label>
                                <div className="flex items-center gap-4">
                                    <div className="relative w-20 h-20 bg-gray-700 rounded-lg overflow-hidden border border-gray-600 flex-shrink-0">
                                        <Image
                                            src={formData.image}
                                            alt="Preview"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <select
                                            value={formData.image}
                                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                        >
                                            {availableImages.map(img => (
                                                <option key={img} value={img}>{img.split('/').pop()}</option>
                                            ))}
                                        </select>
                                        <p className="text-xs text-gray-500 mt-1">Select from {availableImages.length} available presets</p>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-gray-400 text-sm mb-1">Small (Rs.)</label>
                                    <input
                                        type="number"
                                        step="1"
                                        value={formData.priceSm}
                                        onChange={(e) => setFormData({ ...formData, priceSm: parseFloat(e.target.value) })}
                                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-400 text-sm mb-1">Medium (Rs.)</label>
                                    <input
                                        type="number"
                                        step="1"
                                        value={formData.priceMd}
                                        onChange={(e) => setFormData({ ...formData, priceMd: parseFloat(e.target.value) })}
                                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-400 text-sm mb-1">Large (Rs.)</label>
                                    <input
                                        type="number"
                                        step="1"
                                        value={formData.priceLg}
                                        onChange={(e) => setFormData({ ...formData, priceLg: parseFloat(e.target.value) })}
                                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                        required
                                    />
                                </div>
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
                                    {editingPizza ? 'Update' : 'Add Pizza'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
