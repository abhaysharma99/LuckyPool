"use client";

import {
  Box, Container, Heading, Text, Button, HStack, VStack, Flex, Input,
} from "@chakra-ui/react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";

const MotionBox = motion(Box);

export function DepositSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

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
                <Text fontWeight="black" color="#000000" fontSize="lg" textTransform="uppercase" letterSpacing="wider">
                  Deposit USDC
                </Text>

                <VStack align="flex-start" spacing={2}>
                  <Text fontSize="xs" fontWeight="700" color="#666666" textTransform="uppercase" letterSpacing="0.1em">Amount</Text>
                  <HStack spacing={0} w="full">
                    <Box bg="#000000" color="white" px={4} py={3} fontWeight="black" fontSize="sm" textTransform="uppercase" letterSpacing="wider" border="1px solid" borderColor="#000000" borderRight="none" whiteSpace="nowrap">
                      USDC
                    </Box>
                    <Input
                      placeholder="0.00"
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
                    {["10", "50", "100", "500"].map((amt) => (
                      <Box
                        key={amt}
                        as="button"
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
                      { label: "Your tickets this week", val: "1,240" },
                      { label: "Est. weekly yield", val: "~$0.82 USDC" },
                      { label: "Current prize pool", val: "$12,847" },
                    ].map(({ label, val }) => (
                      <Flex key={label} justify="space-between">
                        <Text fontSize="sm" color="#666666" fontWeight="500">{label}</Text>
                        <Text fontSize="sm" fontWeight="black" color="#000000">{val}</Text>
                      </Flex>
                    ))}
                  </VStack>
                </Box>

                <Button variant="primary" size="lg" w="full" rightIcon={<ArrowRight size={16} />}>
                  Connect Wallet to Deposit
                </Button>

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
