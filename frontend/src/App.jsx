import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

function App() {
  const [editingId, setEditingId] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    amount: "",
    description: "",
    category: "Food",
    date: new Date().toISOString().split("T")[0],
  });

  const fetchExpenses = async () => {
    try {
      const response = await axios.get(`${API_URL}/expenses/`);
      setExpenses(response.data);
    } catch (error) {
      console.error("Failed to fetch expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleDelete = async (expenseId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this expense?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/expenses/${expenseId}`);
      fetchExpenses();
    } catch (error) {
      console.error("Failed to delete expense:", error);
    }
  };

  const handleEdit = (expense) => {
    setEditingId(expense.id);

    setForm({
      amount: expense.amount,
      description: expense.description,
      category: expense.category,
      date: expense.date,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const expenseData = {
      amount: Number(form.amount),
      description: form.description,
      category: form.category,
      date: form.date,
    };

    try {
      if (editingId !== null) {
        await axios.put(`${API_URL}/expenses/${editingId}`, expenseData);
      } else {
        await axios.post(`${API_URL}/expenses/`, expenseData);
      }

      setForm({
        amount: "",
        description: "",
        category: "Food",
        date: new Date().toISOString().split("T")[0],
      });

      setEditingId(null);

      fetchExpenses();
    } catch (error) {
      console.error("Failed to save expense:", error);
    }
  };

  const totalExpenses = expenses.reduce(
    (total, expense) => total + expense.amount,
    0,
  );

  return (
    <div className="app">
      <header>
        <h1>Expense Tracker</h1>
        <p>Keep track of your spending</p>
      </header>

      <main>
        <section className="summary">
          <div className="summary-card">
            <span>Total Expenses</span>
            <strong>₹{totalExpenses.toFixed(2)}</strong>
          </div>

          <div className="summary-card">
            <span>Transactions</span>
            <strong>{expenses.length}</strong>
          </div>
        </section>

        <section className="card">
          <h2>{editingId !== null ? "Edit Expense" : "Add Expense"}</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Amount</label>
              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                placeholder="350"
                min="0.01"
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <input
                type="text"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Lunch"
                required
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
              >
                <option>Food</option>
                <option>Transport</option>
                <option>Shopping</option>
                <option>Bills</option>
                <option>Entertainment</option>
                <option>Health</option>
                <option>Education</option>
                <option>Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit">
              {editingId !== null ? "Update Expense" : "Add Expense"}
            </button>
          </form>
        </section>

        <section className="card">
          <h2>Recent Expenses</h2>

          {loading ? (
            <p>Loading...</p>
          ) : expenses.length === 0 ? (
            <p>No expenses yet.</p>
          ) : (
            <div className="expense-list">
              {expenses.map((expense) => (
                <div className="expense-item" key={expense.id}>
                  <div>
                    <strong>{expense.description}</strong>
                    <span>{expense.category}</span>
                  </div>

                  <div className="expense-right">
                    <strong>₹{expense.amount.toFixed(2)}</strong>
                    <span>{expense.date}</span>

                    <div className="expense-actions">
                      <button
                        className="edit-button"
                        onClick={() => handleEdit(expense)}
                      >
                        Edit
                      </button>

                      <button
                        className="delete-button"
                        onClick={() => handleDelete(expense.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
