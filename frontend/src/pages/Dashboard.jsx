import { useEffect, useState } from "react";
import axios from "axios";
import "./Dashboard.css";

const API_URL = import.meta.env.VITE_API_URL;

function Dashboard({ token, onLogout }) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [user, setUser] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);
  const [deletingExpense, setDeletingExpense] = useState(null);
  const [form, setForm] = useState({
    amount: "",
    description: "",
    category: "Food",
    date: new Date().toISOString().split("T")[0],
  });
  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(response.data);
    } catch (error) {
      console.error("Failed to fetch user:", error);

      if (error.response?.status === 401) {
        onLogout();
      }
    }
  };
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
    fetchUser();
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
      const response = await axios.post(
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
        },
      );

      setExpenses((currentExpenses) => [response.data, ...currentExpenses]);

      setForm({
        amount: "",
        description: "",
        category: "Food",
        date: new Date().toISOString().split("T")[0],
      });
    } catch (error) {
      console.error("Failed to create expense:", error);

      if (error.response?.status === 401) {
        onLogout();
      }
    }
  };

  const handleDelete = async () => {
    if (!deletingExpense) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/expenses/${deletingExpense.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setExpenses((currentExpenses) =>
        currentExpenses.filter((expense) => expense.id !== deletingExpense.id),
      );

      setDeletingExpense(null);
    } catch (error) {
      console.error("Failed to delete expense:", error);

      if (error.response?.status === 401) {
        onLogout();
      }
    }
  };

  const hour = new Date().getHours();

  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const totalExpenses = expenses.reduce(
    (total, expense) => total + Number(expense.amount),
    0,
  );

  const handleEditSubmit = async (event) => {
    event.preventDefault();

    if (!editingExpense) {
      return;
    }

    try {
      const response = await axios.put(
        `${API_URL}/expenses/${editingExpense.id}`,
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
        },
      );

      setExpenses((currentExpenses) =>
        currentExpenses.map((expense) =>
          expense.id === editingExpense.id ? response.data : expense,
        ),
      );

      setEditingExpense(null);

      setForm({
        amount: "",
        description: "",
        category: "Food",
        date: new Date().toISOString().split("T")[0],
      });
    } catch (error) {
      console.error("Failed to update expense:", error);

      if (error.response?.status === 401) {
        onLogout();
      }
    }
  };

  const openEditModal = (expense) => {
    setEditingExpense(expense);

    setForm({
      amount: expense.amount,
      description: expense.description,
      category: expense.category,
      date: expense.date,
    });
  };

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyExpenses = expenses
    .filter((expense) => {
      const expenseDate = new Date(expense.date);

      return (
        expenseDate.getMonth() === currentMonth &&
        expenseDate.getFullYear() === currentYear
      );
    })
    .reduce((total, expense) => total + Number(expense.amount), 0);

  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 8);

  const formatAmount = (amount) => {
    return Number(amount).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="brand">
          <div className="brand-mark">₹</div>

          <div>
            <h1>Expense Tracker</h1>
            <p>Personal finance, simplified.</p>
          </div>
        </div>

        <div className="user-menu-wrapper">
          <button
            className="user-menu-button"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="user-avatar">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>

            <span>{user?.name || "User"}</span>

            <span className="menu-chevron">{showUserMenu ? "⌃" : "⌄"}</span>
          </button>

          {showUserMenu && (
            <div className="user-menu">
              <button onClick={onLogout}>Logout</button>
            </div>
          )}
        </div>
      </header>

      <main className="dashboard-main">
        <section className="welcome-section">
          <div>
            <h2>
              {greeting}, {user?.name || "there"} 👋
            </h2>
            <p>Here's an overview of your spending.</p>
          </div>
        </section>

        <section className="summary">
          <div className="summary-card">
            <div className="summary-label">
              <span>Total spent</span>
            </div>

            <strong>₹{formatAmount(totalExpenses)}</strong>

            <p>All time</p>
          </div>

          <div className="summary-card">
            <div className="summary-label">
              <span>This month</span>
            </div>

            <strong>₹{formatAmount(monthlyExpenses)}</strong>

            <p>September 2026</p>
          </div>

          <div className="summary-card">
            <div className="summary-label">
              <span>Transactions</span>
            </div>

            <strong>{expenses.length}</strong>

            <p>Total recorded</p>
          </div>
        </section>

        <section className="dashboard-grid">
          <div className="card expense-form-card">
            <div className="card-header">
              <div>
                <h3>Add expense</h3>
                <p>Record a new transaction</p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="amount">Amount</label>

                <div className="amount-input">
                  <span>₹</span>

                  <input
                    id="amount"
                    type="number"
                    name="amount"
                    value={form.amount}
                    onChange={handleChange}
                    placeholder="0.00"
                    min="0.01"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>

                <input
                  id="description"
                  type="text"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="What did you spend on?"
                  required
                />
              </div>

              <div className="form-row">
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
              </div>

              <div className="form-actions">
                <button className="primary-button" type="submit">
                  {editingExpense ? "Save changes" : "Add expense"}
                </button>

                {editingExpense && (
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => {
                      setEditingExpense(null);

                      setForm({
                        amount: "",
                        description: "",
                        category: "Food",
                        date: new Date().toISOString().split("T")[0],
                      });
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="card recent-card">
            <div className="card-header">
              <div>
                <h3>Recent expenses</h3>
                <p>Your latest transactions</p>
              </div>
            </div>

            {loading ? (
              <div className="empty-state">
                <p>Loading expenses...</p>
              </div>
            ) : recentExpenses.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">₹</div>
                <h4>No expenses yet</h4>
                <p>Add your first expense to get started.</p>
              </div>
            ) : (
              <div className="expense-list">
                {recentExpenses.map((expense) => (
                  <div className="expense-item" key={expense.id}>
                    <div className="expense-info">
                      <div className="category-icon">
                        {expense.category === "Food"
                          ? "🍴"
                          : expense.category === "Transport"
                            ? "🚗"
                            : expense.category === "Shopping"
                              ? "🛍"
                              : expense.category === "Bills"
                                ? "📄"
                                : expense.category === "Entertainment"
                                  ? "🎬"
                                  : "•"}
                      </div>

                      <div>
                        <strong>{expense.description}</strong>

                        <div className="expense-meta">
                          <span className="category-badge">
                            {expense.category}
                          </span>

                          <span>{formatDate(expense.date)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="expense-right">
                      <strong className="expense-amount">
                        −₹{formatAmount(expense.amount)}
                      </strong>

                      <div className="expense-actions">
                        <button
                          className="edit-button"
                          onClick={() => openEditModal(expense)}
                        >
                          Edit
                        </button>

                        <button
                          className="delete-button"
                          onClick={() => setDeletingExpense(expense)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      {editingExpense && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setEditingExpense(null);
            }
          }}
        >
          <div className="modal">
            <div className="modal-header">
              <div>
                <h3>Edit expense</h3>
                <p>Update the details of this transaction.</p>
              </div>

              <button
                className="modal-close"
                onClick={() => setEditingExpense(null)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label htmlFor="edit-amount">Amount</label>

                <div className="amount-input">
                  <span>₹</span>

                  <input
                    id="edit-amount"
                    type="number"
                    name="amount"
                    value={form.amount}
                    onChange={handleChange}
                    min="0.01"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="edit-description">Description</label>

                <input
                  id="edit-description"
                  type="text"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="edit-category">Category</label>

                  <select
                    id="edit-category"
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
                  <label htmlFor="edit-date">Date</label>

                  <input
                    id="edit-date"
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="modal-cancel"
                  onClick={() => setEditingExpense(null)}
                >
                  Cancel
                </button>

                <button type="submit" className="modal-save">
                  Save changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {deletingExpense && (
  <div
    className="modal-overlay"
    onMouseDown={(event) => {
      if (event.target === event.currentTarget) {
        setDeletingExpense(null);
      }
    }}
  >
    <div className="delete-modal">
      <div className="delete-icon">
        !
      </div>

      <h3>Delete expense?</h3>

      <p>
        Are you sure you want to delete{" "}
        <strong>
          "{deletingExpense.description}"
        </strong>
        ? This action cannot be undone.
      </p>

      <div className="modal-actions">
        <button
          className="modal-cancel"
          onClick={() => setDeletingExpense(null)}
        >
          Cancel
        </button>

        <button
          className="modal-delete"
          onClick={handleDelete}
        >
          Delete expense
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}

export default Dashboard;