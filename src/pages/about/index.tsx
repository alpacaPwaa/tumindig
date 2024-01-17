import {
  VStack,
  Text,
  useMediaQuery,
  ListItem,
  UnorderedList,
} from "@chakra-ui/react";
import React from "react";

type aboutProps = {};

const about: React.FC<aboutProps> = () => {
  const [md] = useMediaQuery("(min-width: 768px)");

  return (
    <VStack
      fontSize="11pt"
      borderRadius="md"
      p={md ? "20px 60px 20px 60px" : 3}
      spacing={4}
      m={10}
    >
      <Text fontWeight={600} fontSize="13pt">
        Welcome to Tumndig: Empowering Advocates for Impactful Change!
      </Text>
      <Text>
        At Tumndig, we&apos;ve set out to redefine the way advocates connect,
        collaborate, and drive positive change. Our platform is more than just a
        website; it&apos;s a dynamic ecosystem designed to be the heartbeat of
        advocacy movements around the world.
      </Text>
      <Text fontWeight={600} fontSize="13pt">
        Our Mission:
      </Text>
      <Text>
        Rooted in the belief that collective action drives meaningful change,
        Tumndig is on a mission to provide a digital space where advocates and
        advocacy organizations can unite, collaborate, and amplify their voices.
        We&apos;re here to empower individuals and groups who are passionate
        about making a difference in various fields, from social justice and
        environmental sustainability to healthcare and beyond.
      </Text>
      <Text fontWeight={600} fontSize="13pt">
        Community-Driven Advocacy:
      </Text>
      <Text>
        Central to our platform is the power of community. Advocates can create
        their own spaces tailored to their cause, fostering connections and
        sparking conversations that lead to tangible results. Engage in
        discussions through forums, threads, live chats, and events, creating a
        vibrant and inclusive environment where ideas flourish.
      </Text>
      <Text fontWeight={600} fontSize="13pt">
        Key Features:
      </Text>
      <UnorderedList>
        <ListItem>
          Customizable Communities: Tailor your advocacy hub to reflect your
          values and goals.
        </ListItem>
        <ListItem>
          Dynamic Discussion Tools: From threaded conversations to polls and
          multimedia sharing, we offer tools that facilitate robust
          interactions.
        </ListItem>
        <ListItem>
          Event Hosting: Plan and promote events directly on Tumndig, fostering
          a sense of unity and shared purpose.
        </ListItem>
        <ListItem>
          Resource Sharing: Centralize your advocacy materials, research, and
          resources, creating a knowledge hub for your community.
        </ListItem>
      </UnorderedList>
      <Text fontWeight={600} fontSize="13pt">
        Amplify Your Reach:
      </Text>
      <Text>
        Tumndig is not just a platform; it&apos;s a springboard for amplifying
        your advocacy reach. Utilize our tools to connect with a broader
        audience, attract new advocates, and collaborate with organizations that
        share your vision.
      </Text>
      <Text fontWeight={600} fontSize="13pt">
        Safe and Inclusive:
      </Text>
      <Text>
        We prioritize the security and inclusivity of Tumndig. Feel confident in
        sharing your thoughts and ideas within a respectful environment
        dedicated to fostering positive change.
      </Text>
      <Text fontWeight={600} fontSize="13pt">
        Join the Advocacy Revolution:
      </Text>
      <Text>
        This isn&apos;t just a website; it&apos;s a movement. Tumndig invites
        you to be part of a revolutionary journey where advocacy transcends
        boundaries and becomes a collective force for good.
      </Text>
      <Text>
        Ready to embark on your advocacy journey? Dive in today at Tumndig and
        let&apos;s transform conversations into actions!
      </Text>
      <Text fontWeight={600} fontSize="13pt">
        Together, Let&apos;s Shape the Future!
      </Text>
    </VStack>
  );
};
export default about;
