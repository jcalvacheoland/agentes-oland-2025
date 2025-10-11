export function setInLocalstorage<T>(key: string, value: T): void {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
  } catch (error) {
    console.error(`Error guardando en localStorage [${key}]:`, error);
  }
}


export function getFromLocalstorage<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error leyendo de localStorage [${key}]:`, error);
    return null;
  }
}
