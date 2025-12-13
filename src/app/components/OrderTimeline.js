"use client"

import React from "react";
import { Check, ShoppingCart, UtensilsCrossed, CookingPot, Bike, Home } from "lucide-react";

const OrderTimeline = ({ order, onClose }) => {
    const stages = [
        {
            id: 0,
            name: "Order Placed",
            icon: ShoppingCart,
            description: "We've received your order"
        },
        {
            id: 1,
            name: "Preparing",
            icon: UtensilsCrossed,
            description: "Chef is preparing your pizza"
        },
        {
            id: 2,
            name: "Baking",
            icon: CookingPot,
            description: "Pizza is in the oven"
        },
        {
            id: 3,
            name: "Out for Delivery",
            icon: Bike,
            description: "Driver is on the way"
        },
        {
            id: 4,
            name: "Delivered",
            icon: Home,
            description: "Enjoy your meal!"
        },
    ];

    const currentStage = order?.currentStage || 0;

    return (
        <div className="flex flex-col justify-center items-center h-[100vh] lg:h-[600px] px-6 py-8">
            {/* Header */}
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                    {currentStage < stages.length - 1 ? "Order In Progress" : "Order Delivered!"}
                </h2>
                <p className="text-gray-600 text-lg">
                    Order ID: <span className="font-semibold text-primary">#{order.id}</span>
                </p>
                <p className="text-gray-600">
                    Estimated delivery: <span className="font-semibold">{order.eta.formatted}</span>
                </p>
            </div>

            {/* Timeline */}
            <div className="w-full max-w-2xl">
                {stages.map((stage, index) => {
                    const Icon = stage.icon;
                    const isCompleted = index < currentStage;
                    const isCurrent = index === currentStage;
                    const isPending = index > currentStage;

                    return (
                        <div key={stage.id} className="relative">
                            {/* Connector Line */}
                            {index < stages.length - 1 && (
                                <div
                                    className={`absolute left-6 top-12 w-1 h-16 transition-all duration-500 ${isCompleted ? 'bg-green-500' : 'bg-gray-300'
                                        }`}
                                />
                            )}

                            {/* Stage Item */}
                            <div className={`flex items-start space-x-4 mb-4 transition-all duration-500 ${isCurrent ? 'scale-105' : 'scale-100'
                                }`}>
                                {/* Icon Circle */}
                                <div className={`relative flex items-center justify-center w-12 h-12 rounded-full border-4 transition-all duration-500 ${isCompleted
                                    ? 'bg-green-500 border-green-500'
                                    : isCurrent
                                        ? 'bg-primary border-primary animate-pulse'
                                        : 'bg-gray-200 border-gray-300'
                                    }`}>
                                    {isCompleted ? (
                                        <Check className="text-white text-2xl" />
                                    ) : (
                                        <Icon className={`text-2xl ${isCurrent ? 'text-white' : 'text-gray-500'}`} />
                                    )}
                                </div>

                                {/* Stage Info */}
                                <div className="flex-1 pt-1">
                                    <h3 className={`text-xl font-bold transition-all duration-500 ${isCurrent ? 'text-primary' : isCompleted ? 'text-green-600' : 'text-gray-400'
                                        }`}>
                                        {stage.name}
                                    </h3>
                                    <p className={`text-sm transition-all duration-500 ${isCurrent ? 'text-gray-700' : 'text-gray-500'
                                        }`}>
                                        {stage.description}
                                    </p>
                                </div>

                                {/* Status Badge */}
                                {isCurrent && (
                                    <div className="bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full animate-pulse">
                                        In Progress
                                    </div>
                                )}
                                {isCompleted && (
                                    <div className="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                                        Completed
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer Message */}
            <div className="mt-8 text-center">
                {currentStage < stages.length - 1 ? (
                    <p className="text-gray-600 text-sm">
                        Track your order in real-time. We&apos;ll keep you updated!
                    </p>
                ) : (
                    <div className="space-y-2">
                        <p className="text-2xl">🎉</p>
                        <p className="text-green-600 font-semibold text-lg">
                            Thank you for your order!
                        </p>
                        <p className="text-gray-600 text-sm">
                            This window will close automatically...
                        </p>
                    </div>
                )}
            </div>

            {/* Allow manual close */}
            {onClose && (
                <button
                    onClick={onClose}
                    className="mt-6 px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 font-semibold transition-colors"
                >
                    Close
                </button>
            )}
        </div>
    );
};

export default OrderTimeline;
