"use client";

import {
  Account,
  Address,
  Contract,
  Keypair,
  TransactionBuilder,
  BASE_FEE,
  nativeToScVal,
  scValToNative,
  rpc,
  xdr,
} from "@stellar/stellar-sdk";
import { server, NETWORK_PASSPHRASE, signTransaction } from "./wallet";

export const CONTRACT_ID = process.env.NEXT_PUBLIC_LUCKYPOOL_CONTRACT_ID ?? "";

/** 1 USDC expressed in stroops (7 decimal places) — matches contracts/lucky_pool. */
export const STROOP = 10_000_000;

export function isContractConfigured(): boolean {
  return CONTRACT_ID.length > 0;
}

export interface UserPosition {
  principal: bigint;
  tickets: bigint;
  roundJoined: number;
}

export interface PoolState {
  admin: string;
  usdc: string;
  blendPool: string;
  oracle: string;
  totalDeposits: bigint;
  prizePool: bigint;
  currentRound: number;
  lastDrawLedger: number;
  protocolFeeBps: number;
  paused: boolean;
}

export interface RoundResult {
  round: number;
  winner: string;
  prize: bigint;
  totalTickets: bigint;
  drawLedger: number;
}

const TX_TIMEOUT_SECONDS = 30;
const POLL_INTERVAL_MS = 1500;
const MAX_POLL_ATTEMPTS = 20;

function requireContract(): Contract {
  if (!isContractConfigured()) {
    throw new Error(
      "LuckyPool contract is not deployed yet — set NEXT_PUBLIC_LUCKYPOOL_CONTRACT_ID.",
    );
  }
  return new Contract(CONTRACT_ID);
}

export function usdcToStroops(amountUsdc: number): bigint {
  return BigInt(Math.round(amountUsdc * STROOP));
}

export function stroopsToUsdc(stroops: bigint): number {
  return Number(stroops) / STROOP;
}

// Any syntactically valid keypair works for simulation-only reads — the
// ledger never needs to know this account exists, since simulate doesn't
// check signatures or account balances.
const SIMULATION_KEYPAIR = Keypair.random();

async function simulateRead<T>(
  method: string,
  args: xdr.ScVal[],
  parse: (value: unknown) => T,
): Promise<T> {
  const contract = requireContract();
  const account = new Account(SIMULATION_KEYPAIR.publicKey(), "0");
  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(TX_TIMEOUT_SECONDS)
    .build();

  const sim = await server.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(sim)) {
    throw new Error(`${method} simulation failed: ${sim.error}`);
  }
  if (!rpc.Api.isSimulationSuccess(sim) || !sim.result) {
    throw new Error(`${method} simulation did not return a result`);
  }

  return parse(scValToNative(sim.result.retval));
}

async function submitWrite(
  method: string,
  userAddress: string,
  args: xdr.ScVal[],
): Promise<string> {
  const contract = requireContract();
  const account = await server.getAccount(userAddress);
  const built = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(TX_TIMEOUT_SECONDS)
    .build();

  const prepared = await server.prepareTransaction(built);

  const { signedTxXdr, error } = await signTransaction(prepared.toXDR(), {
    networkPassphrase: NETWORK_PASSPHRASE,
    address: userAddress,
  });
  if (error) {
    throw new Error(`Wallet declined to sign ${method}: ${JSON.stringify(error)}`);
  }

  const signed = TransactionBuilder.fromXDR(signedTxXdr, NETWORK_PASSPHRASE);
  const sendResult = await server.sendTransaction(signed);
  if (sendResult.status === "ERROR") {
    throw new Error(`Failed to submit ${method}: ${JSON.stringify(sendResult.errorResult)}`);
  }

  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
    const tx = await server.getTransaction(sendResult.hash);
    if (tx.status === rpc.Api.GetTransactionStatus.SUCCESS) return sendResult.hash;
    if (tx.status === rpc.Api.GetTransactionStatus.FAILED) {
      throw new Error(`${method} transaction failed on-chain`);
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
  throw new Error(`Timed out waiting for ${method} to confirm`);
}

/** Deposit `amountUsdc` USDC. Returns the confirmed transaction hash. */
export async function deposit(userAddress: string, amountUsdc: number): Promise<string> {
  const args = [
    new Address(userAddress).toScVal(),
    nativeToScVal(usdcToStroops(amountUsdc), { type: "i128" }),
  ];
  return submitWrite("deposit", userAddress, args);
}

/** Withdraw `amountUsdc` USDC. Returns the confirmed transaction hash. */
export async function withdraw(userAddress: string, amountUsdc: number): Promise<string> {
  const args = [
    new Address(userAddress).toScVal(),
    nativeToScVal(usdcToStroops(amountUsdc), { type: "i128" }),
  ];
  return submitWrite("withdraw", userAddress, args);
}

export async function getPosition(userAddress: string): Promise<UserPosition> {
  return simulateRead("get_position", [new Address(userAddress).toScVal()], (value) => {
    const raw = value as { principal: bigint; tickets: bigint; round_joined: bigint };
    return {
      principal: raw.principal,
      tickets: raw.tickets,
      roundJoined: Number(raw.round_joined),
    };
  });
}

export async function getPoolState(): Promise<PoolState> {
  return simulateRead("get_pool_state", [], (value) => {
    const raw = value as Record<string, unknown>;
    return {
      admin: String(raw.admin),
      usdc: String(raw.usdc),
      blendPool: String(raw.blend_pool),
      oracle: String(raw.oracle),
      totalDeposits: raw.total_deposits as bigint,
      prizePool: raw.prize_pool as bigint,
      currentRound: Number(raw.current_round),
      lastDrawLedger: Number(raw.last_draw_ledger),
      protocolFeeBps: Number(raw.protocol_fee_bps),
      paused: Boolean(raw.paused),
    };
  });
}

/** Fetch a past round's result. Returns null if that round hasn't been drawn (or doesn't exist). */
export async function getRoundResult(round: number): Promise<RoundResult | null> {
  return simulateRead(
    "get_round_result",
    [nativeToScVal(round, { type: "u64" })],
    (value) => {
      if (value === null || value === undefined) return null;
      const raw = value as Record<string, unknown>;
      return {
        round: Number(raw.round),
        winner: String(raw.winner),
        prize: raw.prize as bigint,
        totalTickets: raw.total_tickets as bigint,
        drawLedger: Number(raw.draw_ledger),
      };
    },
  );
}

/**
 * Fetch the most recent `count` completed rounds (rounds before the pool's
 * current, still-open round), most recent first. Skips any gaps.
 */
export async function getRecentRounds(count: number): Promise<RoundResult[]> {
  const state = await getPoolState();
  const results: RoundResult[] = [];
  for (let round = state.currentRound - 1; round >= 1 && results.length < count; round--) {
    const result = await getRoundResult(round);
    if (result) results.push(result);
  }
  return results;
}

export interface DepositEvent {
  type: "Deposit";
  amount: bigint;
  round: number;
  ledger: number;
  ledgerClosedAt: string;
  txHash: string;
}

export interface WithdrawEvent {
  type: "Withdraw";
  amount: bigint;
  ledger: number;
  ledgerClosedAt: string;
  txHash: string;
}

export type LuckyPoolEvent = DepositEvent | WithdrawEvent;

const LEDGERS_PER_DAY = 17_280; // ~5s per ledger
// Soroban RPC only retains a rolling window of events (~7 days on testnet);
// this is a default lookback, not a hard protocol limit.
const DEFAULT_EVENT_LOOKBACK_LEDGERS = LEDGERS_PER_DAY * 7;

function topicFilter(...segments: string[]): string[] {
  return segments.map((s) => xdr.ScVal.scvSymbol(s).toXDR("base64"));
}

/** Deposit/withdraw history for `userAddress`, most recent first. */
export async function getUserHistory(
  userAddress: string,
  opts?: { sinceLedger?: number },
): Promise<LuckyPoolEvent[]> {
  if (!isContractConfigured()) return [];

  const latest = await server.getLatestLedger();
  const startLedger =
    opts?.sinceLedger ?? Math.max(1, latest.sequence - DEFAULT_EVENT_LOOKBACK_LEDGERS);

  const response = await server.getEvents({
    startLedger,
    filters: [
      {
        type: "contract",
        contractIds: [CONTRACT_ID],
        topics: [topicFilter("LuckyPool", "deposit"), topicFilter("LuckyPool", "withdraw")],
      },
    ],
    limit: 200,
  });

  const events: LuckyPoolEvent[] = [];
  for (const evt of response.events) {
    const topics = evt.topic.map((t) => scValToNative(t));
    const kind = topics[1] as string;
    const data = scValToNative(evt.value) as Record<string, unknown>;
    if (String(data.user) !== userAddress) continue;

    if (kind === "deposit") {
      events.push({
        type: "Deposit",
        amount: data.amount as bigint,
        round: Number(data.round),
        ledger: evt.ledger,
        ledgerClosedAt: evt.ledgerClosedAt,
        txHash: evt.txHash,
      });
    } else if (kind === "withdraw") {
      events.push({
        type: "Withdraw",
        amount: data.amount as bigint,
        ledger: evt.ledger,
        ledgerClosedAt: evt.ledgerClosedAt,
        txHash: evt.txHash,
      });
    }
  }

  return events.sort((a, b) => b.ledger - a.ledger);
}
