import { create } from 'zustand';
import { NodeStatus } from './WorkflowConstants';

interface RuntimeNodeState {
  [nodeId: string]: {
    status?: NodeStatus;
  }
}

interface FlowStore {
  runtimeNodeStates: RuntimeNodeState;
  setNodeStatus: (nodeId: string, status: NodeStatus) => void;
  clearAllStatus: () => void;
}

export const useFlowStore = create<FlowStore>((set) => ({
  runtimeNodeStates: {},
  setNodeStatus: (nodeId, status) =>
    set((state) => ({
      runtimeNodeStates: {
        ...state.runtimeNodeStates,
        [nodeId]: { ...state.runtimeNodeStates[nodeId], status },
      },
    })),
  clearAllStatus: () => set({ runtimeNodeStates: {} }),
}));