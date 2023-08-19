import { Stack, Flex, SkeletonCircle, Skeleton } from "@chakra-ui/react";
import React from "react";

type LoaderProps = {};

const Loader: React.FC<LoaderProps> = () => {
  return (
    <Stack spacing={2}>
      <Flex
        justify="space-between"
        align="center"
        bg="white"
        p={2}
        borderRadius={4}
      >
        <SkeletonCircle size="8" mr={2} p={4} />
        <Flex flexDirection="column" width="100%">
          <Skeleton height="10px" width="10%" mb={1} />
          <Skeleton height="10px" width="60%" />
        </Flex>
        <SkeletonCircle size="6" width="15%" mr={2} />
      </Flex>
      <Flex
        justify="space-between"
        align="center"
        bg="white"
        p={2}
        borderRadius={4}
      >
        <SkeletonCircle size="8" mr={2} p={4} />
        <Flex flexDirection="column" width="100%">
          <Skeleton height="10px" width="10%" mb={1} />
          <Skeleton height="10px" width="60%" />
        </Flex>
        <SkeletonCircle size="6" width="15%" mr={2} />
      </Flex>
      <Flex
        justify="space-between"
        align="center"
        bg="white"
        p={2}
        borderRadius={4}
      >
        <SkeletonCircle size="8" mr={2} p={4} />
        <Flex flexDirection="column" width="100%">
          <Skeleton height="10px" width="10%" mb={1} />
          <Skeleton height="10px" width="60%" />
        </Flex>
        <SkeletonCircle size="6" width="15%" mr={2} />
      </Flex>
      <Flex
        justify="space-between"
        align="center"
        bg="white"
        p={2}
        borderRadius={4}
      >
        <SkeletonCircle size="8" mr={2} p={4} />
        <Flex flexDirection="column" width="100%">
          <Skeleton height="10px" width="10%" mb={1} />
          <Skeleton height="10px" width="60%" />
        </Flex>
        <SkeletonCircle size="6" width="15%" mr={2} />
      </Flex>
      <Flex
        justify="space-between"
        align="center"
        bg="white"
        p={2}
        borderRadius={4}
      >
        <SkeletonCircle size="8" mr={2} p={4} />
        <Flex flexDirection="column" width="100%">
          <Skeleton height="10px" width="10%" mb={1} />
          <Skeleton height="10px" width="60%" />
        </Flex>
        <SkeletonCircle size="6" width="15%" mr={2} />
      </Flex>
      <Flex
        justify="space-between"
        align="center"
        bg="white"
        p={2}
        borderRadius={4}
      >
        <SkeletonCircle size="8" mr={2} p={4} />
        <Flex flexDirection="column" width="100%">
          <Skeleton height="10px" width="10%" mb={1} />
          <Skeleton height="10px" width="60%" />
        </Flex>
        <SkeletonCircle size="6" width="15%" mr={2} />
      </Flex>
    </Stack>
  );
};
export default Loader;
