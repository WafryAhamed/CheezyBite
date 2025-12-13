import { getCrustPrice } from "../utils/priceEngine";

const CrustSelection = ({ crust, setCrust }) => {
  const crusts = [
    { id: 'traditional', name: 'Classic Hand Tossed', priceLabel: 'Included' },
    { id: 'thin', name: 'Thin Crust', priceLabel: '+ LKR 150' },
    { id: 'stuffed', name: 'Stuffed Cheese Crust', priceLabel: '+ LKR 350' }
  ];

  return (
    <div className="mb-8">
      <h3 className="text-sm font-bold text-ashWhite/60 uppercase tracking-wider mb-4">Choose Crust <span className="text-primary">*</span></h3>
      <div className="space-y-3">
        {crusts.map((c) => (
          <label
            key={c.id}
            className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${crust === c.id
                ? 'bg-softBlack border-primary shadow-lg shadow-primary/10'
                : 'bg-softBlack/40 border-white/10 hover:bg-white/5'
              }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${crust === c.id ? 'border-primary' : 'border-white/30'
                }`}>
                {crust === c.id && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
              </div>
              <span className={`font-bold text-ashWhite ${crust === c.id ? 'text-primary' : ''}`}>{c.name}</span>
            </div>
            <span className="text-sm text-ashWhite/60 font-medium">
              {c.priceLabel}
            </span>
            <input
              type='radio'
              name='crust'
              value={c.id}
              checked={crust === c.id}
              onChange={(e) => setCrust(e.target.value)}
              className="hidden"
            />
          </label>
        ))}
      </div>
    </div>
  )
};

export default CrustSelection;
