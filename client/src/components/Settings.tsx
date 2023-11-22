import { useState } from 'react';
// import { clerkClient } from '@clerk/nextjs/server';
// import easyFetch from '@/modules/easyFetch';
// import { verifyInputs, viewErrors, getFormInputs } from '@/modules/inputValidation';
// import { ResBody } from '@/types';

export default function Settings({ color, userId, setRefreshToggle }: { color: string, userId: string, setRefreshToggle?: Function }) {
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

          // YOU WILL PROBABLY HAVE TO BUILD AN API ROUTE FOR THIS PART
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
