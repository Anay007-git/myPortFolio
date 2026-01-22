import { useEffect, useRef, useState } from 'react'

export default function MusicPlayer() {
    const audioRef = useRef(new Audio('/bgm.mp3'))
    const [isPlaying, setIsPlaying] = useState(false)
    const [hasInteracted, setHasInteracted] = useState(false)

    useEffect(() => {
        const audio = audioRef.current
        audio.loop = true
        audio.volume = 0.3

        return () => {
            audio.pause()
            audio.currentTime = 0
        }
    }, [])

    useEffect(() => {
        const handleInteraction = () => {
            if (!hasInteracted) {
                setHasInteracted(true)
                audioRef.current.play().catch(e => console.log("Audio play failed:", e))
                setIsPlaying(true)
            }
        }

        window.addEventListener('click', handleInteraction)
        window.addEventListener('keydown', handleInteraction)

        return () => {
            window.removeEventListener('click', handleInteraction)
            window.removeEventListener('keydown', handleInteraction)
        }
    }, [hasInteracted])

    const togglePlay = (e) => {
        e.stopPropagation()
        if (isPlaying) {
            audioRef.current.pause()
        } else {
            audioRef.current.play()
        }
        setIsPlaying(!isPlaying)
    }

    if (!hasInteracted) return null

    return (
        <div
            onClick={togglePlay}
            className="fixed bottom-8 right-8 z-[2000] cursor-pointer group pointer-events-auto"
        >
            <div className={`p-3 rounded-full border-2 transition-all duration-300 ${isPlaying
                    ? 'bg-[#ff0055] border-[#ff0055] shadow-[0_0_20px_#ff0055]'
                    : 'bg-black/50 border-white/20 hover:border-white'
                }`}>
                {isPlaying ? (
                    <div className="flex gap-1 h-4 items-end">
                        <div className="w-1 bg-white animate-[music-bar_0.5s_ease-in-out_infinite]" />
                        <div className="w-1 bg-white animate-[music-bar_0.7s_ease-in-out_infinite]" />
                        <div className="w-1 bg-white animate-[music-bar_0.4s_ease-in-out_infinite]" />
                    </div>
                ) : (
                    <div className="text-white text-xs font-bold px-1">OFF</div>
                )}
            </div>

            <style>{`
                @keyframes music-bar {
                    0%, 100% { height: 4px; }
                    50% { height: 16px; }
                }
            `}</style>
        </div>
    )
}
