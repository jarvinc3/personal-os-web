"use client"

import { useAuth, useAuthGuard } from "@/src/modules/auth"
import { AuthFormFooter } from "@/src/modules/auth/components/auth-form-footer"
import {
  LoginForm,
  type LoginFormHandle,
} from "@/src/modules/auth/components/login-form"
import {
  RegisterForm,
  type RegisterFormHandle,
} from "@/src/modules/auth/components/register-form"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import { LoadingView } from "@/src/shared/components/layout/loading-view"
import { Button } from "@/src/shared/components/ui/button"
import {
  getAppIconPath,
  getWelcomeIllustrationPath,
} from "@/src/shared/constants/app-assets"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { useIsMobile } from "@/src/shared/hooks/use-mobile"
import { useSheetParam } from "@/src/shared/hooks/use-sheet-params"
import { ArrowRight } from "lucide-react"
import { useTheme } from "next-themes"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

type AuthMode = "login" | "register"

function WelcomePagination() {
  return (
    <div className="flex flex-row items-center gap-2">
      <span className="size-2 rounded-full bg-muted-foreground" />
      <span className="size-2 rounded-full bg-muted-foreground" />
      <span className="h-2 w-8 rounded-full bg-foreground" />
    </div>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const isMobile = useIsMobile()
  const { isAuthenticated, isLoading } = useAuthGuard()
  const { resolvedTheme } = useTheme()
  const { loginMutation, loginWithGoogleMutation, registerMutation } = useAuth()
  const [authMode, setAuthMode] = useState<AuthMode>("login")
  const desktopLoginFormRef = useRef<LoginFormHandle>(null)
  const desktopRegisterFormRef = useRef<RegisterFormHandle>(null)
  const sheetLoginFormRef = useRef<LoginFormHandle>(null)
  const sheetRegisterFormRef = useRef<RegisterFormHandle>(null)

  const themeKey = resolvedTheme === "dark" ? "dark" : "light"
  const appIcon = getAppIconPath(themeKey)
  const welcomeIllustration = getWelcomeIllustrationPath(themeKey)

  const { open: openLoginSheet, setOpen: setOpenLoginSheet } =
    useSheetParam("login-sheet")
  const { open: openRegisterSheet, setOpen: setOpenRegisterSheet } =
    useSheetParam("register-sheet")

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(APP_ROUTES.app.home)
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return <LoadingView variant="screen" />
  }

  if (isAuthenticated) {
    return <LoadingView variant="screen" />
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <nav className="flex flex-row items-center gap-3 p-4">
        <Image
          src={appIcon}
          alt="Logo de Personal OS"
          width={40}
          height={40}
          className="h-auto w-auto rounded-md"
          priority
        />
        <div className="flex-1">
          <p className="text-base font-bold text-foreground">Personal OS</p>
          <p className="text-xs text-muted-foreground">Tu espacio personal</p>
        </div>
      </nav>

      <div className="flex flex-1 flex-col md:flex-row">
        <div className="hidden flex-1 flex-col items-center justify-center gap-4 p-4 md:flex">
          {authMode === "login" ? (
            <>
              <LoginForm
                ref={desktopLoginFormRef}
                error={loginMutation.error}
                isPending={loginMutation.isPending}
                onSubmit={async (payload) => {
                  await loginMutation.mutateAsync(payload)
                }}
              />
              <AuthFormFooter
                isGooglePending={loginWithGoogleMutation.isPending}
                isPrimaryPending={loginMutation.isPending}
                primaryLabel="Iniciar sesión"
                primaryPendingLabel="Ingresando..."
                switchAction="Regístrate"
                switchPrompt="¿No tienes una cuenta?"
                onGooglePress={() => loginWithGoogleMutation.mutate(undefined)}
                onPrimaryPress={() => desktopLoginFormRef.current?.submit()}
                onSwitchPress={() => setAuthMode("register")}
              />
            </>
          ) : (
            <>
              <RegisterForm
                ref={desktopRegisterFormRef}
                error={registerMutation.error}
                isPending={registerMutation.isPending}
                onSubmit={async (payload) => {
                  await registerMutation.mutateAsync(payload)
                }}
              />
              <AuthFormFooter
                isGooglePending={loginWithGoogleMutation.isPending}
                isPrimaryPending={registerMutation.isPending}
                primaryLabel="Crear cuenta"
                primaryPendingLabel="Creando cuenta..."
                switchAction="Iniciar sesión"
                switchPrompt="¿Ya tienes una cuenta?"
                onGooglePress={() => loginWithGoogleMutation.mutate(undefined)}
                onPrimaryPress={() => desktopRegisterFormRef.current?.submit()}
                onSwitchPress={() => setAuthMode("login")}
              />
            </>
          )}
        </div>

        <div className="flex flex-1 flex-col">
          <div className="flex flex-1 items-center justify-center">
            <Image
              src={welcomeIllustration}
              alt="Ilustración de bienvenida"
              width={650}
              height={300}
              className="h-auto w-auto object-contain"
              priority
            />
          </div>

          <div className="flex flex-col gap-10 px-8">
            <h1 className="text-4xl leading-[1.05] font-bold tracking-tight text-foreground">
              Mantén tu
              <br />
              mente fresca
            </h1>

            <div className="flex flex-row items-center justify-between pb-4">
              <WelcomePagination />
              <Button
                type="button"
                aria-label="Iniciar sesión"
                className="rounded-full p-6 md:hidden"
                size="icon-lg"
                onClick={() => {
                  setOpenLoginSheet(true)
                }}
              >
                <ArrowRight className="size-6" strokeWidth={2.25} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {isMobile ? (
        <>
          <BottomSheet
            title="Iniciar sesión"
            description="Accede con email o Google."
            open={openLoginSheet}
            onOpenChange={setOpenLoginSheet}
          >
            <LoginForm
              ref={sheetLoginFormRef}
              error={loginMutation.error}
              isPending={loginMutation.isPending}
              onSubmit={async (payload) => {
                await loginMutation.mutateAsync(payload)
              }}
            />
            <AuthFormFooter
              isGooglePending={loginWithGoogleMutation.isPending}
              isPrimaryPending={loginMutation.isPending}
              primaryLabel="Iniciar sesión"
              primaryPendingLabel="Ingresando..."
              switchAction="Regístrate"
              switchPrompt="¿No tienes una cuenta?"
              onGooglePress={() => loginWithGoogleMutation.mutate(undefined)}
              onPrimaryPress={() => sheetLoginFormRef.current?.submit()}
              onSwitchPress={() => setOpenRegisterSheet(true)}
            />
          </BottomSheet>

          <BottomSheet
            title="Crear cuenta"
            description="Regístrate para empezar."
            open={openRegisterSheet}
            onOpenChange={setOpenRegisterSheet}
          >
            <RegisterForm
              ref={sheetRegisterFormRef}
              error={registerMutation.error}
              isPending={registerMutation.isPending}
              onSubmit={async (payload) => {
                await registerMutation.mutateAsync(payload)
              }}
            />
            <AuthFormFooter
              isGooglePending={loginWithGoogleMutation.isPending}
              isPrimaryPending={registerMutation.isPending}
              primaryLabel="Crear cuenta"
              primaryPendingLabel="Creando cuenta..."
              switchAction="Iniciar sesión"
              switchPrompt="¿Ya tienes una cuenta?"
              onGooglePress={() => loginWithGoogleMutation.mutate(undefined)}
              onPrimaryPress={() => sheetRegisterFormRef.current?.submit()}
              onSwitchPress={() => setOpenLoginSheet(true)}
            />
          </BottomSheet>
        </>
      ) : null}
    </div>
  )
}
