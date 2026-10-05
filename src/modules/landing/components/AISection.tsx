"use client";

import { motion } from "motion/react";
import { landingContent } from "../data/site-info";

export function AISection() {
  return (
    <section
      id="ai"
      className="overflow-hidden relative px-6 py-24"
    >
      {/* Decorative lines */}
      <div className="absolute top-0 left-0 w-full">
        <div className="mx-auto w-full max-w-7xl h-px bg-border" />
      </div>
      <div className="absolute bottom-0 left-0 w-full">
        <div className="mx-auto w-full max-w-7xl h-px bg-border" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-16 text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4 }}
            className="mb-4 inline-block rounded-full border-2 border-text bg-accent px-3 py-1 text-xs font-bold text-primary shadow-[2px_2px_0px_0px_#111827]"
          >
            {landingContent.ai.badge}
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl"
          >
            {landingContent.ai.titleStart}{" "}
            <span className="text-primary">
              {landingContent.ai.titleHighlight}
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg"
          >
            {landingContent.ai.description}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Capabilities */}
          <div className="space-y-4">
            {landingContent.ai.capabilities.map((cap, i) => (
              <motion.div
                key={cap.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="group flex gap-4 rounded-2xl border-2 border-transparent p-4 transition-all hover:border-text hover:bg-white hover:shadow-[4px_4px_0px_0px_#111827]"
              >
                <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-text bg-accent text-xl shadow-[2px_2px_0px_0px_#111827] transition-colors">
                  {cap.icon}
                </div>
                <div>
                  <h3 className="font-bold text-text">{cap.title}</h3>
                  <p className="mt-1 text-sm font-medium text-muted-foreground">
                    {cap.description}
                  </p>
                  <p className="mt-2 text-xs italic font-semibold text-primary/80">
                    {cap.example}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Chat demo */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="relative mx-auto mt-12 max-w-md lg:mt-0 lg:max-w-none">
              <div className="overflow-hidden rounded-3xl border-2 border-text bg-white shadow-[8px_8px_0px_0px_#111827]">
                {/* Chat Header */}
                <div className="flex gap-3 items-center p-4 border-b-2 border-text bg-neutral-100">
                  <div className="flex justify-center items-center w-10 h-10 rounded-full border-2 border-text bg-primary/20">
                    <span className="text-sm">🤖</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{landingContent.ai.chatDemo.agentName}</p>
                    <div className="flex items-center gap-1.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      <p className="text-xs text-muted-foreground">{landingContent.ai.chatDemo.status}</p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="p-5 space-y-4">
                  {landingContent.ai.chatDemo.messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl border-2 border-text p-3 text-sm shadow-[2px_2px_0px_0px_#111827] ${msg.role === "user"
                            ? "bg-primary text-primary-foreground rounded-tr-sm"
                            : "bg-neutral-100 text-text rounded-tl-sm"
                          }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}

                  {/* Typing indicator */}
                  <div className="flex justify-start">
                    <div className="flex items-center gap-1 rounded-2xl border-2 border-text bg-neutral-100 px-4 py-3 shadow-[2px_2px_0px_0px_#111827]">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Input */}
                <div className="p-4 bg-white border-t-2 border-text">
                  <div className="flex items-center gap-3 rounded-xl border-2 border-text bg-neutral-100 px-4 py-2.5 shadow-[2px_2px_0px_0px_#111827] focus-within:translate-x-0.5 focus-within:translate-y-0.5 focus-within:shadow-none transition-all">
                    <input
                      type="text"
                      placeholder={landingContent.ai.chatDemo.placeholder}
                      className="flex-1 text-xs font-bold bg-transparent outline-none text-text placeholder:text-muted-foreground"
                      readOnly
                    />
                    <button
                      type="button"
                      title="Enviar mensaje"
                      aria-label="Enviar mensaje"
                      className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-text bg-primary text-primary-foreground shadow-[1px_1px_0px_0px_#111827] transition-colors hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 12h14M12 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Cost note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.4 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-8 rounded-2xl border-2 border-text bg-white p-6 text-center shadow-[4px_4px_0px_0px_#111827]"
        >
          {landingContent.ai.costNote.stats.map((stat, i) => (
            <div key={stat.label} className="flex gap-8 items-center">
              <div>
                <p className="text-2xl font-bold text-primary">{stat.value}</p>
                <p className="text-xs font-bold text-text">{stat.label}</p>
              </div>
              {i < landingContent.ai.costNote.stats.length - 1 && (
                <div className="hidden h-8 w-0.5 bg-border sm:block" />
              )}
            </div>
          ))}
          <div className="hidden h-8 w-0.5 bg-border sm:block" />
          <div className="max-w-xs">
            <p className="text-xs font-medium text-muted-foreground">
              {landingContent.ai.costNote.description}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
