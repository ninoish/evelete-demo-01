import type { ChangeEvent, ComponentProps, FC } from "react";
import { tv } from "tailwind-variants";

const textFieldStyles = tv({
  slots: {
    base: "flex flex-col w-full",
    labelSlot: "text-gray-600 font-semibold",
    textField: "w-full p-2 rounded-xl my-2 border border-gray-300 outline-none",
    errMsg: "text-red-500 mb-2",
  },
  variants: {
    hasError: {
      true: { textField: "border-red-500" },
    },
  },
});

type TextFieldProps = Readonly<{
  htmlFor: string;
  label: string;
  type?: ComponentProps<"input">["type"];
  value?: string;
  errorMessage?: string;
  placeholder?: string;
  minLength?: number;
  maxLength?: number;
  onChange?: (event: ChangeEvent) => void;
}>;

export const TextField: FC<TextFieldProps> = ({
  htmlFor,
  label,
  type,
  errorMessage,
  value,
  placeholder,
  minLength,
  maxLength,
  onChange,
  ...others
}) => {
  console.log(label, type, errorMessage);

  const { base, labelSlot, textField, errMsg } = textFieldStyles({
    hasError: !!errorMessage,
  });

  return (
    <div className={base()}>
      <label htmlFor={htmlFor} className={labelSlot()}>
        {label}
      </label>
      <input
        type={type}
        id={htmlFor}
        name={htmlFor}
        className={textField()}
        value={value}
        {...others}
        placeholder={placeholder}
        onChange={onChange}
        minLength={minLength}
        maxLength={maxLength}
      />
      {errorMessage && <span className={errMsg()}>{errorMessage}</span>}
    </div>
  );
};
