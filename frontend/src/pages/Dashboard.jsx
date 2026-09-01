import { useEffect, useState } from "react";
import axios from "axios";
import "./Dashboard.css";

const API_URL = "http://127.0.0.1:8000";

function Dashboard({ token, onLogout }) {
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
      const response = await axios.get(`${API_URL}/expenses/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setExpenses(response.data);
    } catch (error) {
      console.error("Failed to fetch expenses:", error);

      if (error.response?.status === 401) {
        onLogout();
      }
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

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await axios.post(
        `${API_URL}/expenses/`,
        {
          amount: Number(form.amount),
          description: form.description,
          category: form.category,
          date: form.date,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setForm({
        amount: "",
        description: "",
        category: "Food",
        date: new Date().toISOString().split("T")[0],
      });

      fetchExpenses();
    } catch (error) {
      console.error("Failed to create expense:", error);

      if (error.response?.status === 401) {
        onLogout();
      }
    }
  };

  const totalExpenses = expenses.reduce(
    (total, expense) => total + expense.amount,
    0
  );

  return (
    <div className="app">
      <header className="dashboard-header">
        <h1>Expense Tracker</h1>
        <p>Keep track of your spending</p>
      </header>

      <main className="dashboard-main">
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
          <h2>Add Expense</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="amount">Amount</label>

              <input
                id="amount"
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
              <label htmlFor="description">Description</label>

              <input
                id="description"
                type="text"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Lunch"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Category</label>

              <select
                id="category"
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
              <label htmlFor="date">Date</label>

              <input
                id="date"
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit">
              Add Expense
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
                <div
                  className="expense-item"
                  key={expense.id}
                >
                  <div>
                    <strong>{expense.description}</strong>
                    <span>{expense.category}</span>
                  </div>

                  <div className="expense-right">
                    <strong>
                      ₹{expense.amount.toFixed(2)}
                    </strong>

                    <span>{expense.date}</span>
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

export default Dashboard;