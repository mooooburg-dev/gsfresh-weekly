'use client'

import { useEffect, useState } from 'react'

export default function CountdownTimer({ targetDateStr }: { targetDateStr?: string }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date()
      let targetDate: Date

      if (targetDateStr) {
        // Parse YYYY-MM-DD strictly as local time
        const [year, month, day] = targetDateStr.split('-').map(Number)
        targetDate = new Date(year, month - 1, day)
        targetDate.setHours(23, 59, 59, 999)
      } else {
        // Fallback: Next Thursday 00:00:00 (Legacy behavior)
        // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
        const currentDay = now.getDay()
        const daysUntilThursday = (4 - currentDay + 7) % 7
        
        targetDate = new Date(now)
        targetDate.setDate(now.getDate() + (daysUntilThursday === 0 ? 7 : daysUntilThursday))
        targetDate.setHours(0, 0, 0, 0)
      }

      const difference = targetDate.getTime() - now.getTime()

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        })
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [targetDateStr])

  const TimeBox = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center gap-2">
      <div className="relative group">
        {/* Reduced glow opacity and adjusted gradient for a cleaner look */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-300 to-orange-400 rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
        {/* Changed background to white/10 for a cleaner, frosty glass effect instead of black/20 */}
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-center shadow-sm">
          <span className="text-3xl sm:text-4xl font-black text-white tabular-nums drop-shadow-sm">
            {value.toString().padStart(2, '0')}
          </span>
        </div>
      </div>
      <span className="text-xs sm:text-sm font-bold text-green-50 tracking-wider">
        {label}
      </span>
    </div>
  )

  const Separator = () => (
    <div className="flex flex-col justify-center h-20 sm:h-24 pb-2">
      <div className="flex flex-col gap-3">
        <div className="w-1 h-1 bg-white/60 rounded-full"></div>
        <div className="w-1 h-1 bg-white/60 rounded-full"></div>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
      <p className="text-green-50 font-medium mb-6 text-sm sm:text-base tracking-wide flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
        이번 주 행사 마감까지 남은 시간
      </p>
      <div className="flex items-center gap-3 sm:gap-6">
        <TimeBox value={timeLeft.days} label="일" />
        <Separator />
        <TimeBox value={timeLeft.hours} label="시간" />
        <Separator />
        <TimeBox value={timeLeft.minutes} label="분" />
      </div>
    </div>
  )
}
