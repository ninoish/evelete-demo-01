import { Link, type LoaderFunctionArgs } from "react-router";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  return {};
};

export default function AdminIndexRoute() {
  return (
    <div>
      <div>
        <Link to="sport">Sports</Link>
      </div>
    </div>
  );
}
