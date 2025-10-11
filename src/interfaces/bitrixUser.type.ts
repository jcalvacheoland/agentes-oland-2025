export interface IBitrixUser {
  id: string | number | null
  name: string | null
  email: string | null
  position: string | null
  department: unknown

  // Campos heredados para compatibilidad con implementaciones previas
  ID?: string | number | null
  NAME?: string | null
  LAST_NAME?: string | null
  EMAIL?: string | null
  WORK_POSITION?: string | null
  UF_DEPARTMENT?: unknown
  IS_ONLINE?: string | null
  TIME_ZONE?: string | null

  raw?: Record<string, unknown>
}
