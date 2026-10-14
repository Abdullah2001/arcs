import Home, { homeMetadata } from "../../site/home";

export const dynamic = "force-dynamic";
export const generateMetadata = () => homeMetadata("en");

export default function Page() {
  return <Home lang="en" />;
}
