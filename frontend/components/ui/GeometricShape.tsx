"use client";

import { Box, HStack } from "@chakra-ui/react";

type Shape = "circle" | "square" | "triangle";
type Color = "blue" | "gold" | "teal";

interface GeometricShapeProps {
  shape: Shape;
  color: Color;
  size?: string | number;
  filled?: boolean;
}

const colorMap: Record<Color, string> = {
  blue: "#1D4ED8",
  teal: "#B7F6E7",
  gold: "#E2FF68",
};

export function GeometricShape({ shape, color, size = "24px", filled = true }: GeometricShapeProps) {
  const bg = filled ? colorMap[color] : "transparent";

  if (shape === "circle") {
    return <Box w={size} h={size} borderRadius="full" bg={bg} border="2px solid" borderColor="lp.black" />;
  }
  if (shape === "square") {
    return <Box w={size} h={size} bg={bg} border="2px solid" borderColor="lp.black" transform="rotate(45deg)" />;
  }
  return (
    <Box
      w={0} h={0}
      borderLeft={`${typeof size === "number" ? size / 2 : "12px"} solid transparent`}
      borderRight={`${typeof size === "number" ? size / 2 : "12px"} solid transparent`}
      borderBottom={`${size} solid`}
      borderBottomColor={filled ? colorMap[color] : "lp.black"}
    />
  );
}

export function LogoShapes({ size = "12px" }: { size?: string }) {
  return (
    <HStack spacing={1}>
      <Box w={size} h={size} borderRadius="full" bg="#E6E1FA" border="2px solid" borderColor="lp.black" />
      <Box w={size} h={size} bg="#B7F6E7" transform="rotate(45deg)" border="2px solid" borderColor="lp.black" />
      <Box w={size} h={size} bg="#E2FF68" border="2px solid" borderColor="lp.black" />
    </HStack>
  );
}
