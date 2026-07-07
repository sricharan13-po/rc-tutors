from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from typing import List
from database import get_db
from models.message import Message
from models.user import User
from schemas.message import MessageCreate, MessageOut
from services.auth import get_current_user
from services.websocket_manager import manager

router = APIRouter(prefix="/messages", tags=["messages"])


@router.get("/{other_user_id}", response_model=List[MessageOut])
async def get_conversation(
    other_user_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Message)
        .where(
            or_(
                (Message.sender_id == current_user.id) & (Message.receiver_id == other_user_id),
                (Message.sender_id == other_user_id) & (Message.receiver_id == current_user.id),
            )
        )
        .order_by(Message.created_at)
    )
    return result.scalars().all()


@router.post("", response_model=MessageOut, status_code=201)
async def send_message(
    body: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    msg = Message(sender_id=current_user.id, receiver_id=body.receiver_id, content=body.content)
    db.add(msg)
    await db.commit()
    await db.refresh(msg)

    out = MessageOut.from_orm(msg)
    await manager.send_to_user(body.receiver_id, out.dict())
    return out


@router.websocket("/ws/{user_id}")
async def websocket_endpoint(ws: WebSocket, user_id: int):
    await manager.connect(user_id, ws)
    try:
        while True:
            await ws.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(user_id, ws)
