import { useEffect, useState } from "react";
import { parseUserAgent } from "../utils/parseUserAgent/index.ts";

function useUserAgent() {
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const uaString = navigator.userAgent;
      const parsedResult = parseUserAgent(uaString);
      setResult(parsedResult);
    }
  }, []);

  return {
    userAgent: result,
  };
}

export default useUserAgent;
