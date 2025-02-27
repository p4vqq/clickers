import { connectToDatabase } from '@/utils/database';

export async function POST(request) {
    const { name, logo, userId, username } = await request.json();

    if (!name || !userId || !username) {
        return new Response(JSON.stringify({ message: 'Недостаточно данных для создания сквада' }), {
            status: 400,
        });
    }

    try {
        const db = await connectToDatabase();
        const squadsCollection = db.collection('squads');

        const newSquad = {
            name,
            logo: logo || '',
            totalBalance: 0,
            members: [{ userId, username, contribution: 0 }],
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await squadsCollection.insertOne(newSquad);
        return new Response(JSON.stringify({ message: 'Сквад создан', squadId: result.insertedId }), {
            status: 201,
        });
    } catch (error) {
        console.error('Ошибка при создании сквада:', error);
        return new Response(JSON.stringify({ message: 'Ошибка сервера' }), {
            status: 500,
        });
    }
}