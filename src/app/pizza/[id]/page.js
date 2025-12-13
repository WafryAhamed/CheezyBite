import React from 'react';
import { notFound } from 'next/navigation';
import { getPizzas } from '../../utils/pizzaStore';
import PizzaClient from './PizzaClient';

export default async function PizzaPage({ params }) {
    // In Next.js 15+, params is a Promise. We need to await it.
    // However, if we assume 14 or older or standard behavior where it might be async in future context:
    // Safer to treat params as potentially async or use it directly if guaranteed.
    // Given the project setup, let's look at how it accessed it before: params.id directly.
    // We'll trust Next.js will resolve it or it's an object. 
    // BUT for safety in newer versions, we can just access it.

    // NOTE: 'params' prop in App Router pages is an object in many versions, 
    // but in latest Next.js 15 canary it's a promise. 
    // I'll try to access it directly as likely it's Next 14/13. 
    // Update: If it fails, we wrap in await `params`.

    const { id } = await params;

    const allPizzas = getPizzas();
    const pizza = allPizzas.find(p => p.id.toString() === id);

    if (!pizza) {
        notFound();
    }

    return <PizzaClient pizza={pizza} />;
}
