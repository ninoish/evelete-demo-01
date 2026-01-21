import { zodResolver } from "@hookform/resolvers/zod";
import type { PersonalRecord } from "@prisma/client";
import { Form } from "react-router";
import { useRemixForm } from "remix-hook-form";

import PersonalResultFormSchema, {
  type PersonalResultFormData,
} from "~/types/validators/PersonalResultFormSchema";

interface PersonalResultFormValues {
  name: string;
  rank: number;
  eventId?: string;
  records: PersonalRecord[];
}

interface PersonalResultFormProps {
  result: PersonalResultFormValues;
  onSubmit: (event: Event) => void;
}

export function PersonalResultForm({ result }: PersonalResultFormProps) {
  const methods = useRemixForm<PersonalResultFormData>({
    mode: "onSubmit",
    resolver: zodResolver(PersonalResultFormSchema),
    defaultValues: {
      recordCategory: result?.name ?? "",
      recordCategoryDetail: result?.id ?? "",
      recordTarget: result?.places ?? [],
      displayType: [],
      recordDatetime: result?.sports ?? [],
      summary: [],
      media: result?.media ?? true,
      detail: result?.detail ?? true,
      canViewActivities: result?.canViewActivities ?? true,
      canViewMembers: result?.canViewMembers ?? true,
      levelRange: result?.levelRange ?? [0, 100],
      profileImage: result?.profileImage ?? {},
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = methods;

  return (
    <Form onSubmit={handleSubmit} method="POST">
      <button type="submit">作成</button>
    </Form>
  );
}
