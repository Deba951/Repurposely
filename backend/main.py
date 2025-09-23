from fastapi import FastAPI
from app.routes import auth, repurpose, payments

app = FastAPI(title="Repurposely Backend", version="1.0.0")

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(repurpose.router, prefix="/repurpose", tags=["Repurpose"])
app.include_router(payments.router, prefix="/payments", tags=["Payments"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Repurposely API"}
