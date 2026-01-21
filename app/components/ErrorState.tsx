import { Link, isRouteErrorResponse } from "react-router";
import { tv } from "tailwind-variants";

const errorStyles = tv({
  slots: {
    base: "h-dvh w-full bg-yellow-100",
    container: "h-full flex flex-col justify-center items-center",
    title: "text-5xl",
    link: "text-blue-500 hover:text-blue-600 hover:underline mt-4 text-xl",
  },
});

export const ErrorState = ({ error }: Readonly<{ error: unknown }>) => {
  const { base, container, title, link } = errorStyles();

  return (
    <div className={base()}>
      <div className={container()}>
        <h1 className={title()}>
          {isRouteErrorResponse(error)
            ? `${error.status} ${error.statusText}`
            : " Something Went Wrong"}
        </h1>
        <Link to="/" className={link()}>
          ホームに戻る
        </Link>
      </div>
    </div>
  );
};
