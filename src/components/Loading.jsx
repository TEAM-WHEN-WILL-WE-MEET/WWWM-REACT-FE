import { useEffect, useState } from "react";
import { cva } from "class-variance-authority";
import Lottie from "lottie-react";

const containerClasses = cva("bg-white fixed inset-0 flex items-center justify-center z-50");

const Loading = () => {
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    //Loading.json import
    fetch("/Loading.json")
      .then((response) => response.json())
      .then((data) => setAnimationData(data))
      .catch((error) => console.error("Loading.json 로딩 에러:", error));
  }, []);

  if (!animationData){ 
    return null; // 애니메이션 데이터가 로드되기 전엔 아무것도 렌더링하지 않음
  }

  return (
    <div className={containerClasses()}>
      <Lottie animationData={animationData} loop={true} />
    </div>
  );
};

export default Loading;
