from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Expense
from ..schemas.expense import ExpenseCreate, ExpenseResponse

router = APIRouter(
    prefix="/expenses",
    tags=["Expenses"]
)


@router.get("/", response_model=list[ExpenseResponse])
def get_expenses(db: Session = Depends(get_db)):
    return (
        db.query(Expense)
        .order_by(Expense.date.desc(), Expense.id.desc())
        .all()
    )


@router.post("/", response_model=ExpenseResponse)
def create_expense(
    expense: ExpenseCreate,
    db: Session = Depends(get_db)
):
    new_expense = Expense(
        amount=expense.amount,
        description=expense.description,
        category=expense.category,
        date=expense.date
    )

    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)

    return new_expense


@router.get("/{expense_id}")
def get_expense(
    expense_id: int,
    db: Session = Depends(get_db)
):
    expense = (
        db.query(Expense)
        .filter(Expense.id == expense_id)
        .first()
    )

    if not expense:
        raise HTTPException(
            status_code=404,
            detail="Expense not found"
        )

    return expense


@router.put("/{expense_id}", response_model=ExpenseResponse)
def update_expense(
    expense_id: int,
    expense_data: ExpenseCreate,
    db: Session = Depends(get_db)
):
    expense = (
        db.query(Expense)
        .filter(Expense.id == expense_id)
        .first()
    )

    if not expense:
        raise HTTPException(
            status_code=404,
            detail="Expense not found"
        )

    setattr(expense, "amount", expense_data.amount)
    setattr(expense, "description", expense_data.description)
    setattr(expense, "category", expense_data.category)
    setattr(expense, "date", expense_data.date)

    db.commit()
    db.refresh(expense)

    return expense


@router.delete("/{expense_id}")
def delete_expense(
    expense_id: int,
    db: Session = Depends(get_db)
):
    expense = (
        db.query(Expense)
        .filter(Expense.id == expense_id)
        .first()
    )

    if not expense:
        raise HTTPException(
            status_code=404,
            detail="Expense not found"
        )

    db.delete(expense)
    db.commit()

    return {
        "message": "Expense deleted successfully"
    }