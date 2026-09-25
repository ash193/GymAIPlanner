import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { User, UserProfile } from "../types";
import { authClient } from "../lib/auth";
import { api } from "../lib/api";
import type { TrainingPlan } from "../../server/types/index";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isPlanLoading: boolean;
  plan: TrainingPlan | null;
  saveProfile: (
    profile: Omit<UserProfile, "userId" | "updatedAt">,
  ) => Promise<void>;
  generatePlan: () => Promise<void>;
  refreshData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [neonUser, setNeonUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isRefreshingRef = useRef(false);
  const [plan, setPlan] = useState<TrainingPlan | null>(null);
  const [isPlanLoading, setIsPlanLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const result = await authClient.getSession();
        if (result && result.data?.user) {
          setNeonUser(result.data.user);
        } else {
          setNeonUser(null);
        }
      } catch (err) {
        setNeonUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, []);

  const refreshData = useCallback(async () => {
    if (!neonUser || isRefreshingRef.current) return;
    isRefreshingRef.current = true;
    setIsPlanLoading(true);
    try {
      const planData = await api.getCurrentPlan(neonUser.id);
      if (planData) {
        setPlan({
          id: planData.id,
          userId: planData.userId,
          overview: planData.planJson.overview,
          weeklySchedule: planData.planJson.weeklySchedule,
          progression: planData.planJson.progression,
          version: planData.version,
          createdAt: planData.createdAt,
        });
      } else {
        setPlan(null);
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
      setPlan(null);
    } finally {
      isRefreshingRef.current = false;
      setIsPlanLoading(false);
    }
  }, [neonUser?.id]);

  useEffect(() => {
    if (!isLoading && neonUser?.id) {
      void refreshData();
    }
  }, [isLoading, neonUser?.id, refreshData]);

  async function saveProfile(
    profileData: Omit<UserProfile, "userId" | "updatedAt">,
  ) {
    if (!neonUser) {
      throw new Error("User must be authenticated to save profile");
    }
    await api.saveProfile(neonUser.id, profileData);
    await refreshData();
  }

  async function generatePlan() {
    if (!neonUser) {
      throw new Error("User must be authenticated to generate plan");
    }
    await api.generatePlan(neonUser.id);
    await refreshData();
  }

  return (
    <AuthContext.Provider
      value={{
        user: neonUser,
        plan,
        isLoading,
        isPlanLoading,
        saveProfile,
        generatePlan,
        refreshData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
