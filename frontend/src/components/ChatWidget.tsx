'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { trackPixelEvent } from '@/components/MetaPixel';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [leadId, setLeadId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    // Load session or start new
    const initChat = async () => {
        const storedLeadId = localStorage.getItem('chat_lead_id');
        if (storedLeadId) {
            setLeadId(storedLeadId);
            // Optionally load history if API supported it
        } else {
            // Se abrir o chat e não tiver ID, inicia conversa (opcional)
            // Ou espera o usuário mandar a primeira mensagem?
            // Melhor iniciar para pegar a saudação da IA
            if (!leadId) {
                // startSession(); // Descomentar se quiser iniciar automaticamente ao abrir
            }
        }
    };

    useEffect(() => {
        if (isOpen) {
            initChat();
            trackPixelEvent('Contact', { type: 'ChatOpened' });
            // Se abrir o chat e não tiver mensagens, força o início para pegar a saudação da MarIA
            // Independente de já ter um leadId no localStorage
            if (messages.length === 0) {
                startSession();
            }
        }
    }, [isOpen]);

    // Listen for external open events
    useEffect(() => {
        const handleOpenChat = () => setIsOpen(true);
        window.addEventListener('open-chat', handleOpenChat);
        return () => window.removeEventListener('open-chat', handleOpenChat);
    }, []);

    const startSession = async () => {
        setIsLoading(true);
        try {
            const res = await api.post('/chat/start');
            const data = res.data;

            if (data.leadId) {
                setLeadId(data.leadId);
                localStorage.setItem('chat_lead_id', data.leadId);
                setMessages([{ role: 'assistant', content: data.message }]);
            }
        } catch (error) {
            console.error('Erro ao iniciar chat:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        if (messages.length <= 1) { // First user message
            trackPixelEvent('Lead', { content_name: 'Chat Lead Start' });
        }
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsLoading(true);

        try {
            // Se por acaso não tiver leadId ainda (erro de init), tenta criar
            let currentLeadId = leadId;
            if (!currentLeadId) {
                const resStart = await api.post('/chat/start');
                currentLeadId = resStart.data.leadId;
                setLeadId(currentLeadId);
                localStorage.setItem('chat_lead_id', currentLeadId!);
            }

            const res = await api.post('/chat/message', {
                leadId: currentLeadId,
                message: userMsg
            });
            const data = res.data;

            if (data.text) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
            }
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: "Desculpe, tive um erro de conexão." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Floating Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 bg-[#007aff] hover:bg-[#0062cc] text-white p-4 rounded-full shadow-2xl transition-transform hover:scale-110 z-50 flex items-center justify-center"
                >
                    <MessageCircle className="w-8 h-8" />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 w-96 max-w-[90vw] h-[500px] max-h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-100 overflow-hidden font-sans">
                    {/* Header */}
                    <div className="bg-[#0f192b] text-white p-4 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-[#007aff] rounded-full flex items-center justify-center font-bold">A</div>
                            <div>
                                <h3 className="font-bold text-sm">MarIA - Assistente Virtual</h3>
                                <p className="text-xs text-green-400 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span> Online
                                </p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === 'user'
                                    ? 'bg-[#007aff] text-white rounded-tr-none'
                                    : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'
                                    }`}>
                                    {msg.content.split('\n').map((line, j) => (
                                        <p key={j} className={j > 0 ? 'mt-2' : ''}>{line}</p>
                                    ))}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white border-t border-gray-100">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Digite sua mensagem..."
                                className="flex-1 bg-gray-100 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#007aff] outline-none"
                            />
                            <button
                                onClick={handleSend}
                                disabled={isLoading || !input.trim()}
                                className="bg-[#007aff] hover:bg-[#0062cc] text-white p-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
