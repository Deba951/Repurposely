from fastapi import APIRouter, HTTPException
from ..database import supabase
from ..services.db_service import get_user, create_user
from ..models.user import User
from datetime import datetime

router = APIRouter()

@router.post("/login")
def login(email: str, password: str):
    try:
        response = supabase.auth.sign_in_with_password({"email": email, "password": password})
        if not response.user or not response.session:
            raise HTTPException(status_code=400, detail="Authentication failed")
        user = get_user(response.user.id)
        if not user:
            user = User(id=response.user.id, email=email, created_at=datetime.now())
            create_user(user)
        return {"access_token": response.session.access_token, "user_id": response.user.id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/register")
def register(email: str, password: str):
    try:
        response = supabase.auth.sign_up({"email": email, "password": password})
        if not response.user:
            raise HTTPException(status_code=400, detail="Registration failed")
        user = User(id=response.user.id, email=email, created_at=datetime.now())
        create_user(user)
        return {"message": "User registered", "user_id": response.user.id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/google-login")
def google_login(code: str):
    try:
        response = supabase.auth.sign_in_with_oauth({
            "provider": "google",
            "options": {"redirect_to": "http://localhost:3000"}
        })
        # For OAuth, the flow is different, usually handled on frontend
        return {"message": "Redirect to Google OAuth"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
