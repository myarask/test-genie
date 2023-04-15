import { useMemo } from "react";

export const useKillerApp = (): {
  launch: () => void;
} => {
  const launch = useMemo(
    () => () => {
      console.log("lauching killer app ;)");
    },
    []
  );

  return { launch };
};
