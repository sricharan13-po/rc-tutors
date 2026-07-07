from sqlalchemy import Column, Integer, String, Float, ForeignKey, JSON
from database import Base


class TutorProfile(Base):
    __tablename__ = "tutor_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    subjects = Column(JSON, default=list)       # e.g. ["Math", "Science"]
    grades = Column(JSON, default=list)         # e.g. [1, 2, 3]
    bio = Column(String(1000), nullable=True)
    hourly_rate = Column(Float, nullable=False, default=0.0)
    rating = Column(Float, default=0.0)
    review_count = Column(Integer, default=0)
    availability = Column(JSON, default=dict)   # {"Mon": ["09:00","10:00"], ...}
