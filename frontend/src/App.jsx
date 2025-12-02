import React from 'react'
import NewsletterForm from './components/NewsletterForm'

export default function App(){
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-2xl p-6">
        <h1 className="text-2xl font-bold mb-4">Smart Newsletter Generator</h1>
        <NewsletterForm />
      </div>
    </div>
  )
}
