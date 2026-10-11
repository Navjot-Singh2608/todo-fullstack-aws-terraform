from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from .. import crud, models, schemas
from ..database import get_db

router = APIRouter(prefix="/api/todos", tags=["todos"])


def _get_or_404(db: Session, todo_id: int) -> models.Todo:
    todo = crud.get_todo(db, todo_id)
    if todo is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Todo not found")
    return todo


@router.get("", response_model=list[schemas.TodoRead])
def list_todos(
    status_filter: Literal["all", "active", "completed"] = Query("all", alias="status"),
    search: str | None = Query(None, max_length=200),
    priority: models.Priority | None = None,
    sort: Literal["created_at", "due_date", "priority", "title"] = "created_at",
    order: Literal["asc", "desc"] = "desc",
    db: Session = Depends(get_db),
):
    return crud.list_todos(db, status=status_filter, search=search, priority=priority, sort=sort, order=order)


@router.get("/stats", response_model=schemas.TodoStats)
def get_stats(db: Session = Depends(get_db)):
    return crud.stats(db)


@router.post("", response_model=schemas.TodoRead, status_code=status.HTTP_201_CREATED)
def create_todo(payload: schemas.TodoCreate, db: Session = Depends(get_db)):
    return crud.create_todo(db, payload)


@router.delete("/completed")
def clear_completed(db: Session = Depends(get_db)):
    return {"deleted": crud.clear_completed(db)}


@router.get("/{todo_id}", response_model=schemas.TodoRead)
def get_todo(todo_id: int, db: Session = Depends(get_db)):
    return _get_or_404(db, todo_id)


@router.patch("/{todo_id}", response_model=schemas.TodoRead)
def update_todo(todo_id: int, payload: schemas.TodoUpdate, db: Session = Depends(get_db)):
    return crud.update_todo(db, _get_or_404(db, todo_id), payload)


@router.patch("/{todo_id}/toggle", response_model=schemas.TodoRead)
def toggle_todo(todo_id: int, db: Session = Depends(get_db)):
    todo = _get_or_404(db, todo_id)
    return crud.update_todo(db, todo, schemas.TodoUpdate(completed=not todo.completed))


@router.delete("/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_todo(todo_id: int, db: Session = Depends(get_db)):
    crud.delete_todo(db, _get_or_404(db, todo_id))
    return Response(status_code=status.HTTP_204_NO_CONTENT)
