'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { whatsapp } from '@/lib/api';
import { Loader2, Smartphone, LogOut, CheckCircle, RefreshCcw, Home } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function WhatsAppPage() {
    const router = useRouter();
    const { isAuthenticated, _hasHydrated, logout } = useAuthStore();

    const [isConnected, setIsConnected] = useState(false);
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);

    // Redirecionamento se não autenticado
    useEffect(() => {
        if (_hasHydrated && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, _hasHydrated, router]);

    // Função para buscar status
    const fetchStatus = async () => {
        try {
            const response = await whatsapp.getStatus();
            setIsConnected(response.data.connected);
            setQrCode(response.data.qrCode);
        } catch (error: any) {
            console.error('Erro ao buscar status do WhatsApp:', error?.response?.status, error?.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Polling para atualizar status/QR Code a cada 3 segundos
    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 3000);
        return () => clearInterval(interval);
    }, []);

    // Auto-conectar ao abrir a página se não estiver conectado
    useEffect(() => {
        if (!isLoading && !isConnected && !qrCode) {
            handleConnect();
        }
    }, [isLoading]);

    const handleConnect = async () => {
        if (isActionLoading) return;
        setIsActionLoading(true);
        try {
            await whatsapp.connect();
            await fetchStatus();
        } catch (error: any) {
            const status = error?.response?.status;
            if (status === 400) {
                // Já conectado — atualizar status
                await fetchStatus();
            } else {
                console.error('Erro ao iniciar conexão:', status, error?.message);
                alert(`Erro ao iniciar conexão (${status ?? 'sem resposta'}). Verifique o servidor.`);
            }
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleDisconnect = async () => {
        if (!confirm('Tem certeza que deseja desconectar o WhatsApp?')) return;

        setIsActionLoading(true);
        try {
            await whatsapp.disconnect();
            await fetchStatus();
        } catch (error) {
            alert('Erro ao desconectar. Tente novamente.');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    if (!_hasHydrated) return null;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/admin')}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                        >
                            <Home className="w-5 h-5" />
                            Dashboard
                        </button>
                        <span className="text-gray-300">|</span>
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <Smartphone className="w-6 h-6 text-green-600" />
                            Conexão WhatsApp
                        </h1>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-red-600 hover:text-red-700 font-semibold transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        Sair
                    </button>
                </div>
            </header>

            {/* Conteúdo Principal */}
            <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full">
                <div className="bg-white rounded-xl shadow-sm p-8 text-center max-w-2xl mx-auto">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                            <p className="text-gray-500">Verificando status...</p>
                        </div>
                    ) : isConnected ? (
                        <div className="py-8 animate-fade-in">
                            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-12 h-12 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">WhatsApp Conectado!</h2>
                            <p className="text-gray-500 mb-8">
                                O bot está ativo e respondendo aos leads automaticamente.
                            </p>

                            <button
                                onClick={handleDisconnect}
                                disabled={isActionLoading}
                                className="bg-red-50 text-red-600 hover:bg-red-100 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
                            >
                                {isActionLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <LogOut className="w-5 h-5" />
                                )}
                                Desconectar Sessão
                            </button>
                        </div>
                    ) : (
                        <div className="py-4 animate-fade-in">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Conectar WhatsApp Business</h2>
                            <p className="text-gray-500 mb-8 max-w-md mx-auto">
                                Escaneie o QR Code abaixo com seu celular para conectar o sistema ao seu WhatsApp.
                            </p>

                            <div className="mb-8 flex justify-center">
                                {qrCode ? (
                                    <div className="p-4 border-2 border-gray-200 rounded-xl inline-block bg-white">
                                        <QRCodeSVG value={qrCode} size={256} />
                                    </div>
                                ) : (
                                    <div className="w-64 h-64 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300 mx-auto">
                                        {isActionLoading ? (
                                            <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                                        ) : (
                                            <p className="text-gray-400 text-sm px-4">
                                                Clique em "Gerar QR Code" para iniciar
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {!qrCode && (
                                <button
                                    onClick={handleConnect}
                                    disabled={isActionLoading}
                                    className="bg-green-600 text-white hover:bg-green-700 px-8 py-3 rounded-lg font-bold transition-colors shadow-lg shadow-green-200 flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
                                >
                                    {isActionLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Gerando...
                                        </>
                                    ) : (
                                        <>
                                            <RefreshCcw className="w-5 h-5" />
                                            Gerar Novo QR Code
                                        </>
                                    )}
                                </button>
                            )}

                            {qrCode && (
                                <p className="text-sm text-gray-400 mt-4 animate-pulse">
                                    Atualiza automaticamente a cada 3s...
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
