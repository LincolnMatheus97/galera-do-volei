import React, { forwardRef } from 'react';
import { clsx } from 'clsx';

interface Option {
    label: string;
    value: string | number;
}

interface SelectInputProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    options: Option[];
    error?: string;
}

export const SelectInput = forwardRef<HTMLSelectElement, SelectInputProps>(
    ({ label, options, error, className, ...props }, ref) => {
        return (
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
                <select
                    ref={ref}
                    className={clsx(
                        "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors bg-white",
                        error 
                            ? "border-red-500 focus:ring-red-200" 
                            : "border-gray-300 focus:ring-blue-200 focus:border-blue-500",
                        className
                    )}
                    {...props}
                >
                    <option value="">Selecione...</option>
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
            </div>
        );
    }
);

SelectInput.displayName = "SelectInput";