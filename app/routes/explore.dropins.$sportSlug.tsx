import type { LoaderFunctionArgs } from "react-router";
import {
  data,
  Form,
  Link,
  redirect,
  useFetcher,
  useLoaderData,
} from "react-router";
import dayjs from "dayjs";

import { Auth } from "~/services/auth.server";
import { getPrisma } from "~/services/database.server";
import { date, now } from "~/utils/datetime";
import { TeamActivityType } from "@prisma/client";
import { FaFilter, FaSearch } from "react-icons/fa";
import { Button } from "~/components/ui/button";
import { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { HiChevronRight } from "react-icons/hi2";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  if (!params.sportId) {
    return redirect("/");
  }

  const date = new URL(request.url).searchParams.get("date");
  const stateId = new URL(request.url).searchParams.get("stateId");
  const cityId = new URL(request.url).searchParams.get("cityId");
  const sportAttributeParams = new URL(request.url).searchParams.getAll(
    "sportAttrs",
  );

  const db = getPrisma();

  // TODO: get by user settings
  const country = await db.country.findFirst({
    where: {
      name: "Japan",
    },
  });

  const countryId = country?.id;
  const states = await db.state.findMany({
    where: {
      countryId: countryId,
    },
  });

  const sport = await db.sport.findFirst({
    where: {
      id: params.sportId,
    },
  });
  if (!sport) {
    throw data({ errorMessage: "Sport Not Found" }, { status: 404 });
  }

  const searchFilter = {
    cityId: null,
    stateId: null,
    sportAttributeIds: null,
  } as {
    stateId: null | string;
    cityId: null | string;
    sportAttributeIds: null | string[];
  };

  if (stateId) {
    const state = await db.state.findFirst({
      where: {
        id: stateId,
      },
    });

    if (!state) {
      throw data({ errorMessage: "Invalid parameter" }, { status: 400 });
    }
    searchFilter.stateId = state.id;
  }

  if (cityId && searchFilter.stateId) {
    const city = await db.city.findFirst({
      where: {
        id: cityId,
        stateId: searchFilter.stateId,
      },
    });

    if (!city) {
      throw data({ errorMessage: "Invalid parameter" }, { status: 400 });
    }
    searchFilter.cityId = city.id;
  }

  if (sportAttributeParams?.length > 0) {
    const sportAttributes = await db.sportAttribute.findMany({
      where: {
        id: {
          in: sportAttributeParams.filter((sap) => sap),
        },
      },
    });

    if (!sportAttributes) {
      throw data({ errorMessage: "Invalid parameter" }, { status: 404 });
    }
    searchFilter.sportAttributeIds = sportAttributes.map((sa) => sa.id);
  }

  const cities = searchFilter.stateId
    ? await db.city.findMany({
        where: {
          stateId: searchFilter.stateId,
        },
      })
    : null;

  const user = await new Auth().isAuthenticated(request);

  console.log(searchFilter);

  const dropins = await db.teamActivity.findMany({
    where: {
      sportId: sport.id,
      startDatetime: {
        gte: now().toDate(),
      },
      teamActivityType: TeamActivityType.PRACTICE,
      isGuestAllowed: true,
      // TODO: status:
      placeStateId: searchFilter.stateId ?? undefined,
      placeCityId: searchFilter.cityId ?? undefined,
      sportAttributes: searchFilter.sportAttributeIds
        ? {
            some: {
              sportAttributeId: {
                in: searchFilter.sportAttributeIds,
              },
            },
          }
        : undefined,
    },
    include: {
      team: true,
      sport: true,
      sportAttributes: {
        include: {
          sportAttribute: true,
        },
      },
    },
    take: 20,
    orderBy: {
      startDatetime: "asc",
    },
  });

  const sportAttributes = await db.sportAttribute.findMany({
    where: {
      sportId: sport.id,
    },
  });

  return { user, sport, sportAttributes, dropins, countryId, states, cities };
};

export default function ExploreDropInsBySportRoute() {
  const data = useLoaderData<typeof loader>();
  const { user, sport, sportAttributes, dropins, countryId, states, cities } =
    data;

  const citiesFetcher = useFetcher();

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [cityOptions, setCityOptions] = useState(cities);
  const [selectedStateId, setSelectedStateId] = useState<string | undefined>(
    undefined,
  );

  useEffect(() => {
    if (citiesFetcher.data?.result) {
      setCityOptions(citiesFetcher.data.result);
    }
  }, [citiesFetcher.data]);

  const onChangeFilterState = async (
    ev: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const stateId = ev.currentTarget.value;
    setSelectedStateId(stateId);

    const formData = new FormData();
    formData.append("countryId", countryId ?? "");
    formData.append("stateId", stateId);

    citiesFetcher.submit(formData, {
      method: "post",
      action: "/api/place/cities",
    });
  };

  return (
    <div className="px-4 py-2">
      <div className="flex items-center gap-1">
        <Link to="/explore/dropins" className="mr-2">
          <FaSearch size={20} />
        </Link>
        <HiChevronRight size={16} />
        <h1 className="font-bold text-lg md:text-2xl flex">
          <span className="mr-1">{sport.emoji}</span>
          <span>{sport.name_ja_JP}</span>
          <span className="ml-2">ドロップイン検索</span>
        </h1>
      </div>

      <div className="my-2">
        <Button
          onClick={() => {
            setIsFilterModalOpen(true);
          }}
        >
          <FaFilter size={16} />
          検索条件
        </Button>
      </div>

      {isFilterModalOpen ? (
        <Form
          method="get"
          onSubmit={() => {
            setIsFilterModalOpen(false);
          }}
        >
          <div className="fixed top-0 left-0 right-0 bottom-0 z-10 bg-white">
            <div className="flex flex-col h-full w-full">
              <div className="flex items-center gap-2 py-2 px-4 border-b">
                <h6 className="flex-1 font-bold text-xl">
                  ドロップインを絞り込む
                </h6>
                <button
                  onClick={() => {
                    setIsFilterModalOpen(false);
                  }}
                >
                  <IoClose size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-scroll p-4">
                <div className="flex gap-2 items-center">
                  <label className="flex-1">
                    <span>都道府県</span>
                    <select name="stateId" onChange={onChangeFilterState}>
                      <option></option>
                      {states.map((state) => {
                        return (
                          <option key={state.id} value={state.id}>
                            {state.name}
                          </option>
                        );
                      })}
                    </select>
                  </label>

                  <label className="flex-1">
                    <span>市区町村</span>
                    {cityOptions ? (
                      <select name="cityId">
                        <option></option>
                        {cityOptions.map((city) => {
                          return (
                            <option key={city.id} value={city.id}>
                              {city.name}
                            </option>
                          );
                        })}
                      </select>
                    ) : (
                      <select name="filteredCity" disabled></select>
                    )}
                  </label>
                </div>

                <div className="flex gap-2 items-center">
                  <label className="flex-1">
                    <span>日付</span>
                    <input type="date" name="startDate" />
                  </label>

                  <label className="flex-1">
                    <span>開始時間</span>
                    <input type="time" name="startTime" />
                  </label>
                </div>

                <div>
                  <h5>スポーツ属性</h5>

                  <ul className="flex flex-wrap items-center gap-2">
                    {sportAttributes.map((sa) => {
                      return (
                        <li key={sa.id}>
                          <label>
                            <span>{sa.name}</span>
                            <input
                              type="checkbox"
                              name="filteredSportAttributes"
                              value={sa.id}
                            />
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div>
                  <label>
                    <span>競技レベル</span>
                    <select name="filteredLevel" multiple>
                      <option>Level 1</option>
                      <option>Level 2</option>
                      <option>Level 3</option>
                      <option>Level 4</option>
                      <option>Level 5</option>
                      <option>Level 6</option>
                      <option>Level 7</option>
                      <option>Level 8</option>
                      <option>Level 9</option>
                      <option>Level 10</option>
                    </select>
                  </label>
                </div>

                <div>
                  <label>
                    <span>年齢</span>
                    <input type="range" />
                  </label>
                </div>

                {/* 優先度低いのでコメントアウト */}
                {/* <div>
          <label>
            <span>値段</span>
            <div className="flex items-center gap-2">
              <span>¥</span>
              <input type="number" min="0" placeholder="最小値" />
              <span>¥</span>
              <input type="number" min="0" placeholder="最大値" />
            </div>
          </label>
        </div> */}
              </div>
              <div className="p-2">
                <Button type="submit" className="w-full bg-blue-700 text-lg">
                  検索する
                </Button>
              </div>
            </div>
          </div>
        </Form>
      ) : null}

      {dropins?.length ? (
        <div>
          <ul className="flex flex-wrap gap-x-2 gap-y-4">
            {dropins.map((ta) => {
              return (
                <li
                  key={ta.id}
                  className="rounded shadow-lg border border-gray-200 p-4 w-full md:w-1/2 lg:w-1/3 hover:bg-slate-100"
                >
                  <Link to={`/teams/activities/${ta.id}`} className="">
                    <div className="flex items-center gap-x-2">
                      {ta.team.imageUrl ? (
                        <div className="rounded-full h-8 w-8 overflow-hidden">
                          <div
                            className="bg-cover bg-center h-full w-full"
                            style={{
                              backgroundImage: `url(${ta.team.imageUrl})`,
                            }}
                          />
                        </div>
                      ) : null}
                      <span>{ta.team.displayName} -</span>
                    </div>
                    {ta.sport ? (
                      <>
                        <ul className="flex gap-2">
                          {ta.sportAttributes?.map((sa) => {
                            return (
                              <li key={sa.sportAttributeId}>
                                {sa.sportAttribute.name}
                              </li>
                            );
                          })}
                        </ul>
                      </>
                    ) : null}
                    <div>
                      日時 :
                      <span>
                        {date(ta.startDatetime).format("YYYY年MM月DD日 HH:mm")}
                      </span>
                      <span className="mx-2">-</span>
                      <span>
                        {ta.endDatetime
                          ? date(ta.endDatetime).format("HH:mm")
                          : null}
                      </span>
                    </div>
                    <div>
                      <span className="mr-4">🏟️ {ta.place}</span>
                    </div>
                    <div>
                      <span>¥{ta.priceForGuest}</span>
                    </div>
                    <h2 className="text-lg whitespace-nowrap">{ta.name}</h2>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <div>No result</div>
      )}
    </div>
  );
}
