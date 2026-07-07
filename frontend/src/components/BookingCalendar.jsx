import { useState } from 'react'
import { format, addDays, startOfWeek, isSameDay } from 'date-fns'

const TIME_SLOTS = [
  { start: '17:10', end: '18:10', label: '5:10 PM – 6:10 PM' },
  { start: '19:20', end: '20:20', label: '7:20 PM – 8:20 PM' },
]

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']

export default function BookingCalendar({ availability, onSelect }) {
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [selected, setSelected] = useState(null)

  // Only Mon–Fri (first 5 days of the week)
  const days = Array.from({ length: 5 }, (_, i) => addDays(weekStart, i))

  const isAvailable = (day, slotStart) => {
    const dayName = DAY_NAMES[days.indexOf(day)]
    return (availability[dayName] || []).includes(slotStart)
  }

  const handleSelect = (day, slot) => {
    const [h, m] = slot.start.split(':').map(Number)
    const [eh, em] = slot.end.split(':').map(Number)
    const start = new Date(day)
    start.setHours(h, m, 0, 0)
    const end = new Date(day)
    end.setHours(eh, em, 0, 0)
    setSelected({ day, slotStart: slot.start })
    onSelect({ start_time: start.toISOString(), end_time: end.toISOString() })
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setWeekStart(addDays(weekStart, -7))}
          className="text-sm text-gray-500 hover:text-primary px-2"
        >← Prev</button>
        <span className="text-sm font-medium text-gray-700">
          {format(weekStart, 'MMM d')} – {format(addDays(weekStart, 4), 'MMM d, yyyy')}
        </span>
        <button
          onClick={() => setWeekStart(addDays(weekStart, 7))}
          className="text-sm text-gray-500 hover:text-primary px-2"
        >Next →</button>
      </div>

      <div className="grid gap-2">
        {/* Day headers */}
        <div className="grid grid-cols-6 gap-1 text-xs text-center">
          <div className="text-gray-400 text-right pr-2 font-medium">Time</div>
          {days.map((d, i) => (
            <div key={i} className="font-medium text-gray-600">
              <div>{DAY_NAMES[i]}</div>
              <div className="text-gray-800 font-semibold">{format(d, 'd')}</div>
            </div>
          ))}
        </div>

        {/* Time slot rows */}
        {TIME_SLOTS.map((slot) => (
          <div key={slot.start} className="grid grid-cols-6 gap-1 items-center">
            <div className="text-xs text-gray-500 text-right pr-2 leading-tight">
              {slot.label}
            </div>
            {days.map((day, i) => {
              const dayKey = `${slot.start}-${i}`
              const avail = isAvailable(day, slot.start)
              const isSelected = selected && isSameDay(selected.day, day) && selected.slotStart === slot.start
              return (
                <button
                  key={dayKey}
                  disabled={!avail}
                  onClick={() => handleSelect(day, slot)}
                  className={`rounded-lg py-2.5 text-xs font-medium transition-colors
                    ${avail
                      ? isSelected
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-green-100 text-green-700 hover:bg-primary hover:text-white'
                      : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                    }`}
                >
                  {avail ? (isSelected ? '✓' : 'Open') : '—'}
                </button>
              )
            })}
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 mt-3">Classes run Monday – Friday. Click an open slot to select.</p>
    </div>
  )
}
