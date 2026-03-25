"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

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

export function WebAppProvider({ children }: { children: ReactNode }) {
  const [ctx, setCtx] = useState<WebAppContextValue>({
    webApp: null,
    isReady: false,
  });

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
      } catch {
        setCtx({ webApp: null, isReady: false });
      }
    }

    init();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <WebAppContext.Provider value={ctx}>{children}</WebAppContext.Provider>
  );
}
