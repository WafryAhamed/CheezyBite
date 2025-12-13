import React from 'react';
import Pizza from './Pizza';

const PizzaGrid = ({ pizzas }) => {
    if (!pizzas || pizzas.length === 0) {
        return (
            <div className="text-center py-12">
                <h3 className="text-xl font-semibold text-ashWhite/60">No delicious pizzas found at the moment!</h3>
            </div>
        );
    }

    return (
        <div id="menu" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 xl:gap-8 py-12">
            {pizzas.map((pizza) => (
                <Pizza key={pizza.id} pizza={pizza} />
            ))}
        </div>
    );
};

export default PizzaGrid;
