"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2Icon } from "lucide-react";
import {
  TELEGRAM_THEME_STORAGE_KEY,
  type TelegramThemeStorageValue,
} from "@/lib/telegram-theme-storage";

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
  const pathname = usePathname();

  const [ctx, setCtx] = useState<WebAppContextValue>({
    webApp: null,
    isReady: false,
  });

  const [auth, setAuth] = useState<AuthState>({
    status: "idle",
    userId: null,
  });

  /** С первого кадра до завершения init и (при invite) до навигации в группу */
  const [uiBlocked, setUiBlocked] = useState(true);
  /** Успешный invite + router.replace — снимаем блок только после смены pathname */
  const [awaitingInviteNavigation, setAwaitingInviteNavigation] = useState(false);
  const [overlayHint, setOverlayHint] = useState<"loading" | "invite">(
    "loading",
  );

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
    if (!awaitingInviteNavigation) return;
    if (
      pathname.startsWith("/groups/") &&
      pathname !== "/groups/new"
    ) {
      setUiBlocked(false);
      setAwaitingInviteNavigation(false);
    }
  }, [pathname, awaitingInviteNavigation]);

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
          const isDark = scheme === "dark";
          document.documentElement.classList.toggle("dark", isDark);
          try {
            const value: TelegramThemeStorageValue = isDark ? "dark" : "light";
            localStorage.setItem(TELEGRAM_THEME_STORAGE_KEY, value);
          } catch {
            // ignore quota / private mode
          }
        };

        applyTheme();
        sdk.onEvent("themeChanged", applyTheme);

        const startParam = sdk.initDataUnsafe?.start_param;
        const isInviteJoin = startParam?.startsWith("join_") ?? false;
        if (isInviteJoin) {
          setOverlayHint("invite");
        }

        setCtx({ webApp: sdk, isReady: true });

        if (sdk.initData) {
          await authenticate(sdk.initData);
        }

        if (cancelled) return;

        if (isInviteJoin && startParam) {
          const inviteToken = startParam.slice(5);
          try {
            const res = await fetch("/api/invite/resolve", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ inviteToken }),
            });
            const data = await res.json();
            if (data.ok) {
              setAwaitingInviteNavigation(true);
              router.replace(`/groups/${data.groupId}`);
              return;
            }
          } catch {
            // fall through to unblock
          }
          setUiBlocked(false);
          setOverlayHint("loading");
        } else {
          setUiBlocked(false);
        }
      } catch {
        setCtx({ webApp: null, isReady: false });
        setUiBlocked(false);
        setAwaitingInviteNavigation(false);
      }
    }

    init();

    return () => {
      cancelled = true;
    };
  }, [authenticate, router]);

  return (
    <WebAppContext.Provider value={ctx}>
      <AuthContext.Provider value={auth}>
        <div
          className={uiBlocked ? "pointer-events-none" : undefined}
          inert={uiBlocked ? true : undefined}
        >
          {children}
        </div>
        {uiBlocked ? (
          <div
            className="fixed inset-0 z-100 flex flex-col items-center justify-center gap-3 bg-background text-foreground"
            role="status"
            aria-live="polite"
            aria-busy="true"
          >
            <Loader2Icon className="size-9 animate-spin text-muted-foreground" />
            <p className="text-[0.9375rem] text-muted-foreground">
              {overlayHint === "invite"
                ? "Переход в группу…"
                : "Загрузка…"}
            </p>
          </div>
        ) : null}
      </AuthContext.Provider>
    </WebAppContext.Provider>
  );
}
