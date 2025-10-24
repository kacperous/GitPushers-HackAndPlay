"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { ArrowLeft, Pill, Package, DollarSign, FileText, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { drugService, type DrugFromAPI } from "@/services/drugService"
import PriceMap from "@/components/PriceMap"

export default function DrugDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [drug, setDrug] = useState<DrugFromAPI | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDrugDetails = async () => {
      if (!id) {
        setError("Brak ID leku")
        setIsLoading(false)
        return
      }

      try {
        const drugData = await drugService.getDrugById(parseInt(id))
        
        // Zmień cenę od razu po otrzymaniu danych z API
        if (drugData.cena) {
          const originalPrice = parseFloat(drugData.cena)
          const roundedPrice = Math.floor(originalPrice) + 0.99
          drugData.cena = roundedPrice.toString()
        }
        
        setDrug(drugData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Nie udało się pobrać danych leku")
      } finally {
        setIsLoading(false)
      }
    }

    fetchDrugDetails()
  }, [id])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Ładowanie danych leku...</p>
        </div>
      </div>
    )
  }

  if (error || !drug) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-destructive">Błąd</CardTitle>
            <CardDescription>Nie udało się załadować danych leku</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button onClick={() => navigate(-1)} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Powrót
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isLowStock = drugService.isLowStock(drug.ilosc)
  const displayName = drugService.getDrugDisplayName(drug)
  const formattedPrice = drugService.getFormattedPrice(drug.cena)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/Pharma.svg" alt="DrugTracer Logo" className="h-25 w-25" />
          </Link>
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Powrót
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Main Info Card */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <Pill className="h-6 w-6 text-primary" />
                    <CardTitle className="text-3xl">{displayName}</CardTitle>
                  </div>
                  {drug.substancja_czynna && (
                    <CardDescription className="text-lg">
                      Substancja czynna: {drug.substancja_czynna}
                    </CardDescription>
                  )}
                </div>
                {isLowStock && (
                  <Badge variant="destructive" className="gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Niski stan
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLowStock && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Uwaga! Kończy się zapas magazynowy. Pozostało tylko {drug.ilosc} {drug.ilosc === 1 ? 'sztuka' : 'sztuk'}.
                  </AlertDescription>
                </Alert>
              )}

              {/* Sprawdź ile jest kafelków */}
              {(() => {
                const tileCount = [
                  drug.droga_podania_gatunek_tkanka_okres_karencji,
                  drug.numer_pozwolenia,
                  drug.cena,
                  drug.ilosc
                ].filter(Boolean).length;

                if (tileCount === 3) {
                  // Jeśli dokładnie 3 kafelki - mapa na dole, kafelki na górze w jednej linii
                  return (
                    <>
                      {/* Kafelki w jednej linii */}
                      <div className="mb-6">
                        <div className="grid gap-4 grid-cols-3">
                          {drug.droga_podania_gatunek_tkanka_okres_karencji && (
                            <div className="flex items-start gap-3 p-4 border rounded-lg">
                              <FileText className="h-5 w-5 text-primary mt-0.5" />
                              <div>
                                <p className="text-sm text-muted-foreground">Droga podania</p>
                                <p className="font-medium">{drug.droga_podania_gatunek_tkanka_okres_karencji}</p>
                              </div>
                            </div>
                          )}

                          {drug.numer_pozwolenia && (
                            <div className="flex items-start gap-3 p-4 border rounded-lg">
                              <FileText className="h-5 w-5 text-primary mt-0.5" />
                              <div>
                                <p className="text-sm text-muted-foreground">Numer pozwolenia</p>
                                <p className="font-medium">{drug.numer_pozwolenia}</p>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center gap-3 p-4 border rounded-lg">
                            <DollarSign className="h-5 w-5 text-primary" />
                            <div>
                              <p className="text-sm text-muted-foreground">Cena</p>
                              <p className="text-xl font-semibold">{formattedPrice}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 p-4 border rounded-lg">
                            <Package className="h-5 w-5 text-primary" />
                            <div>
                              <p className="text-sm text-muted-foreground">Stan magazynowy</p>
                              <p className="text-xl font-semibold">
                                {drug.ilosc} {drug.ilosc === 1 ? 'sztuka' : 'sztuk'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Mapa na dole */}
                      <div>
                        <div className="p-4 border rounded-lg">
                          <div className="w-full">
                            <PriceMap productPrice={parseFloat(drug.cena || '0')} />
                          </div>
                        </div>
                      </div>
                    </>
                  );
                } else if (tileCount > 3) {
                  // Jeśli więcej niż 3 kafelki - mapa na dole, kafelki na górze w jednej linii
                  return (
                    <>
                      {/* Kafelki w jednej linii */}
                      <div className="mb-6">
                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                          {drug.droga_podania_gatunek_tkanka_okres_karencji && (
                            <div className="flex items-start gap-3 p-4 border rounded-lg">
                              <FileText className="h-5 w-5 text-primary mt-0.5" />
                              <div>
                                <p className="text-sm text-muted-foreground">Droga podania</p>
                                <p className="font-medium">{drug.droga_podania_gatunek_tkanka_okres_karencji}</p>
                              </div>
                            </div>
                          )}

                          {drug.numer_pozwolenia && (
                            <div className="flex items-start gap-3 p-4 border rounded-lg">
                              <FileText className="h-5 w-5 text-primary mt-0.5" />
                              <div>
                                <p className="text-sm text-muted-foreground">Numer pozwolenia</p>
                                <p className="font-medium">{drug.numer_pozwolenia}</p>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center gap-3 p-4 border rounded-lg">
                            <DollarSign className="h-5 w-5 text-primary" />
                            <div>
                              <p className="text-sm text-muted-foreground">Cena</p>
                              <p className="text-xl font-semibold">{formattedPrice}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 p-4 border rounded-lg">
                            <Package className="h-5 w-5 text-primary" />
                            <div>
                              <p className="text-sm text-muted-foreground">Stan magazynowy</p>
                              <p className="text-xl font-semibold">
                                {drug.ilosc} {drug.ilosc === 1 ? 'sztuka' : 'sztuk'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Mapa na dole */}
                      <div>
                        <div className="p-4 border rounded-lg">
                          <div className="w-full">
                            <PriceMap productPrice={parseFloat(drug.cena || '0')} />
                          </div>
                        </div>
                      </div>
                    </>
                  );
                } else {
                  // Jeśli 3 lub mniej kafelków - mapa na górze, kafelki na dole
                  return (
                    <>
                      {/* Price Map */}
                      <div className="mb-6">
                        <div className="p-4 border rounded-lg">
                          <h3 className="text-lg font-semibold mb-3">Mapa cen w okolicy</h3>
                          <div className="w-full">
                            <PriceMap productPrice={parseFloat(drug.cena || '0')} />
                          </div>
                        </div>
                      </div>

                      {/* 3 kafelki bez mapy */}
                      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                        {/* Additional Info */}
                        <div className="space-y-4">
                          {drug.droga_podania_gatunek_tkanka_okres_karencji && (
                            <div className="flex items-start gap-3 p-4 border rounded-lg">
                              <FileText className="h-5 w-5 text-primary mt-0.5" />
                              <div>
                                <p className="text-sm text-muted-foreground">Droga podania</p>
                                <p className="font-medium">{drug.droga_podania_gatunek_tkanka_okres_karencji}</p>
                              </div>
                            </div>
                          )}

                          {drug.numer_pozwolenia && (
                            <div className="flex items-start gap-3 p-4 border rounded-lg">
                              <FileText className="h-5 w-5 text-primary mt-0.5" />
                              <div>
                                <p className="text-sm text-muted-foreground">Numer pozwolenia</p>
                                <p className="font-medium">{drug.numer_pozwolenia}</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Price */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 p-4 border rounded-lg">
                            <DollarSign className="h-5 w-5 text-primary" />
                            <div>
                              <p className="text-sm text-muted-foreground">Cena</p>
                              <p className="text-xl font-semibold">{formattedPrice}</p>
                            </div>
                          </div>
                        </div>

                        {/* Stock */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 p-4 border rounded-lg">
                            <Package className="h-5 w-5 text-primary" />
                            <div>
                              <p className="text-sm text-muted-foreground">Stan magazynowy</p>
                              <p className="text-xl font-semibold">
                                {drug.ilosc} {drug.ilosc === 1 ? 'sztuka' : 'sztuk'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  );
                }
              })()}
            </CardContent>
          </Card>

          {/* Detailed Information */}
          <Card>
            <CardHeader>
              <CardTitle>Szczegółowe informacje</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {drug.nazwa_produktu_leczniczego && (
                <div className="grid grid-cols-[200px_1fr] gap-4 py-3 border-b">
                  <span className="font-medium text-muted-foreground">Nazwa produktu leczniczego:</span>
                  <span>{drug.nazwa_produktu_leczniczego}</span>
                </div>
              )}

              {drug.moc && (
                <div className="grid grid-cols-[200px_1fr] gap-4 py-3 border-b">
                  <span className="font-medium text-muted-foreground">Moc:</span>
                  <span>{drug.moc}</span>
                </div>
              )}

              {drug.podmiot_odpowiedzialny && (
                <div className="grid grid-cols-[200px_1fr] gap-4 py-3 border-b">
                  <span className="font-medium text-muted-foreground">Podmiot odpowiedzialny:</span>
                  <span>{drug.podmiot_odpowiedzialny}</span>
                </div>
              )}

              {drug.nazwa_wytw_rcy && (
                <div className="grid grid-cols-[200px_1fr] gap-4 py-3 border-b">
                  <span className="font-medium text-muted-foreground">Wytwórca:</span>
                  <span>{drug.nazwa_wytw_rcy}</span>
                </div>
              )}

              <div className="grid grid-cols-[200px_1fr] gap-4 py-3 border-b">
                <span className="font-medium text-muted-foreground">Data utworzenia:</span>
                <span>{new Date(drug.created_at).toLocaleDateString('pl-PL')}</span>
              </div>

              <div className="grid grid-cols-[200px_1fr] gap-4 py-3">
                <span className="font-medium text-muted-foreground">Ostatnia aktualizacja:</span>
                <span>{new Date(drug.updated_at).toLocaleDateString('pl-PL')}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

