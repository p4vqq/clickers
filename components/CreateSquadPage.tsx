// components/CreateSquadPage.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const CreateSquadPage = () => {
    const [squadName, setSquadName] = useState('');
    const router = useRouter();

    const handleCreateSquad = () => {
        console.log('Creating squad:', squadName);
        router.push('/squads');
    };

    return (
        <div className="create-squad-page bg-black text-white min-h-screen flex flex-col items-center justify-center p-4">
            <h1 className="text-2xl font-bold mb-4">Создать новый Squad</h1>
            <input
                type="text"
                placeholder="Название Squad"
                value={squadName}
                onChange={(e) => setSquadName(e.target.value)}
                className="w-full max-w-md p-2 mb-4 bg-[#151515] text-white rounded-lg"
            />
            <button
                onClick={handleCreateSquad}
                className="w-full max-w-md py-2 bg-[#f3ba2f] text-black font-bold rounded-lg shadow-lg hover:shadow-xl transition-shadow"
            >
                Создать
            </button>
        </div>
    );
};

export default CreateSquadPage;