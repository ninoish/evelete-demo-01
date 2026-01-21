import { useEffect, useRef } from "react";
import { useNavigation } from "react-router";
import type { LoadingBarRef } from "react-top-loading-bar";
import LoadingBar from "react-top-loading-bar";

export function NavigationLoadingBar() {
  const navigation = useNavigation();
  const ref = useRef<LoadingBarRef>(null);

  useEffect(() => {
    console.log("navstate", navigation.state);
    if (navigation.state === "loading" || navigation.state === "submitting") {
      ref.current?.continuousStart();
    }

    if (navigation.state === "idle") {
      ref.current?.complete();
    }
  }, [navigation.state]);

  return (
    <LoadingBar
      ref={ref}
      color="#3c78ff"
      shadow={false}
      height={5}
      transitionTime={100}
      waitingTime={300}
    />
  );
}
