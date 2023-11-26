import NewInput from '@/components/NewInput';
import { verifyInputs, viewErrors, getFormInputs } from '@/modules/inputValidation';
import { Servers } from '@/types';

export default function NewConnection({ 
  servers, 
  setServers, 
  setCurrentServer,
  webSocket,
}: {
  servers: Servers,
  setServers: Function,
  setCurrentServer: Function,
  webSocket?: WebSocket,
}) {
  return (
    <form className='flex flex-wrap gap-4' onSubmit={async(e) => {
      e.preventDefault();
      const form = e.target as HTMLFormElement;
      const { servername } = getFormInputs(form)

      // // If user is already connected to this server, just switch chat view to that server
      if (servers[servername]) {
        setCurrentServer(servername);
        form.reset();
        return;
      }

      const validity = verifyInputs({ servername });
      if (!validity.isValid) {
        return viewErrors(form, validity.errors)
      }

      webSocket?.send(JSON.stringify({
        connect: servername
      }))

      setCurrentServer(servername)
      setServers((oldServers: Servers) => {
        oldServers[servername] = [];
        return oldServers;
      })
      form.reset();
    }}>
      <NewInput inputName='servername'
        className='flex flex-1 justify-between gap-4'
        labelClassName='flex justify-center items-center flex-1'
        inputClassName='p-1 px-2 bg-gray-600'
        type='text'
      />
      <button className='flex-1 bg-blue-700 p-1 px-4' type='submit'>Connect</button>
    </form>
  )
}
