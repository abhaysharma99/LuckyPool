"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getPosition,
  getPoolState,
  getRecentRounds,
  getUserHistory,
  isContractConfigured,
  usdcToStroops,
  type UserPosition,
  type PoolState,
  type RoundResult,
  type LuckyPoolEvent,
} from "./luckyPool";

// Pre-deploy preview data — only ever shown behind NEXT_PUBLIC_LUCKYPOOL_DEMO
// (set locally, never on the real deployment) so the dashboard can be screenshotted
// looking alive before NEXT_PUBLIC_LUCKYPOOL_CONTRACT_ID exists. A visitor connecting
// a real wallet on the live site without that flag sees the honest empty state.
// Replaced automatically by live reads the moment the contract is configured.
const DEMO_MODE = process.env.NEXT_PUBLIC_LUCKYPOOL_DEMO === "true";

// Opaque ids for fields the UI never renders (pool addresses, tx hashes) — not
// meant to resemble anything, just needs to be a stable unique string.
function internalId(seed: number): string {
  let x = seed;
  x = (x * 1103515245 + 12345) & 0x7fffffff;
  return `demo-${x.toString(36)}`;
}

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 86_400_000).toISOString();
}

const DEMO_POSITION: UserPosition = {
  principal: usdcToStroops(240),
  tickets: BigInt(35),
  roundJoined: 42,
};

const DEMO_POOL_STATE: PoolState = {
  admin: internalId(1),
  usdc: internalId(2),
  blendPool: internalId(3),
  oracle: internalId(4),
  totalDeposits: usdcToStroops(214_580),
  prizePool: usdcToStroops(646.32),
  currentRound: 46,
  lastDrawLedger: 52_384_119,
  protocolFeeBps: 500,
  paused: false,
};

const DEMO_RECENT_ROUNDS: RoundResult[] = [
  { round: 45, winner: "Player 1", prize: usdcToStroops(690.14), totalTickets: BigInt(910), drawLedger: 52_331_800 },
  { round: 44, winner: "Player 2", prize: usdcToStroops(612.50), totalTickets: BigInt(860), drawLedger: 52_237_720 },
  { round: 43, winner: "Player 3", prize: usdcToStroops(705.88), totalTickets: BigInt(940), drawLedger: 52_143_640 },
  { round: 42, winner: "Player 4", prize: usdcToStroops(580.20), totalTickets: BigInt(780), drawLedger: 52_049_560 },
  { round: 41, winner: "Player 5", prize: usdcToStroops(648.75), totalTickets: BigInt(820), drawLedger: 51_955_480 },
];

const DEMO_HISTORY: LuckyPoolEvent[] = [
  { type: "Deposit", amount: usdcToStroops(240), round: 42, ledger: 52_049_700, ledgerClosedAt: daysAgo(24), txHash: internalId(201) },
];

export interface LuckyPoolAccountData {
  /** false until NEXT_PUBLIC_LUCKYPOOL_CONTRACT_ID is set. */
  configured: boolean;
  loading: boolean;
  error: string | null;
  position: UserPosition | null;
  poolState: PoolState | null;
  recentRounds: RoundResult[];
  history: LuckyPoolEvent[];
  /** True when showing pre-deploy preview data instead of a live contract read. */
  isDemo: boolean;
  /** Re-fetch everything — call after a deposit/withdraw confirms. */
  refresh: () => void;
}

const RECENT_ROUNDS_COUNT = 5;

export function useLuckyPoolAccount(walletAddress: string | null): LuckyPoolAccountData {
  const configured = isContractConfigured();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [position, setPosition] = useState<UserPosition | null>(null);
  const [poolState, setPoolState] = useState<PoolState | null>(null);
  const [recentRounds, setRecentRounds] = useState<RoundResult[]>([]);
  const [history, setHistory] = useState<LuckyPoolEvent[]>([]);
  const [nonce, setNonce] = useState(0);

  const refresh = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    if (!configured) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const state = await getPoolState();
        if (cancelled) return;
        setPoolState(state);

        const rounds = await getRecentRounds(RECENT_ROUNDS_COUNT);
        if (cancelled) return;
        setRecentRounds(rounds);

        if (walletAddress) {
          const [pos, hist] = await Promise.all([
            getPosition(walletAddress),
            getUserHistory(walletAddress),
          ]);
          if (cancelled) return;
          setPosition(pos);
          setHistory(hist);
        } else {
          setPosition(null);
          setHistory([]);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load LuckyPool data");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [configured, walletAddress, nonce]);

  if (!configured && DEMO_MODE && walletAddress) {
    return {
      configured,
      loading: false,
      error: null,
      position: DEMO_POSITION,
      poolState: DEMO_POOL_STATE,
      recentRounds: DEMO_RECENT_ROUNDS,
      history: DEMO_HISTORY,
      isDemo: true,
      refresh,
    };
  }

  return { configured, loading, error, position, poolState, recentRounds, history, isDemo: false, refresh };
}
