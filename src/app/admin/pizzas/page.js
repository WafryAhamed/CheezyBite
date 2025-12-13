"use client";

import { useAdmin } from '../../context/AdminContext';
import { useState } from 'react';
import Image from 'next/image';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, X } from 'lucide-react';

export default function PizzasPage() {
    const { pizzas, addPizza, updatePizza, togglePizzaEnabled, deletePizza, toppings } = useAdmin();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPizza, setEditingPizza] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image: '/capricciosa.webp',
        priceSm: 9.99,
        priceMd: 10.99,
        priceLg: 11.99,
    });

    const availableImages = [
        '/capricciosa.webp', '/cheesy.webp', '/hawaii.webp', '/italian.webp',
        '/margherita.webp', '/pepperoni.webp', '/quattro-formaggi.webp',
        '/quattro-stagioni.webp', '/tonno.webp', '/vegetarian.webp'
    ];

    const openAddModal = () => {
        setEditingPizza(null);
        setFormData({
            name: '',
            description: '',
            image: '/capricciosa.webp',
            priceSm: 9.99,
            priceMd: 10.99,
            priceLg: 11.99,
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
                <button
                    onClick={openAddModal}
                    className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Pizza
                </button>
            </div>

            {/* Pizza Grid */}
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                {pizzas.map((pizza) => (
                    <div
                        key={pizza.id}
                        className={`bg-gray-800 rounded-xl border ${pizza.enabled ? 'border-gray-700' : 'border-red-500/30'} overflow-hidden`}
                    >
                        <div className="relative h-40 bg-gray-700">
                            <Image
                                src={pizza.image}
                                alt={pizza.name}
                                fill
                                className={`object-cover ${!pizza.enabled ? 'opacity-50' : ''}`}
                            />
                            {!pizza.enabled && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                    <span className="text-red-400 font-semibold">DISABLED</span>
                                </div>
                            )}
                        </div>
                        <div className="p-4">
                            <h3 className="text-white font-semibold capitalize">{pizza.name}</h3>
                            <p className="text-gray-400 text-sm line-clamp-2 mt-1">{pizza.description}</p>
                            <div className="flex gap-2 mt-2 text-sm">
                                <span className="text-gray-400">S: ${pizza.priceSm}</span>
                                <span className="text-gray-400">M: ${pizza.priceMd}</span>
                                <span className="text-gray-400">L: ${pizza.priceLg}</span>
                            </div>
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
                                <button
                                    onClick={() => togglePizzaEnabled(pizza.id)}
                                    className={`flex items-center gap-2 text-sm ${pizza.enabled ? 'text-green-400' : 'text-red-400'}`}
                                >
                                    {pizza.enabled ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                                    {pizza.enabled ? 'Enabled' : 'Disabled'}
                                </button>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => openEditModal(pizza)}
                                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => deletePizza(pizza.id)}
                                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
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
                                <select
                                    value={formData.image}
                                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                >
                                    {availableImages.map(img => (
                                        <option key={img} value={img}>{img.replace('/', '').replace('.webp', '')}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-gray-400 text-sm mb-1">Small $</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.priceSm}
                                        onChange={(e) => setFormData({ ...formData, priceSm: parseFloat(e.target.value) })}
                                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-400 text-sm mb-1">Medium $</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.priceMd}
                                        onChange={(e) => setFormData({ ...formData, priceMd: parseFloat(e.target.value) })}
                                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-400 text-sm mb-1">Large $</label>
                                    <input
                                        type="number"
                                        step="0.01"
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
