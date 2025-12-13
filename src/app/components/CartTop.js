"use client";

import React, { useContext } from "react";
import { X } from "lucide-react";
import { CartContext } from "../context/CartContext";

const CartTop = () => {
  const { setIsOpen } = useContext(CartContext);
  return (
    <div className="w-full h-20 border-b border-cardBorder flex items-center justify-between px-10">
      <div className="font-semibold text-ashWhite">Shopping Bag({cart.reduce((a, c) => a + c.amount, 0)})</div>
      <div onClick={() => setIsOpen(false)} className="cursor-pointer group text-ashWhite hover:text-secondary">
        <X className="text-3xl group-hover:scale-110 duration-300 transition-all" />
      </div>
    </div>
  )
};

export default CartTop;
