'use client';

import React, { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import PizzaDetails from '../../components/PizzaDetails';
import { getPizzas } from '../../utils/pizzaStore';

export default function PizzaPage({ params }) {
    const [pizza, setPizza] = useState(null);
    const [loading, setLoading] = useState(true);

    // Unwrap params using React.use() or access directly depending on Next.js version (assuming 15+ async params, but here safe to use effect or async component)
    // Since this is a client component ('use client'), we need to handle params carefully if they are promises in newer Next.js.
    // Ideally, pages should be server components, but PizzaDetails uses client hooks.
    // For simplicity relative to the existing codebase, we'll try to find the pizza synchronously if possible, or use an effect.

    // Actually, getPizzas is sync in this project.
    const id = params.id;

    useEffect(() => {
        const allPizzas = getPizzas();
        const foundPizza = allPizzas.find(p => p.id.toString() === id);
        if (foundPizza) {
            setPizza(foundPizza);
        }
        setLoading(false);
    }, [id]);

    if (!loading && !pizza) {
        return notFound();
    }

    if (loading || !pizza) {
        return (
            <div className="min-h-screen bg-jetBlack flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    // PizzaDetails expects { pizza, modal, setModal }
    // Since we are on a dedicated page, 'modal' state relates to closing it. 
    // We can pass dummy setModal or handle it to redirect back.

    // We'll wrap it in a container that mimics the modal style but full page
    return (
        <div className="min-h-screen bg-jetBlack pt-24 pb-12 px-4 flex items-center justify-center">
            <div className="bg-softBlack w-full max-w-[1000px] rounded-[30px] shadow-2xl overflow-hidden border border-cardBorder p-4 md:p-8 relative">
                <PizzaDetails pizza={pizza} modal={true} setModal={() => { }} />
            </div>
        </div>
    );
}
