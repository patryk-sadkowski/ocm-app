import { ChevronDownIcon, MoonIcon, SunIcon } from "@chakra-ui/icons";
import {
  Badge,
  Box,
  Button,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spinner,
  Stack,
  useColorMode,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Header = () => {
  const { user, logout, server, authLoading } = useAuth();

  return (
    <Flex
      w="100%"
      alignItems="center"
      justifyContent="space-between"
      padding={4}
    >
      <Link to="/">
        <Flex justifyContent="center" alignItems="center" gap={4}>
          <Badge>OCM App</Badge>
          {authLoading && <Spinner size="sm" />}
        </Flex>
      </Link>
      <Stack justifyContent="space-between" direction="row">
        {user?.displayName ? (
          <Menu>
            <Button pointerEvents="none" variant="outline">
              {server}
            </Button>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              {user?.displayName}
            </MenuButton>
            <MenuList>
              <MenuItem onClick={logout}>Logout</MenuItem>
            </MenuList>
          </Menu>
        ) : (
          <Link to="/login">
            <Button>Log in</Button>
          </Link>
        )}

        <Link to="/cors">
          <Button>CORS</Button>
        </Link>

        <ColorModeToggle />
      </Stack>
    </Flex>
  );
};

function ColorModeToggle() {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <header>
      <Button onClick={toggleColorMode}>
        {colorMode === "light" ? <MoonIcon /> : <SunIcon />}
      </Button>
    </header>
  );
}

export default Header;
