from sqlalchemy import Column, Integer, ForeignKey, DateTime, Enum, Float, String
from database import Base
import enum


class BookingStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    cancelled = "cancelled"
    completed = "completed"


class PaymentStatus(str, enum.Enum):
    unpaid = "unpaid"
    paid = "paid"
    refunded = "refunded"


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    tutor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    subject = Column(String(100), nullable=True)
    status = Column(Enum(BookingStatus), default=BookingStatus.pending)
    payment_status = Column(Enum(PaymentStatus), default=PaymentStatus.unpaid)
    amount = Column(Float, default=0.0)
    stripe_payment_intent_id = Column(String(200), nullable=True)
