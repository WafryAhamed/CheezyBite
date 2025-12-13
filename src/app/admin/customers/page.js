import React from 'react';
import { Users } from 'lucide-react';

export default function AdminCustomersPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-ashWhite flex items-center gap-3">
                        <Users className="w-8 h-8 text-primary" />
                        Customers
                    </h1>
                    <p className="text-ashWhite/60 mt-1">Manage registered customers and view order history</p>
                </div>
            </div>

            <div className="bg-charcoalBlack rounded-xl border border-cardBorder p-12 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
                    <Users className="w-10 h-10 text-ashWhite/30" />
                </div>
                <h3 className="text-xl font-semibold text-ashWhite mb-2">Customer Database</h3>
                <p className="text-ashWhite/50 max-w-md mx-auto">
                    This module is currently under development. Soon you'll be able to view customer profiles, loyalty points, and order milestones here.
                </p>
                <div className="mt-6 px-4 py-2 bg-primary/20 text-primary rounded-lg text-sm font-medium border border-primary/20">
                    Coming Soon in v2.1
                </div>
            </div>
        </div>
    );
}
