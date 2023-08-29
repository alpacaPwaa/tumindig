import { ChevronUpIcon, ChevronDownIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Divider,
  Flex,
  Icon,
  Spinner,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { updateDoc, doc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { AiFillDelete } from "react-icons/ai";
import { useRecoilState, useSetRecoilState } from "recoil";
import { Community, communityState } from "../../../atoms/communitiesAtom";
import { auth, firestore, storage } from "../../../firebase/clientApp";
import { IoMdAddCircleOutline } from "react-icons/io";
import ResizeTextarea from "react-textarea-autosize";

type RulesProps = {
  communityData: Community;
  pt?: number;
  onCreatePage?: boolean;
  loading?: boolean;
};

const Rules: React.FC<RulesProps> = ({ communityData }) => {
  const setCommunityStateValue = useSetRecoilState(communityState);
  const [user] = useAuthState(auth);
  const [rules, setRules] = useState<{ title: string; body: string }[]>([]);
  const [newRule, setNewRule] = useState<{ title: string; body: string }>({
    title: "",
    body: "",
  });
  const [isEditingRules, setIsEditingRules] = useState(false);
  const [ruleDisplays, setRuleDisplays] = useState<boolean[]>([]);
  const [savingRule, setSavingRule] = useState(false);
  const [deletingRule, setDeletingRule] = useState(false);
  const [communityStateValue] = useRecoilState(communityState);

  const handleAddRule = () => {
    setIsEditingRules(true);
  };

  const handleSaveNewRule = async () => {
    setSavingRule(true);
    try {
      const updatedRules = [...rules, newRule];
      await updateDoc(doc(firestore, "communities", communityData.id), {
        rules: updatedRules,
      });
      setCommunityStateValue((prev) => ({
        ...prev,
        currentCommunity: {
          ...prev.currentCommunity,
          rules: updatedRules,
        },
      }));
      setRules(updatedRules);
      setNewRule({ title: "", body: "" });
      setIsEditingRules(false);
    } catch (error: any) {
      console.log("handleSaveNewRule error", error.message);
    }
    setSavingRule(false);
  };

  const handleDeleteRules = async (index: number) => {
    setDeletingRule(true);
    try {
      const updatedRules = [...rules];
      updatedRules.splice(index, 1);
      await updateDoc(doc(firestore, "communities", communityData.id), {
        rules: updatedRules,
      });
      setCommunityStateValue((prev) => ({
        ...prev,
        currentCommunity: {
          ...prev.currentCommunity,
          rules: updatedRules,
        },
      }));
      setRules(updatedRules); // Update state with new rules array
    } catch (error: any) {
      console.log("handleDeleteRules error", error.message);
    }
    setDeletingRule(false);
  };

  useEffect(() => {
    const communityRules = communityData.rules || [];
    const initialRules =
      communityRules.length > 0 && communityRules[0].title === ""
        ? communityRules.slice(1)
        : communityRules;
    setRules(initialRules);
    setRuleDisplays(initialRules.map(() => false));
  }, [communityData]);

  const isUserModerator = !!communityStateValue.moderatorSnippets.find(
    (snippet) =>
      snippet.communityId === communityData.id &&
      snippet.isModerator === true &&
      snippet.userUid === user?.uid
  );

  return (
    <Box>
      <Flex
        p="5px 12px 12px 12px"
        direction="column"
        bg="white"
        borderRadius="0px 0px 4px 4px"
        mt={5}
      >
        <Flex
          justify="space-between"
          align="center"
          p={3}
          borderRadius="4px 4px 0px 0px"
        >
          <Text fontSize="11pt" fontWeight={600}>
            Rules
          </Text>
        </Flex>
        <Divider />
        <Text fontSize="10pt" color="gray.500" p={1} mt={1}>
          Welcome to our community! To ensure a positive experience for all
          members, we kindly ask everyone to abide by the rules.
        </Text>
        {isEditingRules ? (
          <Flex flexDirection="column">
            <Stack>
              <Textarea
                value={newRule.title}
                placeholder="Title"
                disabled={savingRule}
                onChange={(e) =>
                  setNewRule({ ...newRule, title: e.target.value })
                }
                as={ResizeTextarea}
                minHeight="55px"
                _focus={{
                  outline: "none",
                  bg: "white",
                  border: "1px solid",
                  borderColor: "black",
                }}
              />
              <Textarea
                placeholder="Body"
                disabled={savingRule}
                value={newRule.body}
                onChange={(e) =>
                  setNewRule({ ...newRule, body: e.target.value })
                }
                as={ResizeTextarea}
                minHeight="85px"
                _focus={{
                  outline: "none",
                  bg: "white",
                  border: "1px solid",
                  borderColor: "black",
                }}
              />
            </Stack>
            <Flex flexDirection="row" mt={2}>
              <Button
                variant="solid"
                size="sm"
                width="50%"
                isLoading={savingRule}
                mr={2}
                ml={2}
                fontSize="13"
                onClick={handleSaveNewRule}
              >
                <Text fontWeight={600} fontSize="10pt">
                  Save
                </Text>
              </Button>
              <Button
                variant="outline"
                size="sm"
                width="50%"
                mr={2}
                fontSize="13"
                onClick={() => setIsEditingRules(false)}
              >
                Cancel
              </Button>
            </Flex>
          </Flex>
        ) : (
          <>
            {rules.map((rule, index) => (
              <Box key={index} p={2}>
                <Flex justify="space-between" align="center">
                  <Text fontWeight={600} fontSize="11pt" pl={2}>
                    {rule.title}
                  </Text>
                  <Flex cursor="pointer" align="center">
                    {ruleDisplays[index] ? (
                      <Button variant="ghost" size="sm" position="relative">
                        <Icon
                          as={ChevronUpIcon}
                          fontSize="18px"
                          position="absolute"
                          alignItems="center"
                          justifyContent="center"
                          color="gray.500"
                          onClick={() => {
                            const newRuleDisplays = [...ruleDisplays];
                            newRuleDisplays[index] = !newRuleDisplays[index];
                            setRuleDisplays(newRuleDisplays);
                          }}
                        />
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm" position="relative">
                        <Icon
                          as={ChevronDownIcon}
                          fontSize="18px"
                          position="absolute"
                          alignItems="center"
                          justifyContent="center"
                          color="gray.500"
                          onClick={() => {
                            const newRuleDisplays = [...ruleDisplays];
                            newRuleDisplays[index] = !newRuleDisplays[index];
                            setRuleDisplays(newRuleDisplays);
                          }}
                        />
                      </Button>
                    )}
                    {user &&
                      (user.uid === communityData.creatorId ||
                        isUserModerator) && (
                        <Button
                          variant="ghost"
                          position="relative"
                          isLoading={deletingRule}
                          size="sm"
                          color="blue.500"
                          fontWeight={600}
                          fontSize="10pt"
                          onClick={() => handleDeleteRules(index)}
                        >
                          <Icon
                            fontSize="13pt"
                            color="gray.500"
                            position="absolute"
                            as={AiFillDelete}
                          />
                        </Button>
                      )}
                  </Flex>
                </Flex>
                {ruleDisplays[index] && (
                  <Text fontSize="11pt" pl={2}>
                    {rule.body}
                  </Text>
                )}
                {index !== rules.length - 1}
              </Box>
            ))}
            {user &&
              (user.uid === communityData.creatorId || isUserModerator) && (
                <>
                  <Divider />
                  <Button
                    color="blue.500"
                    fontSize="10pt"
                    variant="ghost"
                    onClick={handleAddRule}
                    mt={2}
                  >
                    <Icon
                      as={IoMdAddCircleOutline}
                      mr={2}
                      fontSize="18px"
                      color="blue.500"
                      cursor="pointer"
                    />
                    ADD RULES
                  </Button>
                </>
              )}
          </>
        )}
      </Flex>
    </Box>
  );
};
export default Rules;
