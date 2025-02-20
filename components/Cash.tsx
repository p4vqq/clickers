'use client'

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { iceToken, tonWallet, toncoin, usdt } from '@/images';
import { useTonConnectUI } from '@tonconnect/ui-react';
import Copy from '@/icons/Copy';
import Cross from '@/icons/Cross';
import Wallet from '@/icons/Wallet';
import { useGameStore } from '@/utils/game-mechanics';
import { useToast } from '@/contexts/ToastContext';
import { Address, TonClient } from '@ton/ton'; // Импортируем TonClient и Address
import { triggerHapticFeedback } from '@/utils/ui';
import Angle from '@/icons/Angle';

export default function Cash() {
    const [tonConnectUI] = useTonConnectUI();
    const { tonWalletAddress, setTonWalletAddress, userTelegramInitData } = useGameStore();
    const showToast = useToast();
    const [copied, setCopied] = useState(false);
    const [isProcessingWallet, setIsProcessingWallet] = useState(false);
    const [amount, setAmount] = useState<string>('');
    const [isConnecting, setIsConnecting] = useState(false);
    const [balances, setBalances] = useState({ ton: '0.00', usdt: '0.00' }); // Состояние для балансов

    // Функция для получения баланса TON кошелька
    const fetchTonBalance = async (address: string) => {
        try {
            const client = new TonClient({ endpoint: 'https://toncenter.com/api/v2/jsonRPC' }); // Используем публичный RPC
            const walletAddress = Address.parse(address);
            const balance = await client.getBalance(walletAddress);

            // Конвертируем баланс из наноTON в TON (1 TON = 1e9 наноTON)
            const tonBalance = (Number(balance) / 1e9).toFixed(2);
            setBalances((prev) => ({ ...prev, ton: tonBalance }));
        } catch (error) {
            console.error('Error fetching TON balance:', error);
            showToast('Не удалось загрузить баланс TON. Попробуйте позже.', 'error');
        }
    };

    // Загружаем баланс TON при изменении адреса кошелька
    useEffect(() => {
        if (tonWalletAddress) {
            fetchTonBalance(tonWalletAddress);
        }
    }, [tonWalletAddress]);

    const formatAddress = (address: string) => {
        const tempAddress = Address.parse(address).toString();
        return `${tempAddress.slice(0, 4)}...${tempAddress.slice(-4)}`;
    };

    const copyToClipboard = () => {
        if (tonWalletAddress) {
            triggerHapticFeedback(window);
            navigator.clipboard.writeText(tonWalletAddress);
            setCopied(true);
            showToast("Адрес скопирован!", "success");
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleWalletAction = async () => {
        triggerHapticFeedback(window);
        if (tonWalletAddress) {
            await tonConnectUI.disconnect();
        } else {
            setIsConnecting(true);
            await tonConnectUI.openModal();
        }
    };

    const saveWalletAddress = async (address: string): Promise<boolean> => {
        try {
            const response = await fetch('/api/wallet/connect', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    initData: userTelegramInitData,
                    walletAddress: address,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to save wallet address');
            }

            const data = await response.json();
            setTonWalletAddress(data.walletAddress);
            return true;
        } catch (error) {
            console.error('Error saving wallet address:', error);
            return false;
        } finally {
            setIsProcessingWallet(false);
        }
    };

    const disconnectWallet = async () => {
        try {
            const response = await fetch('/api/wallet/disconnect', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    initData: userTelegramInitData,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to disconnect wallet');
            }
        } catch (error) {
            console.error('Error disconnecting wallet:', error);
            throw error;
        }
    };

    useEffect(() => {
        const unsubscribe = tonConnectUI.onStatusChange(async (wallet) => {
            if (wallet && isConnecting) {
                await saveWalletAddress(wallet.account.address);
            } else if (!wallet && !isConnecting) {
                await disconnectWallet();
                setTonWalletAddress(null);
            }
        });

        return () => {
            unsubscribe();
        };
    }, [tonConnectUI, saveWalletAddress, disconnectWallet, isConnecting]);

    const handlePayout = async () => {
        if (!tonWalletAddress || !amount) {
            showToast('Заполните все поля!', 'error');
            return;
        }

        try {
            const response = await fetch('/api/make-ton-payout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_address: tonWalletAddress, amount: parseFloat(amount) }),
            });

            if (response.ok) {
                showToast('Выплата успешно отправлена!', 'success');
            } else {
                showToast('Не удалось отправить выплату. Попробуйте позже.', 'error');
            }
        } catch (error) {
            console.error('Ошибка при отправке выплаты:', error);
            showToast('Произошла ошибка. Попробуйте позже.', 'error');
        }
    };

    return (
        <div className="bg-black flex justify-center min-h-screen">
            <div className="w-full bg-black text-white font-bold flex flex-col max-w-xl">
                <div className="flex-grow mt-4 bg-[#f3ba2f] rounded-t-[48px] relative top-glow z-0">
                    <div className="mt-[2px] bg-[#1d2025] rounded-t-[46px] h-full overflow-y-auto no-scrollbar">
                        <div className="px-4 pt-1 pb-24">
                            <div className="relative mt-4">
                                <div className="flex justify-center mb-4">
                                    <Image src={iceToken} alt="Ice Token" width={96} height={96} className="rounded-lg mr-2" />
                                </div>
                                <h1 className="text-2xl text-center mb-4">Вывод средств</h1>
                                <p className="text-gray-300 text-center mb-4 font-normal">Здесь вы можете запросить выплату на свой TON кошелек.</p>
                                <h2 className="text-base mt-8 mb-4">Wallet</h2>

                                {isProcessingWallet ? (
                                    <div className="flex justify-between items-center bg-[#272a2f] rounded-lg p-4 w-full">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 bg-gray-300 rounded-lg animate-pulse mr-2"></div>
                                            <div className="flex flex-col">
                                                <div className="w-32 h-4 bg-gray-300 rounded animate-pulse"></div>
                                            </div>
                                        </div>
                                        <div className="w-20 h-8 bg-gray-300 rounded animate-pulse"></div>
                                    </div>
                                ) : !tonWalletAddress ? (
                                    <button
                                        onClick={handleWalletAction}
                                        className="flex justify-between items-center bg-[#319ee0] rounded-lg p-4 cursor-pointer w-full"
                                        disabled={isProcessingWallet}
                                    >
                                        <div className="flex items-center">
                                            <Image src={tonWallet} alt="Ton wallet" width={40} height={40} className="rounded-lg mr-2" />
                                            <div className="flex flex-col">
                                                <span className="font-medium">Connect your TON wallet</span>
                                            </div>
                                        </div>
                                        <Angle size={42} className="text-white" />
                                    </button>
                                ) : (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleWalletAction}
                                            className="w-12 h-12 bg-[#33363b] rounded-lg text-white font-bold flex items-center justify-center"
                                            disabled={isProcessingWallet}
                                        >
                                            <Cross className="text-[#8b8e93]" />
                                        </button>
                                        <button
                                            onClick={copyToClipboard}
                                            className="flex-grow justify-between py-3 bg-[#33363b] rounded-lg text-white font-medium"
                                            disabled={isProcessingWallet}
                                        >
                                            <div className="w-full flex justify-between px-4 items-center">
                                                <div className="flex items-center gap-2">
                                                    <Wallet className="text-[#8b8e93]" />
                                                    <span>{formatAddress(tonWalletAddress)}</span>
                                                </div>
                                                <div>
                                                    <Copy className="text-[#8b8e93]" />
                                                </div>
                                            </div>
                                        </button>
                                    </div>
                                )}

                                {/* Блок с балансами */}
                                {tonWalletAddress && (
                                    <div className="mt-6 space-y-2">
                                        <div className="flex items-center justify-between bg-[#272a2f] rounded-lg p-4">
                                            <div className="flex items-center gap-2">
                                                <Image src={toncoin} alt="TON" width={24} height={24} className="rounded-lg" />
                                                <span className="font-medium">TON</span>
                                            </div>
                                            <span className="text-gray-400">{balances.ton} TON</span>
                                        </div>
                                        <div className="flex items-center justify-between bg-[#272a2f] rounded-lg p-4">
                                            <div className="flex items-center gap-2">
                                                <Image src={usdt} alt="USDT" width={24} height={24} className="rounded-lg" />
                                                <span className="font-medium">USDT</span>
                                            </div>
                                            <span className="text-gray-400">{balances.usdt} USDT</span>
                                        </div>
                                    </div>
                                )}

                                <h2 className="text-base mt-8 mb-4">Запросить выплату</h2>
                                <div className="space-y-2">
                                    <div className="w-full flex justify-between items-center bg-[#272a2f] rounded-lg p-4">
                                        <div className="flex items-center gap-2">
                                            <Image src={toncoin} alt="TON" width={40} height={40} className="rounded-lg" />
                                            <span className="font-medium text-gray-400">{balances.ton} TON</span>
                                        </div>
                                        <div className="flex items-center gap-2 flex-grow justify-end">
                                            <div className="relative w-full max-w-[200px]">
                                                <input
                                                    type="number"
                                                    step="0.001"
                                                    value={amount}
                                                    onChange={(e) => setAmount(e.target.value)}
                                                    placeholder="0.00"
                                                    className="w-full bg-transparent text-right text-white font-sans text-2xl font-bold focus:outline-none placeholder:text-gray-400 caret-blue-500 appearance-none"
                                                />
                                                <div className="absolute inset-y-0 right-0 w-px bg-blue-500 animate-blink" />
                                            </div>
                                            <button
                                                onClick={() => setAmount(balances.ton)} // Вставляем доступный баланс TON
                                                className="text-sm text-blue-500 hover:text-blue-400 font-medium"
                                            >
                                                MAX
                                            </button>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handlePayout}
                                        disabled={!tonWalletAddress || !amount}
                                        className="w-full bg-blue-500 text-white font-medium py-3 rounded-lg disabled:opacity-50 mt-4"
                                    >
                                        Вывести средства
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}