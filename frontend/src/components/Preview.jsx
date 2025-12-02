import React from 'react'
export default function Preview({newsletter}){
  if(!newsletter) return <>No preview</>
  return <div dangerouslySetInnerHTML={{__html: newsletter.html_body}} />
}
