'use client';

import React from 'react';
import PizzaDetails from '../../components/PizzaDetails';

export default function PizzaClient({ pizza }) {
    // PizzaDetails expects { pizza, modal, setModal }
    // Since we are on a dedicated page, 'modal' state relates to closing it. 
    // We can pass dummy setModal or handle it to redirect back if needed in future.

    return (
        <div className="min-h-screen bg-jetBlack pt-24 pb-12 px-4 flex items-center justify-center">
            <div className="bg-softBlack w-full max-w-[1000px] rounded-[30px] shadow-2xl overflow-hidden border border-cardBorder p-4 md:p-8 relative">
                <PizzaDetails pizza={pizza} modal={true} setModal={() => { }} />
            </div>
        </div>
    );
}
