'use client'

import React, { useState } from 'react';
import { useGameStore } from '@/utils/game-mechanics';
import { formatNumber, triggerHapticFeedback } from '@/utils/ui';
import { useToast } from '@/contexts/ToastContext';
import TopInfoSection from '@/components/TopInfoSection';
import IceCubes from '@/icons/IceCubes';
import Info from '@/icons/Info';
import Energy from '@/icons/Energy';

// Импорты для фона и анимаций
import './layout.css';
import styles from './stars.module.scss';
import styles2 from './stars2.module.scss';
import Animation from './Animation';
import Animation2 from './Animation2';
import Animation3 from './Animation3';

// Константы и функции для расчетов
const MAXIMUM_INACTIVE_TIME_FOR_MINE = 24 * 60 * 60 * 1000; // 24 часа в миллисекундах
const MINE_UPGRADE_BASE_PRICE = 100; // Базовая стоимость улучшения
const MINE_UPGRADE_COST_COEFFICIENT = 1.5; // Коэффициент увеличения стоимости
const MINE_UPGRADE_BASE_BENEFIT = 10; // Базовая выгода от улучшения
const MINE_UPGRADE_BENEFIT_COEFFICIENT = 1.2; // Коэффициент увеличения выгоды

// Функция для расчета стоимости улучшения шахты
const calculateMineUpgradeCost = (level: number): number => {
    return MINE_UPGRADE_BASE_PRICE * Math.pow(MINE_UPGRADE_COST_COEFFICIENT, level);
};

// Функция для расчета прибыли в час
const calculateProfitPerHour = (level: number): number => {
    return MINE_UPGRADE_BASE_BENEFIT * Math.pow(MINE_UPGRADE_BENEFIT_COEFFICIENT, level);
};

interface MineProps {
    setCurrentView: (view: string) => void;
}

export default function Mine({ setCurrentView }: MineProps) {
    const showToast = useToast();

    const {
        userTelegramInitData,
        pointsBalance,
        profitPerHour,
        mineLevelIndex,
        upgradeMineLevelIndex,
        gameLevelIndex,
        userTelegramId, // Используем userTelegramId
    } = useGameStore();
    const [isLoading, setIsLoading] = useState(false);

    const upgradeCost = calculateMineUpgradeCost(mineLevelIndex);
    const upgradeIncrease = calculateProfitPerHour(mineLevelIndex + 1) - calculateProfitPerHour(mineLevelIndex);

    const maxInactiveHours = MAXIMUM_INACTIVE_TIME_FOR_MINE / (60 * 60 * 1000);

    // Функция для отображения фона в зависимости от уровня
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

    // Функция для отображения анимации в зависимости от уровня
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

    const handleUpgrade = async () => {
        if (pointsBalance >= upgradeCost && !isLoading) {
            setIsLoading(true);
            try {
                triggerHapticFeedback(window);
                const response = await fetch('/api/upgrade/mine', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        initData: userTelegramInitData,
                    }),
                });

                if (!response.ok) {
                    throw new Error('Failed to upgrade mine');
                }

                const result = await response.json();

                console.log("Result from server:", result);

                // Update local state with the new values
                upgradeMineLevelIndex();

                showToast('Mine Upgrade Successful!', 'success');
            } catch (error) {
                console.error('Error upgrading mine:', error);
                showToast('Failed to upgrade mine. Please try again.', 'error');
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="bg-black flex justify-center h-screen overflow-hidden">
            <div className="w-full bg-black text-white h-full font-bold flex flex-col max-w-xl relative">
                {/* Шапка */}
                <TopInfoSection
                    isGamePage={false}
                    setCurrentView={setCurrentView}
                />

                {/* Основной контент */}
                <div className="flex-grow mt-4 bg-[#f3ba2f] rounded-t-[48px] relative top-glow overflow-y-auto">
                    {/* Фон в зависимости от уровня */}
                    {renderBackground()}

                    {/* Остальной контент страницы */}
                    <div className="px-4 pt-4 pb-36 relative z-10">
                        {/* Заголовок и описание */}
                        <div className="text-left mb-8">
                            <h1 className="text-lg text-white mb-1">Производство льда</h1>
                            <div className="text-xs text-white">
                                <p className="text-xs text-white-400 mt-1">
                                    Ваша шахта автоматически производит лед в течение <span className="text-white font-bold">{maxInactiveHours}х часов</span> после вашей последней активности.
                                </p>
                                <p className="text-xs text-white-400 mt-2">
                                    Улучшайте шахту, чтобы увеличить производство льда. Каждое улучшение повышает доход в час.
                                </p>
                            </div>
                        </div>

                        {/* Контейнер для анимации и плитки */}
                        <div className="flex space-x-4">
                            {/* Область анимации */}
                            <div className="w-70 h-70 p- min-w-[280px] min-h-[280px]">
                                <div className="w-full h-full flex justify-center items-center overflow-hidden relative">
                                    <section className="background">
                                        {renderAnimation()}
                                    </section>
                                </div>
                            </div>

                            {/* Плитка с информацией о доходе и улучшении */}
                            <div className="flex-1 bg-gradient-to-r from-[#2a2e35] to-[#1d2025] p-4 rounded-xl shadow-lg">
                                <h2 className="text-lg font-bold text-white mb-4">
                                    Ваш idPool #{userTelegramId || "unknown id"}
                                </h2>
                                <div className="flex items-center space-x-2 mb-4">
                                    <Energy className="w-6 h-6" />
                                    <p className="text-lg font-bold text-white">{Math.round(profitPerHour)}/час</p>
                                </div>
                                <div className="flex justify-between items-center mb-4">
                                    <p className="text-xs text-gray-400">Ваш сквад приносит:</p>
                                    <p className="text-sm font-bold text-white">{Math.round(profitPerHour * 0.2)}/час</p>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-xs text-gray-400">Увеличить доход:</p>
                                    <p className="text-sm font-bold text-white">+{Math.round(upgradeIncrease)}/час</p>
                                </div>
                            </div>
                        </div>

                        {/* Кнопка улучшения */}
                        <button
                            onClick={handleUpgrade}
                            disabled={pointsBalance < upgradeCost || isLoading}
                            className={`w-full py-3 bg-white text-black font-bold rounded-lg shadow-lg hover:shadow-xl transition-shadow mt-8 ${pointsBalance >= upgradeCost && !isLoading ? 'bg-[#f3ba2f]' : 'bg-gray-500 cursor-not-allowed'
                                }`}
                        >
                            {isLoading ? (
                                <div className="flex justify-center items-center">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                </div>
                            ) : (
                                'Улучшить шахту'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}