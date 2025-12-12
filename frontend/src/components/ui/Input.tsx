import React, { forwardRef } from 'react';
import { clsx } from 'clsx'; // Utilitário para classes condicionais

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

// forwardRef é necessário para o React Hook Form funcionar corretamente com componentes customizados
export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, className, ...props }, ref) => {
        return (
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
                <input
                    ref={ref}
                    className={clsx(
                        "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors",
                        error 
                            ? "border-red-500 focus:ring-red-200" 
                            : "border-gray-300 focus:ring-blue-200 focus:border-blue-500",
                        className
                    )}
                    {...props}
                />
                {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
            </div>
        );
    }
);

Input.displayName = "Input";