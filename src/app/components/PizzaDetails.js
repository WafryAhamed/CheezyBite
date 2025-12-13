import React, { useState, useEffect, useContext } from "react";
import Image from "next/image";
import SizeSelection from "./SizeSelection";
import CrustSelection from "./CrustSelection";
import Topping from "./Topping";
import { CartContext } from "../context/CartContext";
import { calculatePizzaPrice } from "../utils/priceEngine";

const PizzaDetails = ({ pizza, setModal }) => {
  const [size, setSize] = useState('small');
  const [crust, setCrust] = useState('traditional');
  const [additionalTopping, setAdditionalTopping] = useState([]);
  const [price, setPrice] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [spiceLevel, setSpiceLevel] = useState('standard');
  const { addToCart } = useContext(CartContext);

  // Calculate price using smart price engine
  useEffect(() => {
    // Use the base price for small (default)
    const basePrice = pizza.priceSm;

    // Calculate final price with size, crust, and toppings
    const calculatedPrice = calculatePizzaPrice(
      basePrice,
      size,
      crust,
      additionalTopping
    );

    setPrice(calculatedPrice);
  }, [size, crust, additionalTopping, pizza.priceSm]);

  const handleDecrease = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleIncrease = () => {
    setQuantity(quantity + 1);
  };

  return (
    <div className="flex flex-col lg:flex-row lg:gap-x-8 h-full md:p-8">
      <div className="lg:flex-1 flex justify-center items-center">
        <div className="max-w-[300px] lg:max-w-none mt-6 lg:mt-0">
          <Image width={450} height={450} src={pizza.image} alt='' priority={1} className="mx-auto relative" />
        </div>
      </div>

      <div className="flex flex-col flex-1">
        <div className="flex-1 p-2 text-center lg:text-left">
          <div className="flex-1 overflow-y-scroll h-[46vh] scrollbar-thin scrollbar-thumb-primary scrollbar-track-charcoalBlack pr-2">
            <div className="font-semibold">
              <h2 className="capitalize text-3xl mb-1 text-ashWhite">{pizza.name}</h2>
              <div className="mb-6 text-lg font-medium text-ashWhite/80">
                <span>{size === 'small' ? '25 cm' : size === 'medium' ? '30 cm' : size === 'large' ? '35 cm' : null}</span>
                <span>, {crust} crust</span>
              </div>
            </div>

            <SizeSelection pizza={pizza} size={size} setSize={setSize} />
            <CrustSelection crust={crust} setCrust={setCrust} />

            {/* Spice Level */}
            <div className="mb-4 text-xl font-semibold text-ashWhite">Spice Level</div>
            <div className="flex justify-center lg:justify-start gap-4 mb-6">
              {['standard', 'mild', 'medium', 'hot'].map((level) => (
                <button
                  key={level}
                  onClick={() => setSpiceLevel(level)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${spiceLevel === level
                      ? 'bg-primary text-white border-2 border-primary'
                      : 'bg-softBlack text-ashWhite/60 border-2 border-cardBorder hover:border-ashWhite/40'
                    }`}
                >
                  {level}
                </button>
              ))}
            </div>

            <div className="mb-4 text-xl font-semibold text-ashWhite">Choose topping</div>
            <div className="flex flex-1 flex-wrap gap-2 py-1 justify-center lg:justify-start">
              {pizza.toppings?.map((topping, index) => {
                return <Topping topping={topping} additionalTopping={additionalTopping} setAdditionalTopping={setAdditionalTopping} key={index} />;
              })}
            </div>

            {/* Pricing Info - Show when extra toppings are added */}
            {additionalTopping.length > 3 && (
              <div className="mt-4 p-3 bg-secondary/10 border border-secondary/20 rounded-lg text-sm">
                <p className="text-secondary">
                  🍕 First 3 toppings free • {additionalTopping.length - 3} extra topping{additionalTopping.length > 4 ? 's' : ''} (+Rs. {((additionalTopping.length - 3) * 150).toLocaleString()})
                </p>
              </div>
            )}
          </div>
        </div>

        {/* CTA Bar with Quantity */}
        <div className="h-full flex flex-col gap-4 items-center px-2 lg:items-end justify-end mt-4">
          <div className="flex items-center gap-4 w-full">
            {/* Quantity Stepper */}
            <div className="flex items-center bg-softBlack border border-cardBorder rounded-full p-1">
              <button onClick={handleDecrease} className="w-10 h-10 rounded-full flex items-center justify-center text-ashWhite hover:bg-white/10 font-bold text-xl">-</button>
              <span className="w-10 text-center text-ashWhite font-bold text-lg">{quantity}</span>
              <button onClick={handleIncrease} className="w-10 h-10 rounded-full flex items-center justify-center text-ashWhite hover:bg-white/10 font-bold text-xl">+</button>
            </div>

            {/* Add Button */}
            <button
              onClick={() => {
                addToCart(
                  pizza.id,
                  pizza.image,
                  pizza.name,
                  price,
                  additionalTopping,
                  size,
                  crust,
                  quantity // Pass quantity
                ),
                  setModal(false);
              }
              }
              className="btn btn-lg gradient flex-1 flex justify-center items-center gap-2 shadow-xl hover:shadow-primary/30">
              <span className="font-bold">Add {quantity} for</span>
              <span className="font-bold text-xl">Rs. {(price * quantity).toLocaleString()}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
};

export default PizzaDetails;
