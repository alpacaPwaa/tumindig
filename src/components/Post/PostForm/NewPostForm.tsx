import React, { useRef, useState } from "react";
import {
  Box,
  Button,
  Flex,
  Icon,
  Text,
  Input,
  Stack,
  Textarea,
  Image,
  FormLabel,
  FormControl,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useMediaQuery,
  MenuOptionGroup,
  MenuItemOption,
} from "@chakra-ui/react";
import { User } from "firebase/auth";
import {
  addDoc,
  collection,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { useRouter } from "next/router";
import { useRecoilState, useSetRecoilState } from "recoil";
import { firestore, storage } from "../../../firebase/clientApp";
import { Post, postState } from "../../../atoms/postsAtom";
import {
  getDownloadURL,
  getMetadata,
  ref,
  uploadString,
} from "firebase/storage";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  EmailIcon,
  PhoneIcon,
} from "@chakra-ui/icons";
import ResizeTextarea from "react-textarea-autosize";
import { IoMdImages } from "react-icons/io";
import { Community, communityState } from "../../../atoms/communitiesAtom";
import { FiAlertTriangle } from "react-icons/fi";
import { IoLocationSharp } from "react-icons/io5";
import { MdOutlineEventAvailable } from "react-icons/md";
import { TbSpeakerphone } from "react-icons/tb";
import { FixedSizeList } from "react-window";

export type TabItemType = {
  title: string;
  icon: typeof Icon.arguments;
};

type NewPostFormProps = {
  communityId: string;
  communityImageURL?: string;
  user: User;
  communityVisibility: boolean;
  post: Post;
};

type Country = {
  value: string;
  label: string;
};

const NewPostForm: React.FC<NewPostFormProps> = ({
  communityId,
  communityImageURL,
  communityVisibility,
  user,
  post,
}) => {
  const [textInputs, setTextInputs] = useState({
    title: "",
    body: "",
    location: "",
    phoneNumber: "",
    email: "",
    date: "",
    timeStart: "",
    timeEnd: "",
    eventTitle: "",
    isVolunteer: false,
  });
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const selectFileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [detailsError, setDetailsError] = useState("");
  const router = useRouter();
  const setPostItems = useSetRecoilState(postState);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [details, setDetails] = useState(false);
  const slideContainerRef = useRef<HTMLDivElement>(null);
  const [communityStateValue] = useRecoilState(communityState);
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  const phoneRegex = /^\d{11}$/;
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

  const handleCreatePost = async () => {
    setLoading(true);
    const {
      title,
      body,
      location,
      phoneNumber,
      email,
      date,
      timeStart,
      timeEnd,
      eventTitle,
      isVolunteer,
    } = textInputs;

    if (email && !emailRegex.test(email)) {
      setEmailError("Invalid email address");
      setLoading(false);
      return; // Exit the function early
    }

    if (phoneNumber && !phoneRegex.test(phoneNumber)) {
      setPhoneError("Invalid phone number");
      setLoading(false);
      return; // Exit the function early
    }

    if (
      details &&
      (!textInputs.title ||
        !textInputs.date ||
        !textInputs.location ||
        !textInputs.timeEnd ||
        !textInputs.timeStart ||
        !textInputs.phoneNumber ||
        !textInputs.email)
    ) {
      setDetailsError(
        "Please ensure you've completed all required fields in the form"
      );
      setLoading(false);
      return;
    }

    try {
      const isVolunteer = !!eventTitle; // Check if eventTitle is not empty

      const postDocData = {
        communityId,
        communityImageURL: communityImageURL || "",
        creatorId: user.uid,
        creatorDisplayText: user?.displayName || user?.email?.split("@")[0],
        isPinned: false,
        isVolunteer: false,
        title,
        body,
        location,
        phoneNumber,
        email,
        date,
        timeStart,
        eventTitle,
        timeEnd,
        country: selectedCountry,
        numberOfComments: 0,
        voteStatus: 0,
        createdAt: serverTimestamp(),
        editedAt: serverTimestamp(),
      };

      if (isVolunteer) {
        postDocData.isVolunteer = true;
      }

      const postDocRef = await addDoc(
        collection(firestore, "posts"),
        postDocData
      );

      // Get the ID of the newly created post
      const postId = postDocRef.id;

      // Update the document to set the postId field to the document's ID
      await updateDoc(postDocRef, {
        id: postId,
      });

      console.log("HERE IS NEW POST ID", postDocRef.id);

      // check if selectedFiles exists, if it does, do image processing
      let mediaURLs: string[] = [];
      let mediaTypes: string[] = [];

      if (selectedFiles && selectedFiles.length > 0) {
        for (let i = 0; i < selectedFiles.length; i++) {
          const mediaRef = ref(storage, `posts/${postDocRef.id}/media${i}`);
          await uploadString(mediaRef, selectedFiles[i], "data_url");
          const downloadURL = await getDownloadURL(mediaRef);
          const metadata = await getMetadata(mediaRef);
          const mediaType = metadata?.contentType || ""; // Use an empty string as fallback

          mediaURLs.push(downloadURL);
          mediaTypes.push(mediaType);
        }

        await updateDoc(postDocRef, {
          mediaURLs: mediaURLs,
          mediaTypes: mediaTypes,
        });
      }

      // Clear the cache to cause a refetch of the posts
      setPostItems((prev) => ({
        ...prev,
        postUpdateRequired: true,
      }));
      // router.events.on("routeChangeComplete", () => {
      //   // Reload the page after route change
      //   window.location.reload();
      // });

      // Navigate back to the previous page
      router.back();
    } catch (error) {
      console.log("createPost error", error);
      setError("Error creating post");
    }
    setLoading(false);
  };

  const onSelectImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result;
          if (dataUrl) {
            urls.push(dataUrl.toString());
            if (i === files.length - 1) {
              setSelectedFiles(urls);
            }
          }
        };
        reader.readAsDataURL(files[i]);
      }
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result;
          if (dataUrl) {
            urls.push(dataUrl.toString());
            if (i === files.length - 1) {
              setSelectedFiles(urls);
            }
          }
        };
        reader.readAsDataURL(files[i]);
      }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const onTextChange = ({
    target: { name, value },
  }: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTextInputs((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCoutryChange = (value: string | string[]) => {
    if (typeof value === "string") {
      setSelectedCountry(value);
    } else if (Array.isArray(value) && value.length > 0) {
      setSelectedCountry(value[0]);
    }
  };

  const nextSlide = () => {
    if (selectedFiles) {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % selectedFiles.length);
    }
  };

  const prevSlide = () => {
    if (selectedFiles) {
      setCurrentSlide((prevSlide) =>
        prevSlide === 0 ? selectedFiles.length - 1 : prevSlide - 1
      );
    }
  };

  const calculateSlideOffset = (index: number) => {
    if (slideContainerRef.current) {
      const slideWidth = slideContainerRef.current.clientWidth;
      return -index * slideWidth;
    }
    return 0;
  };

  const isUserModerator = !!communityStateValue.moderatorSnippets.find(
    (snippet) =>
      communityId &&
      snippet.isModerator === true &&
      snippet.userUid === user?.uid
  );

  const isUserAdmin = !!communityStateValue.mySnippets.find(
    (snippet) =>
      communityId && snippet.isAdmin === true && snippet.userUid === user?.uid
  );

  return (
    <Flex bg="white" flexDirection="column" p={5} borderRadius="md" mt={6}>
      {communityVisibility && (!isUserAdmin || !isUserModerator) && (
        <Flex
          border="1px"
          bg="gray.50"
          borderColor="gray.100"
          shadow="sm"
          fontSize="10pt"
          borderRadius="md"
          p={2}
          mb={2}
          alignItems="center"
          justifyContent="center"
        >
          <Icon as={FiAlertTriangle} mr={2} />
          <Text fontWeight={600} fontSize="11pt" textAlign="center">
            Only approved users can post in this community
          </Text>
        </Flex>
      )}
      <Text fontWeight={600} fontSize="12pt">
        Create a Post
      </Text>
      <Flex width="100%" flexDirection="column" mt={3}>
        <Input
          name="title"
          value={textInputs.title}
          onChange={onTextChange}
          disabled={loading}
          _placeholder={{ color: "gray.500" }}
          _focus={{
            outline: "none",
            bg: "white",
            border: "1px solid",
            borderColor: "black",
          }}
          fontSize="10pt"
          borderRadius={4}
          placeholder="Title"
        />
        <Flex
          flexDirection="column"
          borderRadius={2}
          border="1px solid"
          borderColor="gray.100"
          mt={2}
          p={2}
        >
          <Textarea
            variant="unstyled"
            name="body"
            value={textInputs.body}
            onChange={onTextChange}
            fontSize="10pt"
            placeholder="Text (optional)"
            _placeholder={{ color: "gray.500" }}
            _focus={{
              outline: "none",
            }}
            as={ResizeTextarea}
            disabled={loading}
            pl={2}
            pb={2}
          />

          {(isUserAdmin || isUserModerator) && (
            <Flex
              px={4}
              py={2}
              mb={2}
              border="1px"
              borderRadius={4}
              borderColor="gray.200"
              alignItems="center"
              justifyContent="space-between"
            >
              <Text fontWeight={600} fontSize="11pt" textAlign="center">
                Add more options
              </Text>
              <Menu>
                <MenuButton
                  px={3}
                  py={1}
                  transition="all 0.2s"
                  borderRadius="md"
                  borderWidth="1px"
                  bg="gray.100"
                  _hover={{ bg: "gray.200" }}
                  _expanded={{ bg: "gray.300" }}
                  _focus={{
                    outline: "none",
                  }}
                >
                  <Flex
                    flexDirection="row"
                    fontSize="11pt"
                    fontWeight={600}
                    alignItems="center"
                  >
                    <Text mr={1}>More</Text>
                    <ChevronDownIcon />
                  </Flex>
                </MenuButton>
                <MenuList>
                  {/* <MenuItem>Raise Fund</MenuItem> */}
                  <MenuItem
                    onClick={() => {
                      setDetails(true);
                    }}
                  >
                    <Icon as={TbSpeakerphone} fontSize={20} mr={2} />
                    <Text fontSize="11pt" fontWeight={600}>
                      Add Event
                    </Text>
                  </MenuItem>
                </MenuList>
              </Menu>
            </Flex>
          )}

          {details && (
            <Stack
              px={4}
              py={2}
              mb={2}
              border="1px"
              borderRadius={4}
              borderColor="gray.200"
              flexDirection="column"
            >
              <Text fontSize="11pt" fontWeight={600}>
                Add Details
              </Text>
              <Stack p={2}>
                <Flex flexDirection="row" alignItems="center">
                  <FormLabel mr={3} fontSize="11pt" width="20%">
                    Title:
                  </FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <Icon
                        fontSize={20}
                        as={MdOutlineEventAvailable}
                        color="gray.300"
                      />
                    </InputLeftElement>
                    <Input
                      _focus={{
                        outline: "none",
                        bg: "white",
                        border: "1px solid",
                        borderColor: "black",
                      }}
                      fontSize="11pt"
                      placeholder="Event Title"
                      name="eventTitle"
                      value={textInputs.eventTitle}
                      onChange={onTextChange}
                    />
                  </InputGroup>
                </Flex>
                <Flex flexDirection="row" alignItems="center">
                  <FormLabel mr={3} fontSize="11pt" width="20%">
                    Country:
                  </FormLabel>
                  <Flex flexDirection="column" width="100%">
                    <Menu autoSelect={md ? true : false}>
                      <MenuButton
                        as={Button}
                        rightIcon={<ChevronDownIcon />}
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
                        fontSize="14px"
                      >
                        {selectedCountry || "Select Country"}
                      </MenuButton>
                      <MenuList
                        textAlign="left"
                        color="gray.800"
                        fontSize="14"
                        fontWeight="semibold"
                        zIndex="999"
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
                              onClick={() =>
                                handleCoutryChange(countries[index].value)
                              }
                              style={style}
                            >
                              {countries[index].label}
                            </MenuItem>
                          )}
                        </FixedSizeList>
                      </MenuList>
                    </Menu>
                  </Flex>
                </Flex>
                <Flex flexDirection="row" alignItems="center">
                  <FormLabel mr={3} fontSize="11pt" width="20%">
                    Location:
                  </FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <Icon
                        fontSize={20}
                        as={IoLocationSharp}
                        color="gray.300"
                      />
                    </InputLeftElement>
                    <Input
                      _focus={{
                        outline: "none",
                        bg: "white",
                        border: "1px solid",
                        borderColor: "black",
                      }}
                      fontSize="11pt"
                      placeholder="Location"
                      name="location"
                      value={textInputs.location}
                      onChange={onTextChange}
                    />
                  </InputGroup>
                </Flex>
                <Flex flexDirection="row" alignItems="center">
                  <FormLabel mr={3} fontSize="11pt" width="20%">
                    Date:
                  </FormLabel>
                  <Input
                    _focus={{
                      outline: "none",
                      bg: "white",
                      border: "1px solid",
                      borderColor: "black",
                    }}
                    fontSize="11pt"
                    color="gray.500"
                    placeholder="Select Date and Time"
                    size="md"
                    type="date"
                    name="date"
                    value={textInputs.date}
                    onChange={onTextChange}
                  />
                </Flex>
                <Flex flexDirection="row" alignItems="center">
                  <FormLabel mr={3} fontSize="11pt" width="20%">
                    Time:
                  </FormLabel>
                  <Input
                    _focus={{
                      outline: "none",
                      bg: "white",
                      border: "1px solid",
                      borderColor: "black",
                    }}
                    fontSize="11pt"
                    width="45%"
                    color="gray.500"
                    placeholder="Select time"
                    size="md"
                    type="time"
                    name="timeStart"
                    value={textInputs.timeStart}
                    onChange={onTextChange}
                  />
                  <FormLabel mx={2} fontSize="11pt">
                    to
                  </FormLabel>
                  <Input
                    _focus={{
                      outline: "none",
                      bg: "white",
                      border: "1px solid",
                      borderColor: "black",
                    }}
                    fontSize="11pt"
                    width="45%"
                    color="gray.500"
                    placeholder="Select Time"
                    size="md"
                    type="time"
                    name="timeEnd"
                    value={textInputs.timeEnd}
                    onChange={onTextChange}
                  />
                </Flex>
              </Stack>

              <Text fontSize="11pt" fontWeight={600}>
                Contact Details
              </Text>
              <Stack p={2}>
                <Flex flexDirection="row" alignItems="center">
                  <FormLabel mr={3} fontSize="11pt" width="20%">
                    Phone:
                  </FormLabel>
                  <InputGroup display="flex" flexDirection="column">
                    <InputLeftElement pointerEvents="none">
                      <PhoneIcon color="gray.300" />
                    </InputLeftElement>
                    <Input
                      _focus={{
                        outline: "none",
                        bg: "white",
                        border: "1px solid",
                        borderColor: "black",
                      }}
                      fontSize="11pt"
                      type="number"
                      placeholder="09012345678"
                      name="phoneNumber"
                      value={textInputs.phoneNumber}
                      onChange={onTextChange}
                    />
                    {phoneError && (
                      <Text color="red" fontSize="10pt" mt={1}>
                        {phoneError}
                      </Text>
                    )}
                  </InputGroup>
                </Flex>
                <Flex flexDirection="row" alignItems="center">
                  <FormLabel mr={3} fontSize="11pt" width="20%">
                    Email:
                  </FormLabel>
                  <InputGroup display="flex" flexDirection="column">
                    <InputLeftElement pointerEvents="none">
                      <EmailIcon color="gray.300" />
                    </InputLeftElement>
                    <Input
                      _focus={{
                        outline: "none",
                        bg: "white",
                        border: "1px solid",
                        borderColor: "black",
                      }}
                      fontSize="11pt"
                      type="email"
                      name="email"
                      value={textInputs.email}
                      onChange={onTextChange}
                      placeholder="Email"
                    />
                    {emailError && (
                      <Text color="red" fontSize="10pt" mt={1}>
                        {emailError}
                      </Text>
                    )}
                  </InputGroup>
                </Flex>
                {detailsError && (
                  <Text
                    color="red"
                    fontSize="10pt"
                    p={1}
                    mt={1}
                    textAlign="center"
                  >
                    {detailsError}
                  </Text>
                )}
              </Stack>
            </Stack>
          )}

          <Flex direction="column" justify="center" align="center" width="100%">
            {selectedFiles && selectedFiles.length > 0 ? (
              <>
                <Flex justify="center" align="center" position="relative">
                  {selectedFiles && selectedFiles.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label="Previous Slide"
                      onClick={prevSlide}
                      position="absolute"
                      backgroundColor="white"
                      left={3}
                      zIndex={1}
                    >
                      <ChevronLeftIcon fontSize="14pt" position="absolute" />
                    </Button>
                  )}
                  <Box
                    display="flex"
                    width="100%"
                    overflow="hidden"
                    position="relative"
                  >
                    <Flex
                      ref={slideContainerRef}
                      transition="transform 0.3s ease"
                      align="center"
                      transform={`translateX(${calculateSlideOffset(
                        currentSlide
                      )}px)`}
                    >
                      {selectedFiles.map((file, index) => (
                        <Box
                          key={file}
                          flex="0 0 100%"
                          maxWidth="100%"
                          display="flex"
                          justifyContent="center"
                          alignItems="center"
                          pr={
                            index < selectedFiles.length - 1 ? "4px" : "0"
                          } /* Add spacing between images */
                        >
                          {file.startsWith("data:image/") ? (
                            <Image
                              src={file}
                              width="100%"
                              maxHeight="400px"
                              objectFit="contain"
                              alt="Image"
                            />
                          ) : file.startsWith("data:video/") ? (
                            <video
                              src={file}
                              controls
                              style={{
                                maxHeight: "460px",
                                width: "auto",
                                height: "auto",
                                justifyContent: "center",
                                alignSelf: "center",
                              }}
                            />
                          ) : null}
                        </Box>
                      ))}
                    </Flex>
                  </Box>
                  {selectedFiles && selectedFiles.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label="Next Slide"
                      backgroundColor="white"
                      onClick={nextSlide}
                      position="absolute"
                      right={3}
                    >
                      <ChevronRightIcon fontSize="14pt" position="absolute" />
                    </Button>
                  )}
                </Flex>
              </>
            ) : (
              <Flex
                justify="center"
                align="center"
                flexDirection="column"
                p={md ? 20 : 10}
                border="1px"
                borderColor="gray.200"
                bg="gray.50"
                borderRadius={4}
                width="100%"
                cursor="pointer"
                onClick={() => selectFileRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                _hover={{
                  bg: "gray.100",
                }}
              >
                <Flex bg="gray.100" borderRadius="full" p={3}>
                  <Icon as={IoMdImages} fontSize={40} color="gray.500" />
                </Flex>
                <Text fontSize="11pt" fontWeight={600}>
                  Upload Images/Videos
                </Text>
                <Text fontSize="10pt" fontWeight={600} color="gray.500">
                  or drag and drop
                </Text>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/x-png,image/gif,image/jpeg,video/mp4,video/mpeg,video/quicktime"
                  hidden
                  ref={selectFileRef}
                  onChange={onSelectImage}
                  multiple
                />
              </Flex>
            )}
          </Flex>
        </Flex>
      </Flex>
      <Flex justify="flex-end" mt={2}>
        {selectedFiles && selectedFiles.length > 0 && (
          <Button
            size="sm"
            mr={2}
            variant="outline"
            fontSize="10pt"
            onClick={() => setSelectedFiles([])}
          >
            Clear Photo/Video
          </Button>
        )}
        {communityVisibility ? (
          <Button
            size="sm"
            fontSize="10pt"
            padding="0px 30px"
            disabled={!textInputs.title || (!isUserAdmin && !isUserModerator)}
            isLoading={loading}
            onClick={handleCreatePost}
          >
            Post
          </Button>
        ) : (
          <Button
            size="sm"
            fontSize="10pt"
            padding="0px 30px"
            disabled={!textInputs.title || loading}
            isLoading={loading}
            onClick={handleCreatePost}
          >
            Post
          </Button>
        )}
      </Flex>
    </Flex>
  );
};
export default NewPostForm;
