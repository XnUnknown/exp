import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

// Add a new expense
export async function POST(req: NextRequest) {
  const data = await req.json();
  const expense = await prisma.expense.create({
    data: {
      title: data.title,
      amount: Number(data.amount),
      name: data.name,
      createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
    },
  });
  return NextResponse.json(expense);
}

// Delete an expense by id
export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await prisma.expense.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

// Get expenses by filter
export async function GET(req: NextRequest) {
  const { period, minAmount, name } = Object.fromEntries(req.nextUrl.searchParams);
  let where: Record<string, any> = {};

  // Filter by minimum amount
  if (minAmount && !isNaN(Number(minAmount))) {
    where.amount = { gte: Number(minAmount) };
  }

  // Filter by name (exact match for now, as Neon DB might not support case-insensitive search)
  if (name && name.trim() !== '') {
    where.name = name.trim();
  }

  // Filter by period
  if (period) {
    const now = new Date();
    let start: Date;
    
    switch (period) {
      case 'monthly':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'weekly':
        const firstDayOfWeek = new Date(now);
        const day = now.getDay();
        firstDayOfWeek.setDate(now.getDate() - day);
        firstDayOfWeek.setHours(0, 0, 0, 0);
        start = firstDayOfWeek;
        break;
      default:
        start = new Date(0); // Show all if period is invalid
    }

    where.createdAt = { gte: start };
  }

  // Get filtered expenses, sorted by date
  const expenses = await prisma.expense.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  // Calculate total
  const total = expenses.reduce((sum: number, e: { amount: number }) => sum + e.amount, 0);
  
  return NextResponse.json({ expenses, total });
}
