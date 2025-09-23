from fastapi import APIRouter, HTTPException, Request
import stripe
from ..config import settings
from ..services.payment_service import create_checkout_session, handle_webhook, get_session_details

stripe.api_key = settings.stripe_secret_key

router = APIRouter()

@router.post("/create-checkout-session")
def create_checkout_session_endpoint(
    user_id: str,
    plan_type: str,
    success_url: str = "http://localhost:3000/dashboard?success=true",
    cancel_url: str = "http://localhost:3000/billing"
):
    try:
        session = create_checkout_session(user_id, plan_type, success_url, cancel_url)
        return {
            "checkout_url": session.url,
            "session_id": session.id
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/session/{session_id}")
def get_session_endpoint(session_id: str):
    try:
        session = get_session_details(session_id)
        return {
            "id": session.id,
            "payment_status": session.payment_status,
            "metadata": session.metadata
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')
    if sig_header is None:
        raise HTTPException(status_code=400, detail="Missing stripe-signature header")
    try:
        event = handle_webhook(payload, sig_header)
        return {"status": "success"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
