from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from database import get_db
from models.user import User, UserRole
from models.tutor_profile import TutorProfile
from schemas.tutor import TutorProfileCreate, TutorProfileUpdate, TutorProfileOut, TutorOut
from services.auth import get_current_user

router = APIRouter(prefix="/tutors", tags=["tutors"])


def _build_tutor_out(user: User, profile: TutorProfile) -> dict:
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "avatar_url": user.avatar_url,
        "profile": profile,
    }


@router.get("", response_model=List[TutorOut])
async def list_tutors(
    subject: Optional[str] = Query(None),
    grade: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(User, TutorProfile)
        .join(TutorProfile, TutorProfile.user_id == User.id)
        .where(User.role == UserRole.tutor)
    )
    rows = result.all()

    tutors = []
    for user, profile in rows:
        if subject and subject not in (profile.subjects or []):
            continue
        if grade and grade not in (profile.grades or []):
            continue
        tutors.append(_build_tutor_out(user, profile))
    return tutors


@router.get("/{tutor_id}", response_model=TutorOut)
async def get_tutor(tutor_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(User, TutorProfile)
        .join(TutorProfile, TutorProfile.user_id == User.id)
        .where(User.id == tutor_id, User.role == UserRole.tutor)
    )
    row = result.one_or_none()
    if not row:
        raise HTTPException(status_code=404, detail="Tutor not found")
    user, profile = row
    return _build_tutor_out(user, profile)


@router.post("/profile", response_model=TutorProfileOut, status_code=201)
async def create_profile(
    body: TutorProfileCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.role != UserRole.tutor:
        raise HTTPException(status_code=403, detail="Only tutors can create a profile")

    existing = await db.execute(select(TutorProfile).where(TutorProfile.user_id == current_user.id))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Profile already exists")

    profile = TutorProfile(user_id=current_user.id, **body.dict())
    db.add(profile)
    await db.commit()
    await db.refresh(profile)
    return profile


@router.put("/profile", response_model=TutorProfileOut)
async def update_profile(
    body: TutorProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(TutorProfile).where(TutorProfile.user_id == current_user.id))
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    for field, value in body.dict(exclude_none=True).items():
        setattr(profile, field, value)
    await db.commit()
    await db.refresh(profile)
    return profile
