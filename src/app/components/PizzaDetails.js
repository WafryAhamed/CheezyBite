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

  return (
    <div className="flex flex-col lg:flex-row lg:gap-x-8 h-full md:p-8">
      <div className="lg:flex-1 flex justify-center items-center">
        <div className="max-w-[300px] lg:max-w-none mt-6 lg:mt-0">
          <Image width={450} height={450} src={pizza.image} alt='' priority={1} className="mx-auto relative" />
        </div>
      </div>

      <div className="flex flex-col flex-1">
        <div className="flex-1 p-2 text-center lg:text-left">
          <div className="flex-1 overflow-y-scroll h-[46vh] scrollbar-thin scrollbar-thumb-primary scrollbar-track-white/5 pr-2">
            <div className="font-semibold">
              <h2 className="capitalize text-3xl mb-1 text-white">{pizza.name}</h2>
              <div className="mb-6 text-lg font-medium text-white/80">
                <span>{size === 'small' ? '25 cm' : size === 'medium' ? '30 cm' : size === 'large' ? '35 cm' : null}</span>
                <span>, {crust} crust</span>
              </div>
            </div>
            <SizeSelection pizza={pizza} size={size} setSize={setSize} />
            <CrustSelection crust={crust} setCrust={setCrust} />
            <div className="mb-4 text-xl font-semibold text-white">Choose topping</div>
            <div className="flex flex-1 flex-wrap gap-2 py-1 justify-center lg:justify-start">
              {pizza.toppings?.map((topping, index) => {
                return <Topping topping={topping} additionalTopping={additionalTopping} setAdditionalTopping={setAdditionalTopping} key={index} />;
              })}
            </div>

            {/* Pricing Info - Show when extra toppings are added */}
            {additionalTopping.length > 3 && (
              <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-lg text-sm">
                <p className="text-softGrey">
                  🍕 First 3 toppings free • {additionalTopping.length - 3} extra topping{additionalTopping.length > 4 ? 's' : ''} (+Rs. {((additionalTopping.length - 3) * 150).toLocaleString()})
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="h-full flex items-center px-2 lg:items-end">
          <button
            onClick={() => {
              addToCart(
                pizza.id,
                pizza.image,
                pizza.name,
                price,
                additionalTopping,
                size,
                crust
              ),
                setModal(false);
            }
            }
            className="btn btn-lg gradient w-full flex justify-center">
            <div>Add to cart for</div>
            <div>Rs. {price.toLocaleString()}</div>
          </button>
        </div>
      </div>
    </div>
  )
};

export default PizzaDetails;
