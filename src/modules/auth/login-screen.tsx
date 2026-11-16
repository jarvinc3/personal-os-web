"use client"

import { useAuth, useAuthGuard } from "@/src/modules/auth"
import { AuthFormFooter } from "@/src/modules/auth/components/auth-form-footer"
import { LoginForm } from "@/src/modules/auth/components/login-form"
import { RegisterForm } from "@/src/modules/auth/components/register-form"
import { AppLogo } from "@/src/shared/components/shell/app-logo"
import { BottomSheet } from "@/src/shared/components/sheets/bottom-sheet"
import { LoadingView } from "@/src/shared/components/feedback/loading-view"
import { Button } from "@/src/shared/components/ui/button"
import { appAssets } from "@/src/shared/constants/app-assets"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { landingUrl } from "@/src/shared/constants/landing.mjs"
import { useIsMobile } from "@/src/shared/hooks/use-mobile"
import { useSheetParam } from "@/src/shared/hooks/use-sheet-params"
import { ArrowRight } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Suspense, useEffect, useState } from "react"

type AuthMode = "login" | "register"
type AuthActions = ReturnType<typeof useAuth>

const DESKTOP_LOGIN_FORM_ID = "desktop-login-form"
const DESKTOP_REGISTER_FORM_ID = "desktop-register-form"
const SHEET_LOGIN_FORM_ID = "sheet-login-form"
const SHEET_REGISTER_FORM_ID = "sheet-register-form"

function WelcomePagination() {
  return (
    <div className="flex flex-row items-center gap-2">
      <span className="size-2 rounded-full bg-muted-foreground" />
      <span className="size-2 rounded-full bg-muted-foreground" />
      <span className="h-2 w-8 rounded-full bg-foreground" />
    </div>
  )
}

/**
 * Los sheets viven en su propio límite porque `useSheetParam` lee la URL y, si
 * se llamara en la pantalla, Next dejaría el formulario fuera del HTML: entre
 * el primer pintado y la hidratación el clic se perdía sin respuesta.
 */
function MobileAuthEntry({ auth }: { auth: AuthActions }) {
  const isMobile = useIsMobile()
  const { loginMutation, loginWithGoogleMutation, registerMutation } = auth
  const { open: openLoginSheet, setOpen: setOpenLoginSheet } =
    useSheetParam("login-sheet")
  const { open: openRegisterSheet, setOpen: setOpenRegisterSheet } =
    useSheetParam("register-sheet")

  if (!isMobile) {
    return null
  }

  return (
    <>
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

      <BottomSheet
        title="Iniciar sesión"
        description="Accede con email o Google."
        open={openLoginSheet}
        showClose={false}
        onOpenChange={setOpenLoginSheet}
      >
        <LoginForm
          formId={SHEET_LOGIN_FORM_ID}
          error={loginMutation.error}
          isPending={loginMutation.isPending}
          onSubmit={async (payload) => {
            await loginMutation.mutateAsync(payload)
          }}
        />
        <AuthFormFooter
          formId={SHEET_LOGIN_FORM_ID}
          isGooglePending={loginWithGoogleMutation.isPending}
          isPrimaryPending={loginMutation.isPending}
          primaryLabel="Iniciar sesión"
          primaryPendingLabel="Ingresando..."
          switchAction="Regístrate"
          switchPrompt="¿No tienes una cuenta?"
          onGooglePress={() => loginWithGoogleMutation.mutate(undefined)}
          onSwitchPress={() => setOpenRegisterSheet(true)}
        />
      </BottomSheet>

      <BottomSheet
        title="Crear cuenta"
        description="Regístrate para empezar."
        open={openRegisterSheet}
        showClose={false}
        onOpenChange={setOpenRegisterSheet}
      >
        <RegisterForm
          formId={SHEET_REGISTER_FORM_ID}
          error={registerMutation.error}
          isPending={registerMutation.isPending}
          onSubmit={async (payload) => {
            await registerMutation.mutateAsync(payload)
          }}
        />
        <AuthFormFooter
          formId={SHEET_REGISTER_FORM_ID}
          isGooglePending={loginWithGoogleMutation.isPending}
          isPrimaryPending={registerMutation.isPending}
          primaryLabel="Crear cuenta"
          primaryPendingLabel="Creando cuenta..."
          switchAction="Iniciar sesión"
          switchPrompt="¿Ya tienes una cuenta?"
          onGooglePress={() => loginWithGoogleMutation.mutate(undefined)}
          onSwitchPress={() => setOpenLoginSheet(true)}
        />
      </BottomSheet>
    </>
  )
}

export function LoginScreen() {
  return <LoginScreenBody />
}

function LoginScreenBody() {
  const router = useRouter()
  const { isAuthenticated } = useAuthGuard()
  const auth = useAuth()
  const { loginMutation, loginWithGoogleMutation, registerMutation } = auth
  const [authMode, setAuthMode] = useState<AuthMode>("login")

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(APP_ROUTES.app.home)
    }
  }, [isAuthenticated, router])

  // No bootstrap gate: a stale stored session must not block the form while
  // `/users/me` is slow. The effect redirects once the profile hydrates.
  if (isAuthenticated) {
    return <LoadingView variant="screen" />
  }

  return (
    <div className="flex h-screen flex-col">
      <nav className="flex flex-row items-center gap-3 p-4">
        <a
          href={landingUrl()}
          className="flex flex-row items-center gap-3 transition-opacity hover:opacity-80"
        >
          <AppLogo size="lg" className="rounded-md" priority />
          <div className="flex-1">
            <p className="text-base font-bold text-foreground">Personal OS</p>
            <p className="text-xs text-muted-foreground">Tu espacio personal</p>
          </div>
        </a>
      </nav>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <div className="hidden flex-1 flex-col items-center justify-center gap-4 p-4 md:flex">
          {authMode === "login" ? (
            <>
              <LoginForm
                formId={DESKTOP_LOGIN_FORM_ID}
                error={loginMutation.error}
                isPending={loginMutation.isPending}
                onSubmit={async (payload) => {
                  await loginMutation.mutateAsync(payload)
                }}
              />
              <AuthFormFooter
                formId={DESKTOP_LOGIN_FORM_ID}
                isGooglePending={loginWithGoogleMutation.isPending}
                isPrimaryPending={loginMutation.isPending}
                primaryLabel="Iniciar sesión"
                primaryPendingLabel="Ingresando..."
                switchAction="Regístrate"
                switchPrompt="¿No tienes una cuenta?"
                onGooglePress={() => loginWithGoogleMutation.mutate(undefined)}
                onSwitchPress={() => setAuthMode("register")}
              />
            </>
          ) : (
            <>
              <RegisterForm
                formId={DESKTOP_REGISTER_FORM_ID}
                error={registerMutation.error}
                isPending={registerMutation.isPending}
                onSubmit={async (payload) => {
                  await registerMutation.mutateAsync(payload)
                }}
              />
              <AuthFormFooter
                formId={DESKTOP_REGISTER_FORM_ID}
                isGooglePending={loginWithGoogleMutation.isPending}
                isPrimaryPending={registerMutation.isPending}
                primaryLabel="Crear cuenta"
                primaryPendingLabel="Creando cuenta..."
                switchAction="Iniciar sesión"
                switchPrompt="¿Ya tienes una cuenta?"
                onGooglePress={() => loginWithGoogleMutation.mutate(undefined)}
                onSwitchPress={() => setAuthMode("login")}
              />
            </>
          )}
        </div>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="flex min-h-0 flex-1 items-center justify-center p-4 sm:p-6 md:p-4">
            <Image
              src={appAssets.welcomeIllustrationLight}
              alt="Ilustración de bienvenida"
              width={650}
              height={300}
              sizes="(max-width: 767px) calc(100vw - 2rem), 50vw"
              className="h-auto max-h-full w-auto max-w-full object-contain dark:hidden"
              priority
            />
            <Image
              src={appAssets.welcomeIllustrationDark}
              alt=""
              aria-hidden
              width={650}
              height={300}
              sizes="(max-width: 767px) calc(100vw - 2rem), 50vw"
              className="hidden h-auto max-h-full w-auto max-w-full object-contain dark:block"
              priority
            />
          </div>

          <div className="flex shrink-0 flex-col gap-10 px-8">
            <h1 className="text-4xl leading-[1.05] font-bold tracking-tight text-foreground">
              Mantén tu
              <br />
              mente fresca
            </h1>

            <div className="flex flex-row items-center justify-between pb-4">
              <WelcomePagination />
              <Suspense fallback={null}>
                <MobileAuthEntry auth={auth} />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
