import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

const USER_KEY = "voyageUsername";
const PIN_KEY = "voyagePin";

export const isValidPin = (v: string) => /^\d{5}$/.test(v);

type Session = { username: string; pin: string };

type Ctx = {
  ready: boolean;
  username: string | null;
  pin: string | null;
  signIn: (s: Session) => void;
  signOut: () => void;
};

const SessionContext = createContext<Ctx>({
  ready: false,
  username: null,
  pin: null,
  signIn: () => {},
  signOut: () => {},
});

export function SessionProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [pin, setPin] = useState<string | null>(null);

  useEffect(() => {
    const u = window.localStorage.getItem(USER_KEY);
    const p = window.localStorage.getItem(PIN_KEY);
    if (u && p && isValidPin(p)) {
      setUsername(u);
      setPin(p);
    }
    setReady(true);
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      ready,
      username,
      pin,
      signIn: ({ username: u, pin: p }) => {
        window.localStorage.setItem(USER_KEY, u);
        window.localStorage.setItem(PIN_KEY, p);
        setUsername(u);
        setPin(p);
      },
      signOut: () => {
        window.localStorage.removeItem(USER_KEY);
        window.localStorage.removeItem(PIN_KEY);
        setUsername(null);
        setPin(null);
      },
    }),
    [ready, username, pin],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export const useSession = () => useContext(SessionContext);
