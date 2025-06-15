
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, Pill, FileText } from 'lucide-react';

interface Stats {
  patients: number;
  doctors: number;
  medications: number;
  prescriptions: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({
    patients: 0,
    doctors: 0,
    medications: 0,
    prescriptions: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [patientsRes, doctorsRes, medicationsRes, prescriptionsRes] = await Promise.all([
        fetch('https://crudcrud.com/api/e8c5f4a0b8c44e5a9b1e2c3d4e5f6789/patients'),
        fetch('https://crudcrud.com/api/e8c5f4a0b8c44e5a9b1e2c3d4e5f6789/doctors'),
        fetch('https://crudcrud.com/api/e8c5f4a0b8c44e5a9b1e2c3d4e5f6789/medications'),
        fetch('https://crudcrud.com/api/e8c5f4a0b8c44e5a9b1e2c3d4e5f6789/prescriptions')
      ]);

      const patients = await patientsRes.json();
      const doctors = await doctorsRes.json();
      const medications = await medicationsRes.json();
      const prescriptions = await prescriptionsRes.json();

      setStats({
        patients: patients.length,
        doctors: doctors.length,
        medications: medications.length,
        prescriptions: prescriptions.length
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

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
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Prescriptions',
      value: stats.prescriptions,
      icon: FileText,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium bg-gray-200 h-4 w-20 rounded"></CardTitle>
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-200 h-8 w-16 rounded mb-2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to Hospital Management System</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-left transition-colors">
                <Users className="h-6 w-6 text-blue-600 mb-2" />
                <h3 className="font-medium">Add Patient</h3>
                <p className="text-sm text-gray-600">Register new patient</p>
              </button>
              <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-left transition-colors">
                <UserCheck className="h-6 w-6 text-green-600 mb-2" />
                <h3 className="font-medium">Add Doctor</h3>
                <p className="text-sm text-gray-600">Register new doctor</p>
              </button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <p className="text-sm text-gray-600">System initialized successfully</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <p className="text-sm text-gray-600">HMS Dashboard loaded</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
