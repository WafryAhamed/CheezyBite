import React from 'react';
import { ShieldAlert } from 'lucide-react';

export default function AdminUsersPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-ashWhite flex items-center gap-3">
                        <ShieldAlert className="w-8 h-8 text-primary" />
                        Admin Users
                    </h1>
                    <p className="text-ashWhite/60 mt-1">Manage admin access and role assignments</p>
                </div>
            </div>

            <div className="bg-charcoalBlack rounded-xl border border-cardBorder p-8">
                <div className="flex items-center gap-4 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg mb-8">
                    <ShieldAlert className="w-6 h-6 text-orange-400" />
                    <div>
                        <h4 className="text-sm font-bold text-orange-400 uppercase tracking-wide">Restricted Area</h4>
                        <p className="text-xs text-orange-300/70">Only Super Admins can access this configuration panel.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-ashWhite">Active Administrators</h3>

                    {/* Demo List */}
                    <div className="grid gap-3">
                        <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-cardBorder">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center text-white font-bold text-sm">SA</div>
                                <div>
                                    <div className="font-medium text-ashWhite">Super Admin</div>
                                    <div className="text-xs text-ashWhite/50">admin@cheezybite.com</div>
                                </div>
                            </div>
                            <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded border border-primary/20 font-medium">Super Admin</span>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-cardBorder">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-sm">MA</div>
                                <div>
                                    <div className="font-medium text-ashWhite">Store Manager</div>
                                    <div className="text-xs text-ashWhite/50">manager@cheezybite.com</div>
                                </div>
                            </div>
                            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded border border-blue-500/20 font-medium">Manager</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
