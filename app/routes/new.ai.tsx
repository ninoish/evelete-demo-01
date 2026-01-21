import type {
  ActionFunctionArgs,
  LinksFunction,
  LoaderFunctionArgs,
} from "react-router";
import { redirect } from "react-router";
import { Form, useActionData, useLoaderData } from "react-router";
import OpenAI from "openai";
import { useState } from "react";

import SpeechRecognitionInput from "~/components/SpeechRecognitionInput";
import { Auth } from "~/services/auth.server";
import OpenAi from "~/services/openai.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await new Auth().isAuthenticated(request);
  if (!user) {
    return redirect("/login");
  }

  const body = await request.formData();
  const input = body.get("input") as string;

  const openAi = new OpenAi();
  const result = await openAi.resolve({ input });

  console.log("body");
  console.log(body);
  console.log(input);
  console.log("===== result =====");
  console.log(JSON.stringify(result));

  return JSON.parse(result.choices[0].message.content ?? `{}`);
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await new Auth().isAuthenticated(request);
  if (!user) {
    return redirect("/login");
  }

  return { user };
};

// TODO: 音声入力や、フリーテキスト入力から、アクティビティ入力を補助する。
// 裏側では、スポーツのマスターデータやこのユーザーの嗜好などをグラウンディングして、
// プロンプトとして入力フォームにあった形式で生成AIにレスポンスさせる。
// 入力後は、編集画面に変化する。追加でAI (+音声)で入力させることも可能。
export default function NewPersonalBodyDataRoute() {
  const data = useLoaderData<typeof loader>();
  const { weight: aiWeight, fatPercentage: aiFatPercentage } =
    useActionData<typeof action>() ?? {};
  const [input, setInput] = useState<string>("");
  const [weight, setWeight] = useState<string>(aiWeight ?? "");
  const [fatPercentage, setFatPercentage] = useState<string>(
    aiFatPercentage ?? "",
  );

  return (
    <div className="w-full md:w-4/5 lg:w-2/3 mx-auto py-4">
      <h1 className="text-2xl mb-2">AIアクティビティ入力</h1>
      <div>
        <Form method="post" name="ai-input">
          <div className="flex gap-2">
            <textarea
              className="min-h-48"
              name="input"
              value={input}
              placeholder="ボディデータ、筋トレメニューのメモや、練習メニューの雑記など"
              onChange={(e) => setInput(e.target.value)}
            />
            <SpeechRecognitionInput
              onResponse={(t) => {
                setInput(t);
              }}
            />
          </div>
          <button
            className="rounded shadow bg-blue-600 text-white p-4"
            type="submit"
          >
            <span>AIに解釈させる</span>
          </button>
        </Form>

        {aiWeight && aiFatPercentage ? (
          <div>
            <p>
              {aiWeight}kg, {aiFatPercentage}%
            </p>
            <Form method="post" name="confirm">
              {aiWeight ? (
                <input
                  type="number"
                  name=""
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              ) : null}
              {aiFatPercentage ? (
                <input
                  type="number"
                  name=""
                  value={fatPercentage}
                  onChange={(e) => setFatPercentage(e.target.value)}
                />
              ) : null}

              <button
                className="rounded shadow bg-blue-600 text-white p-4"
                type="submit"
              >
                <span>確認したので登録</span>
              </button>
            </Form>
          </div>
        ) : null}
      </div>
    </div>
  );
}
