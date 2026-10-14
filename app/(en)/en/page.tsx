import HomePage, { buildMetadata } from "../../home-page";

export const dynamic = "force-dynamic";

export function generateMetadata() {
  return buildMetadata("en");
}

export default function Page() {
  return <HomePage lang="en" />;
}
