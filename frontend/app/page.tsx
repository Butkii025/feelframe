"use client";

import { useState } from "react";

type AnalyzeResult = {
  label: string;
  scores: Record<string, number>;
};

const EXAMPLES = [
  "Absolute waste of time, I want those two hours back.",
  "One of the best things I've watched this year.",
  "It was okay, nothing special but not bad either.",
];

export default function Home() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function analyze(inputText: string) {
    if (!inputText.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText }),
      });
      if (!res.ok) throw new Error("Request failed");
      const data: AnalyzeResult = await res.json();
      setResult(data);
    } catch (e) {
      setError("Couldn't reach the analyzer. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  const positive = result?.scores?.positive ?? 0.5;
  // map 0..1 positive score to -90..90 degrees for the needle
  const angle = -90 + positive * 180;

  return (
    <main className="min-h-screen flex flex-col items-center px-6 py-16">
      <div className="w-full max-w-xl">
        {/* Wordmark */}
        <div className="flex items-center gap-2 mb-10">
          <div className="w-2 h-2 rounded-full bg-teal" />
          <span className="font-display text-sm tracking-[0.2em] uppercase text-slate">
            Sentimeter
          </span>
        </div>

        {/* Hero: the input itself */}
        <h1 className="font-display text-3xl md:text-4xl font-medium text-ink mb-2 leading-tight">
          Type a sentence.
          <br />
          Watch the needle move.
        </h1>
        <p className="text-slate text-sm mb-8">
          A sentence goes in, a measured verdict comes out — positive, negative, and how sure it is.
        </p>

        {/* Input */}
        <div className="bg-surface border border-border rounded-2xl p-5">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="The plot was predictable but the acting really saved the film."
            rows={3}
            className="w-full bg-transparent text-ink placeholder-slate/50 text-base resize-none outline-none font-body"
          />
          <div className="flex items-center justify-between mt-4">
            <div className="flex gap-2 flex-wrap">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  onClick={() => {
                    setText(ex);
                    analyze(ex);
                  }}
                  className="text-xs px-3 py-1.5 rounded-full bg-surface-raised text-slate hover:text-ink hover:bg-border transition-colors"
                >
                  {ex.length > 28 ? ex.slice(0, 28) + "…" : ex}
                </button>
              ))}
            </div>
            <button
              onClick={() => analyze(text)}
              disabled={loading || !text.trim()}
              className="shrink-0 ml-3 px-5 py-2 rounded-full bg-teal text-bg font-medium text-sm hover:bg-teal-dim disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Measuring…" : "Analyze"}
            </button>
          </div>
        </div>

        {error && (
          <p className="mt-4 text-coral text-sm">{error}</p>
        )}

        {/* The gauge — signature element */}
        <div className="mt-10 bg-surface border border-border rounded-2xl p-8 flex flex-col items-center">
          <svg viewBox="0 0 200 120" className="w-full max-w-xs">
            {/* Arc track */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="#22304A"
              strokeWidth="10"
              strokeLinecap="round"
            />
            {/* Colored arc: coral -> slate -> teal */}
            <defs>
              <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#E2654A" />
                <stop offset="50%" stopColor="#8B93A7" />
                <stop offset="100%" stopColor="#14B8A6" />
              </linearGradient>
            </defs>
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="url(#gaugeGradient)"
              strokeWidth="10"
              strokeLinecap="round"
              opacity={result ? 1 : 0.35}
            />
            {/* Needle */}
            <g
              transform={`rotate(${result ? angle : 0} 100 100)`}
              style={{ transition: "transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
            >
              <line x1="100" y1="100" x2="100" y2="34" stroke="#E8ECF3" strokeWidth="3" strokeLinecap="round" />
              <circle cx="100" cy="100" r="6" fill="#E8ECF3" />
            </g>
          </svg>

          <div className="flex justify-between w-full max-w-xs text-[10px] uppercase tracking-wide text-slate mt-1 px-1">
            <span>Negative</span>
            <span>Positive</span>
          </div>

          {/* Readout */}
          <div className="mt-6 text-center">
            {result ? (
              <>
                <p
                  className={`font-display text-2xl font-medium ${
                    result.label === "positive" ? "text-teal" : "text-coral"
                  }`}
                >
                  {result.label === "positive" ? "Positive" : "Negative"}
                </p>
                <p className="font-mono text-slate text-sm mt-1">
                  {(Math.max(...Object.values(result.scores)) * 100).toFixed(1)}% confidence
                </p>
              </>
            ) : (
              <p className="text-slate text-sm font-mono">— awaiting input —</p>
            )}
          </div>

          {/* Breakdown */}
          {result && (
            <div className="w-full max-w-xs mt-6 space-y-2">
              {Object.entries(result.scores).map(([key, value]) => (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-xs text-slate w-16 capitalize">{key}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-surface-raised overflow-hidden">
                    <div
                      className={`h-full rounded-full ${key === "positive" ? "bg-teal" : "bg-coral"}`}
                      style={{ width: `${value * 100}%`, transition: "width 0.6s ease" }}
                    />
                  </div>
                  <span className="font-mono text-xs text-ink w-12 text-right">
                    {(value * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="text-center text-slate/60 text-xs mt-8">
          TF-IDF + Logistic Regression, trained on 50K IMDB reviews · 91% accuracy
        </p>
      </div>
    </main>
  );
}
