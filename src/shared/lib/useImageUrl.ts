import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase/client';

interface UseImageUrlOptions {
  /** Tempo de cache em ms (padrão: 5 minutos) */
  cacheMs?: number;
}

/**
 * Hook para obter e renovar signed URLs de imagens do Supabase Storage.
 *
 * - Cria signed URL com expiração curta (1h) via `uploadImage`
 * - Renova automaticamente antes de expirar (cache de 5min por padrão)
 * - Retorna URL sempre válida ou null se não houver path
 */
export function useImageUrl(
  imagePath: string | null | undefined,
  options: UseImageUrlOptions = {}
): string | null {
  const { cacheMs = 5 * 60 * 1000 } = options; // 5 minutos

  const [url, setUrl] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number>(0);
  const abortRef = useRef<AbortController | null>(null);

  const refreshUrl = useCallback(async () => {
    if (!imagePath) {
      setUrl(null);
      setExpiresAt(0);
      return;
    }

    // Cancela refresh anterior se houver
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const { data, error } = await supabase.storage
        .from('card-images')
        .createSignedUrl(imagePath, 60 * 60); // 1 hora

      if (controller.signal.aborted) return;

      if (error) {
        console.error('Erro ao criar signed URL:', error);
        setUrl(null);
        return;
      }

      if (data?.signedUrl) {
        setUrl(data.signedUrl);
        setExpiresAt(Date.now() + 60 * 60 * 1000); // expira em 1h
      }
    } catch {
      if (!controller.signal.aborted) {
        setUrl(null);
      }
    }
  }, [imagePath]);

  // Renova automaticamente antes de expirar (com margem de 5min)
  useEffect(() => {
    if (!url || !imagePath) return;

    const now = Date.now();
    const timeUntilExpiry = expiresAt - now;

    // Se expira em menos de 5min, renova agora
    if (timeUntilExpiry < cacheMs) {
      refreshUrl();
    } else {
      // Agenda renovação para 5min antes de expirar
      const delay = Math.max(0, timeUntilExpiry - cacheMs);
      const timeoutId = setTimeout(refreshUrl, delay);
      return () => clearTimeout(timeoutId);
    }
  }, [url, imagePath, expiresAt, cacheMs, refreshUrl]);

  // Inicializa/atualiza quando imagePath muda
  useEffect(() => {
    if (imagePath) {
      refreshUrl();
    } else {
      setUrl(null);
      setExpiresAt(0);
    }
  }, [imagePath, refreshUrl]);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  return url;
}