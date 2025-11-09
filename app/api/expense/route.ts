import { PrismaClient } from '../../generated/prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

// Add a new expense
export async function POST(req: NextRequest) {
  const { title, amount, name } = await req.json();
  const expense = await prisma.expense.create({
    data: { title, amount, name },
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

  if (minAmount) where.amount = { gte: Number(minAmount) };
  if (name) where.name = name;

  if (period) {
    const now = new Date();
    let start: Date | undefined;
    if (period === 'monthly') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === 'weekly') {
      const day = now.getDay();
      start = new Date(now);
      start.setDate(now.getDate() - day);
    }
    if (start) {
      where.createdAt = { gte: start };
    }
  }

  const expenses = await prisma.expense.findMany({ where });
  const total = expenses.reduce((sum: number, e: { amount: number }) => sum + e.amount, 0);
  return NextResponse.json({ expenses, total });
}
