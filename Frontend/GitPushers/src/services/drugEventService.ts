import apiClient, { handleApiError } from '../api/api';
import type { AxiosResponse } from 'axios';

export interface DrugEvent {
  id: number;
  event_type: 'WITHDRAWAL' | 'SUSPENSION' | 'REGISTRATION';
  source: 'GIF' | 'URPL';
  publication_date: string;
  decision_number: string | null;
  drug_name: string;
  drug_strength: string | null;
  drug_form: string | null;
  marketing_authorisation_holder: string;
  batch_number: string | null;
  expiry_date: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

class DrugEventService {
  async getAllEvents(): Promise<DrugEvent[]> {
    try {
      const response: AxiosResponse<DrugEvent[]> = await apiClient.get('/scraper/drugs');
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  }

  async getRecentEvents(limit?: number): Promise<DrugEvent[]> {
    try {
      const response: AxiosResponse<DrugEvent[]> = await apiClient.get('/scraper/drugs?recent_only=true');
      if (limit) {
        return response.data.slice(0, limit);
      }
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  }

  async getEventsByType(eventType: 'WITHDRAWAL' | 'SUSPENSION' | 'REGISTRATION'): Promise<DrugEvent[]> {
    try {
      const response: AxiosResponse<DrugEvent[]> = await apiClient.get(`/scraper/drugs?event_type=${eventType}`);
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  }

  async getEventsBySource(source: 'GIF' | 'URPL'): Promise<DrugEvent[]> {
    try {
      const response: AxiosResponse<DrugEvent[]> = await apiClient.get(`/scraper/drugs?source=${source}`);
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  }

  async getEventById(id: number): Promise<DrugEvent> {
    try {
      const response: AxiosResponse<DrugEvent> = await apiClient.get(`/scraper/drugs/${id}`);
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  }

  // Helper function to format event type to Polish
  getEventTypeLabel(eventType: 'WITHDRAWAL' | 'SUSPENSION' | 'REGISTRATION'): string {
    const labels = {
      'WITHDRAWAL': 'WYCOFANIE',
      'SUSPENSION': 'ZAWIESZENIE',
      'REGISTRATION': 'NOWY LEK'
    };
    return labels[eventType];
  }

  // Helper function to get priority based on event type
  getEventPriority(eventType: 'WITHDRAWAL' | 'SUSPENSION' | 'REGISTRATION'): 'high' | 'medium' | 'low' {
    if (eventType === 'WITHDRAWAL') return 'high';
    if (eventType === 'SUSPENSION') return 'high';
    return 'medium';
  }

  // Helper function to format date
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
}

export const drugEventService = new DrugEventService();

