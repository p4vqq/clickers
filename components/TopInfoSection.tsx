'use client'

import { useToast } from '@/contexts/ToastContext';
import IceCubes from '@/icons/IceCubes';
import Settings from '@/icons/Settings';
import { LEVELS } from '@/utils/consts';
import { useGameStore } from '@/utils/game-mechanics';
import { formatNumber, triggerHapticFeedback } from '@/utils/ui';
import Image from 'next/image';

// Импортируем иконку wallet.png
import walletIcon from '@/images/wallet.png'; // Укажите правильный путь к файлу

interface TopInfoSectionProps {
    isGamePage?: boolean;
    setCurrentView: (view: string) => void;
}

export default function TopInfoSection({ isGamePage = false, setCurrentView }: TopInfoSectionProps) {
    const showToast = useToast();

    // Получаем данные из хранилища
    const {
        userTelegramName,
        gameLevelIndex,
        profitPerHour
    } = useGameStore();

    const handleSettingsClick = () => {
        triggerHapticFeedback(window);
        setCurrentView('settings');
    };

    // Обработчик клика для перехода на вкладку "Cash"
    const handleSyncClick = () => {
        triggerHapticFeedback(window);
        setCurrentView('Cash'); // Переход на вкладку "Cash"
    };

    return (
        <div className="px-4 z-10 pt-8 mt-8"> {/* Увеличили отступ сверху (pt-8) */}
            <div className="flex items-center justify-between space-x-4">
                <div className="flex items-center w-1/3">
                    <div className="flex items-center  space-x-2">
                        <div className="p-1 rounded-lg bg-[#1d2025]">
                            <Image src={LEVELS[gameLevelIndex].smallImage} width={24} height={24} alt="Small Level Icon" />
                        </div>
                        <div>
                            <p className="text-sm">{userTelegramName}</p>
                        </div>
                    </div>
                </div>
                <div className={`flex items-center w-fit border-[#43433b] rounded-full ${isGamePage ? 'px-4' : 'px-8'} py-[2px] mt-4 max-w-64`}>
                    {
                        isGamePage &&
                        <>
                            <div className="flex-1 text-center cursor-pointer" onClick={handleSyncClick}>
                                {/* Заменяем текст "Sync" на иконку wallet.png */}
                                <div className="flex items-center justify-center space-x-1">
                                    <Image
                                        src={walletIcon}
                                        alt="Wallet"
                                        width={15} // Настройте размер иконки
                                        height={15}
                                        className="w-6 h-6" // Дополнительные стили, если нужно
                                    />
                                </div>
                            </div>
                            <div className="h-[32px] w-[2px] bg-[#43433b] mx-2"></div>
                        </>
                    }
                    <div className="flex-1 text-center">
                        <p className="text-xs text-[#85827d] font-medium whitespace-nowrap overflow-hidden text-ellipsis">Лед в час</p>
                        <div className="flex items-center justify-center space-x-1">
                            <IceCubes size={20} />
                            <p className="text-sm">+{formatNumber(profitPerHour)}</p>
                        </div>
                    </div>
                    {
                        isGamePage &&
                        <>
                            <div className="h-[32px] w-[2px] bg-[#43433b] mx-2"></div>
                            <button
                                onClick={handleSettingsClick}
                                className="flex-1 flex items-center justify-center text-white focus:outline-none"
                            >
                                <Settings className="w-6 h-6" /> {/* Adjust size as needed */}
                            </button>
                        </>
                    }
                </div>
            </div>
        </div>
    );
}