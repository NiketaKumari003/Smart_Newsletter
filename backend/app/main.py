from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse, StreamingResponse
from typing import List

from .processing import generate_newsletter_from_inputs
from .export_utils import html_to_pdf_bytes


app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


@app.post("/api/generate-newsletter")
async def gen(topic: str = Form(None), tone: str = Form("Professional"),
              audience: str = Form("Customers"), length: str = Form("Medium"),
              files: List[UploadFile] = File(None)):
    uploaded = []
    if files:
        for f in files:
            content = await f.read()
            uploaded.append({"filename": f.filename, "content": content})
    return await generate_newsletter_from_inputs(topic, tone, audience, length, uploaded)


@app.post("/api/export/html", response_class=PlainTextResponse)
async def export_html(topic: str = Form(None), tone: str = Form("Professional"),
                      audience: str = Form("Customers"), length: str = Form("Medium"),
                      files: List[UploadFile] = File(None)):
    uploaded = []
    if files:
        for f in files:
            content = await f.read()
            uploaded.append({"filename": f.filename, "content": content})
    newsletter = await generate_newsletter_from_inputs(topic, tone, audience, length, uploaded)
    return newsletter.get("html_body", "")


@app.post("/api/export/pdf")
async def export_pdf(topic: str = Form(None), tone: str = Form("Professional"),
                     audience: str = Form("Customers"), length: str = Form("Medium"),
                     files: List[UploadFile] = File(None)):
    uploaded = []
    if files:
        for f in files:
            content = await f.read()
            uploaded.append({"filename": f.filename, "content": content})
    newsletter = await generate_newsletter_from_inputs(topic, tone, audience, length, uploaded)
    html = newsletter.get("html_body", "<h1>Newsletter</h1>")
    pdf_bytes = html_to_pdf_bytes(html)
    return StreamingResponse(
        iter([pdf_bytes]),
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=newsletter.pdf"},
    )
