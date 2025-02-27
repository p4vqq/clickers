import { connectToDatabase } from '@/utils/database';

export async function GET() {
    try {
        const db = await connectToDatabase();
        const squadsCollection = db.collection('squads');

        const squads = await squadsCollection.find({}).toArray();
        return new Response(JSON.stringify({ squads }), {
            status: 200,
        });
    } catch (error) {
        console.error('Ошибка при получении сквадов:', error);
        return new Response(JSON.stringify({ message: 'Ошибка сервера' }), {
            status: 500,
        });
    }
}