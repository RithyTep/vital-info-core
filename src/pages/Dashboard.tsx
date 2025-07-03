"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Users,
  UserCheck,
  Pill,
  Calendar,
  UserPlus,
  CheckCircle2,
  TrendingUp,
  Activity,
  Clock,
  AlertCircle,
  LineChartIcon,
} from "lucide-react"
import { localStorageService } from "@/services/localStorageService"
import { useNavigate } from "react-router-dom"
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { ChartContainer, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/LanguageContext"
import CurrentTime from "@/components/CurrentTime"
import { Badge } from "@/components/ui/badge"

interface Stats {
  patients: number
  doctors: number
  medications: number
  appointments: number
}

interface ActivityEvent {
  type: "patient" | "doctor" | "medication" | "appointment" | "system"
  label: string
  icon: React.ReactNode
  createdAt: Date
  description: string
}

interface MonthlyData {
  month: string
  patients: number
  appointments: number
}

const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({
    patients: 0,
    doctors: 0,
    medications: 0,
    appointments: 0,
  })
  const [recentActivity, setRecentActivity] = useState<ActivityEvent[]>([])
  const [lowStockMeds, setLowStockMeds] = useState<any[]>([])
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([])
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const navigate = useNavigate()
  const { t } = useLanguage()

  useEffect(() => {
    const patients = localStorageService.getPatients()
    const doctors = localStorageService.getDoctors()
    const medications = localStorageService.getMedications()
    const appointments = localStorageService.getAppointments()

    setStats({
      patients: patients.length,
      doctors: doctors.length,
      medications: medications.length,
      appointments: appointments.length,
    })

    // Get low stock medications (assuming stockQuantity field exists)
    const lowStock = medications.filter((med: any) => med.stockQuantity && med.stockQuantity < 10)
    setLowStockMeds(lowStock)

    // Get upcoming appointments (next 7 days)
    const today = new Date()
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    const upcoming = appointments
      .filter((app: any) => {
        const appDate = new Date(app.date)
        return appDate >= today && appDate <= nextWeek && app.status === "Scheduled"
      })
      .slice(0, 5)
    setUpcomingAppointments(upcoming)

    // Generate monthly data for the last 6 months
    const generateMonthlyData = () => {
      const months = []
      const currentDate = new Date()

      for (let i = 5; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
        const monthName = date.toLocaleDateString("en-US", { month: "short" })

        // Count patients registered in this month
        const monthPatients = patients.filter((p: any) => {
          const patientDate = new Date(p.createdAt)
          return patientDate.getMonth() === date.getMonth() && patientDate.getFullYear() === date.getFullYear()
        }).length

        // Count appointments in this month
        const monthAppointments = appointments.filter((a: any) => {
          const appointmentDate = new Date(a.date || a.createdAt)
          return appointmentDate.getMonth() === date.getMonth() && appointmentDate.getFullYear() === date.getFullYear()
        }).length

        months.push({
          month: monthName,
          patients: monthPatients,
          appointments: monthAppointments,
        })
      }

      // If no real data, generate sample data for demonstration
      if (months.every((m) => m.patients === 0 && m.appointments === 0)) {
        return [
          { month: "Aug", patients: 12, appointments: 45 },
          { month: "Sep", patients: 18, appointments: 52 },
          { month: "Oct", patients: 15, appointments: 38 },
          { month: "Nov", patients: 22, appointments: 61 },
          { month: "Dec", patients: 28, appointments: 74 },
          { month: "Jan", patients: 25, appointments: 68 },
        ]
      }

      return months
    }

    setMonthlyData(generateMonthlyData())

    // Collect activity events from all sources
    const activities: ActivityEvent[] = []

    patients.forEach((p: any) =>
      activities.push({
        type: "patient",
        label: t("patients"),
        icon: <Users className="h-4 w-4 text-blue-500" />,
        createdAt: new Date(p.createdAt),
        description: `${t("New patient")} "${p.name}" ${t("registered.")}`,
      }),
    )

    doctors.forEach((d: any) =>
      activities.push({
        type: "doctor",
        label: t("doctors"),
        icon: <UserCheck className="h-4 w-4 text-green-500" />,
        createdAt: new Date(d.createdAt),
        description: `${t("Doctor")} "${d.name}" ${t("added.")}`,
      }),
    )

    medications.forEach((m: any) =>
      activities.push({
        type: "medication",
        label: t("medications"),
        icon: <Pill className="h-4 w-4 text-indigo-500" />,
        createdAt: new Date(m.createdAt),
        description: `${t("Medication")} "${m.name}" ${t("added.")}`,
      }),
    )

    appointments.forEach((a: any) =>
      activities.push({
        type: "appointment",
        label: t("appointments"),
        icon: <Calendar className="h-4 w-4 text-pink-500" />,
        createdAt: new Date(a.createdAt),
        description: `${t("Appointment for")} "${a.patientName || t("Unknown Patient")}" ${t("with Dr.")} ${a.doctorName || t("Unknown Doctor")} ${t("scheduled.")}`,
      }),
    )

    // Add fixed system events if list is empty
    if (activities.length === 0) {
      activities.push({
        type: "system",
        label: "system",
        icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
        createdAt: new Date(),
        description: t("System initialized successfully") || "System initialized successfully",
      })
    }

    // Convert and sort by createdAt descending (newest first)
    activities.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    // Take up to 5 activities
    setRecentActivity(activities.slice(0, 5))
  }, [t])

  const statCards = [
    {
      title: t("totalPatients"),
      value: stats.patients,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-500",
      lightBg: "bg-blue-50",
      change: "+12%",
      trend: "up",
    },
    {
      title: t("totalDoctors"),
      value: stats.doctors,
      icon: UserCheck,
      color: "text-green-600",
      bgColor: "bg-green-500",
      lightBg: "bg-green-50",
      change: "+5%",
      trend: "up",
    },
    {
      title: t("medications"),
      value: stats.medications,
      icon: Pill,
      color: "text-indigo-600",
      bgColor: "bg-indigo-500",
      lightBg: "bg-indigo-50",
      change: "+8%",
      trend: "up",
    },
    {
      title: t("appointments"),
      value: stats.appointments,
      icon: Calendar,
      color: "text-pink-600",
      bgColor: "bg-pink-500",
      lightBg: "bg-pink-50",
      change: "+15%",
      trend: "up",
    },
  ]

  const chartConfig = {
    patients: {
      label: t("patients"),
      color: "hsl(220, 70%, 50%)",
    },
    appointments: {
      label: t("appointments"),
      color: "hsl(280, 70%, 50%)",
    },
  } satisfies ChartConfig

  return (
    <div className="p-6 space-y-8 min-h-screen">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {t("dashboard")}
          </h1>
          <p className="text-gray-600 text-lg">Welcome back! Here's what's happening at your clinic today.</p>
        </div>
        <div className="flex items-center space-x-4">
          <CurrentTime />
          <Badge variant="outline" className="px-3 py-1 bg-green-50 text-green-700 border-green-200">
            <Activity className="w-4 h-4 mr-1" />
            System Online
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card
            key={index}
            className="relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border-0 bg-white/90 backdrop-blur-sm cursor-pointer"
            onClick={() => {
              if (stat.title === t("totalPatients")) navigate("/patients")
              else if (stat.title === t("totalDoctors")) navigate("/doctors")
              else if (stat.title === t("medications")) navigate("/medications")
              else if (stat.title === t("appointments")) navigate("/appointments")
            }}
          >
            <div className={`absolute inset-0 ${stat.lightBg} opacity-30`}></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
              <div className={`p-3 rounded-full ${stat.bgColor} shadow-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="flex items-center space-x-1 text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm font-medium">{stat.change}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">vs last month</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Charts and Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Monthly Trends Chart */}
          <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-xl">
            <CardHeader className="flex flex-row items-center gap-2">
              <LineChartIcon className="h-6 w-6 text-blue-600" />
              <CardTitle>Monthly Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                <LineChart data={monthlyData} accessibilityLayer>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    stroke="#888888"
                    fontSize={12}
                  />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="patients"
                    stroke="var(--color-patients)"
                    strokeWidth={3}
                    dot={{ fill: "var(--color-patients)", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: "var(--color-patients)", strokeWidth: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="appointments"
                    stroke="var(--color-appointments)"
                    strokeWidth={3}
                    dot={{ fill: "var(--color-appointments)", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: "var(--color-appointments)", strokeWidth: 2 }}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Activity & Alerts */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Activity className="h-5 w-5 text-green-600" />
                </div>
                <span>{t("recentActivity")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {recentActivity.length === 0 ? (
                  <div className="text-sm text-gray-400 text-center py-8">{t("No recent activity found")}</div>
                ) : (
                  recentActivity.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="p-2 bg-white rounded-full shadow-sm">{item.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 font-medium">{item.description}</p>
                        <div className="text-xs text-gray-500 mt-1">
                          {item.createdAt.toLocaleString(undefined, {
                            year: "2-digit",
                            month: "short",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Low Stock Alert */}
          {lowStockMeds.length > 0 && (
            <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-xl border-l-4 border-l-orange-500">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-orange-700">
                  <AlertCircle className="h-5 w-5" />
                  <span>Low Stock Alert</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {lowStockMeds.slice(0, 3).map((med, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-orange-50 rounded-lg">
                      <span className="text-sm font-medium text-orange-800">{med.name}</span>
                      <Badge variant="outline" className="text-orange-700 border-orange-300">
                        {med.stockQuantity} left
                      </Badge>
                    </div>
                  ))}
                  {lowStockMeds.length > 3 && (
                    <p className="text-xs text-gray-500 text-center">+{lowStockMeds.length - 3} more items</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upcoming Appointments */}
          {upcomingAppointments.length > 0 && (
            <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <span>Upcoming Appointments</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingAppointments.map((apt, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100"
                      onClick={() => navigate(`/appointments/${apt.id}`)}
                    >
                      <div>
                        <p className="text-sm font-medium text-blue-800">{apt.patientName}</p>
                        <p className="text-xs text-blue-600">
                          {apt.date} at {apt.time}
                        </p>
                      </div>
                      <Badge className="bg-blue-100 text-blue-700 border-blue-200">{apt.status}</Badge>
                    </div>
                  ))} 
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
