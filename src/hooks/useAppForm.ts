import { createFormHook } from "@tanstack/react-form";

import { AppTextInput } from "../components/form/AppTextInput";
import { fieldContext, formContext } from "../contexts/formHookContexts";
import { AppSubmitButton } from "../components/form/AppSubmitButton";

export const { useAppForm } = createFormHook({
  fieldComponents: { AppTextInput },
  formComponents: { AppSubmitButton },
  fieldContext,
  formContext,
});
