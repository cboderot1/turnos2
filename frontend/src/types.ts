export const CLIENT_TYPES = [
  { value: 'GENERAL', label: 'General' },
  { value: 'TERCERA_EDAD', label: 'Tercera edad' },
  { value: 'DISCAPACITADO', label: 'Discapacitado' },
]

export const SERVICE_TYPES = [
  { value: 'TRAMITE', label: 'Trámite (Matrizador)' },
  { value: 'ASESORIA', label: 'Asesoría (Asesor)' },
]

export type Ticket = {
  id: number
  client_name: string
  client_identifier: string
  motive: string
  client_type: string
  service_type: string
  priority: boolean
  status: string
  assigned_to?: number
}

export type AgentState = {
  id: number
  user_id: number
  status: 'FREE' | 'BUSY'
  current_ticket_id?: number
}

export type ModuleKey = 'cliente' | 'matrizador' | 'asesor' | 'admin' | 'pantalla'
