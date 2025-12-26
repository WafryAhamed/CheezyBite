"use client";

import React, { useContext, useEffect, useState } from 'react';
import Modal from 'react-modal';
import { X } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import PizzaDetails from './PizzaDetails';
// import { getPizzas } from '../utils/pizzaStore';
import api from '@/services/apiClient';

const modalStyles = {
    overlay: {
        backgroundColor: 'rgba(0,0,0,0.7)',
        zIndex: 50,
    }
};

const GlobalEditModal = () => {
    const { editingItem, setEditingItem } = useContext(CartContext);
    const [fullPizza, setFullPizza] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchPizzaDetails = async () => {
            if (!editingItem) return;

            setLoading(true);
            try {
                // Fetch Pizza and Toppings
                const [pizzaRes, toppingsRes] = await Promise.all([
                    api.get(`/pizzas/${editingItem.id}`),
                    api.get('/toppings') // We need all toppings for customization
                ]);

                if (pizzaRes.success && toppingsRes.success) {
                    const activeToppings = toppingsRes.data.filter(t => t.enabled);
                    const pizza = {
                        ...pizzaRes.data,
                        toppings: activeToppings
                    };
                    setFullPizza(pizza);
                } else {
                    console.error("Failed to load pizza details");
                    setFullPizza(null);
                }
            } catch (error) {
                console.error("Error fetching pizza for edit:", error);
            } finally {
                setLoading(false);
            }
        };

        if (editingItem) {
            fetchPizzaDetails();
        } else {
            setFullPizza(null);
        }
    }, [editingItem]);

    const closeModal = () => {
        setEditingItem(null);
    };

    if (!editingItem) return null;
    if (loading || !fullPizza) return null; // Or show a loader

    return (
        <Modal
            isOpen={!!editingItem}
            style={modalStyles}
            onRequestClose={closeModal}
            contentLabel="Edit Item Modal"
            className="bg-softBlack w-full h-full lg:max-w-[1000px] lg:max-h-[85vh] lg:rounded-[30px] lg:fixed lg:top-[50%] lg:left-[50%] lg:translate-x-[-50%] lg:translate-y-[-50%] outline-none shadow-2xl overflow-hidden border border-cardBorder animate-in fade-in zoom-in-95 duration-200"
            ariaHideApp={false} // Avoid warning if not set to root
        >
            <div
                onClick={closeModal}
                className="absolute z-50 right-4 top-4 hover:scale-110 duration-200 cursor-pointer bg-black/50 backdrop-blur-md rounded-full p-2 text-white hover:bg-primary transition-colors shadow-lg border border-white/10"
            >
                <X className="w-6 h-6" />
            </div>

            {/* Pass editingItem to PizzaDetails to enable Edit Mode */}
            <PizzaDetails
                pizza={fullPizza}
                setModal={closeModal}
                cartItem={editingItem}
            />
        </Modal>
    );
};

export default GlobalEditModal;
