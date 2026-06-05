from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import financials

app = FastAPI(title="AI Investment Analyst")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://*.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(financials.router, prefix="/api", tags=["financials"])

@app.get("/")
def root():
    return {"status": "AI Investment Analyst API is running"}