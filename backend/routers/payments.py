from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from models.booking import Booking, PaymentStatus, BookingStatus
from services.auth import get_current_user
from models.user import User
import stripe
import os

router = APIRouter(prefix="/payments", tags=["payments"])
stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "")
WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")


@router.post("/create-intent")
async def create_payment_intent(
    booking_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Booking).where(Booking.id == booking_id))
    booking = result.scalar_one_or_none()
    if not booking or booking.student_id != current_user.id:
        raise HTTPException(status_code=404, detail="Booking not found")

    intent = stripe.PaymentIntent.create(
        amount=int(booking.amount * 100),
        currency="usd",
        metadata={"booking_id": booking_id},
    )
    booking.stripe_payment_intent_id = intent.id
    await db.commit()
    return {"client_secret": intent.client_secret}


@router.post("/webhook")
async def stripe_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    payload = await request.body()
    sig = request.headers.get("stripe-signature", "")
    try:
        event = stripe.Webhook.construct_event(payload, sig, WEBHOOK_SECRET)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid webhook")

    if event["type"] == "payment_intent.succeeded":
        pi_id = event["data"]["object"]["id"]
        result = await db.execute(
            select(Booking).where(Booking.stripe_payment_intent_id == pi_id)
        )
        booking = result.scalar_one_or_none()
        if booking:
            booking.payment_status = PaymentStatus.paid
            booking.status = BookingStatus.confirmed
            await db.commit()

    return {"received": True}
