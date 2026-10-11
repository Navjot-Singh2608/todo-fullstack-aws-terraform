from datetime import date
from typing import Literal

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from . import models, schemas

StatusFilter = Literal["all", "active", "completed"]
SortField = Literal["created_at", "due_date", "priority", "title"]


def list_todos(
    db: Session,
    status: StatusFilter = "all",
    search: str | None = None,
    priority: models.Priority | None = None,
    sort: SortField = "created_at",
    order: Literal["asc", "desc"] = "desc",
) -> list[models.Todo]:
    stmt = select(models.Todo)
    if status == "active":
        stmt = stmt.where(models.Todo.completed.is_(False))
    elif status == "completed":
        stmt = stmt.where(models.Todo.completed.is_(True))
    if search:
        like = f"%{search.strip()}%"
        stmt = stmt.where(or_(models.Todo.title.ilike(like), models.Todo.description.ilike(like)))
    if priority:
        stmt = stmt.where(models.Todo.priority == priority)

    column = getattr(models.Todo, sort)
    if sort == "priority":
        # high > medium > low
        from sqlalchemy import case

        column = case(
            (models.Todo.priority == models.Priority.high, 3),
            (models.Todo.priority == models.Priority.medium, 2),
            else_=1,
        )
    ordered = column.desc() if order == "desc" else column.asc()
    # NULL due dates always last
    if sort == "due_date":
        stmt = stmt.order_by(models.Todo.due_date.is_(None), ordered, models.Todo.id.desc())
    else:
        stmt = stmt.order_by(ordered, models.Todo.id.desc())
    return list(db.scalars(stmt).all())


def get_todo(db: Session, todo_id: int) -> models.Todo | None:
    return db.get(models.Todo, todo_id)


def create_todo(db: Session, data: schemas.TodoCreate) -> models.Todo:
    todo = models.Todo(**data.model_dump())
    db.add(todo)
    db.commit()
    db.refresh(todo)
    return todo


def update_todo(db: Session, todo: models.Todo, data: schemas.TodoUpdate) -> models.Todo:
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(todo, key, value)
    db.commit()
    db.refresh(todo)
    return todo


def delete_todo(db: Session, todo: models.Todo) -> None:
    db.delete(todo)
    db.commit()


def clear_completed(db: Session) -> int:
    todos = db.scalars(select(models.Todo).where(models.Todo.completed.is_(True))).all()
    for t in todos:
        db.delete(t)
    db.commit()
    return len(todos)


def stats(db: Session) -> schemas.TodoStats:
    total = db.scalar(select(func.count(models.Todo.id))) or 0
    completed = db.scalar(select(func.count(models.Todo.id)).where(models.Todo.completed.is_(True))) or 0
    overdue = (
        db.scalar(
            select(func.count(models.Todo.id)).where(
                models.Todo.completed.is_(False),
                models.Todo.due_date.is_not(None),
                models.Todo.due_date < date.today(),
            )
        )
        or 0
    )
    return schemas.TodoStats(total=total, active=total - completed, completed=completed, overdue=overdue)
