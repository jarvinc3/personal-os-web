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
    "/api/intelligence/admin/roles": {
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
    "/api/intelligence/admin/roles/{userId}": {
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
    "/api/intelligence/preferences/consent": {
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
    "/api/intelligence/email/sample-import": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AiIntelligenceController_sampleImportRun"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/intelligence/email/sample-import/{jobId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["AiIntelligenceController_sampleImportStatus"];
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
    "/api/intelligence/email/sync-bhd": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AiIntelligenceController_syncBhd"];
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
    "/api/intelligence/email/usage": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Uso y costo de clasificación por día, hora, banco y tipo */
        get: operations["EmailUsageController_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/intelligence/email/product-proposals/discover": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["EmailProductProposalsController_discover"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/intelligence/email/product-proposals": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["EmailProductProposalsController_list"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/intelligence/email/product-proposals/{proposalId}": {
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
        patch: operations["EmailProductProposalsController_update"];
        trace?: never;
    };
    "/api/intelligence/email/product-proposals/{proposalId}/approve": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["EmailProductProposalsController_approve"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/intelligence/email/product-proposals/{proposalId}/discard": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["EmailProductProposalsController_discard"];
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
    "/api/intelligence/review-groups": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["AiEvidenceController_reviewGroups"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/intelligence/review-groups/verifications": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AiEvidenceController_verifyReviewGroup"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/intelligence/messages/verifications/batch": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AiEvidenceController_verifyReviewSelection"];
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
    "/api/intelligence/runs/evaluate": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AiEvidenceController_evaluate"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/intelligence/runs/compare": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["AiEvidenceController_compare"];
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
    "/api/intelligence/knowledge/admin/{knowledgeId}/promote": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Promover manualmente conocimiento GLOBAL en revisión */
        post: operations["AiKnowledgeController_promote"];
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
    "/api/intelligence/signals": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["AiSignalsController_list"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/intelligence/signals/{signalId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["AiSignalsController_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/intelligence/conversations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Listar las conversaciones propias por cursor */
        get: operations["AiConversationController_list"];
        put?: never;
        /** Crear una conversación privada del agente */
        post: operations["AiConversationController_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/intelligence/conversations/latest": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Recuperar la conversación propia más reciente de un contexto */
        get: operations["AiConversationController_latest"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/intelligence/conversations/{conversationId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Recuperar una conversación propia */
        get: operations["AiConversationController_get"];
        put?: never;
        post?: never;
        /** Borrar una conversación propia y sus mensajes */
        delete: operations["AiConversationController_remove"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/intelligence/conversations/{conversationId}/messages": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Enviar un mensaje, ejecutar capacidades y responder JSON o text/event-stream */
        post: operations["AiConversationController_sendMessage"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/intelligence/actions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Listar acciones propias del agente */
        get: operations["AiActionsController_list"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/intelligence/actions/{actionId}/confirm": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Confirmar una acción pendiente del agente */
        post: operations["AiActionsController_confirm"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/intelligence/actions/{actionId}/cancel": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Cancelar una acción pendiente del agente */
        post: operations["AiActionsController_cancel"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/intelligence/view-suggestions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Listar las sugerencias activas de la vista del usuario */
        get: operations["ViewSuggestionsController_resolveForView"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/intelligence/view-suggestions/{suggestionId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** Descartar una sugerencia propia de forma persistente */
        delete: operations["ViewSuggestionsController_dismiss"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/intelligence/proactive-suggestions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["ProactiveSuggestionsController_list"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/imports/review": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Imports de correo que esperan una decisión humana */
        get: operations["ImportReviewController_list"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/finance/imports/review/{id}/resolve": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Fija fecha o destino, enlaza el reverso o descarta un import */
        post: operations["ImportReviewController_resolve"];
        delete?: never;
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
        UserModuleResponseDto: {
            slug: string;
            isEnabled: boolean;
            config: Record<string, never>;
            /** Format: date-time */
            enabledAt: string;
        };
        UserProfileResponseDto: {
            id: string;
            email: string;
            fullName: string;
            avatarUrl: string | null;
            timezone: string;
            locale: string;
            preferences: Record<string, never>;
            lastSeenReleaseVersion: string | null;
            userModules: components["schemas"]["UserModuleResponseDto"][];
            /** Format: date-time */
            createdAt: string;
            /** Format: date-time */
            updatedAt: string;
        };
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
        DeleteAccountResponseDto: {
            success: boolean;
            authCleanupPending: boolean;
        };
        DataBranchIncludeResponseDto: {
            id: string;
            count: number;
        };
        DataBranchCountResponseDto: {
            id: string;
            label: string;
            count: number;
            includes: components["schemas"]["DataBranchIncludeResponseDto"][];
        };
        DataAppBranchesResponseDto: {
            /** @enum {string} */
            app: "finance" | "ai" | "notifications" | "settings";
            branches: components["schemas"]["DataBranchCountResponseDto"][];
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
        WipeUserDataResponseDto: {
            success: boolean;
            requestedBranches: string[];
            appliedBranches: string[];
            counts: {
                [key: string]: number;
            };
        };
        AuthSessionResponseDto: {
            sub: string;
            email: string | null;
            role: string | null;
        };
        AiRoleUserResponseDto: {
            id: string;
            email: string;
            fullName: string;
            /** @enum {string} */
            role: "USER" | "CONTRIBUTOR" | "ADMIN";
            /** Format: date-time */
            grantedAt: string | null;
            /** Format: date-time */
            updatedAt: string | null;
        };
        UpdateAiRoleDto: Record<string, never>;
        AiRoleAssignmentResponseDto: {
            userId: string;
            /** @enum {string} */
            role: "USER" | "CONTRIBUTOR" | "ADMIN";
            grantedBy: string | null;
            /** Format: date-time */
            grantedAt: string;
        };
        AiConsentResponseDto: {
            contributeToGlobalKnowledge: boolean;
            /** Format: date-time */
            contributionConsentAt: string;
        };
        UpdateConsentDto: Record<string, never>;
        AiEmailLastAttemptResponseDto: {
            /** Format: date-time */
            startedAt: string | null;
            /** Format: date-time */
            finishedAt: string | null;
            /** @enum {string|null} */
            result: "SUCCEEDED" | "FAILED" | "INTERRUPTED" | null;
            errorCode: string | null;
            errorCategory: string | null;
            importedCount: number | null;
            phase: string | null;
        };
        AiEmailLastFailureResponseDto: {
            /** Format: date-time */
            finishedAt: string | null;
            errorCode: string | null;
            errorCategory: string | null;
            importedCount: number | null;
            phase: string | null;
        };
        AiEmailSyncProgressResponseDto: {
            /** @enum {string} */
            status: "running" | "waiting" | "retrying" | "scheduled" | "completed" | "failed";
            /** @enum {string} */
            phase: "bootstrap" | "incremental" | "recovery" | "classifying";
            attempt: number;
            rateLimitRetryCount?: number;
            processedThisRun: number;
            importedThisRun: number;
            batchSize?: number;
            totalEstimate?: number;
            retryAt?: number;
            nextRunAt?: number;
            errorCode?: string;
            providerErrorCode?: string;
            recoveryRange?: {
                from?: string;
                to?: string;
            };
            /** @enum {string} */
            errorCategory?: "authorization" | "configuration" | "rate_limit" | "temporary" | "unknown";
            /** Format: date-time */
            startedAt: string;
            /** Format: date-time */
            updatedAt: string;
        };
        AiEmailConnectionResponseDto: {
            connected: boolean;
            emailAddress?: string;
            /**
             * Format: date-time
             * @description Fecha UTC desde la que se importa correo. Null sin elección.
             */
            importStartAt?: string | null;
            /** @description Dominio de remitente que limita la importación. */
            senderFilter?: string | null;
            /** Format: date-time */
            initialSyncCompletedAt?: string | null;
            /** Format: date-time */
            lastSyncedAt?: string | null;
            /** Format: date-time */
            lastRecoverySyncAt?: string | null;
            lastSyncErrorCode?: string | null;
            lastAttempt?: components["schemas"]["AiEmailLastAttemptResponseDto"] | null;
            lastFailure?: components["schemas"]["AiEmailLastFailureResponseDto"] | null;
            requiresReconnect?: boolean;
            syncProgress?: components["schemas"]["AiEmailSyncProgressResponseDto"] | null;
            syncInProgress?: boolean;
        };
        AiEmailCountersResponseDto: {
            importedMessages: number;
            recentMessages: number;
            bootstrapImportedMessages: number;
        };
        AiEmailReceivedRangeResponseDto: {
            /** Format: date-time */
            firstMessageAt: string | null;
            /** Format: date-time */
            latestMessageAt: string | null;
        };
        AiEmailDashboardResponseDto: {
            connection: components["schemas"]["AiEmailConnectionResponseDto"];
            counters: components["schemas"]["AiEmailCountersResponseDto"];
            receivedRange: components["schemas"]["AiEmailReceivedRangeResponseDto"];
            /** @enum {string} */
            role: "USER" | "CONTRIBUTOR" | "ADMIN";
        };
        AiEmailMessageSummaryResponseDto: {
            id: string;
            /** Format: date-time */
            receivedAt: string;
            fromAddress: string;
            fromDomain: string;
            subject: string;
            /** @enum {string} */
            processingStatus: "INGESTED" | "QUEUED" | "CLASSIFYING" | "PROCESSED" | "REVIEW_REQUIRED" | "DISCARDED" | "FAILED";
            contentFingerprint: string;
        };
        AiEmailMessagePageResponseDto: {
            items: components["schemas"]["AiEmailMessageSummaryResponseDto"][];
            hasMore: boolean;
            nextCursor: string | null;
        };
        AiEmailContentResponseDto: {
            messageId: string;
            rawBody: string | null;
            sanitizedBody: string | null;
            canonicalBody: string | null;
            snippet: string | null;
            /** Format: date-time */
            retentionExpiresAt: string | null;
        };
        AiKnowledgeObservationResponseDto: {
            /** @example 1 */
            sequence: string;
            runId: string | null;
            knowledgeType: string;
            knowledgeKey: string;
            proposedScope: string;
            payload: Record<string, never> | null;
            /** Format: date-time */
            createdAt: string;
        };
        AiHumanVerificationResponseDto: {
            /** @example 1 */
            sequence: string;
            /** @enum {string} */
            verifierRole: "USER" | "CONTRIBUTOR" | "ADMIN";
            /** @enum {string} */
            verdict: "CONFIRMED" | "CORRECTED" | "REJECTED";
            correctedPayload: Record<string, never> | null;
            notes: string | null;
            isGroundTruth: boolean;
            /** Format: date-time */
            createdAt: string;
        };
        AiEmailMessageProvenanceResponseDto: {
            observations: components["schemas"]["AiKnowledgeObservationResponseDto"][];
            verifications: components["schemas"]["AiHumanVerificationResponseDto"][];
        };
        AiEmailClassificationResponseDto: {
            route: string;
            relevance: boolean;
            semanticType: string;
            transaction: Record<string, never> | null;
            confidence: number;
            decisionPath: string;
            knowledgeUsed: Record<string, never>[];
            provider: string | null;
            model: string | null;
            /** Format: date-time */
            createdAt: string;
        };
        AiEmailMessageResponseDto: {
            id: string;
            /** Format: date-time */
            receivedAt: string;
            fromAddress: string;
            fromDomain: string;
            subject: string;
            /** @enum {string} */
            processingStatus: "INGESTED" | "QUEUED" | "CLASSIFYING" | "PROCESSED" | "REVIEW_REQUIRED" | "DISCARDED" | "FAILED";
            contentFingerprint: string;
            userId: string;
            connectionId: string;
            providerMessageId: string;
            providerThreadId: string | null;
            templateFingerprint: string | null;
            classification: Record<string, never> | null;
            classificationPath: string | null;
            classificationProvider: string | null;
            classificationModel: string | null;
            /** Format: date-time */
            createdAt: string;
            /** Format: date-time */
            updatedAt: string;
            content: components["schemas"]["AiEmailContentResponseDto"] | null;
            provenance: components["schemas"]["AiEmailMessageProvenanceResponseDto"];
            classifications: components["schemas"]["AiEmailClassificationResponseDto"][];
        };
        EmailSampleImportDto: Record<string, never>;
        AiEmailSampleImportProgressDto: {
            processed: number;
            total: number;
        };
        AiEmailSampleSelectionDto: {
            /** @enum {string} */
            mode: "IDS" | "SENDER_WINDOW";
            requested: number;
            included: number;
            cap: number;
            sender?: string;
            /** Format: date-time */
            dateFrom?: string;
            /** Format: date-time */
            dateTo?: string;
        };
        AiEmailSampleExecutedDto: {
            applied: number;
            alreadyApplied: number;
            reviewRequired: number;
            rejected: number;
        };
        AiEmailSampleSummaryDto: {
            included: number;
            notFound: number;
            wouldPublishSignal?: number;
            wouldCreateMovement?: number;
            reviewRequired?: number;
            executed?: components["schemas"]["AiEmailSampleExecutedDto"];
        };
        AiEmailSampleClassificationDto: {
            semanticType: string;
            confidence: number;
            /** @enum {string} */
            method: "KNOWLEDGE" | "DETERMINISTIC" | "MODEL";
            movementClass: string | null;
            kind: string | null;
            amount: number | null;
            currency: string | null;
            /** Format: date-time */
            transactionDate: string | null;
            direction: string | null;
        };
        AiEmailSampleHintsDto: {
            bankReference: string | null;
            merchant: string | null;
            last4: string | null;
        };
        AiEmailSampleSignalDto: {
            published: boolean;
            reason?: string;
        };
        AiEmailSampleMovementDto: {
            accountId: string | null;
            cardId: string | null;
            amount: number;
            currency: string;
            /** @enum {string} */
            type: "DEBIT" | "CREDIT";
            status: string;
            /** Format: date-time */
            transactionDate: string;
            description: string;
            categoryId: string | null;
            legRole: string | null;
            externalReference: string | null;
            importReference: string;
        };
        AiEmailSampleCardPaymentDto: {
            sourceAccountId: string;
            cardId: string;
            amount: number;
            currency: string;
            status: string;
            /** Format: date-time */
            transactionDate: string;
            description: string;
            externalReference: string | null;
            importReference: string;
        };
        AiEmailSamplePredictionDto: {
            /** @enum {string} */
            outcome: "APPLIED" | "ALREADY_APPLIED" | "REVIEW_REQUIRED" | "REJECTED" | "UNAVAILABLE";
            reason?: string;
            reviewReasons?: string[];
            movement?: components["schemas"]["AiEmailSampleMovementDto"];
            cardPayment?: components["schemas"]["AiEmailSampleCardPaymentDto"];
        };
        AiEmailSampleExecutionDto: {
            /** @enum {string} */
            outcome: "APPLIED" | "ALREADY_APPLIED" | "REVIEW_REQUIRED" | "REJECTED" | "UNAVAILABLE";
            reason?: string;
            transactionId: string | null;
        };
        AiEmailSampleItemDto: {
            messageId: string;
            /** @enum {string} */
            status: "INCLUDED" | "NOT_FOUND";
            fromAddress: string | null;
            fromDomain: string | null;
            /** Format: date-time */
            receivedAt: string | null;
            provider: string | null;
            model: string | null;
            classification: components["schemas"]["AiEmailSampleClassificationDto"] | null;
            classificationUnavailableReason?: string;
            hints: components["schemas"]["AiEmailSampleHintsDto"] | null;
            signal: components["schemas"]["AiEmailSampleSignalDto"];
            prediction: components["schemas"]["AiEmailSamplePredictionDto"] | null;
            execution?: components["schemas"]["AiEmailSampleExecutionDto"];
        };
        AiEmailSampleImportResponseDto: {
            dryRun: boolean;
            selection: components["schemas"]["AiEmailSampleSelectionDto"];
            summary: components["schemas"]["AiEmailSampleSummaryDto"];
            items: components["schemas"]["AiEmailSampleItemDto"][];
        };
        AiEmailSampleImportJobResponseDto: {
            id: string;
            /** @enum {string} */
            status: "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED";
            dryRun: boolean;
            progress: components["schemas"]["AiEmailSampleImportProgressDto"];
            result: components["schemas"]["AiEmailSampleImportResponseDto"] | null;
            error: string | null;
            createdAt: string;
            startedAt: string | null;
            finishedAt: string | null;
        };
        ConnectGmailDto: {
            /**
             * @description Desde cuándo importar: hoy, el último mes o los últimos 3 meses.
             * @enum {string}
             */
            period?: "TODAY" | "LAST_MONTH" | "LAST_3_MONTHS";
            /**
             * @description Limita la importación a un dominio de remitente.
             * @example bhd.com.do
             */
            senderFilter?: Record<string, never>;
        };
        AiEmailConnectResponseDto: {
            authorizationUrl: string;
        };
        AiEmailSyncResponseDto: {
            connected: boolean;
            syncStarted: boolean;
        };
        SyncBhdScopeDto: Record<string, never>;
        SyncBhdResponseDto: {
            connected: boolean;
            query: string;
            found: number;
            imported: number;
            skipped: number;
            nextPageToken: string | null;
            estimatedTotal: number | null;
        };
        ResetEmailCorpusDto: Record<string, never>;
        AiEmailResetResponseDto: {
            connected: boolean;
            deletedMessages: number;
        };
        AiEmailDiagnosticsResponseDto: {
            configured: boolean;
            /** @example GMAIL */
            provider: string;
            scopes: string[];
            /** @enum {string} */
            status: "ready" | "missing_oauth_configuration";
        };
        DiscoverEmailProductProposalsDto: {
            messageIds?: string[];
            /** @default 200 */
            limit: number;
        };
        EmailProductProposalInstitutionResponseDto: {
            name: string;
            /** @enum {string} */
            type: "bank" | "credit_union" | "digital_wallet" | "broker" | "other";
            domain: Record<string, never> | null;
            country: string;
            /**
             * Format: uuid
             * @description Institución compatible del usuario (dominio o nombre normalizado); solo cuando hay exactamente una.
             */
            matchedInstitutionId: Record<string, never> | null;
            /** @description Todas las instituciones compatibles. Dos o más indican ambigüedad. */
            matchedInstitutionIds: string[];
        };
        EmailProductProposalDraftResponseDto: {
            /** @enum {string} */
            productType: "ACCOUNT" | "CARD";
            name: string;
            /** @example 5678 */
            lastFour: string;
            currency: string;
            /** @enum {string|null} */
            accountType: "CHECKING" | "SAVINGS" | "INVESTMENT" | null;
            /** @enum {string|null} */
            cardType: "CREDIT" | "DEBIT" | null;
            /** @enum {string|null} */
            network: "VISA" | "MASTERCARD" | "AMEX" | "DISCOVER" | "OTHER" | null;
            /** Format: uuid */
            accountId: Record<string, never> | null;
            institution: components["schemas"]["EmailProductProposalInstitutionResponseDto"];
            /** @description Indica si hay un número completo cifrado en la propuesta. */
            accountNumberProvided: boolean;
        };
        EmailProductProposalEvidenceResponseDto: {
            /** Format: uuid */
            messageId: string;
            fromDomain: string;
            subject: string;
            /** Format: date-time */
            receivedAt: string;
            match: {
                [key: string]: unknown;
            };
            /** Format: date-time */
            createdAt: string;
        };
        EmailProductProposalResponseDto: {
            /** Format: uuid */
            id: string;
            /** @enum {string} */
            productType: "ACCOUNT" | "CARD";
            /** @enum {string} */
            status: "PENDING" | "APPROVING" | "APPROVED" | "DISCARDED";
            /**
             * Format: uuid
             * @description Producto activo compatible que ya existe; se vincula con approve { productId }. Solo cuando hay exactamente uno.
             */
            matchedProductId: Record<string, never> | null;
            /** @description Productos activos compatibles. Dos o más indican ambigüedad y no se vinculan solos. */
            matchedProductIds: string[];
            draft: components["schemas"]["EmailProductProposalDraftResponseDto"];
            /** Format: uuid */
            approvedProductId: Record<string, never> | null;
            /** Format: date-time */
            createdAt: string;
            evidence: components["schemas"]["EmailProductProposalEvidenceResponseDto"][];
            approval?: {
                duplicate?: boolean;
                /** Format: uuid */
                productId?: string;
                reevaluatedSignals?: number;
            };
        };
        DiscoverEmailProductProposalsResponseDto: {
            scanned: number;
            limit: number;
            limitReached: boolean;
            created: number;
            evidenceAdded: number;
            ignored: number;
            /** @description Correos con un producto que ya existe, activo, en una institución compatible. */
            alreadyExists: number;
            /** @description Correos con varios productos compatibles: no se crea propuesta. */
            ambiguous: number;
            proposals: components["schemas"]["EmailProductProposalResponseDto"][];
        };
        UpdateEmailProductProposalDto: {
            name?: string;
            /** @enum {string} */
            accountType?: "CHECKING" | "SAVINGS" | "INVESTMENT";
            /** @enum {string} */
            cardType?: "CREDIT" | "DEBIT";
            /** @example DOP */
            currency?: string;
            /** @example 5678 */
            lastFour?: string;
            accountNumber?: Record<string, never> | null;
            /** @enum {string} */
            network?: "VISA" | "MASTERCARD" | "AMEX" | "DISCOVER" | "OTHER";
            /** Format: uuid */
            accountId?: Record<string, never> | null;
            institutionName?: string;
            /** @enum {string} */
            institutionType?: "bank" | "credit_union" | "digital_wallet" | "broker" | "other";
            institutionDomain?: Record<string, never> | null;
            institutionCountry?: string;
        };
        ApproveEmailProductProposalDto: {
            /**
             * Format: uuid
             * @description Producto creado con POST /finance/accounts o /finance/cards. Sin él, el back crea el producto desde el borrador (comportamiento anterior).
             */
            productId?: string;
        };
        AiDatasetPartitionsResponseDto: {
            TRAIN: number;
            VALIDATION: number;
            HOLDOUT: number;
        };
        AiDatasetResponseDto: {
            id: string;
            name: string;
            partitions: components["schemas"]["AiDatasetPartitionsResponseDto"];
        };
        AiReviewItemVerificationResponseDto: {
            /** @enum {string} */
            verdict: "CONFIRMED" | "CORRECTED" | "REJECTED";
            labels: Record<string, never> | null;
            notes: string | null;
            /** Format: date-time */
            createdAt: string;
        };
        AiReviewQueueItemResponseDto: {
            id: string;
            /** Format: date-time */
            receivedAt: string;
            fromAddress: string;
            fromDomain: string;
            subject: string;
            contentFingerprint: string;
            processingStatus: string;
            /** @enum {string} */
            partition: "TRAIN" | "VALIDATION" | "HOLDOUT";
            /** @enum {string} */
            status: "PENDING" | "CONFIRMED" | "CORRECTED" | "REJECTED";
            /** @enum {string|null} */
            semanticType: "FIN_TRANSACTION" | "PURCHASE_RECEIPT" | "SUBSCRIPTION_BILLING" | "FIN_STATEMENT_NOTICE" | "FIN_ACCOUNT_NOTICE" | "SECURITY_OTP" | "SECURITY_ALERT" | "TECH_NOTIFICATION" | "JOB" | "CALENDAR_EVENT" | "MARKETING" | "SOCIAL" | "OTHER" | null;
            routes: ("FINANCE" | "SUBSCRIPTIONS" | "CALENDAR" | "SECURITY")[];
            confidence: number | null;
            verification: components["schemas"]["AiReviewItemVerificationResponseDto"] | null;
        };
        AiReviewQueueCountsResponseDto: {
            all: number;
            TRAIN: number;
            VALIDATION: number;
            HOLDOUT: number;
        };
        AiReviewQueueResponseDto: {
            items: components["schemas"]["AiReviewQueueItemResponseDto"][];
            counts: components["schemas"]["AiReviewQueueCountsResponseDto"];
            hasMore: boolean;
            nextCursor: string | null;
        };
        AiReviewGroupResponseDto: {
            fromAddress: string;
            templateFingerprint: string | null;
            total: number;
            pending: number;
            pendingHoldout: number;
            sampleSubjects: string[];
            sampleMessageIds: string[];
        };
        AiReviewGroupsPageResponseDto: {
            items: components["schemas"]["AiReviewGroupResponseDto"][];
            page: number;
            pageSize: number;
            totalGroups: number;
            hasMore: boolean;
        };
        HumanVerificationTransactionDto: {
            /** @enum {string} */
            kind?: "TRANSACTION" | "PENDING" | "NOT_TRANSACTION";
            amount?: number;
            /** @example DOP */
            currency?: string;
            /** Format: date-time */
            transactionDate?: string;
            /** Format: date-time */
            suggestedTransactionDate?: string;
            /** @enum {string} */
            suggestedTransactionDateSource?: "EMAIL_HEADER";
            /** @enum {string} */
            direction?: "DEBIT" | "CREDIT" | "TRANSFER";
            merchant?: string;
            bankReference?: string;
            last4?: string;
            /** @description Terminación de la cuenta propia de origen; en una transferencia es la única pista de cuenta. */
            accountNumberLast4?: string;
            /** @enum {string} */
            movementClass?: "PURCHASE" | "INCOME" | "PAYROLL" | "ATM_WITHDRAWAL" | "TRANSFER_OUT" | "TRANSFER_IN" | "CARD_PAYMENT" | "FEE" | "REFUND" | "OTHER";
            /** @description Referencia del movimiento original de un reverso. */
            reverseOfBankReference?: string;
            /** @description Id del correo original de un reverso. */
            reverseOfEmailMessageId?: string;
        };
        CreateReviewGroupVerificationDto: {
            relevance?: boolean;
            /** @enum {string} */
            semanticType?: "FIN_TRANSACTION" | "PURCHASE_RECEIPT" | "SUBSCRIPTION_BILLING" | "FIN_STATEMENT_NOTICE" | "FIN_ACCOUNT_NOTICE" | "SECURITY_OTP" | "SECURITY_ALERT" | "TECH_NOTIFICATION" | "JOB" | "CALENDAR_EVENT" | "MARKETING" | "SOCIAL" | "OTHER";
            routes?: ("FINANCE" | "SUBSCRIPTIONS" | "CALENDAR" | "SECURITY")[];
            transaction?: components["schemas"]["HumanVerificationTransactionDto"];
            notes?: string;
            /** @enum {string} */
            verdict: "CONFIRMED" | "CORRECTED";
            /** @example notifications@github.com */
            fromAddress: string;
            /** @description Huella de la plantilla de asunto del grupo. Null agrupa los correos del remitente sin huella. */
            templateFingerprint?: Record<string, never> | null;
        };
        AiReviewGroupVerificationResultResponseDto: {
            verified: number;
            holdoutExcluded: number;
            alreadyVerified: number;
            /** @description Correos de la misma plantilla reencolados y reclasificados con la etiqueta verificada. */
            requeued: number;
        };
        CreateReviewSelectionVerificationDto: {
            relevance?: boolean;
            /** @enum {string} */
            semanticType?: "FIN_TRANSACTION" | "PURCHASE_RECEIPT" | "SUBSCRIPTION_BILLING" | "FIN_STATEMENT_NOTICE" | "FIN_ACCOUNT_NOTICE" | "SECURITY_OTP" | "SECURITY_ALERT" | "TECH_NOTIFICATION" | "JOB" | "CALENDAR_EVENT" | "MARKETING" | "SOCIAL" | "OTHER";
            routes?: ("FINANCE" | "SUBSCRIPTIONS" | "CALENDAR" | "SECURITY")[];
            transaction?: components["schemas"]["HumanVerificationTransactionDto"];
            notes?: string;
            messageIds: string[];
            /** @enum {string} */
            verdict: "CONFIRMED" | "CORRECTED" | "REJECTED";
        };
        AiReviewSelectionVerificationResponseDto: {
            verified: number;
            alreadyVerified: number;
            /** @description Correos reencolados y reclasificados después de registrar la selección. */
            requeued: number;
        };
        CreateHumanVerificationDto: {
            relevance?: boolean;
            /** @enum {string} */
            semanticType?: "FIN_TRANSACTION" | "PURCHASE_RECEIPT" | "SUBSCRIPTION_BILLING" | "FIN_STATEMENT_NOTICE" | "FIN_ACCOUNT_NOTICE" | "SECURITY_OTP" | "SECURITY_ALERT" | "TECH_NOTIFICATION" | "JOB" | "CALENDAR_EVENT" | "MARKETING" | "SOCIAL" | "OTHER";
            routes?: ("FINANCE" | "SUBSCRIPTIONS" | "CALENDAR" | "SECURITY")[];
            transaction?: components["schemas"]["HumanVerificationTransactionDto"];
            notes?: string;
            /** @enum {string} */
            verdict: "CONFIRMED" | "CORRECTED" | "REJECTED";
        };
        AiMessageVerificationResponseDto: {
            /** @example 1 */
            sequence: string;
            /** @enum {string} */
            verifierRole: "USER" | "CONTRIBUTOR" | "ADMIN";
            targetType: string;
            targetId: string | null;
            /** @enum {string} */
            verdict: "CONFIRMED" | "CORRECTED" | "REJECTED";
            correctedPayload: Record<string, never> | null;
            notes: string | null;
            isGroundTruth: boolean;
            /** @description Correos de la misma plantilla reencolados y reclasificados con la etiqueta verificada. */
            requeued: number;
            /** Format: date-time */
            createdAt: string;
        };
        AiAnalysisRunResponseDto: {
            id: string;
            datasetId: string;
            /** @enum {string} */
            mode: "ANALYZE_ONLY" | "EVALUATE" | "IMPORT";
            /** @enum {string} */
            status: "RUNNING" | "COMPLETED" | "FAILED";
            /** @example 1 */
            observationSequence: string;
            /** @example 1 */
            verificationSequence: string;
            /** @example 1 */
            consentRevision: string;
            /** @enum {string} */
            reproductionStatus: "COMPLETE" | "INCOMPLETE";
            missingEvidence: Record<string, never>;
            projectorVersion: string;
            policyVersion: string;
            pipelineVersion: string;
            detectorVersion: string | null;
            promptVersion: string | null;
            schemaVersion: string | null;
            configuration: Record<string, never>;
            metrics: Record<string, never> | null;
            /** Format: date-time */
            startedAt: string;
            /** Format: date-time */
            completedAt: string | null;
            error: string | null;
        };
        CompareAnalysisRunsDto: {
            firstRunId: string;
            secondRunId: string;
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
            /** @example 9012 */
            accountNumberLast4?: string;
            /** @enum {string} */
            movementClass?: "PURCHASE" | "INCOME" | "PAYROLL" | "ATM_WITHDRAWAL" | "TRANSFER_OUT" | "TRANSFER_IN" | "CARD_PAYMENT" | "FEE" | "REFUND" | "OTHER";
            /** Format: date-time */
            suggestedTransactionDate?: string;
            /** @enum {string} */
            suggestedTransactionDateSource?: "EMAIL_HEADER";
            reverseOfBankReference?: string;
            reverseOfEmailMessageId?: string;
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
        AiSignalEvidenceResponseDto: {
            /** @example EMAIL_CLASSIFICATION */
            sourceType: string;
            sourceId: string;
            excerpt: Record<string, never>;
            /** Format: date-time */
            createdAt: string;
        };
        AiSignalResponseDto: {
            id: string;
            type: string;
            domain: string;
            /** @enum {string} */
            status: "DETECTED" | "VALIDATED" | "ROUTED" | "CONSUMED" | "DISMISSED" | "SUPERSEDED" | "FAILED";
            sourceType: string;
            sourceId: string;
            payload: Record<string, never>;
            correlationKey: string;
            /** Format: date-time */
            occurredAt: string;
            /** Format: date-time */
            detectedAt: string;
            confidence?: number;
            evidence: components["schemas"]["AiSignalEvidenceResponseDto"][];
        };
        AiSignalListResponseDto: {
            data: components["schemas"]["AiSignalResponseDto"][];
        };
        AiInvocationEntityRefDto: {
            /** @enum {string} */
            type: "transaction" | "account" | "card" | "loan" | "budget" | "savings_goal" | "receivable" | "subscription" | "merchant" | "category";
            /** Format: uuid */
            id: string;
        };
        AiInvocationContextDto: {
            /** @example /finance/products/transactions */
            route: string;
            view?: string;
            sheet?: string;
            entityRef?: components["schemas"]["AiInvocationEntityRefDto"];
            filters?: {
                [key: string]: unknown;
            };
        };
        CreateAiConversationDto: {
            context?: components["schemas"]["AiInvocationContextDto"];
        };
        AiConversationCreatedDto: {
            id: string;
            title: string;
            /** Format: date-time */
            createdAt: string;
            /** Format: date-time */
            updatedAt: string;
        };
        AiConversationSummaryDto: {
            id: string;
            title: string;
            messageCount: number;
            /** Format: date-time */
            createdAt: string;
            /** Format: date-time */
            updatedAt: string;
        };
        AiConversationPageDto: {
            items: components["schemas"]["AiConversationSummaryDto"][];
            nextCursor: string | null;
            hasMore: boolean;
        };
        AiConversationMessageDto: {
            /** @enum {string} */
            role: "user" | "assistant";
            content: string;
            /** Format: date-time */
            createdAt: string;
        };
        AiConversationDetailDto: {
            id: string;
            title: string;
            context?: components["schemas"]["AiInvocationContextDto"] | null;
            messages: components["schemas"]["AiConversationMessageDto"][];
            /** Format: date-time */
            createdAt: string;
            /** Format: date-time */
            updatedAt: string;
        };
        AiConversationLatestDto: {
            conversation: components["schemas"]["AiConversationDetailDto"] | null;
        };
        SendAiConversationMessageDto: {
            /** @example ¿Cuánto gasté este mes? */
            content: string;
            /** @description Identidad del turno para reintentar sin duplicar el mensaje del usuario */
            clientMessageId?: string;
            /** @description Responde text/event-stream con los eventos del turno */
            stream?: boolean;
            context?: components["schemas"]["AiInvocationContextDto"];
        };
        AiConversationActionDto: {
            id: string;
            actionType: string;
            targetModule: string;
            /** @enum {string} */
            policy: "AUTO_ALLOWED" | "CONFIRM_REQUIRED" | "FORBIDDEN";
            /** @enum {string} */
            status: "PENDING" | "RUNNING" | "SUCCESS" | "FAILED" | "CANCELLED";
            /** @enum {string} */
            outcome: "PENDING_CONFIRMATION" | "EXECUTED" | "ALREADY_EXECUTED" | "ALREADY_CLAIMED" | "FORBIDDEN" | "FAILED" | "CANCELLED";
            payload: {
                [key: string]: unknown;
            };
            result: {
                [key: string]: unknown;
            } | null;
            /** Format: date-time */
            createdAt: string;
        };
        AiConversationAnswerDto: {
            conversationId: string;
            answer: string;
            provider: string;
            model: string;
            actions?: components["schemas"]["AiConversationActionDto"][];
        };
        AiActionDto: {
            id: string;
            actionType: string;
            targetModule: string;
            /** @enum {string} */
            policy: "AUTO_ALLOWED" | "CONFIRM_REQUIRED" | "FORBIDDEN";
            /** @enum {string} */
            status: "PENDING" | "RUNNING" | "SUCCESS" | "FAILED" | "CANCELLED";
            payload: {
                [key: string]: unknown;
            };
            result: {
                [key: string]: unknown;
            } | null;
            /** Format: date-time */
            createdAt: string;
            executedAt: Record<string, never> | null;
        };
        AiActionResultDto: {
            /** @enum {string} */
            outcome: "PENDING_CONFIRMATION" | "EXECUTED" | "ALREADY_EXECUTED" | "ALREADY_CLAIMED" | "FORBIDDEN" | "FAILED" | "CANCELLED";
            action: components["schemas"]["AiActionDto"];
        };
        ViewSuggestionActionDto: {
            id: string;
            actionType: string;
            targetModule: string;
            /** @enum {string} */
            policy: "AUTO_ALLOWED" | "CONFIRM_REQUIRED" | "FORBIDDEN";
            /** @enum {string} */
            status: "PENDING" | "RUNNING" | "SUCCESS" | "FAILED" | "CANCELLED";
            payload: Record<string, never>;
        };
        ViewSuggestionDto: {
            id: string;
            label: string;
            prompt: string;
            action?: components["schemas"]["ViewSuggestionActionDto"] | null;
        };
        ViewSuggestionsListDto: {
            suggestions: components["schemas"]["ViewSuggestionDto"][];
        };
        ViewSuggestionDismissedDto: {
            dismissed: boolean;
        };
        ProactiveSuggestionDto: {
            id: string;
            signalId: string;
            signalType: string;
            title: string;
            body: string;
            actionId: string | null;
            createdAt: string;
        };
        ProactiveSuggestionLimitsDto: {
            discarded: number;
            windowStartedAt: string | null;
        };
        ProactiveSuggestionsResponseDto: {
            suggestions: components["schemas"]["ProactiveSuggestionDto"][];
            limits: components["schemas"]["ProactiveSuggestionLimitsDto"];
        };
        ImportReviewItemResponseDto: {
            id: string;
            signalId: string;
            sourceEmailMessageId: string;
            reviewReason: string | null;
            candidate: Record<string, never>;
            /** Format: date-time */
            createdAt: string;
            /** Format: date-time */
            updatedAt: string;
        };
        ResolveImportReviewDto: {
            /**
             * @description SET_DATE fija la fecha, SET_DESTINATION elige cuenta o tarjeta, LINK_REVERSAL enlaza el original y DISCARD descarta el import.
             * @enum {string}
             */
            action: "SET_DATE" | "SET_DESTINATION" | "LINK_REVERSAL" | "DISCARD";
            /**
             * Format: date-time
             * @description Fecha de operación para SET_DATE
             */
            transactionDate?: string;
            /** @description Cuenta de destino para SET_DESTINATION */
            accountId?: string;
            /** @description Tarjeta de destino para SET_DESTINATION */
            cardId?: string;
            /** @description Movimiento original para LINK_REVERSAL */
            originalTransactionId?: string;
            /** @description Motivo obligatorio para DISCARD */
            reason?: string;
        };
        ImportReviewResolutionResponseDto: {
            id: string;
            /** @enum {string} */
            status: "IMPORTED" | "DUPLICATE" | "REVERSED" | "DISMISSED";
            /** @enum {string} */
            outcome: "IMPORTED" | "DUPLICATE" | "REVERSED" | "DISMISSED";
            transactionId: string | null;
            reviewReason: string | null;
        };
        ExchangeRateResponseDto: {
            /** @example USD */
            currency: string;
            /** @example 58.50 */
            rate: string | null;
        };
        ExchangeRatesResponseDto: {
            /** @example DOP */
            baseCurrency: string;
            /**
             * Format: date
             * @example 2026-11-01
             */
            date: string;
            rates: components["schemas"]["ExchangeRateResponseDto"][];
        };
        ChangeBaseCurrencyDto: {
            /**
             * @description New ISO-3 base currency
             * @example USD
             */
            baseCurrency: string;
        };
        ChangeBaseCurrencyResponseDto: {
            /** @example USD */
            baseCurrency: string;
            /** @example DOP */
            previousBaseCurrency: string;
            rebasedTransactions: number;
            rebasedBudgets: number;
        };
        AccountResponseDto: {
            id: string;
            institutionId: string | null;
            institutionName: string | null;
            institutionLogoUrl: string | null;
            institutionColor: string | null;
            name: string;
            /** @enum {string} */
            type: "CHECKING" | "SAVINGS" | "CASH" | "INVESTMENT";
            /** @example DOP */
            currency: string;
            accountNumberLast4: string | null;
            isDefaultForInstitution: boolean;
            /** @example 1500.00 */
            balance: string;
            /** @example 0.00 */
            earmarkedAmount: string;
            /** @example 1500.00 */
            freeBalance: string;
            color: string | null;
            isActive: boolean;
            /** Format: date-time */
            createdAt: string;
            /** Format: date-time */
            updatedAt: string;
        };
        AccountPageResponseDto: {
            items: components["schemas"]["AccountResponseDto"][];
            nextCursor: string | null;
            hasMore: boolean;
        };
        CreateAccountDto: {
            /** @description Required for CHECKING, SAVINGS, and INVESTMENT. Optional for CASH. */
            institutionId?: string;
            name: string;
            /** @enum {string} */
            type: "CHECKING" | "SAVINGS" | "CASH" | "INVESTMENT";
            /**
             * @description Optional full account number for CHECKING, SAVINGS, and INVESTMENT; when supplied it is encrypted at rest.
             * @example 001122335678
             */
            accountNumber?: string;
            /**
             * @description Last four digits for CHECKING, SAVINGS, and INVESTMENT accounts when the full number is unavailable. Must match accountNumber when both are supplied.
             * @example 5678
             */
            accountNumberLast4?: string;
            /**
             * @default DOP
             * @example DOP
             */
            currency: string;
            color?: string;
            /** @description When true, this account is the fallback ledger target for imported movements from this institution that have no account digits. */
            isDefaultForInstitution?: boolean;
        };
        InstrumentHistoryItemDto: {
            id: string;
            /** @example ADJUSTMENT */
            kind: string;
            /** Format: date-time */
            at: string;
            /** @example 1500.00 */
            amount: string | null;
            /** @example DOP */
            currency: string | null;
            payload: Record<string, never>;
        };
        InstrumentHistoryPageResponseDto: {
            items: components["schemas"]["InstrumentHistoryItemDto"][];
            nextCursor: string | null;
            hasMore: boolean;
        };
        UpdateAccountDto: {
            /** @description Required for CHECKING, SAVINGS, and INVESTMENT. Optional for CASH. */
            institutionId?: string;
            name?: string;
            /** @enum {string} */
            type?: "CHECKING" | "SAVINGS" | "CASH" | "INVESTMENT";
            /**
             * @description Optional full account number for CHECKING, SAVINGS, and INVESTMENT; when supplied it is encrypted at rest.
             * @example 001122335678
             */
            accountNumber?: string;
            /**
             * @description Last four digits for CHECKING, SAVINGS, and INVESTMENT accounts when the full number is unavailable. Must match accountNumber when both are supplied.
             * @example 5678
             */
            accountNumberLast4?: string;
            /**
             * @default DOP
             * @example DOP
             */
            currency: string;
            color?: string;
            /** @description When true, this account is the fallback ledger target for imported movements from this institution that have no account digits. */
            isDefaultForInstitution?: boolean;
            isActive?: boolean;
        };
        SuccessResponseDto: {
            /** @example true */
            success: boolean;
        };
        InstitutionResponseDto: {
            id: string;
            name: string;
            /**
             * @description bank | credit_union | digital_wallet | broker | cash | other
             * @example bank
             */
            type: string;
            shortName: string | null;
            sortOrder: number;
            domain: string | null;
            color: string | null;
            logoUrl: string | null;
            /** @example DO */
            country: string;
            isActive: boolean;
            /** @description System institutions such as «Efectivo» cannot be edited. */
            isSystem: boolean;
        };
        InstitutionPageResponseDto: {
            items: components["schemas"]["InstitutionResponseDto"][];
            nextCursor: string | null;
            hasMore: boolean;
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
        CardBalanceResponseDto: {
            id: string;
            /** @example DOP */
            currency: string;
            /** @example 1500.00 */
            balance: string;
            /** @example 50000.00 */
            creditLimit: string | null;
            /** @example 48500.00 */
            availableCredit: string | null;
        };
        CardResponseDto: {
            id: string;
            institutionId: string;
            institutionName: string;
            institutionLogoUrl: string | null;
            institutionColor: string | null;
            networkLogoUrl: string | null;
            accountId: string | null;
            /** @description Linked account name; only debit cards have one. */
            accountName: string | null;
            name: string;
            /** @enum {string} */
            type: "CREDIT" | "DEBIT";
            /** @enum {string|null} */
            network: "VISA" | "MASTERCARD" | "AMEX" | "DISCOVER" | "OTHER" | null;
            /** @example 4242 */
            lastFour: string | null;
            /** @example 15 */
            statementClosingDay: number | null;
            /** @example 5 */
            paymentDueDay: number | null;
            /** Format: date */
            nextStatementDate: string | null;
            /** Format: date */
            nextPaymentDueDate: string | null;
            color: string | null;
            isActive: boolean;
            balances: components["schemas"]["CardBalanceResponseDto"][];
        };
        CardPageResponseDto: {
            items: components["schemas"]["CardResponseDto"][];
            nextCursor: string | null;
            hasMore: boolean;
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
        CardBalanceMutationResponseDto: {
            id: string;
            cardId: string;
            /** @example DOP */
            currency: string;
            /** @example 1500.00 */
            balance: string;
            /** @example 50000.00 */
            creditLimit: string | null;
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
        CategoryResponseDto: {
            id: string;
            userId: string | null;
            name: string;
            icon: string | null;
            color: string | null;
            parentId: string | null;
            isSystem: boolean;
            systemKind: string | null;
            /** @enum {string} */
            type: "EXPENSE" | "INCOME";
            /** Format: date-time */
            createdAt: string;
            /** Format: date-time */
            updatedAt: string;
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
        PlanningLinkResponseDto: {
            /** @enum {string} */
            kind: "TRANSFER" | "LOAN_INSTALLMENT" | "RECEIVABLE_PAYMENT" | "SAVINGS_CONTRIBUTION";
            targetId: string;
            label: string;
        };
        TransactionOperationLegResponseDto: {
            id: string;
            accountId: string | null;
            accountName: string | null;
            cardId: string | null;
            cardName: string | null;
            /** @enum {string} */
            type: "DEBIT" | "CREDIT" | "TRANSFER" | "ADJUSTMENT" | "CARD_PAYMENT";
            /** @example 1500.00 */
            amount: string;
            /** @example 1500.00 */
            ledgerAmount: string;
            /** @example 1500.00 */
            amountBaseCurrency: string;
            /** @example DOP */
            currency: string;
            /** @example DOP */
            ledgerCurrency?: string | null;
            /** @example 1.00 */
            exchangeRate: string;
            merchant: string | null;
            merchantId: string | null;
            merchantName: string | null;
            merchantLogoUrl: string | null;
            description: string | null;
            /** Format: date-time */
            transactionDate: string;
            /** @enum {string} */
            status: "PENDING" | "CONFIRMED" | "CANCELLED" | "DECLINED" | "REVERSED";
            /** @enum {string} */
            editable: "FULL" | "METADATA" | "NOTES" | "NONE";
            /** @enum {string} */
            source: "MANUAL" | "EMAIL" | "AI";
            categoryId: string | null;
            notes: string | null;
            transferGroupId: string | null;
            transferToAccountId: string | null;
            transferToAccountName: string | null;
            transferToCardId: string | null;
            transferToCardName: string | null;
            /** @example 1500.00 */
            transferToAmount: string | null;
            /** @example DOP */
            transferToCurrency: string | null;
            transferEstimated: boolean;
            institutionLogoUrl: string | null;
            network: string | null;
            networkLogoUrl: string | null;
            transferToInstitutionLogoUrl: string | null;
            transferToNetwork: string | null;
            transferToNetworkLogoUrl: string | null;
            linkedTransactionId: string | null;
            possibleDuplicateOfId: string | null;
            planningLink?: components["schemas"]["PlanningLinkResponseDto"] | null;
            aiMetadata?: Record<string, never> | null;
            /** Format: date-time */
            createdAt: string;
            /** @example SOURCE */
            legRole: string | null;
        };
        TransactionOperationResponseDto: {
            id: string;
            accountId: string | null;
            accountName: string | null;
            cardId: string | null;
            cardName: string | null;
            /** @enum {string} */
            type: "DEBIT" | "CREDIT" | "TRANSFER" | "ADJUSTMENT" | "CARD_PAYMENT";
            /** @example 1500.00 */
            amount: string;
            /** @example 1500.00 */
            ledgerAmount: string;
            /** @example 1500.00 */
            amountBaseCurrency: string;
            /** @example DOP */
            currency: string;
            /** @example DOP */
            ledgerCurrency?: string | null;
            /** @example 1.00 */
            exchangeRate: string;
            merchant: string | null;
            merchantId: string | null;
            merchantName: string | null;
            merchantLogoUrl: string | null;
            description: string | null;
            /** Format: date-time */
            transactionDate: string;
            /** @enum {string} */
            status: "PENDING" | "CONFIRMED" | "CANCELLED" | "DECLINED" | "REVERSED";
            /** @enum {string} */
            editable: "FULL" | "METADATA" | "NOTES" | "NONE";
            /** @enum {string} */
            source: "MANUAL" | "EMAIL" | "AI";
            categoryId: string | null;
            notes: string | null;
            transferGroupId: string | null;
            transferToAccountId: string | null;
            transferToAccountName: string | null;
            transferToCardId: string | null;
            transferToCardName: string | null;
            /** @example 1500.00 */
            transferToAmount: string | null;
            /** @example DOP */
            transferToCurrency: string | null;
            transferEstimated: boolean;
            institutionLogoUrl: string | null;
            network: string | null;
            networkLogoUrl: string | null;
            transferToInstitutionLogoUrl: string | null;
            transferToNetwork: string | null;
            transferToNetworkLogoUrl: string | null;
            linkedTransactionId: string | null;
            possibleDuplicateOfId: string | null;
            planningLink?: components["schemas"]["PlanningLinkResponseDto"] | null;
            aiMetadata?: Record<string, never> | null;
            /** Format: date-time */
            createdAt: string;
            /** @enum {string} */
            kind: "OPERATION";
            /** @enum {string} */
            operationType: "TRANSFER";
            legs: components["schemas"]["TransactionOperationLegResponseDto"][];
        };
        TransactionResponseDto: {
            id: string;
            accountId: string | null;
            accountName: string | null;
            cardId: string | null;
            cardName: string | null;
            /** @enum {string} */
            type: "DEBIT" | "CREDIT" | "TRANSFER" | "ADJUSTMENT" | "CARD_PAYMENT";
            /** @example 1500.00 */
            amount: string;
            /** @example 1500.00 */
            ledgerAmount: string;
            /** @example 1500.00 */
            amountBaseCurrency: string;
            /** @example DOP */
            currency: string;
            /** @example DOP */
            ledgerCurrency?: string | null;
            /** @example 1.00 */
            exchangeRate: string;
            merchant: string | null;
            merchantId: string | null;
            merchantName: string | null;
            merchantLogoUrl: string | null;
            description: string | null;
            /** Format: date-time */
            transactionDate: string;
            /** @enum {string} */
            status: "PENDING" | "CONFIRMED" | "CANCELLED" | "DECLINED" | "REVERSED";
            /** @enum {string} */
            editable: "FULL" | "METADATA" | "NOTES" | "NONE";
            /** @enum {string} */
            source: "MANUAL" | "EMAIL" | "AI";
            categoryId: string | null;
            notes: string | null;
            transferGroupId: string | null;
            transferToAccountId: string | null;
            transferToAccountName: string | null;
            transferToCardId: string | null;
            transferToCardName: string | null;
            /** @example 1500.00 */
            transferToAmount: string | null;
            /** @example DOP */
            transferToCurrency: string | null;
            transferEstimated: boolean;
            institutionLogoUrl: string | null;
            network: string | null;
            networkLogoUrl: string | null;
            transferToInstitutionLogoUrl: string | null;
            transferToNetwork: string | null;
            transferToNetworkLogoUrl: string | null;
            linkedTransactionId: string | null;
            possibleDuplicateOfId: string | null;
            planningLink?: components["schemas"]["PlanningLinkResponseDto"] | null;
            aiMetadata?: Record<string, never> | null;
            /** Format: date-time */
            createdAt: string;
        };
        TransactionPageResponseDto: {
            items: (components["schemas"]["TransactionResponseDto"] | components["schemas"]["TransactionOperationResponseDto"])[];
            nextCursor: string | null;
            hasMore: boolean;
        };
        AdjustBalanceDto: {
            accountId?: string;
            cardId?: string;
            /** @example DOP */
            currency?: string;
            /** @description Target balance after the adjustment */
            balance: number;
        };
        AdjustBalanceResponseDto: {
            adjusted: boolean;
            /** @example 1500 */
            balance: number;
            transaction: components["schemas"]["TransactionResponseDto"] | null;
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
        DeleteResponseDto: {
            /** @example true */
            success: boolean;
            /** @description Id para deshacer el borrado */
            undoId: string;
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
        TransferResponseDto: {
            transferGroupId: string;
            debit: components["schemas"]["TransactionResponseDto"];
            credit: components["schemas"]["TransactionResponseDto"];
            suggestGoalId?: string;
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
            /**
             * @description Confirma el pago aunque ya exista uno importado por correo con los mismos datos.
             * @default false
             */
            duplicateAcknowledged: boolean;
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
            /**
             * @description Confirma el pago aunque ya exista uno importado por correo con los mismos datos.
             * @default false
             */
            duplicateAcknowledged: boolean;
        };
        MerchantListItemResponseDto: {
            id: string;
            name: string;
            normalizedKey: string;
            aliases: string[];
            categoryId: string | null;
            /** @enum {string|null} */
            categorySource: "MANUAL" | "LEARNED" | "KEYWORD" | null;
            domain: string | null;
            logoUrl: string | null;
            /** Format: date-time */
            createdAt: string;
            /** @example 1500.00 */
            monthSpend: string;
            monthMovements: number;
            possibleDuplicates: number;
        };
        MerchantPageResponseDto: {
            items: components["schemas"]["MerchantListItemResponseDto"][];
            nextCursor: string | null;
            hasMore: boolean;
        };
        MerchantSuggestResponseDto: {
            merchantId: string;
            name: string;
            categoryId: string | null;
            /** @enum {string|null} */
            categorySource: "MANUAL" | "LEARNED" | "KEYWORD" | null;
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
        MerchantResponseDto: {
            id: string;
            name: string;
            normalizedKey: string;
            aliases: string[];
            categoryId: string | null;
            /** @enum {string|null} */
            categorySource: "MANUAL" | "LEARNED" | "KEYWORD" | null;
            domain: string | null;
            logoUrl: string | null;
            /** Format: date-time */
            createdAt: string;
            /** @example 1500.00 */
            monthSpend: string;
            monthMovements: number;
        };
        MerchantDuplicateResponseDto: {
            id: string;
            name: string;
            logoUrl: string | null;
            /** @example 1500.00 */
            monthSpend: string;
            monthMovements: number;
            /** @enum {string} */
            reason: "SAME_KEY" | "ALIAS_MATCH" | "TRAILING_NUMBER" | "NAME_CONTAINED" | "SIMILAR_NAME";
        };
        MerchantDuplicateDismissResponseDto: {
            dismissed: boolean;
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
        SubscriptionCategoryResponseDto: {
            id: string;
            name: string;
            icon: string | null;
            color: string | null;
        };
        PaymentMethodResponseDto: {
            /** @enum {string} */
            type: "CARD" | "ACCOUNT";
            id: string;
            name: string;
            institution: string | null;
            last4: string | null;
            logoUrl: string | null;
        };
        SubscriptionResponseDto: {
            id: string;
            name: string;
            normalizedKey: string;
            domain: string | null;
            logoUrl: string | null;
            /** @example 1500.00 */
            amount: string;
            /** @example DOP */
            currency: string;
            /** @enum {string} */
            billingCycle: "WEEKLY" | "MONTHLY" | "QUARTERLY" | "SEMIANNUAL" | "YEARLY";
            billingInterval: number;
            /** Format: date */
            anchorDate: string;
            /** Format: date */
            nextBillingDate: string;
            /** Format: date */
            trialEndsAt: string | null;
            /** @enum {string} */
            status: "ACTIVE" | "PAUSED" | "CANCELLED";
            /** Format: date-time */
            pausedAt: string | null;
            /** Format: date-time */
            cancelledAt: string | null;
            reminderDaysBefore: number;
            lastChargeMismatch: boolean;
            /** @example 1500.00 */
            lastPaymentAmount: string | null;
            /** Format: date */
            lastRemindedFor: string | null;
            cardId: string | null;
            cardName: string | null;
            accountId: string | null;
            accountName: string | null;
            categoryId: string | null;
            category: components["schemas"]["SubscriptionCategoryResponseDto"] | null;
            paymentMethod: components["schemas"]["PaymentMethodResponseDto"] | null;
            manageUrl: string | null;
            notes: string | null;
            sourcePatternId: string | null;
            /** @example 125.00 */
            monthlyEquivalent: string;
            /** @example 1500.00 */
            annualEquivalent: string;
            daysUntil: number;
            /** Format: date-time */
            createdAt: string;
            /** Format: date-time */
            updatedAt: string;
        };
        SubscriptionPageResponseDto: {
            items: components["schemas"]["SubscriptionResponseDto"][];
            nextCursor: string | null;
            hasMore: boolean;
        };
        SubscriptionCurrencyCostResponseDto: {
            /** @example DOP */
            currency: string;
            /** @example 125.00 */
            monthlyCost: string;
            /** @example 1500.00 */
            annualCost: string;
            activeCount: number;
        };
        SubscriptionTrendResponseDto: {
            /** @enum {string} */
            direction: "up" | "down" | "flat";
            percent: number;
        };
        SubscriptionSummaryResponseDto: {
            /** @example DOP */
            baseCurrency: string;
            activeCount: number;
            /** @example 125.00 */
            monthlyCost: string;
            /** @example 1500.00 */
            annualCost: string;
            byCurrency: components["schemas"]["SubscriptionCurrencyCostResponseDto"][];
            /** @example 125.00 */
            previousMonthlyCost: string;
            /** @example 125.00 */
            realSpendThisMonth: string;
            /** @example 125.00 */
            realSpendPreviousMonth: string;
            trend: components["schemas"]["SubscriptionTrendResponseDto"] | null;
            pendingDetectedCount: number;
            /** @example 0.00 */
            cancelledAnnualSavings: string;
            reminderWindowDays: number;
            upcoming: components["schemas"]["SubscriptionResponseDto"][];
        };
        SubscriptionBreakdownItemResponseDto: {
            key: string;
            label: string;
            color: string | null;
            count: number;
            /** @example 125.00 */
            amount: string;
        };
        SubscriptionBreakdownResponseDto: {
            /** @example DOP */
            baseCurrency: string;
            /** @enum {string} */
            by: "category" | "instrument" | "currency";
            items: components["schemas"]["SubscriptionBreakdownItemResponseDto"][];
        };
        SubscriptionUpcomingItemResponseDto: {
            id: string;
            subscriptionId: string;
            name: string;
            logoUrl: string | null;
            /** @example 1500.00 */
            amount: string;
            /** @example DOP */
            currency: string;
            /** Format: date */
            date: string;
            daysUntil: number;
            paymentMethod: components["schemas"]["PaymentMethodResponseDto"] | null;
        };
        SubscriptionUpcomingResponseDto: {
            /** Format: date */
            from: string;
            /** Format: date */
            to: string;
            items: components["schemas"]["SubscriptionUpcomingItemResponseDto"][];
        };
        SubscriptionAlertResponseDto: {
            id: string;
            /** @enum {string} */
            kind: "PRICE_INCREASE" | "AMOUNT_MISMATCH" | "TRIAL_ENDING" | "ANNUAL_RENEWAL" | "MISSED_CHARGE";
            subscriptionId: string;
            subscriptionName: string;
            /** Format: date */
            date: string;
            /** @example DOP */
            currency: string;
            /** @example 1500.00 */
            amount: string | null;
            /** @example 1500.00 */
            previousAmount: string | null;
            /** @example 1500.00 */
            expectedAmount: string | null;
            percent: number | null;
            daysUntil: number | null;
        };
        SubscriptionDismissedAlertsResponseDto: {
            dismissed: number;
        };
        DismissSubscriptionAlertDto: {
            /** @enum {string} */
            kind: "PRICE_INCREASE" | "AMOUNT_MISMATCH" | "TRIAL_ENDING" | "ANNUAL_RENEWAL" | "MISSED_CHARGE";
            subscriptionId: string;
            /** @description Alert occurrence date (ISO date) */
            alertDate: string;
        };
        SubscriptionDismissedAlertResponseDto: {
            id: string;
            dismissed: boolean;
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
        SubscriptionPaymentTransactionResponseDto: {
            id: string;
            merchant: string | null;
            /** @example 1500.00 */
            amount: string;
            /** @example DOP */
            currency: string;
            /** Format: date-time */
            transactionDate: string;
            accountName: string | null;
            cardName: string | null;
        };
        SubscriptionPaymentResponseDto: {
            id: string;
            /** @example 1500.00 */
            amount: string;
            /** @example DOP */
            currency: string;
            /** Format: date-time */
            paidAt: string;
            /** @enum {string} */
            source: "AUTO" | "MANUAL";
            transactionId: string | null;
            transaction: components["schemas"]["SubscriptionPaymentTransactionResponseDto"] | null;
        };
        SubscriptionPaymentPageResponseDto: {
            items: components["schemas"]["SubscriptionPaymentResponseDto"][];
            nextCursor: string | null;
            hasMore: boolean;
        };
        CreateSubscriptionPaymentDto: {
            amount?: number;
            currency?: string;
            /** @description Payment date (ISO); defaults to now */
            paidAt?: string;
            /** @description Ledger movement to link */
            transactionId?: string;
        };
        SubscriptionManualPaymentResponseDto: {
            id: string;
            /** @example 1500.00 */
            amount: string;
            /** @example DOP */
            currency: string;
            /** Format: date-time */
            paidAt: string;
            /** @enum {string} */
            source: "AUTO" | "MANUAL";
        };
        SubscriptionLogoResponseDto: {
            logoUrl: string | null;
        };
        CardStatementResponseDto: {
            id: string;
            /** @example DOP */
            currency: string;
            /** Format: date-time */
            cycleStart: string;
            /** Format: date-time */
            cycleEnd: string;
            /** Format: date-time */
            dueDate: string | null;
            /** @example 25000.00 */
            closingBalance: string;
            /** @example 2500.00 */
            minimumPayment: string;
            /** @enum {string|null} */
            minimumSource: "IMPORTED" | "ESTIMATED" | "MANUAL" | null;
            /** @example 0.00 */
            paidAmount: string;
            /** @example 25000.00 */
            remaining: string;
            /** @enum {string} */
            status: "OPEN" | "CLOSED" | "PARTIAL" | "MINIMUM_PAID" | "PAID" | "OVERDUE";
        };
        CardStatementPageResponseDto: {
            items: components["schemas"]["CardStatementResponseDto"][];
            nextCursor: string | null;
            hasMore: boolean;
        };
        StatementTransactionResponseDto: {
            id: string;
            accountId: string | null;
            cardId: string | null;
            userId: string;
            categoryId: string | null;
            importReference: string | null;
            externalReference: string | null;
            institutionId: string | null;
            possibleDuplicateOfId: string | null;
            /** @enum {string} */
            type: "DEBIT" | "CREDIT" | "TRANSFER" | "ADJUSTMENT" | "CARD_PAYMENT";
            /** @example 1500.00 */
            amount: string;
            /** @example 1500.00 */
            ledgerAmount: string;
            /** @example 1500.00 */
            amountBaseCurrency: string;
            /** @example DOP */
            currency: string;
            /** @example DOP */
            ledgerCurrency: string;
            /** @example 1 */
            exchangeRate: string;
            isEstimated: boolean;
            merchant: string | null;
            merchantId: string | null;
            description: string | null;
            /** Format: date-time */
            transactionDate: string;
            transferGroupId: string | null;
            linkedTransactionId: string | null;
            /** @enum {string} */
            status: "PENDING" | "CONFIRMED" | "CANCELLED" | "DECLINED" | "REVERSED";
            isRecurring: boolean;
            aiMetadata: Record<string, never>;
            notes: string | null;
            /** @enum {string} */
            source: "MANUAL" | "EMAIL" | "AI";
            /** @enum {string|null} */
            legRole: "SOURCE" | "DESTINATION" | "FEE" | null;
            /** @enum {string|null} */
            rail: "SAME_BANK" | "ACH" | "LBTR" | "OTHER" | null;
            /** Format: date-time */
            createdAt: string;
            /** Format: date-time */
            updatedAt: string;
        };
        CardStatementDetailResponseDto: {
            statement: components["schemas"]["CardStatementResponseDto"];
            movements: components["schemas"]["StatementTransactionResponseDto"][];
            payments: components["schemas"]["StatementTransactionResponseDto"][];
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
        StatementImportCreatedResponseDto: {
            importId: string;
        };
        StatementImportTargetResponseDto: {
            /** @enum {string} */
            kind: "CARD" | "ACCOUNT";
            id: string;
            name: string;
            /** @example DOP */
            currency: string;
        };
        StatementImportHeaderResponseDto: {
            /** @example DOP */
            currency: string;
            /** Format: date */
            periodStart: string | null;
            /** Format: date */
            periodEnd: string | null;
            /** Format: date */
            dueDate: string | null;
            /** @example 1000.00 */
            previousBalance: string | null;
            /** @example 2500.00 */
            closingBalance: string | null;
            /** @example 250.00 */
            minimumPayment: string | null;
        };
        StatementImportPeriodResponseDto: {
            /** Format: date-time */
            from: string;
            /** Format: date-time */
            to: string;
        };
        StatementImportCountsResponseDto: {
            lines: number;
            matched: number;
            missing: number;
            extra: number;
        };
        StatementImportLineResponseDto: {
            id: string;
            /** Format: date */
            date: string;
            description: string;
            /** @example 150.00 */
            amount: string;
            /** @example DOP */
            currency: string;
            /** @enum {string} */
            type: "DEBIT" | "CREDIT";
            reference: string | null;
            /** @enum {string} */
            decision: "MATCH" | "CREATE" | "IGNORE";
            categoryId: string | null;
            categoryName: string | null;
            transactionId: string | null;
        };
        StatementImportExtraResponseDto: {
            id: string;
            /** Format: date-time */
            date: string;
            description: string | null;
            merchant: string | null;
            /** @example 150.00 */
            amount: string;
            /** @example DOP */
            currency: string;
            /** @enum {string} */
            type: "DEBIT" | "CREDIT" | "TRANSFER" | "ADJUSTMENT" | "CARD_PAYMENT";
        };
        StatementImportAdjustmentResponseDto: {
            /** @example 150.00 */
            amount: string;
            /** @example DOP */
            currency: string;
        };
        StatementImportResponseDto: {
            id: string;
            /** @enum {string} */
            status: "PARSING" | "READY" | "APPLIED" | "FAILED" | "DISCARDED";
            error: string | null;
            failureReason: string | null;
            target: components["schemas"]["StatementImportTargetResponseDto"];
            header: components["schemas"]["StatementImportHeaderResponseDto"];
            period: components["schemas"]["StatementImportPeriodResponseDto"] | null;
            counts: components["schemas"]["StatementImportCountsResponseDto"];
            lines: components["schemas"]["StatementImportLineResponseDto"][];
            extra: components["schemas"]["StatementImportExtraResponseDto"][];
            /** @example 0.00 */
            difference: string | null;
            adjustment: components["schemas"]["StatementImportAdjustmentResponseDto"] | null;
            /** Format: date-time */
            createdAt: string;
            /** Format: date-time */
            appliedAt: string | null;
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
        CategorySummaryResponseDto: {
            id: string;
            name: string;
            color: string | null;
            icon: string | null;
        };
        BudgetResponseDto: {
            id: string;
            userId: string;
            categoryId: string | null;
            name: string | null;
            includeChildren: boolean;
            /** @enum {string} */
            rollover: "NONE" | "SURPLUS" | "SURPLUS_AND_DEFICIT";
            /** @example 0.00 */
            carriedOver: string;
            recurring: boolean;
            /** @enum {string} */
            periodType: "MONTHLY" | "BIWEEKLY" | "CUSTOM";
            /** Format: date-time */
            periodStart: string;
            /** Format: date-time */
            periodEnd: string;
            /** @example 1500.00 */
            amountLimit: string;
            /** @example 1500.00 */
            amountSpent: string;
            /** @example 80 */
            alertThresholdPct: number;
            /** @enum {string} */
            aiSuggestionStatus: "NONE" | "PENDING" | "ACCEPTED" | "REJECTED";
            aiSuggestionPayload: Record<string, never> | null;
            /** Format: date-time */
            createdAt: string;
            /** Format: date-time */
            updatedAt: string;
            category: components["schemas"]["CategoryResponseDto"] | null;
            categories: components["schemas"]["CategorySummaryResponseDto"][];
            /** @example 1500.00 */
            effectiveLimit: string;
        };
        BudgetPageResponseDto: {
            items: components["schemas"]["BudgetResponseDto"][];
            nextCursor: string | null;
            hasMore: boolean;
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
        SavingsGoalResponseDto: {
            id: string;
            userId: string;
            name: string;
            description: string | null;
            /** @example 1500.00 */
            targetAmount: string;
            /** @example 1500.00 */
            currentAmount: string;
            /** @example DOP */
            currency: string;
            /** Format: date-time */
            targetDate: string | null;
            icon: string | null;
            color: string | null;
            accountId: string | null;
            /** @enum {string} */
            mode: "EARMARK" | "DEDICATED";
            spendReducesProgress: boolean;
            isCompleted: boolean;
            /** Format: date-time */
            completedAt: string | null;
            /** Format: date-time */
            createdAt: string;
            /** Format: date-time */
            updatedAt: string;
        };
        SavingsGoalPageResponseDto: {
            items: components["schemas"]["SavingsGoalResponseDto"][];
            nextCursor: string | null;
            hasMore: boolean;
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
        SavingsGoalContributionResponseDto: {
            id: string;
            goalId: string;
            /** @example 1500.00 */
            amount: string;
            /** Format: date-time */
            contributedAt: string;
            accountId: string | null;
            destinationAccountId: string | null;
            transactionId: string | null;
            /** @enum {string} */
            kind: "CONTRIBUTION" | "WITHDRAWAL";
            transferGroupId: string | null;
            notes: string | null;
            /** Format: date-time */
            createdAt: string;
        };
        SavingsGoalContributionPageResponseDto: {
            items: components["schemas"]["SavingsGoalContributionResponseDto"][];
            nextCursor: string | null;
            hasMore: boolean;
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
        LoanReferenceDto: {
            id: string;
            name: string;
        };
        LoanResponseDto: {
            id: string;
            userId: string;
            institutionId: string | null;
            accountId: string | null;
            name: string | null;
            lenderName: string;
            /** @example 100000.00 */
            originalAmount: string;
            /** @example 75000.00 */
            currentBalance: string;
            /** @example DOP */
            currency: string;
            /** @example 8500.00 */
            installmentAmount: string;
            /** @enum {string} */
            installmentFreq: "WEEKLY" | "BIWEEKLY" | "MONTHLY";
            totalInstallments: number;
            paidInstallments: number;
            /** Format: date-time */
            nextDueDate: string;
            /** @example 0.1800 */
            interestRate: string | null;
            /** @enum {string} */
            rateType: "FIXED" | "VARIABLE";
            /** @example 500.00 */
            insuranceAmount: string | null;
            lateFeePolicy: Record<string, never> | null;
            /** @example 0.0200 */
            prepaymentPenaltyPct: string | null;
            /** Format: date-time */
            disbursementDate: string | null;
            disbursementAccountId: string | null;
            disbursementTransactionId: string | null;
            notes: string | null;
            isActive: boolean;
            /** Format: date-time */
            createdAt: string;
            /** Format: date-time */
            updatedAt: string;
            account: components["schemas"]["LoanReferenceDto"] | null;
            disbursementAccount: components["schemas"]["LoanReferenceDto"] | null;
            institution: components["schemas"]["LoanReferenceDto"] | null;
        };
        LoanPageResponseDto: {
            items: components["schemas"]["LoanResponseDto"][];
            nextCursor: string | null;
            hasMore: boolean;
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
        LoanInstallmentResponseDto: {
            id: string;
            loanId: string;
            installmentNo: number;
            /** Format: date-time */
            dueDate: string;
            /** @example 8500.00 */
            amount: string;
            /** @example 7000.00 */
            principal: string;
            /** @example 1500.00 */
            interest: string;
            /** @example 0.00 */
            insurance: string;
            /** @example 0.00 */
            fees: string;
            /** @example 0.00 */
            lateFee: string;
            /** @example 0.00 */
            paidAmount: string;
            /** @enum {string} */
            status: "PENDING" | "PARTIAL" | "PAID" | "OVERDUE";
            /** Format: date-time */
            paidAt: string | null;
            transactionId: string | null;
            /** Format: date-time */
            createdAt: string;
            /** Format: date-time */
            updatedAt: string;
        };
        LoanInstallmentPageResponseDto: {
            items: components["schemas"]["LoanInstallmentResponseDto"][];
            nextCursor: string | null;
            hasMore: boolean;
        };
        PayLoanInstallmentDto: {
            amount?: number;
            accountId?: string;
            /** @default false */
            excessAsPrepayment: boolean;
        };
        LoanPaymentBreakdownDto: {
            /** @example 0.00 */
            lateFee: number;
            /** @example 0.00 */
            fees: number;
            /** @example 0.00 */
            insurance: number;
            /** @example 1500.00 */
            interest: number;
            /** @example 7000.00 */
            principal: number;
            /** @example 8500.00 */
            applied: number;
        };
        LoanInstallmentPaymentResponseDto: {
            installmentNo: number;
            breakdown: components["schemas"]["LoanPaymentBreakdownDto"];
            /** @example 8500.00 */
            paidAmount: number;
            /** @enum {string} */
            status: "PAID" | "PARTIAL";
            /** @example 66500.00 */
            currentBalance: number;
        };
        LoanPrepaymentDto: {
            amount: number;
            accountId: string;
            /** @enum {string} */
            mode: "REDUCE_TERM" | "REDUCE_INSTALLMENT";
            date?: string;
            penaltyAmount?: number;
        };
        LoanPrepaymentResponseDto: {
            id: string;
            loanId: string;
            /** @example 5000.00 */
            amount: string;
            /** @example 100.00 */
            penalty: string;
            /** @enum {string} */
            mode: "REDUCE_TERM" | "REDUCE_PAYMENT";
            /** Format: date-time */
            paidAt: string;
            transactionId: string | null;
            /** Format: date-time */
            createdAt: string;
        };
        LoanPrepaymentResultResponseDto: {
            prepayment: components["schemas"]["LoanPrepaymentResponseDto"];
            loan: components["schemas"]["LoanResponseDto"];
            schedulePreview: components["schemas"]["LoanInstallmentResponseDto"][];
        };
        LoanPrepaymentPreviewResponseDto: {
            /** @example 70000.00 */
            newBalance: number;
            /** @example 10 */
            totalInstallments: number;
            /** @example 8200.00 */
            installmentAmount: number;
            /** @example 12000.00 */
            interestRemaining: number;
            /** Format: date-time */
            newEndDate: string;
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
        ReceivableResponseDto: {
            id: string;
            userId: string;
            debtorName: string;
            description: string | null;
            /** @example 1500.00 */
            amount: string;
            /** @example 1500.00 */
            paidAmount: string;
            /** @example DOP */
            currency: string;
            /** Format: date-time */
            dueDate: string | null;
            /** @enum {string} */
            status: "PENDING" | "PARTIAL" | "PAID" | "CANCELLED" | "WRITTEN_OFF";
            /** @example 0.00 */
            creditBalance: string;
            /** @example 0.00 */
            writtenOffAmount: string;
            /** Format: date-time */
            writtenOffAt: string | null;
            notes: string | null;
            /** Format: date-time */
            createdAt: string;
            /** Format: date-time */
            updatedAt: string;
        };
        ReceivablePageResponseDto: {
            items: components["schemas"]["ReceivableResponseDto"][];
            nextCursor: string | null;
            hasMore: boolean;
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
        ReceivablePaymentResponseDto: {
            id: string;
            receivableId: string;
            /** @example 1500.00 */
            amount: string;
            /** @example 1500.00 */
            appliedAmount: string;
            /** @example 0.00 */
            excessAmount: string;
            excessHandling: string | null;
            /** Format: date-time */
            paidAt: string;
            accountId: string | null;
            transactionId: string | null;
            notes: string | null;
            /** Format: date-time */
            createdAt: string;
        };
        ReceivablePaymentPageResponseDto: {
            items: components["schemas"]["ReceivablePaymentResponseDto"][];
            nextCursor: string | null;
            hasMore: boolean;
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
        WeeklySummaryTopCategoryResponseDto: {
            name: string;
            icon: string | null;
            color: string | null;
            /** @example 1500.00 */
            total: string;
        };
        WeeklySummaryBudgetRiskResponseDto: {
            id: string;
            name: string;
            pctUsed: number;
            /** @example 1500.00 */
            spent: string;
            /** @example 1500.00 */
            limit: string;
        };
        WeeklySummaryInstallmentResponseDto: {
            loanId: string;
            lenderName: string;
            /** @example 1500.00 */
            amount: string;
            /** @example DOP */
            currency: string;
            /** Format: date */
            dueDate: string;
        };
        WeeklySummaryCardDueResponseDto: {
            cardId: string;
            name: string;
            lastFour: string | null;
            dueDay: number;
        };
        WeeklySummaryResponseDto: {
            /** Format: date */
            weekStart: string;
            /** Format: date */
            weekEnd: string;
            /** @example DOP */
            currency: string;
            /** @example 1500.00 */
            expenses: string;
            /** @example 1500.00 */
            averageExpenses: string;
            topCategories: components["schemas"]["WeeklySummaryTopCategoryResponseDto"][];
            budgetsAtRisk: components["schemas"]["WeeklySummaryBudgetRiskResponseDto"][];
            upcomingInstallments: components["schemas"]["WeeklySummaryInstallmentResponseDto"][];
            cardDueDates: components["schemas"]["WeeklySummaryCardDueResponseDto"][];
            pendingEmails: number;
        };
        AnalyticsBalanceIssueResponseDto: {
            /** @enum {string} */
            code: "MISSING_CREDIT_LIMIT" | "MISSING_RATE";
            cardId?: string;
            /** @example DOP */
            currency: string;
        };
        AnalyticsSummaryTotalsResponseDto: {
            /** @example 1500.00 */
            accountBalance: string;
            /** @example 0.00 */
            cardDebt: string | null;
            /** @example 1500.00 */
            income: string;
            /** @example 1500.00 */
            expenses: string;
        };
        AnalyticsSummaryResponseDto: {
            /** @example 1500.00 */
            netWorth: string | null;
            /** @example 1500.00 */
            cashFlow: string;
            /** @example DOP */
            baseCurrency: string;
            /** @enum {string} */
            balanceStatus: "COMPLETE" | "INCOMPLETE";
            balanceIssues: components["schemas"]["AnalyticsBalanceIssueResponseDto"][];
            totals: components["schemas"]["AnalyticsSummaryTotalsResponseDto"];
        };
        SpendingByCategoryResponseDto: {
            categoryId: string | null;
            name: string;
            color: string | null;
            icon: string | null;
            /** @example 1500.00 */
            total: string;
        };
        BudgetStatusResponseDto: {
            id: string;
            categoryId: string | null;
            category: string;
            color: string | null;
            icon: string | null;
            /** @enum {string} */
            periodType: "MONTHLY" | "BIWEEKLY" | "CUSTOM";
            /** Format: date */
            periodStart: string;
            /** Format: date */
            periodEnd: string;
            /** @example 1500.00 */
            amountLimit: string;
            /** @example 1500.00 */
            amountSpent: string;
            pctUsed: number;
            threshold: number;
        };
        SpendingOverTimePointResponseDto: {
            /** Format: date */
            date: string;
            /** @example 1500.00 */
            expenses: string;
            /** @example 1500.00 */
            income: string;
        };
        SpendingOverTimeResponseDto: {
            points: components["schemas"]["SpendingOverTimePointResponseDto"][];
        };
        RecurringPatternResponseDto: {
            id: string;
            merchantId: string | null;
            merchant: string;
            merchantName: string;
            logoUrl: string | null;
            categoryId: string | null;
            /** @example 1500.00 */
            avgAmount: string;
            /** @example DOP */
            currency: string;
            /** @example 30 */
            frequency: number;
            /** Format: date */
            nextExpectedDate: string;
            /** Format: date-time */
            lastSeenAt: string | null;
            /** @enum {string} */
            status: "SUGGESTED" | "CONFIRMED" | "DISMISSED";
            /** @enum {string} */
            kind: "SUBSCRIPTION" | "BILL" | "INCOME" | "OTHER";
            confidenceScore: number;
            amountTolerancePct: number;
            /** @example 125.00 */
            monthlyEquivalent: string;
            /** @example 1500.00 */
            annualEquivalent: string;
            daysUntil: number;
        };
        RecurringPageResponseDto: {
            items: components["schemas"]["RecurringPatternResponseDto"][];
            nextCursor: string | null;
            hasMore: boolean;
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
        SuggestedAdjustmentResponseDto: {
            /** @enum {string} */
            kind: "IMPUESTO_DGII" | "COMISION" | "CARGO_PLASTICO" | "INTERES" | "OTRO";
            /** @example 150.00 */
            amount: string;
        };
        ReconciliationPreviewResponseDto: {
            accountId: string | null;
            cardId: string | null;
            /** @example DOP */
            currency: string;
            name: string;
            /** @example 1500.00 */
            appBalance: string;
            /** @example 1500.00 */
            realBalance: string;
            /** @example 0.00 */
            difference: string;
            suggestedAdjustments: components["schemas"]["SuggestedAdjustmentResponseDto"][];
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
        ReconciliationAdjustmentResponseDto: {
            id: string;
            /** @enum {string} */
            kind: "IMPUESTO_DGII" | "COMISION" | "CARGO_PLASTICO" | "INTERES" | "OTRO";
            /** @example 1500.00 */
            amount: string;
            transactionId: string;
        };
        ReconciliationResponseDto: {
            id: string;
            accountId: string | null;
            cardId: string | null;
            /** @example DOP */
            currency: string;
            /**
             * Format: date
             * @example 2026-11-01
             */
            asOfDate: string;
            /** @example 1500.00 */
            appBalance: string;
            /** @example 1500.00 */
            realBalance: string;
            /** @example 0.00 */
            difference: string;
            note: string | null;
            /** Format: date-time */
            createdAt: string;
            adjustments: components["schemas"]["ReconciliationAdjustmentResponseDto"][];
        };
        ReconciliationStatusItemResponseDto: {
            key: string;
            /** @enum {string} */
            kind: "account" | "card";
            accountId: string | null;
            cardId: string | null;
            /** @example DOP */
            currency: string;
            name: string;
            institutionName: string | null;
            /** @example 1500.00 */
            balance: string;
            reconciled: boolean;
            /** Format: date-time */
            lastReconciledAt: string | null;
        };
        ReconciliationStatusResponseDto: {
            /** @example 2026-11 */
            month: string;
            items: components["schemas"]["ReconciliationStatusItemResponseDto"][];
            reconciledCount: number;
            pendingCount: number;
        };
        ReconciliationPageResponseDto: {
            items: components["schemas"]["ReconciliationResponseDto"][];
            nextCursor: string | null;
            hasMore: boolean;
        };
        BankChargesMonthResponseDto: {
            /** @example 2026-11 */
            month: string;
            /** @example 1500.00 */
            total: string;
            count: number;
        };
        BankChargesInstitutionResponseDto: {
            name: string;
            /** @example 1500.00 */
            total: string;
            count: number;
        };
        BankChargesKindResponseDto: {
            kind: string;
            /** @example 1500.00 */
            total: string;
            count: number;
        };
        BankChargesResponseDto: {
            /** Format: date */
            from: string;
            /** Format: date */
            to: string;
            /** @example 1500.00 */
            total: string;
            count: number;
            byMonth: components["schemas"]["BankChargesMonthResponseDto"][];
            byInstitution: components["schemas"]["BankChargesInstitutionResponseDto"][];
            byKind: components["schemas"]["BankChargesKindResponseDto"][];
        };
        BalanceDriftResponseDto: {
            id: string;
            accountId: string | null;
            cardId: string | null;
            /** @example DOP */
            currency: string;
            name: string | null;
            /** @example 1500.00 */
            storedBalance: string;
            /** @example 1500.00 */
            expectedBalance: string;
            /** @example 0.00 */
            difference: string;
            /** Format: date-time */
            detectedAt: string;
            /** Format: date-time */
            resolvedAt: string | null;
        };
        IntegrityCheckResponseDto: {
            drifts: components["schemas"]["BalanceDriftResponseDto"][];
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
        IntegrityRecalculateResponseDto: {
            corrected: boolean;
            accountId: string | null;
            cardId: string | null;
            /** @example DOP */
            currency: string;
            /** @example 1500.00 */
            balance: string;
        };
        ParseQuickEntryDto: {
            /**
             * @description Short natural-language sentence to turn into a draft.
             * @example café 250 popular
             */
            text: string;
        };
        QuickEntryDraftResponseDto: {
            /** @enum {string} */
            type: "DEBIT" | "CREDIT";
            /** @example 1500.00 */
            amount: string;
            /** @example DOP */
            currency: string;
            categoryId: string | null;
            accountId: string | null;
            cardId: string | null;
            /** Format: date */
            date: string;
            merchant: string | null;
            description: string | null;
        };
        QuickEntryParseResponseDto: {
            draft: components["schemas"]["QuickEntryDraftResponseDto"];
            /** @example 0.9 */
            confidence: number;
            missing: string[];
        };
        CreateReceivableShareDto: {
            receivableIds: string[];
            debtorName: string;
        };
        PublicShareCurrencyTotalResponseDto: {
            /** @example DOP */
            currency: string;
            /** @example 1500.00 */
            amount: string;
            /** @example 1500.00 */
            paid: string;
            /** @example 0.00 */
            pending: string;
        };
        PublicSharePaymentResponseDto: {
            /** Format: date-time */
            paidAt: string;
            /** @example 1500.00 */
            amount: string;
        };
        PublicShareItemResponseDto: {
            ref: string;
            concept: string;
            /** Format: date-time */
            createdAt: string;
            /** Format: date-time */
            dueDate: string | null;
            /** @example 1500.00 */
            amount: string;
            /** @example 1500.00 */
            paid: string;
            /** @example 0.00 */
            pending: string;
            /** @example DOP */
            currency: string;
            /** @enum {string} */
            status: "PENDING" | "PARTIAL" | "PAID" | "CANCELLED" | "WRITTEN_OFF";
            note: string | null;
            payments: components["schemas"]["PublicSharePaymentResponseDto"][];
        };
        PublicReceivableShareResponseDto: {
            ownerFirstName: string;
            debtorName: string;
            /** Format: date-time */
            updatedAt: string;
            totalsByCurrency: components["schemas"]["PublicShareCurrencyTotalResponseDto"][];
            items: components["schemas"]["PublicShareItemResponseDto"][];
        };
        ArchivedEntityResponseDto: {
            /** @enum {string} */
            type: "institution" | "account" | "card" | "loan";
            id: string;
            label: string;
            logoUrl: string | null;
        };
        PendingDeletionResponseDto: {
            /** @enum {string} */
            type: "account" | "budget" | "card" | "category" | "institution" | "loan" | "receivable" | "reconciliation" | "savingsGoal" | "transaction";
            id: string;
            label: string;
            logoUrl: string | null;
            /** Format: date-time */
            deletedAt: string;
            sizeBytes: number;
        };
        RecycleBinResponseDto: {
            archived: components["schemas"]["ArchivedEntityResponseDto"][];
            items: components["schemas"]["PendingDeletionResponseDto"][];
            nextCursor: string | null;
            hasMore: boolean;
        };
        NotificationResponseDto: {
            id: string;
            userId: string;
            type: string;
            /** @enum {string} */
            channel: "PUSH" | "IN_APP" | "EMAIL";
            title: string;
            body: string;
            data: Record<string, never>;
            isRead: boolean;
            /** Format: date-time */
            scheduledAt: string | null;
            /** Format: date-time */
            sentAt: string | null;
            /** Format: date-time */
            createdAt: string;
        };
        NotificationPageResponseDto: {
            items: components["schemas"]["NotificationResponseDto"][];
            nextCursor: string | null;
            hasMore: boolean;
        };
        UnreadNotificationsResponseDto: {
            count: number;
        };
        MarkAllReadResponseDto: {
            updated: number;
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
        PushTokenResponseDto: {
            id: string;
            userId: string;
            platform: string;
            token: string;
            isActive: boolean;
            /** Format: date-time */
            createdAt: string;
        };
        NotificationSuccessResponseDto: {
            success: boolean;
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
                content: {
                    "application/json": components["schemas"]["UserProfileResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["DeleteAccountResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["UserProfileResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["UserProfileResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["UserProfileResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["DataAppBranchesResponseDto"][];
                };
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
                content: {
                    "application/json": components["schemas"]["WipeUserDataResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["AuthSessionResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["AiRoleUserResponseDto"][];
                };
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
                content: {
                    "application/json": components["schemas"]["AiRoleAssignmentResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["AiConsentResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["AiConsentResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["AiEmailDashboardResponseDto"];
                };
            };
        };
    };
    AiIntelligenceController_messages: {
        parameters: {
            query?: {
                /** @description Texto contenido en el asunto o el remitente, sin distinguir mayúsculas */
                q?: string;
                /** @description Estado del correo importado */
                status?: "INGESTED" | "QUEUED" | "PROCESSED" | "REVIEW_REQUIRED" | "FAILED";
                /** @description Cursor opaco de la página anterior */
                cursor?: string;
                /** @description Cantidad de correos por página */
                limit?: number;
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
                content: {
                    "application/json": components["schemas"]["AiEmailMessagePageResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["AiEmailMessageResponseDto"];
                };
            };
        };
    };
    AiIntelligenceController_sampleImportRun: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["EmailSampleImportDto"];
            };
        };
        responses: {
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AiEmailSampleImportJobResponseDto"];
                };
            };
        };
    };
    AiIntelligenceController_sampleImportStatus: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                jobId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AiEmailSampleImportJobResponseDto"];
                };
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
        requestBody: {
            content: {
                "application/json": components["schemas"]["ConnectGmailDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AiEmailConnectResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["AiEmailSyncResponseDto"];
                };
            };
        };
    };
    AiIntelligenceController_syncBhd: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SyncBhdScopeDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SyncBhdResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["AiEmailResetResponseDto"];
                };
            };
            /** @description GMAIL_NOT_CONNECTED si no hay conexión; GMAIL_SYNC_IN_PROGRESS si hay una sincronización activa o esperando cuota. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @enum {string} */
                        code?: "GMAIL_NOT_CONNECTED" | "GMAIL_SYNC_IN_PROGRESS";
                        message?: string;
                    };
                };
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
                content: {
                    "application/json": components["schemas"]["AiEmailDiagnosticsResponseDto"];
                };
            };
        };
    };
    EmailUsageController_get: {
        parameters: {
            query: {
                days: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Uso agregado y restante de los topes */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    EmailProductProposalsController_discover: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DiscoverEmailProductProposalsDto"];
            };
        };
        responses: {
            /** @description Propuestas detectadas en correos persistidos. */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DiscoverEmailProductProposalsResponseDto"];
                };
            };
        };
    };
    EmailProductProposalsController_list: {
        parameters: {
            query?: {
                status?: "PENDING" | "APPROVING" | "APPROVED" | "DISCARDED";
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Propuestas y evidencia de sus correos de origen. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["EmailProductProposalResponseDto"][];
                };
            };
        };
    };
    EmailProductProposalsController_update: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                proposalId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateEmailProductProposalDto"];
            };
        };
        responses: {
            /** @description Propuesta editable antes de aprobarla. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["EmailProductProposalResponseDto"];
                };
            };
        };
    };
    EmailProductProposalsController_approve: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                proposalId: string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["ApproveEmailProductProposalDto"];
            };
        };
        responses: {
            /** @description Vincula el producto indicado (o lo crea desde el borrador sin cuerpo) y reevalúa señales. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["EmailProductProposalResponseDto"];
                };
            };
        };
    };
    EmailProductProposalsController_discard: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                proposalId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Descarta una propuesta pendiente. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["EmailProductProposalResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["AiDatasetResponseDto"];
                };
            };
        };
    };
    AiEvidenceController_reviewQueue: {
        parameters: {
            query?: {
                semanticType?: "FIN_TRANSACTION" | "PURCHASE_RECEIPT" | "SUBSCRIPTION_BILLING" | "FIN_STATEMENT_NOTICE" | "FIN_ACCOUNT_NOTICE" | "SECURITY_OTP" | "SECURITY_ALERT" | "TECH_NOTIFICATION" | "JOB" | "CALENDAR_EVENT" | "MARKETING" | "SOCIAL" | "OTHER";
                route?: "FINANCE" | "SUBSCRIPTIONS" | "CALENDAR" | "SECURITY";
                confidenceMin?: number;
                confidenceMax?: number;
                /** @description Solo mensajes inciertos o sin predicción */
                uncertain?: boolean;
                /** @description Cursor opaco de la página anterior */
                cursor?: string;
                partition?: "TRAIN" | "VALIDATION" | "HOLDOUT";
                /** @description Estados separados por coma; sin filtro la cola devuelve solo PENDING */
                status?: ("PENDING" | "CONFIRMED" | "CORRECTED" | "REJECTED")[];
                /** @description Remitente exacto, sin distinguir mayúsculas */
                fromAddress?: string;
                /** @description Texto contenido en el asunto, sin distinguir mayúsculas */
                subject?: string;
                /** @description Primer día recibido (AAAA-MM-DD), completo en la zona del usuario */
                dateFrom?: string;
                /** @description Último día recibido (AAAA-MM-DD), completo en la zona del usuario */
                dateTo?: string;
                /** @description OLDEST/NEWEST por fecha recibida o IMPACT por tamaño de grupo, remitente nuevo y confianza */
                order?: "OLDEST" | "NEWEST" | "IMPACT";
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
                content: {
                    "application/json": components["schemas"]["AiReviewQueueResponseDto"];
                };
            };
        };
    };
    AiEvidenceController_reviewGroups: {
        parameters: {
            query?: {
                order?: "IMPACT";
                page?: number;
                pageSize?: number;
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
                content: {
                    "application/json": components["schemas"]["AiReviewGroupsPageResponseDto"];
                };
            };
        };
    };
    AiEvidenceController_verifyReviewGroup: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateReviewGroupVerificationDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AiReviewGroupVerificationResultResponseDto"];
                };
            };
        };
    };
    AiEvidenceController_verifyReviewSelection: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateReviewSelectionVerificationDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AiReviewSelectionVerificationResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["AiMessageVerificationResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["AiAnalysisRunResponseDto"][];
                };
            };
        };
    };
    AiEvidenceController_evaluate: {
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
                    "application/json": components["schemas"]["AiAnalysisRunResponseDto"];
                };
            };
        };
    };
    AiEvidenceController_compare: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CompareAnalysisRunsDto"];
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
    AiKnowledgeController_promote: {
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
    AiSignalsController_list: {
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
                    "application/json": components["schemas"]["AiSignalListResponseDto"];
                };
            };
        };
    };
    AiSignalsController_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                signalId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AiSignalResponseDto"];
                };
            };
        };
    };
    AiConversationController_list: {
        parameters: {
            query?: {
                /** @description Cantidad de conversaciones por página */
                limit?: number;
                /** @description Cursor opaco de la página anterior */
                cursor?: string;
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
                content: {
                    "application/json": components["schemas"]["AiConversationPageDto"];
                };
            };
            /** @description Cursor o límite inválido */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AiConversationController_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateAiConversationDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AiConversationCreatedDto"];
                };
            };
            /** @description Contexto inválido o entidad no accesible */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AiConversationController_latest: {
        parameters: {
            query: {
                /** @description SHA-256 hex de la clave de contexto canónica */
                context: string;
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
                content: {
                    "application/json": components["schemas"]["AiConversationLatestDto"];
                };
            };
            /** @description La clave de contexto debe ser SHA-256 hexadecimal */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AiConversationController_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                conversationId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AiConversationDetailDto"];
                };
            };
            /** @description Conversación no encontrada */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AiConversationController_remove: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                conversationId: string;
            };
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
                        deleted?: boolean;
                    };
                };
            };
            /** @description Conversación no encontrada */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AiConversationController_sendMessage: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                conversationId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SendAiConversationMessageDto"];
            };
        };
        responses: {
            /** @description Flujo text/event-stream con start, status, chunk, reset, done y error cuando stream=true */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AiConversationAnswerDto"];
                };
            };
            /** @description Mensaje vacío o demasiado largo */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Conversación no encontrada */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Inferencia no disponible */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AiActionsController_list: {
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
                    "application/json": components["schemas"]["AiActionDto"][];
                };
            };
        };
    };
    AiActionsController_confirm: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                actionId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AiActionResultDto"];
                };
            };
        };
    };
    AiActionsController_cancel: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                actionId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AiActionResultDto"];
                };
            };
        };
    };
    ViewSuggestionsController_resolveForView: {
        parameters: {
            query: {
                /** @description Ruta de la vista; la clave no incluye filtros ni entidad */
                route: string;
                /** @description Vista dentro de la ruta */
                view?: string;
                /** @description Sheet abierto sobre la ruta */
                sheet?: string;
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
                content: {
                    "application/json": components["schemas"]["ViewSuggestionsListDto"];
                };
            };
            /** @description Ruta o vista inválida, o vista y sheet a la vez */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ViewSuggestionsController_dismiss: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                suggestionId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ViewSuggestionDismissedDto"];
                };
            };
            /** @description Sugerencia no encontrada */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ProactiveSuggestionsController_list: {
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
                    "application/json": components["schemas"]["ProactiveSuggestionsResponseDto"];
                };
            };
        };
    };
    ImportReviewController_list: {
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
                    "application/json": components["schemas"]["ImportReviewItemResponseDto"][];
                };
            };
        };
    };
    ImportReviewController_resolve: {
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
                "application/json": components["schemas"]["ResolveImportReviewDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ImportReviewResolutionResponseDto"];
                };
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
                content: {
                    "application/json": string[];
                };
            };
        };
    };
    CurrenciesController_exchangeRates: {
        parameters: {
            query: {
                /** @description ISO-3 base currency */
                base: string;
                /** @description Comma-separated ISO-3 currency codes, at most 20 */
                quotes: string[];
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
                content: {
                    "application/json": components["schemas"]["ExchangeRatesResponseDto"];
                };
            };
            /** @description Base o quotes inválidos, o más de 20 monedas */
            400: {
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
                content: {
                    "application/json": components["schemas"]["ChangeBaseCurrencyResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["AccountPageResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["AccountResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["AccountResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["SuccessResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["AccountResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["InstrumentHistoryPageResponseDto"];
                };
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
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["InstitutionPageResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["InstitutionResponseDto"];
                };
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
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InstitutionResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["SuccessResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["InstitutionResponseDto"];
                };
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
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["CardPageResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["CardResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["CardResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["SuccessResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["CardResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["InstrumentHistoryPageResponseDto"];
                };
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
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["CardBalanceMutationResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["CardBalanceMutationResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["SuccessResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["CategoryResponseDto"][];
                };
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
                content: {
                    "application/json": components["schemas"]["CategoryResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["SuccessResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["CategoryResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["SuccessResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["TransactionPageResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["TransactionResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["AdjustBalanceResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["TransactionResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["DeleteResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["TransactionResponseDto"];
                };
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
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessResponseDto"];
                };
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
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TransactionResponseDto"];
                };
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
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TransactionResponseDto"];
                };
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
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TransactionResponseDto"];
                };
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
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessResponseDto"];
                };
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
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["TransferResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["DeleteResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["SuccessResponseDto"];
                };
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
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessResponseDto"];
                };
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
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessResponseDto"];
                };
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
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["TransferResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["DeleteResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["SuccessResponseDto"];
                };
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
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessResponseDto"];
                };
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
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["MerchantPageResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["MerchantResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["MerchantSuggestResponseDto"] | null;
                };
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
                content: {
                    "application/json": components["schemas"]["MerchantResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["MerchantResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["MerchantDuplicateResponseDto"][];
                };
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
                content: {
                    "application/json": components["schemas"]["MerchantDuplicateDismissResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["MerchantDuplicateDismissResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["MerchantResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["MerchantResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["MerchantResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["SubscriptionPageResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["SubscriptionResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["SubscriptionSummaryResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["SubscriptionBreakdownResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["SubscriptionUpcomingResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["SubscriptionAlertResponseDto"][];
                };
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
                content: {
                    "application/json": components["schemas"]["SubscriptionDismissedAlertsResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["SubscriptionDismissedAlertResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["SubscriptionResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["SubscriptionResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["SubscriptionResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["SubscriptionResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["SubscriptionResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["SubscriptionPaymentPageResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["SubscriptionManualPaymentResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["SubscriptionLogoResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["CardStatementPageResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["CardStatementDetailResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["SuccessResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["StatementImportCreatedResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["StatementImportCreatedResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["StatementImportResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["SuccessResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["StatementImportResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["StatementImportResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["BudgetPageResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["BudgetResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["BudgetResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["SuccessResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["BudgetResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["TransactionPageResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["SuccessResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["SavingsGoalPageResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["SavingsGoalResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["SavingsGoalResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["SuccessResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["SavingsGoalResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["SavingsGoalContributionPageResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["SavingsGoalContributionResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["SuccessResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["SavingsGoalContributionPageResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["SavingsGoalContributionResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["SuccessResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["SuccessResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["LoanPageResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["LoanResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["LoanResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["SuccessResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["LoanResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["LoanInstallmentPageResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["LoanInstallmentResponseDto"][];
                };
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
                content: {
                    "application/json": components["schemas"]["LoanInstallmentPaymentResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["LoanPrepaymentResultResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["LoanPrepaymentPreviewResponseDto"];
                };
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
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["ReceivablePageResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["ReceivableResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["ReceivableResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["SuccessResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["ReceivableResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["ReceivablePaymentPageResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["ReceivablePaymentResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["SuccessResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["SuccessResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["SuccessResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["PlanningLinkResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["SuccessResponseDto"];
                };
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
                content: {
                    "application/json": ((components["schemas"]["TransactionResponseDto"] | components["schemas"]["AccountResponseDto"] | components["schemas"]["CardResponseDto"] | components["schemas"]["LoanResponseDto"] | components["schemas"]["BudgetResponseDto"] | components["schemas"]["SavingsGoalResponseDto"] | components["schemas"]["ReceivableResponseDto"] | components["schemas"]["SubscriptionResponseDto"] | components["schemas"]["MerchantResponseDto"] | components["schemas"]["CategoryResponseDto"]) | null)[];
                };
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
                content: {
                    "application/json": components["schemas"]["WeeklySummaryResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["AnalyticsSummaryResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["SpendingByCategoryResponseDto"][];
                };
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
                content: {
                    "application/json": components["schemas"]["BudgetStatusResponseDto"][];
                };
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
                content: {
                    "application/json": components["schemas"]["SpendingOverTimeResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["RecurringPageResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["RecurringPatternResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["RecurringPatternResponseDto"][];
                };
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
                content: {
                    "application/json": components["schemas"]["RecurringPatternResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["ReconciliationPreviewResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["ReconciliationPageResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["ReconciliationResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["ReconciliationStatusResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["ReconciliationResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["DeleteResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["SuccessResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["BankChargesResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["IntegrityCheckResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["IntegrityRecalculateResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["QuickEntryParseResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["PublicReceivableShareResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["RecycleBinResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["NotificationPageResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["NotificationResponseDto"] | null;
                };
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
                content: {
                    "application/json": components["schemas"]["UnreadNotificationsResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["MarkAllReadResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["NotificationResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["PushTokenResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["NotificationSuccessResponseDto"];
                };
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
                content: {
                    "application/json": components["schemas"]["NotificationSuccessResponseDto"];
                };
            };
        };
    };
}
