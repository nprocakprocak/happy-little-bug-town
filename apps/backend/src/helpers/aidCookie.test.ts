import { describe, expect, it, vi } from "vitest";

import { AID_COOKIE_NAME } from "../constants/cookies.js";
import { clearAidCookie, setAidCookie } from "./aidCookie.js";

const signedOptions = { httpOnly: true, maxAge: 1000 };
const clearOptions = { httpOnly: true };

vi.mock("./signedCookieOptions.js", () => ({
  getSignedCookieOptions: () => signedOptions,
  getSignedClearCookieOptions: () => clearOptions,
}));

describe("aid cookie", () => {
  it("sets a signed aid cookie", () => {
    const cookie = vi.fn();

    setAidCookie({ cookie } as unknown as Parameters<typeof setAidCookie>[0], "aid-1");

    expect(cookie).toHaveBeenCalledWith(AID_COOKIE_NAME, "aid-1", signedOptions);
  });

  it("clears the aid cookie with the shared clear options", () => {
    const clearCookie = vi.fn();

    clearAidCookie({ clearCookie } as unknown as Parameters<typeof clearAidCookie>[0]);

    expect(clearCookie).toHaveBeenCalledWith(AID_COOKIE_NAME, clearOptions);
  });
});
