'use client';
import { useState, useRef, useEffect } from 'react'
import UserInfo from '@/components/UserInfo';
import NewConnection from '@/components/NewConnection';
import ManageConnections from '@/components/ManageConnections';
import ChatHistory from '@/components/ChatHistory';
import { Servers } from '@/types';
import { useUser } from '@clerk/nextjs';

export default function ChatWindow() {
  // URL needs to be imported from env var somehow
  console.log('RENDERING ON CLIENT')
  let webSocket: WebSocket;
  const { user } = useUser();
  if (user) {
    // CLICK THE BUTTON, WE ARE CONNECTED
    // The problem is that child components aren't re-rendering when webSocket gets assigned
    // Thus components that are passed 'webSocket' as a prop will essentially end up calling undefined.send()
    webSocket = new WebSocket('ws://localhost:8000')
    webSocket.onmessage = ({ data }) => {
      console.log('RECEIVING MESSAGE')
      console.log(data)
    }
    webSocket.onopen = () => console.log('WEBSOCKET HAS BEEN OPENED')
  }
  // const [webSocket, setWebSocket] = useState(user ? (() => {
  //   const webSocket = new WebSocket('ws://localhost:8000')
  //   webSocket.onmessage = ({ data }) => {
  //     console.log(data)
  //   }
  //   webSocket.onopen = () => console.log('WEBSOCKET HAS BEEN OPENED')
  //   return webSocket
  // })() : undefined)

  // webSocket?.send('TEST MESSAGE')

  // if (webSocket) {
  //   webSocket
  // }
  // console.log(process)
  // console.log(webSocket)
  const [servers, setServers] = useState<Servers>({})
  const [currentServer, setCurrentServer] = useState('')

  // Changing the deeply nested state of servers doesn't trigger a re-render,
  // To "fix" this, we just force a re-render by changing the state of toggle
  // HOPEFULLY WE WONT NEED THIS BECUASE ITS JUST AN ARRAY OF STRINGS NOW
  const [toggle, setToggle] = useState(true);
  const chatRef = useRef<HTMLDivElement>(null);

  return (
    <div className='w-screen h-screen flex flex-col'>
      <div className='p-4 flex justify-between gap-4 flex-col-reverse sm:flex-row'>
        <NewConnection 
          servers={servers}
          setServers={setServers}
          setCurrentServer={setCurrentServer}
          setToggle={setToggle}
          chatRef={chatRef}
        />
        <UserInfo />
      </div>
      <button onClick={() => {
        // THIS WORKS, so maybe just merge ChatHistory into this component?
        webSocket?.send('TEST MESSAGE FROM CLIENT')
      }}>CLICK TO SEND MESSAGE</button>
      <ManageConnections
        servers={servers}
        currentServer={currentServer}
        setCurrentServer={setCurrentServer}
      />
      <ChatHistory
        servers={servers}
        currentServer={currentServer}
        chatRef={chatRef}
        // webSocket={webSocket}
      />
    </div>
  )
}
