from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from ..services.ai_service import repurpose_content
from ..services.db_service import check_quota, log_usage

router = APIRouter()

class RepurposeRequest(BaseModel):
    user_id: str
    content: str
    platforms: List[str]
    tone: str

@router.post("/repurpose")
def repurpose(request: RepurposeRequest):
    if not check_quota(request.user_id):
        raise HTTPException(status_code=429, detail="Usage limit exceeded")

    result = repurpose_content(request.content, request.platforms, request.tone)
    log_usage(request.user_id, 'repurpose', 1)
    return result
