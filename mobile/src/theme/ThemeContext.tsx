import { Palette, lightPalette, darkPalette, retroPalette } from "./palettes";
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from "react";
import { loadBool, saveBool } from "../storage/storage";

type ThemeValue = {
    colors: Palette;
    dark: boolean;
    retro: boolean;
    toggleDark: () => void;
    toggleRetro: () => void;
}

const ThemeContext = createContext<ThemeValue | null>(null);

const DARK_KEY = 'theme:dark';
const RETRO_KEY = 'theme:retro';

export function ThemeProvider({children }: {children:ReactNode}) {
    const [dark,setDark] = useState(false); 
    const [retro,setRetro] = useState(false);
    const [loaded,setLoaded] = useState(false);

     useEffect(() => {
        async function loadTheme() {
            const savedDark = await loadBool(DARK_KEY, false);
            const savedRetro = await loadBool(RETRO_KEY, false);
            setDark(savedDark);
            setRetro(savedRetro);
            setLoaded(true);
        }
        loadTheme();
    }, []);

    useEffect(() => {
        if (!loaded) return;
        saveBool(DARK_KEY, dark);
    }, [dark, loaded]);

    useEffect(() => {
        if (!loaded) return;
        saveBool(RETRO_KEY, retro);
    }, [retro, loaded]);


    const colors = retro ? retroPalette : dark ? darkPalette : lightPalette;

const value = useMemo(
    () => ({
        colors,
        dark,
        retro,
        toggleDark: () => setDark(prev => !prev),
        toggleRetro: () => setRetro(prev => !prev),
    }),
    [dark,retro]
);

return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme(): ThemeValue {
    const ctx = useContext(ThemeContext);
    if(!ctx) throw new Error('useAppTheme must be used inside a ThemeProvider');
    return ctx;
}