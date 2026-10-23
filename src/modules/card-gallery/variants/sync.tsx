import { SyncCard } from "@/src/modules/card-gallery/provisional/sync-card"
import { galleryMoney } from "@/src/modules/card-gallery/mock/display"
import {
  galleryEmailSource,
  galleryEmailSyncLogError,
  galleryEmailSyncLogOk,
  galleryEmailSyncLogPending,
  galleryMailbox,
  galleryPendingEmail,
} from "@/src/modules/card-gallery/mock/finance"
import type { GalleryVariant } from "@/src/modules/card-gallery/variants/types"
import { FileWarningIcon, HistoryIcon, InboxIcon, MailIcon } from "lucide-react"

/** PROVISIONAL (#272): email, source and sync cards (#286). */
export const syncVariants: readonly GalleryVariant[] = [
  {
    id: "correo-bandeja",
    label: "Bandeja",
    propLabel: "estado correcto",
    height: "≈ 68 px",
    provisional: true,
    render: ({ notifyTap }) => (
      <SyncCard
        icon={InboxIcon}
        title="Bandeja de correo"
        subtitle={`${galleryMailbox.emailAddress} · ${galleryMailbox.sources.length} fuente activa`}
        status="ok"
        value={`${galleryEmailSyncLogOk.emailsScanned} correos`}
        onPress={notifyTap}
      />
    ),
  },
  {
    id: "correo-fuente",
    label: "Fuente",
    propLabel: "estado correcto",
    height: "≈ 68 px",
    provisional: true,
    render: ({ notifyTap }) => (
      <SyncCard
        icon={MailIcon}
        title="Fuente de correo"
        subtitle={`${galleryEmailSource.bankSenderEmail} · ${galleryEmailSource.bankDomain}`}
        status="ok"
        value="Activa"
        onPress={notifyTap}
      />
    ),
  },
  {
    id: "correo-pendiente",
    label: "Correo pendiente",
    propLabel: "estado pendiente",
    height: "≈ 68 px",
    provisional: true,
    render: ({ notifyTap }) => (
      <SyncCard
        icon={FileWarningIcon}
        title="Correo pendiente"
        subtitle={`${galleryPendingEmail.institutionName} · ${galleryMoney("1200.00")}`}
        status="pending"
        value={`••${galleryPendingEmail.lastFourHint ?? "····"}`}
        onPress={notifyTap}
      />
    ),
  },
  {
    id: "correo-sync-ok",
    label: "Historial correcto",
    propLabel: "log.status = SUCCESS",
    height: "≈ 72 px",
    provisional: true,
    render: ({ notifyTap }) => (
      <SyncCard
        icon={HistoryIcon}
        title="Sincronización"
        subtitle={`${galleryEmailSyncLogOk.emailsScanned} correos · ${galleryEmailSyncLogOk.transactionsNew} nuevos`}
        status="ok"
        value="22 oct"
        onPress={notifyTap}
      />
    ),
  },
  {
    id: "correo-sync-error",
    label: "Historial fallido",
    propLabel: "log.status = FAILED",
    height: "≈ 72 px",
    provisional: true,
    render: ({ notifyTap }) => (
      <SyncCard
        icon={HistoryIcon}
        title="Sincronización"
        subtitle={galleryEmailSyncLogError.error ?? "Error de sincronización"}
        status="error"
        value="21 oct"
        onPress={notifyTap}
      />
    ),
  },
  {
    id: "correo-sync-pendiente",
    label: "Historial pendiente",
    propLabel: "log.status = RUNNING",
    height: "≈ 72 px",
    provisional: true,
    render: ({ notifyTap }) => (
      <SyncCard
        icon={HistoryIcon}
        title="Sincronización"
        subtitle={`${galleryEmailSyncLogPending.emailsScanned} correos leídos`}
        status="pending"
        value="Hoy"
        onPress={notifyTap}
      />
    ),
  },
]
