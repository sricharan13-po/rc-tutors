from pydantic import BaseModel
from typing import List, Optional, Dict, Any


class TutorProfileCreate(BaseModel):
    subjects: List[str] = []
    grades: List[int] = []
    bio: Optional[str] = None
    hourly_rate: float
    availability: Dict[str, Any] = {}


class TutorProfileUpdate(BaseModel):
    subjects: Optional[List[str]] = None
    grades: Optional[List[int]] = None
    bio: Optional[str] = None
    hourly_rate: Optional[float] = None
    availability: Optional[Dict[str, Any]] = None


class TutorProfileOut(BaseModel):
    id: int
    user_id: int
    subjects: List[str]
    grades: List[int]
    bio: Optional[str]
    hourly_rate: float
    rating: float
    review_count: int
    availability: Dict[str, Any]

    class Config:
        orm_mode = True


class TutorOut(BaseModel):
    id: int
    name: str
    email: str
    avatar_url: Optional[str]
    profile: TutorProfileOut

    class Config:
        orm_mode = True
