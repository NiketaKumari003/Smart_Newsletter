import React from 'react'

export default function Preview({ newsletter, loading }) {
  if (loading && !newsletter) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-blue-200 bg-gradient-to-br from-white via-sky-50 to-blue-50 px-4 py-8 text-xs text-slate-600">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-600/10 px-3 py-1 text-[11px] font-medium text-blue-700">
          <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
          <span>AI is crafting your newsletter</span>
        </div>
        <p className="text-center max-w-xs">
          We are reading your topic, important points, and documents to assemble a polished, ready-to-send
          newsletter.
        </p>
      </div>
    )
  }

  if (!newsletter) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-gray-200 bg-white/40 px-4 py-8 text-xs text-gray-400">
        <p>Configure your inputs on the left and click “Generate Newsletter” to see the AI output here.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 rounded-lg border border-gray-100 bg-white p-3 shadow-sm">
      <div className="rounded-lg bg-gradient-to-r from-amber-100 via-yellow-50 to-emerald-100 px-3 py-2 text-xs text-amber-900">
        <p className="font-semibold tracking-wide">
          Spotlight introduction
        </p>
        <p className="mt-0.5 text-[11px] text-amber-800/90">
          A crisp, audience-friendly opening that hooks your readers into the rest of the newsletter.
        </p>
      </div>

      {newsletter.title && (
        <div className="border-b pb-2 mb-1">
          <h3 className="text-base font-semibold text-gray-800">{newsletter.title}</h3>
        </div>
      )}

      <div className="prose prose-sm max-w-none">
        <div dangerouslySetInnerHTML={{ __html: newsletter.html_body }} />
      </div>

      {newsletter.cta_text && (
        <div className="pt-2">
          <button
            type="button"
            className="inline-flex items-center px-3 py-1.5 rounded-full bg-blue-600 text-white text-xs font-medium hover:bg-blue-700"
          >
            {newsletter.cta_text}
          </button>
        </div>
      )}

      <div className="rounded-lg bg-slate-900 px-3 py-2 text-xs text-slate-50">
        <p className="font-semibold tracking-wide">
          Closing highlight
        </p>
        <p className="mt-0.5 text-[11px] text-slate-200/90">
          End on a strong, memorable note that reinforces your key points and nudges readers toward action.
        </p>
      </div>
    </div>
  )
}
