// MOVE THIS TO LOWER LEVEL COMPONENTS

// import { UserButton } from '@clerk/nextjs';
import ChatWindow from '@/components/ChatWindow';
// import { useAuth } from '@clerk/nextjs';
//
// TRY TO MERGE bun-ssr files served to client into this project
// We only need to transfer the chatWindow component/page
//    - Login and Signup pages are provided by clerk

// We will open the websocket when the page loads
// The client will send "commands" in JSON format to the server to send new messages or connect/disconnect from specific servers
// Message Structure: {
//   message: SOMEMESSAGE: string,
//   sendTo: SERVERNAME: string, OR MAYBE message should be an obj
//   connect: SERVERNAME: string,
//   disconnect: SERVERNAME: string,
//   setColor: HEX COLOR CODE: string, 
//   (when user updates their color send this command to server so it knows to update all ws.data associated with that user)
// }

export default function Home() {
  // console.log(useAuth())

  // function handler() {
  //   // fetch('http://localhost:8000').then(data => console.log(data))

  //   // fetch('http://localhost:8000', {
  //   //   credentials: 'include',
  //   // })

  //   const clientWebSocket = new WebSocket('ws://localhost:8000')
  //   // IF WE DONT INCLUDE CREDENTIALS ON SEND, WE DONT NEED TO USE FANCY HEADERS ON THE BACKEND
  //   console.log(clientWebSocket)
  //   console.log('made fetch request')
  // }

      // <h1>Hello</h1>
      // <button onClick={handler}>Cookie</button>
      // <UserButton />
  // const webSocket = new WebSocket('ws://localhost:8000')
  // console.log(webSocket)
  return <ChatWindow />
}
