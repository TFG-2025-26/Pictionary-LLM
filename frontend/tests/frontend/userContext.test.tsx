import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserProvider } from "../../src/context/UserContext";
import { useUser } from "../../src/context/useUser";

function UserConsumer() {
  const { session, isLoading, loginAsGuest, logout } = useUser();

  return (
    <div>
      <div data-testid="session">{session ? session.username : "null"}</div>
      <div data-testid="loading">{String(isLoading)}</div>
      <button type="button" onClick={loginAsGuest}>
        guest
      </button>
      <button type="button" onClick={logout}>
        logout
      </button>
    </div>
  );
}

describe("UserContext", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("guarda sesión al entrar como invitado", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        access_token: "token_guest",
        user: {
          id: "1234",
          username: "Guest_1234",
        },
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    render(
      <UserProvider>
        <UserConsumer />
      </UserProvider>
    );

    await userEvent.click(screen.getByRole("button", { name: "guest" }));

    await waitFor(() => {
      expect(screen.getByTestId("session")).toHaveTextContent("Guest_1234");
    });

    expect(localStorage.getItem("token")).toBe("token_guest");
    expect(localStorage.getItem("user_data")).toContain("Guest_1234");
  });

  it("borra la sesión al hacer logout", async () => {
    localStorage.setItem("token", "abc");
    localStorage.setItem("user_data", JSON.stringify({ username: "Alonso" }));

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ user: { username: "Alonso" } }),
    });

    vi.stubGlobal("fetch", fetchMock);

    render(
      <UserProvider>
        <UserConsumer />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    await userEvent.click(screen.getByRole("button", { name: "logout" }));

    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("user_data")).toBeNull();
    expect(screen.getByTestId("session")).toHaveTextContent("null");
  });
});