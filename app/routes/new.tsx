import type { MetaFunction } from "react-router";
import { Outlet } from "react-router";
import MainLayout from "~/layouts/MainLayout";

export const meta: MetaFunction = () => {
  return [{ title: "Evelete" }, { name: "description", content: "Evelete" }];
};

export default function Index() {
  return <MainLayout><Outlet /></MainLayout>;
}
