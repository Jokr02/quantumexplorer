import { useEffect, useCallback } from 'react';

// Pre-define available sound keys
export type SoundEffect =
    | 'ui_click'
    | 'zoom_in'
    | 'zoom_out'
    | 'ambient_space'
    | 'ambient_lab'
    | 'thermal_pulse'
    | 'collision';

const SOUND_PATHS: Record<SoundEffect, string> = {
    ui_click: '/sounds/ui_click.mp3',
    zoom_in: '/sounds/zoom_in.mp3',
    zoom_out: '/sounds/zoom_out.mp3',
    ambient_space: '/sounds/ambient_space.mp3',
    ambient_lab: '/sounds/ambient_lab.mp3',
    thermal_pulse: '/sounds/thermal_pulse.mp3',
    collision: '/sounds/collision.mp3',
};

// Global cache for loaded audio elements to avoid rapid re-creation
const audioCache: Partial<Record<SoundEffect, HTMLAudioElement>> = {};

interface UseAudioOptions {
    volume?: number;
    loop?: boolean;
}

export function useAudio() {
    // Pre-load sounds on initial mount
    useEffect(() => {
        Object.entries(SOUND_PATHS).forEach(([key, path]) => {
            const k = key as SoundEffect;
            if (!audioCache[k]) {
                const audio = new Audio(path);
                // Preload to ensure minimal latency on first play
                audio.preload = 'auto';
                audioCache[k] = audio;
            }
        });
    }, []);

    const playSound = useCallback((sound: SoundEffect, options?: UseAudioOptions) => {
        try {
            // Re-use cached audio or create a new one
            let audio = audioCache[sound];

            if (!audio) {
                audio = new Audio(SOUND_PATHS[sound]);
                audioCache[sound] = audio;
            }

            // For one-shot sounds that might be triggered rapidly (like clicks),
            // clone the node so multiple can overlap. For looping ambient sounds, re-use the same instance.
            if (!options?.loop) {
                audio = audio.cloneNode() as HTMLAudioElement;
            }

            audio.volume = options?.volume ?? 1.0;
            audio.loop = options?.loop ?? false;

            // Audio play() returns a promise which can fail if the user hasn't interacted with the page yet.
            // Catch the promise rejection to avoid unhandled errors spamming the console.
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.catch((error) => {
                    console.warn(`[useAudio] Auto-play prevented or failed for '${sound}':`, error);
                });
            }

            return audio;
        } catch (err) {
            console.error(`[useAudio] Error playing sound '${sound}':`, err);
            return null;
        }
    }, []);

    const stopSound = useCallback((sound: SoundEffect) => {
        const audio = audioCache[sound];
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
        }
    }, []);

    return { playSound, stopSound };
}
