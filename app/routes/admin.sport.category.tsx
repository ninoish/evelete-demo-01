import { type LoaderFunctionArgs } from "react-router";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  return {};
};

export default function AdminSportCategoryRoute() {
  return <div>Admin</div>;
}
