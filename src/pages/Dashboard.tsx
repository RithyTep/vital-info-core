
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

interface Stats {
  patients: number;
  doctors: number;
  medications: number;
  appointments: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({
    patients: 0,
    doctors: 0,
    medications: 0,
    appointments: 0
  });
  const navigate = useNavigate();

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
  }, []);

  const statCards = [
    {
      title: 'Total Patients',
      value: stats.patients,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Total Doctors',
      value: stats.doctors,
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Medications',
      value: stats.medications,
      icon: Pill,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    },
    {
      title: 'Appointments',
      value: stats.appointments,
      icon: Calendar,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100'
    }
  ];

  const chartConfig = {
    total: {
      label: 'Total',
    },
    patients: {
      label: 'Patients',
      color: 'hsl(var(--chart-1))',
    },
    doctors: {
      label: 'Doctors',
      color: 'hsl(var(--chart-2))',
    },
    medications: {
      label: 'Medications',
      color: 'hsl(var(--chart-3))',
    },
    appointments: {
        label: 'Appointments',
        color: 'hsl(var(--chart-4))',
    }
  } satisfies ChartConfig;

  const chartData = [
    { name: 'Patients', total: stats.patients, fill: 'var(--color-patients)' },
    { name: 'Doctors', total: stats.doctors, fill: 'var(--color-doctors)' },
    { name: 'Medications', total: stats.medications, fill: 'var(--color-medications)' },
    { name: 'Appointments', total: stats.appointments, fill: 'var(--color-appointments)' },
  ];

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to your modern Hospital Management System</p>
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
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col space-y-3">
            <Button variant="outline" onClick={() => navigate('/patients?action=add')}>
              <UserPlus className="mr-2 h-4 w-4" /> Add New Patient
            </Button>
            <Button variant="outline" onClick={() => navigate('/doctors?action=add')}>
              <UserCheck className="mr-2 h-4 w-4" /> Add New Doctor
            </Button>
            <Button variant="outline" onClick={() => navigate('/appointments?action=add')}>
              <Calendar className="mr-2 h-4 w-4" /> Schedule Appointment
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <p className="text-sm text-gray-600">System initialized successfully</p>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <p className="text-sm text-gray-600">HMS Dashboard loaded</p>
              </div>
              <div className="flex items-center space-x-3">
                <Users className="h-4 w-4 text-blue-500" />
                <p className="text-sm text-gray-600">New patient "John Doe" registered.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <BarChartIcon className="h-6 w-6" />
          <CardTitle>System Overview</CardTitle>
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
