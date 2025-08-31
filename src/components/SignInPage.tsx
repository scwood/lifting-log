import { Alert, Button, Flex } from "@mantine/core";
import { IconBrandGithub, IconBrandGoogle } from "@tabler/icons-react";
import { Navigate, useNavigate } from "react-router";

import { useAuth } from "../hooks/useAuth";
import { SignInProvider } from "../types/SignInProvider";

export function SignInPage() {
  const { signIn, userId, error } = useAuth();
  const navigate = useNavigate();

  if (userId) {
    return <Navigate to="/" />;
  }

  return (
    <>
      <Flex direction="column" gap="md">
        {!!error && <Alert color="red">{error?.message}</Alert>}
        <Button
          size="md"
          color="gray"
          leftSection={<IconBrandGithub />}
          onClick={() => handleSignIn(SignInProvider.GitHub)}
        >
          Sign in with GitHub
        </Button>
        <Button
          size="md"
          color="gray"
          leftSection={<IconBrandGoogle />}
          onClick={() => handleSignIn(SignInProvider.Google)}
        >
          Sign in with Google
        </Button>
      </Flex>
    </>
  );

  async function handleSignIn(provider: SignInProvider) {
    await signIn(provider);
    navigate("/");
  }
}
