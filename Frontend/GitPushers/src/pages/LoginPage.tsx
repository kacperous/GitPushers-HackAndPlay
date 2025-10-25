import type React from "react"

import { useState } from "react"
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/AuthContext"

interface LoginFormData {
  email: string
  password: string
}

interface LoginPageProps {
  onLogin?: (formData: LoginFormData) => void
  onBackToHome?: () => void
  onGoToRegister?: () => void
}

export default function LoginPage({ onLogin, onBackToHome, onGoToRegister }: LoginPageProps) {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  })

  const [errors, setErrors] = useState<Partial<LoginFormData>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginFormData> = {}
    if (!formData.email) {
      newErrors.email = "Email jest wymagany"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email jest nieprawidłowy"
    }
    if (!formData.password) {
      newErrors.password = "Hasło jest wymagane"
    } else if (formData.password.length < 6) {
      newErrors.password = "Hasło musi mieć co najmniej 6 znaków"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof LoginFormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
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
    setLoginError("")
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    setLoginError("")

    try {
      // Use AuthContext to login
      await login(formData.email, formData.password)

      console.log("Login successful")
      
      // Call parent callback if provided
      if (onLogin) {
        onLogin(formData)
      }

      // Navigate to main page after successful login
      navigate('/')
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "Wystąpił błąd podczas logowania. Spróbuj ponownie.")
    } finally {
      setIsLoading(false)
    }
  }

  // Internal small component to render Back to Home button.
  // Uses parent's onBackToHome if provided, otherwise navigates to '/'.
  const BackToHomeButton: React.FC<{ onBackToHome?: () => void }> = ({ onBackToHome }) => {
    const navigate = useNavigate()
    return (
      <Button
        type="button"
        variant="outline"
        className="w-full gap-2 bg-transparent"
        onClick={(e) => {
          e.preventDefault()
          if (onBackToHome) onBackToHome()
          else navigate('/')
        }}
      >
        <ArrowLeft className="h-4 w-4" />
        Powrót do strony głównej
      </Button>
    )
  }

  const BackToRegisterButton: React.FC<{ onGoToRegister?: () => void }> = ({ onGoToRegister }) => {
    const navigate = useNavigate()
    return (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          if (onGoToRegister) onGoToRegister()
          else navigate('/register')
        }}
        className="text-primary hover:underline block w-full"
      >
        Nie masz konta? Zarejestruj się
      </button>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Login Card */}
        <Card className="border-border shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Zaloguj się</CardTitle>
            <CardDescription>Wprowadź swoje dane, aby uzyskać dostęp do konta</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error Alert */}
              {loginError && (
                <Alert variant="destructive">
                  <AlertDescription>{loginError}</AlertDescription>
                </Alert>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Adres email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Wprowadź swój email"
                    value={formData.email}
                    onChange={handleInputChange("email")}
                    className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
                    autoComplete="email"
                    autoFocus
                  />
                </div>
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Hasło
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Wprowadź swoje hasło"
                    value={formData.password}
                    onChange={handleInputChange("password")}
                    className={`pl-10 pr-10 ${errors.password ? "border-destructive" : ""}`}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logowanie..." : "Zaloguj się"}
              </Button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">lub</span>
                </div>
              </div>

              {/* Links */}
              <div className="space-y-2 text-center text-sm">
                <BackToRegisterButton onGoToRegister={onGoToRegister} />
              </div>

              {/* Back to Home Button - always visible; if parent provides onBackToHome it will be used, otherwise navigate to '/' */}
              <BackToHomeButton onBackToHome={onBackToHome} />
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
