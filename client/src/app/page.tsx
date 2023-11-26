'use client';

import ChatWindow from '@/components/ChatWindow';
import { useUser } from '@clerk/nextjs';

export default function Home() {
  let webSocket;
  const { user } = useUser();
  if (user && !webSocket) {
    if (!process.env.NEXT_PUBLIC_WEBSOCKET_URL) {
      throw Error('Cant find environment variable for websocket url')
    }
    webSocket = new WebSocket(process.env.NEXT_PUBLIC_WEBSOCKET_URL)
  }
  return <ChatWindow webSocket={webSocket} />
}
