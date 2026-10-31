import { create } from "zustand";

type Score = {
  count: number;
  inc: () => void;
};

const useStore = create<Score>()((set) => ({
  count: 1,
  inc: () => set((state) => ({ count: state.count + 1 })),
}));

export default useStore;
