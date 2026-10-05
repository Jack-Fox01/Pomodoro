import { Palette, lightPalette, darkPalette } from "./palettes";
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from "react";
import { loadBool, saveBool } from "../storage/storage";

type ThemeValue = {
    colors: Palette;
    dark: boolean;
    toggleDark: () => void;
}

const ThemeContext = createContext<ThemeValue | null>(null);

const DARK_KEY = 'theme:dark';

export function ThemeProvider({children }: {children:ReactNode}) {
    const [dark,setDark] = useState(false);
    const [loaded,setLoaded] = useState(false);

    useEffect(() => {
        async function loadTheme() {
            const savedDark = await loadBool(DARK_KEY, false);
            setDark(savedDark);
            setLoaded(true);
        }
        loadTheme();
    }, []);

    useEffect(() => {
        if (!loaded) return;
        saveBool(DARK_KEY, dark);
    }, [dark, loaded]);

    const colors = dark ? darkPalette : lightPalette;

    const value = useMemo(
        () => ({
            colors,
            dark,
            toggleDark: () => setDark(prev => !prev),
        }),
        [dark]
    );

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme(): ThemeValue {
    const ctx = useContext(ThemeContext);
    if(!ctx) throw new Error('useAppTheme must be used inside a ThemeProvider');
    return ctx;
}
