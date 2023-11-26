import jwt, { JwtPayload } from 'jsonwebtoken';
import clerkClient from '@clerk/clerk-sdk-node';
import getCookies from './modules/getCookies';
import { ServerWebSocket } from 'bun';

interface MessageData {
  chatRoom: string,
  content: string,
}

interface serverCmd {
  [key: string]: any,
  connect?: string,
  disconnect?: string,
  setColor?: string,
  message: MessageData,
}

interface UserData {
  username: string,
  color: string,
  userId: string
}

function validateJWTClaims(jwt: JwtPayload): boolean {
  const currentTime = Date.now()

  if (jwt.exp && currentTime > jwt.exp * 1000) return false
  if (jwt.nbf && currentTime < jwt.nbf * 1000) return false
  if (jwt.azp && process.env.CLIENT_URL !== jwt.azp) return false

  return true
}

function sendToChatRoom(chatRoom: string, message: string) {
  for (let username of chatRooms[chatRoom]) {
    clients[username].send(message);
  }
}

function decryptToken(sessionToken: string) {
  if (sessionToken && process.env.CLERK_PEM_PUBLIC_KEY) {
    const jwtResult = jwt.verify(sessionToken, process.env.CLERK_PEM_PUBLIC_KEY);
    if (typeof jwtResult !== 'string' && jwtResult.sub && validateJWTClaims(jwtResult)) {
      return jwtResult;
    }
  }
}

const commandHandler: { [key: string]: Function } = {
  connect: (ws: ServerWebSocket<UserData>, chatRoom: string) => {
    chatRooms[chatRoom] ? 
      chatRooms[chatRoom].push(ws.data.username) : 
      chatRooms[chatRoom] = [ws.data.username]

    sendToChatRoom(chatRoom, JSON.stringify({
      chatRoom,
      formattedMessage: {
        message: 'has connected',
        username: ws.data.username,
        color: ws.data.color,
      }
    }));
  },
  disconnect: (ws: ServerWebSocket<UserData>, chatRoom: string) => {
    chatRooms[chatRoom].splice(chatRooms[chatRoom].indexOf(ws.data.username), 1);
    sendToChatRoom(chatRoom, JSON.stringify({
      chatRoom: chatRoom,
      formattedMessage: {
        message: 'has disconnected',
        username: ws.data.username,
        color: ws.data.color,
      }
    }));
  },
  message: (ws: ServerWebSocket<UserData>, msgData: MessageData) => {
    sendToChatRoom(msgData.chatRoom, JSON.stringify({
      chatRoom: msgData.chatRoom,
      formattedMessage: {
        message: msgData.content,
        username: ws.data.username,
        color: ws.data.color,
      }
    }));
  },
  setColor: (ws: ServerWebSocket<UserData>, color: string) => {
    clients[ws.data.username].data.color = color;
    clerkClient.users.updateUserMetadata(ws.data.userId, {
      publicMetadata: {
        color,
      }
    });
  },
}

const clients: { [key: string]: ServerWebSocket<UserData> } = {};
const chatRooms: { [key: string]: string[] } = {};

Bun.serve<UserData>({
  port: process.env.PORT || 8000,
  development: process.env.PORT ? false : true,
  async fetch(req, server) {
    const jwtResult = decryptToken(getCookies(req).__session)
    if (jwtResult && jwtResult.sub && validateJWTClaims(jwtResult)) {
      const user = await clerkClient.users.getUser(jwtResult.sub);
      if (server.upgrade(req, {
        data: {
          userId: jwtResult.sub,
          username: user.username,
          color: user.publicMetadata.color || '#ffffff',
        }
      })) return
    }

    return new Response(JSON.stringify('Failed to authorize user'), { status: 401 });
  },
  websocket: {
    message(ws, message) {
      const cmd: serverCmd = JSON.parse(message.toString())
      for (const key in commandHandler) {
        if (key in cmd) {
          commandHandler[key](ws, cmd[key], key === 'message' ? cmd.message?.content : undefined)
          break;
        }
      }
    },
    open(ws) {
      if (clients[ws.data.username]) clients[ws.data.username].close();
      clients[ws.data.username] = ws;
    },
    close(ws) {
      delete clients[ws.data.username];
      for (let chatName in chatRooms) {
        if (chatRooms[chatName].includes(ws.data.username)) {
          chatRooms[chatName].splice(chatRooms[chatName].indexOf(ws.data.username), 1);
        }
      }
    },
  }
})
