import { ExternalLinkIcon } from "@chakra-ui/icons";
import {
  Box,
  Flex,
  Heading,
  Link,
  ListItem,
  OrderedList,
  Text,
} from "@chakra-ui/react";
import { Link as LinkRouter } from "react-router-dom";

const Cors = () => {
  return (
    <Flex justifyContent="center" alignItems="center">
      <Box>
        <Heading size="md">CORS</Heading>
        <OrderedList>
          <ListItem>
            Install{" "}
            <Link
              href="https://chrome.google.com/webstore/detail/allow-cors-access-control/lhobafahddgcelffkeicbaginigeejlf"
              isExternal
              color="blue.300"
            >
              CORS Chrome extension <ExternalLinkIcon mx="2px" />
            </Link>
          </ListItem>
          <ListItem>Enable this extension (run extension and click the big "C" button)</ListItem>
          <img src="./cors.png" alt="cors" width="100%" style={{borderRadius: 4}}  />
          <ListItem>
            Open extension's{" "}
            <Link
              href="chrome-extension://lhobafahddgcelffkeicbaginigeejlf/data/options/options.html"
              isExternal
              color="blue.300"
            >
              options page <ExternalLinkIcon mx="2px" />
            </Link>
            (reload after opening)
          </ListItem>
          <ListItem>
            Enable{" "}
            <Text color="orange.300" as="span">
              3. Access-Control-Allow-Headers
            </Text>
          </ListItem>
          <ListItem>
            <Text color="blue.300">
              <LinkRouter to="/login">Log in</LinkRouter>
            </Text>
          </ListItem>
        </OrderedList>
      </Box>
    </Flex>
  );
};

export default Cors;
