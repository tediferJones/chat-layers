'use client';
import { useState, useRef, RefObject } from 'react'
import UserInfo from '@/components/UserInfo';
import NewConnection from '@/components/NewConnection';
import ManageConnections from '@/components/ManageConnections';
import ChatHistory from '@/components/ChatHistory';
import { Servers } from '@/types';
// import { useUser } from '@clerk/nextjs';

// interface FormattedMessage {
//   chatRoom: string,
//   formattedMessage: {
//     message: string,
//     username: string,
//     color: string,
//   }
// }

// TO-DO:
//    - Make the server return a response for connect/disconnect commands
//      - Only modify servers/currentServer after we receive this response
//      - Is this really neccessary? The only commands are connect, disconnect, setColor, message
//        and none of those can really error out that badly
//    - Add input validation to webSocket Server
//    - Delete extra types, if we only have few just delete types.ts and move types to top of this file
//    - Fix any type on webSocket.onmessage event listener
//    - Client should stop trying to connect to websocket server after 5 attempts
//      - If client cant connect display some error like "Cant reach websocket server, please try again later"

export default function ChatWindow({ webSocket }: { webSocket?: WebSocket }) {
  console.log('RENDERING CHAT WINDOW COMPONENT')
  function autoScroll(ref: RefObject<HTMLDivElement>) {
    if (chatRef.current) {
      let { scrollHeight, scrollTop, clientHeight } = chatRef.current;
      const scollLocation = scrollHeight - Math.ceil(scrollTop) - clientHeight
      if (scollLocation < 5 && scollLocation > -5) {
        setTimeout(() => {
          if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
          }
        }, 50);
      }
    }
  }

  const [servers, setServers] = useState<Servers>({})
  const [currentServer, setCurrentServer] = useState('')
  const [isConnected, setIsConnected] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  // Reset websocket event listeners when page reloads so it uses the new value of servers
  if (webSocket) {
    webSocket.onmessage = ({ data }) => {
      // FIX THE USE ANY
      const res: { chatRoom: string, formattedMessage: any } = JSON.parse(data)
      console.log('RECEIVING MESSAGE', res)
      if (res.formattedMessage && servers[res.chatRoom]) {
        autoScroll(chatRef);
        setServers({
          ...servers,
          [res.chatRoom]: servers[res.chatRoom].concat(res.formattedMessage),
        })
      }
    }
    webSocket.onopen = () => setIsConnected(true);
    // THIS NEEDS TO BE LIMITED TO A CERTAIN NUMBER OF ATTEMPTS
    // Once exceeded, show some message like "Cant connect to webSocket server"
    webSocket.onclose = () => window.location.reload();
  }

  return (
    <div className='w-screen h-screen flex flex-col'>
      {isConnected ? [] : <div className='absolute h-screen w-screen bg-black bg-opacity-90 flex justify-center items-center text-3xl z-50'>
        <h1>Connecting to WebSocket Server...</h1>
      </div>}
      <div className='p-4 flex justify-between gap-4 flex-col-reverse sm:flex-row'>
        <NewConnection 
          servers={servers}
          setServers={setServers}
          setCurrentServer={setCurrentServer}
          webSocket={webSocket}
        />
        <UserInfo webSocket={webSocket} />
      </div>
      <ManageConnections
        servers={servers}
        currentServer={currentServer}
        setCurrentServer={setCurrentServer}
        webSocket={webSocket}
        setServers={setServers}
      />
      <ChatHistory
        servers={servers}
        currentServer={currentServer}
        chatRef={chatRef}
        webSocket={webSocket}
      />
    </div>
  )
}
