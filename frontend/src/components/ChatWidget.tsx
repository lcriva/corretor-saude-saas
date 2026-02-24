'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { trackPixelEvent } from '@/components/MetaPixel';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface ChatButton {
    label: string;
    url?: string;
}

// Converte *texto* em <strong> e \n em <br> para exibição no chat
function renderMarkdown(text: string): string {
    // Escapar HTML para segurança
    const escaped = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    // *negrito* → <strong>
    const withBold = escaped.replace(/\*([^*]+)\*/g, '<strong>$1</strong>');
    // \n → <br>
    return withBold.replace(/\n/g, '<br>');
}

export function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [buttons, setButtons] = useState<ChatButton[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [leadId, setLeadId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    useEffect(() => { scrollToBottom(); }, [messages, buttons, isOpen]);

    useEffect(() => {
        const handleOpenChat = () => setIsOpen(true);
        window.addEventListener('open-chat', handleOpenChat);
        return () => window.removeEventListener('open-chat', handleOpenChat);
    }, []);

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            trackPixelEvent('Contact', { type: 'ChatOpened' });
            startSession();
        }
    }, [isOpen]);

    const startSession = async () => {
        setIsLoading(true);
        try {
            const res = await api.post('/chat/start');
            const data = res.data;
            if (data.leadId) {
                setLeadId(data.leadId);
                localStorage.setItem('chat_lead_id', data.leadId);
                setMessages([{ role: 'assistant', content: data.message }]);
                setButtons(data.buttons ?? []);
            }
        } catch (error) {
            console.error('Erro ao iniciar chat:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const sendMessage = async (text: string) => {
        if (!text.trim() || isLoading) return;

        if (messages.length <= 1) {
            trackPixelEvent('Lead', { content_name: 'Chat Lead Start' });
        }

        setButtons([]);
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: text }]);
        setIsLoading(true);

        try {
            let currentLeadId = leadId;
            if (!currentLeadId) {
                const resStart = await api.post('/chat/start');
                currentLeadId = resStart.data.leadId;
                setLeadId(currentLeadId);
                localStorage.setItem('chat_lead_id', currentLeadId!);
            }

            const res = await api.post('/chat/message', { leadId: currentLeadId, message: text });
            const data = res.data;

            if (data.text) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
                setButtons(data.buttons ?? []);
            }
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: 'Desculpe, tive um erro de conexão. Tente novamente.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    // Ao clicar num botão: se tiver URL abre em nova aba, senão envia como mensagem
    const handleButton = (button: ChatButton) => {
        if (button.url) {
            window.open(button.url, '_blank', 'noopener,noreferrer');
        } else {
            sendMessage(button.label);
        }
    };

    const handleSend = () => sendMessage(input);

    return (
        <>
            {/* Botão flutuante */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 bg-[#007aff] hover:bg-[#0062cc] text-white p-4 rounded-full shadow-2xl transition-transform hover:scale-110 z-50 flex items-center justify-center"
                >
                    <MessageCircle className="w-8 h-8" />
                </button>
            )}

            {/* Janela do chat */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 w-96 max-w-[90vw] h-[540px] max-h-[85vh] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-100 overflow-hidden font-sans">

                    {/* Header */}
                    <div className="bg-[#0f192b] text-white p-4 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-[#007aff] rounded-full flex items-center justify-center font-bold text-sm">M</div>
                            <div>
                                <h3 className="font-bold text-sm">MarIA — Assistente Virtual</h3>
                                <p className="text-xs text-green-400 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block"></span>
                                    Online agora
                                </p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Área de mensagens */}
                    <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div
                                    className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === 'user'
                                        ? 'bg-[#007aff] text-white rounded-tr-none'
                                        : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'
                                        }`}
                                    dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                                />
                            </div>
                        ))}

                        {/* Indicador de digitação */}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                                </div>
                            </div>
                        )}

                        {/* Quick-reply buttons */}
                        {!isLoading && buttons.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-1">
                                {buttons.map((btn, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleButton(btn)}
                                        className={
                                            btn.label === 'Aguardar Contato para Fechar o Plano'
                                                ? 'bg-green-500 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-green-600 transition-all duration-150 shadow-sm flex items-center gap-1'
                                                : 'bg-white border-2 border-[#007aff] text-[#007aff] text-sm font-medium px-4 py-2 rounded-xl hover:bg-[#007aff] hover:text-white transition-all duration-150 shadow-sm flex items-center gap-1'
                                        }
                                    >
                                        {btn.url && <span className="text-xs">↗</span>}
                                        {btn.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-3 bg-white border-t border-gray-100">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSend()}
                                placeholder="Digite sua mensagem..."
                                className="flex-1 bg-gray-100 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#007aff] outline-none"
                            />
                            <button
                                onClick={handleSend}
                                disabled={isLoading || !input.trim()}
                                className="bg-[#007aff] hover:bg-[#0062cc] text-white p-3 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
