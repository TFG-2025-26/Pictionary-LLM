import * as React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import SinglePlayerPage from "../../src/pages/SinglePlayer/SinglePlayerPage";
import PracticePage from "../../src/pages/Practice/PracticePage";
import DrawingPage from "../../src/pages/Drawing/DrawingPage";
import GuessingPage from "../../src/pages/Guessing/GuessingPage";

const navigateMock = vi.hoisted(() => vi.fn());

const userMock = vi.hoisted(() => ({
  session: { username: "Alonso" },
  isLoading: false,
  login: vi.fn(),
  register: vi.fn(),
  loginAsGuest: vi.fn(),
  logout: vi.fn(),
}));

const canvasApi = vi.hoisted(() => ({
  clear: vi.fn(),
  getBlob: vi.fn(),
  drawModel: vi.fn(),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  );

  return {
    ...actual,
    useNavigate: () => navigateMock,
    useLocation: () => ({ state: null }),
  };
});

vi.mock("../../src/context/useUser", () => ({
  useUser: () => userMock,
}));

vi.mock("../../src/components/DrawingCanvas/DrawingCanvas", () => ({
  default: React.forwardRef((_props, ref) => {
    React.useImperativeHandle(ref, () => canvasApi as any);
    return <div data-testid="mock-canvas" />;
  }),
}));

function makeResponse(body: any, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    text: async () => (typeof body === "string" ? body : JSON.stringify(body)),
  } as any;
}

describe("SinglePlayerPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("muestra el menú de un jugador", () => {
    render(<SinglePlayerPage />);

    expect(screen.getByRole("heading", { name: "Un jugador" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Volver al menú" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Práctica" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tú dibujas, la IA adivina" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "La IA dibuja mientras tú adivinas" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Logout" })).toBeInTheDocument();
  });

  it("vuelve al menú principal", async () => {
    const user = userEvent.setup();
    render(<SinglePlayerPage />);

    await user.click(screen.getByRole("button", { name: "Volver al menú" }));

    expect(navigateMock).toHaveBeenCalledWith("/menu");
  });

  it("navega a práctica", async () => {
    const user = userEvent.setup();
    render(<SinglePlayerPage />);

    await user.click(screen.getByRole("button", { name: "Práctica" }));

    expect(navigateMock).toHaveBeenCalledWith("/practice");
  });

  it("navega a dibujo", async () => {
    const user = userEvent.setup();
    render(<SinglePlayerPage />);

    await user.click(screen.getByRole("button", { name: "Tú dibujas, la IA adivina" }));

    expect(navigateMock).toHaveBeenCalledWith("/drawing");
  });

  it("navega a adivinanza", async () => {
    const user = userEvent.setup();
    render(<SinglePlayerPage />);

    await user.click(screen.getByRole("button", { name: "La IA dibuja mientras tú adivinas" }));

    expect(navigateMock).toHaveBeenCalledWith("/guessing");
  });

  it("ejecuta logout", async () => {
    const user = userEvent.setup();
    render(<SinglePlayerPage />);

    await user.click(screen.getByRole("button", { name: "Logout" }));

    expect(userMock.logout).toHaveBeenCalled();
  });
});

describe("PracticePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("muestra la barra de herramientas por defecto", () => {
    const { container } = render(<PracticePage />);

    expect(screen.getByRole("heading", { name: "Modo Práctica" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Limpiar Lienzo" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Borrador" })).toBeInTheDocument();

    const colorInput = container.querySelector('input[type="color"]') as HTMLInputElement;
    const rangeInput = screen.getByRole("slider") as HTMLInputElement;

    expect(colorInput.value).toBe("#000000");
    expect(rangeInput.value).toBe("5");
    expect(screen.getByText("Grosor: 5")).toBeInTheDocument();
  });

  it("permite cambiar color, grosor y modo borrador", async () => {
    const user = userEvent.setup();
    const { container } = render(<PracticePage />);

    const colorInput = container.querySelector('input[type="color"]') as HTMLInputElement;
    const rangeInput = screen.getByRole("slider") as HTMLInputElement;

    fireEvent.change(colorInput, { target: { value: "#ff0000" } });
    expect(colorInput.value).toBe("#ff0000");

    await user.click(screen.getByRole("button", { name: "Borrador" }));
    expect(screen.getByRole("button", { name: "Pincel" })).toBeInTheDocument();

    fireEvent.change(colorInput, { target: { value: "#00ff00" } });
    expect(colorInput.value).toBe("#00ff00");

    fireEvent.change(rangeInput, { target: { value: "12" } });
    expect(screen.getByText("Grosor: 12")).toBeInTheDocument();
  });

  it("limpia el lienzo desde la ref", async () => {
    const user = userEvent.setup();
    render(<PracticePage />);

    await user.click(screen.getByRole("button", { name: "Limpiar Lienzo" }));

    expect(canvasApi.clear).toHaveBeenCalled();
  });

  it("vuelve al menú de un jugador", async () => {
    const user = userEvent.setup();
    render(<PracticePage />);

    await user.click(screen.getByRole("button", { name: "Volver al menú" }));

    expect(navigateMock).toHaveBeenCalledWith("/singleplayer");
  });
});

describe("DrawingPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem("token", "token-abc");
    canvasApi.clear.mockImplementation(() => undefined);
    canvasApi.getBlob.mockResolvedValue(new Blob(["fake"], { type: "image/png" }));
    canvasApi.drawModel.mockResolvedValue(undefined);
  });

  it("muestra la pantalla inicial si no hay partida activa", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/draw/resume")) {
        return makeResponse({ active: false });
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });

    vi.stubGlobal("fetch", fetchMock);

    render(<DrawingPage />);

    expect(await screen.findByText("¿Listo para demostrar tu arte?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "¡Empezar a Dibujar!" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Salir al menú" })).toBeInTheDocument();
  });

  it("recupera una partida activa al cargar", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/draw/resume")) {
        return makeResponse({
          active: true,
          word: "cat",
          score: 70,
        });
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });

    vi.stubGlobal("fetch", fetchMock);

    render(<DrawingPage />);

    expect(await screen.findByText("¡Partida recuperada! Sigue dibujando.")).toBeInTheDocument();
    expect(screen.getByText("CAT")).toBeInTheDocument();
    expect(screen.getByText("Puntos en juego:")).toBeInTheDocument();
    expect(screen.getByText("70")).toBeInTheDocument();
  });

  it("inicia una nueva partida y limpia el lienzo", async () => {
    const user = userEvent.setup();

    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.includes("/draw/resume")) {
        return makeResponse({ active: false });
      }

      if (url.includes("/draw/start")) {
        return makeResponse({ word: "dog" });
      }

      throw new Error(`Unexpected fetch: ${url}`);
    });

    vi.stubGlobal("fetch", fetchMock);

    render(<DrawingPage />);

    await user.click(screen.getByRole("button", { name: "¡Empezar a Dibujar!" }));

    expect(canvasApi.clear).toHaveBeenCalled();
    expect(await screen.findByText("¡Empieza a dibujar!")).toBeInTheDocument();
    expect(screen.getByText("TIENES QUE DIBUJAR:")).toBeInTheDocument();
    expect(screen.getByText("DOG")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Me rindo" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Limpiar lienzo" })).toBeEnabled();
  });

  it("permite rendirse y vuelve al estado inicial", async () => {
    const user = userEvent.setup();

    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.includes("/draw/resume")) {
        return makeResponse({ active: false });
      }

      if (url.includes("/draw/start")) {
        return makeResponse({ word: "house" });
      }

      if (url.includes("/draw/abandon")) {
        return makeResponse({ message: "Te has rendido" });
      }

      throw new Error(`Unexpected fetch: ${url}`);
    });

    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(window, "confirm").mockReturnValue(true);

    render(<DrawingPage />);

    await user.click(screen.getByRole("button", { name: "¡Empezar a Dibujar!" }));
    await user.click(screen.getByRole("button", { name: "Me rindo" }));

    expect(await screen.findByText(/Te has rendido/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "¡Empezar a Dibujar!" })).toBeInTheDocument();
  });

  it("si cancelas el abandono no hace la petición", async () => {
    const user = userEvent.setup();

    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.includes("/draw/resume")) {
        return makeResponse({ active: false });
      }

      if (url.includes("/draw/start")) {
        return makeResponse({ word: "tree" });
      }

      if (url.includes("/draw/abandon")) {
        return makeResponse({ message: "Te has rendido" });
      }

      throw new Error(`Unexpected fetch: ${url}`);
    });

    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(window, "confirm").mockReturnValue(false);

    render(<DrawingPage />);

    await user.click(screen.getByRole("button", { name: "¡Empezar a Dibujar!" }));
    await user.click(screen.getByRole("button", { name: "Me rindo" }));

    expect(fetchMock).not.toHaveBeenCalledWith(
      expect.stringContaining("/draw/abandon"),
      expect.anything()
    );
    expect(screen.getByText("TREE")).toBeInTheDocument();
  });
});

describe("GuessingPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem("token", "token-abc");
    canvasApi.clear.mockImplementation(() => undefined);
    canvasApi.getBlob.mockResolvedValue(new Blob(["fake"], { type: "image/png" }));
    canvasApi.drawModel.mockResolvedValue(undefined);
  });

  it("muestra la pantalla inicial si no hay partida activa", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/guess/resume")) {
        return makeResponse({ active: false });
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });

    vi.stubGlobal("fetch", fetchMock);

    render(<GuessingPage />);

    expect(await screen.findByText("¿Preparado?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "¡Empezar Juego!" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Salir" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Escribe tu respuesta...")).toBeDisabled();
  });

  it("recupera una partida activa y dibuja el modelo tras el timeout", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.includes("/guess/resume")) {
        return makeResponse({
          active: true,
          model_id: "cat",
          score: 80,
          message: "¡Partida recuperada! Sigue intentándolo.",
        });
      }

      throw new Error(`Unexpected fetch: ${url}`);
    });

    vi.stubGlobal("fetch", fetchMock);

    render(<GuessingPage />);

    expect(await screen.findByText("¡Partida recuperada! Sigue intentándolo.")).toBeInTheDocument();
    expect(screen.getByText("Puntos actuales:")).toBeInTheDocument();
    expect(screen.getByText("80")).toBeInTheDocument();

    await waitFor(
      () => {
        expect(canvasApi.drawModel).toHaveBeenCalledWith("cat");
      },
      { timeout: 3000 }
    );
  });

  it("inicia una nueva partida y dibuja el modelo", async () => {
    const user = userEvent.setup();

    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.includes("/guess/resume")) {
        return makeResponse({ active: false });
      }

      if (url.includes("/guess/start")) {
        return makeResponse({ model_id: "car" });
      }

      throw new Error(`Unexpected fetch: ${url}`);
    });

    vi.stubGlobal("fetch", fetchMock);

    render(<GuessingPage />);

    await user.click(screen.getByRole("button", { name: "¡Empezar Juego!" }));

    expect(canvasApi.drawModel).toHaveBeenCalledWith("car");
    expect(screen.getByRole("button", { name: "Redibujar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Me rindo" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Escribe tu respuesta...")).toBeEnabled();
    expect(screen.getByText("Puntos actuales:")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
  });

  it("acepta una respuesta incorrecta y limpia el input", async () => {
    const user = userEvent.setup();

    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);

      if (url.includes("/guess/resume")) {
        return makeResponse({ active: false });
      }

      if (url.includes("/guess/start")) {
        return makeResponse({ model_id: "car" });
      }

      if (url.includes("/guess/try")) {
        expect(init?.headers).toEqual(
          expect.objectContaining({
            "Content-Type": "application/json",
          })
        );
        return makeResponse({ correct: false, score: 85 });
      }

      throw new Error(`Unexpected fetch: ${url}`);
    });

    vi.stubGlobal("fetch", fetchMock);

    render(<GuessingPage />);

    await user.click(screen.getByRole("button", { name: "¡Empezar Juego!" }));
    await user.type(screen.getByPlaceholderText("Escribe tu respuesta..."), "casa");
    await user.click(screen.getByRole("button", { name: "Enviar" }));

    expect(await screen.findByText("¡Error! Inténtalo de nuevo.")).toBeInTheDocument();
    expect(screen.getByText("85")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Escribe tu respuesta...")).toHaveValue("");
  });

  it("acepta una respuesta correcta y termina la partida", async () => {
    const user = userEvent.setup();

    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.includes("/guess/resume")) {
        return makeResponse({ active: false });
      }

      if (url.includes("/guess/start")) {
        return makeResponse({ model_id: "cat" });
      }

      if (url.includes("/guess/try")) {
        return makeResponse({ correct: true, score: 95, word: "cat" });
      }

      throw new Error(`Unexpected fetch: ${url}`);
    });

    vi.stubGlobal("fetch", fetchMock);

    render(<GuessingPage />);

    await user.click(screen.getByRole("button", { name: "¡Empezar Juego!" }));
    await user.type(screen.getByPlaceholderText("Escribe tu respuesta..."), "cat");
    await user.click(screen.getByRole("button", { name: "Enviar" }));

    expect(await screen.findByText("¡Correcto! Has ganado 95 puntos.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Jugar otra vez" })).toBeInTheDocument();
    expect(screen.getByText("95")).toBeInTheDocument();
  });

  it("redibuja la IA y actualiza la puntuación", async () => {
    const user = userEvent.setup();

    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.includes("/guess/resume")) {
        return makeResponse({ active: false });
      }

      if (url.includes("/guess/start")) {
        return makeResponse({ model_id: "house" });
      }

      if (url.includes("/guess/redraw")) {
        return makeResponse({ redraw_count: 3, current_score: 90 });
      }

      throw new Error(`Unexpected fetch: ${url}`);
    });

    vi.stubGlobal("fetch", fetchMock);

    render(<GuessingPage />);

    await user.click(screen.getByRole("button", { name: "¡Empezar Juego!" }));
    await user.click(screen.getByRole("button", { name: "Redibujar" }));

    expect(canvasApi.drawModel).toHaveBeenCalledTimes(2);
    expect(canvasApi.drawModel).toHaveBeenLastCalledWith("house");
    expect(screen.getByText("90")).toBeInTheDocument();
  });

  it("permite rendirse y limpiar el lienzo", async () => {
    const user = userEvent.setup();

    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.includes("/guess/resume")) {
        return makeResponse({ active: false });
      }

      if (url.includes("/guess/start")) {
        return makeResponse({ model_id: "dog" });
      }

      if (url.includes("/guess/abandon")) {
        return makeResponse({ message: "Partida cancelada", word: "dog" });
      }

      throw new Error(`Unexpected fetch: ${url}`);
    });

    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(window, "confirm").mockReturnValue(true);

    render(<GuessingPage />);

    await user.click(screen.getByRole("button", { name: "¡Empezar Juego!" }));
    await user.click(screen.getByRole("button", { name: "Me rindo" }));

    expect(canvasApi.clear).toHaveBeenCalled();
    expect(await screen.findByText("Te rendiste. La palabra era: DOG")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "¡Empezar Juego!" })).toBeInTheDocument();
  });
});