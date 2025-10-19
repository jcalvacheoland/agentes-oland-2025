"use client";
//este hook refresca cada 24 horas y guarda en localstorage
//al cerrar sesión, se borra el cache.

import { useEffect, useState } from "react";

export interface BitrixUser {
  id: string | null;
  name: string | null;
  email: string | null;
  position: string | null;
  department: any;
}

// Función para formatear el nombre
function formatName(name: string | null): string | null {
  if (!name) return null;
  
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function useBitrixUser() {
  const [user, setUser] = useState<BitrixUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const CACHE_KEY = "bitrixUser";
    const TIMESTAMP_KEY = "bitrixUserFetchedAt";
    const ONE_DAY = 24 * 60 * 60 * 1000; // 24 horas

    const cachedUser = localStorage.getItem(CACHE_KEY);
    const lastFetched = localStorage.getItem(TIMESTAMP_KEY);
    const now = Date.now();

    // Verifica si el cache existe y si fue guardado hace menos de 24h
    const isCacheValid = lastFetched && now - Number(lastFetched) < ONE_DAY;

    if (cachedUser && isCacheValid) {
      const parsedUser = JSON.parse(cachedUser);
      // Formatear el nombre al recuperar del cache
      parsedUser.name = formatName(parsedUser.name);
      setUser(parsedUser);
      setLoading(false);
      return;
    }

    // Si no hay cache o expiró, actualiza desde la API
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/bitrix/getUser");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        // Formatear el nombre antes de guardar
        data.name = formatName(data.name);

        setUser(data);
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
        localStorage.setItem(TIMESTAMP_KEY, now.toString());
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, loading, error };
}