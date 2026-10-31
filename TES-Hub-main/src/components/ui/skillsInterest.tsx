import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

const SkillsInterest = ({ children }: Props) => {
  return (
    <span className="text-[#191C1B] px-3 py-1 bg-[#E6E9E7] rounded">
      {children}
    </span>
  );
};

export default SkillsInterest;
