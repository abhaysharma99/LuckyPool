"use client";

import {
  Box, Container, Heading, Text, Button, HStack, VStack, Flex, Input,
} from "@chakra-ui/react";
import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { connectWallet, getWalletAddress } from "../lib/wallet";
import { deposit as depositTx, getPoolState, isContractConfigured, stroopsToUsdc } from "../lib/luckyPool";

const MotionBox = motion(Box);

// Target APY until Blend integration ships — see docs/plan.md step 6.
const TARGET_APY = 0.068;

// Pre-deploy preview only — matches lib/useLuckyPoolAccount's DEMO_POOL_STATE.
const DEMO_MODE = process.env.NEXT_PUBLIC_LUCKYPOOL_DEMO === "true";
const DEMO_PRIZE_POOL = 646.32;

const QUICK_AMOUNTS = ["10", "50", "100", "500"];

export function DepositSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const configured = isContractConfigured();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [prizePool, setPrizePool] = useState<number | null>(null);

  useEffect(() => {
    getWalletAddress().then((addr) => addr && setWalletAddress(addr));
  }, []);

  useEffect(() => {
    if (!configured) {
      if (DEMO_MODE) setPrizePool(DEMO_PRIZE_POOL);
      return;
    }
    getPoolState()
      .then((state) => setPrizePool(stroopsToUsdc(state.prizePool)))
      .catch(() => {});
  }, [configured]);

  const numericAmount = parseFloat(amount) || 0;
  const estTickets = Math.floor(numericAmount);
  const estWeeklyYield = (numericAmount * TARGET_APY) / 52;

  const handleConnect = async () => {
    setError(null);
    try {
      const addr = await connectWallet();
      setWalletAddress(addr);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect wallet");
    }
  };

  const handleDeposit = async () => {
    if (!walletAddress) {
      await handleConnect();
      return;
    }
    if (numericAmount <= 0) {
      setError("Enter an amount greater than 0");
      return;
    }

    setPending(true);
    setError(null);
    setTxHash(null);
    try {
      const hash = await depositTx(walletAddress, numericAmount);
      setTxHash(hash);
      setAmount("");
      const state = await getPoolState();
      setPrizePool(stroopsToUsdc(state.prizePool));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Deposit failed");
    } finally {
      setPending(false);
    }
  };

  const buttonLabel = !walletAddress
    ? "Connect Wallet to Deposit"
    : pending
      ? "Depositing…"
      : `Deposit ${amount || "0"} USDC`;

  return (
    <Box
      id="deposit"
      py={{ base: 20, md: 32 }}
      position="relative"
      overflow="hidden"
      bg="#F1F5EE"
    >
      <Container maxW="7xl" ref={ref} position="relative">
        <Flex direction={{ base: "column", lg: "row" }} gap={{ base: 12, lg: 16 }} align="center">

          {/* Left — copy */}
          <VStack align={{ base: "center", lg: "flex-start" }} spacing={8} flex={1} textAlign={{ base: "center", lg: "left" }}>
            <MotionBox initial={{ opacity: 0, y: 16 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.45 }}>
              <Heading as="h2" fontSize={{ base: "3xl", md: "5xl", lg: "6xl" }} fontWeight="900" color="#000000" letterSpacing="-2px" lineHeight="1.0">
                Your USDC.
                <br />
                <Box as="span" color="#3D7A29">Your tickets.</Box>
                <br />
                Your prizes.
              </Heading>
            </MotionBox>

            <MotionBox initial={{ opacity: 0, y: 16 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.45, delay: 0.1 }}>
              <Text color="#666666" fontSize={{ base: "md", md: "lg" }} maxW="lg" lineHeight="1.8" fontWeight="500">
                1 USDC deposited = 1 ticket per week. Deposit more, win more often. Withdraw whenever you want.
              </Text>
            </MotionBox>

            <MotionBox initial={{ opacity: 0, y: 16 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.45, delay: 0.2 }} w="full" maxW="lg">
              <VStack align="stretch" spacing={3}>
                {[
                  "Principal protected — only yield is at risk",
                  "Withdraw anytime, no lock-up period",
                  "Transparent on-chain draw every Friday",
                ].map((text) => (
                  <Box
                    key={text}
                    bg="#CAFFB8"
                    border="1px solid"
                    borderColor="#000000"
                    boxShadow="-3px 3px 0px 0px #000000"
                    px={4} py={3}
                  >
                    <HStack spacing={3}>
                      <Box w="8px" h="8px" bg="#3D7A29" transform="rotate(45deg)" flexShrink={0} />
                      <Text color="#3D7A29" fontSize="sm" fontWeight="700" textTransform="uppercase" letterSpacing="0.04em">{text}</Text>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            </MotionBox>
          </VStack>

          {/* Right — deposit card */}
          <MotionBox flex={1} maxW="440px" w="full" initial={{ opacity: 0, x: 20 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.5, delay: 0.15 }}>
            <Box
              bg="white"
              border="1px solid"
              borderColor="#000000"
              boxShadow="-6px 6px 0px 0px #000000"
              p={{ base: 6, md: 8 }}
            >
              <VStack spacing={6} align="stretch">
                <Flex justify="space-between" align="center">
                  <Text fontWeight="black" color="#000000" fontSize="lg" textTransform="uppercase" letterSpacing="wider">
                    Deposit USDC
                  </Text>
                  {walletAddress && (
                    <Text fontSize="xs" fontWeight="700" color="#3D7A29" fontFamily="mono">
                      {walletAddress.slice(0, 4)}…{walletAddress.slice(-4)}
                    </Text>
                  )}
                </Flex>

                <VStack align="flex-start" spacing={2}>
                  <Text fontSize="xs" fontWeight="700" color="#666666" textTransform="uppercase" letterSpacing="0.1em">Amount</Text>
                  <HStack spacing={0} w="full">
                    <Box bg="#000000" color="white" px={4} py={3} fontWeight="black" fontSize="sm" textTransform="uppercase" letterSpacing="wider" border="1px solid" borderColor="#000000" borderRight="none" whiteSpace="nowrap">
                      USDC
                    </Box>
                    <Input
                      placeholder="0.00"
                      type="number"
                      min="0"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      bg="white"
                      border="1px solid"
                      borderColor="#000000"
                      borderLeft="none"
                      fontWeight="700"
                      fontSize="lg"
                      _placeholder={{ color: "#AAAAAA" }}
                      _focus={{ boxShadow: "none", borderColor: "#3D7A29" }}
                      py={6}
                    />
                  </HStack>
                  <HStack spacing={2} pt={1}>
                    {QUICK_AMOUNTS.map((amt) => (
                      <Box
                        key={amt}
                        as="button"
                        onClick={() => setAmount(amt)}
                        px={3} py={1}
                        fontSize="xs"
                        fontWeight="700"
                        color="white"
                        bg="#3D7A29"
                        border="1px solid"
                        borderColor="#000000"
                        cursor="pointer"
                      >
                        ${amt}
                      </Box>
                    ))}
                  </HStack>
                </VStack>

                <Box bg="#F1F5EE" border="1px solid" borderColor="#000000" p={4}>
                  <VStack spacing={2.5} align="stretch">
                    {[
                      { label: "Your tickets this week", val: estTickets.toLocaleString() },
                      { label: "Est. weekly yield", val: `~$${estWeeklyYield.toFixed(2)} USDC` },
                      {
                        label: "Current prize pool",
                        val: prizePool !== null
                          ? `$${prizePool.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          : configured ? "Loading…" : "—",
                      },
                    ].map(({ label, val }) => (
                      <Flex key={label} justify="space-between">
                        <Text fontSize="sm" color="#666666" fontWeight="500">{label}</Text>
                        <Text fontSize="sm" fontWeight="black" color="#000000">{val}</Text>
                      </Flex>
                    ))}
                  </VStack>
                </Box>

                <Button
                  variant="primary"
                  size="lg"
                  w="full"
                  rightIcon={<ArrowRight size={16} />}
                  onClick={handleDeposit}
                  isDisabled={pending}
                  isLoading={pending}
                >
                  {buttonLabel}
                </Button>

                {error && (
                  <Text fontSize="xs" color="#B3261E" textAlign="center" fontWeight="700">
                    {error}
                  </Text>
                )}
                {txHash && (
                  <Text fontSize="xs" color="#3D7A29" textAlign="center" fontWeight="700" wordBreak="break-all">
                    Deposited — tx {txHash.slice(0, 10)}…
                  </Text>
                )}

                <Text fontSize="xs" color="#666666" textAlign="center" fontWeight="600">
                  Your principal is always withdrawable. Only yield enters the prize pool.
                </Text>
              </VStack>
            </Box>

          </MotionBox>
        </Flex>
      </Container>
    </Box>
  );
}
