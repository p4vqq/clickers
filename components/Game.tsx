import { useEffect, useState } from 'react';
import Image from 'next/image';
import { binanceLogo, dailyCipher, dailyCombo, dailyReward, dollarCoin, lightning } from '@/images';
import IceCube from '@/icons/IceCube';
import IceCubes from '@/icons/IceCubes';
import Rocket from '@/icons/Rocket';
import Energy from '@/icons/Energy';
import Link from 'next/link';
import { useGameStore } from '@/utils/game-mechanics';
import Snowflake from '@/icons/Snowflake';
import TopInfoSection from '@/components/TopInfoSection';
import { LEVELS } from '@/utils/consts';
import { triggerHapticFeedback } from '@/utils/ui';
import './layout.css'; // Подключение стилей
import styles from './stars.module.scss'; // Импортируем SCSS-файл
import styles2 from './stars2.module.scss'; // Импортируем SCSS-файл
import tapStyles from './Animation.module.scss'; // Импортируем SCSS для анимации
import Animation from './Animation';
import Animation2 from './Animation2';
import Animation3 from './Animation3';
import Navigation from '@/components/Navigation'; // Импортируем компонент Navigation
import LeaderboardTab from '@/components/LeaderboardTab'; // Импортируем компонент LeaderboardTab
import SquadsPage from '@/components/SquadsPage'; // Импортируем SquadsPage из app

interface GameProps {
    currentView: string;
    setCurrentView: (view: string) => void;
}

export default function Game({ currentView, setCurrentView }: GameProps) {
    console.log("Current View in Game:", currentView); // Лог для проверки currentView

    const [isAnimationEnabled, setIsAnimationEnabled] = useState(true);

    useEffect(() => {
        const storedAnimation = localStorage.getItem('animationEnabled');
        setIsAnimationEnabled(storedAnimation !== 'false');
    }, []);

    const handleViewChange = (view: string) => {
        console.log('Attempting to change view to:', view);
        if (typeof setCurrentView === 'function') {
            try {
                triggerHapticFeedback(window);
                setCurrentView(view);
                console.log('View change successful');
            } catch (error) {
                console.error('Error occurred while changing view:', error);
            }
        } else {
            console.error('setCurrentView is not a function:', setCurrentView);
        }
    };

    const [clicks, setClicks] = useState<{ id: number, x: number, y: number }[]>([]);

    const {
        points,
        pointsBalance,
        pointsPerClick,
        energy,
        maxEnergy,
        gameLevelIndex,
        clickTriggered,
        updateLastClickTimestamp,
    } = useGameStore();

    const calculateTimeLeft = (targetHour: number) => {
        const now = new Date();
        const target = new Date(now);
        target.setUTCHours(targetHour, 0, 0, 0);

        if (now.getUTCHours() >= targetHour) {
            target.setUTCDate(target.getUTCDate() + 1);
        }

        const diff = target.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        const paddedHours = hours.toString().padStart(2, '0');
        const paddedMinutes = minutes.toString().padStart(2, '0');

        return `${paddedHours}:${paddedMinutes}`;
    };

    const handleInteraction = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        e.preventDefault();

        const processInteraction = (clientX: number, clientY: number, pageX: number, pageY: number) => {
            if (energy - pointsPerClick < 0) return;

            const card = e.currentTarget;
            const rect = card.getBoundingClientRect();
            const x = clientX - rect.left - rect.width / 2;
            const y = clientY - rect.top - rect.height / 2;

            card.style.transform = `perspective(1000px) rotateX(${-y / 10}deg) rotateY(${x / 10}deg)`;
            setTimeout(() => {
                card.style.transform = '';
            }, 100);

            updateLastClickTimestamp();
            clickTriggered();
            if (isAnimationEnabled) {
                setClicks(prevClicks => [...prevClicks, {
                    id: Date.now(),
                    x: pageX,
                    y: pageY
                }]);
            }

            triggerHapticFeedback(window);
        };

        if (e.type === 'touchend') {
            const touchEvent = e as React.TouchEvent<HTMLDivElement>;
            Array.from(touchEvent.changedTouches).forEach(touch => {
                processInteraction(touch.clientX, touch.clientY, touch.pageX, touch.pageY);
            });
        } else {
            const mouseEvent = e as React.MouseEvent<HTMLDivElement>;
            processInteraction(mouseEvent.clientX, mouseEvent.clientY, mouseEvent.pageX, mouseEvent.pageY);
        }
    };

    const handleAnimationEnd = (id: number) => {
        setClicks((prevClicks) => prevClicks.filter(click => click.id !== id));
    };

    const calculateProgress = () => {
        if (gameLevelIndex >= LEVELS.length - 1) {
            return 100;
        }
        const currentLevelMin = LEVELS[gameLevelIndex].minPoints;
        const nextLevelMin = LEVELS[gameLevelIndex + 1].minPoints;
        const progress = ((points - currentLevelMin) / (nextLevelMin - currentLevelMin)) * 100;
        return Math.min(progress, 100);
    };

    // Функция для выбора анимации в зависимости от уровня
    const renderAnimation = () => {
        switch (gameLevelIndex) {
            case 0:
                return <Animation />;
            case 1:
                return <Animation2 />;
            case 2:
                return <Animation3 />;
            // Добавьте другие уровни, если нужно
            default:
                return <Animation />;
        }
    };

    // Функция для выбора фона в зависимости от уровня
    const renderBackground = () => {
        if (gameLevelIndex >= 0 && gameLevelIndex <= 2) {
            // Уровни 1-3
            return (
                <div className={styles.starsBackground} style={{ zIndex: 0, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
                    <div className={styles.stars}></div>
                    <div className={styles.stars2}></div>
                    <div className={styles.stars3}></div>
                </div>
            );
        } else if (gameLevelIndex >= 3 && gameLevelIndex <= 8) {
            // Уровни 4-9
            return (
                <div className={styles2.starsBackground1} style={{ zIndex: 0, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
                    <div className={styles2.stars_lv3}></div>
                    <div className={styles2.stars2_lv3}></div>
                    <div className={styles2.stars3_lv3}></div>
                </div>
            );
        }
        return null; // На случай, если уровни выйдут за пределы 0-8
    };

    return (
        <div className="bg-black flex justify-center h-screen overflow-hidden">
            <div className="w-full bg-black text-white h-full font-bold flex flex-col max-w-xl relative">
                {/* Шапка */}
                <TopInfoSection isGamePage={true} setCurrentView={setCurrentView} />

                {/* Основной контент */}
                {currentView === 'game' && (
                    <div className="flex-grow mt-4 bg-[#f3ba2f] rounded-t-[48px] relative top-glow overflow-y-auto">
                        {/* Фон в зависимости от уровня */}
                        {renderBackground()}

                        {/* Остальной контент страницы */}
                        <div className="px-4 pb-24 relative z-10">
                            {/* Верхнее меню */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-2">
                                    <span className="text-2xl">👫</span>
                                    <span className="text-2xl">🠒</span>
                                    <span className="text-2xl">📱</span>
                                </div>
                            </div>

                            {/* Заголовок и описание */}
                            <div className="text-left mb-4">
                                <h1 className="text-lg text-white mb-1">Приглашай друзей</h1>
                                <div className="text-xs text-white">
                                    <p></p>
                                    <p className="text-xs text-white-400 mt-1">Распространяй приложение среди друзей. Приглашай их присоединиться к Iceton и зарабатывай % от их майнинга</p>
                                </div>
                            </div>

                            {/* Плитки с бонусами */}
                            <div className="flex space-x-4 mb-4">
                                {/* Левая плитка: Льдышки и уровень */}
                                <div className="flex-1 bg-gradient-to-r from-[#2a2e35] to-[#1d2025] p-3 rounded-xl shadow-lg">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <IceCube className="w-6 h-6" />
                                        <p className="text-lg font-bold text-white">{pointsBalance.toLocaleString()}</p>
                                    </div>
                                    <p className="text-xs text-gray-400 mb-1">Уровень {gameLevelIndex + 1}</p>
                                    <p className="text-sm font-bold text-white mb-1">{LEVELS[gameLevelIndex].name}</p>
                                    <div className="w-full h-1.5 bg-[#43433b]/[0.6] rounded-full mb-1">
                                        <div className="progress-gradient h-1.5 rounded-full" style={{ width: `${calculateProgress()}%` }}></div>
                                    </div>
                                    <p className="text-xs text-gray-400">
                                        {calculateProgress().toFixed(1)}% до уровня {gameLevelIndex + 2}
                                    </p>
                                </div>

                                {/* Правая плитка: Энергия и доход за клик */}
                                <div className="flex-1 bg-gradient-to-r from-[#2a2e35] to-[#1d2025] p-3 rounded-xl shadow-lg">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <Energy className="w-6 h-6" />
                                        <p className="text-lg font-bold text-white">{energy}/{maxEnergy}</p>
                                    </div>
                                    <p className="text-xs text-gray-400 mb-1">Доход за клик: </p>
                                    <p className="text-lg font-bold text-white">+{pointsPerClick}</p>
                                    <button
                                        onClick={() => handleViewChange("boost")}
                                        className="w-full py-1.5 bg-[#f3ba2f] text-black font-bold rounded-lg shadow-lg hover:shadow-xl transition-shadow text-sm"
                                    >
                                        <Rocket size={16} className="inline-block mr-1" />
                                        Бустеры
                                    </button>
                                </div>
                            </div>

                            {/* Область анимации */}
                            <div className="px-4 mt-2 flex justify-center">
                                <div
                                    className="w-70 h-70 p- min-w-[280px] min-h-[280px]"
                                    onClick={handleInteraction}
                                    onTouchEnd={handleInteraction}
                                >
                                    <div className="w-full h-full flex justify-center items-center overflow-hidden relative">
                                        <section className="background">
                                            {renderAnimation()}
                                        </section>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Лидерборд */}
                {currentView === 'leaderboardtab' && <LeaderboardTab />}

                {/* Squads Page */}
                {currentView === 'squadspage' && <SquadsPage />}
            </div>

            {/* Меню */}
            <Navigation currentView={currentView} setCurrentView={setCurrentView} />

            {/* Анимация кликов */}
            {clicks.map((click) => (
                <div
                    key={click.id}
                    className="absolute text-5xl font-bold opacity-0 text-white pointer-events-none flex justify-center"
                    style={{
                        top: `${click.y - 42}px`,
                        left: `${click.x - 28}px`,
                        animation: `float 1s ease-out`
                    }}
                    onAnimationEnd={() => handleAnimationEnd(click.id)}
                >
                    {pointsPerClick}<IceCube className="w-12 h-12 mx-auto" />
                </div>
            ))}
        </div>
    );
}