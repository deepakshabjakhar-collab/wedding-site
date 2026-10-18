import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import clsx from 'clsx';
export function buttonClass(variant = 'primary', size = 'md', extra) {
    return clsx('btn', variant === 'primary' && 'btn-primary', variant === 'gold' && 'btn-gold', variant === 'outline' && 'btn-outline', variant === 'ghost' && 'btn-ghost', variant === 'dark' && 'btn-primary', size === 'sm' && 'btn-sm', size === 'lg' && 'btn-lg', extra);
}
export function Button({ variant = 'primary', size = 'md', loading, icon, className, children, disabled, ...props }) {
    return (_jsxs("button", { className: buttonClass(variant, size, className), disabled: disabled || loading, ...props, children: [loading ? (_jsx("span", { className: "spin h-3.5 w-3.5 rounded-full border border-current border-t-transparent", "aria-hidden": true })) : (icon), children] }));
}
