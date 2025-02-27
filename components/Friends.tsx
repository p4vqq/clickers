'use client'

import React, { useState, useCallback, useEffect } from 'react';
import Image, { StaticImageData } from 'next/image';
import { useGameStore } from '@/utils/game-mechanics';
import { formatNumber, triggerHapticFeedback } from '@/utils/ui';
import { REFERRAL_BONUS_BASE, REFERRAL_BONUS_PREMIUM, LEVELS } from '@/utils/consts';
import { getUserTelegramId } from '@/utils/user';
import { useToast } from '@/contexts/ToastContext';
import { initUtils } from '@telegram-apps/sdk';
import TopInfoSection from '@/components/TopInfoSection';
import IceCubes from '@/icons/IceCubes';
import Settings from '@/icons/Settings';

// Импорты для фона и анимаций
import './layout.css';
import styles from './stars.module.scss';
import styles2 from './stars2.module.scss';
import tapStyles from './Animation.module.scss';
import Animation from './Animation';
import Animation2 from './Animation2';
import Animation3 from './Animation3';

interface Referral {
  id: string;
  telegramId: string;
  name: string | null;
  points: number;
  referralPointsEarned: number;
  levelName: string;
  levelImage: StaticImageData;
}

export default function Friends() {
  const showToast = useToast();

  const { userTelegramInitData, gameLevelIndex, pointsBalance, energy, maxEnergy, userTelegramName, profitPerHour } = useGameStore();
  const [copyButtonText, setCopyButtonText] = useState('Copy');
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [referralCount, setReferralCount] = useState(0);
  const [isLoadingReferrals, setIsLoadingReferrals] = useState(true);

  // Состояние для управления текущей вкладкой
  const [currentView, setCurrentView] = useState('default');

  // Обработчик изменения вкладки
  useEffect(() => {
    if (currentView === 'Cash') {
      console.log('Переход на вкладку Cash');
      // Логика для перехода на вкладку "Cash"
    } else if (currentView === 'settings') {
      console.log('Переход на вкладку Settings');
      // Логика для перехода на вкладку "Settings"
    }
  }, [currentView]);

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

  // Загрузка рефералов
  const fetchReferrals = useCallback(async () => {
    setIsLoadingReferrals(true);
    try {
      const response = await fetch(`/api/user/referrals?initData=${encodeURIComponent(userTelegramInitData)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch referrals');
      }
      const data = await response.json();
      setReferrals(data.referrals);
      setReferralCount(data.referralCount);
    } catch (error) {
      console.error('Error fetching referrals:', error);
      showToast('Failed to fetch referrals. Please try again later.', 'error');
    } finally {
      setIsLoadingReferrals(false);
    }
  }, [userTelegramInitData, showToast]);

  useEffect(() => {
    fetchReferrals();
  }, [fetchReferrals]);

  // Копирование ссылки для приглашения
  const handleCopyInviteLink = useCallback(() => {
    if (!navigator.clipboard) {
      showToast('Clipboard not supported', 'error');
      return;
    }

    navigator.clipboard
      .writeText(process.env.NEXT_PUBLIC_BOT_USERNAME ? `https://t.me/${process.env.NEXT_PUBLIC_BOT_USERNAME}/${process.env.NEXT_PUBLIC_APP_URL_SHORT_NAME}?startapp=kentId${getUserTelegramId(userTelegramInitData) || ''}` : 'https://t.me/icetongame_bot')
      .then(() => {
        setCopyButtonText('Copied!');
        showToast('Invite link copied to clipboard!', 'success');
        setTimeout(() => setCopyButtonText('Copy'), 2000);
      })
      .catch((err) => {
        console.error('Failed to copy text: ', err);
        showToast('Failed to copy link. Please try again.', 'error');
      });
  }, [userTelegramInitData, showToast]);

  // Приглашение друга через Telegram
  const handleInviteFriend = useCallback(() => {
    const botUsername = process.env.NEXT_PUBLIC_BOT_USERNAME;
    const userTelegramId = getUserTelegramId(userTelegramInitData);

    const inviteLink = botUsername
      ? `https://t.me/${process.env.NEXT_PUBLIC_BOT_USERNAME}/${process.env.NEXT_PUBLIC_APP_URL_SHORT_NAME}?startapp=kentId${userTelegramId || ''}`
      : 'https://t.me/icetongame_bot';

    const shareText = `🎮 Присоединяйся ко мне в TON ICE: нажимай, зарабатывай и выигрывай! iTON🏆🚀 Давайте играть и зарабатывать вместе!`;

    try {
      if (window.Telegram?.WebApp?.HapticFeedback) {
        triggerHapticFeedback(window);
      } else {
        console.warn('HapticFeedback is not supported');
      }

      const utils = initUtils();
      const fullUrl = `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent(shareText)}`;
      utils.openTelegramLink(fullUrl);
    } catch (error) {
      console.error('Error opening Telegram link:', error);
      showToast('Failed to open sharing dialog. Please try again.', 'error');

      // Fallback: copy the invite link to clipboard
      navigator.clipboard.writeText(inviteLink)
        .then(() => showToast('Invite link copied to clipboard instead', 'success'))
        .catch(() => showToast('Failed to share or copy invite link', 'error'));
    }
  }, [userTelegramInitData, showToast]);

  return (
    <div className="bg-black flex justify-center h-screen overflow-hidden">
      <div className="w-full bg-black text-white h-full font-bold flex flex-col max-w-xl relative">
        {/* Шапка */}
        <div className="text-left mb-8">
          <h1 className="text-lg text-white mb-1"></h1>
          <div className="text-xs text-white">
            <p></p>
            <p className="text-xs text-white-400 mt-1"></p>
          </div>
        </div>

        {/* TopInfoSection с кнопками */}
        <TopInfoSection
          isGamePage={true} // Установлено false, так как это не страница игры
          setCurrentView={setCurrentView} // Передаем функцию для смены вкладок
        />

        {/* Основной контент */}
        <div className="flex-grow mt-4 bg-[#f3ba2f] rounded-t-[48px] relative top-glow overflow-y-auto">
          {/* Фон в зависимости от уровня */}
          {renderBackground()}

          {/* Остальной контент страницы */}
          <div className="px-4 pt-4 pb-36 relative z-10">
            {/* Верхнее меню */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">👫</span>
                <span className="text-2xl">🠒</span>
                <span className="text-2xl">📱</span>
              </div>
            </div>

            {/* Заголовок и описание */}
            <div className="text-left mb-8">
              <h1 className="text-lg text-white mb-1">Приглашай друзей</h1>
              <div className="text-xs text-white">
                <p></p>
                <p className="text-xs text-white-400 mt-1">Распространяй приложение среди друзей. Приглашай их присоединиться к Iceton и зарабатывай % от их майнинга</p>
              </div>
            </div>

            {/* Плитки с бонусами */}
            <div className="flex space-x-4 mb-8">
              <div className="flex-1 bg-gradient-to-r from-[#2a2e35] to-[#1d2025] p-4 rounded-xl shadow-lg">
                <p className="text-xs text-gray-400 mb-2">Зарабатывай</p>
                <p className="text-xl font-bold text-white mb-2">+{formatNumber(REFERRAL_BONUS_BASE)}</p>
                <p className="text-xs text-gray-400">за обычного друга</p>
              </div>
              <div className="flex-1 bg-gradient-to-r from-[#2a2e35] to-[#1d2025] p-4 rounded-xl shadow-lg">
                <p className="text-xs text-gray-400 mb-2">Зарабатывай</p>
                <p className="text-xl font-bold text-white mb-2">+{formatNumber(REFERRAL_BONUS_PREMIUM)}</p>
                <p className="text-xs text-gray-400">за друга с премиум подпиской</p>
              </div>
            </div>

            {/* Второй блок с друзьями */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">👫</span>
                <span className="text-2xl">🠒</span>
                <span className="text-2xl">🕶</span>
              </div>
            </div>

            <div className="text-left mb-8">
              <p className="text-sm text-white">Превращай друзей в трейдеров и зарабатывай TON</p>
            </div>

            {/* Плитки с доходами */}
            <div className="flex space-x-4 mb-8">
              <div className="flex-1 bg-gradient-to-r from-[#2a2e35] to-[#1d2025] p-4 rounded-xl shadow-lg">
                <p className="text-xs text-gray-400 mb-2">Доход</p>
                <p className="text-xl font-bold text-white mb-2">20%</p>
                <p className="text-xs text-gray-400">от их друзей и торговой комиссии</p>
              </div>
              <div className="flex-1 bg-gradient-to-r from-[#2a2e35] to-[#1d2025] p-4 rounded-xl shadow-lg">
                <p className="text-xs text-gray-400 mb-2">Доход</p>
                <p className="text-xl font-bold text-white mb-2">2.5%</p>
                <p className="text-xs text-gray-400">от их друзей и торговой комиссии</p>
              </div>
            </div>

            {/* Плитка с кнопкой "Как это работает?" */}
            <div className="bg-gradient-to-r from-[#2a2e35] to-[#1d2025] p-4 rounded-xl shadow-lg mb-8">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">📚</span>
                <p className="text-sm font-bold text-white">Как это работает?</p>
              </div>
              <p className="text-xs text-gray-400 mt-2">Условия реферальной программы</p>
            </div>

            {/* Кнопка "Пригласить друга" */}
            <button
              onClick={handleInviteFriend}
              className="w-full py-3 bg-white text-black font-bold rounded-lg shadow-lg hover:shadow-xl transition-shadow mb-8"
            >
              Пригласить друга
            </button>

            {/* Список друзей */}
            <div className="mb-8">
              <h2 className="text-lg font-bold text-white mb-4">Друзья, которых вы пригласили</h2>
              {isLoadingReferrals ? (
                <div className="space-y-2 animate-pulse">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="flex justify-between items-center bg-[#2a2e35] rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-700 rounded w-24"></div>
                          <div className="h-3 bg-gray-700 rounded w-20"></div>
                        </div>
                      </div>
                      <div className="h-4 bg-gray-700 rounded w-16"></div>
                    </div>
                  ))}
                </div>
              ) : referrals.length > 0 ? (
                <ul className="space-y-2">
                  {referrals.map((referral: Referral) => (
                    <li key={referral.id} className="flex justify-between items-center bg-[#2a2e35] rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <Image src={referral.levelImage} alt={referral.levelName} width={48} height={48} className="rounded-full" />
                        <div>
                          <span className="font-medium">{referral.name || `User ${referral.telegramId}`}</span>
                          <p className="text-sm text-gray-400">{referral.levelName} • {formatNumber(referral.points)} points</p>
                        </div>
                      </div>
                      <span className="text-[#f3ba2f]">+{formatNumber(referral.referralPointsEarned)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center text-gray-400 bg-[#2a2e35] rounded-lg p-4">
                  Вы еще никого не пригласили
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}