import WebSocket from 'ws';
import http from 'http';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';
import { IUser } from '../models/User';

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  isAlive: boolean;
}

export class WebSocketServer {
  private wss: WebSocket.Server;
  private clients: Map<string, AuthenticatedWebSocket[]> = new Map();

  constructor(server: http.Server) {
    this.wss = new WebSocket.Server({ server });
    this.initialize();
  }

  private initialize() {
    this.wss.on('connection', async (ws: AuthenticatedWebSocket, request) => {
      ws.isAlive = true;

      // Extract token from query string
      const url = new URL(request.url || '', 'ws://localhost');
      const token = url.searchParams.get('token');

      try {
        if (token) {
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string };
          ws.userId = decoded.userId;
          
          // Add to clients map
          const userClients = this.clients.get(decoded.userId) || [];
          userClients.push(ws);
          this.clients.set(decoded.userId, userClients);
        }
      } catch (error) {
        logger.error('WebSocket authentication error:', error);
      }

      ws.on('pong', () => {
        ws.isAlive = true;
      });

      ws.on('message', (message: string) => {
        try {
          const data = JSON.parse(message);
          // Handle any client-to-server messages here
          logger.info('Received WebSocket message:', data);
        } catch (error) {
          logger.error('Error processing WebSocket message:', error);
        }
      });

      ws.on('close', () => {
        if (ws.userId) {
          const userClients = this.clients.get(ws.userId) || [];
          this.clients.set(
            ws.userId,
            userClients.filter(client => client !== ws)
          );
        }
      });
    });

    // Set up heartbeat
    const interval = setInterval(() => {
      this.wss.clients.forEach((ws: AuthenticatedWebSocket) => {
        if (!ws.isAlive) {
          return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping();
      });
    }, 30000);

    this.wss.on('close', () => {
      clearInterval(interval);
    });
  }

  // Broadcast to all connected clients
  public broadcast(message: any) {
    const data = JSON.stringify(message);
    this.wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }

  // Send message to specific user's connections
  public sendToUser(userId: string, message: any) {
    const userClients = this.clients.get(userId);
    if (userClients) {
      const data = JSON.stringify(message);
      userClients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(data);
        }
      });
    }
  }

  // Send message to multiple users
  public sendToUsers(userIds: string[], message: any) {
    const data = JSON.stringify(message);
    userIds.forEach(userId => {
      const userClients = this.clients.get(userId);
      if (userClients) {
        userClients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(data);
          }
        });
      }
    });
  }
}