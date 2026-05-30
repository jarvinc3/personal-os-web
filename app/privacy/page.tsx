import { Footer } from "@/src/modules/landing/components/Footer";
import { Navbar } from "@/src/modules/landing/components/Navbar";
import { PageHeader } from "@/src/modules/landing/components/PageHeader";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description:
    "Conoce cómo Personal OS recopila, usa y protege tus datos personales.",
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-10">
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <PageHeader
        label="Legal"
        title="Política de privacidad"
        description="Última actualización: 30 de mayo de 2026"
        breadcrumb={[{ href: "/privacy", label: "Política de privacidad" }]}
      />

      <main className="mx-auto max-w-3xl px-6 py-16">
        <div className="prose-landing">
          <Section title="1. ¿Quiénes somos?">
            <p>
              Personal OS es una aplicación personal multi-módulo diseñada para
              centralizar y automatizar la gestión de las diferentes áreas de tu
              vida cotidiana. En adelante, nos referiremos a nosotros como
              &quot;Personal OS&quot;, &quot;nosotros&quot; o &quot;la plataforma&quot;.
            </p>
            <p>
              Para consultas sobre privacidad, puedes contactarnos en:{" "}
              <a
                href="mailto:privacidad@personal-os.app"
                className="text-primary hover:underline"
              >
                privacidad@personal-os.app
              </a>
            </p>
          </Section>

          <Section title="2. Datos que recopilamos">
            <p>Recopilamos los siguientes tipos de datos:</p>
            <ul className="list-inside list-disc space-y-2 pl-2">
              <li>
                <strong className="text-foreground">Datos de cuenta:</strong>{" "}
                Nombre completo, dirección de email, zona horaria y foto de
                perfil (si usas inicio de sesión con Google).
              </li>
              <li>
                <strong className="text-foreground">Datos de OAuth2:</strong>{" "}
                Si conectas tu cuenta de Gmail, almacenamos tokens de acceso y
                actualización de forma encriptada (AES-256). Solo solicitamos
                permiso de solo lectura (gmail.readonly).
              </li>
              <li>
                <strong className="text-foreground">
                  Datos de transacciones:
                </strong>{" "}
                Información extraída de emails bancarios: monto, comercio,
                fecha, categoría. No almacenamos el cuerpo completo de los
                emails.
              </li>
              <li>
                <strong className="text-foreground">
                  Datos de uso de la IA:
                </strong>{" "}
                Historial de conversaciones con el agente IA, acciones
                ejecutadas y memoria de contexto persistente.
              </li>
              <li>
                <strong className="text-foreground">Preferencias:</strong>{" "}
                Configuraciones de módulos, moneda base, preferencias de
                notificación y tokens de dispositivos push.
              </li>
            </ul>
          </Section>

          <Section title="3. Cómo usamos tus datos">
            <p>Utilizamos tus datos exclusivamente para:</p>
            <ul className="list-inside list-disc space-y-2 pl-2">
              <li>Proveer y mejorar los servicios de Personal OS.</li>
              <li>
                Procesar emails bancarios para detectar y categorizar
                transacciones.
              </li>
              <li>
                Alimentar al agente IA con contexto personalizado para ofrecer
                respuestas y acciones relevantes.
              </li>
              <li>Enviarte notificaciones push y alertas configuradas.</li>
              <li>
                Generar reportes y resúmenes automáticos dentro de la app.
              </li>
            </ul>
            <p>
              <strong className="text-foreground">
                Nunca vendemos ni compartimos tus datos con terceros
              </strong>{" "}
              con fines comerciales o publicitarios.
            </p>
          </Section>

          <Section title="4. Seguridad de tus datos">
            <p>Implementamos las siguientes medidas de seguridad:</p>
            <ul className="list-inside list-disc space-y-2 pl-2">
              <li>
                Encriptación en tránsito con TLS 1.2+ para todas las
                comunicaciones.
              </li>
              <li>
                Encriptación en reposo con AES-256 para tokens OAuth2 y datos
                sensibles.
              </li>
              <li>
                Acceso OAuth2 de solo lectura a Gmail (scope:
                gmail.readonly). Nunca accedemos a otras funciones de tu cuenta
                de Google.
              </li>
              <li>
                Autenticación robusta mediante Supabase Auth con soporte de
                OAuth2 (Google).
              </li>
              <li>
                El ID de mensaje de email (email_message_id) se usa para
                deduplicación y nunca almacenamos el cuerpo completo del email.
              </li>
            </ul>
          </Section>

          <Section title="5. Retención de datos">
            <p>
              Conservamos tus datos mientras tu cuenta esté activa. Si eliminas
              tu cuenta, todos tus datos personales serán eliminados de forma
              permanente de nuestros servidores en un plazo máximo de 30 días,
              excepto cuando la legislación aplicable nos obligue a conservarlos
              por un período mayor.
            </p>
          </Section>

          <Section title="6. Tus derechos">
            <p>Tienes derecho a:</p>
            <ul className="list-inside list-disc space-y-2 pl-2">
              <li>
                <strong className="text-foreground">Acceder</strong> a los
                datos que tenemos sobre ti.
              </li>
              <li>
                <strong className="text-foreground">Rectificar</strong> datos
                incorrectos o desactualizados.
              </li>
              <li>
                <strong className="text-foreground">Eliminar</strong> tu cuenta
                y todos los datos asociados.
              </li>
              <li>
                <strong className="text-foreground">Revocar</strong> el acceso
                a Gmail en cualquier momento desde la configuración de tu cuenta
                de Google.
              </li>
              <li>
                <strong className="text-foreground">Exportar</strong> tus datos
                (funcionalidad en desarrollo).
              </li>
            </ul>
            <p>
              Para ejercer estos derechos, contacta a{" "}
              <a
                href="mailto:privacidad@personal-os.app"
                className="text-primary hover:underline"
              >
                privacidad@personal-os.app
              </a>
              .
            </p>
          </Section>

          <Section title="7. Servicios de terceros">
            <p>Personal OS utiliza los siguientes servicios de terceros:</p>
            <ul className="list-inside list-disc space-y-2 pl-2">
              <li>
                <strong className="text-foreground">Supabase</strong> —
                Almacenamiento de datos y autenticación. Servidores en AWS US
                East.
              </li>
              <li>
                <strong className="text-foreground">
                  Groq / Cerebras / OpenRouter
                </strong>{" "}
                — Modelos de IA para el agente central. Solo se envían los
                mensajes de conversación, sin datos de identificación personal.
              </li>
              <li>
                <strong className="text-foreground">
                  Google Gmail API
                </strong>{" "}
                — Solo con tu autorización explícita y con permisos de solo
                lectura.
              </li>
              <li>
                <strong className="text-foreground">
                  Frankfurter.app
                </strong>{" "}
                — Tasas de cambio de divisas (solo datos de mercado, sin datos
                personales).
              </li>
              <li>
                <strong className="text-foreground">
                  Expo / FCM
                </strong>{" "}
                — Notificaciones push. Solo se almacena el token del dispositivo,
                no datos de contenido.
              </li>
            </ul>
          </Section>

          <Section title="8. Cambios a esta política">
            <p>
              Podemos actualizar esta política de privacidad en cualquier
              momento. Te notificaremos de cambios importantes a través de la
              aplicación o por email. El uso continuado de Personal OS tras la
              notificación implica aceptación de los nuevos términos.
            </p>
          </Section>

          <Section title="9. Contacto">
            <p>
              Para cualquier consulta relacionada con privacidad o protección de
              datos, contáctanos en:{" "}
              <a
                href="mailto:privacidad@personal-os.app"
                className="text-primary hover:underline"
              >
                privacidad@personal-os.app
              </a>
            </p>
          </Section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
