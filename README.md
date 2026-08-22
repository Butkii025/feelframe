<div align="center">

# FeelFrame

**Multi-modal Sentiment Analysis platform that reads emotion from text**


# feelframe - Full-Stack Edition (Next.js + FastAPI)

[![Python](https://img.shields.io/badge/python-3.10%2B-blue)](https://www.python.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![License: Apache](https://img.shields.io/badge/license-Apache-green)](LICENSE)

</div>

A custom full-stack rebuild of Sentimeter - type in any sentence and it tells you whether the sentiment is positive or negative, with a confidence score, visualized live on a sweeping needle gauge. Same model underneath as the original, but now with a FastAPI backend and a hand-built Next.js frontend instead of a pre-made UI framework. Built to bridge ML with a real frontend stack rather than relying on a default ML demo tool.

live at : [feelframe](https://feelframe.vercel.app/)
 
## Overview

This is the same sentiment classifier from the original [sentiment-analyzer](https://github.com/Butkii025/sentimeter) repo - TF-IDF + Logistic Regression baseline (91% accuracy), with a DistilBERT fine-tune in progress - but served through a proper two-tier architecture instead of Gradio:

- **Backend**: a FastAPI service that loads the trained model and exposes it over a REST API
- **Frontend**: a Next.js app with a custom UI built around a literal sentiment meter - a needle that sweeps live as it reads your input

The goal was to actually own the interface end to end, instead of borrowing a pre-built ML demo UI.

## [Architecture](Architecture.md)


## Tech Stack

**Data & Machine Learning**
- Python 3.10+
- pandas - data loading, cleaning, deduplication
- scikit-learn - TF-IDF vectorizer, Logistic Regression, LinearSVC
- PyTorch - from-scratch RNN exercise (see the companion repo)
- Transformers (Hugging Face) - DistilBERT fine-tuning

**Backend**
- FastAPI - REST API serving the model
- Uvicorn - ASGI server
- Pydantic - request/response validation

**Frontend**
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS

**Infrastructure**
- Vercel - frontend hosting
- Render - backend hosting
- Hugging Face Hub - model versioning (for the transformer backend)
- Google Colab - GPU compute for fine-tuning
- Git / GitHub - version control

## Project Structure

```
Nxt-sentiment/
├── backend/
│   ├── main.py                     # FastAPI app, /predict and /health endpoints
│   ├── requirements.txt
│   ├── logreg_sentiment.pkl        # trained classic model
│   └── tfidf_vectorizer.pkl        # fitted vectorizer
├── frontend/
│   ├── app/
│   │   ├── layout.tsx              # fonts, metadata
│   │   ├── page.tsx                # the gauge UI
│   │   └── globals.css
│   ├── package.json
│   ├── package-lock.json
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── next.config.js
│   ├── postcss.config.js
│   ├── .env.local                  # NEXT_PUBLIC_API_URL (not committed)
│   └── .gitignore
├── LICENSE
└── README.md
```

## Prerequisites

- **Python 3.10+**
- **Node.js 18+** and **npm**
- **git**
- No GPU required to run this - the classic model runs on CPU

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Butkii025/Nxt-sentiment.git
cd Nxt-sentiment
```

### 2. Set up the backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

Backend runs at `http://localhost:8000`. Confirm it's alive:

```bash
curl http://localhost:8000/health
# {"status":"ok","backend":"classic"}
```

### 3. Set up the frontend

Open a **second terminal** (the backend needs to keep running in the first one):

```bash
cd frontend
npm install
```

Create `.env.local` in `frontend/`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

```bash
npm run dev
```

Frontend runs at `http://localhost:3000`.


## License

MIT - see [LICENSE](LICENSE).

## Acknowledgments

- Dataset: [IMDB Movie Reviews](https://ai.stanford.edu/~amaas/data/sentiment/)
- Model: [DistilBERT](https://huggingface.co/distilbert-base-uncased)
- Companion repo (Gradio version): [sentiment-analyzer](https://github.com/Butkii025/sentimeter)