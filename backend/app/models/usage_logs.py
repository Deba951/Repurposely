from pydantic import BaseModel
from datetime import datetime

class UsageLog(BaseModel):
    user_id: str
    type: str  # e.g., 'repurpose'
    count: int
    created_at: datetime
