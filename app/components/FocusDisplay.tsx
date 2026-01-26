import type { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { Prisma } from "@prisma/client";
import { Link } from "react-router";

import styles from "./FocusDisplay.module.css";
import { convertDateToRelativeDate } from "~/utils/display";
import { convertUnitValueToUnitDisplay } from "~/utils/unitConverter";

export default function FocusDisplay({
  userFocuses,
}: {
  userFocuses: Prisma.UserFocusGetPayload<{
    include: {
      recordMaster: true;
    };
  }>[];
}) {
  return (
    <div className="py-2">
      <div className="mb-2 px-4 flex items-center">
        <h1 className="flex-1 text-2xl italic font-bold">My Focus</h1>
        <div className="flex justify-center items-center">
          <Link to="/me/settings/focus" className="w-full h-full">
            <FontAwesomeIcon icon={faChevronRight} size="sm" />
          </Link>
        </div>
      </div>
      <div className="">
        <div className="w-full flex flex-wrap px-4">
          {userFocuses.map((uf) => {
            return (
              <Link
                to={`/me/records/${uf.recordMaster.id}`}
                key={uf.recordMasterId}
                className="block w-1/2 md:w-ful "
              >
                <div className="flex flex-col">
                  <h5 className={`${styles.focusTitle}`}>
                    {uf.recordMaster.nameJa}
                  </h5>
                  <div>
                    {uf.value ? (
                      <>
                        <h4>
                          <span
                            className={`text-4xl font-bold ${styles.focusDigit}`}
                          >
                            {uf.value}
                          </span>
                          {uf.recordMaster.unitValue ? (
                            <span className={`text-right ${styles.focusUnit}`}>
                              {convertUnitValueToUnitDisplay(
                                null,
                                null,
                                uf.recordMaster.unitValue,
                              )}
                            </span>
                          ) : null}
                        </h4>
                        <div className="flex gap-2">
                          {uf.data && typeof uf.data["diff"] !== "undefined" ? (
                            <span
                              className={`text-slate-500 ${styles.focusDiff}`}
                            >
                              <span>{uf.data["diff"]}</span>
                              {convertUnitValueToUnitDisplay(
                                null,
                                null,
                                uf.recordMaster.unitValue,
                              )}
                            </span>
                          ) : null}
                          {uf.data &&
                          typeof uf.data["diffDate"] !== "undefined" ? (
                            <span
                              className={`text-slate-500 ${styles.focusMeasureDate}`}
                            >
                              {convertDateToRelativeDate(uf.data["diffDate"])}
                            </span>
                          ) : null}
                        </div>
                      </>
                    ) : (
                      <div>
                        <span
                          className={`text-4xl font-bold ${styles.focusDigit} text-gray-500`}
                        >
                          --
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
