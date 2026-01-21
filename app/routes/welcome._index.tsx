import { redirect } from "react-router";

export const loader = async () => {
  // TODO: signupから渡された returnUrl を引き継ぐ
  console.log("welcome index loader");
  return redirect("/welcome/basic");
};

const WelcomePage = () => {
  return null;
};

export default WelcomePage;
