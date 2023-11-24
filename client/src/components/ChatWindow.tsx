'use client';
import { useState, useRef, useEffect, RefObject } from 'react'
import UserInfo from '@/components/UserInfo';
import NewConnection from '@/components/NewConnection';
import ManageConnections from '@/components/ManageConnections';
import ChatHistory from '@/components/ChatHistory';
import { Servers } from '@/types';
import { useUser } from '@clerk/nextjs';
// import { useUser } from '@clerk/nextjs';

// TO-DO:
//    - Send command to server when user closes a chatroom
//    - Make the server return a response for connect/disconnect commands
//      - Only modify servers/currentServer after we receive this response
//      - Is this really neccessary? The only commands are connect, disconnect, setColor, message
//        and none of those can really error out that badly
//    - Add input validation to webSocket Server

export default function ChatWindow({ webSocket }: { webSocket?: WebSocket }) {
  // URL needs to be imported from env var somehow
  console.log('RENDERING CHAT WINDOW COMPONENT')
  // console.log('props', props)

  // let webSocket: WebSocket;
  // const { user } = useUser();
  // if (user) {
  //   // CLICK THE BUTTON, WE ARE CONNECTED
  //   // The problem is that child components aren't re-rendering when webSocket gets assigned
  //   // Thus components that are passed 'webSocket' as a prop will essentially end up calling undefined.send()
  //   webSocket = new WebSocket('ws://localhost:8000')
  //   webSocket.onmessage = ({ data }) => {
  //     console.log('RECEIVING MESSAGE')
  //     console.log(data)
  //   }
  //   webSocket.onopen = () => console.log('WEBSOCKET HAS BEEN OPENED')
  // }

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

  const [isConnected, setIsConnected] = useState(false);

  // Changing the deeply nested state of servers doesn't trigger a re-render,
  // To "fix" this, we just force a re-render by changing the state of toggle
  // HOPEFULLY WE WONT NEED THIS BECUASE ITS JUST AN ARRAY OF STRINGS NOW
  const [toggle, setToggle] = useState(true);
  const chatRef = useRef<HTMLDivElement>(null);

  // function getChat(chatRoom: string) {
  //   return servers[chatRoom];
  // }

  // function msgFunc({ data }: { data: string }) {
  //   console.log(data)
  //   const res = JSON.parse(data)
  //   console.log('RECEIVING MESSAGE', res)
  //   if (res.formattedMessage) {
  //     console.log('RECIEVED FORMATTED MESSAGE')
  //     // console.log(servers[res.chatRoom])
  //     // console.log(servers[res.chatRoom].concat(res.formattedMessage))
  //     console.log(servers)
  //     setServers({
  //       ...servers,
  //       [res.chatRoom]: servers[res.chatRoom].concat(res.formattedMessage)
  //     })
  //     // setServers(oldServers => {
  //     //   // console.log(oldServers, res.chatRoom)
  //     //   console.log('SETTING STATE')
  //     //   oldServers[res.chatRoom].push(res.formattedMessage)
  //     //   return oldServers;
  //     // })
  //     setToggle((oldToggle: boolean) => !oldToggle)

  //   }
  // }

  // function autoscroll(ref: RefObject<HTMLDivElement>) {
  //   if (ref.current) {
  //     // console.log('AUTO SCROLLING')
  //     let { scrollHeight, scrollTop, clientHeight } = chatRef.current;
  //     // console.log(scrollHeight, scrollTop, clientHeight)
  //     // console.log(scrollHeight - Math.ceil(scrollTop) - clientHeight)
  //     const scollLocation = scrollHeight - Math.ceil(scrollTop) - clientHeight
  //     // if (scrollHeight - Math.ceil(scrollTop) === clientHeight) {
  //     if (scollLocation < 5 && scollLocation > -5) {
  //       // console.log("NOW WE SCROLL")
  //       setTimeout(() => {
  //         if (ref.current) {
  //           ref.current.scrollTop = ref.current.scrollHeight;
  //         }
  //       }, 50);
  //     }
  //   }
  // }


  // TESTING
  // let webSocket;
  // const { user } = useUser();

  // // if (user && !webSocket) {
  // if (user && !webSocket) {
  //   console.log('START WEBSOCKET')
  //   console.log(webSocket)
  //   if (!process.env.NEXT_PUBLIC_WEBSOCKET_URL) {
  //     throw Error('CANT FIND ENV VAR FOR WEBSOCKET URL')
  //   }
  //   webSocket = new WebSocket(process.env.NEXT_PUBLIC_WEBSOCKET_URL)
  //   webSocket.onmessage = ({ data }) => {
  //     const res = JSON.parse(data)
  //     console.log('RECEIVING MESSAGE', res)
  //     if (res.formattedMessage) {
  //       // console.log('RECIEVED FORMATTED MESSAGE')
  //       // console.log(servers)

  //       // YOU SHOULD PROBABLY MOVE THIS TO ITS OWN FUNCTION
  //       if (chatRef.current) {
  //         // console.log('AUTO SCROLLING')
  //         // console.log(scrollHeight, scrollTop, clientHeight)
  //         // console.log(scrollHeight - Math.ceil(scrollTop) - clientHeight)
  //         let { scrollHeight, scrollTop, clientHeight } = chatRef.current;
  //         const scollLocation = scrollHeight - Math.ceil(scrollTop) - clientHeight
  //         if (scollLocation < 5 && scollLocation > -5) {
  //           setTimeout(() => {
  //             if (chatRef.current) {
  //               chatRef.current.scrollTop = chatRef.current.scrollHeight;
  //             }
  //           }, 50);
  //         }
  //       }

  //       setServers({
  //         ...servers,
  //         [res.chatRoom]: servers[res.chatRoom].concat(res.formattedMessage),
  //       })

  //       // DONT USE THIS METHOD, IT RUNS THE SAME CODE TWICE
  //       // setServers(oldServers => {
  //       //   // console.log(oldServers, res.chatRoom)
  //       //   console.log('SETTING STATE')
  //       //   oldServers[res.chatRoom].push(res.formattedMessage)
  //       //   return oldServers;
  //       // })
  //       //
  //       // ALSO DONT NEED THIS ANYMORE
  //       // setToggle((oldToggle: boolean) => !oldToggle)
  //       // CHANGE STATE HERE, hopefully it will re-render
  //     }
  //   }
  //   webSocket.onopen = () => setIsConnected(true);
  //   // THIS SHOULD ONLY EVER HAPPEN IF THE SERVER CRASHES, BUT WE SHOULD STILL HANDLE THIS CASE
  //   // webSocket.onclose = () => console.log('WEBSOCKET IS CLOSING')
  //   webSocket.onclose = () => window.location.reload();
  // }


  // ONLY RUN THIS ONCE, i.e. so it doesnt re run when the page re renders
  // if (webSocket && !webSocket.onmessage) {
  // ACTUALLY WE WANT IT TO RE-RUN EVERYTIME THE PAGE RE-RENDERS
  // Because for some reason this forms a closure and the servers var becomes stale
  if (webSocket) {
    // console.log('SETTING WEBSOCKET')
    // webSocket.onmessage = msgFunc
    webSocket.onmessage = ({ data }) => {
      const res = JSON.parse(data)
      console.log('RECEIVING MESSAGE', res)
      if (res.formattedMessage) {
        // console.log('RECIEVED FORMATTED MESSAGE')
        // console.log(servers)

        // YOU SHOULD PROBABLY MOVE THIS TO ITS OWN FUNCTION
        if (chatRef.current) {
          // console.log('AUTO SCROLLING')
          // console.log(scrollHeight, scrollTop, clientHeight)
          // console.log(scrollHeight - Math.ceil(scrollTop) - clientHeight)
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

        setServers({
          ...servers,
          [res.chatRoom]: servers[res.chatRoom].concat(res.formattedMessage),
        })

        // DONT USE THIS METHOD, IT RUNS THE SAME CODE TWICE
        // setServers(oldServers => {
        //   // console.log(oldServers, res.chatRoom)
        //   console.log('SETTING STATE')
        //   oldServers[res.chatRoom].push(res.formattedMessage)
        //   return oldServers;
        // })
        //
        // ALSO DONT NEED THIS ANYMORE
        // setToggle((oldToggle: boolean) => !oldToggle)
        // CHANGE STATE HERE, hopefully it will re-render
      }

      // if (res.disconnect) {
      //   console.log('DISCONNECT')
      //   console.log(servers)
      //   // setServers((oldServers: Servers) => {
      //   //   console.log(res.disconnect)
      //   //   delete oldServers[res.disconnect];
      //   //   return oldServers;
      //   // })
      // }
    }
    // webSocket.onopen = () => console.log('WEBSOCKET HAS BEEN OPENED')
    webSocket.onopen = () => setIsConnected(true);
    // THIS SHOULD ONLY EVER HAPPEN IF THE SERVER CRASHES, BUT WE SHOULD STILL HANDLE THIS CASE
    // webSocket.onclose = () => console.log('WEBSOCKET IS CLOSING')
    webSocket.onclose = () => window.location.reload();
  }

  // It would be nice if we displayed a nice big loading spinner until the websocket is open
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
          setToggle={setToggle}
          chatRef={chatRef}
          webSocket={webSocket}
        />
        <UserInfo webSocket={webSocket} />
      </div>
      {/*
      <button onClick={() => {
        // THIS WORKS, so maybe just merge ChatHistory into this component?
        webSocket?.send('TEST MESSAGE FROM CLIENT')
      }}>CLICK TO SEND MESSAGE</button>
      */}
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
