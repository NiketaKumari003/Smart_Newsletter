import json

from .ai_pipeline import (
    extract_text_from_uploaded,
    build_rag_collection,
    retrieve_relevant_context,
    generate_newsletter_with_llm,
)


async def generate_newsletter_from_inputs(topic, tone, audience, length, uploaded):
  """Generate a newsletter payload using topic/preferences and optional uploaded docs.

  Returns a dict with keys: title, html_body, cta_text, cta_link.
  Uses OpenAI + Chroma when possible, and falls back to a simple template if anything fails.
  """

  docs = extract_text_from_uploaded(uploaded or [])
  collection, _metas = build_rag_collection(docs, topic or "")
  context = retrieve_relevant_context(collection, topic or "")

  try:
    raw = generate_newsletter_with_llm(topic, tone, audience, length, context)
    data = json.loads(raw)
    return {
      "title": data.get("title") or (topic or "Newsletter"),
      "html_body": data.get("html_body") or "<h1>Newsletter</h1><p>No content generated.</p>",
      "cta_text": data.get("cta_text") or "Read more",
      "cta_link": data.get("cta_link") or "#",
    }
  except Exception:
    # AI path failed (e.g. missing/invalid key, quota, or DeepSeek/OpenAI error).
    # Fall back to a topic-driven, emoji-rich newsletter so the user always sees content,
    # even if no documents or API key are available.
    topic_val = topic or "Smart Newsletter Update"
    tone_val = tone or "Professional"
    audience_val = audience or "Customers"
    length_val = length or "Medium"

    # Try to separate the main topic line from any "Important points" section
    raw_topic = topic or ""
    main_topic_text = raw_topic
    important_lines = []

    marker = "Important points:"
    if marker in raw_topic:
      before, after = raw_topic.split(marker, 1)
      main_topic_text = before.strip() or topic_val
      for line in after.splitlines():
        cleaned = line.strip()
        if not cleaned:
          continue
        # Strip any checkbox or bullet symbols kept from the frontend
        if cleaned[0] in ("☑", "•", "-", "*", "✅", "⭐"):
          cleaned = cleaned[1:].strip()
        if cleaned:
          important_lines.append(cleaned)

    combined_text = "\n\n".join(d.get("text", "") for d in docs) if docs else ""
    combined_text = combined_text.strip()

    summary_parts = []

    # 1) Key highlights from checkboxes
    if important_lines:
      bullets = "".join(
        f"<li style=\"margin-bottom:6px;\">✅ <span style=\"color:#111827;\">{p}</span></li>"
        for p in important_lines
      )
      summary_parts.append(
        f"""
<h2 style="font-size:18px;margin:20px 0 8px 0;color:#111827;">✨ Key Highlights</h2>
<ul style="padding-left:18px;margin:0 0 8px 0;color:#4b5563;list-style:none;">
  {bullets}
</ul>
""".strip()
      )

    # 2) If there is document text, include a short summary paragraph block
    if combined_text:
      snippet = combined_text[:2000]
      paragraphs = [p.strip() for p in snippet.split("\n") if p.strip()]
      summary_paragraphs = paragraphs[:4]
      doc_html = "".join(
        f"<p style=\"margin-bottom:10px;color:#4b5563;\">📌 {p}</p>" for p in summary_paragraphs
      )
      summary_parts.append(
        f"""
<h2 style="font-size:18px;margin:20px 0 8px 0;color:#111827;">📝 From your documents</h2>
<div>{doc_html}</div>
""".strip()
      )

    # 3) Always add a more detailed, topic-based breakdown so even topic-only is rich
    overview_paragraph = (
      f"This newsletter gives your {audience_val.lower()} a clear, friendly walkthrough of "
      f"the main ideas behind <strong>{main_topic_text or topic_val}</strong>. "
      f"It matches a {tone_val.lower()} tone and a {length_val.lower()} reading length so it feels easy to digest."
    )

    learn_points = [
      "Core concept or definition in simple words",
      "Why this topic matters right now",
      "Practical scenarios or examples your readers can relate to",
      "Next steps or actions your readers can take",
    ]
    learn_html = "".join(
      f"<li style=\"margin-bottom:6px;\">💡 {p}</li>" for p in learn_points
    )

    sections_html = f"""
<h2 style="font-size:18px;margin:20px 0 8px 0;color:#111827;">📚 Overview</h2>
<p style="margin-bottom:10px;color:#4b5563;">{overview_paragraph}</p>

<h2 style="font-size:18px;margin:18px 0 8px 0;color:#111827;">🎯 What readers will learn</h2>
<ul style="padding-left:18px;margin:0 0 10px 0;color:#4b5563;list-style:none;">
  {learn_html}
</ul>

<h2 style="font-size:18px;margin:18px 0 8px 0;color:#111827;">🚀 Suggested structure</h2>
<ol style="padding-left:18px;margin:0 0 10px 0;color:#4b5563;">
  <li style="margin-bottom:4px;">Hook intro that connects <strong>{main_topic_text or topic_val}</strong> to your readers daily work.</li>
  <li style="margin-bottom:4px;">22 short sections highlighting the most important ideas.</li>
  <li style="margin-bottom:4px;">A quick recap with 3 bullet takeaways.</li>
  <li style="margin-bottom:4px;">A clear CTA (reply, click, register, or explore a resource).</li>
  <li style="margin-bottom:4px;">Warm closing line that thanks the reader.</li>
</ol>
""".strip()

    summary_parts.append(sections_html)

    if not summary_parts:
      # Extremely unlikely now, but keep a small safety net.
      summary_parts.append(
        "<p style=\"margin-bottom:12px;color:#4b5563;\">"  # noqa: E501
        "Here is a quick update based on your topic. Add important points or upload a file to make it even richer."
        "</p>"
      )

    summary_html = "\n".join(summary_parts)

    headline = f"{main_topic_text or topic_val} – Insights for {audience_val}"
    html_body = f"""
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f9fafb;padding:24px;">
  <div style="max-width:640px;margin:0 auto;background:white;border-radius:16px;padding:24px 24px 20px 24px;box-shadow:0 10px 25px rgba(15,23,42,0.08);">
    <div style="margin-bottom:16px;padding:8px 14px;border-radius:999px;background:linear-gradient(90deg,#f97316,#facc15);display:inline-block;color:#111827;font-size:12px;font-weight:600;">
      🚀 Smart AI Newsletter
    </div>
    <h1 style="font-size:26px;margin:0 0 6px 0;color:#111827;">{headline}</h1>
    <p style="margin:0 0 14px 0;color:#4b5563;font-size:13px;">
      🎯 <strong>Tone:</strong> {tone_val} · <strong>Audience:</strong> {audience_val} · <strong>Length:</strong> {length_val}
    </p>
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:8px 0 16px 0;" />
    <div style="margin-top:4px;">
      {summary_html}
    </div>
    <div style="margin-top:20px;padding:12px 14px;border-radius:12px;background:#0f172a;color:#e5e7eb;font-size:13px;">
      <strong>✨ Pro tip:</strong> Use the checkboxes to mark your must-have talking points – the AI will treat them as star items.
    </div>
  </div>
</div>
""".strip()

    return {
      "title": headline,
      "html_body": html_body,
      "cta_text": "👉 Read the full update",
      "cta_link": "#",
    }


