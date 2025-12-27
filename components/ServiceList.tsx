import React, { useState, useEffect } from 'react';
import { db } from '../services/dataService';
import { Service } from '../types';
import { BARBERSHOP_INFO } from '../constants';
import { X, MapPin, Phone, User as UserIcon } from 'lucide-react';

interface ServiceListProps {
  isOpen: boolean;
  onClose: () => void;
}

const ServiceList: React.FC<ServiceListProps> = ({ isOpen, onClose }) => {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    // In a real app, this would be a subscription or re-fetch on update
    setServices(db.getServices());
  }, [isOpen]);

  return (
    <div className={`
      fixed inset-y-0 left-0 z-40 w-full md:w-80 bg-barber-dark border-r border-zinc-800 transform transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:block
    `}>
      <div className="h-full flex flex-col overflow-y-auto">
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide">TABELA DE PREÇOS</h2>
            <div className="w-10 h-1 bg-barber-red mt-2"></div>
          </div>
          <button onClick={onClose} className="md:hidden text-zinc-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 flex-1">
          <ul className="space-y-4">
            {services.map((service) => (
              <li key={service.id} className="flex justify-between items-start border-b border-zinc-800 pb-2 last:border-0 group">
                <div>
                  <span className="block text-barber-text font-medium group-hover:text-white transition-colors">{service.name}</span>
                  <span className="text-xs text-barber-muted">{service.duration}</span>
                </div>
                <span className="text-barber-red font-bold">
                  R$ {service.price.toFixed(2).replace('.', ',')}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-6 bg-zinc-900 mt-auto border-t border-zinc-800">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <span className="text-barber-red">ℹ️</span> INFORMAÇÕES
          </h3>
          <div className="space-y-3 text-sm text-zinc-400">
            <div className="flex items-start gap-3">
              <UserIcon size={16} className="mt-1 text-barber-red" />
              <p>Dono: {BARBERSHOP_INFO.owner}</p>
            </div>
            <div className="flex items-start gap-3">
              <Phone size={16} className="mt-1 text-barber-red" />
              <p>
                <a href={`https://wa.me/${BARBERSHOP_INFO.whatsapp}`} target="_blank" rel="noreferrer" className="hover:text-white underline">
                  +55 11 94257-2525
                </a>
              </p>
            </div>
            <div className="flex items-start gap-3">
              <MapPin size={16} className="mt-1 text-barber-red" />
              <p>{BARBERSHOP_INFO.address}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceList;