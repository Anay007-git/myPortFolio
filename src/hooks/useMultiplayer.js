import { useEffect, useState, useRef } from 'react'
import { io } from 'socket.io-client'
import useGameStore from '../stores/useGameStore.js'
import * as THREE from 'three'

const socket = io('http://localhost:3000', {
    autoConnect: false,
    reconnection: false,
    timeout: 5000,
})

export default function useMultiplayer() {
    const [players, setPlayers] = useState({})
    const playerBody = useRef(null) // We need a way to get local player position

    useEffect(() => {
        if (!socket.connected) {
            socket.on('connect_error', (err) => {
                // Silently fail if server is not up (only log once if needed, or suppress)
                // socket.disconnect() // Disconnect handled automatically by reconnection: false usually
            })
            socket.connect()
        }

        socket.on('players', (serverPlayers) => {
            setPlayers(serverPlayers)
        })

        socket.on('playerJoined', ({ id, data }) => {
            setPlayers(prev => ({ ...prev, [id]: data }))
        })

        socket.on('playerMoved', ({ id, data }) => {
            setPlayers(prev => {
                if (!prev[id]) return prev
                return { ...prev, [id]: data }
            })
        })

        socket.on('playerLeft', (id) => {
            setPlayers(prev => {
                const newPlayers = { ...prev }
                delete newPlayers[id]
                return newPlayers
            })
        })

        return () => {
            socket.disconnect()
            socket.off('connect')
            socket.off('players')
            socket.off('playerJoined')
            socket.off('playerMoved')
            socket.off('playerLeft')
        }
    }, [])

    // Function to broadcast local movement
    const updatePlayer = (position, rotation, action) => {
        if (!socket.connected) return
        socket.emit('move', { position, rotation, action })
    }

    return { players, updatePlayer, mySocketId: socket.id }
}
