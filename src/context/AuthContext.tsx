import { Box } from "@chakra-ui/react";
import { Buffer } from "buffer";
import React, { createContext, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { updateAxiosTokenAndServer } from "../services/api.service";
import {
  fetchAllRepos,
  getSingleRepoTest,
} from "../services/repositories.service";
import { UserI } from "../types/user";

// create a func to decode jwt token
const parseJwt = (token: string) => {
  try {
    return JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
  } catch (e) {
    return null;
  }
};

interface AuthContextI {
  user: UserI | null;
  login: (token: string, server: string) => Promise<void>;
  logout: () => void;
  authLoading: boolean;
  server: string;
}

const AuthContext = createContext<AuthContextI>({
  user: null,
  login: async () => {},
  logout: () => {},
  authLoading: true,
  server: "",
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [user, setUser] = useState<UserI | null>(null);
  const [server, setServer] = useState("");
  const navigate = useNavigate();
  const [expiration, setExpiration] = useState<number>(0);
  const getUser = useCallback(async () => {
    const token = localStorage.getItem("token");
    const server = localStorage.getItem("server");
    if (!server || !token) {
      setAuthLoading(false);
      return;
    }

    const user = parseJwt(token);
    if (user) {
      updateAxiosTokenAndServer(token, server);
      try {
        const res = await getSingleRepoTest();
        console.log(res);
      } catch (err) {
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("server");
        navigate("/login");
        return;
      }

      setUser({
        id: user.id,
        displayName: user.user_displayname,
      });
      setExpiration(user.exp);
      setServer(server);
    }

    setAuthLoading(false);
  }, [navigate]);

  useEffect(() => {
    getUser();
  }, [getUser]);

  const login = async (token: string, server: string) => {
    setAuthLoading(true);
    if (!token) return;

    const user = parseJwt(token);
    if (user) {
      updateAxiosTokenAndServer(token, server);
      try {
        await fetchAllRepos();
      } catch (error: any) {
        logout();
        setAuthLoading(false);
        if (error?.response?.status) {
          switch (error.response.status) {
            case 401:
              throw new Error("Unauthorized");
            case 403:
              throw new Error("Forbidden");
            case 404:
              throw new Error("Not found");
            default:
              throw new Error("Unknown error");
          }
        }

        throw new Error("A network error occurred.");
      }

      setUser({
        id: user.id,
        displayName: user.user_displayname,
      });
      setExpiration(user.exp);
    }

    setServer(server);
    localStorage.setItem("server", server);
    localStorage.setItem("token", token);
    setAuthLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("server");
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, authLoading, server }}>
      <Box opacity={authLoading ? 0.5 : 1}>{children}</Box>
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return React.useContext(AuthContext);
};
