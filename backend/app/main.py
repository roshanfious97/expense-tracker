from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine, Base
from .routes.expenses import router as expense_router


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Expense Tracker API",
    description="API for managing personal expenses",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(expense_router)


@app.get("/")
def root():
    return {
        "message": "Expense Tracker API is running!"
    }