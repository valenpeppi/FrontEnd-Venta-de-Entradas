export class StorageService {
    static setItem(key: string, value: string): void {
        try {
            localStorage.setItem(key, value);
        } catch (e) {
            console.error('Error saving to localStorage:', e);
        }
    }

    static getItem(key: string): string | null {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            console.error('Error reading from localStorage:', e);
            return null;
        }
    }

    static removeItem(key: string): void {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.error('Error removing from localStorage:', e);
        }
    }

    static clear(): void {
        try {
            localStorage.clear();
        } catch (e) {
            console.error('Error clearing localStorage:', e);
        }
    }
}
