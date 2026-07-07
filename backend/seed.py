"""
Run once to seed the database with initial tutor data:
  python seed.py
"""
import asyncio
from database import engine, Base, AsyncSessionLocal
from models.user import User, UserRole
from models.tutor_profile import TutorProfile
from services.auth import hash_password


async def seed():
    # Create tables if they don't exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        from sqlalchemy import select

        # Check if already seeded
        result = await db.execute(select(User).where(User.email == "sricharan.vasireddy@rctutors.com"))
        if result.scalar_one_or_none():
            print("Sricharan Vasireddy already exists — skipping.")
            return

        user = User(
            name="Sricharan Vasireddy",
            email="sricharan.vasireddy@rctutors.com",
            password_hash=hash_password("RCTutors@2024"),
            role=UserRole.tutor,
        )
        db.add(user)
        await db.flush()

        profile = TutorProfile(
            user_id=user.id,
            subjects=["Math", "Science"],
            grades=[1, 2, 3, 4, 5, 6],
            bio=(
                "Hi! I'm Sricharan Vasireddy, a passionate educator with expertise in "
                "Math and Science for grades 1–6. I make learning fun and engaging "
                "with real-world examples and interactive problem-solving."
            ),
            hourly_rate=40.0,
            rating=5.0,
            review_count=0,
            availability={
                "Mon": ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
                "Tue": ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
                "Wed": ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
                "Thu": ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
                "Fri": ["09:00", "10:00", "11:00", "14:00", "15:00"],
                "Sat": ["10:00", "11:00", "13:00", "14:00"],
            },
        )
        db.add(profile)
        await db.commit()
        print("✓ Tutor 'Sricharan Vasireddy' added successfully!")
        print("  Email:    sricharan.vasireddy@rctutors.com")
        print("  Password: RCTutors@2024")
        print("  Subjects: Math, Science")
        print("  Grades:   1, 2, 3, 4, 5, 6")


if __name__ == "__main__":
    asyncio.run(seed())
