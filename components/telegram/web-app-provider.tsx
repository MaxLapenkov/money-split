"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

type WebApp = typeof import("@twa-dev/sdk").default;

interface WebAppContextValue {
  webApp: WebApp | null;
  isReady: boolean;
}

const WebAppContext = createContext<WebAppContextValue>({
  webApp: null,
  isReady: false,
});

export function useWebApp() {
  return useContext(WebAppContext);
}

interface AuthState {
  status: "idle" | "loading" | "authenticated" | "error";
  userId: string | null;
}

const AuthContext = createContext<AuthState>({
  status: "idle",
  userId: null,
});

export function useAuth() {
  return useContext(AuthContext);
}

export function WebAppProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const [ctx, setCtx] = useState<WebAppContextValue>({
    webApp: null,
    isReady: false,
  });

  const [auth, setAuth] = useState<AuthState>({
    status: "idle",
    userId: null,
  });

  const authenticate = useCallback(async (initData: string) => {
    setAuth({ status: "loading", userId: null });

    try {
      const res = await fetch("/api/auth/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initData }),
      });

      const data = await res.json();

      if (data.ok) {
        setAuth({ status: "authenticated", userId: data.userId });
        router.refresh();
      } else {
        console.error("Auth failed:", data.error);
        setAuth({ status: "error", userId: null });
      }
    } catch (err) {
      console.error("Auth request error:", err);
      setAuth({ status: "error", userId: null });
    }
  }, [router]);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const sdk = (await import("@twa-dev/sdk")).default;

        if (cancelled) return;

        sdk.ready();
        sdk.disableVerticalSwipes();
        sdk.expand();

        const applyTheme = () => {
          const scheme = sdk.colorScheme;
          document.documentElement.classList.toggle("dark", scheme === "dark");
        };

        applyTheme();
        sdk.onEvent("themeChanged", applyTheme);

        setCtx({ webApp: sdk, isReady: true });

        if (sdk.initData) {
          authenticate(sdk.initData);
        }
      } catch {
        setCtx({ webApp: null, isReady: false });
      }
    }

    init();

    return () => {
      cancelled = true;
    };
  }, [authenticate]);

  return (
    <WebAppContext.Provider value={ctx}>
      <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
    </WebAppContext.Provider>
  );
}
