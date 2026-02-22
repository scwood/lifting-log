import {
  ActionIcon,
  Container,
  Flex,
  Menu,
  Tabs,
  UnstyledButton,
} from "@mantine/core";
import { IconBrandGithub, IconLogout, IconUser } from "@tabler/icons-react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { Link } from "react-router";

import { useAuth } from "../hooks/useAuth";

export function AppShell() {
  const { signOut, userId, displayName } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Container p="lg" size="xs">
      <Flex justify="space-between" align="center" mb="md">
        <UnstyledButton component={Link} to="/" fz={22} fw="600">
          🏋️‍♂️ Lifting log
        </UnstyledButton>
        <Flex gap="xs">
          <ActionIcon
            variant="subtle"
            color="gray"
            component="a"
            target="_blank"
            rel="noopener noreferrer"
            href="https://github.com/scwood/lifting-log"
          >
            <IconBrandGithub />
          </ActionIcon>
          {userId && (
            <Menu>
              <Menu.Target>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  aria-label="User menu"
                >
                  <IconUser />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item disabled>{displayName ?? "Unknown user"}</Menu.Item>
                <Menu.Item
                  onClick={signOut}
                  leftSection={<IconLogout size={14} />}
                >
                  Sign out
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          )}
        </Flex>
      </Flex>
      {userId && (
        <Tabs mb="md" value={location.pathname} onChange={handleTabChange}>
          <Tabs.List>
            <Tabs.Tab value="/">Current workout</Tabs.Tab>
            <Tabs.Tab value="/plan">Workout plan</Tabs.Tab>
            <Tabs.Tab value="/history">History</Tabs.Tab>
          </Tabs.List>
        </Tabs>
      )}
      <Outlet />
    </Container>
  );

  function handleTabChange(path: string | null) {
    if (path) {
      navigate(path);
    }
  }
}
