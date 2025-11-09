"use client";

import { useEffect, useRef, useState } from 'react'
import useAssistantStore from '@/lib/store'

function speak(text: string) {
  if (typeof window === 'undefined') return
  const synth = window.speechSynthesis
  const utter = new SpeechSynthesisUtterance(text)
  utter.rate = 1
  utter.pitch = 1
  synth.cancel()
  synth.speak(utter)
}

export default function VoiceAssistant() {
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef<any>(null)
  const { addMessage, handleVoiceCommand } = useAssistantStore()

  useEffect(() => {
    const SR: any = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    if (SR) {
      const recog = new SR()
      recog.lang = 'en-US'
      recog.continuous = true
      recog.interimResults = false
      recog.onresult = (e: any) => {
        const transcript = Array.from(e.results).map((r: any) => r[0].transcript).join(' ')
        addMessage({ role: 'user', content: transcript })
        const reply = handleVoiceCommand(transcript)
        addMessage({ role: 'assistant', content: reply })
        speak(reply)
      }
      recog.onend = () => setListening(false)
      recognitionRef.current = recog
    }
  }, [addMessage, handleVoiceCommand])

  const start = () => {
    if (!recognitionRef.current) {
      const msg = 'Speech recognition is not supported in this browser.'
      addMessage({ role: 'assistant', content: msg })
      speak(msg)
      return
    }
    recognitionRef.current.start()
    setListening(true)
  }

  const stop = () => {
    recognitionRef.current?.stop()
    setListening(false)
  }

  return (
    <div className="card p-4 space-y-3">
      <h2 className="font-semibold">Voice Assistant</h2>
      <div className="flex gap-2">
        {!listening ? (
          <button className="btn btn-primary" onClick={start}>Start Listening</button>
        ) : (
          <button className="btn" onClick={stop}>Stop</button>
        )}
      </div>
      <p className="text-sm text-gray-600">Say things like: "Fill Amazon catalog from my raw data" or "Add task: update Flipkart titles".</p>
    </div>
  )
}
