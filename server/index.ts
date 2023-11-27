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
  console.log('Session Token Value: ' + sessionToken)
  if (sessionToken && process.env.CLERK_PEM_PUBLIC_KEY) {
    const jwtResult = jwt.verify(sessionToken, process.env.CLERK_PEM_PUBLIC_KEY);
    console.log('INSIDE DECRYPT FUNCTION JWTRESULT: ', jwtResult)
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
let counter = 1;

// Bun.serve<UserData>({
const server = Bun.serve<UserData>({
  port: process.env.PORT || 8000,
  development: process.env.PORT ? false : true,
  async fetch(req, server) {
    console.log('NEW REQUEST')
    console.log('RAW COOKIES FROM REQUEST', req.headers.get('cookie'))
    console.log('cookies from getCookies function', getCookies(req))
    const jwtResult = decryptToken(getCookies(req).__session)
    console.log('JWT RESULT', jwtResult)
    console.log('CLAIMS ARE VALID?', jwtResult ? validateJWTClaims(jwtResult) : 'jwtResult is invalid')
    // This is redundant, we already did this in decryptToken function
    if (jwtResult && jwtResult.sub && validateJWTClaims(jwtResult)) {
      console.log('USER IS AUTHORIZED')
      const user = await clerkClient.users.getUser(jwtResult.sub);
      console.log('USER DATA', user)
      const upgrade = server.upgrade(req, {
        data: {
          userId: jwtResult.sub,
          username: user.username,
          color: user.publicMetadata.color || '#ffffff',
        }
      });
      console.log('UPGRADE RESULT', upgrade)
      if (upgrade) return
      // if (server.upgrade(req, {
      //   data: {
      //     userId: jwtResult.sub,
      //     username: user.username,
      //     color: user.publicMetadata.color || '#ffffff',
      //   }
      // })) return
    }
    console.log('FAILED TO VALIDATE, but we\'re gunna upgrade anyways cuz testing')
    const upgrade = server.upgrade(req, {
      data: {
        userId: 'FAKE-ID',
        username: 'Username' + counter++,
        color: '#ffffff',
      }
    });
    if (upgrade) return

    return new Response(JSON.stringify('Failed to authorize user'), { status: 401 });
  },
  websocket: {
    message(ws, message) {
      console.log('SEND MESSAGE: ', message)
      const cmd: serverCmd = JSON.parse(message.toString())
      for (const key in commandHandler) {
        if (key in cmd) {
          commandHandler[key](ws, cmd[key], key === 'message' ? cmd.message?.content : undefined)
          break;
        }
      }
    },
    open(ws) {
      console.log('OPENING WEBSOCKET')
      if (clients[ws.data.username]) clients[ws.data.username].close();
      clients[ws.data.username] = ws;
    },
    close(ws) {
      console.log('CLOSING WEBSOCKET')
      delete clients[ws.data.username];
      for (let chatName in chatRooms) {
        if (chatRooms[chatName].includes(ws.data.username)) {
          chatRooms[chatName].splice(chatRooms[chatName].indexOf(ws.data.username), 1);
        }
      }
    },
  }
})

console.log('SERVER IS RUNNING', server)
