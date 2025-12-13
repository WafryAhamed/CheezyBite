import React from 'react';


// Variants based on the 2025 Admin Theme
const variants = {
    blue: {
        gradient: "from-[#0A1D37] to-[#102A4C]",
        border: "border-[#1E3A5F]",
        shadow: "shadow-blue-900/40",
        iconBg: "bg-blue-500/20",
        iconColor: "text-blue-500"
    },
    green: {
        gradient: "from-[#0E2A1E] to-[#123F2A]",
        border: "border-[#1F6B45]",
        shadow: "shadow-green-900/40",
        iconBg: "bg-green-500/20",
        iconColor: "text-green-500"
    },
    purple: {
        gradient: "from-[#24103D] to-[#3A1766]",
        border: "border-[#5B2D8B]",
        shadow: "shadow-purple-900/40",
        iconBg: "bg-purple-500/20",
        iconColor: "text-purple-500"
    },
    orange: {
        gradient: "from-[#2A160A] to-[#4A260F]",
        border: "border-[#7C3E14]",
        shadow: "shadow-orange-900/40",
        iconBg: "bg-orange-500/20",
        iconColor: "text-orange-500"
    },
    gray: {
        gradient: "from-[#1F2937] to-[#374151]",
        border: "border-[#4B5563]",
        shadow: "shadow-gray-900/40",
        iconBg: "bg-gray-500/20",
        iconColor: "text-gray-400"
    }
};

const AdminCard = ({ variant = 'blue', title, value, icon: Icon, children, className, action }) => {
    const style = variants[variant] || variants.blue;

    return (
        <div className={`rounded-2xl bg-gradient-to-br ${style.gradient} border ${style.border} shadow-lg ${style.shadow} p-6 ${className || ''}`}>

            {/* Header / KPI Mode */}
            {(title || Icon) && (
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                        {Icon && (
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${style.iconBg}`}>
                                <Icon className={`w-6 h-6 ${style.iconColor}`} />
                            </div>
                        )}
                        <div>
                            {title && <p className="text-gray-400 text-sm font-medium">{title}</p>}
                            {value && <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>}
                        </div>
                    </div>
                    {action}
                </div>
            )}

            {/* Content Mode */}
            {children}
        </div>
    );
};

export default AdminCard;
