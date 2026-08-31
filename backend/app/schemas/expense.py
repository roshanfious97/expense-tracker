from datetime import date as date_type

from pydantic import BaseModel, Field, field_validator

class ExpenseCreate(BaseModel):
    amount: float = Field(gt=0)
    description: str = Field(min_length=1, max_length=255)
    category: str = Field(min_length=1, max_length=50)
    date: date_type

    @field_validator("date")
    @classmethod
    def validate_date(cls, value: date_type) -> date_type:
        if value > date_type.today():
            raise ValueError("Expense date cannot be in the future")

        return value


class ExpenseResponse(BaseModel):
    id: int
    amount: float
    description: str
    category: str
    date: date_type

    model_config = {
        "from_attributes": True
    }