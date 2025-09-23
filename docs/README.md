# Repurposely

A full-stack SaaS application built with Next.js, FastAPI, Supabase, Gemini API, and Stripe.

## Features

- User authentication with Supabase
- AI-powered content generation with Google Gemini
- Payment processing with Stripe
- Responsive UI with Tailwind CSS

## Project Structure

- `frontend/`: Next.js application
- `backend/`: FastAPI application
- `docs/`: Documentation
- `infra/`: Infrastructure configurations

## Database Setup

Create the following tables in Supabase:

### users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    subscription_plan TEXT DEFAULT 'free',
    created_at TIMESTAMP DEFAULT NOW()
);
```

### usage_logs
```sql
CREATE TABLE usage_logs (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    type TEXT NOT NULL,
    count INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### payments
```sql
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    amount INTEGER NOT NULL,
    currency TEXT DEFAULT 'usd',
    status TEXT NOT NULL,
    stripe_payment_id TEXT UNIQUE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## Setup

1. Clone the repository
2. Set up Supabase project and create tables
3. Set up environment variables in `.env` files
4. Install dependencies:
   - Frontend: `cd frontend && npm install`
   - Backend: `cd backend && pip install -r requirements.txt`
5. Run the applications:
   - Frontend: `cd frontend && npm run dev`
   - Backend: `cd backend && uvicorn main:app --reload`

## Deployment

- Frontend: Deploy to Vercel
- Backend: Deploy to Railway
