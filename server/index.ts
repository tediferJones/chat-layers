import clerkClient from '@clerk/clerk-sdk-node';
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

function sendToChatRoom(chatRoom: string, message: string) {
  for (let username of chatRooms[chatRoom]) {
    clients[username].send(message);
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

const server = Bun.serve<UserData>({
  port: process.env.PORT || 8000,
  development: process.env.PORT ? false : true,
  async fetch(req, server) {
    // Is it a bad idea to send the raw userId as a URL parameter? Most certainly
    const userId = new URL(req.url).searchParams.get('userId');
    if (userId) {
      const [ user ] = await clerkClient.users.getUserList({
        userId: [ userId ]
      });
      if (user && server.upgrade(req, {
        data: {
          userId,
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

console.log('SERVER IS RUNNING', server)
