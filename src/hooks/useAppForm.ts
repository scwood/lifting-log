import { createFormHook } from "@tanstack/react-form";

import { AppNumberInput } from "../components/form/AppNumberInput";
import { AppRadioGroup } from "../components/form/AppRadioGroup";
import { AppSubmitButton } from "../components/form/AppSubmitButton";
import { AppTextInput } from "../components/form/AppTextInput";
import { fieldContext, formContext } from "../contexts/formHookContexts";

export const { useAppForm } = createFormHook({
  fieldComponents: { AppTextInput, AppNumberInput, AppRadioGroup },
  formComponents: { AppSubmitButton },
  fieldContext,
  formContext,
});
