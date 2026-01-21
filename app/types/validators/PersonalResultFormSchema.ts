import { z } from "zod";

const PersonalResultFormSchema = z.object({});
export type PersonalResultFormData = z.infer<typeof PersonalResultFormSchema>;

export default PersonalResultFormSchema;
