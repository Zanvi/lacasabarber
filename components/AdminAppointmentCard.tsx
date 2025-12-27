import React, { useState } from 'react';
import { Appointment } from '../types';
import { db } from '../services/dataService';
import { Calendar, Clock, ChevronDown, ChevronUp, User, Phone, CheckCircle, XCircle, Edit3, Save, X, DollarSign, Hourglass } from 'lucide-react';

interface AdminAppointmentCardProps {
  appointment: Appointment;
  onUpdate: () => void;
}

const AdminAppointmentCard: React.FC<AdminAppointmentCardProps> = ({ appointment, onUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [newDate, setNewDate] = useState(appointment.date);
  const [newTime, setNewTime] = useState(appointment.time);

  const statusColors = {
    confirmed: 'text-green-400 bg-green-900/30 border-green-900',
    pending: 'text-yellow-400 bg-yellow-900/30 border-yellow-900',
    cancelled: 'text-red-400 bg-red-900/30 border-red-900',
    completed: 'text-blue-400 bg-blue-900/30 border-blue-900',
    rescheduled: 'text-purple-400 bg-purple-900/30 border-purple-900',
  };

  const statusLabels = {
    confirmed: 'Confirmado',
    pending: 'Pendente',
    cancelled: 'Cancelado',
    completed: 'Concluído',
    rescheduled: 'Reagendado',
  };

  const handleStatusChange = (status: Appointment['status']) => {
    if (window.confirm(`Deseja alterar o status para ${statusLabels[status]}?`)) {
      db.updateAppointment(appointment.id, { status });
      onUpdate();
    }
  };

  const handleReschedule = () => {
    if (newDate === appointment.date && newTime === appointment.time) {
      setIsRescheduling(false);
      return;
    }

    if (window.confirm('Confirmar reagendamento? O cliente será notificado.')) {
      db.updateAppointment(appointment.id, {
        date: newDate,
        time: newTime,
        status: 'rescheduled',
        originalDate: appointment.date,
        originalTime: appointment.time,
      });
      setIsRescheduling(false);
      onUpdate();
    }
  };

  const formatDate = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dateStr;
  };

  return (
    <div className={`bg-zinc-900 border ${isExpanded ? 'border-barber-red' : 'border-zinc-800'} rounded-xl transition-all duration-300 overflow-hidden`}>
      {/* Header Row */}
      <div 
        className="p-4 flex flex-col md:flex-row md:items-center justify-between cursor-pointer hover:bg-zinc-800/50"
        onClick={() => !isRescheduling && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${appointment.status === 'cancelled' ? 'bg-zinc-800 text-zinc-600' : 'bg-zinc-800 text-white'}`}>
             <span className="font-bold text-lg">{appointment.userName.charAt(0)}</span>
          </div>
          <div>
            <h3 className={`font-bold text-lg ${appointment.status === 'cancelled' ? 'text-zinc-500 line-through' : 'text-white'}`}>
              {appointment.userName}
            </h3>
            <p className="text-barber-red text-sm">{appointment.serviceName}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-3 md:mt-0 justify-between md:justify-end w-full md:w-auto">
          <div className="flex flex-col md:items-end text-sm text-zinc-400">
             <span className="flex items-center gap-1">
               <Calendar size={14} /> {formatDate(appointment.date)}
             </span>
             <span className="flex items-center gap-1">
               <Clock size={14} /> {appointment.time}
             </span>
          </div>
          
          <div className={`px-3 py-1 text-xs rounded-full border ${statusColors[appointment.status]} min-w-[90px] text-center`}>
            {statusLabels[appointment.status]}
          </div>

          <div className="text-zinc-500">
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
          
          {/* History Notification */}
          {(appointment.originalDate || appointment.status === 'rescheduled') && (
             <div className="mb-4 p-3 bg-purple-900/20 border border-purple-900/50 rounded-lg flex items-center gap-2 text-purple-200 text-sm">
               <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
               <p>
                 <strong>Histórico:</strong> Agendamento alterado. 
                 Originalmente era dia {formatDate(appointment.originalDate || '')} às {appointment.originalTime}.
               </p>
             </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Client Info */}
            <div>
              <h4 className="text-zinc-500 text-xs uppercase tracking-wider font-bold mb-3">Detalhes do Cliente</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-zinc-300">
                  <User size={16} className="text-barber-red" />
                  <span>{appointment.userName}</span>
                </div>
                <div className="flex items-center gap-3 text-zinc-300">
                  <Phone size={16} className="text-barber-red" />
                  <span>{appointment.userPhone || 'Telefone não registrado'}</span>
                  <a href={`https://wa.me/55${appointment.userPhone?.replace(/\D/g, '')}`} target="_blank" className="text-xs text-green-500 hover:underline ml-2">
                     (Chamar no Zap)
                  </a>
                </div>
              </div>
            </div>

            {/* Service Info */}
            <div>
              <h4 className="text-zinc-500 text-xs uppercase tracking-wider font-bold mb-3">Detalhes do Serviço</h4>
              <div className="space-y-2">
                 <div className="flex items-center gap-3 text-zinc-300">
                  <DollarSign size={16} className="text-barber-red" />
                  <span>R$ {appointment.servicePrice?.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-3 text-zinc-300">
                  <Hourglass size={16} className="text-barber-red" />
                  <span>{appointment.serviceDuration} de duração</span>
                </div>
              </div>
            </div>
          </div>

          {/* Reschedule Form */}
          {isRescheduling && (
            <div className="mt-6 p-4 bg-zinc-800 rounded-xl border border-zinc-700 animate-fade-in">
              <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                <Edit3 size={18} className="text-barber-red"/> Reagendar Horário
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Nova Data</label>
                  <input 
                    type="date" 
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-white focus:border-barber-red outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Novo Horário</label>
                  <input 
                    type="time" 
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-white focus:border-barber-red outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button 
                  onClick={() => setIsRescheduling(false)}
                  className="px-4 py-2 text-sm text-zinc-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleReschedule}
                  className="px-4 py-2 text-sm bg-barber-red hover:bg-barber-redHover text-white rounded-lg flex items-center gap-2"
                >
                  <Save size={16} /> Confirmar Reagendamento
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {!isRescheduling && appointment.status !== 'cancelled' && (
            <div className="mt-6 flex flex-wrap gap-3 border-t border-zinc-800 pt-4">
              <button 
                onClick={() => setIsRescheduling(true)}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 text-sm transition-colors"
              >
                <Edit3 size={16} /> Reagendar
              </button>
              
              {appointment.status !== 'completed' && (
                <button 
                  onClick={() => handleStatusChange('completed')}
                  className="flex-1 bg-blue-900/20 hover:bg-blue-900/40 text-blue-400 border border-blue-900/50 py-2 rounded-lg flex items-center justify-center gap-2 text-sm transition-colors"
                >
                  <CheckCircle size={16} /> Concluir Serviço
                </button>
              )}

              <button 
                onClick={() => handleStatusChange('cancelled')}
                className="flex-1 bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900/50 py-2 rounded-lg flex items-center justify-center gap-2 text-sm transition-colors"
              >
                <XCircle size={16} /> Cancelar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminAppointmentCard;