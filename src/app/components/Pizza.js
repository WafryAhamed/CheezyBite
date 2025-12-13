'use client';

import React, { useState } from "react";
import Image from "next/image";
import Modal from "react-modal";
import PizzaDetails from "./PizzaDetails";
import { X } from 'lucide-react';

Modal.setAppElement('body');

const modalStyles = {
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.5)'
  }
}

const Pizza = ({ pizza }) => {
  const [modal, setModal] = useState(false);

  const openModal = () => {
    setModal(true);
  }

  const closeModal = () => {
    setModal(false);
  }

  return (
    <div onClick={openModal} className="group p-4 bg-softBlack rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border border-cardBorder flex flex-col h-full">
      <div className="relative w-full aspect-square mb-4 overflow-hidden rounded-xl bg-white/5 flex items-center justify-center">
        <Image
          className="object-contain hover:scale-105 transition-transform duration-300"
          src={pizza.image}
          alt={pizza.name}
          width={300}
          height={300}
          priority={false}
        />
      </div>

      {/* title */}
      <div className="flex-grow">
        <h3 className="text-lg font-bold mb-2 capitalize text-ashWhite leading-tight">
          {pizza.name}
        </h3>
        {/* description */}
        <p className="text-sm text-ashWhite/70 line-clamp-2 mb-4">
          {pizza.description}
        </p>
      </div>

      {/* price & btn */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-cardBorder">
        <div className="text-lg font-bold text-secondary">
          Rs. {pizza.priceSm.toLocaleString()}
        </div>
        <button className="hidden lg:flex bg-primary text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-primaryHover transition-colors shadow-lg hover:shadow-primary/20">
          Add
        </button>
        <button className="lg:hidden w-8 h-8 flex items-center justify-center bg-primary text-white rounded-full text-lg shadow-lg">
          +
        </button>
      </div>

      {modal &&
        <Modal
          isOpen={modal}
          style={modalStyles}
          onRequestClose={(e) => {
            e.stopPropagation();
            closeModal();
          }}
          contentLabel="Pizza Modal"
          className="bg-softBlack w-full h-full lg:max-w-[900px] lg:max-h-[600px] lg:rounded-[30px] lg:fixed lg:top-[50%] lg:left-[50%] lg:translate-x-[-50%] lg:translate-y-[-50%] outline-none shadow-2xl overflow-hidden border border-cardBorder"
        >
          <div onClick={(e) => {
            e.stopPropagation();
            closeModal();
          }} className="absolute z-30 right-4 top-4 hover:scale-110 duration-200 cursor-pointer bg-charcoalBlack rounded-full p-2 text-ashWhite/80 hover:text-ashWhite shadow-md">
            <X className="text-2xl" />
          </div>
          <PizzaDetails pizza={pizza} modal={modal} setModal={setModal} />
        </Modal>}
    </div>
  );
};

export default Pizza;