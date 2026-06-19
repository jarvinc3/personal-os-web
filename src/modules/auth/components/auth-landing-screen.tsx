'use client';

import { useAuth } from '@/src/modules/auth';
import { AuthFormFooter } from '@/src/modules/auth/components/auth-form-footer';
import { LoginForm, type LoginFormHandle } from '@/src/modules/auth/components/login-form';
import { RegisterForm, type RegisterFormHandle } from '@/src/modules/auth/components/register-form';
import { Button } from '@/src/shared/components/ui/button';
import { ScrollArea } from '@/src/shared/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/src/shared/components/ui/sheet';
import {
  getAppIconPath,
  getWelcomeIllustrationPath,
} from '@/src/shared/constants/app-assets';
import { ArrowRight } from 'lucide-react';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { useCallback, useRef, useState } from 'react';

function WelcomePagination() {
  return (
    <div className="flex flex-row items-center gap-2">
      <span className="size-2 rounded-full bg-foreground/50" />
      <span className="size-2 rounded-full bg-foreground/50" />
      <span className="h-2 w-8 rounded-full bg-foreground" />
    </div>
  );
}

type AuthSheetMode = 'login' | 'register' | null;

export function AuthLandingScreen() {
  const { resolvedTheme } = useTheme();
  const { loginMutation, loginWithGoogleMutation, registerMutation } = useAuth();
  const [sheetMode, setSheetMode] = useState<AuthSheetMode>(null);
  const loginFormRef = useRef<LoginFormHandle>(null);
  const registerFormRef = useRef<RegisterFormHandle>(null);

  const themeKey = resolvedTheme === 'dark' ? 'dark' : 'light';
  const appIcon = getAppIconPath(themeKey);
  const welcomeIllustration = getWelcomeIllustrationPath(themeKey);

  const openLoginSheet = useCallback(() => setSheetMode('login'), []);
  const switchToRegister = useCallback(() => setSheetMode('register'), []);
  const switchToLogin = useCallback(() => setSheetMode('login'), []);

  return (
    <>
      <div className="flex min-h-screen flex-col bg-background">
        <div className="mb-4 flex flex-row items-center gap-3 border-b border-border px-4 pb-4 pt-12">
          <Image
            src={appIcon}
            alt="Logo de Personal OS"
            width={40}
            height={40}
            className="size-10 rounded-md"
            priority
          />
          <div className="flex-1">
            <p className="text-base font-bold text-foreground">Personal OS</p>
            <p className="text-xs text-muted-foreground">Tu espacio personal</p>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-6">
          <Image
            src={welcomeIllustration}
            alt="Ilustración de bienvenida"
            width={800}
            height={384}
            className="h-96 w-full object-contain"
            priority
          />
        </div>

        <div className="flex flex-col gap-10 px-6 pb-8">
          <h1 className="text-[42px] font-bold leading-[1.05] tracking-tight text-foreground">
            Mantén tu
            <br />
            mente fresca
          </h1>

          <div className="flex flex-row items-center justify-between pb-4">
            <WelcomePagination />
            <Button
              type="button"
              aria-label="Iniciar sesión"
              className="size-16 rounded-full p-0"
              onClick={openLoginSheet}
            >
              <ArrowRight className="size-7" strokeWidth={2.25} />
            </Button>
          </div>
        </div>
      </div>

      <Sheet open={sheetMode === 'login'} onOpenChange={(open) => !open && setSheetMode(null)}>
        <SheetContent side="bottom" className="flex max-h-[85vh] flex-col gap-0 rounded-t-2xl p-0">
          <SheetHeader className="border-b border-border px-4 py-4 text-center">
            <SheetTitle>Iniciar sesión</SheetTitle>
            <SheetDescription>Accede con email o Google.</SheetDescription>
          </SheetHeader>
          <ScrollArea className="min-h-0 flex-1">
            <div className="flex flex-col gap-4 p-4">
              <LoginForm
                ref={loginFormRef}
                error={loginMutation.error}
                isPending={loginMutation.isPending}
                onSubmit={async (payload) => {
                  await loginMutation.mutateAsync(payload);
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
                onPrimaryPress={() => loginFormRef.current?.submit()}
                onSwitchPress={switchToRegister}
              />
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <Sheet open={sheetMode === 'register'} onOpenChange={(open) => !open && setSheetMode(null)}>
        <SheetContent side="bottom" className="flex max-h-[92vh] flex-col gap-0 rounded-t-2xl p-0">
          <SheetHeader className="border-b border-border px-4 py-4 text-center">
            <SheetTitle>Crear cuenta</SheetTitle>
            <SheetDescription>Regístrate para empezar.</SheetDescription>
          </SheetHeader>
          <ScrollArea className="min-h-0 flex-1">
            <div className="flex flex-col gap-4 p-4">
              <RegisterForm
                ref={registerFormRef}
                error={registerMutation.error}
                isPending={registerMutation.isPending}
                onSubmit={async (payload) => {
                  await registerMutation.mutateAsync(payload);
                }}
              />
              <AuthFormFooter
                isGooglePending={loginWithGoogleMutation.isPending}
                isPrimaryPending={registerMutation.isPending}
                primaryLabel="Crear cuenta"
                primaryPendingLabel="Creando cuenta..."
                switchAction="Inicia sesión"
                switchPrompt="¿Ya tienes una cuenta?"
                onGooglePress={() => loginWithGoogleMutation.mutate(undefined)}
                onPrimaryPress={() => registerFormRef.current?.submit()}
                onSwitchPress={switchToLogin}
              />
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
}
