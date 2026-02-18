'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { dashboard } from '@/lib/api';
import {
    Users, FileText, TrendingUp, DollarSign,
    AlertCircle, Clock, Bell, Loader2, LogOut, UserPlus
} from 'lucide-react';

export default function AdminDashboardPage() {
    const router = useRouter();
    const { isAuthenticated, user, logout, _hasHydrated } = useAuthStore();

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
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                        <p className="text-sm text-gray-600">Bem-vindo, {user?.nome}!</p>
                    </div>
                    <div className="flex gap-4 items-center">
                        <button
                            onClick={() => router.push('/admin/register-client')}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-semibold transition-colors"
                        >
                            <UserPlus className="w-5 h-5" />
                            Cadastrar Cliente
                        </button>
                        <button
                            onClick={() => router.push('/leads')}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-semibold transition-colors"
                        >
                            <Users className="w-5 h-5" />
                            Ver Leads
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                        <div className="flex justify-between items-start mb-4">
                            <Users className="w-10 h-10 opacity-80" />
                            <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">Hoje</span>
                        </div>
                        <h3 className="text-3xl font-bold mb-1">{stats?.leadsHoje || 0}</h3>
                        <p className="text-sm opacity-90">Novos Leads</p>
                    </div>

                    <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
                        <div className="flex justify-between items-start mb-4">
                            <FileText className="w-10 h-10 opacity-80" />
                            <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">Mês</span>
                        </div>
                        <h3 className="text-3xl font-bold mb-1">{stats?.propostasEnviadas || 0}</h3>
                        <p className="text-sm opacity-90">Propostas Enviadas</p>
                    </div>

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
                <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Pipeline de Vendas</h2>
                    <div className="grid grid-cols-5 gap-4">
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
                                proposta: 'Proposta',
                                negociacao: 'Negociação',
                                fechado: 'Fechado',
                                perdido: 'Perdido'
                            };

                            return (
                                <div key={status} className="text-center">
                                    <div className={`${statusColors[status]} h-24 rounded-lg flex items-center justify-center mb-2`}>
                                        <span className="text-4xl font-bold text-white">{count}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 font-medium">{statusLabels[status]}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Leads em Preenchimento (IA) */}
                {alertas?.leadsEmPreenchimento && alertas.leadsEmPreenchimento.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-purple-600" />
                            Leads em Preenchimento (IA)
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {alertas.leadsEmPreenchimento.map((lead: any) => (
                                <div key={lead.id} className="border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-semibold text-gray-800">{lead.nome || 'Em aberto...'}</h3>
                                            <p className="text-sm text-gray-500">{lead.telefone}</p>
                                        </div>
                                        <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full font-medium">
                                            {lead.percentualConclusao}%
                                        </span>
                                    </div>

                                    <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                                        <div
                                            className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                                            style={{ width: `${lead.percentualConclusao}%` }}
                                        ></div>
                                    </div>

                                    <p className="text-xs text-gray-400">
                                        Última interação: {new Date(lead.atualizadoEm).toLocaleDateString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Alertas */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Bell className="w-5 h-5 text-blue-600" />
                        Ações Recomendadas pela IA
                    </h2>

                    <div className="space-y-3">
                        {alertas?.leadsSemInteracao && alertas.leadsSemInteracao.length > 0 && (
                            <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                                <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="font-semibold text-orange-800">
                                        {alertas.leadsSemInteracao.length} lead(s) sem interação há mais de 3 dias
                                    </p>
                                    <p className="text-sm text-orange-700 mt-1">
                                        {alertas.leadsSemInteracao[0]?.nome} e outros. Recomendamos contato urgente!
                                    </p>
                                </div>
                            </div>
                        )}

                        {alertas?.propostasSemResposta && alertas.propostasSemResposta.length > 0 && (
                            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <Clock className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="font-semibold text-blue-800">
                                        {alertas.propostasSemResposta.length} proposta(s) aguardando resposta
                                    </p>
                                    <p className="text-sm text-blue-700 mt-1">
                                        Enviar follow-up para aumentar conversão
                                    </p>
                                </div>
                            </div>
                        )}

                        {alertas?.negociacoesParadas && alertas.negociacoesParadas.length > 0 && (
                            <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <TrendingUp className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="font-semibold text-yellow-800">
                                        {alertas.negociacoesParadas.length} negociação(ões) parada(s)
                                    </p>
                                    <p className="text-sm text-yellow-700 mt-1">
                                        {alertas.negociacoesParadas[0]?.nome} - em negociação há mais de 5 dias
                                    </p>
                                </div>
                            </div>
                        )}

                        {(!alertas?.leadsSemInteracao || alertas.leadsSemInteracao.length === 0) &&
                            (!alertas?.propostasSemResposta || alertas.propostasSemResposta.length === 0) &&
                            (!alertas?.negociacoesParadas || alertas.negociacoesParadas.length === 0) && (
                                <div className="text-center py-8 text-gray-500">
                                    <p className="text-lg">🎉 Tudo em dia!</p>
                                    <p className="text-sm mt-1">Nenhuma ação urgente no momento</p>
                                </div>
                            )}
                    </div>
                </div>
            </div>
        </div>
    );
}
