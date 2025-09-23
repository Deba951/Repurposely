from ..database import supabase
from ..models.user import User
from ..models.usage_logs import UsageLog
from ..models.payments import Payment
from datetime import date, datetime
from typing import Optional

def get_user(user_id: str) -> Optional[User]:
    response = supabase.table('users').select('*').eq('id', user_id).execute()
    if response.data:
        return User(**response.data[0])
    return None

def create_user(user: User):
    supabase.table('users').insert(user.dict()).execute()

def log_usage(user_id: str, type: str, count: int):
    usage_log = UsageLog(
        user_id=user_id,
        type=type,
        count=count,
        created_at=datetime.now()
    )
    supabase.table('usage_logs').insert(usage_log.dict()).execute()

def check_quota(user_id: str) -> bool:
    user = get_user(user_id)
    if not user:
        return False
    if user.subscription_plan == 'paid':
        return True
    # Check daily usage for repurpose
    today = date.today()
    response = supabase.table('usage_logs').select('count').eq('user_id', user_id).eq('type', 'repurpose').gte('created_at', today.isoformat()).execute()
    total = sum([log['count'] for log in response.data])
    return total < 2

def upgrade_subscription(user_id: str, plan: str):
    supabase.table('users').update({'subscription_plan': plan}).eq('id', user_id).execute()
