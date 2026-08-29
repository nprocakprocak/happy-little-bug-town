"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { useAuth } from "../../context/AuthContext";
import { useMainStore } from "../../stores/main";
import { HOME_BANNER_HEIGHT_PX } from "../constants/layout";
import { waitForGoogleAccountsId } from "../helpers/googleAuth";

interface SettingsPopupProps {
  onClose: () => void;
}

export function SettingsPopup({ onClose }: SettingsPopupProps) {
  const { authUser, logout } = useAuth();
  const requiresLogin = useMainStore((state) => state.requiresLogin);
  const [mounted, setMounted] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const googleSignInButtonRef = useRef<HTMLDivElement>(null);

  const isSignedIn = Boolean(authUser?.isLinked);
  const showGoogleButton = !isSignedIn;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !showGoogleButton) {
      return;
    }

    return waitForGoogleAccountsId((accountsId) => {
      const buttonContainer = googleSignInButtonRef.current;
      if (!buttonContainer) {
        return;
      }

      buttonContainer.replaceChildren();
      accountsId.renderButton(buttonContainer, {
        type: "standard",
        shape: "rectangular",
        theme: "outline",
        text: "signin",
        size: "large",
        logo_alignment: "left",
      });
    });
  }, [mounted, showGoogleButton]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!mounted) {
    return null;
  }

  const statusMessage = isSignedIn
    ? `Signed in as ${authUser?.name ?? authUser?.email ?? "Google user"}`
    : requiresLogin
      ? "This account requires Google login to save progress."
      : "Log in to save your progress (we do not store your data)";

  return createPortal(
    <div className="fixed inset-0">
      <div className="absolute inset-0 bg-black/40" aria-hidden="true" />
      <div
        className="absolute inset-x-0 flex justify-center"
        style={{ top: HOME_BANNER_HEIGHT_PX }}
      >
        <div
          className="flex w-[84%] max-w-95 flex-col rounded-lg bg-stone-50 p-4 shadow-lg"
          role="dialog"
          aria-modal="true"
        >
          <p className="text-center text-lg font-medium text-stone-800">Settings</p>
          <p className="mt-3 text-center text-sm text-stone-600">{statusMessage}</p>

          {showGoogleButton && (
            <div ref={googleSignInButtonRef} className="mt-3 flex justify-center" />
          )}

          <div className="mt-4 flex justify-center gap-3">
            {isSignedIn ? (
              <button
                type="button"
                onClick={() => void handleLogout()}
                disabled={isLoggingOut}
                className="min-w-[20%] rounded-md bg-sky-500 px-6 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-sky-600 disabled:opacity-60"
              >
                {isLoggingOut ? "Logging out…" : "Log out"}
              </button>
            ) : (
              !requiresLogin && (
                <button
                  type="button"
                  className="min-w-[20%] rounded-md bg-sky-500 px-6 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-sky-600"
                >
                  Log in
                </button>
              )
            )}
            <button
              type="button"
              onClick={onClose}
              className="min-w-[20%] rounded-md bg-stone-200 px-6 py-2 text-sm font-medium text-stone-700 shadow-sm transition-colors hover:bg-stone-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
