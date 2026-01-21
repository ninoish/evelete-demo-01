// src/hooks/form.tsx
import { createFormHookContexts, createFormHook } from "@tanstack/react-form";
import { PlaceField } from "../fields/PlaceField";
import { TextareaField } from "../fields/TextareaField";
import { TextField } from "../fields/TextField";
import { DateField } from "../fields/DateField";
import { TimeField } from "../fields/TimeField";
import { NumberField } from "../fields/NumberField";
import { FileField } from "../fields/FileField";

export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TextField,
    TextareaField,
    PlaceField,
    DateField,
    TimeField,
    NumberField,
    FileField,
  }, // 後で独自 UI コンポーネントを pre‑bind できる
  formComponents: {
    Form: ({ children, ...props }) => <form {...props}>{children}</form>,
  }, // 同様にフォーム単位の部品も登録可能
});

export { useAppForm, withForm };
