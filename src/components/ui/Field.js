import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import clsx from 'clsx';
export function Field({ label, htmlFor, hint, error, optional, action, children, className }) {
    return (_jsxs("div", { className: clsx('min-w-0', className), children: [_jsxs("div", { className: "label", children: [_jsxs("label", { htmlFor: htmlFor, className: "cursor-pointer", children: [label, optional && _jsx("span", { className: "ml-1.5 font-normal tracking-normal normal-case opacity-70", children: "optional" })] }), action] }), children, error ? (_jsx("p", { className: "error-text", role: "alert", children: error })) : hint ? (_jsx("p", { className: "hint", children: hint })) : null] }));
}
export function Input({ className, ...props }) {
    return _jsx("input", { className: clsx('input', className), ...props });
}
export function Textarea({ className, ...props }) {
    return _jsx("textarea", { className: clsx('textarea', className), ...props });
}
export function Select({ className, children, ...props }) {
    return (_jsx("select", { className: clsx('select', className), ...props, children: children }));
}
export function Switch({ checked, onChange, label, description, disabled, }) {
    return (_jsxs("label", { className: clsx('flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-line/70 bg-paper/60 px-3.5 py-3 transition hover:border-gold/40', disabled && 'cursor-not-allowed opacity-60'), children: [_jsxs("span", { className: "min-w-0", children: [_jsx("span", { className: "block text-[0.82rem] font-medium text-ink", children: label }), description && _jsx("span", { className: "mt-0.5 block text-xs leading-relaxed text-muted", children: description })] }), _jsxs("span", { className: "relative mt-0.5 flex-none", children: [_jsx("input", { type: "checkbox", className: "peer sr-only", checked: checked, onChange: (event) => onChange(event.target.checked), disabled: disabled }), _jsx("span", { className: "block h-[22px] w-[38px] rounded-full border border-line bg-[#e8dfd1] transition peer-checked:border-ink peer-checked:bg-ink peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold" }), _jsx("span", { className: "pointer-events-none absolute left-[3px] top-[3px] h-4 w-4 rounded-full bg-paper shadow-sm transition-transform peer-checked:translate-x-4" })] })] }));
}
