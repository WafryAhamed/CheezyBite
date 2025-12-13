import Image from "next/image";

import { calculatePizzaPrice } from "../utils/priceEngine";

const SizeSelection = ({ pizza, size, setSize }) => {
  const sizes = [
    { id: 'medium', name: 'Medium', label: 'Recommended', multiplier: 1.2 },
    { id: 'small', name: 'Small', label: '', multiplier: 1.0 },
    { id: 'large', name: 'Large', label: '', multiplier: 1.4 }
  ];

  return (
    <div className="mb-8">
      <h3 className="text-sm font-bold text-ashWhite/60 uppercase tracking-wider mb-4">Choose Size <span className="text-primary">*</span></h3>
      <div className="space-y-3">
        {sizes.map((s) => {
          // Calculate price for this specific size (assuming basic crust/no toppings for display)
          const price = calculatePizzaPrice(pizza.priceSm, s.id, 'traditional', []);

          return (
            <label
              key={s.id}
              className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${size === s.id
                  ? 'bg-softBlack border-primary shadow-lg shadow-primary/10'
                  : 'bg-softBlack/40 border-white/10 hover:bg-white/5'
                }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${size === s.id ? 'border-primary' : 'border-white/30'
                  }`}>
                  {size === s.id && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                </div>
                <div>
                  <span className={`font-bold text-ashWhite ${size === s.id ? 'text-primary' : ''}`}>{s.name}</span>
                  {s.label && (
                    <span className="ml-2 text-[10px] font-bold uppercase bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                      {s.label}
                    </span>
                  )}
                </div>
              </div>
              <span className="font-bold text-ashWhite">
                LKR {price.toLocaleString()}
              </span>
              <input
                type='radio'
                name='size'
                value={s.id}
                checked={size === s.id}
                onChange={(e) => setSize(e.target.value)}
                className="hidden"
              />
            </label>
          )
        })}
      </div>
    </div>
  )
};

export default SizeSelection;
