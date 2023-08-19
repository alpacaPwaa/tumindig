import React from "react";
import { Box, Flex } from "@chakra-ui/react";

interface PageContentLayoutProps {
  maxWidth?: string;
  children?: React.ReactNode;
}

// Assumes array of two children are passed
const PageContentLayout: React.FC<PageContentLayoutProps> = ({
  children,
  maxWidth,
}) => {
  return (
    <Flex alignItems="center" flexDirection="column">
      <Flex direction="column" width="100%">
        {children && children[0 as keyof typeof children]}
      </Flex>
      <Flex pt="16px" width="95%" maxWidth={maxWidth || "860px"}>
        <Flex
          direction="column"
          width={{ base: "100%", md: "65%" }}
          mr={{ base: 0, md: 6 }}
        >
          {children && children[1 as keyof typeof children]}
        </Flex>
        {/* Right Content */}
        <Box
          display={{ base: "none", md: "flex" }}
          flexDirection="column"
          maxWidth="35%"
        >
          {children && children[2 as keyof typeof children]}
        </Box>
      </Flex>
    </Flex>
  );
};

export default PageContentLayout;
