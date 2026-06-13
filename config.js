// ─── ChiroDesk Runtime Configuration ────────────────────────────
// EDIT THIS FILE DIRECTLY on the gh-pages branch with GitHub's pencil
// icon — no rebuild needed. Changes go live in ~1 minute.
//
// SUPABASE_ANON_KEY: from
//   https://supabase.com/dashboard/project/pxubjqdwsrttwcrsuuwg/settings/api
//   → copy the "anon / public" key (NOT service_role) between the quotes.
//
// NOTIFY_WEBHOOK_URL: public HTTPS n8n webhook (leave "" for now —
//   notifications queue in Supabase until this is set).
window.CHIRODESK_CONFIG = {
  SUPABASE_URL: 'https://pxubjqdwsrttwcrsuuwg.supabase.co',
  SUPABASE_ANON_KEY: '',
  NOTIFY_WEBHOOK_URL: ''
}
