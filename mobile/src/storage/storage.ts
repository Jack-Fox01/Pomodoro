import AsyncStorage from "@react-native-async-storage/async-storage";

export async function loadBool(key: string, fallback:boolean): Promise<boolean> {
    const saved = await AsyncStorage.getItem(key);
    if (saved === null) return fallback;
    return saved === 'true';
}

export async function saveBool(key:string, value: boolean): Promise<void> {
    await AsyncStorage.setItem(key, String(value));
}