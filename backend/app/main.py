from fastapi import FastAPI

from .database import engine, Base
from .routes.expenses import router as expense_router


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Expense Tracker API",
    description="API for managing personal expenses",
    version="1.0.0"
)


app.include_router(expense_router)


@app.get("/")
def root():
    return {
        "message": "Expense Tracker API is running!"
    }