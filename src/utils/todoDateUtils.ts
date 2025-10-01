import type { Todo } from '../types/todo'

export interface TodoGroup {
  title: string
  todos: Todo[]
  type: 'overdue' | 'today' | 'upcoming' | 'no-date' | 'completed'
}

export const formatDateForDisplay = (date: Date, format: 'relative' | 'absolute' = 'relative'): string => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const targetDate = new Date(date)
  targetDate.setHours(0, 0, 0, 0)
  
  if (format === 'absolute') {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    })
  }
  
  // Relative format (existing logic)
  const diffTime = targetDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) {
    return 'Today'
  } else if (diffDays === 1) {
    return 'Tomorrow'
  } else if (diffDays === -1) {
    return 'Yesterday'
  } else if (diffDays < 0) {
    return `${Math.abs(diffDays)} days ago`
  } else if (diffDays <= 7) {
    return `In ${diffDays} days`
  } else {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    })
  }
}

export const shouldShowTaskForDate = (todo: Todo, targetDate: Date): boolean => {
  if (!todo.dueDate) return true // Show tasks without due dates everywhere
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const dueDate = new Date(todo.dueDate)
  dueDate.setHours(0, 0, 0, 0)
  
  const checkDate = new Date(targetDate)
  checkDate.setHours(0, 0, 0, 0)
  
  // If task is completed, only show it on its actual due date
  if (todo.completed) {
    return checkDate.getTime() === dueDate.getTime()
  }
  
  // For incomplete tasks that are overdue, show them regardless of current date
  if (dueDate < today) {
    return true // Always show overdue incomplete tasks
  }
  
  // For incomplete tasks that are not overdue
  if (!todo.reminderDays || todo.reminderDays === 0) {
    // No reminder - show only on due date
    return checkDate.getTime() === dueDate.getTime()
  }
  
  // Calculate reminder start date
  const reminderStartDate = new Date(dueDate)
  reminderStartDate.setDate(dueDate.getDate() - todo.reminderDays)
  
  // Show task if target date is within the reminder range
  return checkDate >= reminderStartDate && checkDate <= dueDate
}

export const isTaskReminderActive = (todo: Todo, currentDate: Date): boolean => {
  if (!todo.dueDate || !todo.reminderDays || todo.reminderDays === 0 || todo.completed) {
    return false
  }
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const dueDate = new Date(todo.dueDate)
  dueDate.setHours(0, 0, 0, 0)
  
  const checkDate = new Date(currentDate)
  checkDate.setHours(0, 0, 0, 0)
  
  const reminderStartDate = new Date(dueDate)
  reminderStartDate.setDate(dueDate.getDate() - todo.reminderDays)
  
  // Reminder is active if we're in the reminder window but not yet at due date
  return checkDate >= reminderStartDate && checkDate < dueDate
}

export const organizeTodosByDate = (todos: Todo[], currentDate: Date, viewMode: 'day' | 'week' = 'day', dateFormat: 'relative' | 'absolute' = 'relative'): TodoGroup[] => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const currentDateNormalized = new Date(currentDate)
  currentDateNormalized.setHours(0, 0, 0, 0)
  
  // Filter todos based on view mode and date
  let relevantTodos: Todo[]
  
  if (viewMode === 'day') {
    relevantTodos = todos.filter(todo => shouldShowTaskForDate(todo, currentDate))
  } else {
    // Week view - show tasks for the entire week
    const startOfWeek = new Date(currentDate)
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())
    
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    
    relevantTodos = todos.filter(todo => {
      for (let i = 0; i < 7; i++) {
        const checkDate = new Date(startOfWeek)
        checkDate.setDate(startOfWeek.getDate() + i)
        if (shouldShowTaskForDate(todo, checkDate)) {
          return true
        }
      }
      return false
    })
  }
  
  // Group todos by date categories
  const groups: TodoGroup[] = []
  
  // Separate todos by completion status first
  const activeTodos = relevantTodos.filter(todo => !todo.completed)
  const completedTodos = relevantTodos.filter(todo => todo.completed)
  
  // Group active todos by date and reminder status
  const overdueTodos: Todo[] = []
  const todayTodos: Todo[] = []
  const reminderTodos: Todo[] = []
  const upcomingTodos: Todo[] = []
  const noDateTodos: Todo[] = []
  
  activeTodos.forEach(todo => {
    if (!todo.dueDate) {
      noDateTodos.push(todo)
      return
    }
    
    const dueDate = new Date(todo.dueDate)
    dueDate.setHours(0, 0, 0, 0)
    
    if (dueDate < today) {
      overdueTodos.push(todo)
    } else if (dueDate.getTime() === currentDateNormalized.getTime()) {
      // Tasks due on the selected date
      todayTodos.push(todo)
    } else if (isTaskReminderActive(todo, currentDate)) {
      // Tasks with active reminders (showing early)
      reminderTodos.push(todo)
    } else {
      upcomingTodos.push(todo)
    }
  })
  
  // Sort todos within each group by due date, then by creation date
  const sortTodos = (todos: Todo[]) => {
    return todos.sort((a, b) => {
      if (a.dueDate && b.dueDate) {
        return a.dueDate.getTime() - b.dueDate.getTime()
      }
      if (a.dueDate) return -1
      if (b.dueDate) return 1
      return b.createdAt.getTime() - a.createdAt.getTime()
    })
  }
  
  // Add groups in order of priority
  if (overdueTodos.length > 0) {
    // Group overdue todos by their actual due dates
    const overdueByDate = new Map<string, Todo[]>()
    
    overdueTodos.forEach(todo => {
      if (todo.dueDate) {
        const dateKey = todo.dueDate.toDateString()
        if (!overdueByDate.has(dateKey)) {
          overdueByDate.set(dateKey, [])
        }
        overdueByDate.get(dateKey)!.push(todo)
      }
    })
    
    // Sort dates (oldest first for overdue)
    const sortedOverdueDates = Array.from(overdueByDate.keys()).sort((a, b) => {
      return new Date(a).getTime() - new Date(b).getTime()
    })
    
    sortedOverdueDates.forEach(dateKey => {
      const date = new Date(dateKey)
      const todosForDate = overdueByDate.get(dateKey)!
      
      groups.push({
        title: formatDateForDisplay(date, dateFormat),
        todos: sortTodos(todosForDate),
        type: 'overdue'
      })
    })
  }
  
  if (todayTodos.length > 0) {
    const isToday = currentDateNormalized.getTime() === today.getTime()
    const title = isToday ? formatDateForDisplay(today, dateFormat) : formatDateForDisplay(currentDate, dateFormat)
    groups.push({
      title,
      todos: sortTodos(todayTodos),
      type: 'today'
    })
  }
  
  if (reminderTodos.length > 0) {
    // Group reminder todos by their actual due dates
    const reminderByDate = new Map<string, Todo[]>()
    
    reminderTodos.forEach(todo => {
      if (todo.dueDate) {
        const dateKey = todo.dueDate.toDateString()
        if (!reminderByDate.has(dateKey)) {
          reminderByDate.set(dateKey, [])
        }
        reminderByDate.get(dateKey)!.push(todo)
      }
    })
    
    // Sort dates for reminders
    const sortedReminderDates = Array.from(reminderByDate.keys()).sort((a, b) => {
      return new Date(a).getTime() - new Date(b).getTime()
    })
    
    sortedReminderDates.forEach(dateKey => {
      const date = new Date(dateKey)
      const todosForDate = reminderByDate.get(dateKey)!
      
      groups.push({
        title: `${formatDateForDisplay(date, dateFormat)} (Reminder)`,
        todos: sortTodos(todosForDate),
        type: 'upcoming'
      })
    })
  }
  
  if (upcomingTodos.length > 0) {
    // Group upcoming todos by date
    const upcomingByDate = new Map<string, Todo[]>()
    
    upcomingTodos.forEach(todo => {
      if (todo.dueDate) {
        const dateKey = todo.dueDate.toDateString()
        if (!upcomingByDate.has(dateKey)) {
          upcomingByDate.set(dateKey, [])
        }
        upcomingByDate.get(dateKey)!.push(todo)
      }
    })
    
    // Sort dates and create groups
    const sortedDates = Array.from(upcomingByDate.keys()).sort((a, b) => {
      return new Date(a).getTime() - new Date(b).getTime()
    })
    
    sortedDates.forEach(dateKey => {
      const date = new Date(dateKey)
      const todosForDate = upcomingByDate.get(dateKey)!
      
      groups.push({
        title: formatDateForDisplay(date, dateFormat),
        todos: sortTodos(todosForDate),
        type: 'upcoming'
      })
    })
  }
  
  if (noDateTodos.length > 0) {
    groups.push({
      title: 'No Due Date',
      todos: sortTodos(noDateTodos),
      type: 'no-date'
    })
  }
  
  // Add completed todos grouped by their due dates (only show a few recent ones)
  if (completedTodos.length > 0) {
    // Group completed todos by their due dates
    const completedByDate = new Map<string, Todo[]>()
    
    completedTodos.forEach(todo => {
      if (todo.dueDate) {
        const dateKey = todo.dueDate.toDateString()
        if (!completedByDate.has(dateKey)) {
          completedByDate.set(dateKey, [])
        }
        completedByDate.get(dateKey)!.push(todo)
      }
    })
    
    // Sort dates (most recent first for completed)
    const sortedCompletedDates = Array.from(completedByDate.keys()).sort((a, b) => {
      return new Date(b).getTime() - new Date(a).getTime()
    })
    
    // Show only the most recent 2 date groups to avoid clutter
    const recentDateGroups = sortedCompletedDates.slice(0, 2)
    
    recentDateGroups.forEach(dateKey => {
      const date = new Date(dateKey)
      const todosForDate = completedByDate.get(dateKey)!
      
      groups.push({
        title: `${formatDateForDisplay(date, dateFormat)} (Completed)`,
        todos: sortTodos(todosForDate),
        type: 'completed'
      })
    })
  }
  
  return groups
}

export const formatTimeForDisplay = (timeString: string, dueDate: Date, format: 'relative' | 'absolute' = 'relative'): string => {
  if (format === 'absolute') {
    // Show actual time
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `Due at ${displayHour}:${minutes} ${ampm}`
  }
  
  // Show relative time (due in X hours)
  const now = new Date()
  const taskDateTime = new Date(dueDate)
  const [hours, minutes] = timeString.split(':')
  taskDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)
  
  const diffMs = taskDateTime.getTime() - now.getTime()
  const diffHours = Math.round(diffMs / (1000 * 60 * 60))
  const diffMinutes = Math.round(diffMs / (1000 * 60))
  
  if (diffMs < 0) {
    // Overdue
    const overdueDays = Math.abs(Math.floor(diffMs / (1000 * 60 * 60 * 24)))
    const overdueHours = Math.abs(Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)))
    
    if (overdueDays > 0) {
      return `${overdueDays}d ${overdueHours}h overdue`
    } else if (overdueHours > 0) {
      return `${overdueHours}h overdue`
    } else {
      const overdueMinutes = Math.abs(Math.floor(diffMs / (1000 * 60)))
      return `${overdueMinutes}m overdue`
    }
  } else if (diffHours < 1) {
    // Less than an hour
    if (diffMinutes <= 0) {
      return 'Due now'
    }
    return `Due in ${diffMinutes}m`
  } else if (diffHours < 24) {
    // Same day
    return `Due in ${diffHours}h`
  } else {
    // More than a day away
    const days = Math.floor(diffHours / 24)
    const remainingHours = diffHours % 24
    if (remainingHours === 0) {
      return `Due in ${days}d`
    }
    return `Due in ${days}d ${remainingHours}h`
  }
}

export const getEmptyStateMessage = (currentDate: Date, viewMode: 'day' | 'week' = 'day'): string => {
  const today = new Date()
  const isToday = currentDate.toDateString() === today.toDateString()
  
  if (viewMode === 'week') {
    return 'No tasks for this week'
  }
  
  if (isToday) {
    return 'No tasks due today'
  }
  
  return `No tasks due on ${formatDateForDisplay(currentDate)}`
}
