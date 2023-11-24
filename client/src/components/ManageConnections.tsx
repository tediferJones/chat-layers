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
        // console.log('RENDER FOR ' + servername)
        // console.log(servers)
        return <div className={`flex-1 flex justify-between mx-2 mb-4 rounded-full ${currentServer === servername ? 'bg-blue-700' : 'bg-gray-600'}`} key={`server${i}`}>
          <button className='p-2 px-4 flex-1 text-left rounded-r-none' onClick={() => {
            setCurrentServer(servername) 
          }}>{servername}</button>
          <button className='ml-2 p-2 px-4 hover:bg-red-700 rounded-l-none' onClick={() => {
            // console.log('CLOSE SERVER AND SELECT NEW ONE TO VIEW')
            webSocket?.send(JSON.stringify({
              disconnect: servername
            }))

            // console.log('IS THIS A CLOSURE EVEN THO IT RE-RENDERS?')
            // console.log(servers)
            // console.log(Object.keys(servers).filter(i => !!i))
            const servernames = Object.keys(servers).filter(servername => !!servers[servername])
            const serverIndex = servernames.indexOf(servername)
            // console.log(servername, servernames)
            const newCurrentServer = servernames[serverIndex + 1] || servernames[serverIndex - 1]
            
            if (newCurrentServer && servername === currentServer) {
              // console.log('SET NEW SERVER')
              // console.log(newCurrentServer)
              setCurrentServer(newCurrentServer)
            }

            setServers({
              ...servers,
              [servername]: undefined
            })

            // THIS DOESNT WORK EVEN THO IT DOES THE SAME THING
            // setServers((oldServers: Servers) => {
            //   delete oldServers[servername];
            //   return oldServers;
            // })

            // Select a new server when closing
            // const servernames = Object.keys(servers)
            // const serverIndex = servernames.indexOf(servername)
            // const newCurrentServer = servernames[serverIndex + 1] || servernames[serverIndex - 1]
            // 
            // if (newCurrentServer && servername === currentServer) {
            //   setCurrentServer(newCurrentServer)
            // }

            // servers[servername].close()
          }}><i className="fa-solid fa-xmark flex justify-center items-center"></i></button>
        </div>
      })}
    </div>
  )
}
