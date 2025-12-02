import React, {useState} from 'react'
import axios from 'axios'
import FileUploader from './FileUploader'
import Preview from './Preview'

export default function NewsletterForm(){
  const [topic, setTopic] = useState('')
  const [tone, setTone] = useState('Professional')
  const [audience, setAudience] = useState('Customers')
  const [length, setLength] = useState('Medium')
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [newsletter, setNewsletter] = useState(null)

  const handleGenerate = async () => {
    setLoading(true)
    const form = new FormData()
    form.append('topic', topic)
    form.append('tone', tone)
    form.append('audience', audience)
    form.append('length', length)
    files.forEach((f)=> form.append('files', f))

    try{
      const res = await axios.post(
        'http://127.0.0.1:8000/api/generate-newsletter',
        form,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )
      setNewsletter(res.data)
    }catch(e){
      console.error('Error generating newsletter', e)
      alert('Error generating newsletter. Check backend logs.')
    }finally{
      setLoading(false)
    }
  }

  return (
    <div>
      <input value={topic} onChange={e=>setTopic(e.target.value)} />
      <FileUploader files={files} setFiles={setFiles}/>
      <button onClick={handleGenerate}>{loading?'Generating...':'Generate'}</button>
      <Preview newsletter={newsletter}/>
    </div>
  )
}
