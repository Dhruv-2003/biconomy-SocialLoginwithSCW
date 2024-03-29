import dynamic from "next/dynamic";
import { Suspense } from "react";

const Index = () => {
  const SocialLoginDynamic = dynamic(
    () => import("../component/login").then((res) => res.default),
    {
      ssr: false,
    }
  );

  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <SocialLoginDynamic />
      </Suspense>
    </div>
  );
};

export default Index;
