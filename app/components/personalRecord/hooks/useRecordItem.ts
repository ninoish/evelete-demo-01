import * as React from "react";

/**
 * Ensure a single record item with a given `kind` exists in the root
 * `personalRecords` array of the TanStack Form. Returns the index.
 *
 * The `form` is the object returned by your `useAppForm` hook.
 */
export function useEnsureRecordItem({
  form,
  formType,
  makeDefault,
}: {
  form: any; // keep it loose to avoid TS friction with generics in caller codebase
  formType: string;
  makeDefault: () => any; // default record object to insert when missing
}): number {
  const [index, setIndex] = React.useState<number>(-1);

  // ひとつのフォームで複数の personal records を含められる。
  // Read current records from the store
  const records = form?.store?.state?.values?.personalRecords ?? [];

  React.useEffect(() => {
    let i = records.findIndex((r: any) => r?.formType === formType);
    if (i === -1) {
      const next = Array.isArray(records) ? [...records] : [];
      next.push(makeDefault());
      form.setFieldValue("personalRecords", next);
      i = next.length - 1;
    }
    setIndex(i);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  return index;
}
