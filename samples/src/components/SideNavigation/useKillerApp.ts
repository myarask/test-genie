import { useMemo } from "react";

export const useKillerApp = () => {
  const launch = useMemo(
    () => () => {
      console.log("lauching killer app ;)");
    },
    []
  );

  return { launch };
};
