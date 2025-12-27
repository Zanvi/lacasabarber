import { Service, Appointment, User } from '../types';

// Initial Mock Data
const INITIAL_SERVICES: Service[] = [
  { id: '1', name: "Corte masculino", price: 40.00, duration: "30 min", description: "Corte degradê, social ou militar.", active: true },
  { id: '2', name: "Barba", price: 20.00, duration: "30 min", description: "Barba modelada com toalha quente.", active: true },
  { id: '3', name: "Sobrancelha", price: 20.00, duration: "15 min", description: "Design na navalha.", active: true },
  { id: '4', name: "Pezinho", price: 20.00, duration: "15 min", description: "Acabamento do corte.", active: true },
  { id: '5', name: "Corte + Barba", price: 55.00, duration: "60 min", description: "Combo completo.", active: true },
  { id: '6', name: "Infantil", price: 35.00, duration: "30 min", description: "Para crianças até 12 anos.", active: true },
  { id: '7', name: "Luzes", price: 120.00, duration: "90 min", description: "Reflexos ou luzes no papel.", active: true },
  { id: '8', name: "Platinado", price: 150.00, duration: "120 min", description: "Descoloração global.", active: true },
];

class DataService {
  private services: Service[] = [];
  private appointments: Appointment[] = [];
  private users: User[] = [];

  constructor() {
    this.loadData();
  }

  private loadData() {
    const storedServices = localStorage.getItem('lcb_services');
    const storedAppointments = localStorage.getItem('lcb_appointments');
    const storedUsers = localStorage.getItem('lcb_users');

    this.services = storedServices ? JSON.parse(storedServices) : INITIAL_SERVICES;
    this.appointments = storedAppointments ? JSON.parse(storedAppointments) : [];
    this.users = storedUsers ? JSON.parse(storedUsers) : [];
  }

  private saveData() {
    localStorage.setItem('lcb_services', JSON.stringify(this.services));
    localStorage.setItem('lcb_appointments', JSON.stringify(this.appointments));
    localStorage.setItem('lcb_users', JSON.stringify(this.users));
  }

  // --- Services CRUD ---
  getServices(): Service[] {
    return this.services.filter(s => s.active !== false); // Default to active only
  }

  getAllServices(): Service[] {
    return this.services; // Admin sees all
  }

  addService(service: Omit<Service, 'id' | 'active' | 'updatedAt'>) {
    const newService: Service = { 
      ...service, 
      id: Date.now().toString(),
      active: true,
      updatedAt: Date.now()
    };
    this.services.push(newService);
    this.saveData();
    return newService;
  }

  updateService(id: string, updates: Partial<Service>) {
    this.services = this.services.map(s => s.id === id ? { ...s, ...updates, updatedAt: Date.now() } : s);
    this.saveData();
  }

  deleteService(id: string) {
    // Soft delete usually better for databases, but we'll remove for now or set active: false
    this.updateService(id, { active: false });
  }

  // --- Appointments CRUD ---
  getAppointments(): Appointment[] {
    return this.appointments.sort((a, b) => b.createdAt - a.createdAt);
  }

  addAppointment(appointment: Omit<Appointment, 'id' | 'createdAt' | 'status' | 'servicePrice' | 'serviceDuration'>) {
    // Find user phone if not provided
    const user = this.users.find(u => u.id === appointment.userId);
    
    const newAppointment: Appointment = {
      ...appointment,
      userPhone: user?.phone || 'Não informado',
      servicePrice: 0, // Should look up service price real-time
      serviceDuration: '30 min', // Should look up service duration
      id: Date.now().toString(),
      status: 'confirmed',
      createdAt: Date.now()
    };

    // Enrich with service details
    const service = this.services.find(s => s.name === appointment.serviceName);
    if (service) {
      newAppointment.servicePrice = service.price;
      newAppointment.serviceDuration = service.duration;
    }

    this.appointments.push(newAppointment);
    this.saveData();
    return newAppointment;
  }

  updateAppointment(id: string, updates: Partial<Appointment>) {
    this.appointments = this.appointments.map(apt => 
      apt.id === id ? { ...apt, ...updates, updatedAt: Date.now() } : apt
    );
    this.saveData();
  }

  // --- Auth Simulation ---
  login(name: string, phone: string, isAdmin: boolean): User {
    const id = phone || 'admin-id';
    let user = this.users.find(u => u.id === id);

    if (!user) {
      user = {
        id,
        name: name,
        phone: phone,
        role: isAdmin ? 'admin' : 'client',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
      };
      this.users.push(user);
      this.saveData();
    }

    return user;
  }
}

export const db = new DataService();