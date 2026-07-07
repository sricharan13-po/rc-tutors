from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from models.booking import BookingStatus, PaymentStatus


class BookingCreate(BaseModel):
    tutor_id: int
    start_time: datetime
    end_time: datetime
    subject: Optional[str] = None


class BookingUpdate(BaseModel):
    status: Optional[BookingStatus] = None


class BookingOut(BaseModel):
    id: int
    student_id: int
    tutor_id: int
    start_time: datetime
    end_time: datetime
    subject: Optional[str]
    status: BookingStatus
    payment_status: PaymentStatus
    amount: float
    stripe_payment_intent_id: Optional[str]

    class Config:
        orm_mode = True
