from io import BytesIO

from xhtml2pdf import pisa


def html_to_pdf_bytes(html: str) -> bytes:
    result = BytesIO()
    pisa.CreatePDF(html, dest=result)
    return result.getvalue()
