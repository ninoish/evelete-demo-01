import GolfPracticeForm from "~/components/personalRecord/forms/GolfPracticeForm";
import type { JSX } from "react/jsx-runtime";
import { PersonalActivityType } from "@prisma/client";
import { GolfRoundForm } from "./forms/GolfRoundForm";

type ActivityTypeMap = Partial<
  Record<PersonalActivityType, (p: any) => JSX.Element>
>;

// それを sportId 毎に持つ
type FormsRegistry = Record<string, ActivityTypeMap>;

/**
 * 競技ごとのフォーム・レジストリ。
 * sportId/ActivityType をキーに（将来は sportSlug のほうが人間可読で良いかも）
 */

const FORMS: FormsRegistry = {
  "golf": {
    [PersonalActivityType.PRACTICE]: (p) => <GolfPracticeForm {...p} />,
    [PersonalActivityType.PRACTICAL_PRACTICE]: (p) =>  <GolfRoundForm {...p} />
  },
};

export default function PersonalRecordFormSwitcher({
  sportId,
  activityType,
  form,
  onChange,
}: {
  sportId: string;
  activityType: PersonalActivityType;
  form: any;
  onChange?: () => void;
}) {
  const Comp = sportId ? FORMS[sportId]?.[activityType] : undefined;

  if (Comp) {
    return <Comp form={form} onChange={onChange} />;
  }
  return null;
}
