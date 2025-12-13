import React from 'react';
import MenuClient from './MenuClient';
import { getPizzas } from '../utils/pizzaStore';

export const metadata = {
    title: 'Menu | CheezyBite',
    description: 'Explore our delicious pizza menu.',
};

export default function MenuPage() {
    const pizzas = getPizzas();
    return <MenuClient initialPizzas={pizzas} />;
}
