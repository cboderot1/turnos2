"""Queueing logic for prioritizing tickets and assigning agents."""
from typing import List, Optional
from sqlalchemy.orm import Session

from ..models import (
    Ticket,
    TicketStatus,
    ClientType,
    ServiceType,
    AgentState,
    AgentStatus,
    UserRole,
)


def _prioritize_ticket(ticket: Ticket) -> int:
    """Return a numeric priority for sorting tickets (lower means sooner)."""
    base = 0 if ticket.service_type == ServiceType.TRAMITE else 100
    if ticket.client_type in {ClientType.TERCERA_EDAD, ClientType.DISCAPACITADO}:
        base -= 10
    return base


def queue_for_service(tickets: List[Ticket], service_type: ServiceType) -> List[Ticket]:
    filtered = [t for t in tickets if t.service_type == service_type and t.status == TicketStatus.PENDING]
    return sorted(filtered, key=_prioritize_ticket)


def assign_ticket(db: Session, ticket: Ticket, agent_state: AgentState):
    ticket.assigned_to = agent_state.user_id
    ticket.status = TicketStatus.ASSIGNED
    agent_state.status = AgentStatus.BUSY
    agent_state.current_ticket_id = ticket.id
    db.add(ticket)
    db.add(agent_state)
    db.commit()
    db.refresh(ticket)


def get_next_ticket(db: Session, role: UserRole) -> Optional[Ticket]:
    service_type = ServiceType.TRAMITE if role == UserRole.MATRIZADOR else ServiceType.ASESORIA
    candidates = db.query(Ticket).filter(Ticket.status == TicketStatus.PENDING).all()
    queue = queue_for_service(candidates, service_type)
    return queue[0] if queue else None


def release_agent(db: Session, agent_state: AgentState):
    agent_state.status = AgentStatus.FREE
    agent_state.current_ticket_id = None
    db.add(agent_state)
    db.commit()
    db.refresh(agent_state)


def complete_ticket(db: Session, ticket: Ticket):
    ticket.status = TicketStatus.DONE
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
