import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { api } from '@/lib/api';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const refresh = useCallback(async () => {
        try {
            const next = await api.me();
            setUser(next);
        }
        catch {
            setUser(null);
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        void refresh();
    }, [refresh]);
    const login = useCallback(async (email, password) => {
        const { user: next } = await api.login(email, password);
        setUser(next);
        return next;
    }, []);
    const signup = useCallback(async (name, email, password) => {
        const { user: next } = await api.signup(name, email, password);
        setUser(next);
        return next;
    }, []);
    const logout = useCallback(async () => {
        await api.logout().catch(() => undefined);
        setUser(null);
    }, []);
    const value = useMemo(() => ({ user, loading, login, signup, logout, refresh }), [user, loading, login, signup, logout, refresh]);
    return _jsx(AuthContext.Provider, { value: value, children: children });
}
export function useAuth() {
    const value = useContext(AuthContext);
    if (!value)
        throw new Error('useAuth must be used inside AuthProvider');
    return value;
}
export function RequireAuth({ children }) {
    const { user, loading } = useAuth();
    const location = useLocation();
    if (loading) {
        return (_jsx("div", { className: "dash-shell grid min-h-svh place-items-center", children: _jsxs("div", { className: "flex flex-col items-center gap-4", children: [_jsx("span", { className: "spin h-7 w-7 rounded-full border border-line border-t-ink" }), _jsx("p", { className: "eyebrow", children: "Opening the studio" })] }) }));
    }
    if (!user) {
        return _jsx(Navigate, { to: "/login", replace: true, state: { from: location.pathname + location.search } });
    }
    return _jsx(_Fragment, { children: children });
}
