import React from 'react';
import Pizza from './Pizza';
import Image from 'next/image'; // Assuming Image component is from Next.js
import { ShoppingCart, Star } from 'lucide-react'; // Assuming lucide-react for icons
import { toast } from 'react-hot-toast'; // Assuming react-hot-toast for notifications
import { useState } from 'react'; // Assuming useState is needed

const PizzaGrid = ({ pizzas, addToCart }) => { // addToCart prop is now required
    const [selectedSize, setSelectedSize] = useState({});
    const [crust, setCrust] = useState({});
    const [selectedPizzaForCustomization, setSelectedPizzaForCustomization] = useState(null);
    const [customizationToppings, setCustomizationToppings] = useState([]);

    const handleSizeSelect = (pizzaId, size) => {
        setSelectedSize(prev => ({ ...prev, [pizzaId]: size }));
    };

    if (!pizzas || pizzas.length === 0) {
        return (
            <div className="text-center py-12">
                <h3 className="text-xl font-semibold text-ashWhite/60">No delicious pizzas found at the moment!</h3>
            </div>
        );
    }

    const handleAddToCart = (pizza) => {
        const size = selectedSize[pizza.id] || 'md';
        let price = 0;

        // Use pre-calculated prices from API if available
        if (pizza.prices && pizza.prices[size]) {
            price = pizza.prices[size].finalPrice;
        } else {
            // Fallback
            if (size === 'sm') price = pizza.priceSm;
            else if (size === 'md') price = pizza.priceMd;
            else if (size === 'lg') price = pizza.priceLg;
        }

        const crst = crust[pizza.id] || 'Thin';

        // Set for customization - open toppings dialog
        setSelectedPizzaForCustomization(pizza);
        setCustomizationToppings([]);
    };

    const confirmAddToCart = () => {
        if (!selectedPizzaForCustomization) return;

        const pizza = selectedPizzaForCustomization;
        const size = selectedSize[pizza.id] || 'md';
        let price = 0;

        // Use pre-calculated prices from API if available
        if (pizza.prices && pizza.prices[size]) {
            price = pizza.prices[size].finalPrice;
        } else {
            // Fallback
            if (size === 'sm') price = pizza.priceSm;
            else if (size === 'md') price = pizza.priceMd;
            else if (size === 'lg') price = pizza.priceLg;
        }

        const crst = crust[pizza.id] || 'Thin';

        addToCart(pizza.id, pizza.image, pizza.name, price, customizationToppings, size, crst, 1);
        toast.success(`Added ${pizza.name} to cart!`, {
            icon: '🍕',
            style: {
                borderRadius: '10px',
                background: '#333',
                color: '#fff',
            },
        });

        // Close modal
        setSelectedPizzaForCustomization(null);
        setCustomizationToppings([]);
    };

    return (
        <div id="menu" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 py-12">
            {pizzas.map((pizza) => (
                <div key={pizza.id} className="bg-softBlack rounded-3xl overflow-hidden border border-cardBorder hover:border-primary/50 transition-all duration-300 group hover:shadow-2xl hover:shadow-primary/10 flex flex-col h-full relative">

                    {/* Discount Badge */}
                    {((pizza.prices?.sm?.originalPrice > pizza.prices?.sm?.finalPrice) ||
                        (pizza.discount?.active && pizza.discount?.label)) && (
                            <div className="absolute top-4 right-4 z-20 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
                                {pizza.prices?.sm?.discountLabel || "SALE"}
                            </div>
                        )}

                    <div className="relative h-56 overflow-hidden">
                        <Image
                            src={pizza.image}
                            alt={pizza.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-softBlack via-transparent to-transparent opacity-80"></div>
                    </div>

                    <div className="p-5 flex flex-col flex-grow">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-xl font-bangers tracking-wide text-ashWhite group-hover:text-primary transition-colors line-clamp-1">{pizza.name}</h3>
                            <div className="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-sm border border-white/5">
                                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                <span className="text-xs font-bold text-ashWhite">{pizza.rating || 4.5}</span>
                            </div>
                        </div>

                        <p className="text-ashWhite/60 text-xs mb-4 line-clamp-2 h-8 font-medium">{pizza.description}</p>

                        {/* Size Selector */}
                        <div className="flex bg-black/20 p-1.5 rounded-xl justify-between mb-4 border border-white/5">
                            {['sm', 'md', 'lg'].map((size) => (
                                <button
                                    key={size}
                                    onClick={() => handleSizeSelect(pizza.id, size)}
                                    className={`flex flex-col items-center flex-1 py-1.5 rounded-lg transition-all ${(selectedSize[pizza.id] || 'md') === size
                                            ? 'bg-primary text-white shadow-lg'
                                            : 'text-ashWhite/40 hover:text-ashWhite hover:bg-white/5'
                                        }`}
                                >
                                    <span className="text-[10px] uppercase font-black tracking-wider mb-0.5">{size === 'sm' ? 'Small' : size === 'md' ? 'Medium' : 'Large'}</span>
                                    <div className="flex flex-col leading-none items-center">
                                        <span className="font-bold text-sm">
                                            Rs. {pizza.prices?.[size]?.finalPrice?.toLocaleString() ??
                                                (size === 'sm' ? pizza.priceSm : size === 'md' ? pizza.priceMd : pizza.priceLg)}
                                        </span>
                                        {pizza.prices?.[size]?.originalPrice > pizza.prices?.[size]?.finalPrice && (
                                            <span className="text-[9px] line-through opacity-70">
                                                Rs. {pizza.prices[size].originalPrice}
                                            </span>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Crust Selector skipped for brevity, keeping existing if present or simplified */}
                        <div className="mb-4">
                            <label className="text-[10px] text-ashWhite/40 font-bold uppercase tracking-wider mb-1.5 block ml-1">Select Crust</label>
                            <div className="flex gap-2">
                                {['Thin', 'Thick', 'Cheese Burst'].map((c) => (
                                    <button
                                        key={c}
                                        onClick={() => setCrust(prev => ({ ...prev, [pizza.id]: c }))}
                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${(crust[pizza.id] || 'Thin') === c
                                                ? 'bg-ashWhite text-black border-ashWhite'
                                                : 'bg-transparent text-ashWhite/40 border-ashWhite/10 hover:border-ashWhite/30'
                                            }`}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>


                        <div className="mt-auto">
                            <button
                                onClick={() => handleAddToCart(pizza)}
                                className="w-full bg-primary hover:bg-primaryHover text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 group-hover:translate-y-0 translate-y-0 md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100"
                            >
                                <ShoppingCart className="w-4 h-4" />
                                <span>Add to Cart</span>
                            </button>
                        </div>
                    </div>
                </div>
            ))}

            {/* Topping Customization Modal */}
            {selectedPizzaForCustomization && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-charcoalBlack border border-cardBorder rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                        <div className="sticky top-0 bg-charcoalBlack border-b border-cardBorder p-6 flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-ashWhite">Customize {selectedPizzaForCustomization.name}</h2>
                            <button onClick={() => setSelectedPizzaForCustomization(null)} className="text-ashWhite/60 hover:text-white">✕</button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Size Selection */}
                            <div>
                                <label className="text-sm font-bold text-ashWhite/60 uppercase tracking-wider mb-3 block">Select Size</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {['sm', 'md', 'lg'].map(size => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize({...selectedSize, [selectedPizzaForCustomization.id]: size})}
                                            className={`p-4 rounded-xl border transition-all ${(selectedSize[selectedPizzaForCustomization.id] || 'md') === size ? 'bg-primary border-primary text-white' : 'bg-softBlack border-cardBorder text-ashWhite/60'}`}
                                        >
                                            <div className="font-bold">{size === 'sm' ? 'Small' : size === 'md' ? 'Medium' : 'Large'}</div>
                                            <div className="text-xs">Rs. {selectedPizzaForCustomization.prices?.[size]?.finalPrice || (size === 'sm' ? selectedPizzaForCustomization.priceSm : size === 'md' ? selectedPizzaForCustomization.priceMd : selectedPizzaForCustomization.priceLg)}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Toppings Selection */}
                            {selectedPizzaForCustomization.toppings && selectedPizzaForCustomization.toppings.length > 0 && (
                                <div>
                                    <label className="text-sm font-bold text-ashWhite/60 uppercase tracking-wider mb-3 block">Add Toppings (Optional)</label>
                                    <div className="grid grid-cols-1 gap-2">
                                        {selectedPizzaForCustomization.toppings.map((t, i) => (
                                            <label key={i} className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${customizationToppings.find(ct => ct.id === t.id) ? 'bg-primary/10 border-primary' : 'bg-softBlack border-cardBorder'}`}>
                                                <input
                                                    type="checkbox"
                                                    checked={customizationToppings.find(ct => ct.id === t.id) ? true : false}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setCustomizationToppings([...customizationToppings, t]);
                                                        } else {
                                                            setCustomizationToppings(customizationToppings.filter(ct => ct.id !== t.id));
                                                        }
                                                    }}
                                                    className="mr-3"
                                                />
                                                <span className="flex-1 text-ashWhite">{t.name}</span>
                                                <span className="text-xs text-ashWhite/60">+ Rs. {t.price || 100}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setSelectedPizzaForCustomization(null)}
                                    className="flex-1 px-6 py-3 rounded-xl border border-cardBorder text-ashWhite hover:bg-softBlack transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmAddToCart}
                                    className="flex-1 px-6 py-3 rounded-xl bg-primary hover:bg-primaryHover text-white font-bold transition-all"
                                >
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PizzaGrid;
