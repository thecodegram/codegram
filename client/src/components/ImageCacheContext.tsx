import { createContext, useContext, useState } from "react";

interface ImageCacheContextData {
  cache: Record<string, string | null>; // Key is username, value is Blob URL
  setCache: (username: string, imageData: string | null) => void;
  clearCache: () => void;
}

export const ImageCacheContext = createContext<
  ImageCacheContextData | undefined
>(undefined);

export const ImageCacheProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [cache, setCacheState] = useState<Record<string, string | null>>({});

  const setCache = (username: string, imageData: string | null) => {
    setCacheState((prevCache) => ({
      ...prevCache,
      [username]: imageData,
    }));
  };

  const clearCache = () => {
    // Revoke all object URLs
    for (let key in cache) {
      if (cache[key]) {
        URL.revokeObjectURL(cache[key] as string);
      }
    }

    setCacheState({});
  };

  return (
    <ImageCacheContext.Provider value={{ cache, setCache, clearCache }}>
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
