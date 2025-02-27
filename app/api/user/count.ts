// app/api/user/count/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/utils/prisma';

export async function GET() {
    try {
        // Получаем общее количество пользователей из базы данных
        const totalUsers = await prisma.user.count();

        // Возвращаем результат
        return NextResponse.json({ totalUsers });
    } catch (error) {
        console.error('Failed to fetch total users:', error);
        return NextResponse.json({ error: 'Failed to fetch total users' }, { status: 500 });
    }
}