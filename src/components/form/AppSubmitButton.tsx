import { Button, ButtonProps } from "@mantine/core";

import { useFormContext } from "../../contexts/formHookContexts";

export function AppSubmitButton(props: ButtonProps) {
  const form = useFormContext();

  return (
    <form.Subscribe
      selector={(state) => [state.canSubmit, state.isSubmitting]}
      children={([canSubmit, isSubmitting]) => {
        return (
          <Button
            type="submit"
            color="green"
            disabled={!canSubmit || isSubmitting}
            children="Save"
            {...props}
          />
        );
      }}
    />
  );
}
