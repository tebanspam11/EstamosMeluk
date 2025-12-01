declare module '@react-native-async-storage/async-storage' {
  interface AsyncStorageStatic {
    setItem(key: string, value: string): Promise<void>;
    getItem(key: string): Promise<string | null>;
    removeItem(key: string): Promise<void>;
    mergeItem?(key: string, value: string): Promise<void>;
    clear(): Promise<void>;
    getAllKeys(): Promise<string[]>;
    multiGet?(keys: string[]): Promise<[string, string | null][]>;
    multiSet?(keyValuePairs: [string, string][]): Promise<void>;
    multiRemove?(keys: string[]): Promise<void>;
  }
  const AsyncStorage: AsyncStorageStatic;
  export default AsyncStorage;
}
