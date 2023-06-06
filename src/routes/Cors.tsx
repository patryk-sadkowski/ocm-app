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
        <OrderedList maxW={600}>
          <Box marginTop={2}>
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
          </Box>
          <Box marginTop={4}>
            <ListItem>
              Enable this extension (run extension and click the big "C" button)
            </ListItem>
            <img
              src="./cors.png"
              alt="cors"
              width="100%"
              style={{ borderRadius: 4 }}
            />
          </Box>
          <Box marginTop={4}>
            <ListItem>Open extension's options page</ListItem>
            <img
              src="./cors_options.png"
              alt="cors-options"
              width="100%"
              style={{ borderRadius: 4 }}
            />
          </Box>

          <Box marginTop={4}>
            <ListItem>
              Enable{" "}
              <Text color="orange.300" as="span">
                3. Access-Control-Allow-Headers
              </Text> (tick the checkbox)
            </ListItem>
            <img
              src="./cors_options_2.png"
              alt="cors-options"
              width="100%"
              style={{ borderRadius: 4 }}
            />
          </Box>
          <Box marginTop={4} marginBottom={6}>
            <ListItem>
              <Text color="blue.300">
                <LinkRouter to="/login">Log in</LinkRouter>. 
              </Text>
            </ListItem>
          </Box>
        </OrderedList>
      </Box>
    </Flex>
  );
};

export default Cors;
