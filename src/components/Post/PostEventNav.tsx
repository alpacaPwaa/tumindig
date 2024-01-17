import { ChevronDownIcon } from "@chakra-ui/icons";
import {
  HStack,
  Button,
  Flex,
  Text,
  Divider,
  Menu,
  MenuButton,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  MenuItem,
  useMediaQuery,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { FixedSizeList } from "react-window";
import { auth } from "../../firebase/clientApp";

type Country = {
  value: string;
  label: string;
};

type Tags = {
  value: string;
  label: string;
};

type PostEventNavProps = {
  onSelectCountry: (selectedCountry: string) => void;
  onSelectTags: (selectedTags: string) => void;
};

const PostEventNav: React.FC<PostEventNavProps> = ({
  onSelectCountry,
  onSelectTags,
}) => {
  const router = useRouter();
  const [user, loadingUser] = useAuthState(auth);
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [showList, setShowList] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string>("");
  const [md] = useMediaQuery("(min-width: 768px)");
  const countries: Country[] = [
    { value: "", label: "All" },
    { value: "Afghanistan", label: "Afghanistan" },
    { value: "Albania", label: "Albania" },
    { value: "Algeria", label: "Algeria" },
    { value: "Andorra", label: "Andorra" },
    { value: "Angola", label: "Angola" },
    { value: "Antigua and Barbuda", label: "Antigua and Barbuda" },
    { value: "Argentina", label: "Argentina" },
    { value: "Armenia", label: "Armenia" },
    { value: "Australia", label: "Australia" },
    { value: "Austria", label: "Austria" },
    { value: "Azerbaijan", label: "Azerbaijan" },
    { value: "Bahamas", label: "Bahamas" },
    { value: "Bahrain", label: "Bahrain" },
    { value: "Bangladesh", label: "Bangladesh" },
    { value: "Barbados", label: "Barbados" },
    { value: "Belarus", label: "Belarus" },
    { value: "Belgium", label: "Belgium" },
    { value: "Belize", label: "Belize" },
    { value: "Benin", label: "Benin" },
    { value: "Bhutan", label: "Bhutan" },
    { value: "Bolivia", label: "Bolivia" },
    { value: "Bosnia and Herzegovina", label: "Bosnia and Herzegovina" },
    { value: "Botswana", label: "Botswana" },
    { value: "Brazil", label: "Brazil" },
    { value: "Brunei", label: "Brunei" },
    { value: "Bulgaria", label: "Bulgaria" },
    { value: "Burkina Faso", label: "Burkina Faso" },
    { value: "Burundi", label: "Burundi" },
    { value: "Cabo Verde", label: "Cabo Verde" },
    { value: "Cambodia", label: "Cambodia" },
    { value: "Cameroon", label: "Cameroon" },
    { value: "Canada", label: "Canada" },
    { value: "Central African Republic", label: "Central African Republic" },
    { value: "Chad", label: "Chad" },
    { value: "Chile", label: "Chile" },
    { value: "China", label: "China" },
    { value: "Colombia", label: "Colombia" },
    { value: "Comoros", label: "Comoros" },
    { value: "Congo", label: "Congo" },
    { value: "Costa Rica", label: "Costa Rica" },
    { value: "Côte d'Ivoire", label: "Côte d'Ivoire" },
    { value: "Croatia", label: "Croatia" },
    { value: "Cuba", label: "Cuba" },
    { value: "Cyprus", label: "Cyprus" },
    { value: "Czech Republic", label: "Czech Republic" },
    { value: "Denmark", label: "Denmark" },
    { value: "Djibouti", label: "Djibouti" },
    { value: "Dominica", label: "Dominica" },
    { value: "Dominican Republic", label: "Dominican Republic" },
    { value: "East Timor", label: "East Timor" },
    { value: "Ecuador", label: "Ecuador" },
    { value: "Egypt", label: "Egypt" },
    { value: "El Salvador", label: "El Salvador" },
    { value: "Equatorial Guinea", label: "Equatorial Guinea" },
    { value: "Eritrea", label: "Eritrea" },
    { value: "Estonia", label: "Estonia" },
    { value: "Eswatini", label: "Eswatini" },
    { value: "Ethiopia", label: "Ethiopia" },
    { value: "Fiji", label: "Fiji" },
    { value: "Finland", label: "Finland" },
    { value: "France", label: "France" },
    { value: "Gabon", label: "Gabon" },
    { value: "Gambia", label: "Gambia" },
    { value: "Georgia", label: "Georgia" },
    { value: "Germany", label: "Germany" },
    { value: "Ghana", label: "Ghana" },
    { value: "Greece", label: "Greece" },
    { value: "Grenada", label: "Grenada" },
    { value: "Guatemala", label: "Guatemala" },
    { value: "Guinea", label: "Guinea" },
    { value: "Guinea-Bissau", label: "Guinea-Bissau" },
    { value: "Guyana", label: "Guyana" },
    { value: "Haiti", label: "Haiti" },
    { value: "Honduras", label: "Honduras" },
    { value: "Hungary", label: "Hungary" },
    { value: "Iceland", label: "Iceland" },
    { value: "India", label: "India" },
    { value: "Indonesia", label: "Indonesia" },
    { value: "Iran", label: "Iran" },
    { value: "Iraq", label: "Iraq" },
    { value: "Ireland", label: "Ireland" },
    { value: "Israel", label: "Israel" },
    { value: "Italy", label: "Italy" },
    { value: "Jamaica", label: "Jamaica" },
    { value: "Japan", label: "Japan" },
    { value: "Jordan", label: "Jordan" },
    { value: "Kazakhstan", label: "Kazakhstan" },
    { value: "Kenya", label: "Kenya" },
    { value: "Kiribati", label: "Kiribati" },
    { value: "Korea, North", label: "Korea, North" },
    { value: "Korea, South", label: "Korea, South" },
    { value: "Kosovo", label: "Kosovo" },
    { value: "Kuwait", label: "Kuwait" },
    { value: "Kyrgyzstan", label: "Kyrgyzstan" },
    { value: "Laos", label: "Laos" },
    { value: "Latvia", label: "Latvia" },
    { value: "Lebanon", label: "Lebanon" },
    { value: "Lesotho", label: "Lesotho" },
    { value: "Liberia", label: "Liberia" },
    { value: "Libya", label: "Libya" },
    { value: "Liechtenstein", label: "Liechtenstein" },
    { value: "Lithuania", label: "Lithuania" },
    { value: "Luxembourg", label: "Luxembourg" },
    { value: "Madagascar", label: "Madagascar" },
    { value: "Malawi", label: "Malawi" },
    { value: "Malaysia", label: "Malaysia" },
    { value: "Maldives", label: "Maldives" },
    { value: "Mali", label: "Mali" },
    { value: "Malta", label: "Malta" },
    { value: "Marshall Islands", label: "Marshall Islands" },
    { value: "Mauritania", label: "Mauritania" },
    { value: "Mauritius", label: "Mauritius" },
    { value: "Mexico", label: "Mexico" },
    { value: "Micronesia", label: "Micronesia" },
    { value: "Moldova", label: "Moldova" },
    { value: "Monaco", label: "Monaco" },
    { value: "Mongolia", label: "Mongolia" },
    { value: "Montenegro", label: "Montenegro" },
    { value: "Morocco", label: "Morocco" },
    { value: "Mozambique", label: "Mozambique" },
    { value: "Myanmar", label: "Myanmar" },
    { value: "Namibia", label: "Namibia" },
    { value: "Nauru", label: "Nauru" },
    { value: "Nepal", label: "Nepal" },
    { value: "Netherlands", label: "Netherlands" },
    { value: "New Zealand", label: "New Zealand" },
    { value: "Nicaragua", label: "Nicaragua" },
    { value: "Niger", label: "Niger" },
    { value: "Nigeria", label: "Nigeria" },
    { value: "North Macedonia", label: "North Macedonia" },
    { value: "Norway", label: "Norway" },
    { value: "Oman", label: "Oman" },
    { value: "Pakistan", label: "Pakistan" },
    { value: "Palau", label: "Palau" },
    { value: "Panama", label: "Panama" },
    { value: "Papua New Guinea", label: "Papua New Guinea" },
    { value: "Paraguay", label: "Paraguay" },
    { value: "Peru", label: "Peru" },
    { value: "Philippines", label: "Philippines" },
    { value: "Poland", label: "Poland" },
    { value: "Portugal", label: "Portugal" },
    { value: "Qatar", label: "Qatar" },
    { value: "Romania", label: "Romania" },
    { value: "Russia", label: "Russia" },
    { value: "Rwanda", label: "Rwanda" },
    { value: "Saint Kitts and Nevis", label: "Saint Kitts and Nevis" },
    { value: "Saint Lucia", label: "Saint Lucia" },
    {
      value: "Saint Vincent and the Grenadines",
      label: "Saint Vincent and the Grenadines",
    },
    { value: "Samoa", label: "Samoa" },
    { value: "San Marino", label: "San Marino" },
    { value: "Sao Tome and Principe", label: "Sao Tome and Principe" },
    { value: "Saudi Arabia", label: "Saudi Arabia" },
    { value: "Senegal", label: "Senegal" },
    { value: "Serbia", label: "Serbia" },
    { value: "Seychelles", label: "Seychelles" },
    { value: "Sierra Leone", label: "Sierra Leone" },
    { value: "Singapore", label: "Singapore" },
    { value: "Slovakia", label: "Slovakia" },
    { value: "Slovenia", label: "Slovenia" },
    { value: "Solomon Islands", label: "Solomon Islands" },
    { value: "Somalia", label: "Somalia" },
    { value: "South Africa", label: "South Africa" },
    { value: "South Sudan", label: "South Sudan" },
    { value: "Spain", label: "Spain" },
    { value: "Sri Lanka", label: "Sri Lanka" },
    { value: "Sudan", label: "Sudan" },
    { value: "Suriname", label: "Suriname" },
    { value: "Sweden", label: "Sweden" },
    { value: "Switzerland", label: "Switzerland" },
    { value: "Syria", label: "Syria" },
    { value: "Taiwan", label: "Taiwan" },
    { value: "Tajikistan", label: "Tajikistan" },
    { value: "Tanzania", label: "Tanzania" },
    { value: "Thailand", label: "Thailand" },
    { value: "Togo", label: "Togo" },
    { value: "Tonga", label: "Tonga" },
    { value: "Trinidad and Tobago", label: "Trinidad and Tobago" },
    { value: "Tunisia", label: "Tunisia" },
    { value: "Turkey", label: "Turkey" },
    { value: "Turkmenistan", label: "Turkmenistan" },
    { value: "Tuvalu", label: "Tuvalu" },
    { value: "Uganda", label: "Uganda" },
    { value: "Ukraine", label: "Ukraine" },
    { value: "United Arab Emirates", label: "United Arab Emirates" },
    { value: "United Kingdom", label: "United Kingdom" },
    { value: "United States", label: "United States" },
    { value: "Uruguay", label: "Uruguay" },
    { value: "Uzbekistan", label: "Uzbekistan" },
    { value: "Vanuatu", label: "Vanuatu" },
    { value: "Vatican City", label: "Vatican City" },
    { value: "Venezuela", label: "Venezuela" },
    { value: "Vietnam", label: "Vietnam" },
    { value: "Yemen", label: "Yemen" },
    { value: "Zambia", label: "Zambia" },
    { value: "Zimbabwe", label: "Zimbabwe" },
  ];

  const tags: Tags[] = [
    { value: "", label: "All" },
    { value: "Hunger & Homelessness", label: "Hunger & Homelessness" },
    { value: "Health & Wellness", label: "Health & Wellness" },
    { value: "Faith & Spirituality", label: "Faith & Spirituality" },
    { value: "Animal & Wildlife", label: "Animal & Wildlife" },
    {
      value: "Environment & Conservation",
      label: "Environment & Conservation",
    },
    { value: "Human & Social Services", label: "Human & Social Services" },
    { value: "International Development", label: "International Development" },
    { value: "Arts & Culture", label: "Arts & Culture" },
  ];

  const goToEventList = () => {
    router.push(`/events`); // Use router.push to navigate to the events page
  };

  const goToJoinedCommunityEventList = () => {
    router.push(`/events/joined`); // Use router.push to navigate to the events page
  };

  const handleCountryChange = (value: string | string[]) => {
    let updatedCountry: string;

    if (typeof value === "string") {
      updatedCountry = value;
    } else if (Array.isArray(value) && value.length > 0) {
      updatedCountry = value[0];
    } else {
      updatedCountry = ""; // Set a default value if needed
    }

    setSelectedCountry(updatedCountry);
    onSelectCountry(updatedCountry);
  };

  const handleTagsChange = (value: string | string[]) => {
    let updatedTags: string;

    if (typeof value === "string") {
      updatedTags = value;
    } else if (Array.isArray(value) && value.length > 0) {
      updatedTags = value[0];
    } else {
      updatedTags = ""; // Set a default value if needed
    }

    setSelectedTags(updatedTags);
    onSelectTags(updatedTags);
  };

  return (
    <Flex
      bg="white"
      boxShadow="sm"
      flexDirection="column"
      p="10px 15px 0px 15px"
    >
      <Flex flexDirection="column" px={2} mb={3}>
        <Text
          p={1}
          mt={2}
          textAlign="left"
          color="gray.500"
          fontSize="10pt"
          fontWeight="semibold"
        >
          Filter Events
        </Text>
        <Flex flexDirection="row" justifyContent="space-between">
          <Menu autoSelect={md ? true : false}>
            <MenuButton
              as={Button}
              rightIcon={<ChevronDownIcon />}
              mt={1}
              width="49%"
              textAlign="left"
              borderRadius="md"
              variant="outline"
              border="1px solid gray"
              borderColor="gray.200"
              backgroundColor="white"
              color="gray.500"
              fontWeight="semibold"
              overflow="hidden"
              textOverflow="ellipsis"
              whiteSpace="nowrap"
            >
              {selectedCountry || "Select Country"}
            </MenuButton>
            <MenuList
              textAlign="left"
              color="gray.800"
              fontSize="14"
              fontWeight="semibold"
            >
              <FixedSizeList
                height={350}
                itemCount={countries.length}
                itemSize={40} // Set your desired item size
                width="100%"
              >
                {({ index, style }) => (
                  <MenuItem
                    key={countries[index].value}
                    value={countries[index].value}
                    onClick={() => handleCountryChange(countries[index].value)}
                    style={style}
                  >
                    {countries[index].label}
                  </MenuItem>
                )}
              </FixedSizeList>
            </MenuList>
          </Menu>
          <Menu autoSelect={md ? true : false}>
            <MenuButton
              as={Button}
              rightIcon={<ChevronDownIcon />}
              mt={1}
              width="49%"
              textAlign="left"
              borderRadius="md"
              variant="outline"
              border="1px solid gray"
              borderColor="gray.200"
              backgroundColor="white"
              color="gray.500"
              fontWeight="semibold"
              overflow="hidden"
              textOverflow="ellipsis"
              whiteSpace="nowrap"
            >
              {selectedTags || "Advocacy"}
            </MenuButton>
            <MenuList
              textAlign="left"
              color="gray.800"
              fontSize="14"
              fontWeight="semibold"
            >
              <FixedSizeList
                height={350}
                itemCount={tags.length}
                itemSize={40} // Set your desired item size
                width="100%"
              >
                {({ index, style }) => (
                  <MenuItem
                    key={tags[index].value}
                    value={tags[index].value}
                    onClick={() => handleTagsChange(tags[index].value)}
                    style={style}
                  >
                    {tags[index].label}
                  </MenuItem>
                )}
              </FixedSizeList>
            </MenuList>
          </Menu>
        </Flex>
      </Flex>
      <Divider />
      <Flex
        cursor="pointer"
        direction="column" // Set parent container as column
        minHeight="40px"
        position="relative"
        px={2}
      >
        <Flex
          direction="row"
          fontWeight={600}
          fontSize="10pt"
          position="absolute"
          bottom="0"
        >
          <Text
            _hover={{
              cursor: "pointer",
              color: "blue.500",
            }}
            color={router.pathname === "/events" ? "blue.500" : "gray.500"}
            borderBottom={router.pathname === "/events" ? "2px" : "none"}
            onClick={goToEventList}
            mr={3}
          >
            All
          </Text>
          {user && (
            <Text
              _hover={{
                cursor: "pointer",
                color: "blue.500",
              }}
              color={
                router.pathname.includes("joined") ? "blue.500" : "gray.500"
              }
              borderBottom={router.pathname.includes("joined") ? "2px" : "none"}
              onClick={goToJoinedCommunityEventList}
            >
              Joined Community
            </Text>
          )}
        </Flex>
      </Flex>
    </Flex>
  );
};
export default PostEventNav;
