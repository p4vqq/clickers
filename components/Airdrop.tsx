// components/Airdrop.tsx

/**
 * This project was developed by Nikandr Surkov.
 * You may not use this code if you purchased it from any source other than the official website https://nikandr.com.
 * If you purchased it from the official website, you may use it for your own projects,
 * but you may not resell it or publish it publicly.
 * 
 * Website: https://nikandr.com
 * YouTube: https://www.youtube.com/@NikandrSurkov
 * Telegram: https://t.me/nikandr_s
 * Telegram channel for news/updates: https://t.me/clicker_game_news
 * GitHub: https://github.com/nikandr-surkov
 */

'use client'

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { iceToken, paidTrophy1, tonWallet } from '@/images';
import { useTonConnectUI } from '@tonconnect/ui-react';
import Angle from '@/icons/Angle';
import Copy from '@/icons/Copy';
import Cross from '@/icons/Cross';
import Wallet from '@/icons/Wallet';
import { useGameStore } from '@/utils/game-mechanics';
import { useToast } from '@/contexts/ToastContext';
import IceCube from '@/icons/IceCube';
import { Address } from "@ton/core";
import { triggerHapticFeedback } from '@/utils/ui';
import OnchainTaskPopup from './popups/OnchainTaskPopup';

interface OnchainTask {
    id: string;
    smartContractAddress: string;
    price: string;
    collectionMetadata: {
        name: string;
        description: string;
        image: string;
    };
    itemMetadata: any;
    points: number;
    isActive: boolean;
    isCompleted: boolean;
}

export default function Airdrop() {
    const [tonConnectUI] = useTonConnectUI();
    const { tonWalletAddress, setTonWalletAddress, userTelegramInitData } = useGameStore();
    const [copied, setCopied] = useState(false);
    const [isProcessingWallet, setIsProcessingWallet] = useState(false);
    const [isLoadingTasks, setIsLoadingTasks] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const showToast = useToast();
    const [onchainTasks, setOnchainTasks] = useState<OnchainTask[]>([]);
    const [selectedOnchainTask, setSelectedOnchainTask] = useState<OnchainTask | null>(null);

    useEffect(() => {
        fetchOnchainTasks();
    }, []);

    const fetchOnchainTasks = async () => {
        try {
            setIsLoadingTasks(true);
            const response = await fetch(`/api/onchain-tasks?initData=${encodeURIComponent(userTelegramInitData)}`);
            if (!response.ok) {
                throw new Error('Failed to fetch onchain tasks');
            }
            const data = await response.json();
            setOnchainTasks(data);
        } catch (error) {
            console.error('Error fetching onchain tasks:', error);
            showToast("Failed to load onchain tasks", "error");
        } finally {
            setIsLoadingTasks(false);
        }
    };

    const handleWalletConnection = useCallback(async (address: string) => {
        setIsProcessingWallet(true);
        try {
            const success = await saveWalletAddress(address);
            if (!success) {
                if (tonConnectUI.account?.address) {
                    await tonConnectUI.disconnect();
                }
                showToast("Failed to save wallet address. Please try connecting again.", "error");
            } else {
                showToast("Wallet connected successfully!", "success");
            }
        } catch (error) {
            console.error('Error connecting wallet:', error);
            showToast("An error occurred while connecting the wallet.", "error");
        } finally {
            setIsProcessingWallet(false);
            setIsConnecting(false);
        }
    }, [tonConnectUI, showToast]);

    const handleWalletDisconnection = useCallback(async () => {
        setIsProcessingWallet(true);
        try {
            await disconnectWallet();
            setTonWalletAddress(null);
            showToast("Wallet disconnected successfully!", "success");
        } catch (error) {
            console.error('Error disconnecting wallet:', error);
            showToast("An error occurred while disconnecting the wallet.", "error");
        } finally {
            setIsProcessingWallet(false);
        }
    }, [setTonWalletAddress, showToast]);

    useEffect(() => {
        const unsubscribe = tonConnectUI.onStatusChange(async (wallet) => {
            if (wallet && isConnecting) {
                await handleWalletConnection(wallet.account.address);
            } else if (!wallet && !isConnecting) {
                await handleWalletDisconnection();
            }
        });

        return () => {
            unsubscribe();
        };
    }, [tonConnectUI, handleWalletConnection, handleWalletDisconnection, isConnecting]);

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

    const handleWalletAction = async () => {
        triggerHapticFeedback(window);
        if (tonConnectUI.account?.address) {
            await tonConnectUI.disconnect();
        } else {
            setIsConnecting(true);
            await tonConnectUI.openModal();
        }
    };

    const formatAddress = (address: string) => {
        const tempAddress = Address.parse(address).toString();
        return `${tempAddress.slice(0, 4)}...${tempAddress.slice(-4)}`;
    };

    const copyToClipboard = () => {
        if (tonWalletAddress) {
            triggerHapticFeedback(window);
            navigator.clipboard.writeText(tonWalletAddress);
            setCopied(true);
            showToast("Address copied to clipboard!", "success");
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleOnchainTaskClick = (task: OnchainTask) => {
        if (!task.isCompleted) {
            triggerHapticFeedback(window);
            setSelectedOnchainTask(task);
        }
    };

    const handleTaskUpdate = useCallback((updatedTask: OnchainTask) => {
        setOnchainTasks(prevTasks =>
            prevTasks.map(t =>
                t.id === updatedTask.id ? updatedTask : t
            )
        );
    }, []);

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
                                <h1 className="text-2xl text-center mb-4">Airdrop Задания</h1>
                                <p className="text-gray-300 text-center mb-4 font-normal">Ниже приведен список заданий. Выполните их, чтобы получить право на участие в Airdrop</p>
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
                                <h2 className="text-base mt-8 mb-4">Задания</h2>
                                <div className="space-y-2">
                                    {
                                        isLoadingTasks ?
                                            (
                                                [...Array(3)].map((_, index) => (
                                                    <div
                                                        key={index}
                                                        className="w-full flex justify-between items-center bg-[#272a2f] rounded-lg p-4"
                                                    >
                                                        <div className="flex items-center">
                                                            <div className="w-10 h-10 bg-gray-700 rounded-lg mr-2 animate-pulse" />
                                                            <div className="flex flex-col gap-2">
                                                                <div className="w-32 h-4 bg-gray-700 rounded animate-pulse" />
                                                                <div className="flex items-center gap-1">
                                                                    <div className="w-6 h-6 bg-gray-700 rounded animate-pulse" />
                                                                    <div className="w-16 h-4 bg-gray-700 rounded animate-pulse" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="w-16 h-4 bg-gray-700 rounded animate-pulse" />
                                                    </div>
                                                ))
                                            )
                                            :
                                            (
                                                onchainTasks.map((task) => (
                                                    <button
                                                        key={task.id}
                                                        className="w-full flex justify-between items-center bg-[#272a2f] rounded-lg p-4"
                                                        onClick={() => handleOnchainTaskClick(task)}
                                                    >
                                                        <div className="flex items-center">
                                                            <Image
                                                                src={task.collectionMetadata.image}
                                                                alt={task.collectionMetadata.name}
                                                                width={40}
                                                                height={40}
                                                                className="rounded-lg mr-2"
                                                            />
                                                            <div className="flex flex-col">
                                                                <span className="font-medium">{task.collectionMetadata.name}</span>
                                                                <div className="flex items-center">
                                                                    <IceCube className="w-6 h-6 mr-1" />
                                                                    <span className="text-white">+{task.points}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {task.isCompleted ? (
                                                            <svg
                                                                className="w-6 h-6 text-green-500"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M5 13l4 4L19 7"
                                                                />
                                                            </svg>
                                                        ) : (
                                                            <span>{formatTON(task.price)} TON</span>
                                                        )}
                                                    </button>
                                                ))
                                            )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {selectedOnchainTask && (
                <OnchainTaskPopup
                    task={selectedOnchainTask}
                    onClose={() => setSelectedOnchainTask(null)}
                    onUpdate={handleTaskUpdate}
                />
            )}
        </div>
    );
}

// Helper function to format TON amount
function formatTON(nanoTON: string): string {
    return (parseInt(nanoTON) / 1e9).toFixed(2);
}