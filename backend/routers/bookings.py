from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from typing import List
from database import get_db
from models.user import User, UserRole
from models.booking import Booking, BookingStatus
from models.tutor_profile import TutorProfile
from schemas.booking import BookingCreate, BookingUpdate, BookingOut
from services.auth import get_current_user

router = APIRouter(prefix="/bookings", tags=["bookings"])


@router.post("", response_model=BookingOut, status_code=201)
async def create_booking(
    body: BookingCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(TutorProfile).where(TutorProfile.user_id == body.tutor_id))
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Tutor not found")

    duration_hours = (body.end_time - body.start_time).seconds / 3600
    amount = round(profile.hourly_rate * duration_hours, 2)

    booking = Booking(
        student_id=current_user.id,
        tutor_id=body.tutor_id,
        start_time=body.start_time,
        end_time=body.end_time,
        subject=body.subject,
        amount=amount,
    )
    db.add(booking)
    await db.commit()
    await db.refresh(booking)
    return booking


@router.get("", response_model=List[BookingOut])
async def list_bookings(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.role == UserRole.tutor:
        condition = Booking.tutor_id == current_user.id
    else:
        condition = Booking.student_id == current_user.id

    result = await db.execute(select(Booking).where(condition).order_by(Booking.start_time))
    return result.scalars().all()


@router.patch("/{booking_id}", response_model=BookingOut)
async def update_booking(
    booking_id: int,
    body: BookingUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Booking).where(Booking.id == booking_id))
    booking = result.scalar_one_or_none()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking.student_id != current_user.id and booking.tutor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your booking")

    if body.status:
        booking.status = body.status
    await db.commit()
    await db.refresh(booking)
    return booking
