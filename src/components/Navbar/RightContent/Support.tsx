import { Box, Button, HStack, Icon, Text } from "@chakra-ui/react";
import React from "react";
import router from "next/router";
import { BiDonateHeart } from "react-icons/bi";
import { motion, useAnimation } from "framer-motion";

type SupportProps = {};

const Support: React.FC<SupportProps> = () => {
  const goToSupportPage = () => {
    router.push(`/support`); // Use router.push to navigate to the profile page
  };

  return (
    <Box justifyContent="center" alignItems="center">
      <Button
        variant="outline"
        height="30px"
        borderRadius="md"
        onClick={goToSupportPage}
      >
        <HStack>
          <Text>Support</Text>
          <Icon fontSize={19} as={BiDonateHeart} />
        </HStack>
      </Button>
    </Box>
  );
};
export default Support;
