import { create } from 'zustand'
import { CopilotJobContext } from './copilot'

interface CopilotState {
  isOpen: boolean
  jobContext?: CopilotJobContext
  open: (jobContext?: CopilotJobContext) => void
  close: () => void
}

/** Global open/close state for the copilot slide-over panel, so any
 * component (nav bar, a job card, the resume builder) can trigger it
 * without prop-drilling. */
export const useCopilotStore = create<CopilotState>((set) => ({
  isOpen: false,
  jobContext: undefined,
  open: (jobContext) => set({ isOpen: true, jobContext }),
  close: () => set({ isOpen: false }),
}))
