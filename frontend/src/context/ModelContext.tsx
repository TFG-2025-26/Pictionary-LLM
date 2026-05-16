import { createContext, useContext, useState, useMemo, type ReactNode } from "react";

interface ModelContextType {
  prediction: string | null;
  isModelLoading: boolean;
  guessImage: (blob: Blob) => Promise<void>;
  clearPrediction: () => void;
}

// const API_BASE_URL = "http://localhost:8000";

const getApiUrl = () => {
  // if (import.meta.env.PROD) {
  //   return "";
  // }

  return `http://${window.location.hostname}:8000`;
}

const API_BASE_URL = getApiUrl();

const ModelContext = createContext<ModelContextType | undefined>(undefined);

export function ModelProvider({ children }: { children: ReactNode }) {
  const [prediction, setPrediction] = useState<string | null>(null);
  const [isModelLoading, setIsLoading] = useState(false);

  const guessImage = async (blob: Blob) => {
    setIsLoading(true);
    setPrediction(null);

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("file", blob, "drawing.png");

    try {
      const response = await fetch(`${API_BASE_URL}/guess`, {
        method: "POST",
        headers: {
          ...(token && { "Authorization": `Bearer ${token}` }),
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Error en la petición");
      }

      const data = await response.json();
      setPrediction(data.label);
    } catch (error) {
      console.error("Error contactando con el modelo:", error);
      setPrediction("Error al adivinar");
    } finally {
      setIsLoading(false);
    }
  };

  const clearPrediction = () => setPrediction(null);

  const value = useMemo(() => ({
    prediction,
    isModelLoading,
    guessImage,
    clearPrediction
  }), [prediction, isModelLoading]);

  return <ModelContext.Provider value={value}>{children}</ModelContext.Provider>;
}

export const useModel = () => {
  const context = useContext(ModelContext);
  if (!context) throw new Error("useModel debe usarse dentro de ModelProvider");
  return context;
};