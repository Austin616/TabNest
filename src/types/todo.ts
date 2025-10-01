export interface Todo {
  id: string
  text: string
  description?: string
  completed: boolean
  createdAt: Date
  dueDate?: Date
  dueTime?: string // Time in HH:MM format (24-hour)
  reminderDays?: number // Number of days before due date to start showing
  tags?: string[]
}

export type ViewMode = 'day' | 'week'
export type FilterMode = 'all' | 'active' | 'completed'

export interface TodoFilters {
  mode: FilterMode
  showFilters: boolean
}

export interface DateNavigation {
  currentDate: Date
  viewMode: ViewMode
  dateFormat: 'relative' | 'absolute'
}
