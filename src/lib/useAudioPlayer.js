import { useCallback, useEffect, useRef, useState } from 'react';
export function useAudioPlayer(src, options = {}) {
    const { loop = true, volume: initialVolume = 0.55, preload = 'metadata' } = options;
    const audioRef = useRef(null);
    const [playing, setPlaying] = useState(false);
    const [time, setTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [muted, setMutedState] = useState(false);
    const [volume, setVolumeState] = useState(initialVolume);
    const [error, setError] = useState(null);
    useEffect(() => {
        if (!src) {
            audioRef.current?.pause();
            audioRef.current = null;
            setPlaying(false);
            return;
        }
        const audio = new Audio(src);
        audio.loop = loop;
        audio.preload = preload;
        audio.volume = initialVolume;
        audioRef.current = audio;
        setError(null);
        setTime(0);
        setDuration(0);
        setPlaying(false);
        const syncTime = () => {
            setTime(audio.currentTime || 0);
            if (Number.isFinite(audio.duration))
                setDuration(audio.duration);
        };
        const onMetadata = () => {
            if (Number.isFinite(audio.duration))
                setDuration(audio.duration);
        };
        const onPlaying = () => {
            setPlaying(true);
            setError(null);
        };
        const onPause = () => setPlaying(false);
        const onEnded = () => setPlaying(false);
        const onError = () => {
            setError('The soundtrack could not be loaded. Please try again.');
            setPlaying(false);
        };
        const onVolume = () => {
            setMutedState(audio.muted);
            setVolumeState(audio.volume);
        };
        audio.addEventListener('loadedmetadata', onMetadata);
        audio.addEventListener('durationchange', onMetadata);
        audio.addEventListener('timeupdate', syncTime);
        audio.addEventListener('playing', onPlaying);
        audio.addEventListener('pause', onPause);
        audio.addEventListener('ended', onEnded);
        audio.addEventListener('error', onError);
        audio.addEventListener('volumechange', onVolume);
        return () => {
            audio.removeEventListener('loadedmetadata', onMetadata);
            audio.removeEventListener('durationchange', onMetadata);
            audio.removeEventListener('timeupdate', syncTime);
            audio.removeEventListener('playing', onPlaying);
            audio.removeEventListener('pause', onPause);
            audio.removeEventListener('ended', onEnded);
            audio.removeEventListener('error', onError);
            audio.removeEventListener('volumechange', onVolume);
            audio.pause();
            audio.src = '';
            if (audioRef.current === audio)
                audioRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [src, loop, preload]);
    const play = useCallback(async () => {
        const audio = audioRef.current;
        if (!audio)
            return false;
        setError(null);
        try {
            await audio.play();
            return true;
        }
        catch (err) {
            const name = err instanceof DOMException ? err.name : '';
            setError(name === 'NotAllowedError'
                ? 'Tap play once to start the music.'
                : 'The soundtrack could not be played.');
            setPlaying(false);
            return false;
        }
    }, []);
    const pause = useCallback(() => {
        audioRef.current?.pause();
    }, []);
    const toggle = useCallback(async () => {
        const audio = audioRef.current;
        if (!audio)
            return false;
        if (!audio.paused) {
            audio.pause();
            return false;
        }
        return play();
    }, [play]);
    const seek = useCallback((seconds) => {
        const audio = audioRef.current;
        if (!audio || !Number.isFinite(audio.duration))
            return;
        const clamped = Math.max(0, Math.min(seconds, audio.duration));
        audio.currentTime = clamped;
        setTime(clamped);
    }, []);
    const setMuted = useCallback((value) => {
        const audio = audioRef.current;
        if (!audio)
            return;
        audio.muted = value;
        setMutedState(value);
    }, []);
    const setVolume = useCallback((value) => {
        const audio = audioRef.current;
        if (!audio)
            return;
        const clamped = Math.max(0, Math.min(1, value));
        audio.volume = clamped;
        audio.muted = clamped === 0;
        setVolumeState(clamped);
    }, []);
    useEffect(() => {
        const onVisibility = () => {
            if (document.hidden)
                audioRef.current?.pause();
        };
        document.addEventListener('visibilitychange', onVisibility);
        return () => document.removeEventListener('visibilitychange', onVisibility);
    }, []);
    return { playing, time, duration, muted, volume, error, play, pause, toggle, seek, setMuted, setVolume };
}
export function formatAudioTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0)
        return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, '0')}`;
}
