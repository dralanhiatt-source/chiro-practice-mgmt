// Supabase REST helper for ChiroDesk.
// The anon key is public by design; writes are gated by Row Level Security
// policies in Supabase (confirmed_appointments has an anon INSERT policy).
const SUPABASE_URL = 'https://pxubjqdwsrttwcrsuuwg.supabase.co'
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4dWJqcWR3c3J0dHdjcnN1dXdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0MTAxODcsImV4cCI6MjA5NDk4NjE4N30.XOGfpy0ihvsNVdAq0Y9VcDFWTxbcEaEyQ5Mxe2MFf7M'

// Insert a confirmed appointment so the SMS auto-confirmation workflow can
// pick it up (it watches for status='confirmed' AND notified_patient=false).
// Returns the created row; throws on failure.
export async function saveConfirmedAppointment({ patient_name, phone, office, appointment_datetime }) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/confirmed_appointments`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify({
      patient_name,
      phone,
      office,
      appointment_datetime,
      status: 'confirmed',
      notified_patient: false,
    }),
  })
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`Supabase insert failed (${res.status}): ${txt}`)
  }
  return (await res.json())[0]
}

// Insert a patient intake row (anon key). Caller passes a row matching the
// patient_intake columns. Throws on failure so callers can log it.
export async function savePatientIntake(row) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/patient_intake`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(row),
  })
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`patient_intake insert failed (${res.status}): ${txt}`)
  }
}
