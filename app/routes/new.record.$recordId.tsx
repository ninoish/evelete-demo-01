import dayjs from "dayjs";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Form, Link, redirect, useNavigate, useParams } from "react-router";
import { useLoaderData } from "react-router";
import {
  getArraySchemaKeys,
  getObjectSchemaKeys,
  getPersonalRecordSchema,
} from "~/components/recordForm/schemas";

import { Auth } from "~/services/auth.server";
import { getPrisma } from "~/services/database.server";
import recordService from "~/services/recordService.server";
import { dateFromString } from "~/utils/datetime";
import { buildFormComponent } from "~/components/recordForm/builders";

export const isBodyDataRelatedRecord = (recordSlug: string) => {
  const BODY_REL = ["body-fat-percentage", "body-weight"];
  return BODY_REL.indexOf(recordSlug) > -1;
};

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const recordId = params.recordId;
  if (!recordId) {
    return redirect("/");
  }

  const auth = new Auth();
  const authed = await auth.isAuthenticated(request);
  if (!authed) {
    return redirect("/");
  }

  const db = getPrisma();

  const recordMaster = await db.recordMaster.findFirstOrThrow({
    where: {
      id: recordId,
    },
  });

  const schema = getPersonalRecordSchema(recordMaster);
  if (!schema) {
    throw new Response("Not Found", { status: 404 });
  }

  const formData = await request.formData();
  const rawData = Object.fromEntries(formData.entries());
  console.log("rawData", rawData);

  const arraySchemaKeys = getArraySchemaKeys(schema);
  const objectSchemaKeys = getObjectSchemaKeys(schema);

  const objSchemas = objectSchemaKeys?.reduce((obj, key) => {
    const str = formData.get(key) as string;
    if (!str) {
      return obj;
    }
    return {
      ...obj,
      [key]: JSON.parse(str),
    };
  }, {});

  const arrSchemas = arraySchemaKeys?.reduce((obj, key) => {
    const str = formData.get(key) as string;
    if (!str) {
      return obj;
    }
    return {
      ...obj,
      [key]: JSON.parse(str),
    };
  }, {});

  console.log("hey", {
    ...rawData,
    ...objSchemas,
    ...arrSchemas,
  });
  console.log(
    "hey2",
    JSON.stringify({
      ...rawData,
      ...objSchemas,
      ...arrSchemas,
    }),
  );

  const validationResult = schema.safeParse({
    ...rawData,
    ...objSchemas,
    ...arrSchemas,
  });
  console.log("err?", validationResult.error);
  if (!validationResult.success) {
    return { errors: validationResult.error.format(), values: rawData };
  }
  const { recordDate, recordTime, recordValue, files, comment, ...details } =
    validationResult.data;

  const dt = dateFromString(recordDate + "T" + recordTime);
  const record = await recordService.addPersonalRecord(
    authed.id,
    dt.toDate(),
    recordMaster.id,
    parseFloat(recordValue),
    comment,
    files,
    details,
  );

  // TODO: 実装
  if (recordMaster.isAccumulative) {
    // recordService.accumulatePersonalRecord()
  }

  return redirect(`/me/records/${recordId}`);
};

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  try {
    if (!params.recordId) {
      return redirect("/");
    }

    const authed = await new Auth().isAuthenticated(request);
    if (!authed) {
      return redirect("/login");
    }

    // TODO: avoid special operation
    const recordId = params.recordId;
    if (isBodyDataRelatedRecord(recordId)) {
      return redirect("/new/body");
    }

    const db = getPrisma();

    const recordMaster = await db.recordMaster.findFirstOrThrow({
      where: {
        id: recordId,
      },
    });
    return {
      user: authed,
      recordMaster,
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY ?? "",
    };
  } catch (error) {
    return redirect(`/`);
  }
};

export default function NewPersonalRecordDetailRoute() {
  const { user, recordMaster, googleMapsApiKey } =
    useLoaderData<typeof loader>();

  console.log(recordMaster);

  const FormComp = buildFormComponent(recordMaster);
  if (!FormComp) {
    return <div>不明な記録タイプ</div>;
  }

  const defaultValues = {
    recordDate: dayjs().format("YYYY-MM-DD"),
    recordTime: dayjs().format("HH:mm"),
    place: { name: "" },
    files: undefined,
    comment: "",
  };

  return <FormComp defaultValues={defaultValues} />;
}
