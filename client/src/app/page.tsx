'use client';
// MOVE THIS TO LOWER LEVEL COMPONENTS

// import { UserButton } from '@clerk/nextjs';
import ChatWindow from '@/components/ChatWindow';
import { useUser } from '@clerk/nextjs';
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



  // THIS WORKS AND CAN BE PASSED BETWEEN LOWER COMPONENTS
  // Should we check for user before establishing websocket connection?
  // const webSocket = new WebSocket('ws://localhost:8000')
  // webSocket.onmessage = ({ data }) => console.log('RECIEVING MESSAGE', data)
  // console.log(webSocket)
  // console.log('RENDERING ENTIRE PAGE')


  // WORKING
  let webSocket;
  const { user } = useUser();
  if (user && !webSocket) {
    // CLICK THE BUTTON, WE ARE CONNECTED
    // The problem is that child components aren't re-rendering when webSocket gets assigned
    // Thus components that are passed 'webSocket' as a prop will essentially end up calling undefined.send()
    console.log('START WEBSOCKET')
    console.log(webSocket)
    if (!process.env.NEXT_PUBLIC_WEBSOCKET_URL) {
      throw Error('CANT FIND ENV VAR FOR WEBSOCKET URL')
    }
    // webSocket = new WebSocket('ws://localhost:8000')
    webSocket = new WebSocket(process.env.NEXT_PUBLIC_WEBSOCKET_URL)
    // webSocket.onmessage = ({ data }) => {
    //   console.log('RECEIVING MESSAGE', data)
    // }
    // webSocket.onopen = () => console.log('WEBSOCKET HAS BEEN OPENED')
  }
  // console.log('ENVIRONMENT VARIABLES')
  // USE THIS URL TO CONNECT TO WEBSOCKET,
  // This allows us to easily change the websocket url later if it changes (new deployment platform, redeploy uses a different url, etc...)
  // console.log(process.env['NEXT_PUBLIC_WEBSOCKET_URL'])

  return <ChatWindow webSocket={webSocket} />
  // return <ChatWindow />
}
