import React, { useState, useEffect, useContext } from "react";
import Image from "next/image";
import SizeSelection from "./SizeSelection";
import CrustSelection from "./CrustSelection";
import Topping from "./Topping";
import { CartContext } from "../context/CartContext";
import { calculatePizzaPrice, getPriceBreakdown } from "../utils/priceEngine";
import { Star, Plus, Minus, Info } from 'lucide-react';
import toast from 'react-hot-toast';

const PizzaDetails = ({ pizza, setModal, cartItem = null }) => {
  const [size, setSize] = useState('medium'); // Default to Medium (Recommended)
  const [crust, setCrust] = useState('traditional');
  const [additionalTopping, setAdditionalTopping] = useState([]);
  const [price, setPrice] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [spiceLevel, setSpiceLevel] = useState('standard');
  const { addToCart, editCartItem } = useContext(CartContext);

  // Extras State (Drinks)
  const [selectedDrinks, setSelectedDrinks] = useState([]);

  // Mock Drinks Data (In real app, fetch from API)
  const drinksList = [
    { id: 'coke_500', name: 'Coca-Cola 500ml', price: 180, image: '/coke.png' },
    { id: 'sprite_500', name: 'Sprite 500ml', price: 180, image: '/sprite.png' },
  ];

  // Initialize from cartItem if in Edit Mode
  useEffect(() => {
    if (cartItem) {
      setSize(cartItem.size);
      setCrust(cartItem.crust);
      setAdditionalTopping(cartItem.additionalTopping || []);
      setQuantity(cartItem.amount);
    }
  }, [cartItem]);

  // Calculate Pizza Price
  useEffect(() => {
    const basePrice = pizza.priceSm; // Assuming priceSm is the base unit for calc
    const calculatedPrice = calculatePizzaPrice(basePrice, size, crust, additionalTopping);
    setPrice(calculatedPrice);
  }, [size, crust, additionalTopping, pizza.priceSm]);

  const handleDrinkToggle = (drink) => {
    if (selectedDrinks.find(d => d.id === drink.id)) {
      setSelectedDrinks(selectedDrinks.filter(d => d.id !== drink.id));
    } else {
      setSelectedDrinks([...selectedDrinks, drink]);
    }
  };

  // Calculate Total (Pizza * Qty + Drinks)
  const drinksTotal = selectedDrinks.reduce((sum, d) => sum + d.price, 0);
  const grandTotal = (price * quantity) + drinksTotal;

  const handleAction = () => {
    // 1. Add/Update Pizza
    if (cartItem) {
      editCartItem(cartItem.cartLineId, {
        price,
        additionalTopping,
        size,
        crust,
        amount: quantity
      });
    } else {
      addToCart(
        pizza.id,
        pizza.image,
        pizza.name,
        price,
        additionalTopping,
        size,
        crust,
        quantity
      );
    }

    // 2. Add Selected Drinks as separate items
    selectedDrinks.forEach(drink => {
      // Dummy adding logic - treating drinks as "Pizzas" for now or Generic Items
      // For this demo, we use a different ID construct
      addToCart(
        drink.id,
        drink.image || '/logo.png', // Fallback
        drink.name,
        drink.price,
        [], // no toppings
        'standard', // size
        'bottle',   // crust? type
        1 // qty
      );
    });

    if (selectedDrinks.length > 0) {
      toast.success(`Added ${selectedDrinks.length} drink(s) to cart`);
    }

    setModal(false);
  };

  const breakdown = getPriceBreakdown(pizza.priceSm, size, crust, additionalTopping);

  return (
    <div className="flex flex-col h-full bg-jetBlack lg:rounded-[30px] overflow-hidden">

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide pb-32">
        {/* Header Image */}
        <div className="relative w-full h-[250px] lg:h-[300px]">
          <Image
            src={pizza.image}
            alt={pizza.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-jetBlack via-transparent to-transparent" />
        </div>

        <div className="px-6 lg:px-12 -mt-12 relative z-10">
          <div className="flex justify-between items-start mb-2">
            <h1 className="text-3xl font-bold text-ashWhite capitalize">{pizza.name}</h1>
            <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1 border border-white/10">
              <Star className="w-4 h-4 text-warning fill-warning" />
              <span className="font-bold text-white">{pizza.rating || 4.5}</span>
              <span className="text-xs text-white/60">({pizza.ratingCount || 500}+)</span>
            </div>
          </div>
          <p className="text-ashWhite/60 mb-6 font-medium leading-relaxed max-w-2xl">{pizza.description}</p>

          <hr className="border-white/5 mb-8" />

          {/* Vertical Sections */}
          <div className="max-w-2xl">
            <SizeSelection pizza={pizza} size={size} setSize={setSize} />
            <CrustSelection crust={crust} setCrust={setCrust} />

            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-ashWhite/60 uppercase tracking-wider">Add Toppings (Optional)</h3>
                <span className="text-[10px] bg-white/10 px-2 py-1 rounded text-ashWhite/60">Max 5</span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {pizza.toppings?.map((t, i) => (
                  <Topping key={i} topping={t} additionalTopping={additionalTopping} setAdditionalTopping={setAdditionalTopping} />
                ))}
              </div>
              {additionalTopping.length > 3 && (
                <div className="mt-3 text-xs text-secondary flex items-center gap-2">
                  <Info className="w-3 h-3" />
                  First 3 toppings are free! Chargeable: {additionalTopping.length - 3}
                </div>
              )}
            </div>

            {/* Extras / Upsell */}
            <div className="mb-8">
              <h3 className="text-sm font-bold text-ashWhite/60 uppercase tracking-wider mb-4">Complete your meal</h3>
              <div className="space-y-3">
                {drinksList.map(drink => {
                  const isSelected = selectedDrinks.some(d => d.id === drink.id);
                  return (
                    <label key={drink.id} className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${isSelected ? 'bg-softBlack border-primary' : 'bg-transparent border-white/5 hover:bg-white/5'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center ${isSelected ? 'bg-primary border-primary' : 'border-white/30'}`}>
                          {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <span className="text-ashWhite font-medium">{drink.name}</span>
                      </div>
                      <span className="text-sm text-ashWhite/60">+ LKR {drink.price}</span>
                      <input type="checkbox" className="hidden" onChange={() => handleDrinkToggle(drink)} checked={isSelected} />
                    </label>
                  )
                })}
              </div>
            </div>

            {/* Quantity */}
            <div className="flex justify-center mb-8">
              <div className="flex items-center bg-softBlack border border-cardBorder rounded-full p-2 gap-6">
                <button onClick={() => quantity > 1 && setQuantity(q => q - 1)} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-ashWhite">
                  <Minus className="w-5 h-5" />
                </button>
                <span className="text-xl font-bold text-ashWhite w-8 text-center">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-ashWhite">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="bg-softBlack p-6 rounded-2xl border border-cardBorder mb-6">
              <h3 className="text-ashWhite font-bold mb-4 border-b border-white/5 pb-2">Price Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-ashWhite/60">
                  <span>Base Price ({size})</span>
                  <span>LKR {breakdown.basePrice}</span>
                </div>
                {breakdown.crustPrice > 0 && (
                  <div className="flex justify-between text-ashWhite/60">
                    <span>Crust Upgrade ({crust})</span>
                    <span>+ LKR {breakdown.crustPrice}</span>
                  </div>
                )}
                {breakdown.toppingPrice > 0 && (
                  <div className="flex justify-between text-ashWhite/60">
                    <span>Extra Toppings</span>
                    <span>+ LKR {breakdown.toppingPrice}</span>
                  </div>
                )}
                {drinksTotal > 0 && (
                  <div className="flex justify-between text-secondary">
                    <span>Extras (Drinks)</span>
                    <span>+ LKR {drinksTotal}</span>
                  </div>
                )}
              </div>
              <div className="flex justify-between text-xl font-bold text-ashWhite mt-4 pt-4 border-t border-white/5">
                <span>Total</span>
                <span>LKR {grandTotal.toLocaleString()}</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-jetBlack/90 backdrop-blur-lg border-t border-cardBorder z-50">
        <button
          onClick={handleAction}
          className="w-full btn btn-lg gradient flex justify-between items-center px-8 py-4 rounded-xl shadow-lg hover:translate-y-[-2px] transition-transform"
        >
          <span className="font-bold text-lg">{cartItem ? 'Update Order' : 'Add to Cart'}</span>
          <span className="font-bold text-xl bg-black/20 px-3 py-1 rounded-lg">LKR {grandTotal.toLocaleString()}</span>
        </button>
      </div>
    </div>
  )
};

// Simple Icon Import Fix
function Check({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 6 9 17 4 12"></polyline></svg>
  )
}

export default PizzaDetails;
