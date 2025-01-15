import React, { useState, useEffect, ChangeEvent } from 'react'
import { io, Socket } from 'socket.io-client'

type Parameter = string | number | boolean | Record<string, any>

const App = () => {
  const [serverUrl, setServerUrl] = useState<string>(
    localStorage.getItem('serverUrl') || ''
  )
  const [eventName, setEventName] = useState<string>('')
  const [parameters, setParameters] = useState<Parameter[]>([''])
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connectionStatus, setConnectionStatus] =useState<string>('Disconnected')
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
            <p className="px-2 py-1 border border-green-600 text-green-600 text-xs rounded-full w-fit ml-auto">
              Connected
            </p>
            <p className="text-xs font-light mt-1">Socket ID: 98f9432f2f2d22</p>
          </div>
        </div>
        <div>
          <h2 className="text-lg">Server URL</h2>
          <div className="flex justify-between gap-2">
            <input placeholder="http://localhost:3000" className="font-mono" />
            <button className="app-button bg-green-700 text-white">
              Connect
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
            <div className="flex gap-2 justify-between mb-3">
              <input placeholder="Parameter 1" />
              <button className="app-button text-slate-600 border border-slate-600">
                Remove
              </button>
            </div>
            <div className="flex gap-2 justify-between mb-3">
              <input placeholder="Parameter 1" />
              <button className="app-button text-slate-600 border border-slate-600">
                Remove
              </button>
            </div>
            <button className="app-button border border-slate-700 text-slate-700 hover:bg-slate-100">
              Add Parameter +
            </button>
          </div>
          <button className="app-button bg-sky-600 text-white w-28 h-9 mt-4">
            Emit Event
          </button>
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
          <p>Lorem ipsum dolor sit amet.</p>
          <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit.</p>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Sapiente,
            officiis! Cupiditate qui quo temporibus, cumque voluptas voluptatum
            non provident laudantium.
          </p>
          <p>Lorem ipsum dolor sit amet.</p>
          <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit.</p>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Sapiente,
            officiis! Cupiditate qui quo temporibus, cumque voluptas voluptatum
            non provident laudantium.
          </p>
          <p>Lorem ipsum dolor sit amet.</p>
          <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit.</p>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Sapiente,
            officiis! Cupiditate qui quo temporibus, cumque voluptas voluptatum
            non provident laudantium.
          </p>
          <p>Lorem ipsum dolor sit amet.</p>
          <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit.</p>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Sapiente,
            officiis! Cupiditate qui quo temporibus, cumque voluptas voluptatum
            non provident laudantium.
          </p>
          <p>Lorem ipsum dolor sit amet.</p>
          <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit.</p>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Sapiente,
            officiis! Cupiditate qui quo temporibus, cumque voluptas voluptatum
            non provident laudantium.
          </p>
          <p>Lorem ipsum dolor sit amet.</p>
          <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit.</p>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Sapiente,
            officiis! Cupiditate qui quo temporibus, cumque voluptas voluptatum
            non provident laudantium.
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
