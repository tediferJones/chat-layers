import { Server, ServerWebSocket } from "bun"

// interface ServerObj extends WebSocket {
//   [key: string]: any,
//   servername: string,
//   chatHistory: string[],
// }
// 
// interface Servers {
//   [key: string]: ServerObj,
// }
interface Servers {
  [key: string]: string[]
}

interface BackendServerObj extends Server {
  clients: { [key: string]: ServerWebSocket<{ username: string, color: string }> }
}

interface BackendServers {
  [key: string]: BackendServerObj
}

type UserAuth = undefined | {
  username: string,
  color: string,
}

interface ResBody {
  errors: { [key: string]: string },
  port?: number,
  user?: UserAuth,
}

interface FormInputs {
  [key: string]: string,
}

export type {
  // ServerObj,
  Servers,
  BackendServers,
  ResBody,
  FormInputs,
  UserAuth,
  BackendServerObj
}
