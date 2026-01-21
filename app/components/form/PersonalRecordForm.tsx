import { useForm, SubmitHandler } from "react-hook-form";
import {
  type AffiliationCategory,
  type Sport,
  type SportAttribute,
} from "@prisma/client";
import { useFetcher } from "react-router";
import { useEffect, useState } from "react";

interface PersonalRecordFormProps {
  onSubmit: (event: Event) => null;
}

export function PersonalRecordForm({
  record,
  onSubmit,
}: PersonalRecordFormProps) {
  const [affiliationCategories, setAffiliationCategories] = useState<
    AffiliationCategory[]
  >([]);
  const [sports, setSports] = useState<Sport[]>([]);


  const { register, handleSubmit } = useForm({
    defaultValues: {
      recordCategory: "",
      recordCategoryDetail: "",
      recordTarget: [],
      displayType: [],
      recordDatetime: [],
      summary: "",
      media: "",
      detail: "",
    },
  });

  // カテゴリーデータを取得
  useEffect(() => {
    const fetchSports = async () => {
      const response = await fetch("/api/sport-options");
      const data = await response.json();
      console.log("res api sports", data);
      setSports(data);
    };

    fetchSports();

    const fetchAffiliationCategories = async () => {
      const response = await fetch("/api/affiliation-category-options");
      const data = await response.json();
      console.log("res api affiliationCategories", data);
      setAffiliationCategories(data);
    };

    fetchAffiliationCategories();
  }, []);

  const sportAttributeOptionFetcher = useFetcher();
  const sportAttributeOptions = sportAttributeOptionFetcher.data as
    | SportAttribute[]
    | undefined;


  const handleSportsChange = (e) => {
    console.log("SPORTSCHANGE", e);
    // form.setFieldValue("sports", e);
    sportAttributeOptionFetcher.load(
      `/api/sport-attribute-options?sportIds=${e.join(",")}`,
    );
  };

  if (sportAttributeOptionFetcher.data) {
    console.log(
      "sportAttributeOptionFetcher data ",
      sportAttributeOptionFetcher.data,
    );
  }

  return <form method="post" onSubmit={handleSubmit(onSubmit)}></form>;
}
