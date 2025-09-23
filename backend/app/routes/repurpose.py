from fastapi import APIRouter, HTTPException
from ..services.ai_service import repurpose_content
from ..services.db_service import check_quota, log_usage

router = APIRouter()

@router.post("/repurpose")
def repurpose(user_id: str, content: str, platforms: list, tone: str):
    if not check_quota(user_id):
        raise HTTPException(status_code=429, detail="Usage limit exceeded")

    result = repurpose_content(content, platforms, tone)
    log_usage(user_id, 'repurpose', 1)
    return result
