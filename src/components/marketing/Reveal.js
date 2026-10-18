import { jsx as _jsx } from "react/jsx-runtime";
import { motion, useReducedMotion } from 'framer-motion';
export function Reveal({ children, delay = 0, y = 18, className, once = true, }) {
    const reduce = useReducedMotion();
    return (_jsx(motion.div, { className: className, initial: reduce ? false : { opacity: 0, y }, whileInView: { opacity: 1, y: 0 }, viewport: { once, amount: 0.15, margin: '0px 0px -40px 0px' }, transition: { duration: 0.75, delay, ease: [0.22, 0.61, 0.36, 1] }, children: children }));
}
