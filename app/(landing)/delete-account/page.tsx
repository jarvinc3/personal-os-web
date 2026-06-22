import { PageHeader } from "@/src/modules/landing/components/PageHeader";
import { siteInfo } from "@/src/modules/landing/data/site-info";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Eliminar cuenta",
  description:
    "Solicita la eliminación de tu cuenta de Personal OS y de todos los datos asociados.",
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

export default function DeleteAccountPage() {
  const deleteRequestSubject = encodeURIComponent(
    "Solicitud de eliminación de cuenta — Personal OS",
  );
  const deleteRequestBody = encodeURIComponent(
    "Hola,\n\nSolicito la eliminación de mi cuenta de Personal OS y de todos los datos asociados.\n\nEmail de la cuenta:\n\nMotivo (opcional):\n",
  );
  const deleteRequestHref = `mailto:${siteInfo.privacyEmail}?subject=${deleteRequestSubject}&body=${deleteRequestBody}`;

  return (
    <div>
      <PageHeader
        label="Legal"
        title="Eliminar tu cuenta"
        description="Solicita la eliminación de tu cuenta y los datos asociados en Personal OS."
        breadcrumb={[
          { href: "/privacy", label: "Política de privacidad" },
          { href: "/delete-account", label: "Eliminar cuenta" },
        ]}
      />

      <main className="mx-auto max-w-3xl px-6 py-16">
        <div className="prose-landing">
          <Section title="Cómo solicitar la eliminación">
            <p>
              Si tienes una cuenta con email y contraseña, también puedes eliminarla desde la
              app en <strong className="text-foreground">Ajustes → Zona de peligro → Eliminar cuenta</strong>.
            </p>
            <p>
              Si tienes una cuenta en <strong className="text-foreground">Personal OS</strong>,
              puedes solicitar en cualquier momento que eliminemos tu cuenta y los datos
              asociados. Sigue estos pasos:
            </p>
            <ol className="list-inside list-decimal space-y-2 pl-2">
              <li>
                Envía un email desde la dirección asociada a tu cuenta a{" "}
                <a
                  href={deleteRequestHref}
                  className="text-primary hover:underline"
                >
                  {siteInfo.privacyEmail}
                </a>
                .
              </li>
              <li>
                Indica claramente que deseas eliminar tu cuenta y confirma el email
                con el que te registraste.
              </li>
              <li>
                Te responderemos para verificar tu identidad y confirmar la solicitud.
              </li>
              <li>
                Una vez procesada, recibirás un email de confirmación cuando la
                eliminación haya finalizado.
              </li>
            </ol>
            <p>
              <a
                href={deleteRequestHref}
                className="inline-flex items-center rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Solicitar eliminación por email
              </a>
            </p>
          </Section>

          <Section title="Datos que se eliminan">
            <p>Al eliminar tu cuenta, borramos de forma permanente:</p>
            <ul className="list-inside list-disc space-y-2 pl-2">
              <li>Datos de perfil (nombre, email, foto, preferencias).</li>
              <li>Datos financieros (cuentas, transacciones, presupuestos, metas).</li>
              <li>Historial de conversaciones y sesiones del agente IA.</li>
              <li>Tokens OAuth de Gmail y fuentes de email conectadas.</li>
              <li>Tokens de notificaciones push y configuración de alertas.</li>
              <li>Cualquier otro dato almacenado en nuestros servidores vinculado a tu cuenta.</li>
            </ul>
          </Section>

          <Section title="Datos que podemos conservar">
            <p>
              Podemos conservar cierta información solo cuando la ley lo exija o sea
              necesario para fines legítimos, por ejemplo:
            </p>
            <ul className="list-inside list-disc space-y-2 pl-2">
              <li>
                Registros mínimos de la solicitud de eliminación (por un período
                limitado, para acreditar el cumplimiento).
              </li>
              <li>
                Datos anonimizados o agregados que ya no permiten identificarte.
              </li>
            </ul>
            <p>
              Consulta la{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                política de privacidad
              </Link>{" "}
              para más detalle sobre retención y derechos.
            </p>
          </Section>

          <Section title="Plazo de eliminación">
            <p>
              Procesamos las solicitudes en un plazo máximo de <strong className="text-foreground">30 días</strong>{" "}
              desde la verificación de identidad. La cuenta deja de estar accesible en cuanto
              iniciamos el proceso; la eliminación completa en bases de datos y copias de
              respaldo puede tardar hasta el plazo indicado.
            </p>
          </Section>

          <Section title="Antes de eliminar tu cuenta">
            <ul className="list-inside list-disc space-y-2 pl-2">
              <li>
                Si conectaste Gmail, puedes revocar el acceso desde la{" "}
                <a
                  href="https://myaccount.google.com/permissions"
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  configuración de permisos de Google
                </a>
                .
              </li>
              <li>
                La eliminación es <strong className="text-foreground">irreversible</strong>.
                No podrás recuperar tus datos después de completarse.
              </li>
              <li>
                Si solo deseas cerrar sesión en un dispositivo, usa &quot;Cerrar sesión&quot; en
                la app; eso no elimina tu cuenta.
              </li>
            </ul>
          </Section>

          <Section title="Contacto">
            <p>
              Para dudas sobre privacidad o el estado de tu solicitud:{" "}
              <a
                href={`mailto:${siteInfo.privacyEmail}`}
                className="text-primary hover:underline"
              >
                {siteInfo.privacyEmail}
              </a>
            </p>
          </Section>
        </div>
      </main>
    </div>
  );
}
