from datetime import date, timedelta

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app

engine = create_engine(
    "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
)
TestingSession = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def override_get_db():
    db = TestingSession()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def reset_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield


client = TestClient(app)


def make(title="Task", **kw):
    r = client.post("/api/todos", json={"title": title, **kw})
    assert r.status_code == 201, r.text
    return r.json()


def test_health():
    assert client.get("/api/health").json() == {"status": "ok"}


def test_crud_flow():
    t = make("Buy milk", description="2L", priority="high")
    assert t["completed"] is False and t["priority"] == "high"

    assert client.get(f"/api/todos/{t['id']}").json()["title"] == "Buy milk"

    r = client.patch(f"/api/todos/{t['id']}", json={"title": "Buy oat milk"})
    assert r.json()["title"] == "Buy oat milk" and r.json()["description"] == "2L"

    r = client.patch(f"/api/todos/{t['id']}/toggle")
    assert r.json()["completed"] is True

    assert client.delete(f"/api/todos/{t['id']}").status_code == 204
    assert client.get(f"/api/todos/{t['id']}").status_code == 404


def test_validation():
    assert client.post("/api/todos", json={"title": "   "}).status_code == 422
    assert client.post("/api/todos", json={"title": "x", "priority": "urgent"}).status_code == 422


def test_filters_search_and_stats():
    a = make("Write report", priority="low")
    make("Read book", description="report on chapter 3")
    make("Overdue", due_date=(date.today() - timedelta(days=2)).isoformat())
    client.patch(f"/api/todos/{a['id']}/toggle")

    assert len(client.get("/api/todos").json()) == 3
    assert len(client.get("/api/todos?status=active").json()) == 2
    assert len(client.get("/api/todos?status=completed").json()) == 1
    assert len(client.get("/api/todos?search=report").json()) == 2
    assert len(client.get("/api/todos?priority=low").json()) == 1

    s = client.get("/api/todos/stats").json()
    assert s == {"total": 3, "active": 2, "completed": 1, "overdue": 1}

    assert client.delete("/api/todos/completed").json() == {"deleted": 1}
    assert len(client.get("/api/todos").json()) == 2


def test_sorting():
    make("b", priority="low")
    make("a", priority="high")
    make("c", priority="medium")
    titles = [t["title"] for t in client.get("/api/todos?sort=priority&order=desc").json()]
    assert titles == ["a", "c", "b"]
    titles = [t["title"] for t in client.get("/api/todos?sort=title&order=asc").json()]
    assert titles == ["a", "b", "c"]
