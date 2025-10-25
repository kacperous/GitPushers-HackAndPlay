import apiClient from '../api/api'

export interface RegulationFromAPI {
  id: number
  nr_w_wykazie: string
  podstawa_wydania: string
  ai_tytul: string
  ai_description: string
  planowany_termin_wydania_data: string
  created_at: string
}

export interface RegulationDetailFromAPI extends RegulationFromAPI {
  lp: string
  tytul_rozporzadzenia: string
  przyczyny_rezygnacji: string
  planowany_termin_wydania: string
  istota_rozwiazan: string
  osoba_odpowiedzialna: string
  przyczyna_potrzeba: string
  updated_at: string
}

class RegulationService {
  /**
   * Pobiera listę wszystkich przepisów prawnych z opcjami sortowania i filtrowania
   */
  async getAllRegulations(options?: {
    sortBy?: 'date' | 'created_at'
    sortOrder?: 'asc' | 'desc'
    dateFrom?: string
    dateTo?: string
    limit?: number
  }): Promise<RegulationFromAPI[]> {
    try {
      const params = new URLSearchParams()
      
      if (options?.sortBy) {
        params.append('ordering', options.sortOrder === 'desc' ? `-${options.sortBy}` : options.sortBy)
      }
      
      if (options?.dateFrom) {
        params.append('planowany_termin_wydania_data__gte', options.dateFrom)
      }
      
      if (options?.dateTo) {
        params.append('planowany_termin_wydania_data__lte', options.dateTo)
      }
      
      if (options?.limit) {
        params.append('limit', options.limit.toString())
      }
      
      const url = `/regulations/${params.toString() ? `?${params.toString()}` : ''}`
      const response = await apiClient.get(url)
      
      // Sprawdź czy odpowiedź ma właściwość results (dla paginacji)
      if (response.data && typeof response.data === 'object') {
        if (Array.isArray(response.data.results)) {
          return response.data.results
        } else if (Array.isArray(response.data)) {
          return response.data
        } else {
          // Jeśli to pojedynczy obiekt, opakuj w tablicę
          return [response.data]
        }
      }
      
      return []
    } catch (error) {
      console.error('Błąd pobierania przepisów prawnych:', error)
      throw error
    }
  }

  /**
   * Pobiera szczegóły konkretnego przepisu prawnego
   */
  async getRegulationById(id: number): Promise<RegulationDetailFromAPI> {
    try {
      const response = await apiClient.get(`/regulations/${id}/`)
      return response.data
    } catch (error) {
      console.error(`Błąd pobierania przepisu prawnego ${id}:`, error)
      throw error
    }
  }

  /**
   * Określa kategorię przepisu na podstawie podstawy prawnej
   */
  getCategory(podstawa_wydania: string): "UE" | "Krajowe" | "GIF" | "NFZ" {
    const podstawa = podstawa_wydania.toLowerCase()
    
    if (podstawa.includes('ue') || podstawa.includes('unii europejskiej') || podstawa.includes('europejskiej')) {
      return "UE"
    } else if (podstawa.includes('gif') || podstawa.includes('główny inspektorat')) {
      return "GIF"
    } else if (podstawa.includes('nfz') || podstawa.includes('narodowy fundusz')) {
      return "NFZ"
    } else {
      return "Krajowe"
    }
  }

  /**
   * Określa poziom ważności na podstawie podstawy prawnej
   */
  getImportance(podstawa_wydania: string): "critical" | "high" | "medium" {
    const podstawa = podstawa_wydania.toLowerCase()
    
    if (podstawa.includes('ustawa') || podstawa.includes('rozporządzenie') || podstawa.includes('dyrektywa')) {
      return "critical"
    } else if (podstawa.includes('zarządzenie') || podstawa.includes('komunikat')) {
      return "high"
    } else {
      return "medium"
    }
  }

  /**
   * Formatuje datę do wyświetlenia
   */
  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('pl-PL', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    } catch (error) {
      return dateString
    }
  }

  /**
   * Formatuje datę planowanego terminu
   */
  formatPlannedDate(dateString: string): string {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('pl-PL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch (error) {
      return dateString
    }
  }

  /**
   * Zwraca tytuł do wyświetlenia (AI lub oryginalny)
   */
  getDisplayTitle(regulation: RegulationFromAPI): string {
    return regulation.ai_tytul || regulation.nr_w_wykazie
  }

  /**
   * Zwraca opis do wyświetlenia (AI lub podstawę prawną)
   */
  getDisplayDescription(regulation: RegulationFromAPI): string {
    return regulation.ai_description || regulation.podstawa_wydania
  }

  /**
   * Formatuje datę do formatu YYYY-MM-DD dla API
   */
  formatDateForAPI(date: Date): string {
    return date.toISOString().split('T')[0]
  }

  /**
   * Pobiera datę sprzed X dni
   */
  getDateDaysAgo(days: number): string {
    const date = new Date()
    date.setDate(date.getDate() - days)
    return this.formatDateForAPI(date)
  }

  /**
   * Pobiera datę za X dni
   */
  getDateDaysFromNow(days: number): string {
    const date = new Date()
    date.setDate(date.getDate() + days)
    return this.formatDateForAPI(date)
  }
}

export const regulationService = new RegulationService()
