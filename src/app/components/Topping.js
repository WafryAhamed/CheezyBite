import React, { useState, useEffect } from "react";
import { Check, CircleDot, Bean, Leaf, Flame, Layers, Circle } from 'lucide-react';

const Topping = ({ topping, additionalTopping, setAdditionalTopping }) => {
  const [isChecked, setIsChecked] = useState(false);

  // Check if this topping is already in the list (for Edit mode compliance)
  useEffect(() => {
    setIsChecked(additionalTopping.some(t => t.name === topping.name));
  }, [additionalTopping, topping.name]);

  const handleCheckBox = () => {
    const newState = !isChecked;
    setIsChecked(newState);

    if (newState) {
      // Check limits if needed, but for now just add
      const newToppings = [...additionalTopping, { ...topping }];
      // Unique check handled by set logic usually, but here simple push
      setAdditionalTopping(newToppings);
    } else {
      const newToppings = additionalTopping.filter((t) => t.name !== topping.name);
      setAdditionalTopping(newToppings);
    }
  };

  return (
    <div
      onClick={handleCheckBox}
      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all mb-2 ${isChecked
          ? 'bg-softBlack border-primary'
          : 'bg-transparent border-white/5 hover:bg-white/5'
        }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isChecked ? 'bg-primary border-primary' : 'border-white/30'
          }`}>
          {isChecked && <Check className="w-3.5 h-3.5 text-white" />}
        </div>
        <span className="text-ashWhite font-medium capitalize">{topping.name}</span>
      </div>
      <span className="text-xs text-ashWhite/60">+ LKR 150</span>
    </div>
  )
};

export default Topping;
