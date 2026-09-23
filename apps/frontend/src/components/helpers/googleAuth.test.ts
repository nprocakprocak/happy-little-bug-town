// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";

import { loginWithGoogle } from "../../api/auth";
import { handleAuthReceiver, setGoogleAuthHandlers, waitForGoogleAccountsId } from "./googleAuth";

vi.mock("../../api/auth", () => ({
  loginWithGoogle: vi.fn(),
}));

describe("google auth helpers", () => {
  const user = { id: "user-1", isLinked: true };

  beforeEach(() => {
    setGoogleAuthHandlers(null);
    vi.mocked(loginWithGoogle).mockReset();
  });

  it("reports a signed-in user", async () => {
    const onSuccess = vi.fn();
    vi.mocked(loginWithGoogle).mockResolvedValue(user);
    setGoogleAuthHandlers({ onSuccess });

    handleAuthReceiver({ credential: "token", select_by: "auto" });

    await vi.waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(user);
    });
    expect(loginWithGoogle).toHaveBeenCalledWith("token");
  });

  it("reports login failures as errors", async () => {
    const onError = vi.fn();
    vi.mocked(loginWithGoogle).mockRejectedValue("nope");
    setGoogleAuthHandlers({ onSuccess: vi.fn(), onError });

    handleAuthReceiver({ credential: "token", select_by: "auto" });

    await vi.waitFor(() => {
      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });
    expect(onError.mock.calls[0]?.[0].message).toBe("nope");
  });

  it("calls the ready listener immediately when the client exists", () => {
    const accountsId = { initialize: vi.fn() };
    vi.stubGlobal("google", { accounts: { id: accountsId } });
    const onReady = vi.fn();

    const cancel = waitForGoogleAccountsId(onReady);

    expect(onReady).toHaveBeenCalledWith(accountsId);
    cancel();
  });

  it("polls until the client appears and stops after cancellation", () => {
    vi.useFakeTimers();
    vi.stubGlobal("google", undefined);
    const onReady = vi.fn();
    const cancel = waitForGoogleAccountsId(onReady);

    vi.advanceTimersByTime(100);
    expect(onReady).not.toHaveBeenCalled();

    const accountsId = { initialize: vi.fn() };
    vi.stubGlobal("google", { accounts: { id: accountsId } });
    vi.advanceTimersByTime(100);
    expect(onReady).toHaveBeenCalledWith(accountsId);

    onReady.mockClear();
    cancel();
    vi.advanceTimersByTime(200);
    expect(onReady).not.toHaveBeenCalled();
    vi.useRealTimers();
  });
});
