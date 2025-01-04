import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Message } from '@prisma/client'

interface MessagesState {
  messages: any[]
  addMessage: (message: any) => void
  setMessages: (messages: any[]) => void
}

export const useMessagesStore = create<MessagesState>()(
  persist(
    (set) => ({
      messages: [],
      addMessage: (message) => set((state) => ({
        messages: [message, ...state.messages].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      })),
      setMessages: (messages) => set({ messages: messages.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ) })
    }),
    {
      name: 'messages-storage'
    }
  )
)
