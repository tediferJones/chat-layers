'use client';
// MOVE THIS TO LOWER LEVEL COMPONENTS

import ChatWindow from '@/components/ChatWindow';
import { useUser } from '@clerk/nextjs';

export default function Home() {
  // It would be nice if this could be in the same component as where we add the eventListeners to the websocket
  let webSocket;
  const { user } = useUser();
  if (user && !webSocket) {
    console.log('START WEBSOCKET')
    if (!process.env.NEXT_PUBLIC_WEBSOCKET_URL) {
      throw Error('CANT FIND ENV VAR FOR WEBSOCKET URL')
    }
    webSocket = new WebSocket(process.env.NEXT_PUBLIC_WEBSOCKET_URL)
  }

  return <ChatWindow webSocket={webSocket} />
}
