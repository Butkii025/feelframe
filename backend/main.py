"""
FastAPI backend for Sentimeter.
Serves the classic TF-IDF + Logistic Regression model today.
To switch to the DistilBERT backend once it's trained, see the
BACKEND env var handling below.
"""

import os
import re
import math

import joblib
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

BACKEND = os.environ.get("SENTIMENT_BACKEND", "classic")
HF_REPO = os.environ.get("HF_REPO", "your-username/distilbert-sentiment-imdb")

app = FastAPI(title="Sentimeter API")

# Allow the Next.js dev server (and your deployed frontend) to call this API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten this to your actual frontend domain in production
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    text: str


class AnalyzeResponse(BaseModel):
    label: str
    scores: dict[str, float]


# --- Load model at startup ---
if BACKEND == "classic":
    clf = joblib.load(os.path.join(os.path.dirname(__file__), "logreg_sentiment.pkl"))
    vectorizer = joblib.load(os.path.join(os.path.dirname(__file__), "tfidf_vectorizer.pkl"))
    pipe = None
else:
    from transformers import pipeline
    pipe = pipeline("text-classification", model=HF_REPO, top_k=None, truncation=True)
    clf = vectorizer = None


def clean_for_classic(text: str) -> str:
    text = re.sub(r"<.*?>", " ", text)
    text = re.sub(r"[^a-zA-Z\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip().lower()
    return text


@app.get("/health")
def health():
    return {"status": "ok", "backend": BACKEND}


@app.post("/predict", response_model=AnalyzeResponse)
def predict(req: AnalyzeRequest):
    text = req.text.strip()
    if not text:
        return AnalyzeResponse(label="neutral", scores={"positive": 0.0, "negative": 0.0})

    if BACKEND == "classic":
        clean = clean_for_classic(text)
        X = vectorizer.transform([clean])
        pred = clf.predict(X)[0]
        margin = clf.decision_function(X)[0]
        pos_score = 1 / (1 + math.exp(-margin))
        scores = {"positive": round(pos_score, 4), "negative": round(1 - pos_score, 4)}
        label = "positive" if pred == 1 else "negative"
    else:
        results = pipe(text)[0]
        scores = {r["label"].lower(): round(r["score"], 4) for r in results}
        label = max(scores, key=scores.get)

    return AnalyzeResponse(label=label, scores=scores)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
