"use client"

import { PageHeader } from "@/src/modules/landing/components/PageHeader"
import { motion } from "motion/react"
import { useState } from "react"

const contactReasons = [
  "Pregunta general",
  "Soporte técnico",
  "Reporte de error",
  "Solicitud de funcionalidad",
  "Privacidad y datos",
  "Colaboración / Prensa",
  "Otro",
]

export function ContactScreen() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    reason: contactReasons[0],
    message: "",
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1200))
    setLoading(false)
    setSubmitted(true)
  }

  return (
    <div>
      <PageHeader
        label="Soporte"
        title="Contáctanos"
        description="¿Tienes preguntas, reportes o simplemente quieres saludar? Estamos aquí para ayudarte."
        breadcrumb={[{ href: "/contact", label: "Contacto" }]}
      />

      <main className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
          {/* Contact info */}
          <div className="lg:col-span-2">
            <h2 className="mb-6 text-xl font-semibold">
              Otras formas de contacto
            </h2>
            <div className="space-y-4">
              {[
                {
                  icon: "📧",
                  title: "Email general",
                  value: "hola@personal-os.app",
                  href: "mailto:hola@personal-os.app",
                },
                {
                  icon: "🔐",
                  title: "Privacidad y datos",
                  value: "privacidad@personal-os.app",
                  href: "mailto:privacidad@personal-os.app",
                },
                {
                  icon: "⚖️",
                  title: "Asuntos legales",
                  value: "legal@personal-os.app",
                  href: "mailto:legal@personal-os.app",
                },
              ].map((item) => (
                <a
                  key={item.title}
                  href={item.href}
                  className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 transition-all hover:border-white/20 hover:bg-white/8"
                >
                  <span className="mt-0.5 text-xl">{item.icon}</span>
                  <div>
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="mt-0.5 text-xs text-primary">{item.value}</p>
                  </div>
                </a>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
              <p className="text-sm font-medium text-amber-400">
                ⏱ Tiempo de respuesta
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Respondemos en un plazo de 1 a 3 días hábiles. Estamos en fase
                beta por lo que el equipo es pequeño, ¡gracias por tu paciencia!
              </p>
            </div>
          </div>

          {/* Contact form */}
          <div className="lg:col-span-3">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center gap-4 py-8 text-center"
                >
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 text-4xl">
                    ✅
                  </div>
                  <h3 className="text-xl font-semibold">¡Mensaje enviado!</h3>
                  <p className="max-w-sm text-sm text-muted-foreground">
                    Recibimos tu mensaje. Te responderemos a{" "}
                    <strong className="text-foreground">{form.email}</strong> en
                    los próximos días hábiles.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false)
                      setForm({
                        name: "",
                        email: "",
                        reason: contactReasons[0],
                        message: "",
                      })
                    }}
                    className="mt-2 text-sm text-primary hover:underline"
                  >
                    Enviar otro mensaje
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h2 className="mb-6 text-xl font-semibold">
                    Envíanos un mensaje
                  </h2>

                  {/* Name & Email */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="contact-name"
                        className="mb-1.5 block text-xs font-medium text-muted-foreground"
                      >
                        Nombre completo *
                      </label>
                      <input
                        id="contact-name"
                        name="name"
                        type="text"
                        required
                        value={form.name}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-white/15 bg-white/8 px-4 py-2.5 text-sm transition-all outline-none placeholder:text-muted-foreground/50 focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="contact-email"
                        className="mb-1.5 block text-xs font-medium text-muted-foreground"
                      >
                        Email *
                      </label>
                      <input
                        id="contact-email"
                        name="email"
                        type="email"
                        required
                        value={form.email}
                        onChange={handleChange}
                        placeholder="tu@email.com"
                        className="w-full rounded-xl border border-white/15 bg-white/8 px-4 py-2.5 text-sm transition-all outline-none placeholder:text-muted-foreground/50 focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  {/* Reason */}
                  <div>
                    <label
                      htmlFor="contact-reason"
                      className="mb-1.5 block text-xs font-medium text-muted-foreground"
                    >
                      Motivo del contacto
                    </label>
                    <select
                      id="contact-reason"
                      name="reason"
                      value={form.reason}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-white/15 bg-background px-4 py-2.5 text-sm transition-all outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                    >
                      {contactReasons.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label
                      htmlFor="contact-message"
                      className="mb-1.5 block text-xs font-medium text-muted-foreground"
                    >
                      Mensaje *
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      required
                      rows={5}
                      value={form.message}
                      onChange={handleChange}
                      className="w-full resize-none rounded-xl border border-white/15 bg-white/8 px-4 py-3 text-sm transition-all outline-none placeholder:text-muted-foreground/50 focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-200 hover:shadow-primary/40 hover:brightness-110 disabled:opacity-70"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="h-4 w-4 animate-spin"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                        Enviando...
                      </span>
                    ) : (
                      "Enviar mensaje"
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
