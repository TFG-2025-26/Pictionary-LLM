import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import LandingPage from "../../src/pages/Landing/LandingPage";
import LoginPage from "../../src/pages/Login/LoginPage";
import RegisterPage from "../../src/pages/Register/RegisterPage";
import MainMenuPage from "../../src/pages/MainMenu/MainMenuPage";

const navigateMock = vi.fn();

const userMock = {
  session: { username: "Alonso" },
  isLoading: false,
  login: vi.fn(),
  register: vi.fn(),
  loginAsGuest: vi.fn(),
  logout: vi.fn(),
};

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

describe("Frontend pages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("LandingPage permite jugar como invitado", async () => {
    userMock.loginAsGuest.mockResolvedValueOnce(undefined);

    render(<LandingPage />);

    await userEvent.click(
      screen.getByRole("button", { name: "Jugar como Invitado" })
    );

    await waitFor(() => {
      expect(userMock.loginAsGuest).toHaveBeenCalled();
      expect(navigateMock).toHaveBeenCalledWith("/menu");
    });
  });

  it("LoginPage inicia sesión correctamente", async () => {
    userMock.login.mockResolvedValueOnce(undefined);

    render(<LoginPage />);

    await userEvent.type(screen.getByLabelText("Usuario"), "testuser");
    await userEvent.type(screen.getByLabelText("Contraseña"), "1234");
    await userEvent.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => {
      expect(userMock.login).toHaveBeenCalledWith("testuser", "1234");
      expect(navigateMock).toHaveBeenCalledWith("/menu");
    });
  });

  it("LoginPage muestra error si el login falla", async () => {
    userMock.login.mockRejectedValueOnce(new Error("Credenciales inválidas"));

    render(<LoginPage />);

    await userEvent.type(screen.getByLabelText("Usuario"), "testuser");
    await userEvent.type(screen.getByLabelText("Contraseña"), "mal");
    await userEvent.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByText("Credenciales inválidas")).toBeInTheDocument();
  });

  it("RegisterPage bloquea contraseñas distintas", async () => {
    render(<RegisterPage />);

    await userEvent.type(screen.getByLabelText("Username"), "nuevo");
    await userEvent.type(screen.getByLabelText("Correo"), "nuevo@test.com");
    await userEvent.type(screen.getByLabelText("Contraseña", { selector: 'input[name="password"]' }), "1234");
    await userEvent.type(
      screen.getByLabelText("Confirmar contraseña"),
      "4321"
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Crear cuenta" })
    );

    expect(
      await screen.findByText("Las contraseñas no coinciden")
    ).toBeInTheDocument();
    expect(userMock.register).not.toHaveBeenCalled();
  });

  it("RegisterPage registra y navega al login", async () => {
    userMock.register.mockResolvedValueOnce(undefined);

    render(<RegisterPage />);

    await userEvent.type(screen.getByLabelText("Username"), "nuevo");
    await userEvent.type(screen.getByLabelText("Correo"), "nuevo@test.com");
    await userEvent.type(screen.getByLabelText("Contraseña", { selector: 'input[name="password"]' }), "1234");
    await userEvent.type(screen.getByLabelText("Confirmar contraseña"),"1234");

    await userEvent.click(screen.getByRole("button", { name: "Crear cuenta" }));

    await waitFor(() => {
      expect(userMock.register).toHaveBeenCalledWith(
        "nuevo",
        "nuevo@test.com",
        "1234"
      );
      expect(navigateMock).toHaveBeenCalledWith("/", {
        state: { message: "¡Registrado exitosamente! Ya puedes iniciar sesión." },
      });
    });
  });

  it("MainMenuPage muestra el usuario y ejecuta logout", async () => {
    render(<MainMenuPage />);

    expect(screen.getByText("Bienvenid@, Alonso")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Logout" }));

    expect(userMock.logout).toHaveBeenCalled();
  });
});