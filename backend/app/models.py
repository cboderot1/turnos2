"""SQLAlchemy models for the turnos system."""
from datetime import datetime
from enum import Enum
from sqlalchemy import Column, Integer, String, DateTime, Enum as SAEnum, ForeignKey, Boolean
from sqlalchemy.orm import relationship

from .core.database import Base


class UserRole(str, Enum):
    ADMIN = "ADMIN"
    ASESOR = "ASESOR"
    MATRIZADOR = "MATRIZADOR"


class AgentStatus(str, Enum):
    FREE = "FREE"
    BUSY = "BUSY"


class ServiceType(str, Enum):
    TRAMITE = "TRAMITE"
    ASESORIA = "ASESORIA"


class ClientType(str, Enum):
    GENERAL = "GENERAL"
    TERCERA_EDAD = "TERCERA_EDAD"
    DISCAPACITADO = "DISCAPACITADO"


class TicketStatus(str, Enum):
    PENDING = "PENDING"
    ASSIGNED = "ASSIGNED"
    IN_PROGRESS = "IN_PROGRESS"
    DONE = "DONE"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(SAEnum(UserRole), nullable=False)
    display_name = Column(String(100), nullable=False)

    tickets = relationship("Ticket", back_populates="assigned_to_user")


class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    client_name = Column(String(150), nullable=False)
    client_identifier = Column(String(50), nullable=False)
    motive = Column(String(255), nullable=False)
    client_type = Column(SAEnum(ClientType), default=ClientType.GENERAL, nullable=False)
    service_type = Column(SAEnum(ServiceType), default=ServiceType.TRAMITE, nullable=False)
    priority = Column(Boolean, default=False, nullable=False)
    status = Column(SAEnum(TicketStatus), default=TicketStatus.PENDING, nullable=False)
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    assigned_to_user = relationship("User", back_populates="tickets")


class AgentState(Base):
    __tablename__ = "agent_states"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    status = Column(SAEnum(AgentStatus), default=AgentStatus.FREE, nullable=False)
    current_ticket_id = Column(Integer, ForeignKey("tickets.id"), nullable=True)

    user = relationship("User")
    current_ticket = relationship("Ticket")
