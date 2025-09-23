import stripe
from stripe import SignatureVerificationError
from ..config import settings
from ..services.db_service import upgrade_subscription

stripe.api_key = settings.stripe_secret_key

# Pricing plans in INR (paise for Stripe)
PLANS = {
    "monthly": {
        "price_id": "price_monthly",  # You'll need to create these in Stripe dashboard
        "amount": 79900,  # ₹799 in paise
        "name": "Monthly Plan",
        "credits": None  # Unlimited
    },
    "yearly": {
        "price_id": "price_yearly",
        "amount": 849900,  # ₹8499 in paise
        "name": "Yearly Plan",
        "credits": None  # Unlimited
    },
    "payg": {
        "price_id": "price_payg",
        "amount": 9900,  # ₹99 in paise
        "name": "Pay-as-you-go",
        "credits": 10
    }
}

def create_checkout_session(user_id: str, plan_type: str, success_url: str, cancel_url: str):
    """Create a Stripe checkout session for subscription/payment"""
    if plan_type not in PLANS:
        raise ValueError("Invalid plan type")

    plan = PLANS[plan_type]

    try:
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'inr',
                    'product_data': {
                        'name': plan['name'],
                        'description': f"Repurposely {plan['name']}" + (f" - {plan['credits']} credits" if plan['credits'] else " - Unlimited usage"),
                    },
                    'unit_amount': plan['amount'],
                },
                'quantity': 1,
            }],
            mode='payment',  # Use 'subscription' for recurring payments
            success_url=success_url + '?session_id={CHECKOUT_SESSION_ID}',
            cancel_url=cancel_url,
            metadata={
                'user_id': user_id,
                'plan_type': plan_type,
            },
            customer_email=None,  # type: ignore # You can add customer email if available
        )
        return session
    except Exception as e:
        raise Exception(f"Failed to create checkout session: {str(e)}")

def handle_webhook(payload: bytes, sig_header: str):
    """Handle Stripe webhook events"""
    endpoint_secret = settings.stripe_webhook_secret
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, endpoint_secret
        )
    except ValueError as e:
        raise ValueError("Invalid payload")
    except SignatureVerificationError as e:
        raise ValueError("Invalid signature")

    # Handle the event
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        user_id = session.get('metadata', {}).get('user_id')
        plan_type = session.get('metadata', {}).get('plan_type')

        if user_id and plan_type:
            if plan_type in ['monthly', 'yearly']:
                upgrade_subscription(user_id, 'paid')
            elif plan_type == 'payg':
                # For pay-as-you-go, you might want to add credits to user account
                # This would require additional logic in your user model
                pass

    elif event['type'] == 'payment_intent.succeeded':
        # Fallback for direct payment intents
        payment_intent = event['data']['object']
        user_id = payment_intent.get('metadata', {}).get('user_id')
        if user_id:
            upgrade_subscription(user_id, 'paid')

    return event

def get_session_details(session_id: str):
    """Get checkout session details"""
    try:
        session = stripe.checkout.Session.retrieve(session_id)
        return session
    except Exception as e:
        raise Exception(f"Failed to retrieve session: {str(e)}")
