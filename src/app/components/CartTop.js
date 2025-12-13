"use client";

import React, { useContext } from "react";
import { X } from "lucide-react";
import { CartContext } from "../context/CartContext";

const CartTop = () => {
  const { setIsOpen } = useContext(CartContext);
  return (
    <div className="w-full h-20 border-b border-white/10 flex items-center justify-between px-10">
      <div className="font-semibold">Shopping Bag(1)</div>
      <div onClick={() => setIsOpen(false)} className="cursor-pointer group">
        <X className="text-3xl group-hover:scale-110 duration-300 transition-all" />
      </div>
    </div>
  )
};

export default CartTop;
