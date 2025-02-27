// app/api/squads/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
    const squads = [
        { id: '1', name: 'Squad 1', logo: '/logo1.png', totalBalance: 1000, members: 5, averageLevel: 3 },
        { id: '2', name: 'Squad 2', logo: '/logo2.png', totalBalance: 2000, members: 10, averageLevel: 5 },
    ];

    const topSquads = [
        { id: '1', name: 'Squad 1', logo: '/logo1.png', totalBalance: 1000, members: 5, averageLevel: 3 },
        { id: '2', name: 'Squad 2', logo: '/logo2.png', totalBalance: 2000, members: 10, averageLevel: 5 },
    ];

    return NextResponse.json({ squads, topSquads });
}