import apiClient, { handleApiError } from '../api/api';
import type { AxiosResponse } from 'axios';

export interface DrugFromAPI {
  id: number;
  nazwa_produktu_leczniczego: string | null;
  nazwa_powszechnie_stosowana: string | null;
  droga_podania_gatunek_tkanka_okres_karencji: string | null;
  moc: string | null;
  substancja_czynna: string | null;
  numer_pozwolenia: string | null;
  podmiot_odpowiedzialny: string | null;
  nazwa_wytw_rcy: string | null;
  cena: string | null;
  ilosc: number;
  created_at: string;
  updated_at: string;
}

class DrugService {
  async getAllDrugs(): Promise<DrugFromAPI[]> {
    try {
      const response: AxiosResponse<DrugFromAPI[]> = await apiClient.get('/pharmac/drugs/');
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  }

  async getDrugById(id: number): Promise<DrugFromAPI> {
    try {
      const response: AxiosResponse<DrugFromAPI> = await apiClient.get(`/pharmac/drugs/${id}/`);
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  }

  async getAlternativesBySubstance(substanceName: string): Promise<DrugFromAPI[]> {
    try {
      const response: AxiosResponse<DrugFromAPI[]> = await apiClient.post(`/pharmac/search/substance/`, {
        substance: substanceName
      });
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  }

  // Helper function to safely get drug name
  getDrugDisplayName(drug: DrugFromAPI): string {
    return drug.nazwa_powszechnie_stosowana || 
           drug.nazwa_produktu_leczniczego || 
           'Brak nazwy';
  }

  // Helper function to check if stock is low
  isLowStock(quantity: number): boolean {
    return quantity < 5;
  }

  // Helper function to safely get price
  getFormattedPrice(price: string | null): string {
    if (!price || price === '-1' || price === 'null') {
      return 'Brak ceny';
    }
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) {
      return 'Brak ceny';
    }
    // Round down to integer and add .99
    const roundedPrice = Math.floor(numPrice) + 0.99;
    return `${roundedPrice.toFixed(2)} PLN`;
  }
}

export const drugService = new DrugService();

