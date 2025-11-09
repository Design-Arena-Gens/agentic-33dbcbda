"use client";

import { useState } from 'react'
import VoiceAssistant from '@/components/VoiceAssistant'
import Chat from '@/components/Chat'
import CatalogMapper from '@/components/CatalogMapper'
import TaskList from '@/components/TaskList'

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'assistant' | 'catalog' | 'tasks'>('assistant')

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Jarvis-like Voice Agent</h1>
        <nav className="flex gap-2">
          {['assistant','catalog','tasks'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-3 py-1 rounded border ${activeTab===tab ? 'bg-primary text-white' : 'bg-white'}`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </header>

      {activeTab === 'assistant' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2"><Chat /></div>
          <div><VoiceAssistant /></div>
        </div>
      )}

      {activeTab === 'catalog' && <CatalogMapper />}

      {activeTab === 'tasks' && <TaskList />}
    </div>
  )
}
