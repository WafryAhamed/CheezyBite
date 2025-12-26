import React from 'react';
import { notFound } from 'next/navigation';
// import { getPizzas } from '../../../utils/pizzaStore';
import PizzaClient from './PizzaClient';
import { headers } from 'next/headers';

async function getData(id) {
    try {
        const headersList = await headers();
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

        const [pizzaRes, toppingsRes] = await Promise.all([
            fetch(`${baseUrl}/pizzas/${id}`, { cache: 'no-store', headers: headersList }),
            fetch(`${baseUrl}/toppings`, { cache: 'no-store', headers: headersList })
        ]);

        if (pizzaRes.status === 404) return null;
        if (!pizzaRes.ok || !toppingsRes.ok) throw new Error('Failed to fetch data');

        const pizzaData = await pizzaRes.json();
        const toppingsData = await toppingsRes.json();

        if (!pizzaData.success) return null;

        const pizza = pizzaData.data;
        const toppings = toppingsData.success ? toppingsData.data : [];
        const activeToppings = toppings.filter(t => t.enabled);

        // Inject toppings
        return {
            ...pizza,
            toppings: activeToppings
        };

    } catch (error) {
        console.error('Error fetching pizza data:', error);
        return null;
    }
}

export default async function PizzaPage({ params }) {
    const { id } = await params;
    const pizza = await getData(id);

    if (!pizza) {
        notFound();
    }

    return <PizzaClient pizza={pizza} />;
}
