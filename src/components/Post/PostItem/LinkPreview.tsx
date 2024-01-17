// LinkPreview.tsx

import { Flex, Text, Image } from "@chakra-ui/react";
import React, { useState, useEffect } from "react";

interface PreviewData {
  title: string;
  description: string;
  image: string;
}

const LinkPreview: React.FC<{ url: string }> = ({ url }) => {
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(true);

  const extractContent = (doc: Document, tags: string[]): string | null => {
    for (const tag of tags) {
      const element = doc.querySelector(tag);
      if (element) {
        const content = element.getAttribute("content");
        if (content) {
          return content;
        }
      }
    }
    return null;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching data for URL:", url);

        const encodedURL = encodeURIComponent(url);

        const response = await fetch(`/api/proxy/${encodedURL}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(data, "text/html");

        console.log("Parsed HTML document:", doc);

        const title = doc.querySelector("title")?.textContent || "";

        const descriptionTags = [
          'meta[name="description"]',
          'meta[property="description"]',
          'meta[name="og:description"]',
          'meta[property="og:description"]',
          'meta[itemprop="description"]',
        ];

        const imageTags = [
          'meta[property="og:image"]',
          'meta[name="og:image"]',
          'meta[property="og:image:url"]',
          'meta[name="og:image:url"]',
          'meta[itemprop="image"]',
        ];

        const description = extractContent(doc, descriptionTags) || `${url}`; // Use URL as default description
        const image = extractContent(doc, imageTags) || "/images/image.png"; // Replace with your default image path

        console.log("Title:", title);
        console.log("Description:", description);
        console.log("Image:", image);

        setPreviewData({ title, description, image });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
    //eslint-disable-next-line
  }, [url]);

  if (loading) {
    return (
      <Text fontWeight={700} fontSize="11pt" width="60%">
        Loading...
      </Text>
    );
  }

  if (!previewData) {
    return (
      <Text fontWeight={700} fontSize="11pt" width="60%">
        Failed to fetch link preview.
      </Text>
    );
  }

  // Truncate description to a desired length
  const truncatedDescription =
    previewData.description.length > 30
      ? `${previewData.description.slice(0, 30)}...`
      : previewData.description;

  return (
    <Flex
      border="1px solid"
      borderColor="gray.300"
      width="100%"
      ml={4}
      mr={4}
      p={4}
      borderRadius={2}
    >
      <a
        onClick={(event) => {
          event.stopPropagation(); // Stop event propagation
        }}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Flex flexDirection="column">
          <Flex flexDirection="row">
            <Flex flexDirection="column">
              <Text fontWeight={700} fontSize="11pt">
                {previewData.title}
              </Text>
              <Text fontSize="11pt">{truncatedDescription}</Text>
            </Flex>
            <Flex alignItems="center" justifyContent="center">
              {previewData.image && (
                <Image
                  boxSize="55pt"
                  borderRadius={2}
                  src={previewData.image}
                />
              )}
            </Flex>
          </Flex>
        </Flex>
      </a>
    </Flex>
  );
};

export default LinkPreview;
