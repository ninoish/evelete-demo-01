import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

const BodyDataStructure = z.object({
  weight: z.number(),
  fatPercentage: z.number(),
});

export default class OpenAi {
  public client: OpenAI;
  public constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  resolve = async ({ input }: { input: string }) => {
    return await this.client.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `以下のユーザー入力から、この人の体重と体脂肪率を抜き出してください。
        ========
        ${input}
        =========`,
        },
      ],
      model: "gpt-4o-mini",
      response_format: zodResponseFormat(BodyDataStructure, "bodyData"),
    });
  };
}
