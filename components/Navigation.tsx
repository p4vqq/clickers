'use client';

import Image, { StaticImageData } from 'next/image';
import Mine from '@/icons/Mine';
import Friends from '@/icons/Friends';
import Coins from '@/icons/Coins';
import { iceToken } from '@/images';
import IceCube from '@/icons/IceCube';
import Rocket from '@/icons/Rocket';
import { FC } from 'react';
import { IconProps } from '@/utils/types';
import { triggerHapticFeedback } from '@/utils/ui';

type NavItem = {
    name: string;
    icon?: FC<IconProps> | null;
    image?: StaticImageData | null;
    view: string; // Используем view для управления состоянием
};

const navItems: NavItem[] = [
    { name: 'Game', icon: IceCube, view: 'game' },
    { name: 'Mine', icon: Mine, view: 'mine' },
    { name: 'Friends', icon: Friends, view: 'friends' },
    { name: 'Earn', icon: Coins, view: 'earn' },
    { name: 'Airdrop', image: iceToken, view: 'airdrop' },
    { name: 'Leaderboard', icon: Rocket, view: 'leaderboardtab' },
    { name: 'Squads', icon: Rocket, view: 'squadspage' },
];

interface NavigationProps {
    currentView: string;
    setCurrentView: (view: string) => void;
}

export default function Navigation({ currentView, setCurrentView }: NavigationProps) {
    const handleViewChange = (view: string) => {
        console.log('Attempting to change view to:', view);
        if (typeof setCurrentView === 'function') {
            try {
                triggerHapticFeedback(window);
                setCurrentView(view); // Обновляем текущий view
                console.log('View change successful');
            } catch (error) {
                console.error('Error occurred while changing view:', error);
            }
        } else {
            console.error('setCurrentView is not a function:', setCurrentView);
        }
    };

    return (
        <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-xl bg-white flex justify-around items-center z-40 text-xs border-t border-[#e0e0e0] max-h-20 rounded-t-lg">
            {navItems.map((item) => (
                <button
                    key={item.name}
                    onClick={() => handleViewChange(item.view)}
                    className="flex-1"
                >
                    <div className={`flex flex-col items-center justify-center ${currentView === item.view ? 'text-[#1a1a1a] bg-[#f0f0f0]' : 'text-[#333333]'} h-14 m-1 p-2 rounded-md`}>
                        <div className="w-6 h-6 relative">
                            {item.image && (
                                <div className="w-full h-full relative">
                                    <Image
                                        src={item.image}
                                        alt={item.name}
                                        width={24}
                                        height={24}
                                    />
                                </div>
                            )}
                            {item.icon && <item.icon className="w-full h-full" />}
                        </div>
                        <p className="mt-1 text-[#1a1a1a]">{item.name}</p>
                    </div>
                </button>
            ))}
        </div>
    );
}