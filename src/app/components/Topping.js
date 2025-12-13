import React, { useState, useEffect } from "react";
import { Check, CircleDot, Bean, Leaf, Flame, Pizza, Drumstick } from 'lucide-react';

const Topping = ({ topping, additionalTopping, setAdditionalTopping }) => {
  const [isChecked, setIsChecked] = useState(false);

  // Check if this topping is already in the list
  useEffect(() => {
    setIsChecked(additionalTopping.some(t => t.name === topping.name));
  }, [additionalTopping, topping.name]);

  const handleCheckBox = () => {
    const newState = !isChecked;
    setIsChecked(newState);

    if (newState) {
      setAdditionalTopping([...additionalTopping, { ...topping }]);
    } else {
      setAdditionalTopping(additionalTopping.filter((t) => t.name !== topping.name));
    }
  };

  const getToppingIcon = (name) => {
    const lower = name.toLowerCase();
    if (lower.includes('chicken') || lower.includes('beef') || lower.includes('meat') || lower.includes('sausage')) return Drumstick;
    if (lower.includes('pepper') || lower.includes('chilli') || lower.includes('jalapeno') || lower.includes('spicy')) return Flame;
    if (lower.includes('cheese') || lower.includes('paneer') || lower.includes('mozzarella')) return Pizza;
    if (lower.includes('corn') || lower.includes('tomato') || lower.includes('mushroom') || lower.includes('olive') || lower.includes('onion')) return Leaf;
    return CircleDot;
  };

  const Icon = getToppingIcon(topping.name);

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

        {/* Fake Icon */}
        <div className={`flex items-center justify-center w-6 h-6 rounded-full ${isChecked ? 'bg-white/20' : 'bg-white/5'}`}>
          <Icon className={`w-3.5 h-3.5 ${isChecked ? 'text-white' : 'text-ashWhite/60'}`} />
        </div>

        <span className="text-ashWhite font-medium capitalize">{topping.name}</span>
      </div>
      <span className="text-xs text-ashWhite/60">+ LKR 150</span>
    </div>
  )
};

export default Topping;
