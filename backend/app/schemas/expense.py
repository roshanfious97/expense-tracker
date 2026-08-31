from datetime import date

from pydantic import BaseModel


class ExpenseCreate(BaseModel):
    amount: float
    description: str
    category: str
    date: date


class ExpenseResponse(BaseModel):
    id: int
    amount: float
    description: str
    category: str
    date: date

    model_config = {
        "from_attributes": True
    }