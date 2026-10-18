import { useCallback, useEffect, useRef, useState } from 'react';
export function useAsync(loader, deps) {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tick, setTick] = useState(0);
    const loaderRef = useRef(loader);
    loaderRef.current = loader;
    useEffect(() => {
        let alive = true;
        setLoading(true);
        setError(null);
        loaderRef
            .current()
            .then((value) => {
            if (alive) {
                setData(value);
                setLoading(false);
            }
        })
            .catch((err) => {
            if (alive) {
                setError(err instanceof Error ? err.message : 'Something went wrong.');
                setLoading(false);
            }
        });
        return () => {
            alive = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [...deps, tick]);
    const reload = useCallback(() => setTick((n) => n + 1), []);
    return { data, error, loading, reload, setData };
}
