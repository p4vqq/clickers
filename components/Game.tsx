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

interface GameProps {
    currentView: string;
    setCurrentView: (view: string) => void;
}




export default function Game({ currentView, setCurrentView }: GameProps) {
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
            default:
                return <Animation />;
        }
    };


    return (
        <div className="bg-black flex justify-center min-h-screen">
            <div className="w-full bg-black text-white h-screen font-bold flex flex-col max-w-xl">
                <TopInfoSection isGamePage={true} setCurrentView={setCurrentView} />

                <div className="flex-grow mt-4 bg-[#f3ba2f] rounded-t-[48px] relative top-glow z-0">
                    <div className="mt-[2px] rounded-t-[46px] h-full overflow-y-auto no-scrollbar relative">
                        {/* Уровневые блоки */}
                        {gameLevelIndex === 0 && (
                            <div className="flex-grow relative">
                                <div className={styles.starsBackground}>
                                    <div className={styles.stars}></div>
                                    <div className={styles.stars2}></div>
                                    <div className={styles.stars3}></div>
                                </div>
                            </div>
                        )}
                        {gameLevelIndex === 1 && (
                            <div className={styles.spaceBackground}>
                                <div className={styles.planets}></div>
                                <div className={styles.comets}></div>
                            </div>
                        )}
                        {gameLevelIndex === 2 && (
                            <div className={styles2.starsBackground1}>
                                <div className={styles2.stars_lv3}></div>
                                <div className={styles2.stars2_lv3}></div>
                                <div className={styles2.stars3_lv3}></div>
                            </div>
                        )}

                        <div className="px-4 pt-1 pb-24 relative z-10">
                            {/* Основной контент игры */}
                            <div className="px-4 mt-4 flex justify-center">
                                <div className="px-4 py-2 flex items-center space-x-2">
                                    <IceCubes className="w-12 h-12 mx-auto" />
                                    <p className="text-4xl text-white" suppressHydrationWarning >{Math.floor(pointsBalance).toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="flex justify-center gap-2">
                                <p>{LEVELS[gameLevelIndex].name}</p>
                                <p className="text-[#95908a]" >&#8226;</p>
                                <p>{gameLevelIndex + 1} <span className="text-[#95908a]">/ {LEVELS.length}</span></p>
                            </div>

                            <div className="px-4 mt-4 flex justify-center">
                                <div
                                    className="w-80 h-80 p-4"
                                    onClick={handleInteraction}
                                    onTouchEnd={handleInteraction}
                                >
                                    <div className="w-full h-full display: flex justify-content overflow-hidden relative">
                                        <section className="background">
                                            {renderAnimation()}
                                        </section>
                                    </div>
                                </div>
                            </div>


                            <div className="flex justify-between px-4 mt-4">
                                <p className="flex justify-center items-center gap-1">
                                    <Image src={lightning} alt="Exchange" width={40} height={40} />
                                    <span className="flex flex-col">
                                        <span className="text-xl font-bold">{energy}</span>
                                        <span className="text-base font-medium">/ {maxEnergy}</span>
                                    </span>
                                </p>
                                <button onClick={() => handleViewChange("boost")} className="flex justify-center items-center gap-1">
                                    <Rocket size={40} />
                                    <span className="text-xl">Boost</span>
                                </button>
                            </div>

                            <div className="w-full px-4 text-sm mt-2">
                                <div className="flex items-center mt-1 border-2 border-[#43433b] rounded-full">
                                    <div className="w-full h-3 bg-[#43433b]/[0.6] rounded-full">
                                        <div className="progress-gradient h-3 rounded-full" style={{ width: `${calculateProgress()}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

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