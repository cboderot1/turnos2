"""Script para crear un administrador, un asesor y dos matrizadores por defecto.

Ejemplo de uso:

    PYTHONPATH=backend python backend/app/scripts/seed_default_users.py
"""
from typing import Iterable, Tuple

from sqlalchemy.exc import SQLAlchemyError

from app.core.auth import get_password_hash
from app.core.database import Base, SessionLocal, engine
from app.models import AgentState, AgentStatus, User, UserRole


UserDef = Tuple[str, str, UserRole, str]


def ensure_user(db, username: str, password: str, role: UserRole, display_name: str) -> Tuple[User, bool]:
    existing = db.query(User).filter(User.username == username).first()
    if existing:
        return existing, False

    user = User(
        username=username,
        password_hash=get_password_hash(password),
        role=role,
        display_name=display_name,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user, True


def ensure_agent_state(db, user: User) -> None:
    state = db.query(AgentState).filter(AgentState.user_id == user.id).first()
    if state:
        return

    db.add(AgentState(user_id=user.id, status=AgentStatus.FREE))
    db.commit()


def seed_users(definitions: Iterable[UserDef]) -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        for username, password, role, display_name in definitions:
            user, created = ensure_user(db, username, password, role, display_name)
            created_msg = "creado" if created else "existente"
            print(f"Usuario {username} ({role}) {created_msg} con id {user.id}")

            if role in {UserRole.ASESOR, UserRole.MATRIZADOR}:
                ensure_agent_state(db, user)
    except SQLAlchemyError as exc:
        db.rollback()
        raise SystemExit(f"Error al sembrar usuarios: {exc}") from exc
    finally:
        db.close()


def main() -> None:
    seed_users(
        [
            ("admin", "Admin1234!", UserRole.ADMIN, "Administrador"),
            ("asesor", "Asesor1234!", UserRole.ASESOR, "Asesor"),
            ("matrizador1", "Matrizador1234!", UserRole.MATRIZADOR, "Matrizador 1"),
            ("matrizador2", "Matrizador1234!", UserRole.MATRIZADOR, "Matrizador 2"),
        ]
    )


if __name__ == "__main__":
    main()
