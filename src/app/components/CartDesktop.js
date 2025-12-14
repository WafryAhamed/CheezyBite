"use client";

import React, { useContext, useRef, useEffect } from "react";
import CartItem from "./CartItem";
import CartBottom from "./CartBottom";
import CartTop from "./CartTop";
import { CartContext } from "../context/CartContext";

const CartDesktop = () => {
  const { isOpen, setIsOpen, cart } = useContext(CartContext);
  const itemsRef = useRef(null);

  // Auto-scroll logic
  useEffect(() => {
    if (cart.length >= 2) {
      itemsRef.current?.scrollTo({ top: 0 });
    }
  }, [cart.length]);
  return (
    <>
      {/* Overlay */}
      <div
        onClick={() => setIsOpen(false)}
        className={`bg-black/60 fixed w-full h-full z-40 transition-all duration-300 ${isOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}
      />

      {/* Cart Drawer/Sheet */}
      <div className={`fixed z-50 bg-charcoalBlack border-cardBorder shadow-2xl transition-all duration-300 flex flex-col
        /* Mobile: Bottom Sheet */
        bottom-0 w-full max-h-[85vh] rounded-t-[30px] border-t lg:border-t-0 lg:rounded-none
        ${isOpen ? 'translate-y-0' : 'translate-y-full'}
        
        /* Desktop: Right Drawer */
        lg:top-0 lg:max-h-[100vh] lg:w-[450px] lg:right-0 lg:left-auto lg:border-l
        lg:${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <CartTop />
        <div ref={itemsRef} className={`flex-1 overflow-y-auto px-4 py-4 scrollbar-thin scrollbar-thumb-primary scrollbar-track-softBlack`}>
          {cart.length > 0 ? (
            <div className="flex flex-col gap-y-4">
              {cart.map((pizza, index) => (
                <CartItem pizza={pizza} key={index} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-60">
              <div className="text-6xl">🍕</div>
              <div className="text-xl font-bold text-ashWhite">Your cart is empty</div>
              <button onClick={() => setIsOpen(false)} className="text-primary hover:text-white font-bold uppercase text-sm tracking-widest border-b border-primary pb-1">
                Browse Menu
              </button>
            </div>
          )}
        </div>
        <CartBottom />
      </div>
    </>
  )
};

export default CartDesktop;
