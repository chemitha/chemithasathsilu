"use client";

import { useState, useEffect } from "react";

export interface ProspectActivity {
  id: number;
  action: string;
  timestamp: string;
}

export interface ProspectData {
  clientSlug: string;
  companyName: string;
  createdAt: string;
  activities: ProspectActivity[];
  dealSigned?: boolean;
  handshakeAt?: string;
  appState?: Record<string, any>;
}

export function useProspectStore(clientSlug: string, companyName: string) {
  const STORAGE_KEY = `prospect_data_${clientSlug}`;
  const [data, setData] = useState<ProspectData | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !clientSlug) return;

    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing) {
      try {
        setData(JSON.parse(existing));
      } catch (err) {
        console.error("Failed to parse prospect local state", err);
      }
    } else {
      const seedData: ProspectData = {
        clientSlug,
        companyName,
        createdAt: new Date().toISOString(),
        dealSigned: false,
        activities: [
          {
            id: 1,
            action: `Workspace sandbox initialized for ${companyName}`,
            timestamp: new Date().toISOString(),
          },
        ],
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData));
      setData(seedData);
    }
  }, [clientSlug, companyName]);

  const recordActivity = (actionText: string) => {
    if (typeof window === "undefined" || !clientSlug) return;

    const existingStr = localStorage.getItem(STORAGE_KEY);
    const currentData: ProspectData = existingStr
      ? JSON.parse(existingStr)
      : data || {
          clientSlug,
          companyName,
          createdAt: new Date().toISOString(),
          dealSigned: false,
          activities: [],
        };

    const newEntry: ProspectActivity = {
      id: Date.now(),
      action: actionText,
      timestamp: new Date().toISOString(),
    };

    const updated: ProspectData = {
      ...currentData,
      activities: [newEntry, ...(currentData.activities || [])],
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setData(updated);
  };

  const signDeal = () => {
    if (typeof window === "undefined" || !clientSlug) return;

    const existingStr = localStorage.getItem(STORAGE_KEY);
    const currentData: ProspectData = existingStr
      ? JSON.parse(existingStr)
      : data || {
          clientSlug,
          companyName,
          createdAt: new Date().toISOString(),
          activities: [],
        };

    const updated: ProspectData = {
      ...currentData,
      dealSigned: true,
      handshakeAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setData(updated);
  };

  const getDumpForMigration = (): ProspectData | null => {
    if (typeof window === "undefined" || !clientSlug) return null;
    const existing = localStorage.getItem(STORAGE_KEY);
    return existing ? JSON.parse(existing) : data;
  };

  const migrateToProduction = async (): Promise<{
    success: boolean;
    tenantId?: string;
    error?: string;
  }> => {
    const dump = getDumpForMigration();
    if (!dump) {
      return { success: false, error: "No local prospect state found to migrate" };
    }

    try {
      const response = await fetch("/api/migrate-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dump),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        console.log("[MIGRATION SUCCESS]", result);
        if (typeof window !== "undefined") {
          localStorage.removeItem(STORAGE_KEY);
        }
        setData(null);
        return { success: true, tenantId: result.tenantId };
      } else {
        return { success: false, error: result.error || "Migration failed" };
      }
    } catch (err: any) {
      console.error("[MIGRATION ERROR]", err);
      return { success: false, error: err?.message || "Network error during migration" };
    }
  };

  return { data, recordActivity, signDeal, getDumpForMigration, migrateToProduction };
}