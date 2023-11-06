import { extendTheme } from "@chakra-ui/react";
import { Button } from "./button";
import { Input } from "./input";

export const theme = extendTheme({
  colors: {
    brand: {
      100: "#FF3C00",
    },
  },
  fonts: {
    body: "Open Sans, sans-serif",
  },
  styles: {
    global: () => ({
      body: {
        bg: "gray.200",
      },
    }),
  },
  components: {
    Drawer: {
      parts: ["dialog", "header", "body"],
      variants: {
        primary: {
          dialog: {
            maxW: "220px",
          },
        },
        secondary: {
          dialog: {
            maxW: "290px",
          },
        },
      },
    },
    Button,
    // Input,
  },
});
