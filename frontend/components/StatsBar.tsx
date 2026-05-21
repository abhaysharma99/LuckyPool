"use client";

import { Box, Container, Flex, VStack, Text } from "@chakra-ui/react";
import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";

const MotionText = motion(Text);

function AnimatedNumber({ value, color = "#000000" }: { value: string; color?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!isInView) return;
    const match = value.match(/(\d+)/);
    if (!match) { setDisplay(value); return; }
    const target = parseInt(match[1]);
    const prefix = value.slice(0, value.indexOf(match[1]));
    const suffix = value.slice(value.indexOf(match[1]) + match[1].length);
    let cur = 0;
    const inc = target / 30;
    const t = setInterval(() => {
      cur += inc;
      if (cur >= target) { setDisplay(value); clearInterval(t); }
      else setDisplay(`${prefix}${Math.floor(cur)}${suffix}`);
    }, 30);
    return () => clearInterval(t);
  }, [isInView, value]);

  return (
    <MotionText
      ref={ref}
      fontSize={{ base: "xl", md: "5xl", lg: "6xl" }}
      fontWeight="black"
      color={color}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
    >
      {display}
    </MotionText>
  );
}

const stats = [
  { value: "$0", label: "Total Deposited", bg: "#CAFFB8", valueColor: "#3D7A29", labelColor: "#3D7A29" },
  { value: "$0", label: "Weekly Prize",    bg: "#3D7A29", valueColor: "white",    labelColor: "rgba(255,255,255,0.8)" },
  { value: "0",  label: "Winners Paid",   bg: "#F1F5EE", valueColor: "#000000",  labelColor: "#666666" },
];

export function StatsBar() {
  return (
    <Box borderY="1px solid" borderColor="#000000">
      <Container maxW="full" p={0}>
        <Flex direction={{ base: "column", md: "row" }}>
          {stats.map((s, i) => (
            <Box
              key={s.label}
              flex={1}
              bg={s.bg}
              py={{ base: 6, md: 10 }}
              px={{ base: 4, md: 8 }}
              borderRight={i < stats.length - 1 ? { md: "1px solid" } : "none"}
              borderBottom={i < stats.length - 1 ? { base: "1px solid", md: "none" } : "none"}
              borderColor="#000000"
              textAlign="center"
            >
              <VStack spacing={{ base: 1, md: 2 }}>
                <AnimatedNumber value={s.value} color={s.valueColor} />
                <Text
                  fontSize={{ base: "xs", md: "sm" }}
                  fontWeight="bold"
                  textTransform="uppercase"
                  letterSpacing="widest"
                  color={s.labelColor}
                >
                  {s.label}
                </Text>
              </VStack>
            </Box>
          ))}
        </Flex>
      </Container>
    </Box>
  );
}
