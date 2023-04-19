import { ExternalLinkIcon } from "@chakra-ui/icons";
import {
  Button,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Link,
  Select,
  Stack,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [server, setServer] = useState("");
  const [token, setToken] = useState("");
  const { user, login, authLoading } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const loginWithAlert = async () => {
    try {
      await login(token, server);
    } catch (err: any) {
      if (err?.message.includes("Unauthorized")) {
        toast({
          title: "Unauthorized.",
          description:
            "Your token is incorrect or you have insufficient permissions.",
          status: "error",
          duration: 9000,
          isClosable: true,
        });
      }

      if (err.message.includes("network")) {
        toast({
          title: "Network error.",
          description: "Possible CORS error - check your Chrome CORS extension settings.",
          status: "error",
          duration: 9000,
          isClosable: true,
        });
      }
    }
  };

  // check if user is logged it or not and redirect to home page if logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [navigate, user]);

  return (
    <Flex w="100%" h="100%" justifyContent="center" alignItems="center">
      <Stack maxW={800} flexDir="column" gap={8}>
        <Stack>
          <FormControl width="100%">
            <FormLabel>Server</FormLabel>
            <Select
              value={server}
              placeholder="Select server"
              onChange={(e) => setServer(e.target.value)}
            >
              <option value="IRCXPRD01">IRCXPRD01</option>
              <option value="IRCXDEV01">IRCXDEV01</option>
            </Select>
          </FormControl>
          <Link
            opacity={!server ? 0.5 : 1}
            pointerEvents={!server ? "none" : "all"}
            href={`https://${server.toLowerCase()}-iroraclecloud.ocecdn.oraclecloud.com/documents/web?IdcService=GET_OAUTH_TOKEN`}
            target="_blank"
            rel="noreferrer"
          >
            <Button leftIcon={<ExternalLinkIcon />} variant="outline">
              Get token
            </Button>
          </Link>
        </Stack>

        <FormControl
          width="100%"
          opacity={!server ? 0.5 : 1}
          pointerEvents={!server ? "none" : "all"}
        >
          <FormLabel>OCM Token</FormLabel>
          <Input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value.replaceAll('"', ""))}
          />
          <FormHelperText>
            You can paste it with or without quotes (")
          </FormHelperText>
        </FormControl>

        <Button
          mt={4}
          colorScheme="teal"
          isDisabled={token.length < 20}
          isLoading={authLoading}
          onClick={loginWithAlert}
          type="submit"
        >
          Submit
        </Button>
      </Stack>
    </Flex>
  );
};

export default Login;
