import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return <main className="shell auth-page"><SignIn /></main>;
}
