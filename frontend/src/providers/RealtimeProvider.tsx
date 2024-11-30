'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { CatMarker } from '@/types/cat';

interface WebSocketMessage {
  type: 'CAT_UPDATED' | 'NEW_REPORT' | 'NEW_CAT';
  data: {
    catId?: string;
    cat?: CatMarker;
  };
}

interface RealtimeContextType {
  connected: boolean;
  lastMessage: WebSocketMessage | null;
}

const RealtimeContext = createContext<RealtimeContextType>({
  connected: false,
  lastMessage: null
});

export const useRealtime = () => useContext(RealtimeContext);

export const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000/ws';
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connected');
      setConnected(true);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setConnected(false);
      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        setSocket(null);
      }, 5000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        setLastMessage(message);

        // Handle different message types
        switch (message.type) {
          case 'CAT_UPDATED':
            if (message.data.catId) {
              // Invalidate cat details query
              queryClient.invalidateQueries(['cat', message.data.catId]);
              // Update cat in the list if exists
              queryClient.setQueriesData(['cats'], (old: any) => {
                if (!old?.cats) return old;
                return {
                  ...old,
                  cats: old.cats.map((cat: CatMarker) =>
                    cat.id === message.data.catId && message.data.cat
                      ? { ...cat, ...message.data.cat }
                      : cat
                  ),
                };
              });
            }
            break;

          case 'NEW_CAT':
            if (message.data.cat) {
              // Add new cat to the list
              queryClient.setQueriesData(['cats'], (old: any) => {
                if (!old?.cats) return old;
                return {
                  ...old,
                  cats: [...old.cats, message.data.cat],
                };
              });
            }
            break;

          case 'NEW_REPORT':
            if (message.data.catId) {
              // Invalidate cat details to reload with new report
              queryClient.invalidateQueries(['cat', message.data.catId]);
            }
            break;
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [queryClient]);

  return (
    <RealtimeContext.Provider value={{ connected, lastMessage }}>
      {children}
    </RealtimeContext.Provider>
  );
};

export default RealtimeProvider;