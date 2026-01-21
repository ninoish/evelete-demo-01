import { useForm, SubmitHandler } from "react-hook-form";
import type {
  AffiliationCategory,
  Prisma,
  Sport,
  SportAttribute,
} from "@prisma/client";
import { useEffect, useState } from "react";
import { useFetcher } from "react-router";

type TeamWithSports = Prisma.TeamGetPayload<{
  include: { sports: true };
}>;

interface TeamFormProps {
  team: TeamWithSports;
  onSubmit: (event: Event) => void;
}

export function TeamEditForm({ team, onSubmit }: TeamFormProps) {
  console.log(team);

  const [affiliationCategories, setAffiliationCategories] = useState<
    AffiliationCategory[]
  >([]);
  const [sports, setSports] = useState<Sport[]>([]);

  const { register, handleSubmit } = useForm({
    defaultValues: {
      displayName: team.displayName ?? "",
      description: team.description ?? "",
      slug: team.slug ?? "",
      places: team.places ?? [],
      affiliationCategories: [],
      sports: team.sports ?? [],
      sportAttributes: [],
      canRequestToJoin: team.canRequestToJoin ?? true,
      canSearch: team.canSearch ?? true,
      canViewActivities: team.canViewActivities ?? true,
      canViewMembers: team.canViewMembers ?? true,
      levelRange:
        team.levelRangeBottom && team.levelRangeTop
          ? [team.levelRangeBottom, team.levelRangeTop]
          : [0, 100],
      imageUrl: team.imageUrl ?? {},
      coverImageUrl: team.coverImageUrl ?? "",
      themeColor: team.themeColor ?? null,
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

    // fetchSports();

    const fetchAffiliationCategories = async () => {
      const response = await fetch("/api/affiliation-category-options");
      const data = await response.json();
      console.log("res api affiliationCategories", data);
      setAffiliationCategories(data);
    };

    // fetchAffiliationCategories();
  }, []);

  const sportAttributeOptionFetcher = useFetcher();
  const sportAttributeOptions = sportAttributeOptionFetcher.data as
    | SportAttribute[]
    | undefined;

  const handleSportsChange = (e) => {
    console.log("SPORTSCHANGE", e);
    form.setFieldValue("sports", e);
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

  return (
    <form method="post" onSubmit={handleSubmit(onSubmit)}>
      <label>
        <span>Team Name</span>
        <input required type="text" {...register("displayName")} />
      </label>

      <label>
        <span>About</span>
        <textarea {...register("description")}></textarea>
      </label>

      <label>
        <span>Team Slug</span>
        <input required type="text" {...register("slug")} />
      </label>

      <label>
        <span>主な活動場所</span>
        <input required type="text" {...register("places")} />
      </label>

      <label>
        <span>Team Profile Image</span>
        <span>Upload image size under 2MB</span>
        <input
          type="file"
          placeholder="profile image"
          {...register("imageUrl")}
        />
      </label>

      <label>
        <span>Level range</span>
        <input
          type="range"
          {...register("levelRange")}
          min={0}
          max={100}
          step={10}
        />
      </label>

      {/* 
        <MultiSelect
          label="競技者カテゴリー"
          placeholder=""
          data={
            affiliationCategories.map((s) => {
              return {
                label: s.name,
                value: s.id,
              };
            }) ?? []
          }
          searchable
          key={form.key("affiliationCategories")}
          {...form.getInputProps("affiliationCategories")}
        />

        <MultiSelect
          label="スポーツ"
          placeholder=""
          data={
            sports.map((s) => {
              return {
                label: s.name,
                value: s.id,
              };
            }) ?? []
          }
          searchable
          key={form.key("sports")}
          {...form.getInputProps("sports")}
          onChange={handleSportsChange}
        />

        {sportAttributeOptions ? (
          <MultiSelect
            label="スポーツ属性"
            placeholder=""
            data={sportAttributeOptions.map((sa) => {
              return {
                label: sa.name,
                value: "" + sa.id,
              };
            })}
            searchable
            key={form.key("sportAttributes")}
            {...form.getInputProps("sportAttributes")}
          />
        ) : (
          <MultiSelect
            label="スポーツ属性"
            placeholder=""
            disabled
            key={form.key("sportAttributes")}
          ></MultiSelect>
        )} */}

      <label>
        <span>チームへの参加条件 : 承認制</span>
        <input type="checkbox" {...register("canRequestToJoin")} />
      </label>

      <label>
        <span>検索からチームを探せる</span>
        <input type="checkbox" {...register("canSearch")} />
      </label>

      <label>
        <span>メンバーではないユーザーが練習などを見れる</span>
        <input type="checkbox" {...register("canViewActivities")} />
      </label>

      <label>
        <span>メンバーではないユーザーが、メンバー一覧を見れる</span>
        <input type="checkbox" {...register("canViewMembers")} />
      </label>
      <button type="submit">作成</button>
    </form>
  );
}
