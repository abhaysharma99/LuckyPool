"use client";

import { Box, HStack, Text } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";

const MotionBox = motion(Box);

const baseWinners = [
  { name: "Amara K.", amount: "$240", when: "2 days ago" },
  { name: "David M.", amount: "$95", when: "1 week ago" },
  { name: "Priya S.", amount: "$510", when: "2 weeks ago" },
  { name: "James O.", amount: "$180", when: "3 weeks ago" },
  { name: "Lena V.", amount: "$320", when: "1 month ago" },
  { name: "Kwame A.", amount: "$75", when: "1 month ago" },
  { name: "Sofia R.", amount: "$430", when: "6 weeks ago" },
  { name: "Yusuf H.", amount: "$150", when: "2 months ago" },
];

const winners = [...baseWinners, ...baseWinners];

export function PrizeBanner() {
  return (
    <Box bg="#CAFFB8" borderBottom="1px solid" borderColor="#000000" py={2.5} overflow="hidden">
      <MotionBox
        display="flex"
        gap={10}
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        whiteSpace="nowrap"
      >
        {winners.map((w, i) => (
          <HStack key={i} spacing={3} flexShrink={0}>
            <Box color="#3D7A29"><Trophy size={11} /></Box>
            <Text color="#3D7A29" fontSize="xs" fontWeight="800" letterSpacing="0.05em">{w.name}</Text>
            <Text color="#666666" fontSize="xs" fontWeight="600">won</Text>
            <Box bg="#3D7A29" border="1px solid" borderColor="#000000" px={2} py={0.5}>
              <Text color="white" fontSize="xs" fontWeight="black" letterSpacing="wider">{w.amount} USDC</Text>
            </Box>
            <Text color="#888888" fontSize="xs" fontWeight="500">{w.when}</Text>
            <Box w="6px" h="6px" bg="#3D7A29" transform="rotate(45deg)" flexShrink={0} />
          </HStack>
        ))}
      </MotionBox>
    </Box>
  );
}
