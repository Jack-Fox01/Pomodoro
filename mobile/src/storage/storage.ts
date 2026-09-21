import AsyncStorage from "@react-native-async-storage/async-storage";

export async function loadBool(key: string, fallback:boolean): Promise<boolean> {
    const saved = await AsyncStorage.getItem(key);
    if (saved === null) return fallback;
    return saved === 'true';
}

export async function saveBool(key:string, value: boolean): Promise<void> {
    await AsyncStorage.setItem(key, String(value));
}

export async function loadJSON<T>(key: string, fallback: T): Promise<T> {
    const raw = await AsyncStorage.getItem(key);
    if (raw === null) return fallback;
    try {
        return JSON.parse(raw) as T;
    } catch {
        return fallback;
    }
}

export async function saveJSON<T>(key: string, value: T): Promise<void> {
    await AsyncStorage.setItem(key, JSON.stringify(value));
}