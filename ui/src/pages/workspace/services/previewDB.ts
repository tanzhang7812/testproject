export interface PreviewData {
    id: string;
    data: any;
    schema: any;
    timestamp: number;
}

export interface NodeTimestamp {
    [nodeId: string]: number;
}

class PreviewDBService {
    private dbName = 'PreviewDB';
    private storeName = 'preview';
    private version = 1;

    private async getDB(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName, { keyPath: 'id' });
                }
            };
        });
    }

    async savePreview(previewData: PreviewData): Promise<void> {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.put(previewData);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    }

    async getPreview(nodeId: string): Promise<PreviewData | null> {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.get(nodeId);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result || null);
        });
    }
}

export const previewDB = new PreviewDBService();