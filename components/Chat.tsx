"use client";

import useAssistantStore from '@/lib/store'
import { useEffect, useRef } from 'react'

export default function Chat() {
  const { messages, addMessage } = useAssistantStore()
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [messages])

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const v = inputRef.current?.value?.trim()
    if (!v) return
    addMessage({ role: 'user', content: v })
    // simple echo/route; real NLU handled in store
    addMessage({ role: 'assistant', content: 'Received. Use voice for richer commands.' })
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="card p-4 h-[520px] flex flex-col">
      <h2 className="font-semibold mb-2">Assistant Chat</h2>
      <div ref={listRef} className="flex-1 overflow-y-auto space-y-2 pr-2">
        {messages.map((m, i) => (
          <div key={i} className={`p-2 rounded ${m.role==='user' ? 'bg-blue-50' : 'bg-green-50'}`}>
            <div className="text-xs uppercase text-gray-500">{m.role}</div>
            <div>{m.content}</div>
          </div>
        ))}
      </div>
      <form onSubmit={onSubmit} className="mt-2 flex gap-2">
        <input ref={inputRef} className="flex-1 rounded border p-2" placeholder="Type a message..." />
        <button className="btn btn-primary" type="submit">Send</button>
      </form>
    </div>
  )
}
