import apiClient, { handleApiError } from '../api/api';
import type { AxiosResponse } from 'axios';

export interface NewsFromAPI {
  id: number;
  title: string;
  description: string;
  url: string;
  source: string;
  published_at: string;
  image_url: string;
  title_pl: string;
  description_pl: string;
  is_translated: boolean;
  created_at: string;
}

class NewsService {
  async getAllNews(): Promise<NewsFromAPI[]> {
    try {
      const response: AxiosResponse<NewsFromAPI[]> = await apiClient.get('/news/medical/');
      console.log('Raw API response:', response.data);
      
      // Handle different response formats
      let data = response.data;
      
      // If response is wrapped in a results property (common with pagination)
      if (data && typeof data === 'object' && 'results' in data && Array.isArray(data.results)) {
        data = data.results;
      }
      
      // If response is a single object, wrap it in an array
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        data = [data];
      }
      
      // Ensure we always return an array
      return Array.isArray(data) ? data : [];
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  }

  async getNewsById(id: number): Promise<NewsFromAPI> {
    try {
      const response: AxiosResponse<NewsFromAPI> = await apiClient.get(`/news/medical/${id}/`);
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  }

  // Helper function to get display title (prefer Polish if available)
  getDisplayTitle(news: NewsFromAPI): string {
    return news.title_pl || news.title;
  }

  // Helper function to get display description (prefer Polish if available)
  getDisplayDescription(news: NewsFromAPI): string {
    return news.description_pl || news.description;
  }

  // Helper function to format date
  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pl-PL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return 'Brak daty';
    }
  }

  // Helper function to determine category based on source or content
  getCategory(news: NewsFromAPI): "Badania" | "Przepisy" | "Rynek" | "Technologia" {
    const title = this.getDisplayTitle(news).toLowerCase();
    const description = this.getDisplayDescription(news).toLowerCase();
    // const source = news.source.toLowerCase(); // Unused for now
    
    // Check for research-related keywords
    if (title.includes('badania') || title.includes('badanie') || 
        title.includes('kliniczne') || title.includes('eksperyment') ||
        description.includes('badania') || description.includes('kliniczne')) {
      return "Badania";
    }
    
    // Check for regulation-related keywords
    if (title.includes('przepisy') || title.includes('regulacje') || 
        title.includes('ustawa') || title.includes('rozporządzenie') ||
        title.includes('gif') || title.includes('nfz') || title.includes('ue') ||
        description.includes('przepisy') || description.includes('regulacje')) {
      return "Przepisy";
    }
    
    // Check for market-related keywords
    if (title.includes('rynek') || title.includes('cena') || title.includes('cen') ||
        title.includes('dystrybucja') || title.includes('sprzedaż') ||
        description.includes('rynek') || description.includes('cena')) {
      return "Rynek";
    }
    
    // Check for technology-related keywords
    if (title.includes('technologia') || title.includes('ai') || title.includes('sztuczna') ||
        title.includes('cyfrowa') || title.includes('aplikacja') ||
        description.includes('technologia') || description.includes('cyfrowa')) {
      return "Technologia";
    }
    
    // Default to "Rynek" if no specific category found
    return "Rynek";
  }

  // Helper function to get appropriate icon and color for category
  getCategoryStyle(category: "Badania" | "Przepisy" | "Rynek" | "Technologia") {
    switch (category) {
      case "Badania":
        return {
          icon: "Microscope",
          color: "#3b82f6"
        };
      case "Przepisy":
        return {
          icon: "FileText",
          color: "#8b5cf6"
        };
      case "Rynek":
        return {
          icon: "TrendingUp",
          color: "#10b981"
        };
      case "Technologia":
        return {
          icon: "Cpu",
          color: "#06b6d4"
        };
      default:
        return {
          icon: "Newspaper",
          color: "#6b7280"
        };
    }
  }
}

export const newsService = new NewsService();
