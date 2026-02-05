// stores/game.store.ts
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Character } from "@/services/superhero.service";

export type GameMode = "pvp" | "pvc";
export type Player = "player1" | "player2" | "computer";
export type Alignment = "good" | "bad" | "neutral";
export type PowerStat =
  | "intelligence"
  | "strength"
  | "speed"
  | "durability"
  | "power"
  | "combat";

export interface BattleResult {
  winner: Player | "draw";
  winningStat: PowerStat;
  winningValue: number;
  player1Stats: Record<PowerStat, number>;
  player2Stats: Record<PowerStat, number>;
}

export interface GameRound {
  round: number;
  player1Card: Character | null;
  player2Card: Character | null;
  result: BattleResult | null;
}

export interface GameHistory {
  rounds: GameRound[];
  winner: Player | null;
  totalRounds: number;
}

export const useGameStore = defineStore("game", () => {
  // Game State
  const gameMode = ref<GameMode>("pvp");
  const currentRound = ref(1);
  const currentPlayer = ref<Player>("player1");
  const winner = ref<Player | null>(null);
  const isGameStarted = ref(false);
  const isGameOver = ref(false);

  // Cards State
  const availableCharacters = ref<Character[]>([]);
  const player1Deck = ref<Character[]>([]);
  const player2Deck = ref<Character[]>([]);
  const computerDeck = ref<Character[]>([]);
  const player1Hand = ref<Character | null>(null);
  const player2Hand = ref<Character | null>(null);
  const discardPile = ref<Character[]>([]);

  // Game History
  const gameHistory = ref<GameHistory>({
    rounds: [],
    winner: null,
    totalRounds: 0,
  });

  // Filters
  const alignmentFilter = ref<Alignment | null>(null);
  const statFilter = ref<PowerStat | null>(null);

  // Constants
  const POWER_STAT_COLORS = {
    intelligence: "#60A5FA",
    strength: "#F87171",
    speed: "#34D399",
    durability: "#FBBF24",
    power: "#A78BFA",
    combat: "#F472B6",
  };

  const ALIGNMENT_CONFIG = {
    good: {
      color: "green",
      label: "Hero",
      bg: "bg-green-900/20",
      text: "text-green-300",
    },
    bad: {
      color: "red",
      label: "Villain",
      bg: "bg-red-900/20",
      text: "text-red-300",
    },
    neutral: {
      color: "yellow",
      label: "Neutral",
      bg: "bg-yellow-900/20",
      text: "text-yellow-300",
    },
  };

  // Computed Properties
  const filteredCharacters = computed(() => {
    let filtered = availableCharacters.value;

    if (alignmentFilter.value) {
      filtered = filtered.filter(
        (char) => char.biography.alignment === alignmentFilter.value
      );
    }

    if (statFilter.value) {
      filtered = filtered.sort(
        (a, b) =>
          b.powerstats[statFilter.value!] - a.powerstats[statFilter.value!]
      );
    }

    return filtered;
  });

  const player1Score = computed(() => player1Deck.value.length);
  const player2Score = computed(() =>
    gameMode.value === "pvp"
      ? player2Deck.value.length
      : computerDeck.value.length
  );

  const totalCards = computed(() => availableCharacters.value.length);

  const currentBattle = computed(() => ({
    player1Card: player1Hand.value,
    player2Card: player2Hand.value,
    round: currentRound.value,
  }));

  const gameStats = computed(() => ({
    totalRounds: currentRound.value - 1,
    player1Wins: gameHistory.value.rounds.filter(
      (r) => r.result?.winner === "player1"
    ).length,
    player2Wins: gameHistory.value.rounds.filter(
      (r) =>
        r.result?.winner === (gameMode.value === "pvp" ? "player2" : "computer")
    ).length,
    draws: gameHistory.value.rounds.filter((r) => r.result?.winner === "draw")
      .length,
  }));

  // Actions
  const setGameMode = (mode: GameMode) => {
    gameMode.value = mode;
    resetGame();
  };

  const setAlignmentFilter = (alignment: Alignment | null) => {
    alignmentFilter.value = alignment;
  };

  const setStatFilter = (stat: PowerStat | null) => {
    statFilter.value = stat;
  };

  const initializeGame = (characters: Character[]) => {
    availableCharacters.value = [...characters];
    resetGame();
  };

  const selectCharacter = (character: Character, player: Player) => {
    if (isGameStarted.value) return false;

    const deck = player === "player1" ? player1Deck : player2Deck;

    // Check if character is already selected
    if (deck.value.some((card) => card.id === character.id)) {
      return false;
    }

    // Remove from available characters
    availableCharacters.value = availableCharacters.value.filter(
      (card) => card.id !== character.id
    );

    // Add to player's deck
    deck.value.push(character);

    // Switch turn in PvP mode
    if (gameMode.value === "pvp" && player === "player1") {
      currentPlayer.value = "player2";
    } else if (gameMode.value === "pvp" && player === "player2") {
      currentPlayer.value = "player1";
    }

    return true;
  };

  const removeCharacter = (characterId: number, player: Player) => {
    if (isGameStarted.value) return false;

    const deck = player === "player1" ? player1Deck : player2Deck;
    const character = deck.value.find((card) => card.id === characterId);

    if (!character) return false;

    // Remove from deck
    deck.value = deck.value.filter((card) => card.id !== characterId);

    // Add back to available characters
    availableCharacters.value.push(character);

    return true;
  };

  const startGame = () => {
    if (
      player1Deck.value.length === 0 ||
      (gameMode.value === "pvp" && player2Deck.value.length === 0)
    ) {
      throw new Error("Both players need at least one card to start!");
    }

    // Shuffle decks
    player1Deck.value = shuffleDeck(player1Deck.value);
    player2Deck.value = shuffleDeck(player2Deck.value);
    computerDeck.value = [...player2Deck.value];

    isGameStarted.value = true;
    isGameOver.value = false;
    winner.value = null;
    currentRound.value = 1;
    currentPlayer.value = "player1";
    gameHistory.value = {
      rounds: [],
      winner: null,
      totalRounds: 0,
    };
  };

  const drawCards = () => {
    if (!isGameStarted.value || isGameOver.value) return false;

    // Player 1 draws
    if (player1Deck.value.length > 0) {
      player1Hand.value = player1Deck.value.shift() || null;
    }

    // Player 2/Computer draws
    if (gameMode.value === "pvp") {
      if (player2Deck.value.length > 0) {
        player2Hand.value = player2Deck.value.shift() || null;
      }
    } else {
      if (computerDeck.value.length > 0) {
        // AI Logic: Computer selects card based on strategy
        player2Hand.value = computerDrawCard();
      }
    }

    return player1Hand.value && player2Hand.value;
  };

  const computerDrawCard = (): Character | null => {
    if (computerDeck.value.length === 0) return null;

    // Simple AI strategy:
    // 1. Try to counter player's last played stat if available
    // 2. Otherwise, play the strongest overall card
    if (gameHistory.value.rounds.length > 0 && player1Hand.value) {
      const lastRound =
        gameHistory.value.rounds[gameHistory.value.rounds.length - 1];
      if (lastRound.result) {
        // Find a card that counters the player's winning stat
        const counterCard = computerDeck.value.find(
          (card) =>
            card.powerstats[lastRound.result.winningStat] >
            (player1Hand.value?.powerstats[lastRound.result.winningStat] || 0)
        );

        if (counterCard) {
          const index = computerDeck.value.indexOf(counterCard);
          return computerDeck.value.splice(index, 1)[0];
        }
      }
    }

    // Fallback: Play the card with highest total stats
    const strongestCard = computerDeck.value.reduce((best, current) => {
      const bestTotal = Object.values(best.powerstats).reduce(
        (a, b) => a + b,
        0
      );
      const currentTotal = Object.values(current.powerstats).reduce(
        (a, b) => a + b,
        0
      );
      return currentTotal > bestTotal ? current : best;
    });

    const index = computerDeck.value.indexOf(strongestCard);
    return computerDeck.value.splice(index, 1)[0];
  };

  const resolveBattle = (): BattleResult => {
    if (!player1Hand.value || !player2Hand.value) {
      throw new Error("Both players must have cards to battle!");
    }

    let winningStat: PowerStat = "combat";
    let maxDiff = 0;
    let player1Total = 0;
    let player2Total = 0;
    const player1Stats: Record<PowerStat, number> = {} as Record<
      PowerStat,
      number
    >;
    const player2Stats: Record<PowerStat, number> = {} as Record<
      PowerStat,
      number
    >;

    // Calculate totals and find biggest difference
    Object.keys(POWER_STAT_COLORS).forEach((stat) => {
      const powerStat = stat as PowerStat;
      const p1Value = player1Hand.value!.powerstats[powerStat];
      const p2Value = player2Hand.value!.powerstats[powerStat];

      player1Stats[powerStat] = p1Value;
      player2Stats[powerStat] = p2Value;

      const diff = Math.abs(p1Value - p2Value);
      if (diff > maxDiff) {
        maxDiff = diff;
        winningStat = powerStat;
      }

      player1Total += p1Value;
      player2Total += p2Value;
    });

    // Determine winner
    let battleWinner: Player | "draw";
    let winningValue: number;

    if (player1Total > player2Total) {
      battleWinner = "player1";
      winningValue = player1Total;
    } else if (player2Total > player1Total) {
      battleWinner = gameMode.value === "pvp" ? "player2" : "computer";
      winningValue = player2Total;
    } else {
      battleWinner = "draw";
      winningValue = player1Total;
    }

    const result: BattleResult = {
      winner: battleWinner,
      winningStat,
      winningValue,
      player1Stats,
      player2Stats,
    };

    // Handle card transfer
    handleCardTransfer(result);

    // Record round
    const round: GameRound = {
      round: currentRound.value,
      player1Card: player1Hand.value,
      player2Card: player2Hand.value,
      result,
    };

    gameHistory.value.rounds.push(round);
    gameHistory.value.totalRounds = currentRound.value;

    // Clear hands
    player1Hand.value = null;
    player2Hand.value = null;

    // Check for game over
    checkGameOver();

    // Increment round if game continues
    if (!isGameOver.value) {
      currentRound.value++;
      currentPlayer.value =
        gameMode.value === "pvp"
          ? currentRound.value % 2 === 1
            ? "player1"
            : "player2"
          : "player1";
    }

    return result;
  };

  const handleCardTransfer = (result: BattleResult) => {
    if (!player1Hand.value || !player2Hand.value) return;

    if (result.winner === "player1") {
      // Player 1 wins: gets both cards
      player1Deck.value.push(player2Hand.value);
      if (gameMode.value === "pvp") {
        player2Deck.value = player2Deck.value.filter(
          (card) => card.id !== player2Hand.value!.id
        );
      } else {
        computerDeck.value = computerDeck.value.filter(
          (card) => card.id !== player2Hand.value!.id
        );
      }
      player1Deck.value.push(player1Hand.value);
    } else if (result.winner === "player2" || result.winner === "computer") {
      // Player 2/Computer wins: gets both cards
      if (gameMode.value === "pvp") {
        player2Deck.value.push(player1Hand.value);
        player2Deck.value.push(player2Hand.value);
      } else {
        computerDeck.value.push(player1Hand.value);
        computerDeck.value.push(player2Hand.value);
      }
      player1Deck.value = player1Deck.value.filter(
        (card) => card.id !== player1Hand.value!.id
      );
    } else {
      // Draw: Return cards to respective decks
      player1Deck.value.push(player1Hand.value);
      if (gameMode.value === "pvp") {
        player2Deck.value.push(player2Hand.value);
      } else {
        computerDeck.value.push(player2Hand.value);
      }
    }
  };

  const checkGameOver = () => {
    if (player1Deck.value.length === 0) {
      winner.value = gameMode.value === "pvp" ? "player2" : "computer";
      isGameOver.value = true;
      gameHistory.value.winner = winner.value;
    } else if (
      (gameMode.value === "pvp" && player2Deck.value.length === 0) ||
      (gameMode.value === "pvc" && computerDeck.value.length === 0)
    ) {
      winner.value = "player1";
      isGameOver.value = true;
      gameHistory.value.winner = winner.value;
    }
  };

  const surrender = (player: Player) => {
    if (!isGameStarted.value) return;

    winner.value =
      player === "player1"
        ? gameMode.value === "pvp"
          ? "player2"
          : "computer"
        : "player1";

    isGameOver.value = true;
    gameHistory.value.winner = winner.value;
  };

  const resetGame = () => {
    // Return all cards to available pool
    const allCards = [
      ...player1Deck.value,
      ...player2Deck.value,
      ...computerDeck.value,
      ...discardPile.value,
      ...(player1Hand.value ? [player1Hand.value] : []),
      ...(player2Hand.value ? [player2Hand.value] : []),
    ];

    availableCharacters.value = [...allCards];
    player1Deck.value = [];
    player2Deck.value = [];
    computerDeck.value = [];
    player1Hand.value = null;
    player2Hand.value = null;
    discardPile.value = [];

    currentRound.value = 1;
    currentPlayer.value = "player1";
    winner.value = null;
    isGameStarted.value = false;
    isGameOver.value = false;
    gameHistory.value = {
      rounds: [],
      winner: null,
      totalRounds: 0,
    };
  };

  const shuffleDeck = (deck: Character[]): Character[] => {
    const newDeck = [...deck];
    for (let i = newDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }
    return newDeck;
  };

  const exportGameState = () => {
    return {
      gameMode: gameMode.value,
      currentRound: currentRound.value,
      currentPlayer: currentPlayer.value,
      winner: winner.value,
      isGameStarted: isGameStarted.value,
      isGameOver: isGameOver.value,
      player1Score: player1Score.value,
      player2Score: player2Score.value,
      gameStats: gameStats.value,
      gameHistory: { ...gameHistory.value },
    };
  };

  return {
    // State
    gameMode,
    currentRound,
    currentPlayer,
    winner,
    isGameStarted,
    isGameOver,
    availableCharacters,
    player1Deck,
    player2Deck,
    computerDeck,
    player1Hand,
    player2Hand,
    discardPile,
    gameHistory,
    alignmentFilter,
    statFilter,

    // Computed
    filteredCharacters,
    player1Score,
    player2Score,
    totalCards,
    currentBattle,
    gameStats,
    POWER_STAT_COLORS,
    ALIGNMENT_CONFIG,

    // Actions
    setGameMode,
    setAlignmentFilter,
    setStatFilter,
    initializeGame,
    selectCharacter,
    removeCharacter,
    startGame,
    drawCards,
    resolveBattle,
    surrender,
    resetGame,
    exportGameState,
  };
});
