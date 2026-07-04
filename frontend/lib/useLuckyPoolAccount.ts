"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getPosition,
  getPoolState,
  getRecentRounds,
  getUserHistory,
  isContractConfigured,
  type UserPosition,
  type PoolState,
  type RoundResult,
  type LuckyPoolEvent,
} from "./luckyPool";

export interface LuckyPoolAccountData {
  /** false until NEXT_PUBLIC_LUCKYPOOL_CONTRACT_ID is set — callers should show a "not deployed yet" state. */
  configured: boolean;
  loading: boolean;
  error: string | null;
  position: UserPosition | null;
  poolState: PoolState | null;
  recentRounds: RoundResult[];
  history: LuckyPoolEvent[];
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

  return { configured, loading, error, position, poolState, recentRounds, history, refresh };
}
