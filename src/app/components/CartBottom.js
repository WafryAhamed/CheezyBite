import React, { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";
import { UserContext } from "../context/UserContext"; // Import UserContext
import { useRouter, useSearchParams } from "next/navigation";
import AuthModal from "./AuthModal"; // Reuse AuthModal

const CartBottom = () => {
  const { setIsOpen, cart, cartTotal } = useContext(CartContext);
  const { user } = useContext(UserContext); // Get user
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleCheckout = () => {
    if (!user) {
      setAuthModalOpen(true);
    } else {
      setIsOpen(false);
      // Preserve coupon param if present
      const couponParam = searchParams?.get('coupon');
      const checkoutUrl = couponParam ? `/checkout?coupon=${couponParam}` : '/checkout';
      router.push(checkoutUrl);
    }
  };

  return (
    <>
      {cart.length >= 0 && (
        <div className="p-6 bg-charcoalBlack border-t border-white/10 mt-auto">
          {cart.length > 0 ? (
            <>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-ashWhite/60 text-sm">
                  <span>Subtotal</span>
                  <span>Rs. {parseFloat(cartTotal).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-ashWhite/60 text-sm">
                  <span>Delivery Fee</span>
                  <span>Rs. 350</span>
                </div>
                <div className="flex justify-between text-white font-bold text-lg pt-4 border-t border-white/10">
                  <span>Total</span>
                  <span className="text-primary">Rs. {(parseFloat(cartTotal) + 350).toLocaleString()}</span>
                </div>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full bg-primary hover:bg-primaryHover text-white font-bold py-4 rounded-xl shadow-lg hover:translate-y-[-2px] transition-all flex justify-between px-6"
              >
                <span>Checkout</span>
                <span>Rs. {(parseFloat(cartTotal) + 350).toLocaleString()}</span>
              </button>
            </>
          ) : (
            <button
              disabled
              className="w-full bg-white/5 text-white/40 font-bold py-4 rounded-xl cursor-not-allowed"
            >
              Cart is empty
            </button>
          )}
        </div>
      )}

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          setAuthModalOpen(false);
          // Optionally auto-redirect after login? User might want to verify cart first.
          // Keeping them in cart is safer UX.
        }}
      />
    </>
  );
};

export default CartBottom;