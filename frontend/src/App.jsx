import React from 'react'
import NewsletterForm from './components/NewsletterForm'

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-sky-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-5xl bg-white/95 shadow-xl rounded-2xl border border-slate-100 p-6 md:p-8">
        <div className="mb-6 md:mb-8 text-center md:text-left">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
            Smart Newsletter Generator
          </h1>
          <p className="text-sm md:text-base text-slate-600 max-w-2xl">
            Combine topics and uploaded documents to instantly generate structured, ready-to-send newsletters
            with AI.
          </p>
        </div>
        <NewsletterForm />
      </div>
    </div>
  )
}
