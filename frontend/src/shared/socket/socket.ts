import { io, type Socket } from 'socket.io-client'

import { WS_URL } from '@/shared/config/env'

let socket: Socket | null = null

export function getSocket(): Socket {
  if (!socket) {
    socket = io(WS_URL, { autoConnect: false })
  }
  return socket
}

export function connectSocket(token: string): void {
  const s = getSocket()
  s.auth = { token }
  if (!s.connected) s.connect()
}

export function disconnectSocket(): void {
  socket?.disconnect()
}
