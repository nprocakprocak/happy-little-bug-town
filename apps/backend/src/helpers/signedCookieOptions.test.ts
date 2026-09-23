import { afterEach, describe, expect, it, vi } from "vitest";

import { getSignedClearCookieOptions, getSignedCookieOptions } from "./signedCookieOptions.js";

vi.mock("../config/authEnv.js", () => ({
  loadAuthEnv: () => ({
    googleClientId: "client",
    sessionSecret: "0123456789abcdef",
    sessionTtlDays: 2,
  }),
}));

describe("signed cookie options", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses a cross-site cookie when COOKIE_SECURE is true", () => {
    vi.stubEnv("COOKIE_SECURE", "true");

    expect(getSignedCookieOptions()).toMatchObject({
      httpOnly: true,
      signed: true,
      secure: true,
      sameSite: "none",
      partitioned: true,
      maxAge: 2 * 24 * 60 * 60 * 1000,
    });
  });

  it("uses a lax cookie when COOKIE_SECURE is false", () => {
    vi.stubEnv("COOKIE_SECURE", "false");
    vi.stubEnv("NODE_ENV", "production");

    expect(getSignedCookieOptions()).toMatchObject({
      secure: false,
      sameSite: "lax",
      partitioned: false,
    });
  });

  it("treats development as insecure and every other environment as secure", () => {
    vi.stubEnv("COOKIE_SECURE", undefined);

    vi.stubEnv("NODE_ENV", "development");
    expect(getSignedCookieOptions().secure).toBe(false);

    vi.stubEnv("NODE_ENV", "production");
    expect(getSignedCookieOptions().secure).toBe(true);
  });

  it("omits maxAge when clearing a cookie", () => {
    vi.stubEnv("COOKIE_SECURE", "false");

    expect(getSignedClearCookieOptions()).toEqual({
      httpOnly: true,
      signed: true,
      secure: false,
      sameSite: "lax",
      partitioned: false,
    });
  });
});
