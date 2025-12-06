import React from 'react'

export default function FileUploader({ files, setFiles }) {
  const handleChange = (e) => {
    setFiles([...e.target.files])
  }

  return (
    <div className="space-y-2">
      <label className="block">
        <div className="flex flex-col items-center justify-center px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-white hover:border-blue-400">
          <p className="text-sm text-gray-700 font-medium">Drop files here or click to upload</p>
          <p className="text-xs text-gray-500 mt-1">PDF, DOCX, PPT, TXT up to a few MB each</p>
        </div>
        <input
          type="file"
          multiple
          className="hidden"
          onChange={handleChange}
        />
      </label>

      {files && files.length > 0 && (
        <ul className="text-xs text-gray-600 list-disc pl-4">
          {files.map((file, idx) => (
            <li key={idx}>{file.name}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
