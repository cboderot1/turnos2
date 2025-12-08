"""Pydantic schemas for API validation."""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel
from .models import UserRole, AgentStatus, ServiceType, ClientType, TicketStatus


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    username: Optional[str] = None


class UserBase(BaseModel):
    username: str
    display_name: str
    role: UserRole


class UserCreate(UserBase):
    password: str


class UserRead(UserBase):
    id: int

    class Config:
        orm_mode = True


class TicketCreate(BaseModel):
    client_name: str
    client_identifier: str
    motive: str
    client_type: ClientType
    service_type: ServiceType


class TicketRead(BaseModel):
    id: int
    client_name: str
    client_identifier: str
    motive: str
    client_type: ClientType
    service_type: ServiceType
    priority: bool
    status: TicketStatus
    assigned_to: Optional[int]
    created_at: datetime

    class Config:
        orm_mode = True


class AgentStateRead(BaseModel):
    id: int
    user_id: int
    status: AgentStatus
    current_ticket_id: Optional[int]

    class Config:
        orm_mode = True


class ReportItem(BaseModel):
    ticket: TicketRead
    agent: Optional[UserRead]


class QueueSummary(BaseModel):
    matrizador_queue: List[TicketRead]
    asesor_queue: List[TicketRead]
    attending: List[AgentStateRead]
