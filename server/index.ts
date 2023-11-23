import jwt, { JwtPayload } from 'jsonwebtoken';
import clerkClient from '@clerk/clerk-sdk-node';
import getCookies from './modules/getCookies';
import { ServerWebSocket } from 'bun';

// This is what we need to implement: https://clerk.com/docs/backend-requests/handling/manual-jwt

interface serverCmd {
  connect?: string,
  disconnect?: string,
  message?: {
    chatRoom: string,
    content: string,
  },
}

// This should be turned into an env var, it will change depending on where the project is deployed
const clientUrl = 'http://localhost:3000';

function validateJWTClaims(jwt: JwtPayload): boolean {
  const currentTime = Date.now()

  if (jwt.exp && currentTime > jwt.exp * 1000) return false
  if (jwt.nbf && currentTime < jwt.nbf * 1000) return false
  if (jwt.azp && clientUrl !== jwt.azp) return false

  return true
}

// const resOpts = {
//   headers: {
//     'Access-Control-Allow-Origin': clientUrl,
//     'Access-Control-Allow-Credentials': 'true',
//   },
// }

// We will need some way to organize users and what chat rooms each user is connected to
// Probably something like this:
// servers = {
//   SERVERNAME: {
//     username: webSocket,
//     username2: webSocket2,
//   }
// }
const clients: { [key: string]: ServerWebSocket<{ username: string, color: string }> } = {}

const chatRooms: { [key: string]: string[] } = {}

Bun.serve<{ username: string, color: string }>({
  port: process.env.PORT || 8000,
  development: process.env.PORT ? false : true,
  async fetch(req, server) {
    // It would be nice if this didnt have 4 different return statements
    console.log('NEW REQUEST')
    const { __session } = getCookies(req);
    if (__session && process.env.CLERK_PEM_PUBLIC_KEY) {
      const jwtResult = jwt.verify(__session, process.env.CLERK_PEM_PUBLIC_KEY);
      if (typeof jwtResult !== 'string' && jwtResult.sub && validateJWTClaims(jwtResult)) {
        console.log('JWT CLAIMS ARE VALID');
        // Get user info from clerk
        // This info will be very import when we instantiate a new client websocket
        // Each client websocket should have props username and color
        //
        // THEORETICALLY, each user will only have one websocket,
        // Unlike chat-bun which would create a new webSocket for each chatroom
        const user = await clerkClient.users.getUser(jwtResult.sub);
        console.log(user)
        // if (user.username) {
        //   console.log(clients[user.username])
        // }
        // console.log(user)
        if (server.upgrade(req, {
          data: {
            username: user.username,
            color: user.publicMetadata.color || '#ffffff',
          },
          // headers: {
          //   'Access-Control-Allow-Origin': clientUrl,
          //   'Access-Control-Allow-Credentials': 'true',
          // }
        })) return
      }
    }
    console.log('FAILED TO VALIDATE')
    return new Response(JSON.stringify('Failed to authorize user'), { status: 401 });
    // return new Response(JSON.stringify('Failed to authorize user'), resOpts);
  },
  websocket: {
    message(ws, message) {
      // See client index page for message structure
      console.log('RECIEVED MESSAGE', message)
      // console.log(ws, message)
      // console.log(typeof message)
      const cmd: serverCmd = JSON.parse(message.toString())
      if (cmd.connect) {
        if (chatRooms[cmd.connect]) {
          chatRooms[cmd.connect].push(ws.data.username);
        } else {
          chatRooms[cmd.connect] = [ws.data.username];
        }
        console.log(chatRooms)
        // SEND NEW CONNECTION MESSAGE TO ALL USERS
        for (let username of chatRooms[cmd.connect]) {
          console.log('SENDING MESSAGE')
          clients[username].send(JSON.stringify({
            chatRoom: cmd.connect,
            formattedMessage: {
              message: 'has connected',
              username: ws.data.username,
              color: ws.data.color
            }
          }))
        }
      }

      if (cmd.message) {
        for (let username of chatRooms[cmd.message.chatRoom]) {
          console.log('SENDING MESSAGE')
          clients[username].send(JSON.stringify({
            chatRoom: cmd.message.chatRoom,
            formattedMessage: {
              message: cmd.message.content,
              username: ws.data.username,
              color: ws.data.color
            }
          }))
        }
      }
      // ws.send(message)
    },
    open(ws) {
      // This will probably end up doing nothing
      console.log('OPENING WEBSOCKET')
      clients[ws.data.username] = ws;
      // ws.send('TEST USER HAS CONNECTED MESSAGE')
      // console.log('TOTAL CLIENTS', Object.keys(clients).length)
      // ws.send(JSON.stringify({
      //   msg: 'TEST USER HAS CONNECTED MESSAGE'
      // }))
      // console.log(ws)
    },
    close(ws, code, reason) {
      // This will probably also end up doing nothing
      console.log('CLOSING WEBSOCKET')
      delete clients[ws.data.username]

      for (let chatName in chatRooms) {
        if (chatRooms[chatName].includes(ws.data.username)) {
          chatRooms[chatName].splice(chatRooms[chatName].indexOf(ws.data.username), 1)
        }
      }

      // YOU MUST POP ALL USERNAMES FROM ALL CHAT ROOMS
      // THIS IS WHY WE GET DUPLICATE CONNECTIONS

      // console.log(ws, code, reason)
    },
  }
})

// OLD SERVER
// Bun.serve({
//   port: 8000,
//   async fetch(req: Request) {
//     // You can probably replace this with the getCookies module
//     const cookies: { [key: string]: string } = {};
//     req.headers.get('cookie')?.split('; ').forEach((cookie: string) => {
//       const splitCookie = cookie.split('=')
//       cookies[splitCookie[0]] = splitCookie[1]
//     })
//     // console.log(cookies)
//     const key = process.env.CLERK_PEM_PUBLIC_KEY
//     // console.log(key)
//     // console.log(req.headers.authorization)
//     if (key) {
//       const jwtResult = jwt.verify(cookies.__session, key)
//       // console.log(jwt.verify('poopydoodoo', key))
//       // console.log(jwtResult)
//       // console.log(jwtResult.sub)
//       const userId = jwtResult.sub?.toString();
//       if (userId && typeof jwtResult !== 'string' && validateJWTClaims(jwtResult)) {
//         // console.log(await clerkClient.users.getUser(userId))
//         const user = await clerkClient.users.getUser(userId);
//         console.log(user)
//       }
// 
//       // How do we edit user.publicMetadata or user.privateMetadata
//       // Determine max size of user metadata, try to post like a 10k character long string
//       //    - Organization metadata must be less than 8kb
// 
//       // if (typeof(jwtResult) !== 'string') {
//       //   console.log(validateJWTClaims(jwtResult))
//       // }
//     }
//     // console.log(Date.now())
//     
//     console.log('Received Request')
//     return new Response(JSON.stringify('Bun Response'), {
//       headers: {
//         // 'Content-Type': 'application/json',
//         // 'Access-Control-Allow-Origin': '*',
//         // 'Access-Control-Allow-Headers': 'Content-Type',
//         // 'Access-Control-Allow-Origin': 'http://localhost:3000',
//         'Access-Control-Allow-Origin': clientUrl,
//         'Access-Control-Allow-Credentials': 'true',
//       }
//     })
//   }
// })
