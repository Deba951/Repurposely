from pydantic import BaseModel
from datetime import datetime

class Payment(BaseModel):
    user_id: str
    amount: int
    currency: str
    status: str
    stripe_payment_id: str
    created_at: datetime
