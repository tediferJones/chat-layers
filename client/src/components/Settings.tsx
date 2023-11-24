import { useState } from 'react';
// import { clerkClient } from '@clerk/nextjs/server';
// import easyFetch from '@/modules/easyFetch';
import { verifyInputs, viewErrors, getFormInputs } from '@/modules/inputValidation';
// import { ResBody } from '@/types';
import { RefObject } from 'react';

export default function Settings({ color, userId, setRefreshToggle, webSocket, setColor, usernameRef }: 
  { color: string, userId: string, setRefreshToggle?: Function, webSocket?: WebSocket, setColor?: Function, usernameRef: RefObject<HTMLHeadingElement>  }
) {
  const [colorForm, setColorForm] = useState<boolean>(false);

  return (
    <div className='flex justify-center items-center' 
      onMouseEnter={() => setColorForm(true)}
      onMouseLeave={() => setColorForm(false)}
    >
      <button className='fa-solid fa-gear bg-blue-700 p-2'
        onClick={() => setColorForm(!colorForm)}
      ></button>

      <div className='absolute h-8 w-8 top-8'></div>

      <form className={`flex gap-4 absolute top-14 right-4 bg-gray-800 p-4 rounded-full${colorForm ? '' : ' hidden'}`}
        onSubmit={async (e) => {
          e.preventDefault();
          console.log('CHANGE COLOR')

          const form = e.target as HTMLFormElement;
          const inputs = getFormInputs(form);
          const validation = verifyInputs(inputs);
          console.log(inputs)
          if (!validation.isValid) {
            return viewErrors(form, validation.errors);
          }
          // console.log(inputs.color)
          webSocket?.send(JSON.stringify({
            setColor: inputs.color
          }))

          // Set change color of displayed username manually
          if (usernameRef.current) {
            usernameRef.current.style.color = inputs.color
          }

          // document.querySelector('#testId').style.color = inputs.color
          // setColor(inputs.color)

          // If we dont need a server response, we can just refresh this component
          // And we wont need to mess with the onmessage function to get this working

          // TO UPDATE COLOR, create a color state var in chatHistory, pass it to this component
          // When we run setColor it should trigger a re-render

          // YOU WILL PROBABLY HAVE TO BUILD AN API ROUTE FOR THIS PART
          // OR YOU JUST SEND A COMMAND TO THE WEBSOCKET SERVER
          // clerkClient.users.updateUserMetadata()

          // const form = e.target as HTMLFormElement;
          // const inputs = getFormInputs(form);
          // const validation = verifyInputs(inputs);
          // if (!validation.isValid) {
          //   return viewErrors(form, validation.errors);
          // }

          // const resBody: ResBody = await easyFetch('/api/setColor', 'POST', inputs);
          // if (Object.keys(resBody.errors).length) {
          //   return viewErrors(form, resBody.errors);
          // }
          // setRefreshToggle((oldToggle: boolean) => !oldToggle);
        }}
      >
        <input className='my-auto' name='color' type='color' defaultValue={color}/>
        <button className='bg-blue-700 rounded-full p-1 px-4' type='submit'>Set Color</button>
      </form>
    </div>
  )
}
