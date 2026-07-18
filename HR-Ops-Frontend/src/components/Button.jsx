import React from "react";
import { Loader2 } from "lucide-react";

/**
 * Reusable Button Component
 *
 * @param {string} variant - 'primary', 'secondary', 'success', 'danger', 'ghost', 'outline'
 * @param {string} size - 'sm', 'md', 'lg', 'icon'
 * @param {boolean} isLoading - Shows a loader and disables the button
 * @param {boolean} fullWidth - Sets width to 100%
 * @param {string} className - Additional classes to override/extend styles
 * @param {React.ReactNode} children - Button content
 * @param {object} props - Other standard button attributes (onClick, type, disabled, etc.)
 */
export default function Button({
    variant = "primary",
    size = "md",
    isLoading = false,
    fullWidth = false,
    className = "",
    children,
    disabled,
    ...props
}) {
    const baseStyles =
        "inline-flex items-center justify-center rounded-lg font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm",
        secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-200 shadow-sm",
        success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-md",
        danger: "bg-red-50 text-red-600 hover:bg-red-100 focus:ring-red-500 border border-red-200", // Soft danger
        ghost: "bg-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-200",
        outline: "bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-200",
    };

    const sizes = {
        sm: "px-3 py-1.5 text-xs",
        md: "px-4 py-2 text-sm",
        lg: "px-6 py-3 text-base",
        icon: "p-2", // For icon-only buttons
    };

    return (
        <button
            className={`
        ${baseStyles}
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
            disabled={isLoading || disabled}
            {...props}
        >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {children}
        </button>
    );
}
