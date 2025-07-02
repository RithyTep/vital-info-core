import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  MapPin, 
  FileText, 
  History, 
  Stethoscope, 
  Edit, 
  Trash2,
  AlertCircle,
  Clock,
  ChevronLeft,
  Shield,
  FileIcon
} from "lucide-react";
import { localStorageService, Patient, Appointment } from "@/services/localStorageService";
import { useLanguage } from "@/contexts/LanguageContext";
import PatientEditDialog from "@/components/PatientEditDialog";

const PatientDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  useEffect(() => {
    const fetchPatient = async () => {
      setLoading(true);
      if (id) {
        await new Promise(resolve => setTimeout(resolve, 300));
        const found = localStorageService.getPatients().find((p) => p.id === id);
        setPatient(found || null);
        const allAppointments = localStorageService.getAppointments();
        setAppointments(allAppointments.filter(app => app.patientId === id));
      }
      setLoading(false);
    };

    fetchPatient();
  }, [id]);

  const handleEdit = () => {
    navigate(`/patients/${id}/edit`);
  };

  const handleDelete = () => {
    if (window.confirm(t('confirmDelete') || 'Are you sure you want to delete this patient?')) {
      localStorageService.deletePatient(id!);
      navigate('/patients');
    }
  };

  const openEditDialog = () => {
    setEditDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/30">
        <div className="max-w-6xl mx-auto p-6">
          <div className="animate-pulse space-y-6">
            <div className="flex items-center justify-between">
              <div className="h-10 bg-gray-200 rounded-lg w-20"></div>
              <div className="flex gap-3">
                <div className="h-9 bg-gray-200 rounded-lg w-16"></div>
                <div className="h-9 bg-gray-200 rounded-lg w-20"></div>
              </div>
            </div>
            
            <Card className="p-8">
              <div className="flex items-start gap-8">
                <div className="w-32 h-32 bg-gray-200 rounded-2xl"></div>
                <div className="flex-1 space-y-4">
                  <div className="h-8 bg-gray-200 rounded w-64"></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-4 bg-gray-200 rounded w-48"></div>
                    <div className="h-4 bg-gray-200 rounded w-40"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-4 bg-gray-200 rounded w-36"></div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gray-50/30 flex items-center justify-center">
        <Card className="p-12 text-center max-w-md mx-auto shadow-lg">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold mb-3 text-gray-900">
            {t('patientNotFound') || 'Patient Not Found'}
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            {t('patientNotFoundDescription') || 'The patient you are looking for does not exist or has been removed.'}
          </p>
          <Button onClick={() => navigate(-1)} className="w-full">
            <ChevronLeft className="w-4 h-4 mr-2" />
            {t('back') || 'Back'}
          </Button>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'inactive': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="hover:bg-white hover:shadow-sm transition-all duration-200 rounded-xl px-4 py-2"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            {t('back') || 'Back'}
          </Button>
          <div className="flex gap-3">
            <Button 
              onClick={openEditDialog} 
              variant="outline" 
              size="sm"
              className="hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors rounded-xl"
            >
              <Edit className="w-4 h-4 mr-2" />
              {t('edit') || 'Edit'}
            </Button>
            <Button 
              onClick={handleDelete} 
              variant="outline" 
              size="sm"
              className="hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-colors rounded-xl text-red-600 border-red-200"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {t('delete') || 'Delete'}
            </Button>
          </div>
        </div>

        <Card className="relative overflow-hidden border-0 shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800"></div>
          <div className="relative p-8">
            <div className="flex items-start gap-8">
              <Avatar className="w-32 h-32 border-4 border-white/20 shadow-2xl backdrop-blur-sm">
                <AvatarImage src={patient.profilePicture} alt={patient.name} />
                <AvatarFallback className="text-3xl bg-white/10 text-white backdrop-blur-sm">
                  {patient.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-white">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-4xl font-bold mb-2">{patient.name}</h1>
                    <p className="text-blue-100 text-lg">Patient ID: {patient.id}</p>
                  </div>
                  <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                    Active
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-50">
                  <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                    <Mail className="w-5 h-5 text-blue-200" />
                    <span>{patient.email}</span>
                  </div>
                  <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                    <Phone className="w-5 h-5 text-blue-200" />
                    <span>{patient.contact}</span>
                  </div>
                  <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                    <User className="w-5 h-5 text-blue-200" />
                    <span>{t(patient.gender)}</span>
                  </div>
                  <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                    <Calendar className="w-5 h-5 text-blue-200" />
                    <span>{t('age') || 'Age'}: {patient.age}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm rounded-xl p-1 h-14">
            <TabsTrigger 
              value="overview" 
              className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200"
            >
              <FileText className="w-4 h-4 mr-2" />
              {t('overview') || 'Overview'}
            </TabsTrigger>
            <TabsTrigger 
              value="medical"
              className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200"
            >
              <Stethoscope className="w-4 h-4 mr-2" />
              {t('medical') || 'Medical'}
            </TabsTrigger>
            <TabsTrigger 
              value="appointments"
              className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200"
            >
              <Clock className="w-4 h-4 mr-2" />
              {t('appointments') || 'Appointments'}
            </TabsTrigger>
            <TabsTrigger 
              value="documents"
              className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200"
            >
              <FileIcon className="w-4 h-4 mr-2" />
              {t('documents') || 'Documents'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6 shadow-sm border-0 bg-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {t('description') || 'Description'}
                  </h3>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 min-h-[100px] text-gray-700 leading-relaxed">
                  {patient.description || (
                    <span className="text-gray-500 italic">
                      {t('noDescription') || 'No description available'}
                    </span>
                  )}
                </div>
              </Card>

              <Card className="p-6 shadow-sm border-0 bg-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {t('address') || 'Address'}
                  </h3>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 min-h-[100px] text-gray-700 leading-relaxed">
                  {patient.address || (
                    <span className="text-gray-500 italic">
                      {t('noAddress') || 'No address provided'}
                    </span>
                  )}
                </div>
              </Card>
            </div>

            <Card className="p-6 shadow-sm border-0 bg-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="font-semibold text-gray-900 text-lg">
                  {t('emergencyContact') || 'Emergency Contact'}
                </h3>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-gray-700">
                {patient.emergencyContact ? (
                  <span>{patient.emergencyContact}</span>
                ) : (
                  <span className="text-gray-500 italic">
                    {t('noEmergencyContact') || 'No emergency contact information'}
                  </span>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="medical" className="space-y-6">
            <Card className="p-6 shadow-sm border-0 bg-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <History className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 text-lg">
                  {t('medicalHistory') || 'Medical History'}
                </h3>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 min-h-[120px] text-gray-700 whitespace-pre-wrap leading-relaxed">
                {patient.medicalHistory || (
                  <span className="text-gray-500 italic">
                    {t('noMedicalHistory') || 'No medical history recorded'}
                  </span>
                )}
              </div>
            </Card>

            <Card className="p-6 shadow-sm border-0 bg-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 text-lg">
                  {t('assignedDoctor') || 'Assigned Doctor'}
                </h3>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 min-h-[80px] flex items-center">
                {patient.assignedDoctor ? (() => {
                  const doctor = localStorageService.getDoctors().find(d => d.name === patient.assignedDoctor);
                  return doctor ? (
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={doctor.profilePicture || ''} alt={doctor.name} />
                        <AvatarFallback className="bg-blue-500 text-white">
                          {doctor.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900">{doctor.name}</p>
                        <p className="text-sm text-gray-500">{doctor.specialty}</p>
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-700">{patient.assignedDoctor}</span>
                  );
                })() : (
                  <span className="text-gray-500 italic">
                    {t('noDoctorAssigned') || 'No doctor assigned'}
                  </span>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="appointments" className="space-y-6">
            <Card className="p-6 shadow-sm border-0 bg-white">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900 text-lg">
                  {t('upcomingAppointments') || 'Upcoming Appointments'}
                </h3>
              </div>
              <div className="space-y-4">
                {appointments.length > 0 ? (
                  appointments.map((appointment, index) => (
                    <div key={index} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-2">{appointment.reason}</h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(appointment.date)} at {appointment.time}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Stethoscope className="w-4 h-4" />
                              <span>Dr. {appointment.doctorName}</span>
                            </div>
                          </div>
                        </div>
                        <Badge className={`${getStatusColor(appointment.status)} font-medium`}>
                          {appointment.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-gray-50 rounded-xl p-8 text-center">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 italic">
                      {t('noAppointments') || 'No upcoming appointments'}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <Card className="p-6 shadow-sm border-0 bg-white">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileIcon className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 text-lg">
                  {t('documents') || 'Documents'}
                </h3>
              </div>
              <div className="bg-gray-50 rounded-xl p-8 text-center">
                <FileIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 italic">
                  {t('noDocuments') || 'No documents uploaded'}
                </p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        <PatientEditDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          patient={patient}
          onSave={updated => {
            setPatient(updated);
            setEditDialogOpen(false);
          }}
        />
      </div>
    </div>
  );
};

export default PatientDetail;
