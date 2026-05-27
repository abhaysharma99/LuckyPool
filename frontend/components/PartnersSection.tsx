"use client";

import {
  Box, Container, Heading, Text, SimpleGrid, VStack, HStack,
} from "@chakra-ui/react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { TrendingUp, Wallet, ArrowRight, Users } from "lucide-react";
import { GeometricShape } from "./ui/GeometricShape";

const MotionBox = motion(Box);

const neonBgs = ["#E2FF68", "#E6E1FA", "#B7F6E7", "#E2FF68"];
const shapes: Array<"circle" | "square" | "triangle"> = ["circle", "square", "triangle", "circle"];
const shapeColors: Array<"blue" | "gold" | "teal"> = ["teal", "blue", "teal", "blue"];

const partners = [
  { icon: <TrendingUp size={22} />, name: "Blend", role: "Yield Source", desc: "USDC deposits flow into Blend lending pools. The interest is what funds every prize draw." },
  { icon: <Wallet size={22} />, name: "Sava", role: "Distribution", desc: "Stellar-native savings app. Existing savers migrate into LuckyPool with one tap." },
  { icon: <ArrowRight size={22} />, name: "SeevCash", role: "Remittance", desc: "Remittance users receive USDC on Stellar. Save the receive — enter the prize draw." },
  { icon: <Users size={22} />, name: "Fiatsend", role: "On-ramp", desc: "Users arriving with fiat-to-USDC can immediately start earning prize tickets inside LuckyPool." },
];

export function PartnersSection() {
  const headingRef = useRef(null);
  const isInView = useInView(headingRef, { once: true });

  return (
    <Box id="partners" bg="lp.background" pt={{ base: 10, md: 14 }} pb={{ base: 16, md: 24 }} borderTop="4px solid" borderColor="lp.black">
      <Container maxW="7xl">
        <VStack spacing={{ base: 12, md: 16 }}>
          <VStack spacing={4} ref={headingRef} textAlign="center">
            <MotionBox initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.45 }}>
              <Heading as="h2" fontSize={{ base: "3xl", md: "5xl" }} color="lp.black" textAlign="center" fontWeight="black">
                ECOSYSTEM PARTNERS
              </Heading>
            </MotionBox>
            <Box w="180px" h="4px" bg="lp.black" />
            <Text color="text.secondary" fontWeight="medium" maxW="lg" textAlign="center">
              LuckyPool doesn&apos;t acquire users directly — it embeds into apps where people already are.
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} w="full">
            {partners.map((p, i) => (
              <MotionBox
                key={p.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: i * 0.1 }}
                h="full"
              >
                <Box
                  h="full"
                  bg={neonBgs[i]}
                  border="3px solid"
                  borderColor="lp.black"
                  boxShadow="4px 4px 0px 0px #0F172A"
                  p={6}
                  outline="2px dashed"
                  outlineColor="lp.black"
                  outlineOffset="-8px"
                  _hover={{ transform: "translateY(-2px)", boxShadow: "6px 6px 0px 0px #0F172A" }}
                  transition="all 0.18s ease-out"
                >
                  <VStack align="flex-start" spacing={4} h="full">
                    <GeometricShape shape={shapes[i]} color={shapeColors[i]} size="14px" />
                    <Box p={2.5} border="3px solid" borderColor="lp.black" bg="lp.background" display="inline-flex">
                      {p.icon}
                    </Box>
                    <Box>
                      <Box
                        display="inline-block"
                        bg="lp.black"
                        color="white"
                        px={2}
                        py={0.5}
                        fontSize="2xs"
                        fontWeight="black"
                        textTransform="uppercase"
                        letterSpacing="wider"
                        mb={1}
                      >
                        {p.role}
                      </Box>
                      <Heading as="h3" size="md" textTransform="uppercase" color="lp.black">{p.name}</Heading>
                    </Box>
                    <Text color="lp.black" fontWeight="medium" fontSize="sm" lineHeight="1.7" opacity={0.75}>{p.desc}</Text>
                  </VStack>
                </Box>
              </MotionBox>
            ))}
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );
}
