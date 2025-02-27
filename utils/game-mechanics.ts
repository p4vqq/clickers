import { create } from 'zustand';
import { calculateUpgradeBenefit, calculateUpgradeCost } from './calculations';
import {
  energyUpgradeBaseBenefit,
  energyUpgradeBasePrice,
  energyUpgradeBenefitCoefficient,
  energyUpgradeCostCoefficient,
  LEVELS,
  MAXIMUM_INACTIVE_TIME_FOR_MINE,
  mineUpgradeBaseBenefit,
  mineUpgradeBasePrice,
  mineUpgradeBenefitCoefficient,
  mineUpgradeCostCoefficient,
  multitapUpgradeBaseBenefit,
  multitapUpgradeBasePrice,
  multitapUpgradeBenefitCoefficient,
  multitapUpgradeCostCoefficient,
} from './consts';

// Интерфейс для команды
export interface Squad {
  id: string;
  name: string;
  logo: string;
  totalBalance: number;
  members: number;
  averageLevel: number;
}

export interface InitialGameState {
  userTelegramInitData: string;
  userTelegramName: string;
  userTelegramId: string | null;
  lastClickTimestamp: number;
  gameLevelIndex: number;
  points: number;
  pointsBalance: number;
  unsynchronizedPoints: number;
  multitapLevelIndex: number;
  pointsPerClick: number;
  energy: number;
  maxEnergy: number;
  energyRefillsLeft: number;
  energyLimitLevelIndex: number;
  lastEnergyRefillTimestamp: number;
  mineLevelIndex: number;
  profitPerHour: number;
  tonWalletAddress: string | null;
  squad: Squad | null;
  autoClicker: boolean;
  clickSpeed: number;
  isPremium: boolean;
}

export interface GameState extends InitialGameState {
  initializeState: (initialState: Partial<GameState>) => void;
  updateLastClickTimestamp: () => void;
  setPoints: (points: number) => void;
  clickTriggered: () => void;
  setPointsBalance: (points: number) => void;
  incrementPoints: (amount: number) => void;
  decrementPointsBalance: (amount: number) => void;
  resetUnsynchronizedPoints: (syncedPoints: number) => void;
  setPointsPerClick: (pointsPerClick: number) => void;
  upgradeMultitap: () => void;
  setEnergy: (energy: number) => void;
  incrementEnergy: (amount: number) => void;
  refillEnergy: () => void;
  upgradeEnergyLimit: () => void;
  resetDailyRefills: () => void;
  setMineLevelIndex: (mineLevelIndex: number) => void;
  upgradeMineLevelIndex: () => void;
  setTonWalletAddress: (address: string | null) => void;
  setSquad: (squad: Squad | null) => void;
  getSquadBonus: () => number;
  purchaseUpgrade: (upgradeId: number) => void;
  deductPoints: (amount: number) => void; // Новый метод
}

export const calculateLevelIndex = (points: number): number => {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (points >= LEVELS[i].minPoints) {
      return i;
    }
  }
  return 0;
};

export const calculateMultitapUpgradeCost = (levelIndex: number) => {
  return calculateUpgradeCost(levelIndex, multitapUpgradeBasePrice, multitapUpgradeCostCoefficient);
};

export const calculatePointsPerClick = (levelIndex: number) => {
  return calculateUpgradeBenefit(levelIndex, multitapUpgradeBaseBenefit, multitapUpgradeBenefitCoefficient);
};

export const calculateEnergyLimitUpgradeCost = (levelIndex: number) => {
  return calculateUpgradeCost(levelIndex, energyUpgradeBasePrice, energyUpgradeCostCoefficient);
};

export const calculateEnergyLimit = (levelIndex: number) => {
  return calculateUpgradeBenefit(levelIndex, energyUpgradeBaseBenefit, energyUpgradeBenefitCoefficient);
};

export const calculateMineUpgradeCost = (levelIndex: number) => {
  return calculateUpgradeCost(levelIndex, mineUpgradeBasePrice, mineUpgradeCostCoefficient);
};

export const calculateProfitPerHour = (levelIndex: number) => {
  const calculatedBenefit = calculateUpgradeBenefit(levelIndex, mineUpgradeBaseBenefit, mineUpgradeBenefitCoefficient) - mineUpgradeBaseBenefit;
  return Math.max(0, calculatedBenefit);
};

export const calculateMinedPoints = (levelIndex: number, previousTimestamp: number, newTimestamp: number): number => {
  if (previousTimestamp >= newTimestamp) return 0;
  let timePeriod = newTimestamp - previousTimestamp;
  if (timePeriod > MAXIMUM_INACTIVE_TIME_FOR_MINE) {
    timePeriod = MAXIMUM_INACTIVE_TIME_FOR_MINE;
  }
  const profitPerHour = calculateProfitPerHour(levelIndex);
  const minedPoints = (profitPerHour / 3600000) * timePeriod;
  return Math.max(0, minedPoints);
};

export const calculateRestoredEnergy = (multitapLevelIndex: number, previousTimestamp: number, newTimestamp: number): number => {
  const pointsPerClick = calculatePointsPerClick(multitapLevelIndex);
  const restoredEnergy = pointsPerClick * Math.floor((newTimestamp - previousTimestamp) / 1000);
  return Math.max(0, restoredEnergy);
};

// Функция для извлечения userTelegramId из initData
const getUserTelegramId = (initData: string): string | null => {
  try {
    const params = new URLSearchParams(initData);
    const user = params.get('user');
    if (user) {
      const userData = JSON.parse(user);
      return userData.id || null;
    }
    return null;
  } catch (error) {
    console.error('Error parsing userTelegramId:', error);
    return null;
  }
};

export const createGameStore = (initialState: InitialGameState) =>
  create<GameState>((set, get) => ({
    ...initialState,
    userTelegramId: getUserTelegramId(initialState.userTelegramInitData),
    autoClicker: false,
    clickSpeed: 1,
    isPremium: false,

    initializeState: (initialState) => set((state) => ({ ...state, ...initialState })),
    updateLastClickTimestamp: () => set({ lastClickTimestamp: Date.now() }),
    setPoints: (points) =>
      set((state) => {
        const newLevelIndex = calculateLevelIndex(points);
        return { points, gameLevelIndex: newLevelIndex };
      }),
    clickTriggered: () =>
      set((state) => {
        if (state.energy - state.pointsPerClick < 0) return {};
        const squadBonus = get().getSquadBonus();
        const newPoints = state.points + state.pointsPerClick * squadBonus;
        const newPointsBalance = state.pointsBalance + state.pointsPerClick * squadBonus;
        const newUnsynchronizedPoints = state.unsynchronizedPoints + state.pointsPerClick * squadBonus;
        const newEnergy = state.energy - state.pointsPerClick;
        const newLevelIndex = calculateLevelIndex(newPoints);
        return {
          points: newPoints,
          pointsBalance: newPointsBalance,
          unsynchronizedPoints: newUnsynchronizedPoints,
          energy: newEnergy,
          gameLevelIndex: newLevelIndex,
          lastClickTimestamp: Date.now(),
        };
      }),
    setPointsBalance: (pointsBalance) => set({ pointsBalance }),
    incrementPoints: (amount) =>
      set((state) => {
        const newPoints = state.points + amount;
        const newPointsBalance = state.pointsBalance + amount;
        const newLevelIndex = calculateLevelIndex(newPoints);
        return { points: newPoints, pointsBalance: newPointsBalance, gameLevelIndex: newLevelIndex };
      }),
    decrementPointsBalance: (amount) =>
      set((state) => {
        const newPointsBalance = Math.max(0, state.pointsBalance - amount);
        return { pointsBalance: newPointsBalance };
      }),
    resetUnsynchronizedPoints: (syncedPoints) =>
      set((state) => ({
        unsynchronizedPoints: Math.max(0, state.unsynchronizedPoints - syncedPoints),
      })),
    setPointsPerClick: (pointsPerClick) => set({ pointsPerClick }),
    upgradeMultitap: () =>
      set((state) => {
        const upgradeCost = calculateMultitapUpgradeCost(state.multitapLevelIndex);
        if (state.pointsBalance >= upgradeCost) {
          return {
            pointsBalance: state.pointsBalance - upgradeCost,
            pointsPerClick: calculatePointsPerClick(state.multitapLevelIndex + 1),
            multitapLevelIndex: state.multitapLevelIndex + 1,
          };
        }
        return state;
      }),
    setEnergy: (energy) => set({ energy }),
    incrementEnergy: (amount) =>
      set((state) => ({
        energy: Math.min(state.energy + amount, state.maxEnergy),
      })),
    refillEnergy: () =>
      set((state) => {
        if (state.energyRefillsLeft > 0) {
          return {
            energy: state.maxEnergy,
            energyRefillsLeft: state.energyRefillsLeft - 1,
            lastEnergyRefillTimestamp: Date.now(),
          };
        }
        return state;
      }),
    upgradeEnergyLimit: () =>
      set((state) => {
        const upgradeCost = calculateEnergyLimitUpgradeCost(state.energyLimitLevelIndex);
        if (state.pointsBalance >= upgradeCost) {
          return {
            pointsBalance: state.pointsBalance - upgradeCost,
            maxEnergy: calculateEnergyLimit(state.energyLimitLevelIndex + 1),
            energyLimitLevelIndex: state.energyLimitLevelIndex + 1,
          };
        }
        return state;
      }),
    resetDailyRefills: () => set({ energyRefillsLeft: 6 }),
    setMineLevelIndex: (mineLevelIndex) => set({ mineLevelIndex }),
    upgradeMineLevelIndex: () =>
      set((state) => {
        const upgradeCost = calculateMineUpgradeCost(state.mineLevelIndex);
        if (state.pointsBalance >= upgradeCost) {
          return {
            pointsBalance: state.pointsBalance - upgradeCost,
            profitPerHour: calculateProfitPerHour(state.mineLevelIndex + 1),
            mineLevelIndex: state.mineLevelIndex + 1,
          };
        }
        return state;
      }),
    setTonWalletAddress: (address) => set({ tonWalletAddress: address }),
    setSquad: (squad) => set({ squad }),
    getSquadBonus: () => {
      const squad = get().squad;
      if (squad) {
        const averageLevel = squad.averageLevel;
        return 1 + averageLevel * 0.02;
      }
      return 1;
    },
    purchaseUpgrade: (upgradeId: number) => {
      const upgrades = [
        {
          id: 1,
          name: "Улучшенный клик",
          cost: 100,
          effect: (state: any) => ({ pointsPerClick: state.pointsPerClick + 1 }),
        },
        {
          id: 2,
          name: "Энергетический бустер",
          cost: 200,
          effect: (state: any) => ({ maxEnergy: state.maxEnergy + 10 }),
        },
        {
          id: 3,
          name: "Автокликер",
          cost: 500,
          effect: (state: any) => ({ autoClicker: true }),
        },
        {
          id: 4,
          name: "Молниеносная скорость",
          cost: 300,
          effect: (state: any) => ({ clickSpeed: state.clickSpeed * 1.5 }),
          duration: 60000, // 1 минута
        },
        {
          id: 5,
          name: "Золотая шахта",
          cost: 700,
          effect: (state: any) => ({ profitPerHour: state.profitPerHour * 1.5 }),
          duration: 1800000, // 30 минут
        },
      ];

      const upgrade = upgrades.find((u) => u.id === upgradeId);
      if (upgrade && get().pointsBalance >= upgrade.cost) {
        set((state) => ({
          pointsBalance: state.pointsBalance - upgrade.cost,
          ...upgrade.effect(state),
        }));

        if (upgrade.duration) {
          setTimeout(() => {
            set((state) => ({
              clickSpeed: state.clickSpeed / 1.5,
              profitPerHour: state.profitPerHour / 1.5,
            }));
          }, upgrade.duration);
        }
      }
    },
    deductPoints: (amount) =>
      set((state) => {
        const newPointsBalance = Math.max(0, state.pointsBalance - amount); // Убедимся, что баланс не уходит в минус
        return { pointsBalance: newPointsBalance };
      }),
  }));

export const useGameStore = createGameStore({
  userTelegramInitData: '',
  userTelegramName: '',
  userTelegramId: null,
  lastClickTimestamp: 0,
  gameLevelIndex: 0,
  points: 10000,
  pointsBalance: 10000,
  unsynchronizedPoints: 0,
  multitapLevelIndex: 0,
  pointsPerClick: 1,
  energy: energyUpgradeBaseBenefit,
  maxEnergy: energyUpgradeBaseBenefit,
  energyRefillsLeft: 6,
  energyLimitLevelIndex: 0,
  lastEnergyRefillTimestamp: Date.now(),
  mineLevelIndex: 0,
  profitPerHour: 0,
  tonWalletAddress: null,
  squad: null,
  autoClicker: false,
  clickSpeed: 1,
  isPremium: false,
});