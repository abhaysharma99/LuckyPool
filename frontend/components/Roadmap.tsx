"use client";

import {
  Box, Container, Heading, Text, VStack, HStack, List, ListItem,
} from "@chakra-ui/react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { CheckCircle2, Circle } from "lucide-react";

const MotionBox = motion(Box);

const roadmapItems = [
  {
    phase: "Phase 1",
    title: "Testnet Contracts",
    items: [
      "Soroban contract: deposit, withdraw, ticket accounting",
      "Yield routing to prize pool accumulator",
      "Testnet deployment on Stellar",
    ],
    done: true,
    color: "lp.green",
  },
  {
    phase: "Phase 2",
    title: "Verifiable Randomness",
    items: [
      "Stellar Oracle Shield VRF integration",
      "On-chain winner selection weighted by deposit",
      "Public proof posted for every draw",
    ],
    done: false,
    color: "lp.purple",
  },
  {
    phase: "Phase 3",
    title: "Blend Integration Live",
    items: [
      "USDC routed into Blend lending pools on deposit",
      "Weekly yield harvest into prize pool",
      "Auto-compounding between draws",
    ],
    done: false,
    color: "lp.gold",
  },
  {
    phase: "Phase 4",
    title: "Mainnet Launch",
    items: [
      "Full security audit complete",
      "First weekly draw with real USDC prizes",
      "Sava or SeevCash integration live",
    ],
    done: false,
    color: "lp.purple",
  },
];

function RoadmapItem({
  item,
  delay,
  isLast,
}: {
  item: (typeof roadmapItems)[0];
  delay: number;
  isLast: boolean;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <MotionBox
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.45, delay }}
    >
      <HStack align="flex-start" spacing={5}>
        {/* Timeline */}
        <VStack spacing={0} flexShrink={0}>
          <Box color={item.done ? "lp.green" : item.color}>
            {item.done ? <CheckCircle2 size={28} fill="currentColor" color="white" strokeWidth={0} style={{ background: "none" }} /> : <Circle size={28} />}
          </Box>
          {!isLast && <Box w="2px" h="80px" bg="lp.border" mt={1} />}
        </VStack>

        {/* Content */}
        <VStack align="flex-start" spacing={2} pb={isLast ? 0 : 8}>
          <HStack spacing={3} align="center">
            <Box
              bg={item.done ? "lp.greenLight" : `${item.color.replace("lp.", "lp.")}Light`.replace("lp.lpLight", "lp.purpleLight")}
              px={2.5}
              py={0.5}
              borderRadius="full"
            >
              <Text fontSize="xs" fontWeight="700" color={item.done ? "lp.green" : item.color} textTransform="uppercase" letterSpacing="0.06em">
                {item.phase}
              </Text>
            </Box>
            <Text fontWeight="700" fontSize="lg" color="lp.dark">{item.title}</Text>
          </HStack>
          <List spacing={1.5} pl={1}>
            {item.items.map((i) => (
              <ListItem key={i} fontSize="sm" color="lp.muted" display="flex" alignItems="center" gap={2}>
                <Box w="4px" h="4px" borderRadius="full" bg={item.color} flexShrink={0} />
                {i}
              </ListItem>
            ))}
          </List>
        </VStack>
      </HStack>
    </MotionBox>
  );
}

export function Roadmap() {
  const headingRef = useRef(null);
  const isInView = useInView(headingRef, { once: true });

  return (
    <Box id="roadmap" bg="lp.bg" py={{ base: 16, md: 24 }} borderTop="1px solid" borderColor="lp.border">
      <Container maxW="3xl">
        <VStack spacing={{ base: 12, md: 16 }}>
          <VStack spacing={3} ref={headingRef} textAlign="center" w="full">
            <MotionBox
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45 }}
            >
              <HStack justify="center" spacing={2} mb={2}>
                <Box w="32px" h="2px" bg="lp.purple" borderRadius="full" />
                <Text fontSize="xs" fontWeight="700" color="lp.purple" textTransform="uppercase" letterSpacing="0.1em">
                  Roadmap
                </Text>
                <Box w="32px" h="2px" bg="lp.purple" borderRadius="full" />
              </HStack>
              <Heading as="h2" fontSize={{ base: "3xl", md: "4xl" }} fontWeight="900" color="lp.dark" letterSpacing="-1px">
                Ship Log
              </Heading>
            </MotionBox>
          </VStack>

          <VStack align="flex-start" spacing={0} w="full">
            {roadmapItems.map((item, i) => (
              <RoadmapItem key={item.phase} item={item} delay={i * 0.12} isLast={i === roadmapItems.length - 1} />
            ))}
          </VStack>
        </VStack>
      </Container>
    </Box>
  );
}
