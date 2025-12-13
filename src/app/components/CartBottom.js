import React, { useContext, useState } from "react";
import { X } from "lucide-react";
import CheckoutDetails from "./CheckoutDetails";
import Modal from "react-modal";
import { CartContext } from "../context/CartContext";

const modalStyles = {
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
};

Modal.setAppElement('body');

const CartBottom = () => {
  const { setIsOpen, cart, cartTotal } = useContext(CartContext);
  const [modal, setModal] = useState(false);

  const openModal = () => {
    setModal(true);
  };

  const closeModal = () => {
    setModal(false);
  };

  return (
    <>
      {cart.length >= 1 ? (
        <div className="px-6 py-3 lg:py-6 mt-auto">
          <div className="flex items-center justify-between mb-6 text-lg font-bold font-robotoCondensed text-ashWhite">
            <div>Total:</div>
            <div>Rs. {parseFloat(cartTotal).toLocaleString()}</div>
          </div>
          <div className="flex flex-col gap-y-3">
            <button
              onClick={() => {
                setIsOpen(false);
                openModal();
              }}
              className="btn btn-lg bg-gradient-to-r from-primary to-secondary w-full flex justify-center text-white shadow-lg hover:shadow-primary/20"
            >
              Checkout
            </button>
          </div>
        </div>
      ) : (
        <div className="absolute top-0 w-full h-full flex justify-center items-center -z-10">
          <div className="font-semibold text-ashWhite/60">Your cart is empty</div>
        </div>
      )}
      {modal &&
        <Modal
          className="bg-softBlack w-full h-full lg:max-w-[900px] lg:max-h-[600px] lg:rounded-[30px] lg:fixed lg:top-[50%] lg:left-[50%] lg:translate-x-[-50%] lg:translate-y-[-50%] outline-none shadow-2xl overflow-hidden border border-cardBorder"
          isOpen={modal}
          style={modalStyles}
          onRequestClose={closeModal}
          contentLabel="Checkout Modal"
        >
          <div onClick={closeModal} className="absolute z-30 right-4 top-4 hover:scale-110 duration-200 cursor-pointer bg-charcoalBlack rounded-full p-2 text-ashWhite/80 hover:text-ashWhite shadow-md">
            <X className="text-2xl" />
          </div>
          <CheckoutDetails setModal={setModal} />
        </Modal>}
    </>
  );
};

export default CartBottom;