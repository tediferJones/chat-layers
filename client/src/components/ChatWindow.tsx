'use client';
import { useState, useRef, RefObject } from 'react'
import UserInfo from '@/components/UserInfo';
import NewConnection from '@/components/NewConnection';
import ManageConnections from '@/components/ManageConnections';
import ChatHistory from '@/components/ChatHistory';
import { FormattedMessage, Servers } from '@/types';

export default function ChatWindow({ webSocket }: { webSocket?: WebSocket }) {
  function autoScroll(ref: RefObject<HTMLDivElement>) {
    if (ref.current) {
      let { scrollHeight, scrollTop, clientHeight } = ref.current;
      const scollLocation = scrollHeight - Math.ceil(scrollTop) - clientHeight
      if (scollLocation < 5 && scollLocation > -5) {
        setTimeout(() => {
          if (ref.current) {
            ref.current.scrollTop = ref.current.scrollHeight;
          }
        }, 50);
      }
    }
  }

  const [servers, setServers] = useState<Servers>({})
  const [currentServer, setCurrentServer] = useState('')
  const [isConnected, setIsConnected] = useState<null | boolean>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  // Reset websocket event listeners when page reloads so it uses the new value of servers
  if (webSocket) {
    webSocket.onmessage = ({ data }) => {
      const res: { chatRoom: string, formattedMessage: FormattedMessage } = JSON.parse(data)
      if (res.formattedMessage && servers[res.chatRoom]) {
        autoScroll(chatRef);
        setServers({
          ...servers,
          [res.chatRoom]: servers[res.chatRoom].concat(res.formattedMessage),
        })
      }
    }
    webSocket.onopen = () => setIsConnected(true);
    webSocket.onclose = () => setIsConnected(false);
  }

  return (
    <div className='w-screen h-screen flex flex-col'>
      {isConnected ? [] : 
        isConnected === null ? <div className='absolute h-screen w-screen bg-black bg-opacity-90 flex justify-center items-center text-3xl z-50'>
          <h1>Connecting to WebSocket Server...</h1>
        </div> : <div className='absolute h-screen w-screen bg-black bg-opacity-90 flex justify-center items-center text-3xl z-50 flex-col gap-4'>
          <h1>Failed to connect to WebSocket Server</h1>
          <h1>Please refresh the page to try again</h1>
        </div>
      }
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
