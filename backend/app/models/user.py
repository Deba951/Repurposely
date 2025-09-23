from pydantic import BaseModel
from datetime import datetime

class User(BaseModel):
    id: str
    email: str
    subscription_plan: str = "free"  # free or paid
    created_at: datetime
