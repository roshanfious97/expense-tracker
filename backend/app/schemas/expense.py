from datetime import date

from pydantic import BaseModel


class ExpenseCreate(BaseModel):
    amount: float
    description: str
    category: str
    date: date