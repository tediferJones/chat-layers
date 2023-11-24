import { RefObject, useRef } from 'react';
import { getFormInputs } from '@/modules/inputValidation';
import { Servers } from '@/types'

export default function ChatHistory({ 
  servers,
  currentServer,
  chatRef,
  webSocket,
}: { 
  servers: Servers,
  currentServer: string,
  chatRef: RefObject<HTMLDivElement>,
  webSocket?: WebSocket
}) {
  const formRef = useRef<HTMLFormElement>(null);
  return (
    <>
      <div className='flex-1 overflow-auto mx-4 px-4 py-2 scrollbar bg-black rounded-xl'
        role='list'
        tabIndex={0}
        ref={chatRef}
      >
        {// !Object.keys(servers).includes(currentServer) ? <div className='w-full h-full flex justify-center items-center text-xl'>Please connect to a chat room</div>:
          !servers[currentServer] ? <div className='w-full h-full flex justify-center items-center text-xl'>Please connect to a chat room</div>:
          // servers[currentServer].chatHistory.map((msg: string, i: number) => {
          servers[currentServer].map((msg: any, i: number) => {
            // if (i === 0) console.log('##############################################')
            // console.log(msg)
            const newMessage = msg
            // const newMessage = JSON.parse(msg);
            // THIS EXPECTS A JSON STRING FORMATED AS { username, color, message }
            return <div className='break-words' key={i}>
              <span style={{ color: newMessage.color }}>{newMessage.username}</span>
              <span>{newMessage.message === 'has connected' ? ' ' : ': '}{newMessage.message}</span>
            </div>
          })
        }
      </div>
      <form className='flex m-4' 
        ref={formRef}
        onSubmit={(e) => {
          e.preventDefault();
          console.log('SEND MESSAGE')
          const form = e.target as HTMLFormElement;
          const inputs = getFormInputs(form)
          const message: string = inputs.message.trim();
          // console.log('SENDING ' + message)
          // console.log(webSocket)
          // WORKING
          // webSocket?.send(message)

          if (message) {
            webSocket?.send(JSON.stringify({
              message: {
                content: message,
                chatRoom: currentServer,
              }
            }))
          }

          // if (message && Object.keys(servers).includes(currentServer)) {
          //   console.log('SEND MESSAGE VIA WEBSOCKET CONNECTION')
          //   // servers[currentServer].send(message);
          // }
          form.reset()
        }}
      >
        <textarea className='flex-1 p-2 px-4 resize-none break-words rounded-l-3xl rounded-r-none innerScrollbar'
          id='message'
          name='message'
          rows={2}
          placeholder='Press Ctrl + Enter to send'
          required
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
              formRef.current?.submitBtn.click();
            }
          }}
        />
        <button className='bg-blue-700 p-2 px-4 rounded-r-3xl rounded-l-none'
          name='submitBtn'
          type='submit'
        >Send</button>
      </form>
    </>
  )
}
