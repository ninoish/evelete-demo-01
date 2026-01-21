import { useEffect, useRef } from "react";

interface GoogleMapsLoaderOptions {
  apiKey: string;
  version?: string;
  libraries?: string[];
  // Add other bootstrap parameters as needed
}

const useGoogleMapsLoader = (options: GoogleMapsLoaderOptions) => {
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (scriptLoaded.current) {
      return;
    }

    const {
      apiKey,
      version = "weekly",
      libraries = [],
      ...otherParams
    } = options;

    console.log(apiKey);
    if (!apiKey) {
      return;
    }
    const script = document.createElement("script");
    const params = new URLSearchParams();

    params.set("key", apiKey);
    params.set("v", version);
    if (libraries.length > 0) {
      params.set("libraries", libraries.join(","));
    }

    // Add other bootstrap parameters
    for (const key in otherParams) {
      if (Object.prototype.hasOwnProperty.call(otherParams, key)) {
        params.set(
          key.replace(/[A-Z]/g, (t) => "_" + t[0].toLowerCase()),
          (otherParams as any)[key],
        );
      }
    }

    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    script.async = true;
    script.defer = true; // Consider defer for better performance

    script.onload = () => {
      scriptLoaded.current = true;
      // You might want to expose the google.maps object here or use a context

      console.log("google maps script loaded");
    };

    script.onerror = (error) => {
      console.error("The Google Maps JavaScript API could not load.", error);
    };

    document.head.appendChild(script);

    return () => {
      // Clean up the script if the component unmounts before it loads
      if (!scriptLoaded.current && document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []); // Re-run effect if options change

  // You might return the loading status or the google.maps object
  return scriptLoaded.current;
};

export default useGoogleMapsLoader;
