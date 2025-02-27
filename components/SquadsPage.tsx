'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/utils/game-mechanics';
import styles from './stars.module.scss';
import styles2 from './stars2.module.scss';
import Image from 'next/image';
import { Squads } from '@/images';
import { useRouter } from 'next/navigation';

type Squad = {
    id: string;
    name: string;
    logo: string;
    totalBalance: number;
    members: number;
    averageLevel: number;
};

const SquadsPage = () => {
    const { userTelegramName, pointsBalance, gameLevelIndex, squad, setSquad } = useGameStore();
    const [squads, setSquads] = useState<Squad[]>([]);
    const [topSquads, setTopSquads] = useState<Squad[]>([]);
    const router = useRouter();

    useEffect(() => {
        const fetchSquads = async () => {
            try {
                const response = await fetch('/api/squads/list');
                if (!response.ok) {
                    throw new Error('Ошибка при загрузке сквадов');
                }
                const data = await response.json();
                setSquads(data.squads);
                setTopSquads(data.topSquads);
            } catch (error) {
                console.error('Ошибка при загрузке сквадов:', error);
            }
        };

        fetchSquads();
    }, []);

    const handleJoinSquad = (squadId: string) => {
        const selectedSquad = squads.find((s) => s.id === squadId);
        if (selectedSquad) {
            setSquad(selectedSquad);
            alert(`Вы присоединились к скваду: ${selectedSquad.name}`);
        }
    };

    const handleCreateSquad = () => {
        router.push('/create-squad');
    };

    const renderBackground = () => {
        if (gameLevelIndex >= 0 && gameLevelIndex <= 2) {
            return (
                <div className={styles.starsBackground} style={{ zIndex: 0, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
                    <div className={styles.stars}></div>
                    <div className={styles.stars2}></div>
                    <div className={styles.stars3}></div>
                </div>
            );
        } else if (gameLevelIndex >= 3 && gameLevelIndex <= 8) {
            return (
                <div className={styles2.starsBackground1} style={{ zIndex: 0, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
                    <div className={styles2.stars_lv3}></div>
                    <div className={styles2.stars2_lv3}></div>
                    <div className={styles2.stars3_lv3}></div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="squads-page bg-transparent transition-all duration-300 relative h-screen overflow-y-auto">
            {renderBackground()}
            <div className="relative z-10">
                <div className="px-4">
                    <div className="flex flex-col items-center mt-4">
                        <Image
                            src={Squads}
                            alt="Trophy"
                            width={80}
                            height={80}
                            className="mb-2"
                        />
                        <h1 className="text-2xl font-bold mb-2 text-white">Squads</h1>
                        <p className="text-center text-sm text-[#7c7c7c] mb-4">
                            Добыча льда будет быстрее, если ты будешь в Squad
                        </p>
                    </div>

                    <div className="flex justify-between mt-4">
                        <button
                            className="w-1/2 py-2 bg-[#f3ba2f] text-black font-bold rounded-lg shadow-lg hover:shadow-xl transition-shadow text-sm mr-2"
                            onClick={() => handleJoinSquad('some-squad-id')}
                        >
                            Присоединиться
                        </button>
                        <button
                            className="w-1/2 py-2 bg-[#f3ba2f] text-black font-bold rounded-lg shadow-lg hover:shadow-xl transition-shadow text-sm ml-2"
                            onClick={handleCreateSquad}
                        >
                            Создать новый
                        </button>
                    </div>

                    <div className="mt-4">
                        <h2 className="text-lg font-bold text-white mb-2">Топ Squads</h2>
                        {squads.map((squad, index) => (
                            <div key={squad.id} className="p-4 flex items-center justify-between bg-[#151515] rounded-lg mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 p-1.5 bg-white rounded-lg">
                                        <img src={squad.logo} alt={squad.name} className="w-full h-full rounded-lg" />
                                    </div>
                                    <div>
                                        <div className="text-base font-medium text-white">{squad.name}</div>
                                        <div className="text-sm font-medium text-[#7c7c7c]">
                                            {squad.totalBalance.toLocaleString()} points
                                        </div>
                                    </div>
                                </div>
                                <div className="text-base font-medium text-white">
                                    #{index + 1}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SquadsPage;