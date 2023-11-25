'use client';
import { useRef } from 'react';
import Settings from '@/components/Settings';
import { RedirectToSignIn, useUser } from '@clerk/nextjs';
import { UserButton } from '@clerk/nextjs';

export default function UserInfo({ webSocket }: { webSocket?: WebSocket }) {
  const usernameRef = useRef<HTMLHeadingElement>(null)

  const { user } = useUser();
  const color = user?.publicMetadata.color as string || '#ffffff';

  return (
    !user ? <RedirectToSignIn /> :
    <div className='flex gap-4 justify-between items-center w-full sm:w-min'>
      <h1 className='text-center my-auto w-1/3 sm:w-min' ref={usernameRef}
        style={{color}}
      >{user.username}</h1> 
      <Settings color={color} webSocket={webSocket} usernameRef={usernameRef} />
      <UserButton />
    </div>
  )
}
