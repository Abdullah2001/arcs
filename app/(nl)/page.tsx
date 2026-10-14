import Home, { homeMetadata } from "../site/home";

export const dynamic = "force-dynamic";
export const generateMetadata = () => homeMetadata("nl");

export default function Page() {
  return <Home lang="nl" />;
}
