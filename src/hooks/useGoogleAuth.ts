"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export interface GoogleUser {
  name: string;
  email: string;
  picture: string;
}

declare global {
  interface Window {
    google: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (resp: { access_token?: string; expires_in?: number; error?: string }) => void;
          }) => { requestAccessToken: (opts?: { prompt: string }) => void };
        };
      };
    };
  }
}

const SCOPE =
  "https://www.googleapis.com/auth/drive.readonly openid email profile";
const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;
const STORAGE_KEY_TOKEN = "gapi_token";
const STORAGE_KEY_USER = "gapi_user";
const STORAGE_KEY_EXPIRY = "gapi_expiry";

export function useGoogleAuth() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const tokenClientRef = useRef<{ requestAccessToken: (opts?: { prompt: string }) => void } | null>(null);

  // Load saved session
  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEY_TOKEN);
    const expiry = Number(localStorage.getItem(STORAGE_KEY_EXPIRY) ?? 0);
    const savedUser = localStorage.getItem(STORAGE_KEY_USER);
    if (token && expiry > Date.now()) {
      setAccessToken(token);
      if (savedUser) setUser(JSON.parse(savedUser));
    }
  }, []);

  // Load GSI script
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (document.getElementById("gsi-script")) {
      setScriptReady(true);
      return;
    }
    const script = document.createElement("script");
    script.id = "gsi-script";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => setScriptReady(true);
    document.body.appendChild(script);
  }, []);

  // Initialize token client when script is ready
  useEffect(() => {
    if (!scriptReady || !window.google) return;
    tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPE,
      callback: async (response) => {
        if (response.error || !response.access_token) return;
        const token = response.access_token;
        const expiry = Date.now() + (response.expires_in ?? 3600) * 1000 - 60_000;
        localStorage.setItem(STORAGE_KEY_TOKEN, token);
        localStorage.setItem(STORAGE_KEY_EXPIRY, String(expiry));
        setAccessToken(token);

        // Fetch user info
        try {
          const info = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
            headers: { Authorization: `Bearer ${token}` },
          }).then((r) => r.json());
          const u: GoogleUser = { name: info.name, email: info.email, picture: info.picture };
          setUser(u);
          localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(u));
        } catch {
          // ignore
        }
      },
    });
  }, [scriptReady]);

  const signIn = useCallback(() => {
    tokenClientRef.current?.requestAccessToken({ prompt: "consent" });
  }, []);

  const signOut = useCallback(() => {
    setAccessToken(null);
    setUser(null);
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_EXPIRY);
  }, []);

  return { accessToken, user, signIn, signOut };
}
