import { useState, useEffect, ChangeEvent } from 'react'
import { io, Socket } from 'socket.io-client'

type Parameter = string | number | boolean | Record<string, any>

const App = () => {
  const [serverUrl, setServerUrl] = useState<string>(
    localStorage.getItem('serverUrl') || ''
  )
  const [eventName, setEventName] = useState<string>('')
  const [parameters, setParameters] = useState<Parameter[]>([''])
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connectionStatus, setConnectionStatus] =
    useState<string>('Disconnected')
  const [socketId, setSocketId] = useState<string | null>(null)
  const [output, setOutput] = useState<string[]>([])

  useEffect(() => {
    if (serverUrl) {
      localStorage.setItem('serverUrl', serverUrl)
    }
  }, [serverUrl])

  const connectToServer = () => {
    if (socket) {
      socket.disconnect()
    }
    const newSocket = io(serverUrl)

    newSocket.on('connect_error', (error) => {
      setConnectionStatus('Error')
      setSocketId(null)
      setOutput((prev) => [...prev, `${error}`])
    })

    newSocket.on('error', (error) => {
      setConnectionStatus('Error')
      setSocketId(null)
      setOutput((prev) => [...prev, `Error: ${error}`])
    })

    newSocket.on('connect', () => {
      setConnectionStatus('Connected')
      setSocketId(newSocket.id || null)
    })
    newSocket.on('disconnect', () => {
      setConnectionStatus('Disconnected')
      setSocketId(null)
    })
    newSocket.onAny((event, ...args) => {
      const newOutput = `Received event "${event}" with args: ${JSON.stringify(
        args
      )}`
      setOutput((prev) => [...prev, newOutput])
    })
    setSocket(newSocket)
  }

  const disconnectFromServer = () => {
    if (socket) {
      socket.disconnect()
      setSocket(null)
      setConnectionStatus('Disconnected')
      setSocketId(null)
    }
  }

  const emitEvent = () => {
    if (!socket) {
      setOutput((prev) => [...prev, 'Error: Not connected to a server.'])
      return
    }
    if (eventName.trim() === '') {
      setOutput((prev) => [...prev, 'Error: Event name cannot be empty.'])
      return
    }
    socket.emit(eventName, ...parameters)
    const log = `Emitted event "${eventName}" with parameters: ${JSON.stringify(
      parameters
    )}`
    setOutput((prev) => [...prev, log])
  }

  const addParameter = () => setParameters([...parameters, ''])

  const updateParameter = (index: number, value: string) => {
    let parsedValue: Parameter = value

    if (value === 'true' || value === 'false') {
      parsedValue = value === 'true' // Boolean
    } else if (!isNaN(Number(value))) {
      parsedValue = Number(value) // Number
    } else {
      try {
        parsedValue = JSON.parse(value) // JSON Object
      } catch {
        parsedValue = value // String fallback
      }
    }

    const updatedParams = [...parameters]
    updatedParams[index] = parsedValue
    setParameters(updatedParams)
  }

  const deleteParameter = (index: number) => {
    setParameters(parameters.filter((_, i) => i !== index))
  }

  return (
    <div className="h-screen grid grid-cols-2 gap-3 p-3">
      <div className="space-y-6 p-5 overflow-y-scroll">
        <div className="flex justify-between pt-6">
          <h1 className="text-4xl font-semibold">Socket.IO Tester</h1>
          <div>
            <p
              className={`px-2 py-1 border ${
                connectionStatus === 'Connected'
                  ? 'border-green-600'
                  : 'border-red-600'
              } ${
                connectionStatus === 'Connected'
                  ? 'text-green-600'
                  : 'text-red-600'
              } text-xs rounded-full w-fit ml-auto`}
            >
              {connectionStatus}
            </p>
            {connectionStatus === 'Connected' && (
              <p className="text-xs font-light mt-1">Socket ID: {socketId}</p>
            )}
          </div>
        </div>
        <div>
          <h2 className="text-lg">Server URL</h2>
          <div className="flex justify-between gap-2">
            <input
              placeholder="http://localhost:3000"
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              className="font-mono"
            />
            {connectionStatus === 'Connected' ? (
              <button
                onClick={disconnectFromServer}
                className="app-button bg-red-700 text-white"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={connectToServer}
                className="app-button bg-green-700 text-white"
                disabled={!serverUrl}
              >
                Connect
              </button>
            )}
          </div>
        </div>

        <div>
        <h2 className="text-lg">Emit Event</h2>
          <div className="flex justify-between gap-2">
            <input
              placeholder="event-name"
              className="font-mono"
              value={eventName}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setEventName(e.target.value)
              }
            />
            <button className="app-button bg-sky-600 text-white min-w-16" onClick={emitEvent}
            disabled={!eventName}>
              Emit
            </button>
          </div>
        </div>

        <div>
          <h2 className="text-lg">Parameters</h2>
          <p className="text-sm text-slate-900">
            Enter any kind of parameter in textual format & they'll be parsed
            automatically
          </p>
          <div className="my-4">
            {parameters.map((param, index) => (
              <div key={index} className="flex gap-2 justify-between mb-3">
              <input placeholder={`Parameter ${index + 1}`} value={
                    typeof param === 'string' ? param : JSON.stringify(param)
                  }
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    updateParameter(index, e.target.value)
                  } />
              <button onClick={() => deleteParameter(index)} className="app-button text-slate-600 border border-slate-600">
                Remove
              </button>
            </div>
            ))}
            <button onClick={addParameter} className="app-button border border-slate-700 text-slate-700 hover:bg-slate-100">
              Add Parameter +
            </button>
          </div>
        </div>

        <div className="opacity-70 pt-6 text-xs">
          <hr />
          <p className="pt-4">&copy; {new Date().getFullYear()} Yash Jawale</p>
          <p>Using Socket.IO-client 4.8.1 & above</p>
          <a
            href="https://github.com/yashjawale/socketio-tester"
            target="_blank"
            className="underline"
          >
            View Source
          </a>
        </div>
      </div>
      <div className="rounded-xl overflow-hidden">
        <div className="flex justify-between bg-slate-700 text-white p-4">
          <h2>Logs</h2>
          <button className="app-button bg-red-600">Clear</button>
        </div>
        <div className="h-full max-h-svh overflow-y-scroll p-4 bg-slate-900 text-slate-200 font-mono text-sm [&>*]:border-b-[0.5px] [&>*]:border-slate-500 [&>*]:pb-2 [&>*]:mb-2">
        {output.length === 0 ? (
            <p>No logs yet.</p>
          ) : (
            output.map((log, index) => (
              <p key={index}>
                {log}
              </p>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default App
