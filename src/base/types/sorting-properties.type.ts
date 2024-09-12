// from T: 'key1' | 'key2' | 'key3'
export type SortingPropertiesType<T> = Array<keyof T>;
