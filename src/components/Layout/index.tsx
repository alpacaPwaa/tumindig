import { Flex, Grid, GridItem, useMediaQuery } from "@chakra-ui/react";
import React, { ReactNode } from "react";
import Navbar from "../Navbar";
import SideBar from "../Navbar/Directory/SideBar";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  // useAuth(); // will implement later at end of tutorial
  const [isBase] = useMediaQuery("(max-width: 767px)");

  return (
    <>
      <Grid
        templateAreas={`"header header"
                  "${isBase ? "main" : "nav"} main"
                  "nav footer"`}
        gridTemplateRows={"50px 1fr 30px"}
        gridTemplateColumns={isBase ? "1fr" : "270px 1fr"}
      >
        <GridItem area={"header"}>
          <Navbar />
        </GridItem>
        {!isBase && (
          <GridItem area={"nav"}>
            <SideBar />
          </GridItem>
        )}
        <GridItem area={"main"}>{children}</GridItem>
      </Grid>
    </>
  );
};

export default Layout;
