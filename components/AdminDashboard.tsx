import React, { useState } from 'react';
import { User, Service, Appointment } from '../types';
import { db } from '../services/dataService';
import AdminAppointmentCard from './AdminAppointmentCard';
import ServiceForm from './ServiceForm';
import { Calendar, Scissors, Plus, Trash2, LogOut, Clock, Edit2 } from 'lucide-react';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'appointments' | 'services'>('appointments');
  const [services, setServices] = useState<Service[]>(db.getAllServices());
  const [appointments, setAppointments] = useState<Appointment[]>(db.getAppointments());
  
  // Date Filter State
  const [filterDate, setFilterDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // Modal States
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | undefined>(undefined);

  const refreshData = () => {
    setServices(db.getAllServices());
    setAppointments(db.getAppointments());
  };

  const handleOpenAddService = () => {
    setEditingService(undefined);
    setIsServiceModalOpen(true);
  };

  const handleOpenEditService = (service: Service) => {
    setEditingService(service);
    setIsServiceModalOpen(true);
  };

  const handleServiceSubmit = (data: any) => {
    if (editingService) {
      db.updateService(editingService.id, data);
    } else {
      db.addService(data);
    }
    setIsServiceModalOpen(false);
    refreshData();
  };

  const handleDeleteService = (id: string) => {
    if (window.confirm('Tem certeza que deseja desativar este serviço?')) {
      db.deleteService(id);
      refreshData();
    }
  };

  // Filter Logic
  const filteredAppointments = appointments.filter(apt => {
    // If filtering by date, show appointments for that date OR rescheduled ones that originated from that date
    return apt.date === filterDate || (apt.originalDate === filterDate && apt.status === 'rescheduled');
  });

  const formatDateDisplay = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}`;
    return dateStr;
  };

  return (
    <div className="min-h-screen bg-barber-black flex flex-col md:flex-row text-zinc-200 font-sans">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-barber-dark border-r border-zinc-800 p-6 flex flex-col z-20 shadow-xl">
        <div className="mb-10 flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-barber-red to-red-900 rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-red-900/30">
            👨‍💻
          </div>
          <div>
            <h2 className="font-bold text-white tracking-wide">Painel Admin</h2>
            <p className="text-xs text-barber-muted">Gestão da Barbearia</p>
          </div>
        </div>

        <nav className="space-y-2 flex-1">
          <button 
            onClick={() => setActiveTab('appointments')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-medium ${activeTab === 'appointments' ? 'bg-zinc-800 text-white shadow-inner' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'}`}
          >
            <Calendar size={20} /> Agenda
          </button>
          <button 
            onClick={() => setActiveTab('services')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-medium ${activeTab === 'services' ? 'bg-zinc-800 text-white shadow-inner' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'}`}
          >
            <Scissors size={20} /> Serviços
          </button>
        </nav>

        <button onClick={onLogout} className="mt-auto flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-900/10 rounded-xl transition-colors">
          <LogOut size={20} /> Sair do Sistema
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto bg-barber-black relative">
        {activeTab === 'appointments' && (
          <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                 <h1 className="text-3xl font-bold text-white mb-1">Agenda Diária</h1>
                 <p className="text-zinc-400 text-sm">Gerencie seus horários e clientes</p>
              </div>
              
              <div className="flex items-center gap-3 bg-zinc-900 p-1.5 rounded-xl border border-zinc-800 shadow-sm">
                <div className="px-3 text-zinc-400 text-sm font-medium flex items-center gap-2">
                  <Calendar size={16}/> Data:
                </div>
                <input 
                  type="date" 
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="bg-zinc-800 text-white focus:outline-none p-2 rounded-lg border border-transparent focus:border-barber-red transition-colors text-sm [&::-webkit-calendar-picker-indicator]:invert cursor-pointer"
                />
              </div>
            </div>

            <div className="space-y-4">
              {filteredAppointments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 bg-zinc-900/30 rounded-2xl border-2 border-dashed border-zinc-800">
                  <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-4 text-zinc-600">
                    <Calendar size={32} />
                  </div>
                  <h3 className="text-zinc-300 font-bold text-lg">Agenda Livre</h3>
                  <p className="text-zinc-500">Nenhum agendamento para {formatDateDisplay(filterDate)}.</p>
                </div>
              ) : (
                filteredAppointments.map(apt => (
                  <AdminAppointmentCard 
                    key={apt.id} 
                    appointment={apt} 
                    onUpdate={refreshData} 
                  />
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">Catálogo de Serviços</h1>
                <p className="text-zinc-400 text-sm">Adicione, edite ou remova serviços</p>
              </div>
              <button 
                onClick={handleOpenAddService}
                className="bg-barber-red hover:bg-barber-redHover text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-red-900/30 flex items-center gap-2 transition-all transform hover:scale-105"
              >
                <Plus size={20} /> Novo Serviço
              </button>
            </div>

            <div className="grid gap-4">
              {services.map(service => (
                <div key={service.id} className={`group bg-zinc-900 border ${service.active ? 'border-zinc-800' : 'border-zinc-800 opacity-60'} p-5 rounded-xl flex justify-between items-center hover:border-zinc-600 transition-all`}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center overflow-hidden">
                       {service.imageUrl ? (
                         <img src={service.imageUrl} alt={service.name} className="w-full h-full object-cover" />
                       ) : (
                         <Scissors size={20} className="text-zinc-500" />
                       )}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg flex items-center gap-2">
                        {service.name}
                        {!service.active && <span className="text-xs bg-red-900/50 text-red-400 px-2 py-0.5 rounded">Inativo</span>}
                      </h3>
                      <p className="text-sm text-zinc-400 mt-1 flex items-center gap-3">
                        <span className="flex items-center gap-1"><Clock size={14}/> {service.duration}</span>
                        <span className="w-1 h-1 bg-zinc-600 rounded-full"></span>
                        <span className="text-barber-red font-bold">R$ {service.price.toFixed(2)}</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleOpenEditService(service)}
                      className="p-2.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDeleteService(service.id)}
                      className="p-2.5 text-zinc-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                      title={service.active ? "Desativar" : "Ativar"}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Service Modal */}
      {isServiceModalOpen && (
        <ServiceForm 
          title={editingService ? "Editar Serviço" : "Novo Serviço"}
          initialData={editingService}
          onSubmit={handleServiceSubmit}
          onCancel={() => setIsServiceModalOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;