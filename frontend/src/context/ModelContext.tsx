// import { createContext, useEffect, useMemo, useState, type ReactNode} from "react";
// import type { Model } from "./auth.ts";

// // const API_BASE_URL = "http://localhost:8000";

// const getApiUrl = () => {
//   // if (import.meta.env.PROD) {
//   //   return "";
//   // }

//   return `http://${window.location.hostname}:8000`;
// }

// const API_BASE_URL = getApiUrl();


// interface ModelContextType {
//   model: Model | null;
//   guess: (drawing: Blob) => Promise<void>;
  
// }

// export const ModelContext = createContext<ModelContextType | undefined>(undefined);

// export function ModelProvider({ children }: { children: ReactNode }) {

//   useEffect(() => {
    
//   }, []);

//   const apiFetch = async (endpoint: string, body: object) => {
    
//     const token = localStorage.getItem("token");

//     const headers: HeadersInit = {
//     "Content-Type": "application/json",
//     ...(token && { "Authorization": `Bearer ${token}` })};
    
//     const r = await fetch(`${API_BASE_URL}${endpoint}`, {
//       method: "POST",
//       headers: headers,
//       body: body ? JSON.stringify(body) : undefined
//     });

//     if (!r.ok) throw new Error(await r.text());
//     return r.json();
//   };

//   const guess = async (drawing: Blob) =>
//     await apiFetch("/guess", { drawing });

//   const draw = async (state: Blob, prompt: string) =>
//     await apiFetch("/draw", { state, prompt });

//   const value = useMemo(
//       () => ({ guess, draw }),
//       []
//   );

//   return <ModelContext.Provider value={value}>{children}</ModelContext.Provider>;
// }






































// import { createContext, useState, useMemo, type ReactNode } from "react";

// interface Prediction {
//   label: string;
//   confidence: number;
// }

// interface ModelContextType {
//   // --- Modo: IA adivina tu dibujo ---
//   prediction: Prediction | null;
//   isAnalysing: boolean;
//   guessImage: (drawing: Blob) => Promise<void>;

//   // --- Modo: Tú adivinas el dibujo de la IA ---
//   aiStrokes: number[][]; // Formato Sketch-RNN [dx, dy, p1, p2, p3]
//   getNewDrawing: (prompt: string) => Promise<void>;
//   checkMyGuess: (text: string) => Promise<{ correct: boolean }>;
// }

// const getApiUrl = () => {
//   // if (import.meta.env.PROD) {
//   //   return "";
//   // }

//   return `http://${window.location.hostname}:8000`;
// }

// const API_BASE_URL = getApiUrl();

// export const ModelContext = createContext<ModelContextType | undefined>(undefined);

// export function ModelProvider({ children }: { children: ReactNode }) {
//   const [prediction, setPrediction] = useState<Prediction | null>(null);
//   const [isAnalysing, setIsAnalysing] = useState(false);
//   const [aiStrokes, setAiStrokes] = useState<number[][]>([]);

//   // 1. IA ADIVINA (Enviamos Blob vía FormData)
//   const guessImage = async (drawing: Blob) => {
//     setIsAnalysing(true);
//     const formData = new FormData();
//     formData.append("file", drawing, "drawing.png");

//     try {
//       const r = await fetch(`${API_BASE_URL}/guess`, {
//         method: "POST",
//         headers: { ...(localStorage.getItem("token") && { "Authorization": `Bearer ${localStorage.getItem("token")}` })},
//         body: formData,
//       });
//       const data = await r.json();
//       setPrediction(data);
//     } catch (e) { console.error(e); }
//     finally { setIsAnalysing(false); }
//   };

//   // 2. IA DIBUJA (Recibimos coordenadas del modelo Sketch-RNN)
//   const getNewDrawing = async (prompt: string) => {
//     try {
//       const r = await fetch(`${API_BASE_URL}/generate_drawing?prompt=${prompt}`);
//       const data = await r.json(); 
//       // 'data.strokes' es una lista de trazos tipo: [[0,0,1,0,0], [5,2,1,0,0]...]
//       setAiStrokes(data.strokes);
//     } catch (e) { console.error(e); }
//   };

//   // 3. TÚ ADIVINAS (Enviamos texto simple)
//   const checkMyGuess = async (text: string) => {
//     const r = await fetch(`${API_BASE_URL}/verify_guess`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ guess: text })
//     });
//     return await r.json(); // { correct: true/false }
//   };

//   const value = useMemo(() => ({
//     prediction, isAnalysing, guessImage, 
//     aiStrokes, getNewDrawing, checkMyGuess
//   }), [prediction, isAnalysing, aiStrokes]);

//   return <ModelContext.Provider value={value}>{children}</ModelContext.Provider>;
// }



















import { createContext, useContext, useState, useMemo, type ReactNode } from "react";

// Definimos la forma de la respuesta de tu IA
// interface Prediction {
//   label: string;
//   confidence: number;
// }

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
    // "file" debe coincidir con el nombre del parámetro en FastAPI: file: UploadFile = File(...)
    formData.append("file", blob, "drawing.png");

    try {
      const response = await fetch(`${API_BASE_URL}/guess`, {
        method: "POST",
        headers: {
          // El navegador configura automáticamente el Content-Type para FormData
          ...(token && { "Authorization": `Bearer ${token}` }),
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Error en la petición");
      }

      const data = await response.json();
      // Asumimos que tu backend devuelve { "label": "manzana" }
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