"use client";

import { useEffect, useState } from 'react'
import useAssistantStore from '@/lib/store'

export default function TaskList() {
  const [text, setText] = useState('')
  const { tasks, addTask, toggleTask, removeTask } = useAssistantStore()

  function onAdd() {
    const v = text.trim()
    if (!v) return
    addTask(v)
    setText('')
  }

  useEffect(() => {
    // Hydrate from store automatically
  }, [])

  return (
    <div className="card p-4">
      <h2 className="font-semibold mb-2">Daily Tasks</h2>
      <div className="flex gap-2 mb-3">
        <input value={text} onChange={(e) => setText(e.target.value)} className="flex-1 rounded border p-2" placeholder="Add a task..." />
        <button className="btn btn-primary" onClick={onAdd}>Add</button>
      </div>
      <ul className="space-y-2">
        {tasks.map((t) => (
          <li key={t.id} className="flex items-center gap-2">
            <input type="checkbox" checked={t.done} onChange={() => toggleTask(t.id)} />
            <span className={t.done ? 'line-through text-gray-500' : ''}>{t.title}</span>
            <button className="ml-auto text-red-600 text-sm" onClick={() => removeTask(t.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
