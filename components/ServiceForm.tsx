import React, { useState, useEffect } from 'react';
import { Service } from '../types';
import { X, Save, Image as ImageIcon, Link, UploadCloud } from 'lucide-react';

interface ServiceFormProps {
  initialData?: Service;
  onSubmit: (data: Omit<Service, 'id' | 'active' | 'updatedAt'>) => void;
  onCancel: () => void;
  title: string;
}

const ServiceForm: React.FC<ServiceFormProps> = ({ initialData, onSubmit, onCancel, title }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    duration: '',
    description: '',
    imageUrl: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        price: initialData.price.toString(),
        duration: initialData.duration,
        description: initialData.description || '',
        imageUrl: initialData.imageUrl || ''
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) return;

    onSubmit({
      name: formData.name,
      price: parseFloat(formData.price),
      duration: formData.duration || '30 min',
      description: formData.description,
      imageUrl: formData.imageUrl
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-zinc-900 w-full max-w-lg rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {initialData ? <UploadCloud size={20} className="text-barber-red"/> : <UploadCloud size={20} className="text-barber-red"/>}
            {title}
          </h2>
          <button onClick={onCancel} className="text-zinc-400 hover:text-white p-2 rounded-full hover:bg-zinc-800 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Nome do Serviço</label>
            <input 
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white focus:border-barber-red focus:ring-1 focus:ring-barber-red outline-none transition-all"
              placeholder="Ex: Corte Degradê"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>

          {/* Price & Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Preço (R$)</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-zinc-500">R$</span>
                <input 
                  type="number"
                  step="0.01"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 pl-10 text-white focus:border-barber-red focus:ring-1 focus:ring-barber-red outline-none transition-all"
                  placeholder="40.00"
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: e.target.value})}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Duração</label>
              <input 
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white focus:border-barber-red focus:ring-1 focus:ring-barber-red outline-none transition-all"
                placeholder="Ex: 45 min"
                value={formData.duration}
                onChange={e => setFormData({...formData, duration: e.target.value})}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Descrição</label>
            <textarea 
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white focus:border-barber-red focus:ring-1 focus:ring-barber-red outline-none transition-all min-h-[100px] resize-none"
              placeholder="Descreva os detalhes deste serviço..."
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          {/* Image URL Mock */}
          <div>
             <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Imagem de Capa</label>
             <div className="bg-zinc-800/50 border-2 border-dashed border-zinc-700 rounded-xl p-4 flex flex-col gap-3 items-center justify-center transition-colors hover:border-zinc-600 group">
               {formData.imageUrl ? (
                 <div className="relative w-full h-32 rounded-lg overflow-hidden group-hover:opacity-80 transition-opacity">
                    <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white text-xs font-bold">Alterar URL abaixo</p>
                    </div>
                 </div>
               ) : (
                 <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-600 group-hover:text-zinc-400 group-hover:bg-zinc-700 transition-all">
                   <ImageIcon size={24} />
                 </div>
               )}
               
               <div className="w-full flex items-center gap-2">
                  <Link size={16} className="text-zinc-500" />
                  <input 
                    className="flex-1 bg-transparent border-b border-zinc-700 p-1 text-sm text-zinc-300 focus:border-barber-red outline-none placeholder:text-zinc-600"
                    placeholder="Cole a URL da imagem aqui..."
                    value={formData.imageUrl}
                    onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                  />
               </div>
               <p className="text-[10px] text-zinc-500">
                 *Integração futura com Firebase Storage. Por enquanto, use uma URL externa.
               </p>
             </div>
          </div>

        </form>

        <div className="p-5 border-t border-zinc-800 bg-zinc-950 flex justify-end gap-3">
          <button 
            type="button" 
            onClick={onCancel}
            className="px-5 py-2.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors font-medium text-sm"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSubmit}
            className="px-5 py-2.5 rounded-lg bg-barber-red hover:bg-barber-redHover text-white font-bold shadow-lg shadow-red-900/20 flex items-center gap-2 transition-all transform hover:translate-y-[-1px] text-sm"
          >
            <Save size={18} /> {initialData ? 'Salvar Alterações' : 'Criar Serviço'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceForm;