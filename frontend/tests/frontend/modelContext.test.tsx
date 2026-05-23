import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ModelProvider } from "../../src/context/ModelContext";
import { useModel } from "../../src/context/ModelContext";

function ModelConsumer() {
  const { prediction, isModelLoading, guessImage, clearPrediction } = useModel();

  return (
    <div>
      <div data-testid="prediction">{prediction ?? "null"}</div>
      <div data-testid="loading">{String(isModelLoading)}</div>
      <button
        type="button"
        onClick={() =>
          guessImage(new Blob(["fake"], { type: "image/png" }))
        }
      >
        guess
      </button>
      <button type="button" onClick={clearPrediction}>
        clear
      </button>
    </div>
  );
}

describe("ModelContext", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("actualiza la predicción al recibir respuesta correcta", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ label: "Cat" }),
    });

    vi.stubGlobal("fetch", fetchMock);

    render(
      <ModelProvider>
        <ModelConsumer />
      </ModelProvider>
    );

    await userEvent.click(screen.getByRole("button", { name: "guess" }));

    await waitFor(() => {
      expect(screen.getByTestId("prediction")).toHaveTextContent("Cat");
    });

    expect(screen.getByTestId("loading")).toHaveTextContent("false");
  });

  it("muestra error si la petición falla", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => "fallo interno",
    });

    vi.stubGlobal("fetch", fetchMock);

    render(
      <ModelProvider>
        <ModelConsumer />
      </ModelProvider>
    );

    await userEvent.click(screen.getByRole("button", { name: "guess" }));

    await waitFor(() => {
      expect(screen.getByTestId("prediction")).toHaveTextContent("Error al adivinar");
    });
  });

  it("borra la predicción manualmente", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ label: "Dog" }),
    });

    vi.stubGlobal("fetch", fetchMock);

    render(
      <ModelProvider>
        <ModelConsumer />
      </ModelProvider>
    );

    await userEvent.click(screen.getByRole("button", { name: "guess" }));

    await waitFor(() => {
      expect(screen.getByTestId("prediction")).toHaveTextContent("Dog");
    });

    await userEvent.click(screen.getByRole("button", { name: "clear" }));
    expect(screen.getByTestId("prediction")).toHaveTextContent("null");
  });
});