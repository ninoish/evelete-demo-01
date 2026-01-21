import type { RecordMaster } from "@prisma/client";
import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { useEffect, useState } from "react";
import { Form, Link, useSubmit } from "react-router";
import z from "zod";
import useGoogleMapsLoader from "~/hooks/useGoogleMapsLoader";
import RecordCommonHeader from "./RecordCommonHeader";

const data = {
  numberOfHoles: 18, // ハーフなら9
  par: 72, // 71, 73もあるらしい。
  userScore: 84,
  place: {
    id: "placeid",
    name: "東京国際カントリー",
    lat: 40.0,
    lng: 135.0,
  },
  holes: [
    {
      courseName: "out", // 東, 西などもある
      holeNo: 1,
      par: 4,
      useScore: 4,
    },
    {
      courseName: "out", // 東, 西などもある
      holeNo: 2,
      par: 5,
      useScore: 8,
    },
  ],
};

const GolfScoreFormSchema = z
  .object({
    numberOfHoles: z.number().optional(),
    par: z.number().optional(),
    userScore: z.number().optional(),
    place: z
      .object({
        id: z.string().optional(),
        name: z.string(),
        countryId: z.string().optional(),
        stateId: z.string().optional(),
        cityId: z.string().optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
      })
      .optional(),
    holes: z
      .array(
        z.object({
          courseName: z.string().optional(),
          holeNo: z.number().optional(),
          par: z.number().optional(),
          userScore: z.number(),
        }),
      )
      .optional(),
  })
  .refine((data) => !!data.userScore, {
    path: ["userScore"],
    message: "ユーザースコアは必須です",
  });

export type GolfScoreFormData = z.infer<typeof GolfScoreFormSchema>;

export const { fieldContext, formContext, useFormContext } =
  createFormHookContexts();

export const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {}, // カスタムUIがあれば指定
  formComponents: {}, // SubmitButtonなどあれば指定
});

export function GolfScoreForm({
  recordMaster,
  par,
  numberOfHoles,
  mapsApiKey,
}: {
  recordMaster: RecordMaster;
  par: number;
  numberOfHoles: number;
  mapsApiKey: string;
}) {
  const isApiLoaded = useGoogleMapsLoader({
    apiKey: mapsApiKey ?? "",
    libraries: ["places"],
    version: "weekly",
  });

  const [selectedPlace, setSelectedPlace] = useState<{
    id: string;
    displayName: string;
    formattedAddress: string;
    location: {
      lat: number;
      lng: number;
    };
  } | null>(null);

  const [placeService, setPlaceService] =
    useState<google.maps.places.PlacesService | null>(null);

  useEffect(() => {
    if (isApiLoaded && !placeService) {
      // Now you can safely use google.maps.importLibrary
      const loadPlacesLibrary = async () => {
        try {
          const { Place, PlacesService } = (await google.maps.importLibrary(
            "places",
          )) as google.maps.places.PlacesLibrary;
          // You can now use the Place and PlacesService classes
          console.log("Places library loaded successfully!");
          //@ts-ignore
          const placeAutocomplete =
            new google.maps.places.PlaceAutocompleteElement();

          placeAutocomplete.addEventListener("gmp-placeselect", (ev) => {
            console.log("gmp-placeselect", ev);
          });

          placeAutocomplete.addEventListener(
            "gmp-select",
            async ({ placePrediction }) => {
              const place = placePrediction.toPlace();
              await place.fetchFields({
                fields: [
                  "displayName",
                  "formattedAddress",
                  "addressComponents",
                  "location",
                ],
              });

              setSelectedPlace(place.toJSON());

              console.log(
                JSON.stringify(
                  place.toJSON(),
                  /* replacer */ null,
                  /* space */ 2,
                ),
              );
            },
          );

          document
            .getElementById("googlePlaceAutocomplete")
            ?.appendChild(placeAutocomplete);
        } catch (error) {
          console.error("Error loading Places library:", error);
        }
      };
      loadPlacesLibrary();
    }
  }, [isApiLoaded, placeService]);

  const submit = useSubmit();

  const defaultMeta = { submitAction: null as string | null };

  const form = useAppForm<
    GolfScoreFormData,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any
  >({
    defaultValues: {
      userScore: undefined,
      numberOfHoles: numberOfHoles,
      par: par,
      place: {
        id: undefined,
        name: "",
        countryId: undefined,
        stateId: undefined,
        cityId: undefined,
        latitude: undefined,
        longitude: undefined,
      },
      holes: new Array(18).map((_, i) => {
        return {
          courseName: "",
          holeNo: i,
          par: 4,
          userScore: 4,
        };
      }),
    },
    onSubmitMeta: defaultMeta,
    validators: {
      onChange: ({ value }: { value: any }) => {
        const res = GolfScoreFormSchema.safeParse(value);
        if (!res.success) {
          console.log("nono2", res);
          return res.error.flatten().fieldErrors;
        }
      },
      onSubmit: ({ value }: { value: any }) => {
        console.log(value);
        const res = GolfScoreFormSchema.safeParse(value);
        if (!res.success) {
          console.log("nono", res);
          return res.error.flatten().fieldErrors;
        }
      },
    },

    onSubmit: ({ value, meta }) => {
      console.log("submit value:", value, "meta:", meta);

      const formData = new FormData();

      for (const [key, val] of Object.entries(value)) {
        if (val === undefined || val === null) continue;

        if (Array.isArray(val)) {
          for (const item of val) {
            if (item !== undefined && item !== null) {
              if (item instanceof File) {
                formData.append(key, item);
              } else if (typeof item === "object") {
                formData.append(key, JSON.stringify(item));
              } else {
                formData.append(key, String(item));
              }
            }
          }
        } else {
          if (val !== undefined && val !== null) {
            if ((val as any) instanceof File) {
              formData.append(key, val);
            } else {
              formData.append(key, String(val));
            }
          }
        }
      }

      submit(formData, {
        method: "post",
        encType: "application/x-www-form-urlencoded",
      });
    },
  });

  return (
    <div>
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit({ submitAction: "golfScoreForm" });
        }}
        method="post"
      >
        <RecordCommonHeader title={recordMaster.nameJa} />
        <div className="flex flex-col gap-2">
          <div>
            <form.Field name="userScore">
              {(field) => (
                <label className="">
                  <span className="">トータルスコア</span>
                  <input
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) =>
                      field.handleChange(parseInt(e.target.value, 10))
                    }
                    type="number"
                    step="1"
                    min="1"
                    max="400"
                    required={true}
                  />
                  <div style={{ color: "red" }}>
                    {field.state.meta.errors[0]}
                  </div>
                </label>
              )}
            </form.Field>
          </div>

          <div>
            <form.Field name="par">
              {(field) => (
                <label className="">
                  <span className="">パー</span>
                  <input
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) =>
                      field.handleChange(parseInt(e.target.value, 10))
                    }
                    type="number"
                    step="1"
                    min="1"
                    max="150"
                    required={true}
                  />
                  <div style={{ color: "red" }}>
                    {field.state.meta.errors[0]}
                  </div>
                </label>
              )}
            </form.Field>
          </div>

          <div>
            <form.Field name="numberOfHoles">
              {(field) => (
                <label className="">
                  <span className="">ホール数</span>
                  <input
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) =>
                      field.handleChange(parseInt(e.target.value, 10))
                    }
                    type="number"
                    step="1"
                    min="1"
                    max="36"
                    required={true}
                  />
                  <div style={{ color: "red" }}>
                    {field.state.meta.errors[0]}
                  </div>
                </label>
              )}
            </form.Field>
          </div>

          <div>
            {!isApiLoaded && <p>Loading Google Maps API...</p>}
            <div id="googlePlaceAutocomplete" className="border rounded"></div>
          </div>

          {selectedPlace ? (
            <div className="mt-1 rounded">
              <Link
                target="_blank"
                to={`https://www.google.com/maps/search/?api=1&query=${selectedPlace.location.lat},${selectedPlace.location.lng}&query_place_id=${selectedPlace.id}`}
              >
                <img
                  src={`https://maps.googleapis.com/maps/api/staticmap?center=${selectedPlace.location.lat},${selectedPlace.location.lng}&zoom=15&size=720x480&markers=color:red|${selectedPlace.location.lat},${selectedPlace.location.lng}&key=${mapsApiKey}`}
                />
              </Link>
            </div>
          ) : null}
        </div>
      </Form>
    </div>
  );
}
