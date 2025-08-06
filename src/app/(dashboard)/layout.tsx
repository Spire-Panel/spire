import React from "react";
import { getSettings } from "@/actions/db.actions";
import { redirect } from "next/navigation";

type Props = {
  children: React.ReactNode;
};

const layout = async (props: Props) => {
  const settings = await getSettings();
  if (!settings.onboardingComplete) redirect("/onboarding");

  return <div>{props.children}</div>;
};

export default layout;
