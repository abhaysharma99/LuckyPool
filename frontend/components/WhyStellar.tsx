"use client";

import { Box, Container, Heading, Text, SimpleGrid, VStack } from "@chakra-ui/react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ShieldCheck, TrendingUp, Trophy, Unlock, CheckCircle2, Zap } from "lucide-react";

const MotionBox = motion(Box);

const reasons = [
  { icon: <ShieldCheck size={22} />, title: "Zero Loss. Ever.", desc: "Your principal is 100% protected at all times. Only the yield enters the prize pool — your deposit is never at risk.", bg: "#CAFFB8", textColor: "#3D7A29", iconBg: "white" },
  { icon: <TrendingUp size={22} />, title: "Earn While You Save", desc: "6.8% APY accrues on your USDC every single day via Blend. You earn yield whether you win the draw or not.", bg: "#F1F5EE", textColor: "#000000", iconBg: "white" },
  { icon: <Trophy size={22} />, title: "Win Every Week", desc: "Every Friday the entire accumulated yield pool goes to one lucky winner. Bigger deposit = more tickets = better odds.", bg: "#3D7A29", textColor: "white", iconBg: "rgba(255,255,255,0.15)" },
  { icon: <Unlock size={22} />, title: "Withdraw Instantly", desc: "No lockups, no waiting periods, no questions asked. Your USDC is always available to withdraw in full.", bg: "#CAFFB8", textColor: "#3D7A29", iconBg: "white" },
  { icon: <CheckCircle2 size={22} />, title: "Provably Fair Draws", desc: "Every winner is selected using on-chain verifiable randomness. The proof is public — anyone can verify the draw was fair.", bg: "#F1F5EE", textColor: "#000000", iconBg: "white" },
  { icon: <Zap size={22} />, title: "Sub-Cent Fees", desc: "Powered by Stellar's 5-second finality. Deposits, draws, and withdrawals cost fractions of a cent — any amount is economical.", bg: "#3D7A29", textColor: "white", iconBg: "rgba(255,255,255,0.15)" },
];

export function WhyStellar() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  return (
    <Box bg="#F1F5EE" pb={{ base: 16, md: 24 }}>
      {/* Diagonal stripe — same as footer */}
      <Box
        h="20px"
        w="full"
        style={{
          background: "repeating-linear-gradient(45deg, #3D7A29 0px, #3D7A29 10px, #CAFFB8 10px, #CAFFB8 20px, #3D7A29 20px, #3D7A29 30px, #CAFFB8 30px, #CAFFB8 40px)",
        }}
      />
      <Box pt={{ base: 10, md: 14 }}>
      <Container maxW="7xl">
        <VStack spacing={{ base: 12, md: 16 }}>
          <VStack spacing={4} ref={ref} textAlign="center">
            <MotionBox initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.45 }}>
              <Heading as="h2" fontSize={{ base: "3xl", md: "5xl" }} color="#000000" fontWeight="black">
                WHY LUCKYPOOL
                <br />
                WORKS FOR YOU
              </Heading>
            </MotionBox>
            <Box w="120px" h="4px" bg="#3D7A29" />
            <Text color="#666666" fontWeight="medium" maxW="lg" textAlign="center" fontSize="lg">
              Every primitive LuckyPool needs already exists on Stellar today.
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} w="full">
            {reasons.map((r, i) => (
              <MotionBox
                key={r.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                h="full"
              >
                <Box
                  h="full"
                  bg={r.bg}
                  border="1px solid"
                  borderColor="#000000"
                  boxShadow="-5px 5px 0px 0px #000000"
                  p={6}
                >
                  <VStack align="flex-start" spacing={4}>
                    <Box p={2.5} border="1px solid" borderColor={r.textColor === "white" ? "rgba(255,255,255,0.3)" : "#000000"} bg={r.iconBg} display="inline-flex" color={r.textColor}>
                      {r.icon}
                    </Box>
                    <Heading as="h3" size="md" textTransform="uppercase" color={r.textColor}>{r.title}</Heading>
                    <Text color={r.textColor} fontWeight="medium" fontSize="sm" lineHeight="1.7" opacity={r.textColor === "white" ? 0.8 : 0.75}>{r.desc}</Text>
                  </VStack>
                </Box>
              </MotionBox>
            ))}
          </SimpleGrid>
        </VStack>
      </Container>
      </Box>
    </Box>
  );
}
