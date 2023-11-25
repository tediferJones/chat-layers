import { Servers } from '@/types'

export default function ManageConnections({
  servers,
  currentServer,
  setCurrentServer,
  webSocket,
  setServers,
}: {
  servers: Servers,
  currentServer: string,
  setCurrentServer: Function,
  webSocket?: WebSocket,
  setServers: Function,
}) {
  return (
    <div className='flex flex-wrap mx-2'>
      {Object.keys(servers).map((servername: string, i: number) => {
        if (servers[servername] === undefined) return
        return <div className={`flex-1 flex justify-between mx-2 mb-4 rounded-full ${currentServer === servername ? 'bg-blue-700' : 'bg-gray-600'}`} key={`server${i}`}>
          <button className='p-2 px-4 flex-1 text-left rounded-r-none' onClick={() => {
            setCurrentServer(servername) 
          }}>{servername}</button>
          <button className='ml-2 p-2 px-4 hover:bg-red-700 rounded-l-none' onClick={() => {
            webSocket?.send(JSON.stringify({
              disconnect: servername
            }))

            const servernames = Object.keys(servers).filter(servername => !!servers[servername])
            const serverIndex = servernames.indexOf(servername)
            const newCurrentServer = servernames[serverIndex + 1] || servernames[serverIndex - 1]
            
            if (newCurrentServer && servername === currentServer) {
              setCurrentServer(newCurrentServer)
            }

            setServers({
              ...servers,
              [servername]: undefined
            })
          }}><i className="fa-solid fa-xmark flex justify-center items-center"></i></button>
        </div>
      })}
    </div>
  )
}
