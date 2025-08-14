import { createFormHook } from "@tanstack/react-form";

import { AppTextInput } from "../components/form/AppTextInput";
import { fieldContext, formContext } from "../contexts/formHookContexts";
import { AppSubmitButton } from "../components/form/AppSubmitButton";
import { AppRadioGroup } from "../components/form/AppRadioGroup";
import { AppNumberInput } from "../components/form/AppNumberInput";

export const { useAppForm } = createFormHook({
  fieldComponents: { AppTextInput, AppNumberInput, AppRadioGroup },
  formComponents: { AppSubmitButton },
  fieldContext,
  formContext,
});
