import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, Pill, Calendar, BarChart as BarChartIcon, UserPlus, CheckCircle2 } from 'lucide-react';
import { localStorageService } from '@/services/localStorageService';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import CurrentTime from '@/components/CurrentTime';

interface Stats {
  patients: number;
  doctors: number;
  medications: number;
  appointments: number;
}

interface ActivityEvent {
  type: 'patient' | 'doctor' | 'medication' | 'appointment' | 'system';
  label: string;
  icon: React.ReactNode;
  createdAt: Date;
  description: string;
}

const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({
    patients: 0,
    doctors: 0,
    medications: 0,
    appointments: 0
  });
  const [recentActivity, setRecentActivity] = useState<ActivityEvent[]>([]);
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    const patients = localStorageService.getPatients();
    const doctors = localStorageService.getDoctors();
    const medications = localStorageService.getMedications();
    const appointments = localStorageService.getAppointments();

    setStats({
      patients: patients.length,
      doctors: doctors.length,
      medications: medications.length,
      appointments: appointments.length
    });

    // Collect activity events from all sources
    let activities: ActivityEvent[] = [];

    patients.forEach((p) =>
      activities.push({
        type: 'patient',
        label: t('patients'),
        icon: <Users className="h-4 w-4 text-blue-500" />,
        createdAt: new Date(p.createdAt),
        description: `${t('New patient')} "${p.name}" ${t('registered.')}`
      })
    );

    doctors.forEach((d) =>
      activities.push({
        type: 'doctor',
        label: t('doctors'),
        icon: <UserCheck className="h-4 w-4 text-green-500" />,
        createdAt: new Date(d.createdAt),
        description: `${t('Doctor')} "${d.name}" ${t('added.')}`
      })
    );

    medications.forEach((m) =>
      activities.push({
        type: 'medication',
        label: t('medications'),
        icon: <Pill className="h-4 w-4 text-indigo-500" />,
        createdAt: new Date(m.createdAt),
        description: `${t('Medication')} "${m.name}" ${t('added.')}`
      })
    );

    appointments.forEach((a) =>
      activities.push({
        type: 'appointment',
        label: t('appointments'),
        icon: <Calendar className="h-4 w-4 text-pink-500" />,
        createdAt: new Date(a.createdAt),
        description:
          `${t('Appointment for')} "${a.patientName || t('Unknown Patient')}" ${t('with Dr.')} ${a.doctorName || t('Unknown Doctor')} ${t('scheduled.')}`
      })
    );

    // Add fixed system events if list is empty
    if (activities.length === 0) {
      activities.push(
        {
          type: 'system',
          label: 'system',
          icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
          createdAt: new Date(),
          description: t('System initialized successfully') || 'System initialized successfully'
        }
      );
    }

    // Convert and sort by createdAt descending (newest first)
    activities.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Take up to 5 activities (was 10)
    setRecentActivity(activities.slice(0, 5));

  }, [t]);

  const statCards = [
    {
      title: t('totalPatients'),
      value: stats.patients,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: t('totalDoctors'),
      value: stats.doctors,
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: t('medications'),
      value: stats.medications,
      icon: Pill,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    },
    {
      title: t('appointments'),
      value: stats.appointments,
      icon: Calendar,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100'
    }
  ];

  const chartConfig = {
    total: {
      label: t('totalPatients'),
    },
    patients: {
      label: t('patients'),
      color: 'hsl(var(--chart-1))',
    },
    doctors: {
      label: t('doctors'),
      color: 'hsl(var(--chart-2))',
    },
    medications: {
      label: t('medications'),
      color: 'hsl(var(--chart-3))',
    },
    appointments: {
        label: t('appointments'),
        color: 'hsl(var(--chart-4))',
    }
  } satisfies ChartConfig;

  const chartData = [
    { name: t('patients'), total: stats.patients, fill: 'var(--color-patients)' },
    { name: t('doctors'), total: stats.doctors, fill: 'var(--color-doctors)' },
    { name: t('medications'), total: stats.medications, fill: 'var(--color-medications)' },
    { name: t('appointments'), total: stats.appointments, fill: 'var(--color-appointments)' },
  ];

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('dashboard')}</h1>
          <p className="text-gray-600">{t("Welcome to your modern Hospital Management System")}</p>
        </div>
        {/* Show time in GMT+7 on Dashboard */}
        <CurrentTime />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                {stat.title}
              </CardTitle>
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('quickActions')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col space-y-3">
            <Button variant="outline" onClick={() => navigate('/patients?action=add')}>
              <UserPlus className="mr-2 h-4 w-4" /> {t('addNewPatient')}
            </Button>
            <Button variant="outline" onClick={() => navigate('/doctors?action=add')}>
              <UserCheck className="mr-2 h-4 w-4" /> {t('addDoctor')}
            </Button>
            <Button variant="outline" onClick={() => navigate('/appointments?action=add')}>
              <Calendar className="mr-2 h-4 w-4" /> {t('addAppointment')}
            </Button>
          </CardContent>
        </Card>

        {/* REAL Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>{t('recentActivity')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <div className="text-sm text-gray-400">{t("No recent activity found")}</div>
              ) : (
                recentActivity.map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-3">
                    {item.icon}
                    <div>
                      <p className="text-sm text-gray-600">{item.description}</p>
                      <div className="text-xs text-gray-500">
                        {item.createdAt.toLocaleString(undefined, {
                          year: "2-digit",
                          month: "short",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <BarChartIcon className="h-6 w-6" />
          <CardTitle>{t('System Overview') || 'System Overview'}</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
            <BarChart data={chartData} accessibilityLayer>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                stroke="#888888"
                fontSize={12}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
                allowDecimals={false}
              />
              <Tooltip
                cursor={{ fill: 'hsl(var(--muted))', radius: 4 }}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Bar dataKey="total" radius={4}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
