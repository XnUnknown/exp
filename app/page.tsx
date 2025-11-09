"use client";
import React, { useEffect, useState } from "react";

type Expense = {
  id: number;
  title: string;
  amount: number;
  name: string;
  createdAt: string;
};

export default function Dashboard() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [total, setTotal] = useState(0);
  const [form, setForm] = useState({ title: "", amount: "", name: "" });
  const [filter, setFilter] = useState({ period: "", minAmount: "", name: "" });

  // Fetch expenses
  const fetchExpenses = async () => {
    const params = new URLSearchParams(filter as any).toString();
    const res = await fetch(`/api/expense?₹{params}`);
    const data = await res.json();
    setExpenses(data.expenses);
    setTotal(data.total);
  };

  useEffect(() => {
    fetchExpenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  // Add expense
  const addExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/expense", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        amount: Number(form.amount),
        name: form.name,
      }),
    });
    setForm({ title: "", amount: "", name: "" });
    fetchExpenses();
  };

  // Delete expense
  const deleteExpense = async (id: number) => {
    await fetch("/api/expense", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchExpenses();
  };

  return (
    <div className="min-h-screen bg-green-50 font-sans">
      <header className="w-full bg-green-200 py-6 px-8 text-black shadow border-b border-green-300">
        <h1 className="text-3xl font-bold">Expense Dashboard</h1>
        <p className="text-lg mt-2">Track your expenses by name, period, and amount</p>
      </header>
      <main className="max-w-4xl mx-auto py-10 px-4">
        <section className="mb-8">
          <div className="bg-white border border-green-300 dark:border-green-700 rounded-2xl p-6 shadow-xl dark:bg-gradient-to-br dark:from-gray-900 dark:to-green-950">
            <h2 className="text-xl font-semibold mb-4">Add Expense</h2>
            <form className="flex flex-col gap-4 md:flex-row md:items-end" onSubmit={addExpense}>
              <input
                type="text"
                placeholder="Title"
                className="border border-green-300 rounded px-3 py-2 w-full md:w-1/4 focus:outline-none focus:ring-2 focus:ring-green-200"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                required
              />
              <input
                type="number"
                placeholder="Amount"
                className="border border-green-300 rounded px-3 py-2 w-full md:w-1/4 focus:outline-none focus:ring-2 focus:ring-green-200"
                value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Name"
                className="border border-green-300 rounded px-3 py-2 w-full md:w-1/4 focus:outline-none focus:ring-2 focus:ring-green-200"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
              <button
                type="submit"
                className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 shadow"
              >
                Add
              </button>
            </form>
          </div>
        </section>
        <section className="mb-8">
          <div className="bg-white border border-green-300 dark:border-green-700 rounded-2xl p-6 shadow-xl dark:bg-gradient-to-br dark:from-gray-900 dark:to-green-950">
            <h2 className="text-xl font-semibold mb-4">Filters</h2>
            <div className="flex flex-col gap-4 md:flex-row">
              <select
                className="border border-green-300 rounded px-3 py-2 w-full md:w-1/4 focus:outline-none focus:ring-2 focus:ring-green-200"
                value={filter.period}
                onChange={e => setFilter({ ...filter, period: e.target.value })}
              >
                <option value="">All Time</option>
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
              </select>
                <input
                  type="number"
                  placeholder="Min Amount"
                  className="border border-green-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded px-3 py-2 w-full md:w-1/4 focus:outline-none focus:ring-2 focus:ring-green-200 dark:focus:ring-gray-700"
                  value={filter.minAmount}
                  onChange={e => setFilter({ ...filter, minAmount: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Name"
                  className="border border-green-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded px-3 py-2 w-full md:w-1/4 focus:outline-none focus:ring-2 focus:ring-green-200 dark:focus:ring-gray-700"
                  value={filter.name}
                  onChange={e => setFilter({ ...filter, name: e.target.value })}
                />
              <button
                type="button"
                className="bg-green-100 text-black px-6 py-2 rounded hover:bg-green-200 border border-green-300"
                onClick={() => setFilter({ period: "", minAmount: "", name: "" })}
              >
                Reset
              </button>
            </div>
          </div>
        </section>
        <section>
          <div className="bg-white border border-green-300 dark:border-green-700 rounded-2xl p-6 shadow-xl dark:bg-gradient-to-br dark:from-gray-900 dark:to-green-950">
            <h2 className="text-xl font-semibold mb-4">Expenses</h2>
            <div className="mb-4 text-lg font-medium">Total: <span className="text-green-600">₹{total}</span></div>
            <table className="w-full border border-green-200 rounded overflow-hidden">
              <thead className="bg-green-100">
                <tr>
                  <th className="py-2 px-4 text-left">Title</th>
                  <th className="py-2 px-4 text-left">Amount</th>
                  <th className="py-2 px-4 text-left">Name</th>
                  <th className="py-2 px-4 text-left">Date</th>
                  <th className="py-2 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-zinc-500">No expenses found.</td>
                  </tr>
                ) : (
                  expenses.map(exp => (
                    <tr key={exp.id} className="border-t border-green-100">
                      <td className="py-2 px-4">{exp.title}</td>
                      <td className="py-2 px-4">₹{exp.amount}</td>
                      <td className="py-2 px-4">{exp.name}</td>
                      <td className="py-2 px-4">{new Date(exp.createdAt).toLocaleString()}</td>
                      <td className="py-2 px-4">
                        <button
                          className="bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 border border-red-300"
                          onClick={() => deleteExpense(exp.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
