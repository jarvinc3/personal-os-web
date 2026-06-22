"use client";

import { APP_ROUTES } from "@/src/shared/constants/app-routes";
import { motion } from "motion/react";
import Link from "next/link";
import { landingContent } from "../data/site-info";

export function HeroSection() {
  return (
    <section className="flex overflow-hidden relative flex-col justify-center items-center px-4 pt-24 pb-20 min-h-screen">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none -z-10 bg-surface">
        {/* Playful grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(var(--color-primary) 1px, transparent 1px), linear-gradient(90deg, var(--color-primary) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/75 bg-primary/10 px-4 py-1.5 text-sm text-primary"
        >
          <span className="flex relative w-2 h-2">
            <span className="inline-flex absolute w-full h-full rounded-full animate-ping bg-primary" />
            <span className="inline-flex relative w-2 h-2 rounded-full bg-primary" />
          </span>
          {landingContent.hero.badge}
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl"
        >
          {landingContent.hero.titleStart}{" "}
          <span className="inline-block relative px-2">
            <span className="absolute inset-0 rounded-xl scale-105 -rotate-1 -z-10 bg-primary"></span>
            <span className="text-primary-foreground">
              {landingContent.hero.titleHighlight}
            </span>
          </span>
          <br />y automatizada.
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl"
        >
          {landingContent.hero.description}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col gap-4 items-center mt-10 sm:flex-row sm:justify-center"
        >
          <Link
            href="#waitlist"
            className="group relative overflow-hidden rounded-2xl bg-primary px-8 py-4 text-base font-bold text-primary-foreground shadow-[4px_4px_0px_0px_#111827] transition-all duration-300 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#111827] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
          >
            <span className="flex relative z-10 gap-2 items-center">
              {landingContent.hero.primaryCta}
              <svg
                className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </span>
          </Link>
          <Link
            href="#features"
            className="rounded-2xl border-2 border-text bg-white px-8 py-4 text-base font-bold text-text shadow-[4px_4px_0px_0px_#111827] transition-all duration-200 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#111827] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
          >
            {landingContent.hero.secondaryCta}
          </Link>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-4 text-sm text-muted-foreground"
        >
          ¿Ya tienes cuenta?{" "}
          <Link
            href={APP_ROUTES.auth.login}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Iniciar sesión
          </Link>
        </motion.p>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-wrap gap-8 justify-center items-center mt-16 text-sm text-muted-foreground"
        >
          {landingContent.hero.stats.map((stat) => (
            <div key={stat.label} className="flex flex-col gap-1 items-center">
              <span className="text-2xl font-bold text-foreground">
                {stat.value}
              </span>
              <span className="text-xs">{stat.label}</span>
            </div>
          ))}
        </motion.div>

        {/* App mockup placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mx-auto mt-20 max-w-3xl"
        >
          <div className="relative overflow-hidden rounded-3xl border-2 border-text bg-white shadow-[8px_8px_0px_0px_var(--color-primary)]">
            {/* Window chrome */}
            <div className="flex gap-2 items-center px-6 py-4 border-b-2 border-text bg-neutral-100">
              <div className="flex gap-2">
                <div className="h-3.5 w-3.5 rounded-full border border-text bg-red-400" />
                <div className="h-3.5 w-3.5 rounded-full border border-text bg-yellow-400" />
                <div className="h-3.5 w-3.5 rounded-full border border-text bg-green-400" />
              </div>
              <div className="flex justify-center items-center mx-auto w-48 h-6 text-xs font-bold bg-white rounded-md border border-text text-text">
                personal-os.app
              </div>
            </div>

            {/* Dashboard preview */}
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="text-left">
                  <p className="text-xs font-medium text-muted-foreground">
                    Buenos días, Carlos
                  </p>
                  <p className="text-xl font-bold">Dashboard</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-text bg-secondary text-primary-foreground shadow-[2px_2px_0px_0px_#111827]">
                  <span className="text-lg">🤖</span>
                </div>
              </div>

              {/* Module cards */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[
                  {
                    icon: "💳",
                    name: "Finanzas",
                    value: "RD$45,200",
                    change: "+2.4%",
                    positive: true,
                  },
                  {
                    icon: "📅",
                    name: "Agenda",
                    value: "3 eventos",
                    change: "hoy",
                    positive: true,
                  },
                  {
                    icon: "🔄",
                    name: "Suscripciones",
                    value: "12 activas",
                    change: "2 por vencer",
                    positive: false,
                  },
                  {
                    icon: "🚀",
                    name: "Proyectos",
                    value: "4 activos",
                    change: "68% completado",
                    positive: true,
                  },
                  {
                    icon: "❤️",
                    name: "Salud",
                    value: "Ejercicio",
                    change: "7 días seguidos",
                    positive: true,
                  },
                  {
                    icon: "🤖",
                    name: "IA",
                    value: "Activo",
                    change: "12 acciones hoy",
                    positive: true,
                  },
                ].map((card) => (
                  <div
                    key={card.name}
                    className="rounded-xl border-2 border-text bg-white p-3 shadow-[2px_2px_0px_0px_#111827] transition-transform hover:-translate-y-1"
                  >
                    <div className="flex gap-2 items-center mb-2">
                      <span className="text-lg">{card.icon}</span>
                      <span className="text-xs font-bold text-text">
                        {card.name}
                      </span>
                    </div>
                    <p className="text-sm font-bold">{card.value}</p>
                    <p
                      className={`mt-0.5 text-xs font-semibold ${card.positive ? "text-success" : "text-warning"}`}
                    >
                      {card.change}
                    </p>
                  </div>
                ))}
              </div>

              {/* AI chat preview */}
              <div className="mt-4 rounded-xl border-2 border-text bg-accent p-4 shadow-[4px_4px_0px_0px_#111827]">
                <div className="flex gap-2 items-center mb-2">
                  <span className="text-lg">🤖</span>
                  <span className="text-sm font-bold text-text">
                    {landingContent.hero.mockup.agentName}
                  </span>
                </div>
                <p className="text-sm font-medium text-text">
                  &quot;Detecté un gasto de RD$3,200 en Supermercado Nacional. Lo
                  categoricé como <strong className="text-primary">{landingContent.hero.mockup.highlight}</strong>. Tu
                  presupuesto de comida está al 78% este mes.&quot;
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
