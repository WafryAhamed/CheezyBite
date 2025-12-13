'use client';

import React from 'react';
import { User, Mail, Phone, Calendar } from 'lucide-react';

export default function CustomersPage() {
    const customers = [
        { id: 1, name: 'John Doe', email: 'john@example.com', phone: '+94 77 123 4567', joined: 'Oct 12, 2025', orders: 15 },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '+94 77 987 6543', joined: 'Sep 25, 2025', orders: 8 },
        { id: 3, name: 'Mike Ross', email: 'mike@example.com', phone: '+94 77 555 1234', joined: 'Nov 05, 2025', orders: 23 },
        { id: 4, name: 'Rachel Zane', email: 'rachel@example.com', phone: '+94 77 888 9999', joined: 'Dec 01, 2025', orders: 4 },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-ashWhite">Customers</h1>

            <div className="bg-charcoalBlack rounded-2xl border border-cardBorder overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-softBlack border-b border-cardBorder">
                            <tr>
                                <th className="p-4 text-ashWhite font-bold">Customer</th>
                                <th className="p-4 text-ashWhite font-bold">Contact Info</th>
                                <th className="p-4 text-ashWhite font-bold">Joined Date</th>
                                <th className="p-4 text-ashWhite font-bold text-center">Orders</th>
                                <th className="p-4 text-ashWhite font-bold">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-cardBorder">
                            {customers.map((customer) => (
                                <tr key={customer.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-softBlack rounded-full border border-cardBorder flex items-center justify-center">
                                                <User className="w-5 h-5 text-ashWhite/70" />
                                            </div>
                                            <span className="font-bold text-ashWhite">{customer.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-sm text-ashWhite/70">
                                                <Mail className="w-3 h-3" />
                                                {customer.email}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-ashWhite/70">
                                                <Phone className="w-3 h-3" />
                                                {customer.phone}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 text-ashWhite/70">
                                            <Calendar className="w-4 h-4" />
                                            {customer.joined}
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-bold border border-primary/20">
                                            {customer.orders}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <button className="text-ashWhite/60 hover:text-white hover:underline text-sm">
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
