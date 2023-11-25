import { useState, RefObject } from 'react';
import { verifyInputs, viewErrors, getFormInputs } from '@/modules/inputValidation';

export default function Settings({ color, webSocket, usernameRef }: { color: string, webSocket?: WebSocket, usernameRef: RefObject<HTMLHeadingElement>  }) {
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
          const form = e.target as HTMLFormElement;
          const inputs = getFormInputs(form);
          const validation = verifyInputs(inputs);
          if (!validation.isValid) {
            return viewErrors(form, validation.errors);
          }

          if (webSocket) {
            webSocket.send(JSON.stringify({
              setColor: inputs.color
            }))

            // Set change color of displayed username manually
            if (usernameRef.current) {
              usernameRef.current.style.color = inputs.color
            }
          }
        }}
      >
        <input className='my-auto' name='color' type='color' defaultValue={color}/>
        <button className='bg-blue-700 rounded-full p-1 px-4' type='submit'>Set Color</button>
      </form>
    </div>
  )
}
