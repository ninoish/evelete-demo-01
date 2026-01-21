import { z } from "zod";

const PostFormSchema = z.object({});
export type PostFormData = z.infer<typeof PostFormSchema>;

export default PostFormSchema;
