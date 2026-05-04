const AUTH_SESSION_KEYS = [
  'clinix_session_token',
  'clinix_pending_email',
  'clinix_pending_role',
  'clinix_remember_me',
  'clinix_register_cooldown_until',
  'clinix_user_id',
  'clinix_patient_id',
  'clinix_user_name',
  'clinix_user_role',
  'clinix_profile_image',
]

export function clearClinixSession() {
  for (const key of AUTH_SESSION_KEYS) {
    localStorage.removeItem(key)
  }
}

export function isAuthSessionError(error) {
  return error?.status === 401 || error?.code === 'AUTH_SESSION_EXPIRED'
}

