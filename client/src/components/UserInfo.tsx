'use client';
// import { useEffect, useState } from 'react';
import Settings from '@/components/Settings';
// import easyFetch from '@/modules/easyFetch';
// import { ResBody, UserAuth } from '@/types';
// import { currentUser } from '@clerk/nextjs/server';
import { RedirectToSignIn, useUser } from '@clerk/nextjs';
import { UserButton } from '@clerk/nextjs';
import { useState, useRef } from 'react';

export default function UserInfo({ webSocket }: { webSocket?: WebSocket }) {
  // console.log('RERENDERING USER-INFO')
  // const [refreshToggle, setRefreshToggle] = useState<boolean>(false);
  // const [auth, setAuth] = useState<null | UserAuth>(null);
  // const [color, setColor] = useState('#ffffff')
  const usernameRef = useRef<HTMLHeadingElement>(null)

  // useEffect(() => {
  //   (async() => {
  //     const resBody: ResBody = await easyFetch('/api/verify', 'GET')
  //     setAuth(resBody.user)
  //   })()
  // }, [refreshToggle])
    // <>
    //   {auth === null ? <h1>Loading...</h1> :
    //     !auth ? <a href='/login'>Login</a> :
    //   }
    // </>
  // setRefreshToggle={setRefreshToggle}

  // const user = await currentUser();
  const { user } = useUser();
  // console.log(user)
  // console.log(user?.username)
  // console.log(user?.publicMetadata)
  // console.log('PUBLIC USER METADATA')
  // console.log(user?.publicMetadata)

  // WORKING
  const color = user?.publicMetadata.color as string || '#ffffff';

  // if (user?.publicMetadata.color && user?.publicMetadata.color !== color) {
  //   setColor(user.publicMetadata.color as string)
  // }

  // const auth = {
  //   username: 'testname',
  //   color: '#ffffff'
  // }

  return (
    !user ? <RedirectToSignIn /> :
    <div className='flex gap-4 justify-between items-center w-full sm:w-min'>
      <h1 className='text-center my-auto w-1/3 sm:w-min' ref={usernameRef}
        style={{color}}
      >{user.username}</h1> 
      <Settings color={color} userId={user.id} webSocket={webSocket} setColor={() => {}} usernameRef={usernameRef} />
      <UserButton />
      {/*
      <button className='px-4 p-1 bg-blue-700 w-1/3 sm:w-min' onClick={async() => {
        console.log('LOGOUT BUTTON')
        // await easyFetch('/api/logout', 'GET', {}, true)
        // window.location.href = '/login';
        // setRefreshToggle(!refreshToggle)
      }}>Logout</button>
      */}
    </div>
  )
}
