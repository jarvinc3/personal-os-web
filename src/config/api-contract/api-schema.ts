/**
 * Tipos del API de Personal OS generados por `pnpm api:generate` desde
 * openapi/swagger-spec.json. No edites este archivo: cambia el contrato en
 * personal-os-back, ejecuta `pnpm api:contract` y regenera.
 */

export type paths = {
    "/api/health": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Sondeo de vida */
        get: operations["HealthController_liveness"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/health/startup": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Startup probe (database, JWKS, optional Redis). Public; response omits dependency details. */
        get: operations["HealthController_startup"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/health/ready": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Readiness probe (database, JWKS, optional Redis). Public for load balancers; response omits dependency details. */
        get: operations["HealthController_readiness"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/users/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Obtiene el perfil del usuario autenticado */
        get: operations["UsersController_getMyProfile"];
        put?: never;
        post?: never;
        /** Borra la cuenta del usuario y sus datos asociados */
        delete: operations["UsersController_deleteMyAccount"];
        options?: never;
        head?: never;
        /** Actualiza el perfil del usuario autenticado */
        patch: operations["UsersController_updateMyProfile"];
        trace?: never;
    };
    "/api/users/me/release-notes-seen": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** Marca la versión de Novedades que el usuario ya vio */
        patch: operations["UsersController_markReleaseNotesSeen"];
        trace?: never;
    };
    "/api/users/me/modules/{slug}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** Actualiza la configuración de un módulo del usuario */
        patch: operations["UsersController_updateMyModuleConfig"];
        trace?: never;
    };
    "/api/users/me/data/branches": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Ramas de datos por app, con su conteo y lo que arrastran */
        get: operations["UsersController_myDataBranches"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/users/me/data/wipe": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Borra las ramas de datos elegidas sin cerrar la cuenta */
        post: operations["UsersController_wipeMyData"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/auth/session": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Obtiene el contexto de la sesión autenticada */
        get: operations["AuthController_session"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/ai/admin/roles": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["AiRolesController_list"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/ai/admin/roles/{userId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch: operations["AiRolesController_update"];
        trace?: never;
    };
    "/api/ai/preferences/consent": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["AiConsentController_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch: operations["AiConsentController_update"];
        trace?: never;
    };
    "/api/intelligence": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["AiIntelligenceController_dashboard"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/intelligence/messages": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["AiIntelligenceController_messages"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/intelligence/messages/{messageId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["AiIntelligenceController_message"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/intelligence/email/connect": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AiIntelligenceController_connect"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/intelligence/email/sync": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AiIntelligenceController_syncNow"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/intelligence/email/reset": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AiIntelligenceController_resetEmailCorpus"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/intelligence/email/oauth/callback": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["AiIntelligenceController_callback"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/intelligence/email/oauth/diagnostics": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["AiIntelligenceController_diagnostics"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/intelligence/dataset": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["AiEvidenceController_dataset"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/intelligence/review-queue": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["AiEvidenceController_reviewQueue"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/intelligence/messages/{messageId}/verifications": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AiEvidenceController_verifyMessage"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/intelligence/runs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["AiEvidenceController_runs"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/intelligence/knowledge": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Explorar conocimiento USER propio y GLOBAL estable */
        get: operations["AiKnowledgeController_list"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/intelligence/knowledge/admin/queue": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Cola administrativa de conocimiento GLOBAL */
        get: operations["AiKnowledgeController_adminQueue"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/intelligence/knowledge/admin/rebuild": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Reconstruir la proyección desde un corte REPEATABLE READ */
        post: operations["AiKnowledgeController_rebuild"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/intelligence/knowledge/admin/{knowledgeId}/revert": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Revertir una promoción GLOBAL con evidencia ADMIN */
        post: operations["AiKnowledgeController_revert"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/intelligence/knowledge/me/export": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Exportar los datos AI y correo propios en JSON */
        get: operations["AiKnowledgeController_export"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/intelligence/knowledge/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** Borrar inmediatamente los datos AI propios y dejar lápidas estructurales elegibles */
        delete: operations["AiKnowledgeController_remove"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/currencies": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Lista las monedas ISO desde tasas en caché o exchangerate.host */
        get: operations["CurrenciesController_list"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/exchange-rates": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Tasas de mercado de las monedas cotizadas en una moneda base */
        get: operations["CurrenciesController_exchangeRates"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/base-currency": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Cambia la moneda base y reconvierte los montos base guardados */
        post: operations["CurrenciesController_setBaseCurrency"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/accounts": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Lista las cuentas de finanzas (cursor) */
        get: operations["AccountsController_list"];
        put?: never;
        post: operations["AccountsController_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/accounts/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["AccountsController_get"];
        put?: never;
        post?: never;
        /** Borra de forma definitiva la cuenta, sus tarjetas de débito y sus movimientos */
        delete: operations["AccountsController_remove"];
        options?: never;
        head?: never;
        patch: operations["AccountsController_update"];
        trace?: never;
    };
    "/api/finance/accounts/{id}/history": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Cronología de la cuenta: ajustes y cambios de límite */
        get: operations["AccountsController_getHistory"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/accounts/{id}/restore": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Deshace un borrado desde el journal */
        post: operations["AccountsController_restore"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/institutions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Lista las instituciones de finanzas (cursor) */
        get: operations["InstitutionsController_list"];
        put?: never;
        post: operations["InstitutionsController_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/institutions/{id}/logo": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Sube un logo de institución personalizado */
        post: operations["InstitutionsController_uploadLogo"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/institutions/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** Borra de forma definitiva la institución y sus dependientes */
        delete: operations["InstitutionsController_remove"];
        options?: never;
        head?: never;
        patch: operations["InstitutionsController_update"];
        trace?: never;
    };
    "/api/finance/institutions/{id}/restore": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Deshace un borrado desde el journal */
        post: operations["InstitutionsController_restore"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/cards": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Lista las tarjetas de finanzas (cursor) */
        get: operations["CardsController_list"];
        put?: never;
        post: operations["CardsController_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/cards/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["CardsController_get"];
        put?: never;
        post?: never;
        /** Borra de forma definitiva la tarjeta y sus movimientos */
        delete: operations["CardsController_remove"];
        options?: never;
        head?: never;
        patch: operations["CardsController_update"];
        trace?: never;
    };
    "/api/finance/cards/{id}/history": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Cronología de la tarjeta: ajustes y cambios de límite */
        get: operations["CardsController_getHistory"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/cards/{id}/restore": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Deshace un borrado desde el journal */
        post: operations["CardsController_restore"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/cards/{id}/balances/credit-limit": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Actualiza el límite de una tarjeta sin cambiar su saldo */
        post: operations["CardsController_updateCreditLimit"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/cards/{id}/balances": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["CardsController_updateBalance"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/cards/{id}/balances/{currency}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** Borra una moneda guardada de una tarjeta */
        delete: operations["CardsController_deleteBalance"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/categories": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["CategoriesController_list"];
        put?: never;
        post: operations["CategoriesController_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/categories/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: operations["CategoriesController_remove"];
        options?: never;
        head?: never;
        patch: operations["CategoriesController_update"];
        trace?: never;
    };
    "/api/finance/categories/{id}/restore": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Deshace un borrado desde el journal */
        post: operations["CategoriesController_restore"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/transactions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Lista las transacciones de finanzas */
        get: operations["TransactionsController_list"];
        put?: never;
        /** Crea una transacción DEBIT o CREDIT */
        post: operations["TransactionsController_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/balance-adjustments": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Fija el saldo de una cuenta o tarjeta con un ajuste */
        post: operations["TransactionsController_adjust"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/transactions/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Obtiene una transacción por id */
        get: operations["TransactionsController_get"];
        put?: never;
        post?: never;
        /** Borra una transacción manual */
        delete: operations["TransactionsController_remove"];
        options?: never;
        head?: never;
        /** Actualiza una transacción */
        patch: operations["TransactionsController_update"];
        trace?: never;
    };
    "/api/finance/transactions/{id}/restore": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Deshace un borrado desde el journal */
        post: operations["TransactionsController_restore"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/transactions/{id}/confirm": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Confirma una transacción PENDING */
        post: operations["TransactionsController_confirm"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/transactions/{id}/unconfirm": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Devuelve una transacción CONFIRMED a PENDING para editarla */
        post: operations["TransactionsController_unconfirm"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/transactions/{id}/reverse": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Revierte una transacción CONFIRMED (conserva la fila como REVERSED) */
        post: operations["TransactionsController_reverse"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/transactions/{id}/merge": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Borra un posible duplicado y conserva el otro */
        post: operations["TransactionsController_merge"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/transactions/{id}/not-duplicate": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Quita la marca de posible duplicado */
        post: operations["TransactionsController_notDuplicate"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/transfers": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Crea una transferencia entre dos cuentas */
        post: operations["TransfersController_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/transfers/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** Borra la transferencia completa por el id de uno de sus movimientos */
        delete: operations["TransfersController_remove"];
        options?: never;
        head?: never;
        /** Reemplaza ambos movimientos de una transferencia por el id de uno */
        patch: operations["TransfersController_update"];
        trace?: never;
    };
    "/api/finance/transfers/{id}/unconfirm": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Devuelve todos los movimientos de una transferencia a PENDING para editarla */
        post: operations["TransfersController_unconfirm"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/transfers/{id}/confirm": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Confirma todos los movimientos pendientes de una transferencia */
        post: operations["TransfersController_confirm"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/transfers/{id}/reverse": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Reversa todos los movimientos de una transferencia completada */
        post: operations["TransfersController_reverse"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/card-payments": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Paga una tarjeta de crédito desde una cuenta */
        post: operations["CardPaymentsController_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/card-payments/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** Borra el pago de tarjeta completo */
        delete: operations["CardPaymentsController_remove"];
        options?: never;
        head?: never;
        /** Edita un pago de tarjeta pendiente */
        patch: operations["CardPaymentsController_update"];
        trace?: never;
    };
    "/api/finance/card-payments/{id}/unconfirm": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Devuelve todos los movimientos de un pago de tarjeta a PENDING */
        post: operations["CardPaymentsController_unconfirm"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/card-payments/{id}/confirm": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Confirma todos los movimientos pendientes de un pago de tarjeta */
        post: operations["CardPaymentsController_confirm"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/merchants": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Lista los comercios con su gasto del mes */
        get: operations["MerchantsController_list"];
        put?: never;
        /** Crea un comercio con nombre, categoría y alias */
        post: operations["MerchantsController_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/merchants/suggest": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Mejor comercio conocido para un nombre escrito */
        get: operations["MerchantsController_suggest"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/merchants/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Detalle del comercio */
        get: operations["MerchantsController_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** Renombra un comercio o define su categoría y logo */
        patch: operations["MerchantsController_update"];
        trace?: never;
    };
    "/api/finance/merchants/{id}/duplicates": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Comercios que parecen el mismo, con el motivo */
        get: operations["MerchantsController_duplicates"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/merchants/{id}/duplicates/{otherId}/dismiss": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Marca un par de comercios como «no es duplicado» */
        post: operations["MerchantsController_dismissDuplicate"];
        /** Revierte el descarte de un par de comercios */
        delete: operations["MerchantsController_undoDismissDuplicate"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/merchants/{id}/merge": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Mueve los movimientos de un comercio a otro */
        post: operations["MerchantsController_merge"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/merchants/{id}/logo": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Sube un logo de comercio personalizado */
        post: operations["MerchantsController_uploadLogo"];
        /** Quita el logo propio de un comercio */
        delete: operations["MerchantsController_deleteLogo"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/brands/search": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["LogosController_search"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/subscriptions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Lista las suscripciones gestionadas */
        get: operations["SubscriptionsController_list"];
        put?: never;
        /** Crea una suscripción */
        post: operations["SubscriptionsController_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/subscriptions/summary": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Costo mensual y anual, cantidad activa y próximos */
        get: operations["SubscriptionsController_summary"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/subscriptions/breakdown": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Costo por categoría, instrumento o moneda */
        get: operations["SubscriptionsController_breakdown"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/subscriptions/upcoming": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Cargos previstos en una ventana de fechas */
        get: operations["SubscriptionsController_upcoming"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/subscriptions/alerts": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Alertas activas de suscripciones */
        get: operations["SubscriptionsController_alerts"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/subscriptions/alerts/dismiss-all": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Descarta todas las alertas activas */
        post: operations["SubscriptionsController_dismissAllAlerts"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/subscriptions/alerts/dismiss": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Descarta una alerta para su ocurrencia */
        post: operations["SubscriptionsController_dismissAlert"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/subscriptions/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Detalle de la suscripción */
        get: operations["SubscriptionsController_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** Edita una suscripción */
        patch: operations["SubscriptionsController_update"];
        trace?: never;
    };
    "/api/finance/subscriptions/{id}/pause": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Pausa una suscripción */
        post: operations["SubscriptionsController_pause"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/subscriptions/{id}/resume": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Reanuda una suscripción pausada */
        post: operations["SubscriptionsController_resume"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/subscriptions/{id}/cancel": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Cancela una suscripción */
        post: operations["SubscriptionsController_cancel"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/subscriptions/{id}/payments": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Historial de pagos */
        get: operations["SubscriptionsController_listPayments"];
        put?: never;
        /** Registra un pago manual */
        post: operations["SubscriptionsController_createPayment"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/subscriptions/{id}/logo": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Sube un logo de suscripción personalizado */
        post: operations["SubscriptionsController_uploadLogo"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/cards/{id}/statements": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Estados de facturación de una tarjeta de crédito */
        get: operations["CardStatementsController_list"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/cards/{id}/statements/{statementId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Detalle del estado de cuenta con movimientos y pagos */
        get: operations["CardStatementsController_detail"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** Edita el mínimo, el saldo de cierre o el vencimiento del estado de cuenta */
        patch: operations["CardStatementsController_update"];
        trace?: never;
    };
    "/api/finance/cards/{id}/statements/import": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Sube y analiza el PDF del estado de cuenta de una tarjeta */
        post: operations["StatementImportsController_importCardStatement"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/accounts/{id}/statements/import": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Sube y analiza el PDF del estado de cuenta de una cuenta */
        post: operations["StatementImportsController_importAccountStatement"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/statement-imports/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Estado, encabezado y conciliación de la importación */
        get: operations["StatementImportsController_get"];
        put?: never;
        post?: never;
        /** Descarta una importación de estado de cuenta */
        delete: operations["StatementImportsController_discard"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/statement-imports/{id}/lines/{lineId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** Cambia la decisión de una línea o su movimiento asociado */
        patch: operations["StatementImportsController_updateLine"];
        trace?: never;
    };
    "/api/finance/statement-imports/{id}/apply": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Crea las líneas seleccionadas y cierra el periodo */
        post: operations["StatementImportsController_apply"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/budgets": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Lista los presupuestos (cursor, límite por defecto 20, máximo 100) */
        get: operations["BudgetsController_list"];
        put?: never;
        post: operations["BudgetsController_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/budgets/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Obtiene un presupuesto por id */
        get: operations["BudgetsController_get"];
        put?: never;
        post?: never;
        delete: operations["BudgetsController_remove"];
        options?: never;
        head?: never;
        patch: operations["BudgetsController_update"];
        trace?: never;
    };
    "/api/finance/budgets/{id}/transactions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Movimientos que cuentan para el presupuesto, con sus subcategorías */
        get: operations["BudgetsController_transactions"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/budgets/{id}/restore": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Deshace un borrado desde el journal */
        post: operations["BudgetsController_restore"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/savings-goals": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Lista las metas de ahorro (cursor) */
        get: operations["SavingsGoalsController_list"];
        put?: never;
        post: operations["SavingsGoalsController_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/savings-goals/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Obtiene una meta de ahorro por id */
        get: operations["SavingsGoalsController_get"];
        put?: never;
        post?: never;
        delete: operations["SavingsGoalsController_remove"];
        options?: never;
        head?: never;
        patch: operations["SavingsGoalsController_update"];
        trace?: never;
    };
    "/api/finance/savings-goals/{id}/allocations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Asignaciones de una meta de ahorro, más recientes primero */
        get: operations["SavingsGoalsController_listAllocations"];
        put?: never;
        /** Reserva dinero para una meta; no mueve dinero */
        post: operations["SavingsGoalsController_addAllocation"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/savings-goals/{id}/allocations/{allocationId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** Elimina una asignación y recalcula el saldo */
        delete: operations["SavingsGoalsController_removeAllocation"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/savings-goals/{id}/contributions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Alias deprecado de las asignaciones
         * @deprecated
         */
        get: operations["SavingsGoalsController_listContributions"];
        put?: never;
        /**
         * Alias deprecado de las asignaciones
         * @deprecated
         */
        post: operations["SavingsGoalsController_addContribution"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/savings-goals/{id}/contributions/{allocationId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /**
         * Alias deprecado del borrado de asignaciones
         * @deprecated
         */
        delete: operations["SavingsGoalsController_removeContribution"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/savings-goals/{id}/restore": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Deshace un borrado desde el journal */
        post: operations["SavingsGoalsController_restore"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/loans": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Lista los préstamos activos (cursor) */
        get: operations["LoansController_list"];
        put?: never;
        post: operations["LoansController_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/loans/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Obtiene un préstamo por id */
        get: operations["LoansController_get"];
        put?: never;
        post?: never;
        /** Borra un préstamo de forma definitiva */
        delete: operations["LoansController_remove"];
        options?: never;
        head?: never;
        patch: operations["LoansController_update"];
        trace?: never;
    };
    "/api/finance/loans/{id}/installments": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Cuotas de un préstamo, más antiguas primero (paginado por cursor) */
        get: operations["LoansController_listInstallments"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/loans/{id}/schedule": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Proyección completa de cuotas de un préstamo */
        get: operations["LoansController_schedule"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/loans/{id}/pay-next-installment": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Paga la cuota impaga más antigua y devuelve el desglose */
        post: operations["LoansController_payNext"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/loans/{id}/prepayments": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Paga un prepago de capital y reconstruye el calendario */
        post: operations["LoansController_prepay"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/loans/{id}/prepayments/preview": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Vista previa de un prepago sin guardar */
        get: operations["LoansController_preview"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/loans/{id}/restore": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Deshace un borrado desde el journal */
        post: operations["LoansController_restore"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/receivables": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Lista los cobros (cursor) */
        get: operations["ReceivablesController_list"];
        put?: never;
        post: operations["ReceivablesController_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/receivables/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Obtiene un cobro por id */
        get: operations["ReceivablesController_get"];
        put?: never;
        post?: never;
        /** Borra un cobro de forma definitiva */
        delete: operations["ReceivablesController_remove"];
        options?: never;
        head?: never;
        patch: operations["ReceivablesController_update"];
        trace?: never;
    };
    "/api/finance/receivables/{id}/payments": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Pagos cobrados de un cobro, más recientes primero */
        get: operations["ReceivablesController_listPayments"];
        put?: never;
        /** Cobra un pago y registra el ingreso en la cuenta indicada */
        post: operations["ReceivablesController_addPayment"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/receivables/{id}/credit": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Aplica el saldo a favor de un cobro a otro */
        post: operations["ReceivablesController_applyCreditBalance"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/receivables/{id}/write-off": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Da de baja un cobro incobrable */
        post: operations["ReceivablesController_writeOff"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/receivables/{id}/restore": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Deshace un borrado desde el journal */
        post: operations["ReceivablesController_restore"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/transactions/{id}/link": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Link an existing movement to a loan instalment, a collection or a goal */
        post: operations["TransactionLinksController_create"];
        /** Quita el vínculo de planificación de un movimiento y deshace su efecto */
        delete: operations["TransactionLinksController_remove"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/balance-sheet": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Posición financiera actual en la moneda base
         * @description Snapshot of active accounts, pending receivables, credit-card utilization and loan balances. Receivables overdue more than 90 days are listed as doubtful and do not add to net worth. Both global and each institution expose native byCurrency totals; the breakdown groups one line per product by currency. Missing rates or credit limits return status INCOMPLETE with null netWorth.
         */
        get: operations["BalanceSheetController_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/entities/lookup": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Resuelve entidades de Finanzas por referencia, en lote
         * @description Returns the same public representation as each entity endpoint, in the same order as the references. A reference the user cannot see, or that no longer exists, comes back as null in its position. Read-only: it does not record activity.
         */
        post: operations["EntitiesController_lookupEntities"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/analytics/weekly-summary": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["AnalyticsController_weeklySummaryReport"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/analytics/summary": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["AnalyticsController_summary"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/analytics/spending-by-category": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["AnalyticsController_spendingByCategory"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/analytics/budget-status": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["AnalyticsController_budgetStatus"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/analytics/spending-over-time": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["AnalyticsController_spendingOverTime"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/recurring": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Lista los patrones recurrentes (sugeridos y confirmados) */
        get: operations["RecurringController_list"];
        put?: never;
        /** Crea un cargo recurrente a mano */
        post: operations["RecurringController_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/recurring/upcoming": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Cargos confirmados previstos en los próximos N días */
        get: operations["RecurringController_upcoming"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/recurring/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** Confirma, descarta o edita un patrón recurrente */
        patch: operations["RecurringController_update"];
        trace?: never;
    };
    "/api/finance/reconciliations/preview": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Vista previa de un cierre: saldo, diferencia y sugerencia */
        post: operations["ReconciliationsController_preview"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/reconciliations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Historial de conciliaciones de una cuenta o tarjeta */
        get: operations["ReconciliationsController_list"];
        put?: never;
        /** Cierra un producto y crea sus ajustes */
        post: operations["ReconciliationsController_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/reconciliations/status": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Productos conciliados y pendientes de un mes */
        get: operations["ReconciliationsController_status"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/reconciliations/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Detalle de la conciliación */
        get: operations["ReconciliationsController_get"];
        put?: never;
        post?: never;
        /** Borra el último cierre de un producto */
        delete: operations["ReconciliationsController_remove"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/reconciliations/{id}/restore": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Deshace el borrado de una conciliación */
        post: operations["ReconciliationsController_restore"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/bank-charges": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Cargos bancarios por mes, institución y tipo */
        get: operations["BankChargesController_bankCharges"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/integrity/check": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Compara los saldos guardados con los movimientos confirmados */
        get: operations["IntegrityController_check"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/integrity/recalculate": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Corrige un saldo desviado desde sus movimientos */
        post: operations["IntegrityController_recalculate"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/quick-entry/parse": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Convierte una frase rápida en un borrador de transacción (nunca guarda) */
        post: operations["QuickEntryController_parse"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/receivable-shares": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Lista los links del usuario, activos y revocados */
        get: operations["ReceivableSharesController_list"];
        put?: never;
        /** Crea un link público de solo lectura */
        post: operations["ReceivableSharesController_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/receivable-shares/{id}/revoke": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** Revoca el link; deja de resolver */
        patch: operations["ReceivableSharesController_revoke"];
        trace?: never;
    };
    "/api/finance/receivable-shares/{id}/regenerate": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** Rota el token y reactiva el link */
        patch: operations["ReceivableSharesController_regenerate"];
        trace?: never;
    };
    "/api/public/receivable-shares/{token}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Cobros compartidos por link público, en solo lectura */
        get: operations["PublicReceivableSharesController_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/recycle-bin": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Lista los registros archivados y los borrados pendientes (borrados paginados) */
        get: operations["RecycleBinController_list"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/notifications": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Lista las notificaciones del usuario */
        get: operations["NotificationsController_list"];
        put?: never;
        /** Crea una notificación para el usuario */
        post: operations["NotificationsController_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/notifications/unread-count": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Cantidad de notificaciones sin leer */
        get: operations["NotificationsController_unreadCount"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/notifications/read-all": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** Marca todas las notificaciones como leídas */
        patch: operations["NotificationsController_markAllAsRead"];
        trace?: never;
    };
    "/api/notifications/{id}/read": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** Marca una notificación como leída */
        patch: operations["NotificationsController_markAsRead"];
        trace?: never;
    };
    "/api/notifications/push-tokens": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Registra un token push del usuario */
        post: operations["NotificationsController_registerPushToken"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/notifications/push-tokens/{token}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** Desactiva un token push del usuario */
        delete: operations["NotificationsController_deactivatePushToken"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/notifications/push-tokens/{token}/deactivate": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Alias deprecado de DELETE push-tokens/:token
         * @deprecated
         */
        patch: operations["NotificationsController_deactivatePushTokenLegacy"];
        trace?: never;
    };
};
export type webhooks = Record<string, never>;
export type components = {
    schemas: {
        UpdateProfileDto: {
            fullName?: string;
            timezone?: string;
            locale?: string;
            avatarUrl?: Record<string, never> | null;
            preferences?: Record<string, never>;
        };
        MarkReleaseNotesSeenDto: {
            /**
             * @description Versión de Novedades vista
             * @example 0.20.0
             */
            version: string;
        };
        UpdateModuleConfigDto: {
            /** @description Partial module config (merged with defaults) */
            config?: Record<string, never>;
            /** @description Enable or disable the module for this user */
            isEnabled?: boolean;
        };
        WipeUserDataDto: {
            /**
             * @description Data branches to wipe, as returned by GET /users/me/data/branches
             * @example [
             *       "finance.transactions",
             *       "notifications.history"
             *     ]
             */
            branches: string[];
            /** @description Branch counts the user saw. A different count answers 409 without deleting anything. */
            expectedCounts?: {
                [key: string]: number;
            };
            /** @description Institution whose accounts to zero and whose credit cards to restore to their limit. Applies only to finance.balances. */
            balanceInstitutionId?: string;
        };
        UpdateAiRoleDto: Record<string, never>;
        UpdateConsentDto: Record<string, never>;
        ResetEmailCorpusDto: Record<string, never>;
        HumanVerificationTransactionDto: {
            /** @enum {string} */
            kind?: "TRANSACTION" | "PENDING" | "NOT_TRANSACTION";
            amount?: number;
            /** @example DOP */
            currency?: string;
            /** Format: date-time */
            transactionDate?: string;
            /** @enum {string} */
            direction?: "DEBIT" | "CREDIT" | "TRANSFER";
            merchant?: string;
            bankReference?: string;
            last4?: string;
        };
        CreateHumanVerificationDto: {
            /** @enum {string} */
            semanticType?: "FIN_TRANSACTION" | "PURCHASE_RECEIPT" | "SUBSCRIPTION_BILLING" | "FIN_STATEMENT_NOTICE" | "FIN_ACCOUNT_NOTICE" | "SECURITY_OTP" | "SECURITY_ALERT" | "TECH_NOTIFICATION" | "JOB" | "CALENDAR_EVENT" | "MARKETING" | "SOCIAL" | "OTHER";
            routes?: ("FINANCE" | "SUBSCRIPTIONS" | "CALENDAR" | "SECURITY")[];
            transaction?: components["schemas"]["HumanVerificationTransactionDto"];
        };
        KnowledgeTransactionDto: {
            /**
             * @description Único campo de transacción que se publica en GLOBAL; el resto es privado de USER.
             * @enum {string}
             */
            kind?: "TRANSACTION" | "PENDING" | "NOT_TRANSACTION";
            amount?: number;
            /** @example DOP */
            currency?: string;
            /** Format: date-time */
            transactionDate?: string;
            /** @enum {string} */
            direction?: "DEBIT" | "CREDIT" | "TRANSFER";
            merchant?: string;
            bankReference?: string;
            /** @example 4821 */
            last4?: string;
        };
        KnowledgeLabelDto: {
            relevance?: boolean;
            /** @enum {string} */
            semanticType?: "FIN_TRANSACTION" | "PURCHASE_RECEIPT" | "SUBSCRIPTION_BILLING" | "FIN_STATEMENT_NOTICE" | "FIN_ACCOUNT_NOTICE" | "SECURITY_OTP" | "SECURITY_ALERT" | "TECH_NOTIFICATION" | "JOB" | "CALENDAR_EVENT" | "MARKETING" | "SOCIAL" | "OTHER";
            routes?: ("FINANCE" | "SUBSCRIPTIONS" | "CALENDAR" | "SECURITY")[];
            transaction?: components["schemas"]["KnowledgeTransactionDto"];
        };
        KnowledgePayloadDto: {
            label: components["schemas"]["KnowledgeLabelDto"];
        };
        KnowledgeItemDto: {
            id: string;
            /** @enum {string} */
            scope: "GLOBAL" | "USER";
            /** @description Solo en USER; GLOBAL siempre devuelve null. */
            userId: string | null;
            /** @enum {string} */
            knowledgeType: "EMAIL_SENDER" | "EMAIL_DOMAIN" | "EMAIL_TEMPLATE" | "ENTITY" | "RELATION" | "USER_MAPPING";
            knowledgeKey: string;
            /** @enum {string} */
            state: "OBSERVED" | "STABLE" | "REVIEW_REQUIRED" | "BLOCKED";
            payload: components["schemas"]["KnowledgePayloadDto"];
            messagesSeen: number;
            rejectedMessages: number;
            distinctUsers: number;
            humanVerifiedCount: number;
            /** @enum {string|null} */
            promotedBy: "AUTO" | "CONTRIBUTOR" | "ADMIN" | null;
            projectorVersion: string;
            policyVersion: string;
            normalizerVersion: string;
            sanitizerVersion: string;
            /** Format: date-time */
            firstSeenAt: string;
            /** Format: date-time */
            lastSeenAt: string;
            /** Format: date-time */
            updatedAt: string;
        };
        KnowledgeExplorerDto: {
            personal: components["schemas"]["KnowledgeItemDto"][];
            global: components["schemas"]["KnowledgeItemDto"][];
        };
        KnowledgeRebuildDto: {
            runId: string;
            /**
             * @description Secuencia BigInt como string decimal.
             * @example 42
             */
            observationSequence: string;
            /**
             * @description Secuencia BigInt como string decimal.
             * @example 42
             */
            verificationSequence: string;
            /**
             * @description Secuencia BigInt como string decimal.
             * @example 7
             */
            consentRevision: string;
            items: number;
        };
        ConfirmAiDataDeletionDto: {
            /** @example true */
            confirmed: boolean;
        };
        KnowledgeDeletionDto: {
            /** @example true */
            deleted: boolean;
            deletedMessages: number;
            detachedVerifications: number;
            detachedObservations: number;
        };
        ChangeBaseCurrencyDto: {
            /**
             * @description New ISO-3 base currency
             * @example USD
             */
            baseCurrency: string;
        };
        CreateAccountDto: {
            /** @description Required for CHECKING, SAVINGS, and INVESTMENT. Optional for CASH. */
            institutionId?: string;
            name: string;
            /** @enum {string} */
            type: "CHECKING" | "SAVINGS" | "CASH" | "INVESTMENT";
            /**
             * @description Required for CHECKING, SAVINGS, and INVESTMENT. Must be omitted for CASH.
             * @example 001122335678
             */
            accountNumber?: string;
            /**
             * @default DOP
             * @example DOP
             */
            currency: string;
            color?: string;
            /** @description When true, this account is the fallback ledger target for emails from this institution that have no account digits. */
            isDefaultForInstitution?: boolean;
        };
        UpdateAccountDto: {
            /** @description Required for CHECKING, SAVINGS, and INVESTMENT. Optional for CASH. */
            institutionId?: string;
            name?: string;
            /** @enum {string} */
            type?: "CHECKING" | "SAVINGS" | "CASH" | "INVESTMENT";
            /**
             * @description Required for CHECKING, SAVINGS, and INVESTMENT. Must be omitted for CASH.
             * @example 001122335678
             */
            accountNumber?: string;
            /**
             * @default DOP
             * @example DOP
             */
            currency: string;
            color?: string;
            /** @description When true, this account is the fallback ledger target for emails from this institution that have no account digits. */
            isDefaultForInstitution?: boolean;
            isActive?: boolean;
        };
        CreateInstitutionDto: {
            name: string;
            color?: string;
            /** @default DO */
            country: string;
            /**
             * @default bank
             * @enum {string}
             */
            type: "bank" | "credit_union" | "digital_wallet" | "broker" | "cash" | "other";
            shortName?: Record<string, never>;
            /** @default 0 */
            sortOrder: number;
            /** @description Brand domain, for example bhd.com.do */
            domain?: Record<string, never>;
        };
        UpdateInstitutionDto: {
            name?: string;
            color?: string;
            /** @default DO */
            country: string;
            /**
             * @default bank
             * @enum {string}
             */
            type: "bank" | "credit_union" | "digital_wallet" | "broker" | "cash" | "other";
            shortName?: Record<string, never>;
            /** @default 0 */
            sortOrder: number;
            /** @description Brand domain, for example bhd.com.do */
            domain?: Record<string, never>;
            isActive?: boolean;
        };
        CreateCardDto: {
            institutionId: string;
            /** @description Required when type=DEBIT; must be omitted when type=CREDIT */
            accountId?: string;
            name: string;
            /** @enum {string} */
            type: "CREDIT" | "DEBIT";
            /** @enum {string} */
            network?: "VISA" | "MASTERCARD" | "AMEX" | "DISCOVER" | "OTHER";
            /** @example 1234 */
            lastFour: string;
            statementClosingDay?: number;
            paymentDueDay?: number;
            color?: string;
        };
        UpdateCardDto: {
            institutionId?: string;
            /** @description Required when type=DEBIT; must be omitted when type=CREDIT */
            accountId?: string;
            name?: string;
            /** @enum {string} */
            type?: "CREDIT" | "DEBIT";
            /** @enum {string} */
            network?: "VISA" | "MASTERCARD" | "AMEX" | "DISCOVER" | "OTHER";
            /** @example 1234 */
            lastFour?: string;
            statementClosingDay?: number;
            paymentDueDay?: number;
            color?: string;
            isActive?: boolean;
        };
        UpdateCardCreditLimitDto: {
            /**
             * @description ISO 4217 currency code
             * @example DOP
             */
            currency: string;
            creditLimit: number;
        };
        UpdateCardBalanceDto: {
            /**
             * @description ISO 4217 currency code
             * @example DOP
             */
            currency: string;
            balance: number;
            creditLimit?: number;
        };
        CreateCategoryDto: {
            name: string;
            icon?: string;
            color?: string;
            parentId?: string;
            /**
             * @description EXPENSE or INCOME. Defaults to EXPENSE when omitted.
             * @default EXPENSE
             * @enum {string}
             */
            type: "EXPENSE" | "INCOME" | "TRANSFER";
        };
        UpdateCategoryDto: {
            name?: string;
            icon?: string;
            color?: string;
            /**
             * @description EXPENSE or INCOME. Defaults to EXPENSE when omitted.
             * @default EXPENSE
             * @enum {string}
             */
            type: "EXPENSE" | "INCOME" | "TRANSFER";
            parentId?: string | null;
        };
        AdjustBalanceDto: {
            accountId?: string;
            cardId?: string;
            /** @example DOP */
            currency?: string;
            /** @description Target balance after the adjustment */
            balance: number;
        };
        CreateTransactionDto: {
            accountId?: string;
            cardId?: string;
            /** @enum {string} */
            type: "DEBIT" | "CREDIT";
            amount: number;
            /**
             * @default DOP
             * @example DOP
             */
            currency: string;
            transactionDate: string;
            merchant?: string;
            description?: string;
            notes?: string;
            categoryId?: string;
            /**
             * @default CONFIRMED
             * @enum {string}
             */
            status: "PENDING" | "CONFIRMED" | "CANCELLED" | "DECLINED" | "REVERSED";
        };
        MergeTransactionDto: {
            /** @description Movement to keep */
            intoId: string;
        };
        TransferFeeDto: {
            amount: number;
            categoryId?: string;
        };
        CreateTransferDto: {
            fromAccountId: string;
            toAccountId: string;
            /** @deprecated */
            toCardId?: string;
            /** @deprecated */
            fromCardId?: string;
            amount: number;
            /**
             * @default DOP
             * @example DOP
             */
            currency: string;
            transactionDate: string;
            description?: string;
            notes?: string;
            /**
             * @default CONFIRMED
             * @enum {string}
             */
            status: "PENDING" | "CONFIRMED" | "CANCELLED";
            /** @enum {string} */
            rail?: "SAME_BANK" | "ACH" | "LBTR" | "OTHER";
            fee?: components["schemas"]["TransferFeeDto"];
            /** @default false */
            destinationPending: boolean;
            /** @description Tasa aplicada de la moneda de origen a la de destino */
            exchangeRate?: number;
            /** @description Monto que entra en la cuenta de destino, en su moneda */
            receivedAmount?: number;
        };
        UpdateTransferDto: {
            fromAccountId?: string;
            toAccountId?: string;
            /** @deprecated */
            toCardId?: string;
            /** @deprecated */
            fromCardId?: string;
            amount?: number;
            /**
             * @default DOP
             * @example DOP
             */
            currency: string;
            transactionDate?: string;
            description?: string;
            notes?: string;
            /**
             * @default CONFIRMED
             * @enum {string}
             */
            status: "PENDING" | "CONFIRMED" | "CANCELLED";
            /** @enum {string} */
            rail?: "SAME_BANK" | "ACH" | "LBTR" | "OTHER";
            fee?: components["schemas"]["TransferFeeDto"];
            /** @default false */
            destinationPending: boolean;
            /** @description Tasa aplicada de la moneda de origen a la de destino */
            exchangeRate?: number;
            /** @description Monto que entra en la cuenta de destino, en su moneda */
            receivedAmount?: number;
        };
        CreateCardPaymentDto: {
            fromAccountId: string;
            cardId: string;
            amount: number;
            /**
             * @default DOP
             * @example DOP
             */
            currency: string;
            transactionDate: string;
            description?: string;
            notes?: string;
            /**
             * @default CONFIRMED
             * @enum {string}
             */
            status: "PENDING" | "CONFIRMED" | "CANCELLED";
            statementId?: string;
        };
        UpdateCardPaymentDto: {
            fromAccountId?: string;
            cardId?: string;
            amount?: number;
            /**
             * @default DOP
             * @example DOP
             */
            currency: string;
            transactionDate?: string;
            description?: string;
            notes?: string;
            /**
             * @default CONFIRMED
             * @enum {string}
             */
            status: "PENDING" | "CONFIRMED" | "CANCELLED";
            statementId?: string;
        };
        CreateMerchantDto: {
            /** @example Supermercado Nacional */
            name: string;
            categoryId?: Record<string, never> | null;
            /** @description Brand domain from the logo search */
            domain?: Record<string, never> | null;
            /** @description Other names the merchant appears with */
            aliases?: string[];
        };
        UpdateMerchantDto: {
            name?: string;
            categoryId?: Record<string, never> | null;
            /** @description Complete alias list that replaces the current one */
            aliases?: string[];
            /** @description Brand domain from the logo search; null removes the brand logo */
            domain?: Record<string, never> | null;
        };
        MergeMerchantDto: {
            /** @description Merchant that keeps the movements */
            targetId: string;
        };
        DismissSubscriptionAlertDto: {
            /** @enum {string} */
            kind: "PRICE_INCREASE" | "AMOUNT_MISMATCH" | "TRIAL_ENDING" | "ANNUAL_RENEWAL" | "MISSED_CHARGE";
            subscriptionId: string;
            /** @description Alert occurrence date (ISO date) */
            alertDate: string;
        };
        CreateSubscriptionDto: {
            name: string;
            /** @description Brand domain for the logo lookup */
            domain?: string;
            amount: number;
            /** @default DOP */
            currency: string;
            /** @enum {string} */
            billingCycle: "WEEKLY" | "MONTHLY" | "QUARTERLY" | "SEMIANNUAL" | "YEARLY";
            /** @default 1 */
            billingInterval: number;
            /** @description First charge (ISO date) */
            anchorDate: string;
            /** @description Trial end (ISO date) */
            trialEndsAt?: string;
            cardId?: string;
            accountId?: string;
            categoryId?: string;
            /** @default 3 */
            reminderDaysBefore: number;
            manageUrl?: string;
            notes?: string;
            /** @description Recurring pattern this was born from */
            sourcePatternId?: string;
        };
        UpdateSubscriptionDto: {
            name?: string;
            /** @description Brand domain for the logo lookup */
            domain?: string;
            amount?: number;
            /** @default DOP */
            currency: string;
            /** @enum {string} */
            billingCycle?: "WEEKLY" | "MONTHLY" | "QUARTERLY" | "SEMIANNUAL" | "YEARLY";
            /** @default 1 */
            billingInterval: number;
            /** @description First charge (ISO date) */
            anchorDate?: string;
            /** @description Trial end (ISO date) */
            trialEndsAt?: string;
            cardId?: string;
            accountId?: string;
            categoryId?: string;
            /**
             * @description Last date already reminded
             * @default 3
             */
            reminderDaysBefore: number;
            manageUrl?: string;
            notes?: string;
            /** @description Recurring pattern this was born from */
            sourcePatternId?: string;
            /** @enum {string} */
            status?: "ACTIVE" | "PAUSED" | "CANCELLED";
        };
        CreateSubscriptionPaymentDto: {
            amount?: number;
            currency?: string;
            /** @description Payment date (ISO); defaults to now */
            paidAt?: string;
            /** @description Ledger movement to link */
            transactionId?: string;
        };
        UpdateCardStatementDto: {
            minimumPayment?: number;
            closingBalance?: number;
            dueDate?: string;
        };
        StatementImportUploadDto: {
            /** @description PDF password; never stored or logged */
            password?: string;
        };
        UpdateStatementLineDto: {
            /** @enum {string} */
            decision?: "MATCH" | "CREATE" | "IGNORE";
            transactionId?: Record<string, never>;
        };
        ApplyStatementImportDto: {
            /** @description Create an adjustment for the remaining balance difference */
            adjust?: boolean;
        };
        CreateBudgetDto: {
            name?: string;
            categoryIds: string[];
            categoryId?: string;
            /** @enum {string} */
            periodType: "MONTHLY" | "BIWEEKLY" | "CUSTOM";
            periodStart: string;
            periodEnd: string;
            amountLimit: number;
            /** @default 80 */
            alertThresholdPct: number;
            /** @default true */
            includeChildren: boolean;
            /**
             * @default NONE
             * @enum {string}
             */
            rollover: "NONE" | "SURPLUS" | "SURPLUS_AND_DEFICIT";
            /** @default false */
            recurring: boolean;
        };
        UpdateBudgetDto: {
            name?: string;
            categoryIds?: string[];
            categoryId?: string;
            /** @enum {string} */
            periodType?: "MONTHLY" | "BIWEEKLY" | "CUSTOM";
            periodStart?: string;
            periodEnd?: string;
            amountLimit?: number;
            /** @default 80 */
            alertThresholdPct: number;
            /** @default true */
            includeChildren: boolean;
            /**
             * @default NONE
             * @enum {string}
             */
            rollover: "NONE" | "SURPLUS" | "SURPLUS_AND_DEFICIT";
            /** @default false */
            recurring: boolean;
        };
        CreateSavingsGoalDto: {
            name: string;
            description?: string;
            targetAmount: number;
            accountId: string;
            /**
             * @default EARMARK
             * @enum {string}
             */
            mode: "EARMARK" | "DEDICATED";
            /**
             * @default DOP
             * @example DOP
             */
            currency: string;
            targetDate?: string | null;
            currentAmount?: number;
            /** @default true */
            spendReducesProgress: boolean;
        };
        CreateSavingsGoalAllocationDto: {
            /**
             * @default CONTRIBUTION
             * @enum {string}
             */
            kind: "CONTRIBUTION" | "WITHDRAWAL";
            amount: number;
            date?: string;
            notes?: string;
            /** @description Cuenta de origen cuando es distinta a la cuenta de la meta. El aporte crea la transferencia. */
            fromAccountId?: string;
            /** @description Cuenta que recibe el dinero en un retiro. Obligatoria cuando kind es WITHDRAWAL. */
            toAccountId?: string;
            fromTransferGroupId?: string;
            transactionId?: string;
        };
        UpdateSavingsGoalDto: {
            name?: string;
            description?: string;
            targetAmount?: number;
            accountId?: string;
            /**
             * @default EARMARK
             * @enum {string}
             */
            mode: "EARMARK" | "DEDICATED";
            /**
             * @default DOP
             * @example DOP
             */
            currency: string;
            targetDate?: string | null;
            /** @default true */
            spendReducesProgress: boolean;
        };
        CreateLoanDto: {
            /** @description Alias opcional para distinguir préstamos del mismo prestamista. */
            name?: Record<string, never>;
            lenderName: string;
            institutionId?: string;
            accountId?: string;
            originalAmount: number;
            currentBalance: number;
            /**
             * @default DOP
             * @example DOP
             */
            currency: string;
            installmentAmount: number;
            /** @enum {string} */
            installmentFreq: "WEEKLY" | "BIWEEKLY" | "MONTHLY";
            totalInstallments: number;
            /** @default 0 */
            paidInstallments: number;
            nextDueDate: string;
            /**
             * @description Fraction 0–1 (e.g. 0.12 = 12%). Not a percent integer.
             * @example 0.12
             */
            interestRate?: Record<string, never>;
            notes?: Record<string, never>;
            /**
             * @default FIXED
             * @enum {string}
             */
            rateType: "FIXED" | "VARIABLE";
            insuranceAmount?: Record<string, never>;
            prepaymentPenaltyPct?: Record<string, never>;
            disbursementDate?: Record<string, never>;
            /** @description Cuenta que recibe el capital desembolsado. Se acredita al crear el préstamo. */
            disbursementAccountId?: string;
        };
        PayLoanInstallmentDto: {
            amount?: number;
            accountId?: string;
            /** @default false */
            excessAsPrepayment: boolean;
        };
        LoanPrepaymentDto: {
            amount: number;
            accountId: string;
            /** @enum {string} */
            mode: "REDUCE_TERM" | "REDUCE_INSTALLMENT";
            date?: string;
            penaltyAmount?: number;
        };
        UpdateLoanDto: {
            /** @description Alias opcional para distinguir préstamos del mismo prestamista. */
            name?: Record<string, never>;
            lenderName?: string;
            institutionId?: string;
            accountId?: string;
            originalAmount?: number;
            currentBalance?: number;
            /**
             * @default DOP
             * @example DOP
             */
            currency: string;
            installmentAmount?: number;
            /** @enum {string} */
            installmentFreq?: "WEEKLY" | "BIWEEKLY" | "MONTHLY";
            totalInstallments?: number;
            /** @default 0 */
            paidInstallments: number;
            nextDueDate?: string;
            /**
             * @description Fraction 0–1 (e.g. 0.12 = 12%). Not a percent integer.
             * @example 0.12
             */
            interestRate?: Record<string, never>;
            notes?: Record<string, never>;
            /**
             * @default FIXED
             * @enum {string}
             */
            rateType: "FIXED" | "VARIABLE";
            insuranceAmount?: Record<string, never>;
            prepaymentPenaltyPct?: Record<string, never>;
            disbursementDate?: Record<string, never>;
            isActive?: boolean;
        };
        CreateReceivableDto: {
            debtorName: string;
            description: string;
            amount: number;
            /** @default 0 */
            paidAmount: number;
            /**
             * @default PENDING
             * @enum {string}
             */
            status: "PENDING" | "PARTIAL" | "PAID" | "CANCELLED" | "WRITTEN_OFF";
            /**
             * @default DOP
             * @example DOP
             */
            currency: string;
            dueDate?: string;
        };
        CreateReceivablePaymentDto: {
            amount: number;
            /** @description Account the money entered */
            accountId: string;
            /** @description Defaults to today */
            paidAt?: string;
            notes?: string;
            /** @enum {string} */
            excessHandling?: "EXTRA_INCOME" | "CREDIT_BALANCE" | "APPLY_TO_RECEIVABLE";
            targetReceivableId?: string;
            /** @description Movimiento existente que ya representa el cobro; no crea otro. */
            transactionId?: string;
        };
        ApplyReceivableCreditDto: {
            targetReceivableId: string;
            /** @description Defaults to the whole credit balance */
            amount?: number;
            /** @description Defaults to today */
            paidAt?: string;
        };
        WriteOffReceivableDto: {
            /** @description Defaults to the outstanding amount */
            amount?: number;
            reason?: string;
        };
        UpdateReceivableDto: {
            debtorName?: string;
            description?: string;
            amount?: number;
            /**
             * @default PENDING
             * @enum {string}
             */
            status: "PENDING" | "PARTIAL" | "PAID" | "CANCELLED" | "WRITTEN_OFF";
            /**
             * @default DOP
             * @example DOP
             */
            currency: string;
            dueDate?: string;
        };
        LinkTransactionDto: {
            /** @enum {string} */
            kind: "TRANSFER" | "LOAN_INSTALLMENT" | "RECEIVABLE_PAYMENT" | "SAVINGS_CONTRIBUTION";
            loanId?: string;
            installmentId?: string;
            receivableId?: string;
            goalId?: string;
        };
        EntityReferenceDto: {
            /**
             * @description Finance product the reference points at
             * @enum {string}
             */
            type: "transaction" | "account" | "card" | "loan" | "budget" | "savingsGoal" | "receivable" | "subscription" | "merchant" | "category";
            /** Format: uuid */
            id: string;
        };
        LookupEntitiesDto: {
            /** @description References to resolve, at most 50 per call */
            refs: components["schemas"]["EntityReferenceDto"][];
        };
        CreateRecurringDto: {
            /** @description Raw merchant text */
            merchant?: string;
            merchantId?: string;
            categoryId?: string;
            avgAmount: number;
            /** @default DOP */
            currency: string;
            /** @enum {number} */
            frequency: 7 | 14 | 30 | 365;
            /** @description Next expected charge (ISO date) */
            nextExpectedDate: string;
            /** @enum {string} */
            kind?: "SUBSCRIPTION" | "BILL" | "INCOME" | "OTHER";
        };
        UpdateRecurringDto: {
            /** @enum {string} */
            status?: "SUGGESTED" | "CONFIRMED" | "DISMISSED";
            merchant?: string;
            categoryId?: Record<string, never> | null;
            avgAmount?: number;
            /** @default DOP */
            currency: string;
            /** @enum {number} */
            frequency?: 7 | 14 | 30 | 365;
            /** @description Next expected charge (ISO date) */
            nextExpectedDate?: string;
            /** @enum {string} */
            kind?: "SUBSCRIPTION" | "BILL" | "INCOME" | "OTHER";
            amountTolerancePct?: number;
        };
        PreviewReconciliationDto: {
            accountId?: string;
            cardId?: string;
            /** @example DOP */
            currency?: string;
            /** @description Cut-off date (ISO date), defaults to today */
            asOfDate?: string;
            /** @description Balance shown by the bank app */
            realBalance: number;
        };
        ReconciliationAdjustmentDto: {
            /** @enum {string} */
            kind: "IMPUESTO_DGII" | "COMISION" | "CARGO_PLASTICO" | "INTERES" | "OTRO";
            /** @description Signed amount; charges are negative */
            amount: number;
        };
        CreateReconciliationDto: {
            accountId?: string;
            cardId?: string;
            /** @example DOP */
            currency?: string;
            /** @description Cut-off date (ISO date), defaults to today */
            asOfDate?: string;
            /** @description Balance shown by the bank app */
            realBalance: number;
            adjustments?: components["schemas"]["ReconciliationAdjustmentDto"][];
            note?: string;
        };
        RecalculateBalanceDto: {
            /** @description Account to recalculate */
            accountId?: string;
            /** @description Card to recalculate */
            cardId?: string;
            /**
             * @description Required when cardId is set
             * @example DOP
             */
            currency?: string;
        };
        ParseQuickEntryDto: {
            /**
             * @description Short natural-language sentence to turn into a draft.
             * @example café 250 popular
             */
            text: string;
        };
        CreateReceivableShareDto: {
            receivableIds: string[];
            debtorName: string;
        };
        CreateNotificationDto: {
            type: string;
            /**
             * @default IN_APP
             * @enum {string}
             */
            channel: "IN_APP" | "PUSH" | "EMAIL";
            title: string;
            body: string;
            data?: Record<string, never>;
        };
        RegisterPushTokenDto: {
            /** @enum {string} */
            platform: "ios" | "android" | "web";
            token: string;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
};
export type $defs = Record<string, never>;
export interface operations {
    HealthController_liveness: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @example ok */
                        status?: string;
                        /** Format: date-time */
                        timestamp?: string;
                        /** @example 1.4.0 */
                        version?: string;
                    };
                };
            };
        };
    };
    HealthController_startup: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Startup dependencies are ready */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @example ok */
                        status?: string;
                        /** Format: date-time */
                        timestamp?: string;
                    };
                };
            };
            /** @description One or more startup checks failed (no dependency details) */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    HealthController_readiness: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description All readiness checks passed */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @example ok */
                        status?: string;
                        /** Format: date-time */
                        timestamp?: string;
                    };
                };
            };
            /** @description One or more readiness checks failed (no dependency details) */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    UsersController_getMyProfile: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Current user profile */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    UsersController_deleteMyAccount: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Account deleted successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    UsersController_updateMyProfile: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateProfileDto"];
            };
        };
        responses: {
            /** @description Updated user profile */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    UsersController_markReleaseNotesSeen: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MarkReleaseNotesSeenDto"];
            };
        };
        responses: {
            /** @description Updated user profile */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    UsersController_updateMyModuleConfig: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                slug: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateModuleConfigDto"];
            };
        };
        responses: {
            /** @description Updated user profile with module config */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    UsersController_myDataBranches: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Branches grouped by app with their counts */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    UsersController_wipeMyData: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["WipeUserDataDto"];
            };
        };
        responses: {
            /** @description Requested and applied branches with counts */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AuthController_session: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Current authenticated user context */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AiRolesController_list: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AiRolesController_update: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                userId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateAiRoleDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AiConsentController_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AiConsentController_update: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateConsentDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AiIntelligenceController_dashboard: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AiIntelligenceController_messages: {
        parameters: {
            query: {
                cursor: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AiIntelligenceController_message: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                messageId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AiIntelligenceController_connect: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AiIntelligenceController_syncNow: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AiIntelligenceController_resetEmailCorpus: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ResetEmailCorpusDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AiIntelligenceController_callback: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AiIntelligenceController_diagnostics: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AiEvidenceController_dataset: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AiEvidenceController_reviewQueue: {
        parameters: {
            query: {
                cursor: string;
                partition: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AiEvidenceController_verifyMessage: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                messageId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateHumanVerificationDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AiEvidenceController_runs: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AiKnowledgeController_list: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["KnowledgeExplorerDto"];
                };
            };
        };
    };
    AiKnowledgeController_adminQueue: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["KnowledgeItemDto"][];
                };
            };
        };
    };
    AiKnowledgeController_rebuild: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["KnowledgeRebuildDto"];
                };
            };
        };
    };
    AiKnowledgeController_revert: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                knowledgeId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["KnowledgeItemDto"];
                };
            };
            /** @description Conocimiento GLOBAL no encontrado */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AiKnowledgeController_export: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Exportación JSON de los datos AI y correo propios. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** Format: date-time */
                        exportedAt?: string;
                        connection?: Record<string, never> | null;
                        messages?: Record<string, never>[];
                        datasetItems?: Record<string, never>[];
                        runs?: Record<string, never>[];
                        observations?: Record<string, never>[];
                        verifications?: Record<string, never>[];
                        knowledge?: Record<string, never>[];
                        consent?: Record<string, never>[];
                        settings?: Record<string, never> | null;
                        inferences?: Record<string, never>[];
                    };
                };
            };
        };
    };
    AiKnowledgeController_remove: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ConfirmAiDataDeletionDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["KnowledgeDeletionDto"];
                };
            };
            /** @description Falta confirmed: true */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CurrenciesController_list: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CurrenciesController_exchangeRates: {
        parameters: {
            query: {
                /** @description ISO-3 base currency */
                base: string;
                /** @description Comma-separated ISO-3 currency codes */
                quotes: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CurrenciesController_setBaseCurrency: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ChangeBaseCurrencyDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AccountsController_list: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AccountsController_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateAccountDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AccountsController_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AccountsController_remove: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AccountsController_update: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateAccountDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AccountsController_getHistory: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AccountsController_restore: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    InstitutionsController_list: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    InstitutionsController_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateInstitutionDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    InstitutionsController_uploadLogo: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    InstitutionsController_remove: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    InstitutionsController_update: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateInstitutionDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    InstitutionsController_restore: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CardsController_list: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CardsController_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateCardDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CardsController_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CardsController_remove: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CardsController_update: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateCardDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CardsController_getHistory: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CardsController_restore: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CardsController_updateCreditLimit: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateCardCreditLimitDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CardsController_updateBalance: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateCardBalanceDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CardsController_deleteBalance: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
                currency: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CategoriesController_list: {
        parameters: {
            query?: {
                type?: "EXPENSE" | "INCOME" | "TRANSFER";
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CategoriesController_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateCategoryDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CategoriesController_remove: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CategoriesController_update: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateCategoryDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CategoriesController_restore: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TransactionsController_list: {
        parameters: {
            query?: {
                transferGroupId?: string;
                accountId?: string;
                cardId?: string;
                categoryId?: string;
                merchantId?: string;
                type?: "DEBIT" | "CREDIT" | "TRANSFER" | "ADJUSTMENT" | "CARD_PAYMENT";
                status?: "PENDING" | "CONFIRMED" | "CANCELLED" | "DECLINED" | "REVERSED";
                dateFrom?: string;
                dateTo?: string;
                search?: string;
                includeAdjustments?: boolean;
                groupOperations?: boolean;
                possibleDuplicates?: boolean;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TransactionsController_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateTransactionDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TransactionsController_adjust: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AdjustBalanceDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TransactionsController_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TransactionsController_remove: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TransactionsController_update: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TransactionsController_restore: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TransactionsController_confirm: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TransactionsController_unconfirm: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TransactionsController_reverse: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TransactionsController_merge: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MergeTransactionDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TransactionsController_notDuplicate: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TransfersController_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateTransferDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TransfersController_remove: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TransfersController_update: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateTransferDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TransfersController_unconfirm: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TransfersController_confirm: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TransfersController_reverse: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CardPaymentsController_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateCardPaymentDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CardPaymentsController_remove: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CardPaymentsController_update: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateCardPaymentDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CardPaymentsController_unconfirm: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CardPaymentsController_confirm: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    MerchantsController_list: {
        parameters: {
            query?: {
                search?: string;
                /** @description Start of the spend window (ISO date) */
                dateFrom?: string;
                /** @description End of the spend window (ISO date) */
                dateTo?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    MerchantsController_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateMerchantDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    MerchantsController_suggest: {
        parameters: {
            query?: {
                /** @description Raw merchant text typed by the user */
                merchant?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    MerchantsController_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    MerchantsController_update: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateMerchantDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    MerchantsController_duplicates: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    MerchantsController_dismissDuplicate: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
                otherId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    MerchantsController_undoDismissDuplicate: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
                otherId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    MerchantsController_merge: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MergeMerchantDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    MerchantsController_uploadLogo: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    MerchantsController_deleteLogo: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    LogosController_search: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    SubscriptionsController_list: {
        parameters: {
            query?: {
                status?: "ACTIVE" | "PAUSED" | "CANCELLED";
                /** @description ISO 4217 currency filter */
                currency?: string;
                categoryId?: string;
                /** @description Category ids, comma separated */
                categoryIds?: string[];
                frequency?: "MONTHLY" | "YEARLY" | "OTHER";
                sort?: "NEXT_DATE" | "AMOUNT" | "NAME";
                cardId?: string;
                accountId?: string;
                /** @description Only subscriptions without a category */
                unassignedCategory?: boolean;
                /** @description Only subscriptions without a card or account */
                unassignedMethod?: boolean;
                /** @description Name search */
                q?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    SubscriptionsController_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateSubscriptionDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    SubscriptionsController_summary: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    SubscriptionsController_breakdown: {
        parameters: {
            query?: {
                by?: "category" | "instrument" | "currency";
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    SubscriptionsController_upcoming: {
        parameters: {
            query?: {
                days?: number;
                /** @description Window start (ISO date) */
                from?: string;
                /** @description Window end (ISO date) */
                to?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    SubscriptionsController_alerts: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    SubscriptionsController_dismissAllAlerts: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    SubscriptionsController_dismissAlert: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DismissSubscriptionAlertDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    SubscriptionsController_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    SubscriptionsController_update: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateSubscriptionDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    SubscriptionsController_pause: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    SubscriptionsController_resume: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    SubscriptionsController_cancel: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    SubscriptionsController_listPayments: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    SubscriptionsController_createPayment: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateSubscriptionPaymentDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    SubscriptionsController_uploadLogo: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CardStatementsController_list: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CardStatementsController_detail: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
                statementId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CardStatementsController_update: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
                statementId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateCardStatementDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    StatementImportsController_importCardStatement: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "multipart/form-data": components["schemas"]["StatementImportUploadDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    StatementImportsController_importAccountStatement: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "multipart/form-data": components["schemas"]["StatementImportUploadDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    StatementImportsController_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    StatementImportsController_discard: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    StatementImportsController_updateLine: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
                lineId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateStatementLineDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    StatementImportsController_apply: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ApplyStatementImportDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    BudgetsController_list: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    BudgetsController_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateBudgetDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    BudgetsController_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    BudgetsController_remove: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    BudgetsController_update: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateBudgetDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    BudgetsController_transactions: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    BudgetsController_restore: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    SavingsGoalsController_list: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    SavingsGoalsController_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateSavingsGoalDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    SavingsGoalsController_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    SavingsGoalsController_remove: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    SavingsGoalsController_update: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateSavingsGoalDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    SavingsGoalsController_listAllocations: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    SavingsGoalsController_addAllocation: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateSavingsGoalAllocationDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    SavingsGoalsController_removeAllocation: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
                allocationId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    SavingsGoalsController_listContributions: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    SavingsGoalsController_addContribution: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateSavingsGoalAllocationDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    SavingsGoalsController_removeContribution: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
                allocationId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    SavingsGoalsController_restore: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    LoansController_list: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    LoansController_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateLoanDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    LoansController_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    LoansController_remove: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    LoansController_update: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateLoanDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    LoansController_listInstallments: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    LoansController_schedule: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    LoansController_payNext: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PayLoanInstallmentDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    LoansController_prepay: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LoanPrepaymentDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    LoansController_preview: {
        parameters: {
            query: {
                amount: number;
                mode: "REDUCE_TERM" | "REDUCE_INSTALLMENT";
            };
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    LoansController_restore: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ReceivablesController_list: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ReceivablesController_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateReceivableDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ReceivablesController_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ReceivablesController_remove: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ReceivablesController_update: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateReceivableDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ReceivablesController_listPayments: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ReceivablesController_addPayment: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateReceivablePaymentDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ReceivablesController_applyCreditBalance: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ApplyReceivableCreditDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ReceivablesController_writeOff: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["WriteOffReceivableDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ReceivablesController_restore: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TransactionLinksController_create: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LinkTransactionDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TransactionLinksController_remove: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    BalanceSheetController_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Net worth summary plus the atomic breakdown by currency. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** Format: date-time */
                        asOf?: string;
                        /** Format: date */
                        rateDate?: string;
                        /** @example DOP */
                        baseCurrency?: string;
                        global?: {
                            /** @enum {string} */
                            status?: "COMPLETE" | "INCOMPLETE";
                            assets?: {
                                /** @example 1500.00 */
                                accounts?: string;
                                /** @example 1500.00 */
                                cash?: string;
                                /** @example 1500.00 */
                                receivables?: string;
                            };
                            liabilities?: {
                                creditCards?: string | null;
                                /** @example 1500.00 */
                                loans?: string;
                            };
                            /** @example 1500.00 */
                            totalAssets?: string;
                            totalLiabilities?: string | null;
                            netWorth?: string | null;
                            /** @description Native totals per currency; no conversion. */
                            byCurrency?: {
                                /** @example DOP */
                                currency?: string;
                                /** @example 1500.00 */
                                assets?: string;
                                /** @example 1500.00 */
                                available?: string;
                                /** @example 1500.00 */
                                receivables?: string;
                                /** @example 1500.00 */
                                liabilities?: string;
                                /** @example 1500.00 */
                                netWorth?: string;
                            }[];
                            issues?: Record<string, never>[];
                        };
                        institutions?: Record<string, never>[];
                        cash?: Record<string, never>;
                        /** @description Product lines grouped by currency. Every total is the sum of its lines; doubtful receivables never add to net worth. */
                        breakdown?: {
                            byCurrency?: {
                                currency?: string;
                                accounts?: Record<string, never>[];
                                cash?: Record<string, never>[];
                                receivables?: Record<string, never>[];
                                creditCards?: Record<string, never>[];
                                loans?: Record<string, never>[];
                                doubtfulReceivables?: Record<string, never>[];
                                totals?: Record<string, never>;
                                totalsBase?: Record<string, never>;
                            }[];
                            totals?: Record<string, never>;
                        };
                    };
                };
            };
        };
    };
    EntitiesController_lookupEntities: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LookupEntitiesDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AnalyticsController_weeklySummaryReport: {
        parameters: {
            query: {
                weekStart: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AnalyticsController_summary: {
        parameters: {
            query: {
                dateFrom: string;
                dateTo: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AnalyticsController_spendingByCategory: {
        parameters: {
            query: {
                dateFrom: string;
                dateTo: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AnalyticsController_budgetStatus: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AnalyticsController_spendingOverTime: {
        parameters: {
            query?: {
                dateFrom?: string;
                dateTo?: string;
                granularity?: "day" | "week" | "month";
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    RecurringController_list: {
        parameters: {
            query?: {
                status?: "SUGGESTED" | "CONFIRMED" | "DISMISSED";
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    RecurringController_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateRecurringDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    RecurringController_upcoming: {
        parameters: {
            query?: {
                days?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    RecurringController_update: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateRecurringDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ReconciliationsController_preview: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PreviewReconciliationDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ReconciliationsController_list: {
        parameters: {
            query?: {
                accountId?: string;
                cardId?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ReconciliationsController_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateReconciliationDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ReconciliationsController_status: {
        parameters: {
            query: {
                /** @description Month as YYYY-MM */
                month: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ReconciliationsController_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ReconciliationsController_remove: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ReconciliationsController_restore: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    BankChargesController_bankCharges: {
        parameters: {
            query?: {
                /** @description Start date (ISO date) */
                from?: string;
                /** @description End date (ISO date) */
                to?: string;
                groupBy?: "month" | "institution" | "kind";
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    IntegrityController_check: {
        parameters: {
            query?: {
                /** @description Check only this account */
                accountId?: string;
                /** @description Check only this card */
                cardId?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    IntegrityController_recalculate: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RecalculateBalanceDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    QuickEntryController_parse: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ParseQuickEntryDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ReceivableSharesController_list: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ReceivableSharesController_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateReceivableShareDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ReceivableSharesController_revoke: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ReceivableSharesController_regenerate: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PublicReceivableSharesController_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                token: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    RecycleBinController_list: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    NotificationsController_list: {
        parameters: {
            query?: {
                channel?: "IN_APP" | "PUSH" | "EMAIL";
                unreadOnly?: boolean;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    NotificationsController_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateNotificationDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    NotificationsController_unreadCount: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    NotificationsController_markAllAsRead: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    NotificationsController_markAsRead: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    NotificationsController_registerPushToken: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RegisterPushTokenDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    NotificationsController_deactivatePushToken: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                token: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    NotificationsController_deactivatePushTokenLegacy: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                token: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
}
