// /* eslint-disable react-refresh/only-export-components */
// import { createContext, useContext, useEffect, useMemo, useState } from "react";
// import { authService } from "../services/authService.js";

// const TOKEN_KEYS = ["token", "cad_token"];
// const AuthContext = createContext(null);

// export function AuthProvider({ children }) {
//   const [token, setToken] = useState(() => {
//     for (const k of TOKEN_KEYS) {
//       const t = localStorage.getItem(k);
//       if (t) return t;
//     }
//     return "";
//   });
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   ed = false;
//     (async () => {
//       try {
//         setLoading(true);
//         if (token) {
//           const result = await authService.me();
//           if (!cancelled) setUser(result.user);
//         } else {
//           if (!cancelled) setUser(null);
//         }
//       } catch {
//         for (const k of TOKEN_KEYS) localStorage.removeItem(k);
//         if (!cancelled) {
//           setToken("");
//           setUser(null);
//         }
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     })();

//     return () => {
//       cancelled = true;
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   async function login(email, password) {
//     const result = await authService.login({ email, password });
//     for (const k of TOKEN_KEYS) localStorage.setItem(k, result.token);
//     setToken(result.token);
//     const nextUser = { ...(result.user || {}), role: result.role };
//     setUser(nextUser);
//     return nextUser;
//   }

//   async function register(payload) {
//     const result = await authService.register(payload);
//     for (const k of TOKEN_KEYS) localStorage.setItem(k, result.token);
//     setToken(result.token);
//     setUser(result.user);
//     return result.user;
//   }

//   function logout() {
//     for (const k of TOKEN_KEYS) localStorage.removeItem(k);
//     setToken("");
//     setUser(null);
//   }

//   const value = useMemo(
//     () => ({
//       token,
//       user,
//       loading,
//       isAuthenticated: Boolean(token),
//       login,
//       register,
//       logout
//     }),
//     [token, user, loading]
//   );

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// }

// export function useAuth() {
//   const ctx = useContext(AuthContext);
//   if (!ctx) throw new Error("useAuth must be used within AuthProvider");
//   return ctx;
// }






/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authService } from "../services/authService.js";

const TOKEN_KEYS = ["token", "cad_token"];
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    for (const k of TOKEN_KEYS) {
      const t = localStorage.getItem(k);
      if (t) return t;
    }
    return "";
  });

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ FIXED useEffect
  useEffect(() => {
    let cancelled = false;

    const loadUser = async () => {
      try {
        setLoading(true);

        if (token) {
          const result = await authService.me();
          if (!cancelled) setUser(result.user);
        } else {
          if (!cancelled) setUser(null);
        }
      } catch (error) {
        console.error(error);
        for (const k of TOKEN_KEYS) localStorage.removeItem(k);

        if (!cancelled) {
          setToken("");
          setUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadUser();

    return () => {
      cancelled = true;
    };
  }, [token]);

  // ✅ LOGIN
  async function login(email, password) {
    const result = await authService.login({ email, password });

    for (const k of TOKEN_KEYS) {
      localStorage.setItem(k, result.token);
    }

    setToken(result.token);

    const nextUser = { ...(result.user || {}), role: result.role };
    setUser(nextUser);

    return nextUser;
  }

  // ✅ REGISTER
  async function register(payload) {
    const result = await authService.register(payload);

    for (const k of TOKEN_KEYS) {
      localStorage.setItem(k, result.token);
    }

    setToken(result.token);
    setUser(result.user);

    return result.user;
  }

  // ✅ LOGOUT
  function logout() {
    for (const k of TOKEN_KEYS) {
      localStorage.removeItem(k);
    }

    setToken("");
    setUser(null);
  }

  // ✅ CONTEXT VALUE
  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isAuthenticated: Boolean(token),
      login,
      register,
      logout,
    }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ✅ HOOK
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}