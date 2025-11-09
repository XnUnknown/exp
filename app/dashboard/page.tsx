"use client";
import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

type Expense = {
  id: number;
  title: string;
  amount: number;
  name: string;
  createdAt: string;
};

export default function ExpenseDashboard() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [names, setNames] = useState<string[]>([]);
  const [selectedName, setSelectedName] = useState<string>("");
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [totalStats, setTotalStats] = useState({
    total: 0,
    average: 0,
    highest: 0,
    lowest: 0,
  });

  // Fetch all unique names
  useEffect(() => {
    const fetchNames = async () => {
      const res = await fetch("/api/expense");
      const data = await res.json();
      const uniqueNames = Array.from(new Set(data.expenses.map((e: Expense) => e.name)));
      setNames(uniqueNames as string[]);
      if (uniqueNames.length > 0) {
        setSelectedName(uniqueNames[0] as string);
      }
    };
    fetchNames();
  }, []);

  // Fetch expenses for selected name
  useEffect(() => {
    if (selectedName) {
      const fetchExpenses = async () => {
        const params = new URLSearchParams({ name: selectedName });
        const res = await fetch(`/api/expense?${params.toString()}`);
        const data = await res.json();
        setExpenses(data.expenses);
        
        // Calculate monthly aggregates
        const monthly = data.expenses.reduce((acc: any, curr: Expense) => {
          const date = new Date(curr.createdAt);
          const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          if (!acc[month]) acc[month] = { month, total: 0, count: 0 };
          acc[month].total += curr.amount;
          acc[month].count++;
          return acc;
        }, {});

        const monthlyArray = Object.values(monthly).sort((a: any, b: any) => a.month.localeCompare(b.month));
        setMonthlyData(monthlyArray);

        // Calculate statistics
        const amounts = data.expenses.map((e: Expense) => e.amount);
        setTotalStats({
          total: data.total,
          average: amounts.reduce((a: number, b: number) => a + b, 0) / amounts.length,
          highest: Math.max(...amounts),
          lowest: Math.min(...amounts),
        });
      };
      fetchExpenses();
    }
  }, [selectedName]);

  return (
    <div className="min-h-screen bg-green-50 dark:bg-gray-900 font-sans">
      <header className="w-full bg-green-200 dark:bg-gray-800 py-6 px-8 text-black dark:text-white shadow border-b border-green-300 dark:border-gray-700">
        <h1 className="text-3xl font-bold">Expense Analytics Dashboard</h1>
        <p className="text-lg mt-2">Detailed expense analysis and trends</p>
      </header>

      <main className="max-w-7xl mx-auto py-10 px-4">
        {/* Name Selection */}
        <div className="mb-8">
          <select
            className="border border-green-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-lg px-4 py-2 w-full md:w-64"
            value={selectedName}
            onChange={(e) => setSelectedName(e.target.value)}
          >
            {names.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: "Total Expenses", value: totalStats.total },
            { label: "Average Expense", value: totalStats.average },
            { label: "Highest Expense", value: totalStats.highest },
            { label: "Lowest Expense", value: totalStats.lowest },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white dark:bg-gray-800 border border-green-300 dark:border-gray-700 rounded-xl p-6 shadow-lg"
            >
              <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">{stat.label}</h3>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                ${stat.value.toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Monthly Trend */}
          <div className="bg-white dark:bg-gray-800 border border-green-300 dark:border-gray-700 rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Monthly Expense Trend</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="total" stroke="#22c55e" name="Total Expenses" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly Distribution */}
          <div className="bg-white dark:bg-gray-800 border border-green-300 dark:border-gray-700 rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Monthly Distribution</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#22c55e" name="Number of Expenses" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}