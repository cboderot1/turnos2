"""FastAPI routes for the turnos system."""
from datetime import timedelta
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session, joinedload

from ..core.database import get_db
from ..core import auth
from ..models import UserRole, AgentStatus, AgentState, Ticket, TicketStatus, User
from ..schemas import (
    Token,
    UserRead,
    TicketCreate,
    TicketRead,
    AgentStateRead,
    AgentSummary,
    QueueSummary,
    DatabaseTestResponse,
)
from ..services.queue import assign_ticket, get_next_ticket, release_agent, complete_ticket

router = APIRouter(prefix="/api")


@router.post("/auth/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = auth.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    access_token = auth.create_access_token(
        data={"sub": user.username},
        expires_delta=timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/auth/me", response_model=UserRead)
def get_current_user(current: User = Depends(auth.get_current_user)):
    return current


@router.post("/tickets", response_model=TicketRead)
def create_ticket(payload: TicketCreate, db: Session = Depends(get_db)):
    priority = payload.client_type.name in {"TERCERA_EDAD", "DISCAPACITADO"}
    ticket = Ticket(
        client_name=payload.client_name,
        client_identifier=payload.client_identifier,
        motive=payload.motive,
        client_type=payload.client_type,
        service_type=payload.service_type,
        priority=priority,
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)

    # Attempt auto-assignment when a free agent exists
    free_agent = (
        db.query(AgentState)
        .join(AgentState.user)
        .filter(AgentState.status == AgentStatus.FREE)
        .filter(AgentState.user.has(role=UserRole.MATRIZADOR if ticket.service_type.name == "TRAMITE" else UserRole.ASESOR))
        .first()
    )
    if free_agent:
        assign_ticket(db, ticket, free_agent)
        ticket.status = TicketStatus.IN_PROGRESS
        db.add(ticket)
        db.commit()
        db.refresh(ticket)

    return ticket


@router.get("/tickets/queue", response_model=QueueSummary)
def queue_summary(db: Session = Depends(get_db)):
    pending = (
        db.query(Ticket)
        .filter(Ticket.status == TicketStatus.PENDING)
        .filter(Ticket.assigned_to.is_(None))
        .all()
    )
    matrizador_queue = [t for t in pending if t.service_type.name == "TRAMITE"]
    asesor_queue = [t for t in pending if t.service_type.name == "ASESORIA"]
    attending = db.query(AgentState).options(joinedload(AgentState.user)).all()
    return QueueSummary(
        matrizador_queue=matrizador_queue,
        asesor_queue=asesor_queue,
        attending=attending,
    )


@router.get("/tickets/{ticket_id}", response_model=TicketRead)
def get_ticket(ticket_id: int, db: Session = Depends(get_db)):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket


@router.get("/agents", response_model=List[AgentSummary])
def list_agents(
    _=Depends(auth.require_roles(UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    users = (
        db.query(User)
        .filter(User.role.in_([UserRole.ASESOR, UserRole.MATRIZADOR]))
        .all()
    )
    states = db.query(AgentState).all()
    state_map = {state.user_id: state for state in states}

    summaries: List[AgentSummary] = []
    for user in users:
        state = state_map.get(user.id)
        summaries.append(
            AgentSummary(
                id=user.id,
                username=user.username,
                display_name=user.display_name,
                role=user.role,
                status=state.status if state else AgentStatus.FREE,
                current_ticket_id=state.current_ticket_id if state else None,
            )
        )

    return summaries


@router.get("/agents/me", response_model=AgentStateRead)
def get_my_state(
    current=Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    state = db.query(AgentState).filter(AgentState.user_id == current.id).first()
    if not state:
        state = AgentState(user_id=current.id, status=AgentStatus.FREE)
        db.add(state)
        db.commit()
        db.refresh(state)
    return state


@router.post("/agents/{agent_id}/status", response_model=AgentStateRead)
def update_agent_status(
    agent_id: int,
    status: AgentStatus,
    db: Session = Depends(get_db),
    _: UserRead = Depends(auth.require_roles(UserRole.ADMIN, UserRole.ASESOR, UserRole.MATRIZADOR)),
):
    state = db.query(AgentState).filter(AgentState.user_id == agent_id).first()
    if not state:
        state = AgentState(user_id=agent_id, status=status)
    state.status = status
    if status == AgentStatus.FREE:
        state.current_ticket_id = None
    db.add(state)
    db.commit()
    db.refresh(state)
    return state


@router.post("/agents/{agent_id}/next", response_model=TicketRead)
def take_next_ticket(
    agent_id: int,
    db: Session = Depends(get_db),
    _: UserRead = Depends(auth.require_roles(UserRole.ADMIN, UserRole.ASESOR, UserRole.MATRIZADOR)),
):
    state = db.query(AgentState).filter(AgentState.user_id == agent_id).first()
    if not state:
        raise HTTPException(status_code=404, detail="Agent state not found")
    next_ticket = get_next_ticket(db, state.user.role)
    if not next_ticket:
        raise HTTPException(status_code=404, detail="No tickets in queue")
    assign_ticket(db, next_ticket, state)
    next_ticket.status = TicketStatus.IN_PROGRESS
    db.add(next_ticket)
    db.commit()
    db.refresh(next_ticket)
    return next_ticket


@router.post("/tickets/{ticket_id}/complete", response_model=TicketRead)
def complete_ticket_endpoint(
    ticket_id: int,
    db: Session = Depends(get_db),
    _: UserRead = Depends(auth.require_roles(UserRole.ADMIN, UserRole.ASESOR, UserRole.MATRIZADOR)),
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    state = db.query(AgentState).filter(AgentState.current_ticket_id == ticket_id).first()
    complete_ticket(db, ticket)
    if state:
        release_agent(db, state)
    return ticket


@router.get("/reports", response_model=List[TicketRead])
def report(_=Depends(auth.require_roles(UserRole.ADMIN)), db: Session = Depends(get_db)):
    return db.query(Ticket).filter(Ticket.status == TicketStatus.DONE).order_by(Ticket.created_at.desc()).all()


@router.get("/users", response_model=List[UserRead])
def list_users(_=Depends(auth.require_roles(UserRole.ADMIN)), db: Session = Depends(get_db)):
    return db.query(User).order_by(User.username.asc()).all()


@router.get("/test/db", response_model=DatabaseTestResponse, tags=["health"])
def test_database(
    _: UserRead = Depends(auth.require_roles(UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    """Verify database connectivity and list users for diagnostics."""

    users = db.query(User).order_by(User.id.asc()).all()
    return DatabaseTestResponse(status="ok", user_count=len(users), users=users)
