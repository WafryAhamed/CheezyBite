"use client";

import { useState, useEffect, useRef } from 'react';
import { Users, Search, Mail, Phone, ShoppingBag, DollarSign, Calendar, Eye, Loader2, CheckCircle } from 'lucide-react';
import customersService from '@/services/customersService';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAdmin } from '../../context/AdminContext';
import io from 'socket.io-client';

export default function AdminCustomersPage() {
    const { isAuthenticated, loading: adminLoading } = useAdmin();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('lastOrder');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [customerDetails, setCustomerDetails] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
    const socketRef = useRef(null);

    const searchParams = useSearchParams();
    const query = searchParams.get('q');

    // Sync URL search to local state
    useEffect(() => {
        if (query !== null && query !== search) {
            setSearch(query);
        }
    }, [query]);

    // Initialize Socket.io for real-time updates
    useEffect(() => {
        if (!isAuthenticated) return;

        const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';

        if (!socketRef.current) {
            socketRef.current = io(SOCKET_URL, {
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                reconnectionAttempts: 5
            });

            socketRef.current.on('connect', () => {
                console.log('Socket connected');
                socketRef.current.emit('admin-join', { room: 'customers' });
            });

            // Listen for customer-related events
            socketRef.current.on('customer-added', (data) => {
                setCustomers(prev => [data.customer, ...prev].slice(0, pagination.limit));
                setPagination(prev => ({ ...prev, total: prev.total + 1 }));
                toast.success('New customer registered!');
            });

            socketRef.current.on('customer-updated', (data) => {
                setCustomers(prev =>
                    prev.map(c => c._id === data.customer._id ? data.customer : c)
                );
            });

            socketRef.current.on('customer-order-placed', (data) => {
                setCustomers(prev =>
                    prev.map(c =>
                        c._id === data.customerId
                            ? { ...c, totalOrders: c.totalOrders + 1, lastOrderDate: data.orderDate, totalSpent: data.totalSpent }
                            : c
                    )
                );
            });
        }

        return () => {
            // Keep connection alive
        };
    }, [isAuthenticated, pagination.limit]);

    // Fetch customers - only if authenticated
    useEffect(() => {
        if (!adminLoading && isAuthenticated) {
            loadCustomers();
        }
    }, [search, sortBy, pagination.page, adminLoading, isAuthenticated]);

    const loadCustomers = async () => {
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await customersService.getAllAdmin({
                search,
                sortBy,
                page: pagination.page,
                limit: pagination.limit
            });

            if (response.success) {
                setCustomers(response.data.customers || []);
                setPagination(response.data.pagination || pagination);
            } else {
                toast.error(response.message || 'Failed to load customers');
            }
        } catch (error) {
            console.error('Load customers error:', error);
            // Don't show error toast for auth errors - handled by middleware
            if (error.response?.status !== 401 && error.response?.status !== 403) {
                toast.error('Failed to load customers');
            }
        } finally {
            setLoading(false);
        }
    };

    // Load customer details
    const loadCustomerDetails = async (customerId) => {
        try {
            setDetailsLoading(true);
            const response = await customersService.getByIdAdmin(customerId);

            if (response.success) {
                setCustomerDetails(response.data);
            }
        } catch (error) {
            if (error.status === 404) {
                toast.error('Customer not found');
                setSelectedCustomer(null);
            } else {
                console.error('Load customer details error:', error);
                toast.error('Failed to load customer details');
            }
        } finally {
            setDetailsLoading(false);
        }
    };

    const handleViewDetails = (customer) => {
        setSelectedCustomer(customer);
        loadCustomerDetails(customer._id);
    };

    const handleCloseDetails = () => {
        setSelectedCustomer(null);
        setCustomerDetails(null);
    };

    // Show loading or not authenticated state
    if (adminLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-ashWhite/60">Loading admin panel...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-ashWhite/60 mb-4">Admin authentication required</p>
                    <p className="text-ashWhite/40 text-sm">Please log in through the admin login page</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Users className="w-8 h-8 text-primary" />
                        Customers
                    </h1>
                    <p className="text-gray-400 mt-1">Manage registered customers and view order history</p>
                </div>
                <div className="text-sm text-gray-400">
                    Total: <span className="text-white font-semibold">{pagination.total}</span> customers
                </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name, email, or phone..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary"
                    />
                </div>
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                >
                    <option value="lastOrder">Latest Order</option>
                    <option value="totalSpent">Highest Spend</option>
                    <option value="totalOrders">Most Orders</option>
                </select>
            </div>

            {/* Customers Table */}
            {loading ? (
                <div className="bg-gray-800 rounded-xl p-12 border border-gray-700 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
            ) : customers.length === 0 ? (
                <div className="bg-gray-800 rounded-xl p-12 border border-gray-700 flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
                        <Users className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">No Customers Found</h3>
                    <p className="text-gray-400 max-w-md mx-auto">
                        {search ? 'Try adjusting your search criteria' : 'No customers have registered yet'}
                    </p>
                </div>
            ) : (
                <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-700">
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Contact</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Orders</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Spent</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Last Order</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {customers.map((customer) => (
                                    <tr key={customer._id} className="hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="text-white font-medium">{customer.name}</div>
                                                <div className="text-gray-400 text-sm flex items-center gap-1 mt-1">
                                                    <Mail className="w-3 h-3" />
                                                    {customer.email}
                                                    {customer.emailVerified && (
                                                        <span title="Email Verified" className="text-green-400">
                                                            <CheckCircle className="w-3 h-3 inline ml-1" />
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {customer.phone ? (
                                                <div className="text-gray-300 text-sm flex items-center gap-1">
                                                    <Phone className="w-3 h-3" />
                                                    {customer.phone}
                                                </div>
                                            ) : (
                                                <span className="text-gray-500 text-sm">N/A</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-white">
                                                <ShoppingBag className="w-4 h-4 text-blue-400" />
                                                {customer.totalOrders || 0}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-white font-mono">
                                                Rs. {(customer.totalSpent || 0).toLocaleString('en-IN')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {customer.lastOrderDate ? (
                                                <div className="text-gray-300 text-sm flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(customer.lastOrderDate).toLocaleDateString()}
                                                </div>
                                            ) : (
                                                <span className="text-gray-500 text-sm">Never</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${customer.status === 'Active'
                                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                                                }`}>
                                                {customer.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleViewDetails(customer)}
                                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/20 text-primary hover:bg-primary/30 rounded-lg transition-colors text-sm font-medium"
                                            >
                                                <Eye className="w-4 h-4" />
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-gray-700 flex items-center justify-between">
                            <div className="text-sm text-gray-400">
                                Page {pagination.page} of {pagination.totalPages}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                    disabled={pagination.page === 1}
                                    className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                    disabled={pagination.page === pagination.totalPages}
                                    className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Customer Details Modal */}
            {selectedCustomer && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={handleCloseDetails}>
                    <div className="bg-gray-800 rounded-xl border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-white">{selectedCustomer.name}</h2>
                                <p className="text-gray-400 text-sm">{selectedCustomer.email}</p>
                            </div>
                            <button
                                onClick={handleCloseDetails}
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        {detailsLoading ? (
                            <div className="p-12 flex items-center justify-center">
                                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                            </div>
                        ) : customerDetails ? (
                            <div className="p-6 space-y-6">
                                {/* Customer Info */}
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="bg-gray-700/30 rounded-lg p-4">
                                        <h3 className="text-sm font-semibold text-gray-400 mb-3">Contact Information</h3>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-white">
                                                <Mail className="w-4 h-4 text-gray-400" />
                                                {customerDetails.customer.email}
                                            </div>
                                            {customerDetails.customer.phone && (
                                                <div className="flex items-center gap-2 text-white">
                                                    <Phone className="w-4 h-4 text-gray-400" />
                                                    {customerDetails.customer.phone}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-gray-700/30 rounded-lg p-4">
                                        <h3 className="text-sm font-semibold text-gray-400 mb-3">Default Address</h3>
                                        {customerDetails.defaultAddress ? (
                                            <p className="text-white text-sm leading-relaxed">
                                                {customerDetails.defaultAddress.street}, {customerDetails.defaultAddress.city}, {customerDetails.defaultAddress.postalCode}
                                            </p>
                                        ) : (
                                            <p className="text-gray-500 text-sm">No address saved</p>
                                        )}
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                                        <div className="text-blue-400 text-sm mb-1">Total Orders</div>
                                        <div className="text-2xl font-bold text-white">{customerDetails.customer.totalOrders}</div>
                                    </div>
                                    <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
                                        <div className="text-green-400 text-sm mb-1">Total Spent</div>
                                        <div className="text-2xl font-bold text-white">Rs. {customerDetails.customer.totalSpent.toLocaleString('en-IN')}</div>
                                    </div>
                                    <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
                                        <div className="text-purple-400 text-sm mb-1">Last Order</div>
                                        <div className="text-sm font-medium text-white">
                                            {customerDetails.customer.lastOrderDate
                                                ? new Date(customerDetails.customer.lastOrderDate).toLocaleDateString()
                                                : 'Never'}
                                        </div>
                                    </div>
                                </div>

                                {/* Recent Orders */}
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-4">Recent Orders</h3>
                                    {customerDetails.recentOrders && customerDetails.recentOrders.length > 0 ? (
                                        <div className="space-y-2">
                                            {customerDetails.recentOrders.map((order) => (
                                                <Link
                                                    key={order._id}
                                                    href={`/admin/orders`}
                                                    className="block bg-gray-700/30 hover:bg-gray-700/50 rounded-lg p-4 transition-colors border border-gray-700"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <div className="text-white font-mono font-semibold">
                                                                #{order._id.toString().slice(-8)}
                                                            </div>
                                                            <div className="text-gray-400 text-sm mt-1">
                                                                {new Date(order.createdAt).toLocaleString()} · {order.items?.length || 0} items
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-white font-bold">Rs. {order.total?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                                            <div className={`text-xs mt-1 px-2 py-1 rounded-full inline-block ${order.currentStage === 4 ? 'bg-green-500/20 text-green-400' :
                                                                order.currentStage === 3 ? 'bg-purple-500/20 text-purple-400' :
                                                                    order.currentStage === 2 ? 'bg-orange-500/20 text-orange-400' :
                                                                        order.currentStage === 1 ? 'bg-yellow-500/20 text-yellow-400' :
                                                                            'bg-blue-500/20 text-blue-400'
                                                                }`}>
                                                                {['Placed', 'Preparing', 'Baking', 'Delivery', 'Delivered'][order.currentStage]}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 text-center py-8">No orders yet</p>
                                    )}
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            )}
        </div>
    );
}
