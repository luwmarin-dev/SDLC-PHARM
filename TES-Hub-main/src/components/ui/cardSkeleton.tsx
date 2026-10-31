const CardSkeleton = () => {
  return (
    <div className="rounded-lg border border-[#C1C8C2] overflow-hidden animate-pulse">
      <div className="bg-[#c1c8c280] h-50" />
      <div className="p-6 flex flex-col gap-3 h-55">
        <div className="flex justify-between items-center">
          <div className="bg-[#c1c8c280] h-5 w-16 rounded-xs" />
          <div className="bg-[#c1c8c280] h-5 w-10 rounded-xs" />
        </div>
        <div className="flex flex-col gap-2">
          <div className="bg-[#c1c8c280] h-4 w-3/4 rounded-xs" />
          <div className="bg-[#c1c8c280] h-4 w-full rounded-xs" />
          <div className="bg-[#c1c8c280] h-4 w-2/3 rounded-xs" />
        </div>
        <div>
          <div className="bg-[#c1c8c280] h-px w-full my-5" />
          <div className="bg-[#c1c8c280] h-4 w-14 rounded-xs" />
        </div>
      </div>
    </div>
  );
};

export default CardSkeleton;
