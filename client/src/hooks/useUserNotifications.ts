import { useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import Notification from "@/types/Notification";
import apiFetch from "@/lib/apiFetch";

export const useUserNotifications = (callback: (data: Notification) => void) => {
  const { user } = useUser();

  useEffect(() => {
    if (!user?.id) return;

    let eventSource: EventSource | null = null;
    let isMounted = true;

    const connect = async () => {
      try {
        // 1. Pede o ticket ao Laravel (uses apiFetch to attach auth headers automatically)
        const res = await apiFetch<{ ticket: string }>('/notifications/sse-ticket');

        if (!isMounted) return;

        const sseUrl = `${process.env.NEXT_PUBLIC_API_URL}/sse/stream?ticket=${res.ticket}`;

        eventSource = new EventSource(sseUrl, {
          withCredentials: true
        });

        eventSource.onmessage = (event) => {
          if (!event.data) return;
          try {
            const data = JSON.parse(event.data);
            callback(data);
          } catch (e) { console.error(e); }
        };

        eventSource.onerror = (e) => {
          console.error('SSE Error', e);
          eventSource?.close();
        };

      } catch (error) {
        console.error("Erro no fluxo SSE:", error);
      }
    };

    connect();

    return () => {
      isMounted = false;
      eventSource?.close();
    };
  }, [user?.id, callback]);
};