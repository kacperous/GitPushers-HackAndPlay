"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from 'react-router-dom'
import { useAuth } from "@/contexts/AuthContext"
import type { RegisterData } from "@/services/authService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Mail, Lock, User, UserPlus, Eye, EyeOff, AlertCircle, ArrowLeft, Home } from "lucide-react"

interface RegisterFormData extends RegisterData {}

interface RegisterPageProps {
  onRegister?: (formData: RegisterFormData) => void
  onBackToLogin?: () => void
  onBackToHome?: () => void
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onRegister, onBackToLogin, onBackToHome }) => {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [formData, setFormData] = useState<RegisterFormData>({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    password2: "",
    account_type: "pharmacy",
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<Partial<RegisterFormData>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [registerError, setRegisterError] = useState("")

  const validateForm = (): boolean => {
    const newErrors: Partial<RegisterFormData> = {}
    if (!formData.first_name.trim()) {
      newErrors.first_name = "Imię jest wymagane"
    } else if (formData.first_name.trim().length < 2) {
      newErrors.first_name = "Imię musi mieć co najmniej 2 znaki"
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = "Nazwisko jest wymagane"
    } else if (formData.last_name.trim().length < 2) {
      newErrors.last_name = "Nazwisko musi mieć co najmniej 2 znaki"
    }
    if (!formData.email) {
      newErrors.email = "Email jest wymagany"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email jest nieprawidłowy"
    }
    if (!formData.password) {
      newErrors.password = "Hasło jest wymagane"
    } else if (formData.password.length < 8) {
      newErrors.password = "Hasło musi mieć co najmniej 8 znaków"
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Hasło musi zawierać małą literę, wielką literę i cyfrę"
    }
    if (!formData.password2) {
      newErrors.password2 = "Potwierdzenie hasła jest wymagane"
    } else if (formData.password !== formData.password2) {
      newErrors.password2 = "Hasła nie są identyczne"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof RegisterFormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }))
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }))
    }
    setRegisterError("")
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!validateForm()) {
      return
    }
    setIsLoading(true)
    setRegisterError("")
    try {
      await register(formData)
      console.log("Registration successful")
      
      // Call parent callback if provided
      if (onRegister) {
        onRegister(formData)
      }

      // Navigate to main page after successful registration
      navigate('/')
    } catch (error) {
      setRegisterError(error instanceof Error ? error.message : "Wystąpił błąd podczas rejestracji. Spróbuj ponownie.")
    } finally {
      setIsLoading(false)
    }
  }

  const BackToHomeButton: React.FC<{ onBackToHome?: () => void }> = ({ onBackToHome }) => {
    const navigate = useNavigate()
    return (
      <Button
        type="button"
        variant="ghost"
        className="w-full gap-2"
        onClick={(e) => {
          e.preventDefault()
          if (onBackToHome) onBackToHome()
          else navigate('/')
        }}
      >
        <Home className="h-4 w-4" />
        Powrót do strony głównej
      </Button>
    )
  }

  const BackToLoginButton: React.FC<{ onBackToLogin?: () => void }> = ({ onBackToLogin }) => {
    const navigate = useNavigate()
    return (
      <Button
        type="button"
        variant="outline"
        className="w-full gap-2 bg-transparent"
        onClick={(e) => {
          e.preventDefault()
          if (onBackToLogin) onBackToLogin()
          else navigate('/login')
        }}
      >
        <ArrowLeft className="h-4 w-4" />
        Masz już konto? Zaloguj się
      </Button>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="border-2">
          <CardHeader className="space-y-4 text-center pb-8">
            <div className="flex justify-center">
              <Avatar className="h-16 w-16 bg-primary">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <UserPlus className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold">Zarejestruj się</CardTitle>
              <CardDescription className="text-base">
                Utwórz nowe konto, aby rozpocząć korzystanie z aplikacji
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {registerError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{registerError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Fields */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="first_name" className="text-sm font-medium">
                    Imię *
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="first_name"
                      name="first_name"
                      type="text"
                      autoComplete="given-name"
                      autoFocus
                      value={formData.first_name}
                      onChange={handleInputChange("first_name")}
                      className={`pl-10 ${errors.first_name ? "border-destructive" : ""}`}
                      placeholder="Jan"
                    />
                  </div>
                  {errors.first_name && <p className="text-sm text-destructive">{errors.first_name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_name" className="text-sm font-medium">
                    Nazwisko *
                  </Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    type="text"
                    autoComplete="family-name"
                    value={formData.last_name}
                    onChange={handleInputChange("last_name")}
                    className={errors.last_name ? "border-destructive" : ""}
                    placeholder="Kowalski"
                  />
                  {errors.last_name && <p className="text-sm text-destructive">{errors.last_name}</p>}
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Adres email *
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleInputChange("email")}
                    className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
                    placeholder="jan.kowalski@example.com"
                  />
                </div>
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Hasło *
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleInputChange("password")}
                    className={`pl-10 pr-10 ${errors.password ? "border-destructive" : ""}`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password2" className="text-sm font-medium">
                  Potwierdź hasło *
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password2"
                    name="password2"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={formData.password2}
                    onChange={handleInputChange("password2")}
                    className={`pl-10 pr-10 ${errors.password2 ? "border-destructive" : ""}`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password2 && <p className="text-sm text-destructive">{errors.password2}</p>}
              </div>

              <Button type="submit" className="w-full gap-2 py-6 text-base" disabled={isLoading}>
                {isLoading ? (
                  <>Rejestracja...</>
                ) : (
                  <>
                    <UserPlus className="h-5 w-5" />
                    Zarejestruj się
                  </>
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">lub</span>
              </div>
            </div>

            <div className="space-y-3">
              <BackToLoginButton onBackToLogin={onBackToLogin} />

              <BackToHomeButton onBackToHome={onBackToHome} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default RegisterPage
