import type { Prisma } from "@prisma/client";
import dayjs from "dayjs";
import {
  ChevronLeft,
  ChevronLeftCircle,
  ChevronRight,
  ChevronRightCircle,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { Link } from "react-router";

type ActivityDatePickerProps = {
  from: dayjs.Dayjs;
  activities: Prisma.PersonalActivityGetPayload<{
    include: {
      user: true;
    };
  }>[];
};

export default function ActivityDatePicker({
  from,
  activities,
}: ActivityDatePickerProps) {

  if(!from) {
    return null;
  }

  console.log(from);

  const days = from.daysInMonth();

  // TODO: デスクトップでのwheel 時のブラウザバックを制御したいが、SPAのページ遷移を挟むとなぜかPreventDefault()が機能しない。ブラウザのバグかもしれない。
  const horizontalScroller = useRef<HTMLDivElement>(null);
  // useEffect(() => {
  //   console.log("???");
  //   const el = horizontalScroller.current;
  //   if (!el) {
  //     return;
  //   }

  //   const onWheel = (e: WheelEvent) => {
  //     const dx = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;

  //     console.log("wheel", Math.abs(e.deltaX), dx, el.scrollLeft, el.scrollWidth - el.clientWidth)

  //     console.log("wheel2", { cancelable: e.cancelable, dx: e.deltaX, dy: e.deltaY });

  //     if (!dx) {
  //       return;
  //     }

  //     // const atLeft = el.scrollLeft <= 0;
  //     // const atRight = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;
  //     // if ((atLeft && dx < 0) || (atRight && dx > 0)) e.preventDefault();

  //     e.preventDefault();

  //     const next = el.scrollLeft + dx;
  //     const max = el.scrollWidth - el.clientWidth;
  //     el.scrollLeft = Math.max(0, Math.min(max, next));

  //   };

  //   el.addEventListener("wheel", onWheel, { passive: false, capture: true });
  //   return () => el.removeEventListener("wheel", onWheel, { capture: true });
  // }, []);

//   useEffect(() => {
//   const el = horizontalScroller.current;
//   if (!el) return;

//   const onEnter = () => {
//     console.log("locked");
//     document.documentElement.classList.add("lock-x-overscroll");
//     document.body.classList.add("lock-x-overscroll");
//   }
//   const onLeave = () => {
//         console.log("unlocked");

//     document.documentElement.classList.remove("lock-x-overscroll");
//         document.body.classList.remove("lock-x-overscroll");

//   }

//   el.addEventListener("pointerenter", onEnter);
//   el.addEventListener("pointerleave", onLeave);

//   return () => {
//     el.removeEventListener("pointerenter", onEnter);
//     el.removeEventListener("pointerleave", onLeave);
//     document.documentElement.classList.remove("lock-x-overscroll");
//   };
// }, []);

  return (
    <div>
      <div className="flex justify-between items-center">
        <div className="p-2">
          <Link to={`?from=${from.add(-1, "month").format("YYYY-MM")}`} className="align-top inline-block"><ChevronLeft /></Link>
        </div>
        <div>{from.format("YYYY年M月")}</div>
        <div className="p-2">
          <Link to={`?from=${from.add(1, "month").format("YYYY-MM")}`} className="align-top inline-block"><ChevronRight /></Link>
        </div>
      </div>
      <div
        className="overflow-x-auto w-full overscroll-x-none touch-pan-x"
        ref={horizontalScroller}
      >
        <ul className="flex gap-2">
          {Array(days)
            .fill("")
            .map((_, i) => {
              return (
                <li key={i} className="pt-2 pb-3 px-6 border rounded">
                  {i + 1}
                </li>
              );
            })}
        </ul>
      </div>
    </div>
  );
}
