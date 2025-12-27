import { GoogleGenAI, Chat } from "@google/genai";
import { SYSTEM_INSTRUCTION_TEMPLATE } from '../constants';
import { db } from './dataService';

let chatSession: Chat | null = null;

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const initializeChat = (customerName: string) => {
  const services = db.getServices();
  const servicesList = services.map(s => `- ${s.name}: R$ ${s.price.toFixed(2)} (${s.duration})`).join('\n');
  
  const now = new Date();
  const dateString = now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const timeString = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  let personalizedInstruction = SYSTEM_INSTRUCTION_TEMPLATE
    .replace('{{CUSTOMER_NAME}}', customerName)
    .replace('{{SERVICES_LIST}}', servicesList)
    .replace('{{CURRENT_DATE}}', dateString)
    .replace('{{CURRENT_TIME}}', timeString);

  chatSession = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: personalizedInstruction,
    },
  });
};

export const sendMessageToGemini = async (message: string): Promise<string> => {
  if (!chatSession) {
    throw new Error("Chat session not initialized");
  }

  try {
    const result = await chatSession.sendMessage({ message });
    return result.text || "Desculpe, não consegui entender. Pode repetir?";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Desculpe, estou tendo problemas técnicos no momento. Tente novamente mais tarde.";
  }
};