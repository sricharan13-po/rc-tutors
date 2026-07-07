from fastapi import WebSocket
from typing import Dict, List


class ConnectionManager:
    def __init__(self):
        self.active: Dict[int, List[WebSocket]] = {}

    async def connect(self, user_id: int, ws: WebSocket):
        await ws.accept()
        self.active.setdefault(user_id, []).append(ws)

    def disconnect(self, user_id: int, ws: WebSocket):
        if user_id in self.active:
            self.active[user_id].remove(ws)

    async def send_to_user(self, user_id: int, data: dict):
        for ws in self.active.get(user_id, []):
            await ws.send_json(data)


manager = ConnectionManager()
