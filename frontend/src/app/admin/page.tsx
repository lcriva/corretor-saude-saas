'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { dashboard } from '@/lib/api';
import {
    Users, FileText, TrendingUp, DollarSign,
    AlertCircle, Clock, Bell, Loader2, LogOut, UserPlus, Smartphone,
    Sun, Moon
} from 'lucide-react';
import { useTheme } from '../providers';

export default function AdminDashboardPage() {
    const router = useRouter();
    const { isAuthenticated, user, logout, _hasHydrated } = useAuthStore();
    const { theme, toggleTheme } = useTheme();

    const [stats, setStats] = useState<any>(null);
    const [alertas, setAlertas] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (_hasHydrated && !isAuthenticated) {
            router.push('/login');
            return;
        }

        if (_hasHydrated && isAuthenticated) {
            fetchData();
        }
    }, [isAuthenticated, _hasHydrated]);

    const fetchData = async () => {
        try {
            const [statsRes, alertasRes] = await Promise.all([
                dashboard.getStats(),
                dashboard.getAlertas()
            ]);

            setStats(statsRes.data);
            setAlertas(alertasRes.data);
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    if (!_hasHydrated || loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Bem-vindo, {user?.nome}!</p>
                    </div>
                    <div className="flex gap-4 items-center">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            title={theme === 'light' ? 'Modo Escuro' : 'Modo Claro'}
                        >
                            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                        </button>
                        <button
                            disabled
                            className="bg-gray-300 dark:bg-gray-600 cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center gap-2 font-semibold transition-colors"
                        >
                            <UserPlus className="w-5 h-5" />
                            Cadastrar Cliente (Inativo)
                        </button>
                        <button
                            onClick={() => router.push('/leads')}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-semibold transition-colors"
                        >
                            <Users className="w-5 h-5" />
                            Ver Leads
                        </button>
                        <button
                            onClick={() => router.push('/admin/whatsapp')}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-semibold transition-colors"
                        >
                            <Smartphone className="w-5 h-5" />
                            WhatsApp
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-red-600 hover:text-red-700 font-semibold"
                        >
                            <LogOut className="w-5 h-5" />
                            Sair
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Cards de Estatísticas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Removidos cards de Novos e Propostas conforme pedido */}


                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
                        <div className="flex justify-between items-start mb-4">
                            <TrendingUp className="w-10 h-10 opacity-80" />
                            <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">Média</span>
                        </div>
                        <h3 className="text-3xl font-bold mb-1">{stats?.taxaConversao || 0}%</h3>
                        <p className="text-sm opacity-90">Taxa de Conversão</p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                        <div className="flex justify-between items-start mb-4">
                            <DollarSign className="w-10 h-10 opacity-80" />
                            <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">Mês</span>
                        </div>
                        <h3 className="text-3xl font-bold mb-1">
                            R$ {stats?.receitaMes?.toLocaleString() || 0}
                        </h3>
                        <p className="text-sm opacity-90">Comissões Previstas</p>
                    </div>
                </div>

                {/* Pipeline */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8 border border-transparent dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Pipeline de Vendas</h2>
                    <div className="grid grid-cols-4 gap-4">
                        {stats?.pipeline && Object.entries(stats.pipeline).map(([status, count]: [string, any]) => {
                            const statusColors: any = {
                                novo: 'bg-blue-500',
                                proposta: 'bg-yellow-500',
                                negociacao: 'bg-orange-500',
                                fechado: 'bg-green-500',
                                perdido: 'bg-red-500'
                            };

                            const statusLabels: any = {
                                novo: 'Novo',
                                negociacao: 'Negociação',
                                fechado: 'Fechado',
                                perdido: 'Perdido'
                            };

                            if (status === 'proposta') return null;

                            return (
                                <div key={status} className="text-center">
                                    <div className={`${statusColors[status]} h-24 rounded-lg flex items-center justify-center mb-2`}>
                                        <span className="text-4xl font-bold text-white">{count}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{statusLabels[status]}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Pipeline de Leads (Kanban Simplificado) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* LEADS FRIOS (< 100%) */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border-t-4 border-blue-400 dark:border-t-blue-500">
                        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-blue-500" />
                            Leads Frios
                            <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-auto">Em preenchimento</span>
                        </h2>
                        <div className="space-y-3">
                            {alertas?.leadsFrios?.map((lead: any) => (
                                <div key={lead.id} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-100 dark:border-gray-600">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-semibold text-gray-700 dark:text-white text-sm truncate">{lead.nome || 'Visitante'}</h3>
                                        <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 px-2 py-0.5 rounded-full">{lead.percentualConclusao}%</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{lead.telefone}</p>
                                        <p className="text-[10px] text-gray-400 dark:text-gray-500">{new Date(lead.criadoEm).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>

                                    {/* Destaque de informações faltando */}
                                    {lead.percentualConclusao < 100 && (
                                        <div className="mb-2">
                                            <p className="text-[10px] font-bold text-orange-600 uppercase mb-1">Faltando:</p>
                                            <div className="flex flex-wrap gap-1">
                                                {!lead.idade && <span className="text-[9px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">Idade</span>}
                                                {!lead.cidade && <span className="text-[9px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">Cidade</span>}
                                                {!lead.planoDesejado && <span className="text-[9px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">Plano</span>}
                                            </div>
                                        </div>
                                    )}

                                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${lead.percentualConclusao}%` }}></div>
                                    </div>
                                </div>
                            ))}
                            {(!alertas?.leadsFrios || alertas.leadsFrios.length === 0) && (
                                <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">Nenhum lead frio.</p>
                            )}
                        </div>
                    </div>

                    {/* LEADS QUENTES (Negociação ou 100%) */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border-t-4 border-red-500 dark:border-t-red-600">
                        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-red-500" />
                            Leads Quentes
                            Leads Quentes
                        </h2>
                        <div className="space-y-3">
                            {alertas?.leadsQuentes?.map((lead: any) => (
                                <div key={lead.id} className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-900/30">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-semibold text-gray-800 dark:text-white text-sm truncate">{lead.nome}</h3>
                                        <div className="flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4 text-red-500" />
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center mb-1">
                                        <p className="text-xs text-gray-600 dark:text-gray-400">{lead.telefone}</p>
                                        <p className="text-[10px] text-gray-400 dark:text-gray-500">{new Date(lead.criadoEm).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                    {lead.valorPlano && (
                                        <p className="text-xs font-bold text-red-700 dark:text-red-400 mb-2">R$ {lead.valorPlano.toLocaleString()}</p>
                                    )}
                                    <button
                                        onClick={() => router.push(`/leads`)}
                                        className="w-full bg-red-600 text-white text-xs py-1.5 rounded hover:bg-red-700 transition"
                                    >
                                        Ver Detalhes
                                    </button>
                                </div>
                            ))}
                            {(!alertas?.leadsQuentes || alertas.leadsQuentes.length === 0) && (
                                <p className="text-sm text-gray-400 text-center py-4">Nenhum lead quente.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Alertas (Mantivemos abaixo caso queira, mas simplificamos) */}
                <div className="bg-white rounded-xl shadow-sm p-6 hidden"> {/* Ocultei alertas antigos para limpar a tela conforme pedido */}
                    {/* ... */}
                </div>

                <div className="space-y-3">
                    {alertas?.leadsSemInteracao && alertas.leadsSemInteracao.length > 0 && (
                        <div className="flex items-start gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-900/30 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="font-semibold text-orange-800 dark:text-orange-200">
                                    {alertas.leadsSemInteracao.length} lead(s) sem interação há mais de 3 dias
                                </p>
                                <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                                    {alertas.leadsSemInteracao[0]?.nome} e outros. Recomendamos contato urgente!
                                </p>
                            </div>
                        </div>
                    )}

                    {alertas?.propostasSemResposta && alertas.propostasSemResposta.length > 0 && (
                        <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/30 rounded-lg">
                            <Clock className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="font-semibold text-blue-800 dark:text-blue-200">
                                    {alertas.propostasSemResposta.length} proposta(s) aguardando resposta
                                </p>
                                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                                    Enviar follow-up para aumentar conversão
                                </p>
                            </div>
                        </div>
                    )}

                    {alertas?.negociacoesParadas && alertas.negociacoesParadas.length > 0 && (
                        <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/30 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="font-semibold text-yellow-800 dark:text-yellow-200">
                                    {alertas.negociacoesParadas.length} negociação(ões) parada(s)
                                </p>
                                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                                    {alertas.negociacoesParadas[0]?.nome} - em negociação há mais de 5 dias
                                </p>
                            </div>
                        </div>
                    )}


                </div>
            </div>
        </div>
    );
}
