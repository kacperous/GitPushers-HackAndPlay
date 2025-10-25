"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { authService, type UserData } from "@/services/authService"
import { drugService, type DrugFromAPI } from "@/services/drugService"
import { drugEventService, type DrugEvent } from "@/services/drugEventService"
import { newsService, type NewsFromAPI } from "@/services/newsService"
import {
  Search,
  Pill,
  Newspaper,
  LogIn,
  LogOut,
  User,
  Menu,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Package,
  DollarSign,
  Calendar,
  Microscope,
  FileText,
  TrendingUp,
  Cpu,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"

// ============= TYPY =============
interface Alternative {
  name: string
  composition: string
  price: string
  manufacturer: string
  availability: "Dostępny" | "Ograniczona dostępność" | "Niedostępny"
}

interface Drug {
  id: number
  name: string
  composition: string
  price: string
  manufacturer: string
  category: string
  prescription: boolean
  alternatives: Alternative[]
}

interface NewsItem {
  id: number
  title: string
  description: string
  category: "Badania" | "Przepisy" | "Rynek" | "Technologia"
  date: string
  icon: React.ReactNode
  color: string
  url: string
  source: string
  image_url: string
  is_translated: boolean
}

interface LegalChange {
  id: number
  title: string
  description: string
  effectiveDate: string
  category: "UE" | "Krajowe" | "GIF" | "NFZ"
  importance: "critical" | "high" | "medium"
  source: string
}


// drugUpdates will be loaded from API

const legalChanges: LegalChange[] = [
  {
    id: 1,
    title: "Nowe przepisy UE o antybiotykach",
    description: "Zaostrzenie wymogów przepisywania antybiotyków w całej UE",
    effectiveDate: "01.11.2025",
    category: "UE",
    importance: "critical",
    source: "Rozporządzenie UE 2025/1847",
  },
  {
    id: 2,
    title: "Zmiana listy refundacyjnej NFZ",
    description: "Aktualizacja listy leków refundowanych - 47 nowych pozycji",
    effectiveDate: "01.12.2025",
    category: "NFZ",
    importance: "high",
    source: "Obwieszczenie MZ",
  },
  {
    id: 3,
    title: "Nowe wymogi dla aptek internetowych",
    description: "Obowiązek weryfikacji tożsamości przy zakupie leków Rx online",
    effectiveDate: "15.11.2025",
    category: "GIF",
    importance: "critical",
    source: "Komunikat GIF 2025/10",
  },
  {
    id: 4,
    title: "Ustawa o zawodzie farmaceuty - nowelizacja",
    description: "Rozszerzenie kompetencji farmaceutów o szczepienia",
    effectiveDate: "01.01.2026",
    category: "Krajowe",
    importance: "high",
    source: "Ustawa z dn. 15.09.2025",
  },
  {
    id: 5,
    title: "Nowe standardy przechowywania leków termolabilnych",
    description: "Zaostrzenie wymogów dotyczących łańcucha chłodniczego",
    effectiveDate: "20.11.2025",
    category: "GIF",
    importance: "medium",
    source: "Wytyczne GIF 2025/08",
  },
  {
    id: 6,
    title: "Zmiany w systemie e-recepty",
    description: "Wprowadzenie obowiązkowej e-recepty dla wszystkich leków Rx",
    effectiveDate: "01.03.2026",
    category: "NFZ",
    importance: "high",
    source: "Rozporządzenie MZ",
  },
]

// ============= KOMPONENT GŁÓWNY =============
export default function MainPage() {
  const navigate = useNavigate()
  const [activeView, setActiveView] = useState<"drugs" | "news">("drugs")
  const [drugSearch, setDrugSearch] = useState("")
  const [newsFilter, setNewsFilter] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null)
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null)
  const [currentUser, setCurrentUser] = useState<UserData | null>(null)
  const [isLoadingUser, setIsLoadingUser] = useState(true)
  
  // State for API drugs
  const [apiDrugs, setApiDrugs] = useState<DrugFromAPI[]>([])
  const [isLoadingDrugs, setIsLoadingDrugs] = useState(true)
  const [drugsError, setDrugsError] = useState<string | null>(null)
  
  const [drugUpdates, setDrugUpdates] = useState<DrugEvent[]>([])
  const [isLoadingDrugUpdates, setIsLoadingDrugUpdates] = useState(true)
  
  // State for expanded drug updates
  const [expandedUpdates, setExpandedUpdates] = useState<Set<number>>(new Set())
  
  // State for loading alternatives (unused for now)
  // const [loadingAlternatives, setLoadingAlternatives] = useState<number | null>(null)
  // State for API news
  const [apiNews, setApiNews] = useState<NewsFromAPI[]>([])
  const [isLoadingNews, setIsLoadingNews] = useState(true)
  const [newsError, setNewsError] = useState<string | null>(null)

  // State for alternatives modal
  const [showAlternativesModal, setShowAlternativesModal] = useState(false)
  const [selectedDrugName, setSelectedDrugName] = useState<string>("")

  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 20

  // Mock alternatives data
  const mockAlternatives = [
    {
      id: 1,
      nazwa: "Apap Extra",
      moc: "500 mg",
      droga_podania: "doustna",
      producent: "US Pharmacia",
      cena: "12.50 PLN",
      stan: 145,
      isLowStock: false
    },
    {
      id: 2,
      nazwa: "Paracetamol",
      moc: "500 mg",
      droga_podania: "doustna",
      producent: "Polpharma",
      cena: "8.90 PLN",
      stan: 234,
      isLowStock: false
    },
    {
      id: 3,
      nazwa: "Panadol",
      moc: "500 mg",
      droga_podania: "doustna",
      producent: "GSK",
      cena: "15.20 PLN",
      stan: 3,
      isLowStock: true
    },
    {
      id: 4,
      nazwa: "Efferalgan",
      moc: "500 mg",
      droga_podania: "doustna",
      producent: "Bristol-Myers Squibb",
      cena: "18.70 PLN",
      stan: 89,
      isLowStock: false
    },
    {
      id: 5,
      nazwa: "Paracetamol Forte",
      moc: "1000 mg",
      droga_podania: "doustna",
      producent: "Sandoz",
      cena: "16.40 PLN",
      stan: 2,
      isLowStock: true
    }
  ]

  // Pobierz dane użytkownika przy załadowaniu
  useEffect(() => {
    const fetchUser = async () => {
      if (authService.isAuthenticated()) {
        try {
          const userData = await authService.getCurrentUser()
          setCurrentUser(userData)
        } catch (error) {
          console.error("Błąd pobierania danych użytkownika:", error)
          // Jeśli błąd, wyloguj użytkownika (token może być nieprawidłowy)
          authService.logout()
        }
      }
      setIsLoadingUser(false)
    }

    fetchUser()
  }, [])

  // Pobierz leki z API
  useEffect(() => {
    const fetchDrugs = async () => {
      try {
        const drugs = await drugService.getAllDrugs()
        
        // Zmień ceny od razu po otrzymaniu danych z API
        const processedDrugs = drugs.map(drug => {
          if (drug.cena) {
            const originalPrice = parseFloat(drug.cena)
            const roundedPrice = Math.floor(originalPrice) + 0.99
            drug.cena = roundedPrice.toString()
          }
          return drug
        })
        
        setApiDrugs(processedDrugs)
        setDrugsError(null)
      } catch (error) {
        console.error("Błąd pobierania leków:", error)
        setDrugsError(error instanceof Error ? error.message : "Nie udało się pobrać listy leków")
      } finally {
        setIsLoadingDrugs(false)
      }
    }

    fetchDrugs()
  }, [])

  // Pobierz aktualizacje leków z API
  useEffect(() => {
    const fetchDrugUpdates = async () => {
      if (!authService.isAuthenticated()) {
        setIsLoadingDrugUpdates(false)
        return
      }

      try {
        const events = await drugEventService.getRecentEvents(10)
        setDrugUpdates(events)
      } catch (error) {
        console.error("Błąd pobierania aktualizacji leków:", error)
        // Nie ustawiamy błędu - po prostu zostawiamy pustą listę
      } finally {
        setIsLoadingDrugUpdates(false)
      }
    }

    fetchDrugUpdates()
  }, [currentUser])
  // Pobierz newsy z API
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const news = await newsService.getAllNews()
        console.log('Fetched news:', news, 'Type:', typeof news, 'Is Array:', Array.isArray(news))
        setApiNews(news)
        setNewsError(null)
      } catch (error) {
        console.error("Błąd pobierania newsów:", error)
        setNewsError(error instanceof Error ? error.message : "Nie udało się pobrać listy newsów")
      } finally {
        setIsLoadingNews(false)
      }
    }

    fetchNews()
  }, [])

  const handleLogout = () => {
    authService.logout()
    setCurrentUser(null)
    navigate('/login')
  }

  const toggleUpdateExpansion = (updateId: number) => {
    setExpandedUpdates(prev => {
      const newSet = new Set(prev)
      if (newSet.has(updateId)) {
        newSet.delete(updateId)
      } else {
        newSet.add(updateId)
      }
      return newSet
    })
  }

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  // Function to determine product color based on index
  const getProductColor = (index: number): 'red' | 'green' | 'neutral' => {
    if (index % 3 === 0) {
      return index % 6 === 0 ? 'red' : 'green'
    }
    return 'neutral'
  }

  // Filter API drugs
  const filteredApiDrugs = apiDrugs.filter((drug) => {
    const searchLower = drugSearch.toLowerCase()
    const drugName = drugService.getDrugDisplayName(drug).toLowerCase()
    const substancja = (drug.substancja_czynna || '').toLowerCase()
    const droga = (drug.droga_podania_gatunek_tkanka_okres_karencji || '').toLowerCase()
    const numer = (drug.numer_pozwolenia || '').toLowerCase()
    
    return drugName.includes(searchLower) ||
           substancja.includes(searchLower) ||
           droga.includes(searchLower) ||
           numer.includes(searchLower)
  })

  // Pagination calculations
  const totalPages = Math.ceil(filteredApiDrugs.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedDrugs = filteredApiDrugs.slice(startIndex, endIndex)

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [drugSearch])

  // Convert API news to display format
  console.log('apiNews before map:', apiNews, 'Type:', typeof apiNews, 'Is Array:', Array.isArray(apiNews))
  
  let displayNews: NewsItem[] = []
  try {
    if (Array.isArray(apiNews)) {
      displayNews = apiNews.map((news) => {
        const category = newsService.getCategory(news)
        const categoryStyle = newsService.getCategoryStyle(category)
        
        return {
          id: news.id,
          title: newsService.getDisplayTitle(news),
          description: newsService.getDisplayDescription(news),
          category,
          date: newsService.formatDate(news.published_at),
          icon: categoryStyle.icon === "Microscope" ? <Microscope className="h-5 w-5" /> :
                categoryStyle.icon === "FileText" ? <FileText className="h-5 w-5" /> :
                categoryStyle.icon === "TrendingUp" ? <TrendingUp className="h-5 w-5" /> :
                categoryStyle.icon === "Cpu" ? <Cpu className="h-5 w-5" /> :
                <Newspaper className="h-5 w-5" />,
          color: categoryStyle.color,
          url: news.url,
          source: news.source,
          image_url: news.image_url,
          is_translated: news.is_translated
        }
      })
    }
  } catch (error) {
    console.error('Error mapping news:', error)
    displayNews = []
  }

  const filteredNews = displayNews.filter((news) => {
    const matchesSearch =
      news.title.toLowerCase().includes(newsFilter.toLowerCase()) ||
      news.description.toLowerCase().includes(newsFilter.toLowerCase())
    const matchesCategory = categoryFilter === "all" || news.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const highPriorityUpdates = drugUpdates.filter((u) => drugEventService.getEventPriority(u.event_type) === "high").length
  const criticalLegalChanges = legalChanges.filter((c) => c.importance === "critical").length

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <img 
                src="/Pharma.svg" 
                alt="DrugTracer Logo" 
                className="h-25 w-25"
              />
            </div>

            <div className="hidden md:flex items-center gap-2">
              <Button
                variant={activeView === "drugs" ? "default" : "outline"}
                onClick={() => setActiveView("drugs")}
                className="gap-2"
              >
                <Pill className="h-4 w-4" />
                Leki
              </Button>
              <Button
                variant={activeView === "news" ? "default" : "outline"}
                onClick={() => setActiveView("news")}
                className="gap-2"
              >
                <Newspaper className="h-4 w-4" />
                Newsy i Przepisy
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setActiveView("drugs")}>
                  <Pill className="mr-2 h-4 w-4" />
                  Leki
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveView("news")}>
                  <Newspaper className="mr-2 h-4 w-4" />
                  Newsy i Przepisy
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {!isLoadingUser && (
              currentUser ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <User className="h-4 w-4" />
                      <span className="hidden sm:inline">
                        Witaj, {currentUser.first_name} {currentUser.last_name}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="mr-2 h-4 w-4" />
                      Profil
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Wyloguj się
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link to="/login">
                  <Button variant="outline" className="gap-2">
                    <LogIn className="h-4 w-4" />
                    <span className="hidden sm:inline">Zaloguj się</span>
                  </Button>
                </Link>
              )
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
          <div className="space-y-6">
            {activeView === "drugs" ? (
              <>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold tracking-tight">Lista leków</h2>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">{filteredApiDrugs.length} leków</Badge>
                      {totalPages > 1 && (
                        <Badge variant="outline">
                          Strona {currentPage} z {totalPages}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Szukaj leku po nazwie, substancji czynnej, drodze podania..."
                      value={drugSearch}
                      onChange={(e) => setDrugSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {isLoadingDrugs ? (
                  <Card className="p-12 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Ładowanie leków...</p>
                  </Card>
                ) : drugsError ? (
                  <Card className="p-12 text-center">
                    <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
                    <h3 className="text-lg font-semibold text-destructive">Błąd</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{drugsError}</p>
                  </Card>
                ) : (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {paginatedDrugs.map((drug, index) => {
                        const isLowStock = drugService.isLowStock(drug.ilosc)
                        const displayName = drugService.getDrugDisplayName(drug)
                        const formattedPrice = drugService.getFormattedPrice(drug.cena)
                        const productColor = getProductColor(index)
                        
                        // Determine card styling based on color
                        const getCardStyling = () => {
                          switch (productColor) {
                            case 'red':
                              return 'border-red-200 bg-red-50/30 hover:border-red-300 hover:bg-red-50/50'
                            case 'green':
                              return 'border-green-200 bg-green-50/30 hover:border-green-300 hover:bg-green-50/50'
                            default:
                              return 'hover:shadow-md'
                          }
                        }
                        
                        return (
                          <Card
                            key={drug.id}
                            className={`cursor-pointer transition-all ${getCardStyling()}`}
                            onClick={() => navigate(`/details/${drug.id}`)}
                          >
                            <CardHeader>
                              <div className="flex items-start justify-between">
                                <div className="space-y-1 flex-1">
                                  <CardTitle className="text-lg">{displayName}</CardTitle>
                                  {drug.substancja_czynna && (
                                    <CardDescription className="text-sm">
                                      {drug.substancja_czynna}
                                    </CardDescription>
                                  )}
                                </div>
                                {isLowStock && (
                                  <Badge variant="destructive" className="shrink-0 gap-1">
                                    <AlertTriangle className="h-3 w-3" />
                                    Niski stan
                                  </Badge>
                                )}
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                {drug.droga_podania_gatunek_tkanka_okres_karencji && (
                                  <div className="text-sm">
                                    <span className="text-muted-foreground">Droga podania: </span>
                                    <span className="font-medium">
                                      {drug.droga_podania_gatunek_tkanka_okres_karencji}
                                    </span>
                                  </div>
                                )}
                                
                                {drug.numer_pozwolenia && (
                                  <div className="text-sm">
                                    <span className="text-muted-foreground">Nr pozwolenia: </span>
                                    <span className="font-medium">{drug.numer_pozwolenia}</span>
                                  </div>
                                )}

                                <div className="flex items-center justify-between pt-2 border-t">
                                  <div className="flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                    <span className={`text-lg font-bold ${
                                      productColor === 'red' ? 'text-red-600' : 
                                      productColor === 'green' ? 'text-green-600' : 
                                      'text-primary'
                                    }`}>
                                      {formattedPrice}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Package className="h-4 w-4 text-muted-foreground" />
                                    <span className={`font-medium ${isLowStock ? 'text-destructive' : ''}`}>
                                      {drug.ilosc} szt.
                                    </span>
                                  </div>
                                </div>

                                {isLowStock && (
                                  <Alert variant="destructive" className="mt-2">
                                    <AlertDescription className="text-xs">
                                      Uwaga! Kończy się zapas magazynowy
                                    </AlertDescription>
                                  </Alert>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>

                    {filteredApiDrugs.length === 0 && !isLoadingDrugs && (
                      <Card className="p-12 text-center">
                        <Pill className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-semibold">Nie znaleziono leków</h3>
                        <p className="mt-2 text-sm text-muted-foreground">Spróbuj użyć innych słów kluczowych</p>
                      </Card>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && filteredApiDrugs.length > 0 && (
                      <div className="flex items-center justify-center gap-2 mt-6">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>

                        <div className="flex items-center gap-1">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                            // Show first page, last page, current page, and pages around current
                            const showPage = 
                              page === 1 || 
                              page === totalPages || 
                              (page >= currentPage - 1 && page <= currentPage + 1)
                            
                            // Show ellipsis
                            const showEllipsisBefore = page === currentPage - 2 && currentPage > 3
                            const showEllipsisAfter = page === currentPage + 2 && currentPage < totalPages - 2

                            if (showEllipsisBefore || showEllipsisAfter) {
                              return (
                                <span key={page} className="px-2 text-muted-foreground">
                                  ...
                                </span>
                              )
                            }

                            if (!showPage) return null

                            return (
                              <Button
                                key={page}
                                variant={currentPage === page ? "default" : "outline"}
                                size="icon"
                                onClick={() => setCurrentPage(page)}
                                className="w-10"
                              >
                                {page}
                              </Button>
                            )
                          })}
                        </div>

                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              <>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold tracking-tight">Newsy i zmiany prawne</h2>
                    <Badge variant="secondary">{filteredNews.length} artykułów</Badge>
                  </div>

                  <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Szukaj w newsach..."
                        value={newsFilter}
                        onChange={(e) => setNewsFilter(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant={categoryFilter === "all" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCategoryFilter("all")}
                      >
                        Wszystkie
                      </Button>
                      <Button
                        variant={categoryFilter === "Badania" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCategoryFilter("Badania")}
                      >
                        Badania
                      </Button>
                      <Button
                        variant={categoryFilter === "Przepisy" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCategoryFilter("Przepisy")}
                      >
                        Przepisy
                      </Button>
                      <Button
                        variant={categoryFilter === "Rynek" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCategoryFilter("Rynek")}
                      >
                        Rynek
                      </Button>
                      <Button
                        variant={categoryFilter === "Technologia" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCategoryFilter("Technologia")}
                      >
                        Technologia
                      </Button>
                    </div>
                  </div>
                </div>

                {isLoadingNews ? (
                  <Card className="p-12 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Ładowanie newsów...</p>
                  </Card>
                ) : newsError ? (
                  <Card className="p-12 text-center">
                    <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
                    <h3 className="text-lg font-semibold text-destructive">Błąd</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{newsError}</p>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {filteredNews.map((news) => (
                      <Card
                        key={news.id}
                        className="transition-all hover:shadow-lg hover:border-opacity-100 cursor-pointer"
                        style={{
                          borderColor: "hsl(var(--border))",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = news.color
                          e.currentTarget.style.boxShadow = `0 4px 12px ${news.color}20`
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = "hsl(var(--border))"
                          e.currentTarget.style.boxShadow = ""
                        }}
                        onClick={() => setSelectedNews(news)}
                      >
                        <CardContent className="p-6">
                          <div className="flex gap-4">
                            {news.image_url ? (
                              <img 
                                src={news.image_url} 
                                alt={news.title}
                                className="h-12 w-12 shrink-0 rounded-lg object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none'
                                  e.currentTarget.nextElementSibling?.classList.remove('hidden')
                                }}
                              />
                            ) : null}
                            <Avatar
                              className={`h-12 w-12 shrink-0 ${news.image_url ? 'hidden' : ''}`}
                              style={{
                                backgroundColor: `${news.color}15`,
                                color: news.color,
                              }}
                            >
                              <AvatarFallback
                                style={{
                                  backgroundColor: `${news.color}15`,
                                  color: news.color,
                                }}
                              >
                                {news.icon}
                              </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 space-y-3">
                              <div className="flex items-center gap-2">
                                <Badge
                                  style={{
                                    backgroundColor: `${news.color}15`,
                                    color: news.color,
                                    borderColor: news.color,
                                  }}
                                >
                                  {news.category}
                                </Badge>
                                <span className="text-sm text-muted-foreground">{news.date}</span>
                                {news.is_translated && (
                                  <Badge variant="outline" className="text-xs">
                                    PL
                                  </Badge>
                                )}
                                <span className="text-xs text-muted-foreground">• {news.source}</span>
                              </div>
                              <div className="space-y-2">
                                <h3 className="text-xl font-semibold leading-tight">{news.title}</h3>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {!isLoadingNews && !newsError && filteredNews.length === 0 && (
                  <Card className="p-12 text-center">
                    <Newspaper className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">Nie znaleziono newsów</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Spróbuj użyć innych filtrów lub słów kluczowych
                    </p>
                  </Card>
                )}
              </>
            )}
          </div>

          <div className="space-y-4">
            <Card className="sticky top-20">
              {activeView === "drugs" ? (
                <>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Pill className="h-5 w-5" />
                        Aktualizacje leków
                      </CardTitle>
                      {highPriorityUpdates > 0 && <Badge variant="destructive">{highPriorityUpdates} pilne</Badge>}
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="h-[calc(100vh-200px)]">
                      <div className="space-y-1">
                        {isLoadingDrugUpdates ? (
                          <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                            <p className="text-xs text-muted-foreground">Ładowanie...</p>
                          </div>
                        ) : drugUpdates.length === 0 ? (
                          <div className="p-8 text-center">
                            <p className="text-sm text-muted-foreground">Brak ostatnich aktualizacji</p>
                          </div>
                        ) : (
                          drugUpdates.map((update) => {
                            const priority = drugEventService.getEventPriority(update.event_type)
                            const eventLabel = drugEventService.getEventTypeLabel(update.event_type)
                            const formattedDate = drugEventService.formatDate(update.publication_date)
                            const isExpanded = expandedUpdates.has(update.id)
                            const description = update.description || `${update.source} - ${update.marketing_authorisation_holder}`
                            const shouldTruncate = description.length > 100
                            const isWithdrawn = update.event_type === 'WITHDRAWAL'
                            
                            return (
                              <div
                                key={update.id}
                                className={`border-b p-4 last:border-0 ${priority === "high" ? "bg-destructive/5" : ""} ${shouldTruncate ? "cursor-pointer hover:bg-muted/50 transition-colors" : ""}`}
                                onClick={() => shouldTruncate && toggleUpdateExpansion(update.id)}
                              >
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between gap-2">
                                    <Badge
                                      variant={
                                        update.event_type === "REGISTRATION"
                                          ? "default"
                                          : update.event_type === "WITHDRAWAL"
                                            ? "destructive"
                                            : "secondary"
                                      }
                                      className="text-xs"
                                    >
                                      {eventLabel}
                                    </Badge>
                                    {isWithdrawn ? (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-xs h-6 px-2"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          setSelectedDrugName(update.drug_name)
                                          setShowAlternativesModal(true)
                                        }}
                                      >
                                        Alternatywy
                                      </Button>
                                    ) : priority === "high" && (
                                      <Badge variant="destructive" className="text-xs">
                                        Pilne
                                      </Badge>
                                    )}
                                  </div>
                                  <h4 className="font-semibold text-sm leading-tight">{update.drug_name}</h4>
                                  <p className="text-xs text-muted-foreground">
                                    {isExpanded || !shouldTruncate ? description : truncateText(description, 100)}
                                  </p>
                                  <div className="flex items-center gap-2 text-xs">
                                    <Calendar className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-muted-foreground">{formattedDate}</span>
                                  </div>
                                  {update.batch_number && (
                                    <p className="text-xs text-muted-foreground italic">
                                      Seria: {update.batch_number}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )
                          })
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </>
              ) : (
                <>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Zmiany prawne
                      </CardTitle>
                      {criticalLegalChanges > 0 && (
                        <Badge variant="destructive">{criticalLegalChanges} krytyczne</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="h-[calc(100vh-200px)]">
                      <div className="space-y-1">
                        {legalChanges.map((change) => (
                          <div
                            key={change.id}
                            className={`border-b p-4 last:border-0 ${change.importance === "critical" ? "bg-destructive/5" : ""}`}
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between gap-2">
                                <Badge
                                  variant={
                                    change.category === "UE"
                                      ? "default"
                                      : change.category === "GIF"
                                        ? "destructive"
                                        : change.category === "NFZ"
                                          ? "secondary"
                                          : "outline"
                                  }
                                  className="text-xs"
                                >
                                  {change.category}
                                </Badge>
                                {change.importance === "critical" && (
                                  <Badge variant="destructive" className="text-xs">
                                    Krytyczne
                                  </Badge>
                                )}
                              </div>
                              <h4 className="font-semibold text-sm leading-tight">{change.title}</h4>
                              <p className="text-xs text-muted-foreground">{change.description}</p>
                              <div className="flex items-center gap-2 text-xs">
                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                <span className="text-muted-foreground">Wejście: {change.effectiveDate}</span>
                              </div>
                              <p className="text-xs text-muted-foreground italic">{change.source}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Drug Details Modal */}
      <Dialog open={!!selectedDrug} onOpenChange={() => setSelectedDrug(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          {selectedDrug && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedDrug.name}</DialogTitle>
                <DialogDescription className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge>{selectedDrug.category}</Badge>
                    {selectedDrug.prescription && <Badge variant="secondary">Lek na receptę</Badge>}
                  </div>
                  <div className="text-sm">
                    <p>
                      <strong>Skład:</strong> {selectedDrug.composition}
                    </p>
                    <p>
                      <strong>Producent:</strong> {selectedDrug.manufacturer}
                    </p>
                  </div>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <Card className="bg-primary/5">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-base font-medium text-muted-foreground">Cena</span>
                      <span className="text-4xl font-bold text-primary">{selectedDrug.price}</span>
                    </div>
                  </CardContent>
                </Card>

                <div>
                  <h3 className="mb-4 text-lg font-semibold">Alternatywne leki ({selectedDrug.alternatives.length})</h3>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nazwa</TableHead>
                          <TableHead>Skład</TableHead>
                          <TableHead>Producent</TableHead>
                          <TableHead className="text-right">Cena</TableHead>
                          <TableHead>Dostępność</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedDrug.alternatives.map((alt, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{alt.name}</TableCell>
                            <TableCell className="text-sm">{alt.composition}</TableCell>
                            <TableCell className="text-sm">{alt.manufacturer}</TableCell>
                            <TableCell className="text-right font-bold text-primary">{alt.price}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  alt.availability === "Dostępny"
                                    ? "default"
                                    : alt.availability === "Ograniczona dostępność"
                                      ? "secondary"
                                      : "destructive"
                                }
                              >
                                {alt.availability}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* News Details Modal */}
      <Dialog open={!!selectedNews} onOpenChange={() => setSelectedNews(null)}>
        <DialogContent 
          className="max-h-[90vh] overflow-y-auto"
          style={{ width: '95vw', maxWidth: 'none' }}
        >
          {selectedNews && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-4">
                  {selectedNews.image_url ? (
                    <img 
                      src={selectedNews.image_url} 
                      alt={selectedNews.title}
                      className="h-16 w-16 shrink-0 rounded-lg object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                        e.currentTarget.nextElementSibling?.classList.remove('hidden')
                      }}
                    />
                  ) : null}
                  <Avatar
                    className={`h-16 w-16 shrink-0 ${selectedNews.image_url ? 'hidden' : ''}`}
                    style={{
                      backgroundColor: `${selectedNews.color}15`,
                      color: selectedNews.color,
                    }}
                  >
                    <AvatarFallback
                      style={{
                        backgroundColor: `${selectedNews.color}15`,
                        color: selectedNews.color,
                      }}
                    >
                      {selectedNews.icon}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge
                        style={{
                          backgroundColor: `${selectedNews.color}15`,
                          color: selectedNews.color,
                          borderColor: selectedNews.color,
                        }}
                      >
                        {selectedNews.category}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{selectedNews.date}</span>
                      {selectedNews.is_translated && (
                        <Badge variant="outline" className="text-xs">
                          PL
                        </Badge>
                      )}
                    </div>
                    <DialogTitle className="text-2xl leading-tight">{selectedNews.title}</DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                      Źródło: {selectedNews.source}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6">
                <div className="prose prose-sm max-w-none">
                  <h3 className="text-lg font-semibold mb-3">Opis</h3>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {selectedNews.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Opublikowano: {selectedNews.date}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => window.open(selectedNews.url, '_blank')}
                      className="gap-2"
                    >
                      <Newspaper className="h-4 w-4" />
                      Czytaj w źródle
                    </Button>
                    <Button 
                      onClick={() => setSelectedNews(null)}
                      variant="secondary"
                    >
                      Zamknij
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Alternatives Modal */}
      <Dialog open={showAlternativesModal} onOpenChange={setShowAlternativesModal} modal={true}>
        <DialogContent className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 !w-[90vw] !h-[60vh] !max-w-[90vw] !max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5" />
              Alternatywne leki dla: {selectedDrugName}
            </DialogTitle>
            <DialogDescription>
              Poniżej znajdują się dostępne alternatywy dla wycofanego leku
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nazwa</TableHead>
                  <TableHead>Moc</TableHead>
                  <TableHead>Droga podania</TableHead>
                  <TableHead>Producent</TableHead>
                  <TableHead className="text-right">Cena</TableHead>
                  <TableHead className="text-right">Stan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockAlternatives.map((alt) => (
                  <TableRow key={alt.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{alt.nazwa}</TableCell>
                    <TableCell>{alt.moc}</TableCell>
                    <TableCell className="text-sm">{alt.droga_podania}</TableCell>
                    <TableCell className="text-sm">{alt.producent}</TableCell>
                    <TableCell className="text-right font-semibold text-primary">{alt.cena}</TableCell>
                    <TableCell className="text-right">
                      {alt.isLowStock ? (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {alt.stan} szt.
                        </Badge>
                      ) : (
                        <span className="font-medium">{alt.stan} szt.</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowAlternativesModal(false)}>
              Zamknij
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
