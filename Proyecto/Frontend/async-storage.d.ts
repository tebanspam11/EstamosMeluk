declare module '@react-native-async-storage/async-storage' {
  export interface AsyncStorageStatic {
    getItem(key: string, callback?: (error?: Error, result?: string | null) => void): Promise<string | null>;
    setItem(key: string, value: string, callback?: (error?: Error) => void): Promise<void>;
    removeItem(key: string, callback?: (error?: Error) => void): Promise<void>;
    mergeItem(key: string, value: string, callback?: (error?: Error) => void): Promise<void>;
    clear(callback?: (error?: Error) => void): Promise<void>;
    getAllKeys(callback?: (error?: Error, keys?: readonly string[]) => void): Promise<readonly string[]>;
    multiGet(keys: string[], callback?: (errors?: Error[], result?: [string, string | null][]) => void): Promise<readonly [string, string | null][]>;
    multiSet(keyValuePairs: string[][], callback?: (errors?: Error[]) => void): Promise<void>;
    multiRemove(keys: string[], callback?: (errors?: Error[]) => void): Promise<void>;
    multiMerge(keyValuePairs: string[][], callback?: (errors?: Error[]) => void): Promise<void>;
  }

  const AsyncStorage: AsyncStorageStatic;
  export default AsyncStorage;
}
