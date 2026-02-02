import { cache } from "react";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { getApiClient } from "@/lib/api/server-client";
import type {
  Deliverable,
  MeetingLog,
  Phase,
  PhaseDetail,
  Task,
} from "@/lib/types";

/**
 * Fetches all phases.
 * Accepts optional token for 'use cache' compatibility.
 */
export const getPhases = cache(
  async (explicitToken?: string): Promise<Phase[]> => {
    try {
      const api = await getApiClient(explicitToken);
      const response = await api.get<Phase[]>(API_ENDPOINTS.PHASES.LIST);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch phases:", error);
      return [];
    }
  }
);

/**
 * Fetches all phases with detailed information including deliverables
 * Accepts optional token for 'use cache' compatibility
 * Uses Promise.all for parallel fetching
 */
export const getPhasesWithDetails = cache(
  async (explicitToken?: string): Promise<PhaseDetail[]> => {
    try {
      const api = await getApiClient(explicitToken);

      const phasesResponse = await api.get<Phase[]>(API_ENDPOINTS.PHASES.LIST);
      const phases = phasesResponse.data;

      const phasesWithDetails = await Promise.all(
        phases.map(async (phase: Phase) => {
          try {
            const detailResponse = await api.get<PhaseDetail>(
              API_ENDPOINTS.PHASES.GET(phase.id)
            );
            return detailResponse.data;
          } catch (error) {
            console.error(
              `Failed to fetch details for phase ${phase.id}:`,
              error
            );
            return null;
          }
        })
      );

      return phasesWithDetails.filter(
        (phase: PhaseDetail | null): phase is PhaseDetail => phase !== null
      );
    } catch (error) {
      console.error("Failed to fetch phases with details:", error);
      return [];
    }
  }
);

/**
 * Fetches a single phase by ID with details
 * Accepts optional token for 'use cache' compatibility
 */
export const getPhaseById = cache(
  async (id: string, explicitToken?: string): Promise<PhaseDetail | null> => {
    try {
      const api = await getApiClient(explicitToken);
      const response = await api.get<PhaseDetail>(API_ENDPOINTS.PHASES.GET(id));
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch phase ${id}:`, error);
      return null;
    }
  }
);

// ========================================
// Individual Phase Data Fetchers
// ========================================

/**
 * Fetches only phase header data: title, start/end dates, type
 * Lightweight option for displaying phase header information
 */
export const getPhaseHeader = cache(
  async (
    id: string,
    explicitToken?: string
  ): Promise<{
    id: string;
    name: string;
    type: Phase["type"];
    description: string | null | undefined;
    startDate: string | null | undefined;
    endDate: string | null | undefined;
  } | null> => {
    try {
      const api = await getApiClient(explicitToken);
      const response = await api.get<Phase>(API_ENDPOINTS.PHASES.GET(id));

      return {
        id: response.data.id,
        name: response.data.name,
        type: response.data.type,
        description: response.data.description,
        startDate: response.data.startDate,
        endDate: response.data.endDate,
      };
    } catch (error) {
      console.error(`Failed to fetch phase header for ${id}:`, error);
      return null;
    }
  }
);

/**
 * Fetches all tasks belonging to a phase
 * Used for progress calculations and task management
 */
export const getPhaseTasksList = cache(
  async (id: string, explicitToken?: string): Promise<Task[]> => {
    try {
      const api = await getApiClient(explicitToken);
      const response = await api.get<PhaseDetail>(API_ENDPOINTS.PHASES.GET(id));
      return response.data.tasks || [];
    } catch (error) {
      console.error(`Failed to fetch tasks for phase ${id}:`, error);
      return [];
    }
  }
);

/**
 * Fetches all deliverables belonging to a phase
 * Complete deliverable data including status and stage
 */
export const getPhaseDeliverablesList = cache(
  async (id: string, explicitToken?: string): Promise<Deliverable[]> => {
    try {
      const api = await getApiClient(explicitToken);
      const response = await api.get<PhaseDetail>(API_ENDPOINTS.PHASES.GET(id));
      return response.data.deliverables || [];
    } catch (error) {
      console.error(`Failed to fetch deliverables for phase ${id}:`, error);
      return [];
    }
  }
);

/**
 * Fetches all meeting logs for a phase
 * Used for accessing meeting minutes and documentation
 */
export const getPhaseMeetingsList = cache(
  async (id: string, explicitToken?: string): Promise<MeetingLog[]> => {
    try {
      const api = await getApiClient(explicitToken);
      const response = await api.get<{
        id: string;
        meetingLogs?: MeetingLog[];
      }>(API_ENDPOINTS.MEETING_LOGS.BY_PHASE(id));

      return response.data.meetingLogs || [];
    } catch (error) {
      console.error(`Failed to fetch meetings for phase ${id}:`, error);
      return [];
    }
  }
);

/**
 * Fetches analytics/counts for a phase
 * Returns totals for tasks, deliverables, meetings, and their statuses
 *
 * Accepts optional token to avoid using cookies() inside cached parents.
 */
export const getPhaseAnalytics = cache(
  async (
    id: string,
    explicitToken?: string
  ): Promise<{
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    blockedTasks: number;
    totalDeliverables: number;
    completedDeliverables: number;
    inProgressDeliverables: number;
    underReviewDeliverables: number;
    totalMeetings: number;
    taskCompletion: number; // percentage
    deliverableCompletion: number; // percentage
  } | null> => {
    try {
      const api = await getApiClient(explicitToken);

      // Fetch all data in parallel
      const [phaseData, meetingsData] = await Promise.all([
        api.get<PhaseDetail>(API_ENDPOINTS.PHASES.GET(id)),
        api.get<{ meetingLogs?: MeetingLog[] }>(
          API_ENDPOINTS.MEETING_LOGS.BY_PHASE(id)
        ),
      ]);

      const tasks = phaseData.data.tasks || [];
      const deliverables = phaseData.data.deliverables || [];
      const meetings = meetingsData.data.meetingLogs || [];

      // Calculate task counts
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter((t) => t.status === "DONE").length;
      const inProgressTasks = tasks.filter(
        (t) => t.status === "IN_PROGRESS"
      ).length;
      const blockedTasks = tasks.filter((t) => t.status === "BLOCKED").length;
      const taskCompletion =
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      // Calculate deliverable counts
      const totalDeliverables = deliverables.length;
      const completedDeliverables = deliverables.filter(
        (d) => d.status === "COMPLETED"
      ).length;
      const inProgressDeliverables = deliverables.filter(
        (d) => d.status === "IN_PROGRESS"
      ).length;
      const underReviewDeliverables = deliverables.filter(
        (d) => d.status === "REVIEW"
      ).length;
      const deliverableCompletion =
        totalDeliverables > 0
          ? Math.round((completedDeliverables / totalDeliverables) * 100)
          : 0;

      return {
        totalTasks,
        completedTasks,
        inProgressTasks,
        blockedTasks,
        totalDeliverables,
        completedDeliverables,
        inProgressDeliverables,
        underReviewDeliverables,
        totalMeetings: meetings.length,
        taskCompletion,
        deliverableCompletion,
      };
    } catch (error) {
      console.error(`Failed to fetch analytics for phase ${id}:`, error);
      return null;
    }
  }
);
