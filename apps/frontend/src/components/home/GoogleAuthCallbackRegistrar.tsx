"use client";

import { useEffect } from "react";

import { handleAuthReceiver, waitForGoogleAccountsId } from "../helpers/googleAuth";

export function GoogleAuthCallbackRegistrar() {
  useEffect(() => {
    return waitForGoogleAccountsId((accountsId) => {
      if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
        return;
      }

      accountsId.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: handleAuthReceiver,
        context: "signin",
        ux_mode: "popup",
      });
    });
  }, []);

  return null;
}
