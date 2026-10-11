import { PageHeader } from "@/src/modules/landing/components/PageHeader"

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="mb-10">
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </div>
  )
}

export function TermsScreen() {
  return (
    <div>
      <PageHeader
        label="Legal"
        title="Términos y condiciones"
        description="Última actualización: 30 de mayo de 2026"
        breadcrumb={[{ href: "/terms", label: "Términos y condiciones" }]}
      />

      <main className="mx-auto max-w-3xl px-6 py-16">
        <Section title="1. Aceptación de los términos">
          <p>
            Al registrarte en Personal OS y usar la plataforma, aceptas los
            presentes Términos y Condiciones. Si no estás de acuerdo con alguna
            parte, por favor no uses el servicio.
          </p>
          <p>
            Estos términos se aplican a todas las versiones de la aplicación,
            incluyendo versiones beta, de prueba o de acceso anticipado.
          </p>
        </Section>

        <Section title="2. Descripción del servicio">
          <p>
            Personal OS es una plataforma de gestión personal que permite a los
            usuarios centralizar y automatizar la administración de sus
            finanzas, agenda, proyectos, salud y suscripciones mediante módulos
            interconectados y un agente de inteligencia artificial.
          </p>
          <p>
            Actualmente la plataforma se encuentra en fase de desarrollo y
            acceso beta. Las funcionalidades pueden cambiar, añadirse o
            eliminarse sin previo aviso durante este período.
          </p>
        </Section>

        <Section title="3. Cuentas de usuario">
          <p>
            Para usar Personal OS necesitas crear una cuenta. Eres responsable
            de mantener la confidencialidad de tus credenciales de acceso. En
            caso de acceso no autorizado, notifícanos de inmediato.
          </p>
          <p>
            Debes ser mayor de 18 años para registrarte. Al crear una cuenta,
            garantizas que la información proporcionada es veraz y actualizada.
          </p>
        </Section>

        <Section title="4. Uso aceptable">
          <p>Al usar Personal OS, te comprometes a:</p>
          <ul className="list-inside list-disc space-y-2 pl-2">
            <li>Usar el servicio solo para fines personales y lícitos.</li>
            <li>
              No intentar acceder a cuentas de otros usuarios o sistemas no
              autorizados.
            </li>
            <li>
              No usar el servicio para actividades ilegales, fraudulentas o que
              violen derechos de terceros.
            </li>
            <li>
              No intentar hacer ingeniería inversa, descompilar o alterar el
              software de la plataforma.
            </li>
            <li>
              No sobrecargar intencionalmente los servidores o infraestructura
              de Personal OS.
            </li>
          </ul>
        </Section>

        <Section title="5. Integraciones de terceros (Gmail / OAuth2)">
          <p>
            Si decides conectar tu cuenta de Gmail a Personal OS, autorizas
            expresamente el acceso de solo lectura a tus emails bancarios
            mediante el scope{" "}
            <code className="text-primary">gmail.readonly</code>. Puedes revocar
            este acceso en cualquier momento desde la configuración de tu cuenta
            de Google.
          </p>
          <p>
            Personal OS no es responsable de cambios en las APIs de terceros que
            puedan afectar la funcionalidad de la plataforma.
          </p>
        </Section>

        <Section title="6. Inteligencia artificial">
          <p>
            El agente IA de Personal OS utiliza modelos de lenguaje de terceros
            (Groq, Cerebras, OpenRouter) para procesar conversaciones y ejecutar
            acciones. Al usar el agente IA:
          </p>
          <ul className="list-inside list-disc space-y-2 pl-2">
            <li>
              Reconoces que el agente puede cometer errores y que sus respuestas
              no constituyen asesoramiento financiero, legal o médico.
            </li>
            <li>
              Todas las acciones ejecutadas por el agente quedan registradas en
              un log de auditoría accesible para ti.
            </li>
            <li>
              Para acciones irreversibles (como crear transacciones), el agente
              solicitará confirmación.
            </li>
          </ul>
        </Section>

        <Section title="7. Limitación de responsabilidad">
          <p>
            Personal OS se provee &quot;tal como está&quot; y &quot;según
            disponibilidad&quot;. No garantizamos que el servicio esté
            disponible de forma ininterrumpida o libre de errores.
          </p>
          <p>
            No somos responsables por pérdidas financieras o daños derivados del
            uso de la plataforma, incluyendo errores del agente IA,
            interrupciones del servicio o fallos de integraciones de terceros.
          </p>
          <p>
            La información financiera mostrada en la app proviene de tus emails
            bancarios y es referencial. Siempre verifica los datos directamente
            con tu banco.
          </p>
        </Section>

        <Section title="8. Propiedad intelectual">
          <p>
            Todo el código, diseño, marca y contenido de Personal OS son
            propiedad exclusiva de Personal OS o sus licenciantes. No puedes
            copiar, modificar, distribuir ni crear obras derivadas sin
            autorización expresa por escrito.
          </p>
          <p>
            Los datos que generas en la plataforma (transacciones, notas,
            configuraciones) son de tu propiedad. Personal OS solo los usa para
            proveer el servicio.
          </p>
        </Section>

        <Section title="9. Terminación del servicio">
          <p>
            Puedes solicitar la eliminación de tu cuenta en cualquier momento
            desde{" "}
            <a href="/delete-account" className="text-primary hover:underline">
              personal-os.app/delete-account
            </a>
            . Nos reservamos el derecho de suspender o eliminar cuentas que
            violen estos términos, con o sin previo aviso.
          </p>
          <p>
            También podemos descontinuar el servicio en cualquier momento,
            notificándote con un mínimo de 30 días de anticipación cuando sea
            posible.
          </p>
        </Section>

        <Section title="10. Modificaciones a los términos">
          <p>
            Podemos modificar estos términos en cualquier momento. Los cambios
            materiales serán notificados dentro de la aplicación o por email. El
            uso continuado del servicio tras la notificación implica aceptación
            de los nuevos términos.
          </p>
        </Section>

        <Section title="11. Ley aplicable y jurisdicción">
          <p>
            Estos términos se rigen por las leyes de la República Dominicana.
            Cualquier disputa se resolverá en los tribunales competentes de la
            jurisdicción correspondiente.
          </p>
        </Section>

        <Section title="12. Contacto">
          <p>
            Para preguntas sobre estos términos, contáctanos en:{" "}
            <a
              href="mailto:legal@personal-os.app"
              className="text-primary hover:underline"
            >
              legal@personal-os.app
            </a>
          </p>
        </Section>
      </main>
    </div>
  )
}
