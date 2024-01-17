import { Flex, HStack, Text, useMediaQuery, VStack } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";

type SupportProps = {};

const Support: React.FC<SupportProps> = () => {
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const [md] = useMediaQuery("(min-width: 768px)");

  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://www.paypal.com/sdk/js?client-id=ARhMaIoB-D60DKBQ6EVXj_nr11rR_-ZGMBc2Oo8ipyBG1joT3j0yidFgJ5ju2P8jlo-Xln9wK-dAA8OD&vault=true&intent=subscription";
    script.async = true;

    document.body.appendChild(script);

    script.onload = () => {
      (window as any).paypal
        .Buttons({
          style: {
            shape: "rect",
            color: "gold",
            layout: "vertical",
            label: "paypal",
          },
          createSubscription: function (data: any, actions: any) {
            return actions.subscription.create({
              plan_id: "P-0RP87447W25374028MWLAPGY",
            });
          },
          onApprove: function (data: any, actions: any) {
            setCurrentBalance(
              (prevBalance) =>
                prevBalance + parseFloat(data.purchase_units[0].amount.value)
            );
            alert(data.subscriptionID);
          },
        })
        .render("#paypal-button-container-P-0RP87447W25374028MWLAPGY");

      (window as any).paypal
        .Buttons({
          style: {
            shape: "rect",
            color: "gold",
            layout: "vertical",
            label: "paypal",
          },
          createSubscription: function (data: any, actions: any) {
            return actions.subscription.create({
              plan_id: "P-24A24233V8952833TMWLCWQQ",
            });
          },
          onApprove: function (data: any, actions: any) {
            setCurrentBalance(
              (prevBalance) =>
                prevBalance + parseFloat(data.purchase_units[0].amount.value)
            );
            alert(data.subscriptionID);
          },
        })
        .render("#paypal-button-container-P-24A24233V8952833TMWLCWQQ");

      (window as any).paypal
        .Buttons({
          style: {
            shape: "rect",
            color: "gold",
            layout: "vertical",
            label: "paypal",
          },
          createSubscription: function (data: any, actions: any) {
            return actions.subscription.create({
              plan_id: "P-90W569380X004850HMWLDEVI",
            });
          },
          onApprove: function (data: any, actions: any) {
            setCurrentBalance(
              (prevBalance) =>
                prevBalance + parseFloat(data.purchase_units[0].amount.value)
            );
            alert(data.subscriptionID);
          },
        })
        .render("#paypal-button-container-P-90W569380X004850HMWLDEVI");
    };

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
    //eslint-disable-next-line
  }, []);

  return (
    <Flex
      p={md ? "30px 60px 10px 60px" : 3}
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <VStack
        fontSize="11pt"
        borderRadius="md"
        p={md ? "20px 60px 20px 60px" : 3}
        spacing={4}
        mb={5}
      >
        {/* <Progress mt={3} value={progress} size="lg" />
        <HStack flexDirection="row" spacing={20}>
          <VStack spacing={1} flexDirection="column" justifyContent="center">
            <Text fontSize="12pt" fontWeight={600}>
              ${goal}
            </Text>
            <Text>Goal</Text>
          </VStack>
          <VStack spacing={1} flexDirection="column">
            <Text fontSize="12pt" fontWeight={600}>
              ${currentBalance}
            </Text>
            <Text>Donations</Text>
          </VStack>
          <VStack spacing={1} flexDirection="column">
            <Text fontSize="12pt" fontWeight={600}>
              ${currentBalance}
            </Text>
            <Text>Raised</Text>
          </VStack>
        </HStack> */}
        <Text fontWeight={600} fontSize="13pt">
          Building Tumndig solo, fueled by passion and maybe a little too much
          coffee. Help keep the caffeine flowing with a donation.
        </Text>
        <Text>
          Hey Tumndig fam, Remember that meme about ramen noodles being the
          official food of college students? Yeah, that&apos;s basically my life
          right now. But hey, sacrifices are made in the pursuit of passion,
          right? Especially when that passion involves creating the awesome
          website you&apos;re browsing right now. The thing is, server bills
          aren&apos;t exactly ramen-friendly. So, if you enjoy this website
          without getting bombarded with pop-up ads (you&apos;re welcome!), then
          maybe consider tossing a few bucks my way. Think of it as an
          investment in good vibes, community spirit, and endless
          procrastination material (wink wink). Your support helps keep this
          virtual haven afloat and fuels my caffeine-powered coding sprees. So,
          if you&apos;re feeling generous (or just guilty about all the hours
          you&apos;ve spent here), hit that donate button and join the crew of
          Tumndig superheroes!
        </Text>
      </VStack>

      <Flex
        flexDirection={md ? "row" : "column"}
        justifyContent={md ? "space-between" : ""}
      >
        <Flex
          flexDirection="column"
          width={md ? "32%" : ""}
          backgroundColor="white"
          borderRadius="md"
          p={3}
          textAlign="center"
          mb={md ? "" : "10px"}
        >
          <VStack spacing={5}>
            <VStack>
              <Text fontWeight={600} fontSize="12pt">
                Support
              </Text>
              <Text fontSize="10pt">
                Your love keeps Tumndig thriving! If you find value in what we
                do, consider supporting us with a donation.
              </Text>
            </VStack>
            <VStack spacing={0}>
              <HStack>
                <Text fontSize="13pt">$</Text>
                <Text fontSize="50pt">1.99</Text>
              </HStack>
              <Text fontSize="13pt">USD/month</Text>
            </VStack>
            <div id="paypal-button-container-P-0RP87447W25374028MWLAPGY"></div>
          </VStack>
        </Flex>

        <Flex
          flexDirection="column"
          width={md ? "32%" : ""}
          backgroundColor="white"
          borderRadius="md"
          p={3}
          textAlign="center"
          mb={md ? "" : "10px"}
        >
          <VStack spacing={5}>
            <VStack>
              <Text fontWeight={600} fontSize="12pt">
                Superhero
              </Text>
              <Text fontSize="10pt">
                Your love keeps Tumndig thriving! If you find value in what we
                do, consider supporting us with a donation.
              </Text>
            </VStack>
            <VStack spacing={0}>
              <HStack>
                <Text fontSize="13pt">$</Text>
                <Text fontSize="50pt">4.99</Text>
              </HStack>
              <Text fontSize="13pt">USD/month</Text>
            </VStack>
            <div id="paypal-button-container-P-24A24233V8952833TMWLCWQQ"></div>
          </VStack>
        </Flex>

        <Flex
          flexDirection="column"
          width={md ? "32%" : ""}
          backgroundColor="white"
          borderRadius="md"
          p={3}
          textAlign="center"
        >
          <VStack spacing={5}>
            <VStack>
              <Text fontWeight={600} fontSize="12pt">
                Unicorn
              </Text>
              <Text fontSize="10pt">
                Your love keeps Tumndig thriving! If you find value in what we
                do, consider supporting us with a donation.
              </Text>
            </VStack>
            <VStack spacing={0}>
              <HStack>
                <Text fontSize="13pt">$</Text>
                <Text fontSize="50pt">9.99</Text>
              </HStack>
              <Text fontSize="13pt">USD/month</Text>
            </VStack>
            <div id="paypal-button-container-P-90W569380X004850HMWLDEVI"></div>
          </VStack>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default Support;
