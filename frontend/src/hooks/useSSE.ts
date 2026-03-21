"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { getSSEUrl } from "@/lib/api";

interface UseSSEOptions {
  path: string;
  onMessage?: (event: MessageEvent) => void;
  onError?: (error: Event) => void;
  enabled?: boolean;
  reconnectInterval?: number;
  maxRetries?: number;
}

interface UseSSEReturn {
  isConnected: boolean;
  error: Event | null;
  reconnect: () => void;
}

export function useSSE({
  path,
  onMessage,
  onError,
  enabled = true,
  reconnectInterval = 3000,
  maxRetries = 5,
}: UseSSEOptions): UseSSEReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Event | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const retriesRef = useRef(0);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);

  const cleanup = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const connect = useCallback(() => {
    cleanup();

    if (!enabled) return;

    const url = getSSEUrl(path);
    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
      setError(null);
      retriesRef.current = 0;
    };

    eventSource.onmessage = (event) => {
      onMessage?.(event);
    };

    eventSource.onerror = (err) => {
      setIsConnected(false);
      setError(err);
      onError?.(err);

      eventSource.close();
      eventSourceRef.current = null;

      if (retriesRef.current < maxRetries) {
        retriesRef.current += 1;
        reconnectTimerRef.current = setTimeout(() => {
          connect();
        }, reconnectInterval * retriesRef.current);
      }
    };
  }, [path, enabled, onMessage, onError, reconnectInterval, maxRetries, cleanup]);

  const reconnect = useCallback(() => {
    retriesRef.current = 0;
    connect();
  }, [connect]);

  useEffect(() => {
    connect();
    return cleanup;
  }, [connect, cleanup]);

  return { isConnected, error, reconnect };
}
