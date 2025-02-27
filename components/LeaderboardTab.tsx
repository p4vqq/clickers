'use client';

import { useGameStore } from '@/utils/game-mechanics';
import Image from 'next/image';
import { trophy } from '@/images';
import styles from './stars.module.scss';
import styles2 from './stars2.module.scss';
import { useEffect, useState } from 'react';

type LeaderboardItem = {
    wallet: string;
    balance: number;
    place: string | number;
    medal?: '🥇' | '🥈' | '🥉';
    isBot?: boolean;
};

const LeaderboardTab = () => {
    const { userTelegramName, pointsBalance, gameLevelIndex } = useGameStore();
    const [totalUsers, setTotalUsers] = useState(20000); // Начальное значение 20,000

    // Исходные данные для ботов
    const initialBots: LeaderboardItem[] = [
        { wallet: "Pishnahad_Sup", balance: 40000, place: "🥇", isBot: true },
        { wallet: "imGet", balance: 39000, place: "🥈", isBot: true },
        { wallet: "Esalat", balance: 38000, place: "🥉", isBot: true },
        { wallet: "mehranseydi", balance: 37000, place: "#4", isBot: true },
        { wallet: "abbas", balance: 36000, place: "#5", isBot: true },
        { wallet: "CenterProd", balance: 35000, place: "#6", isBot: true },
        { wallet: "tuxeoqt", balance: 34000, place: "#7", isBot: true },
        { wallet: "ladesov", balance: 33000, place: "#8", isBot: true },
    ];

    // Состояние для списка лидеров
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardItem[]>(initialBots);

    // Функция для увеличения баланса ботов (симуляция фарминга)
    useEffect(() => {
        const interval = setInterval(() => {
            setLeaderboardData(prevData =>
                prevData.map(bot => {
                    if (bot.isBot) {
                        const increment = (Math.floor(Math.random() * 10) + 1) * 10;
                        return { ...bot, balance: bot.balance + increment };
                    }
                    return bot;
                })
            );
        }, 30000); // Обновление каждые 30 секунд

        return () => clearInterval(interval);
    }, []);

    // Получение общего количества пользователей с сервера
    useEffect(() => {
        const fetchTotalUsers = async () => {
            try {
                const response = await fetch('/api/user/count');
                const data = await response.json();
                setTotalUsers(20000 + data.totalUsers); // Добавляем 20,000 к количеству из базы
            } catch (error) {
                console.error('Failed to fetch total users:', error);
            }
        };

        fetchTotalUsers();
    }, []);

    // Добавляем реального пользователя в список лидеров
    const leaderboardDataWithUser = [
        ...leaderboardData,
        { wallet: userTelegramName, balance: pointsBalance, place: "#N/A" }
    ];

    // Сортируем список лидеров по убыванию баллов
    const sortedLeaderboardData = leaderboardDataWithUser.sort((a, b) => b.balance - a.balance);

    // Обновляем места в списке
    const finalLeaderboardData = sortedLeaderboardData.map((item, index) => {
        let place: string | number = index + 1;
        if (place === 1) place = "🥇";
        else if (place === 2) place = "🥈";
        else if (place === 3) place = "🥉";
        else place = `#${place}`;
        return { ...item, place };
    });

    // Если реальный пользователь в топе, заменяем бота
    const userIndex = finalLeaderboardData.findIndex(item => item.wallet === userTelegramName);
    if (userIndex !== -1 && userIndex < 8) {
        finalLeaderboardData[userIndex] = {
            wallet: userTelegramName,
            balance: pointsBalance,
            place: finalLeaderboardData[userIndex].place,
        };
    }

    // Функция для выбора фона в зависимости от уровня
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
        <div className="leaderboard-tab-con bg-transparent transition-all duration-300 relative h-screen overflow-y-auto">
            {/* Фон в зависимости от уровня */}
            {renderBackground()}

            {/* Основной контент */}
            <div className="relative z-10">
                <div className="px-4">
                    <div className="flex flex-col items-center mt-4">
                        <Image
                            src={trophy}
                            alt="Trophy"
                            width={80}
                            height={80}
                            className="mb-2"
                        />
                        <h1 className="text-2xl font-bold mb-2 text-white">Leaderboard</h1>
                        <div className="w-full mt-2 px-6 py-1 flex justify-between rounded-lg text-sm font-medium text-[#fefefe] bg-[#151516]">
                            <span>Total</span>
                            <span>{totalUsers.toLocaleString()} users</span>
                        </div>
                    </div>

                    {/* Current User Stats */}
                    <div className="bg-white rounded-2xl p-6 mt-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 p-1.5 bg-black rounded-lg">
                                    <div className="w-full h-full bg-gray-300 rounded-lg"></div>
                                </div>
                                <div className="text-black font-medium">
                                    <div className="text-base">{userTelegramName}</div>
                                    <div className="text-xs">{(Math.floor(pointsBalance / 10) * 10).toLocaleString()} points</div>
                                </div>
                            </div>
                            <div className="text-black">#{userIndex + 1}</div>
                        </div>
                    </div>

                    {/* Leaderboard List */}
                    <div className="mt-4 space-y-0 rounded-t-2xl">
                        {finalLeaderboardData.slice(0, 8).map((item, index) => (
                            <div
                                key={index}
                                className={`p-4 flex items-center justify-between border-b-[1px] border-[#222622] ${index === 0 ? 'bg-[#2d2b1b] rounded-t-2xl' :
                                    index === 1 ? 'bg-[#272728]' :
                                        index === 2 ? 'bg-[#2d241b]' :
                                            'bg-[#151515]'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 p-1.5 bg-white rounded-lg">
                                        <div className="w-full h-full bg-gray-300 rounded-lg"></div>
                                    </div>
                                    <div>
                                        <div className="text-base font-medium text-white">{item.wallet}</div>
                                        <div className="text-sm font-medium text-[#7c7c7c]">
                                            {(Math.floor(item.balance / 10) * 10).toLocaleString()} points
                                        </div>
                                    </div>
                                </div>
                                <div className={`text-base font-medium ${typeof item.place === 'string' && item.place.startsWith('#')
                                    ? 'text-white'
                                    : ''
                                    }`}>
                                    {item.place}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeaderboardTab;