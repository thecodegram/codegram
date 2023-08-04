// ImageCacheContext.ts
import { createContext, useContext, useEffect, useState } from "react";


export interface ImageCacheItem {
  imageData: string | null;
  timestamp: number; // Unix timestamp when the item was added to the cache
}
interface ImageCacheContextData {
  cache: Record<string, ImageCacheItem>; // Key is username, value is Blob URL
  setCache: (username: string, imageData: string | null) => void;
  clearCache: () => void;
  loadingCache: Set<string>;
  addUsernameToLoadingCache: (username:string) => void;
  removeFromCache: (username: string) => void;
}

const CACHE_EXPIRATION_TIME = 12 * 60 * 60 * 1000; // 12hrs

export const ImageCacheContext = createContext<
  ImageCacheContextData | undefined
>(undefined);

export const ImageCacheProvider = ({ children }: { children: React.ReactNode }) => {
  const [db, setDb] = useState<IDBDatabase | null>(null);
  const [cache, setCache] = useState<Record<string, ImageCacheItem>>({});
  const [loadingCache, setLoadingCache] = useState<Set<string>>(new Set());

  const initializeDB = async (): Promise<IDBDatabase> => {
    const dbVersion = 2;
    const dbName = "imageCacheDB";
    const objectStoreName = "profilePictures";
  
    return new Promise<IDBDatabase>((resolve, reject) => {
      const request = window.indexedDB.open(dbName, dbVersion);
  
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        db.createObjectStore(objectStoreName);
      };
  
      request.onsuccess = () => resolve(request.result as IDBDatabase);
      request.onerror = () => reject(request.error);
    });
  };

  useEffect(() => {
    initializeDB().then((database: IDBDatabase) => {
      setDb(database);

      // Retrieve cache from IndexedDB on component mount
      const objectStoreName = "profilePictures";
      const transaction = database.transaction([objectStoreName], "readwrite");
      const objectStore = transaction.objectStore(objectStoreName);
      const request = objectStore.getAll();

      request.onsuccess = () => {
        const data = request.result;
        if (isRecordOfStringAndNullable(data)) {
          setCache(data);
        } else {
          console.error("Invalid cache data format");
        }
      };
    });
  }, []);

  function isRecordOfStringAndNullable(data: any): data is Record<string, ImageCacheItem> {
    return typeof data === "object" && data !== null;
  }

  const setCacheValue = (username: string, imageData: string | null) => {
    if (db) {
      const objectStoreName = "profilePictures";
      const transaction = db.transaction([objectStoreName], "readwrite");
      const objectStore = transaction.objectStore(objectStoreName);

      objectStore.put(imageData, username);

      // Update the in-memory cache with the new value
      setCache((prevCache) => ({
        ...prevCache,
        [username]: {
          imageData, 
          timestamp: Date.now()
        }
      }));

      // Remove the username from the loadingCache once data is cached
      setLoadingCache((prevLoadingCache) => {
        const newLoadingCache = new Set(prevLoadingCache);
        newLoadingCache.delete(username);
        return newLoadingCache;
      });
    }
  };

  const clearCache = () => {
    if (db) {
      const objectStoreName = "profilePictures";
      const transaction = db.transaction([objectStoreName], "readwrite");
      const objectStore = transaction.objectStore(objectStoreName);

      objectStore.clear();

      // Clear the in-memory cache
      setCache({});
    }
  };

  const addUsernameToLoadingCache = (username: string) => {
    setLoadingCache((prevLoadingCache) => prevLoadingCache.add(username));
  };

  const removeFromCache = (username: string) => {
    setCache((prevCache) => {
      const updatedCache = { ...prevCache };
      delete updatedCache[username];
      return updatedCache;
    });
  };


  // Evict records from cache if they have been there for longer than CACHE_EXPIRATION_TIME 
  const clearExpiredCacheItems = () => {
    const now = Date.now();
    const updatedCache: Record<string, ImageCacheItem> = {};
    for (const [username, item] of Object.entries(cache)) {
      if (now - item.timestamp > CACHE_EXPIRATION_TIME) {
        updatedCache[username] = item;
      }
    }
    setCache(updatedCache);
  };

  useEffect(() => {
    // Clear expired cache items on component mount
    clearExpiredCacheItems();
    // eslint-disable-next-line
  }, []);

  return (
    <ImageCacheContext.Provider value={{ cache, setCache: setCacheValue, clearCache, loadingCache, addUsernameToLoadingCache, removeFromCache }}>
      {children}
    </ImageCacheContext.Provider>
  );
};

export const useImageCache = () => {
  const context = useContext(ImageCacheContext);
  if (!context) {
    throw new Error("useImageCache must be used within an ImageCacheProvider");
  }

  return context;
};
