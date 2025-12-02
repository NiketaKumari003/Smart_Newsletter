async def generate_newsletter_from_inputs(topic,tone,audience,length,uploaded):
    return {
        "title": topic or "Newsletter",
        "html_body": "<h1>Newsletter</h1><p>Generated successfully.</p>",
        "cta_text": "Read more",
        "cta_link": "#"
    }
