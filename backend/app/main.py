from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from .processing import generate_newsletter_from_inputs

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.post("/api/generate-newsletter")
async def gen(topic: str = Form(None), tone: str = Form('Professional'),
              audience: str = Form('Customers'), length: str = Form('Medium'),
              files: List[UploadFile] = File(None)):
    uploaded=[]
    if files:
        for f in files:
            content=await f.read()
            uploaded.append({"filename":f.filename,"content":content})
    return await generate_newsletter_from_inputs(topic, tone, audience, length, uploaded)
