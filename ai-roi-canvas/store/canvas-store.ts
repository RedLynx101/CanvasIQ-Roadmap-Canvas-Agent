import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  AIROICanvas, 
  AIUseCase, 
  ChatMessage, 
  InterviewPhase,
  createEmptyCanvas,
} from '@/lib/canvas-schema';
import { calculatePortfolioMetrics } from '@/lib/calculations';

interface CanvasStore {
  // Hydration state
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  // Canvas data
  canvas: AIROICanvas;
  useCases: AIUseCase[];
  
  // Interview state
  messages: ChatMessage[];
  currentPhase: InterviewPhase;
  isLoading: boolean;
  
  // Company context
  companyName: string;
  industry: string;
  budgetConstraint: number;
  
  // Actions - Canvas
  setCanvas: (canvas: AIROICanvas) => void;
  updateCanvasSection: <K extends keyof AIROICanvas>(section: K, data: AIROICanvas[K]) => void;
  
  // Actions - Use Cases
  addUseCase: (useCase: AIUseCase) => void;
  updateUseCase: (id: string, data: Partial<AIUseCase>) => void;
  removeUseCase: (id: string) => void;
  toggleUseCaseSelection: (id: string) => void;
  setUseCases: (useCases: AIUseCase[]) => void;
  
  // Actions - Chat
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;
  setCurrentPhase: (phase: InterviewPhase) => void;
  setIsLoading: (loading: boolean) => void;
  
  // Actions - Company Context
  setCompanyContext: (name: string, industry: string, budget: number) => void;
  
  // Computed
  getSelectedUseCases: () => AIUseCase[];
  getPortfolioMetrics: () => ReturnType<typeof calculatePortfolioMetrics>;
  
  // Reset
  resetStore: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useCanvasStore = create<CanvasStore>()(
  persist(
    (set, get) => ({
      // Hydration state
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      
      // Initial state
      canvas: createEmptyCanvas(),
      useCases: [],
      messages: [],
      currentPhase: 'welcome',
      isLoading: false,
      companyName: '',
      industry: '',
      budgetConstraint: 1000000,
      
      // Canvas actions
      setCanvas: (canvas) => set({ canvas }),
      
      updateCanvasSection: (section, data) => set((state) => ({
        canvas: { ...state.canvas, [section]: data },
      })),
      
      // Use case actions
      addUseCase: (useCase) => set((state) => ({
        useCases: [...state.useCases, useCase],
      })),
      
      updateUseCase: (id, data) => set((state) => ({
        useCases: state.useCases.map((uc) =>
          uc.id === id ? { ...uc, ...data } : uc
        ),
      })),
      
      removeUseCase: (id) => set((state) => ({
        useCases: state.useCases.filter((uc) => uc.id !== id),
      })),
      
      toggleUseCaseSelection: (id) => set((state) => ({
        useCases: state.useCases.map((uc) =>
          uc.id === id ? { ...uc, selected: !uc.selected } : uc
        ),
      })),
      
      setUseCases: (useCases) => set({ useCases }),
      
      // Chat actions
      addMessage: (message) => set((state) => ({
        messages: [
          ...state.messages,
          {
            ...message,
            id: generateId(),
            timestamp: new Date(),
          },
        ],
      })),
      
      clearMessages: () => set({ messages: [] }),
      
      setCurrentPhase: (phase) => set({ currentPhase: phase }),
      
      setIsLoading: (loading) => set({ isLoading: loading }),
      
      // Company context
      setCompanyContext: (name, industry, budget) => set({
        companyName: name,
        industry,
        budgetConstraint: budget,
      }),
      
      // Computed getters
      getSelectedUseCases: () => {
        return get().useCases.filter((uc) => uc.selected);
      },
      
      getPortfolioMetrics: () => {
        return calculatePortfolioMetrics(get().useCases);
      },
      
      // Reset
      resetStore: () => set({
        canvas: createEmptyCanvas(),
        useCases: [],
        messages: [],
        currentPhase: 'welcome',
        isLoading: false,
        companyName: '',
        industry: '',
        budgetConstraint: 1000000,
      }),
    }),
    {
      name: 'ai-roi-canvas-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        canvas: state.canvas,
        useCases: state.useCases,
        companyName: state.companyName,
        industry: state.industry,
        budgetConstraint: state.budgetConstraint,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

