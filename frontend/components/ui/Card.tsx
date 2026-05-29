"use client";

import { Box } from "@chakra-ui/react";
import { GeometricShape } from "./GeometricShape";

type AccentColor = "blue" | "green" | "pink" | "cyan";
type AccentShape = "circle" | "square" | "triangle";

// Neon / parrot background colors
const bgMap: Record<AccentColor, string> = {
  blue: "#DBEAFE",
  green: "#E2FF68",
  pink: "#E6E1FA",
  cyan: "#B7F6E7",
};

const shapeColorMap: Record<AccentColor, "blue" | "gold" | "teal"> = {
  blue: "blue",
  green: "teal",
  pink: "teal",
  cyan: "blue",
};

interface CardProps {
  children: React.ReactNode;
  accent?: AccentColor;
  shape?: AccentShape;
  h?: string;
}

export function Card({ children, accent = "green", shape = "circle", h }: CardProps) {
  return (
    <Box
      h={h}
      bg={bgMap[accent]}
      border="3px solid"
      borderColor="lp.black"
      boxShadow="4px 4px 0px 0px #0F172A"
      p={6}
      position="relative"
      outline="2px dashed"
      outlineColor="lp.black"
      outlineOffset="-8px"
      _hover={{ transform: "translateY(-2px)", boxShadow: "6px 6px 0px 0px #0F172A" }}
      transition="all 0.18s ease-out"
    >
      <Box mb={4}>
        <GeometricShape shape={shape} color={shapeColorMap[accent]} size="14px" />
      </Box>
      {children}
    </Box>
  );
}
