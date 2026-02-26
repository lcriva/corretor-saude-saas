'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { leads } from '@/lib/api';
import {
    Users, Plus, Search, Phone, Mail, MapPin,
    Calendar, DollarSign, Edit, Trash2, X,
    Loader2, LogOut, Home, Globe, MessageSquare, UserPlus, Clock
} from 'lucide-react';

export default function LeadsPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { isAuthenticated, logout, _hasHydrated } = useAuthStore();

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('todos');
    const [showModal, setShowModal] = useState(false);
    const [editingLead, setEditingLead] = useState<any>(null);

    const [formData, setFormData] = useState({
        nome: '',
        telefone: '',
        email: '',
        idade: '',
        cidade: '',
        estado: '',
        dependentes: '0',
        valorEstimado: '',
        observacoes: '',
        planoDesejado: '',
        valorPlano: '',
        urgencia: '',
        idadesDependentes: '' // String separada por vírgula para edição
    });

    useEffect(() => {
        if (_hasHydrated && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, _hasHydrated, router]);

    // Buscar leads
    const { data: leadsData, isLoading } = useQuery({
        queryKey: ['leads', statusFilter, searchTerm],
        queryFn: async () => {
            const response = await leads.getAll({ status: statusFilter, search: searchTerm });
            return response.data;
        },
        enabled: isAuthenticated && _hasHydrated
    });

    // Criar lead
    const createMutation = useMutation({
        mutationFn: (data: any) => leads.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
            setShowModal(false);
            resetForm();
            alert('Lead criado com sucesso!');
        },
        onError: (error: any) => {
            alert(error.response?.data?.error || 'Erro ao criar lead');
        }
    });

    // Atualizar lead
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => leads.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
            setShowModal(false);
            setEditingLead(null);
            resetForm();
            alert('Lead atualizado com sucesso!');
        },
        onError: (error: any) => {
            alert(error.response?.data?.error || 'Erro ao atualizar lead');
        }
    });

    // Deletar lead
    const deleteMutation = useMutation({
        mutationFn: (id: string) => leads.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
            alert('Lead deletado com sucesso!');
        },
        onError: (error: any) => {
            alert(error.response?.data?.error || 'Erro ao deletar lead');
        }
    });

    // Atualizar status
    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) =>
            leads.updateStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
        }
    });

    const resetForm = () => {
        setFormData({
            nome: '',
            telefone: '',
            email: '',
            idade: '',
            cidade: '',
            estado: '',
            dependentes: '0',
            valorEstimado: '',
            observacoes: '',
            planoDesejado: '',
            valorPlano: '',
            urgencia: '',
            idadesDependentes: ''
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Processar idades
        const dataToSend = {
            ...formData,
            idadesDependentes: formData.idadesDependentes
                ? formData.idadesDependentes.split(',').map(i => parseInt(i.trim())).filter(i => !isNaN(i))
                : []
        };

        if (editingLead) {
            updateMutation.mutate({ id: editingLead.id, data: dataToSend });
        } else {
            createMutation.mutate(dataToSend);
        }
    };

    const handleEdit = (lead: any) => {
        setEditingLead(lead);
        setFormData({
            nome: lead.nome,
            telefone: lead.telefone,
            email: lead.email || '',
            idade: lead.idade.toString(),
            cidade: lead.cidade,
            estado: lead.estado || '',
            dependentes: lead.dependentes.toString(),
            valorEstimado: lead.valorEstimado?.toString() || '',
            observacoes: lead.observacoes || '',
            planoDesejado: lead.planoDesejado || '',
            valorPlano: lead.valorPlano?.toString() || '',
            urgencia: lead.urgencia || '',
            idadesDependentes: (lead.idadesDependentes && Array.isArray(lead.idadesDependentes)) ? lead.idadesDependentes.join(', ') : ''
        });
        setShowModal(true);
    };

    const handleDelete = (id: string, nome: string) => {
        if (confirm(`Tem certeza que deseja deletar o lead "${nome}"?`)) {
            deleteMutation.mutate(id);
        }
    };

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    const statusColors: any = {
        novo: 'bg-blue-100 text-blue-800 border-blue-200',
        proposta: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        negociacao: 'bg-orange-100 text-orange-800 border-orange-200',
        fechado: 'bg-green-100 text-green-800 border-green-200',
        perdido: 'bg-red-100 text-red-800 border-red-200'
    };

    const statusLabels: any = {
        novo: 'Novo',
        proposta: 'Proposta Enviada',
        negociacao: 'Em Negociação',
        fechado: 'Fechado',
        perdido: 'Perdido'
    };

    if (!_hasHydrated || isLoading) {
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
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/admin')}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
                        >
                            <Home className="w-5 h-5" />
                            Dashboard
                        </button>
                        <span className="text-gray-300">|</span>
                        <h1 className="text-2xl font-bold text-gray-800">Gestão de Leads</h1>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-red-600 hover:text-red-700 font-semibold"
                    >
                        <LogOut className="w-5 h-5" />
                        Sair
                    </button>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Filtros e Busca */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                        <div className="flex-1 relative">
                            <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar por nome, telefone ou email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
                            />
                        </div>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
                        >
                            <option value="todos">Todos os Status</option>
                            <option value="novo">Novo</option>
                            <option value="proposta">Proposta Enviada</option>
                            <option value="negociacao">Em Negociação</option>
                            <option value="fechado">Fechado</option>
                            <option value="perdido">Perdido</option>
                        </select>

                        <button
                            onClick={() => {
                                setEditingLead(null);
                                resetForm();
                                setShowModal(true);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 font-semibold transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            Novo Lead
                        </button>
                    </div>
                </div>

                {/* Lista de Leads */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    {leadsData && leadsData.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Lead</th>
                                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Contato</th>
                                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Localização</th>
                                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Origem</th>
                                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Status</th>
                                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Criado em</th>
                                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Plano / Valor</th>
                                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Urgência</th>
                                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {leadsData.map((lead: any) => (
                                        <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-semibold text-gray-900">{lead.nome}</p>
                                                    <p className="text-sm text-gray-500">
                                                        {lead.idade} anos • {lead.dependentes} dep.
                                                        {(lead.idadesDependentes && Array.isArray(lead.idadesDependentes) && lead.idadesDependentes.length > 0) && (
                                                            <span className="block text-xs text-gray-400">
                                                                Idades: {lead.idadesDependentes.join(', ')}
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Phone className="w-4 h-4" />
                                                        {lead.telefone}
                                                    </div>
                                                    {lead.email && (
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <Mail className="w-4 h-4" />
                                                            {lead.email}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <MapPin className="w-4 h-4" />
                                                    {lead.cidade}{lead.estado && `, ${lead.estado}`}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {lead.origem === 'whatsapp' ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                                        <MessageSquare className="w-3 h-3" />
                                                        WhatsApp
                                                    </span>
                                                ) : ['landing_page', 'web', 'site_chat'].includes(lead.origem) ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                                        <Globe className="w-3 h-3" />
                                                        Landing Page
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                                        <UserPlus className="w-3 h-3" />
                                                        Manual
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <select
                                                    value={lead.status}
                                                    onChange={(e) => updateStatusMutation.mutate({ id: lead.id, status: e.target.value })}
                                                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[lead.status]} cursor-pointer`}
                                                >
                                                    {Object.entries(statusLabels).map(([value, label]) => (
                                                        <option key={value} value={value}>{label as string}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-sm text-gray-600 whitespace-nowrap">
                                                    <Clock className="w-4 h-4" />
                                                    {new Date(lead.criadoEm).toLocaleString('pt-BR', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    }).replace(',', ' às')}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    {lead.valorPlano ? (
                                                        <div className="flex items-center gap-2 text-sm font-semibold text-green-600">
                                                            <DollarSign className="w-4 h-4" />
                                                            R$ {lead.valorPlano.toFixed(2)}
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-gray-400">-</span>
                                                    )}
                                                    {lead.planoDesejado && (
                                                        <span className="text-xs text-gray-500 mt-1">{lead.planoDesejado}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {lead.urgencia ? (
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${lead.urgencia === 'Hoje' ? 'bg-red-100 text-red-800 border-red-200' :
                                                        lead.urgencia === 'Esta Semana' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                                                            'bg-gray-100 text-gray-800 border-gray-200'
                                                        }`}>
                                                        {lead.urgencia}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 text-sm">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEdit(lead)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Editar"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(lead.id, lead.nome)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Deletar"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Nenhum lead encontrado</h3>
                            <p className="text-gray-500 mb-4">Comece criando seu primeiro lead!</p>
                            <button
                                onClick={() => {
                                    setEditingLead(null);
                                    resetForm();
                                    setShowModal(true);
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg inline-flex items-center gap-2 font-semibold"
                            >
                                <Plus className="w-5 h-5" />
                                Criar Primeiro Lead
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Criar/Editar Lead */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingLead ? 'Editar Lead' : 'Novo Lead'}
                            </h2>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setEditingLead(null);
                                    resetForm();
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nome Completo *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.nome}
                                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
                                        placeholder="João Silva"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Telefone *
                                    </label>
                                    <input
                                        type="tel"
                                        required
                                        value={formData.telefone}
                                        onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
                                        placeholder="(11) 98765-4321"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
                                        placeholder="joao@email.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Idade *
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.idade}
                                        onChange={(e) => setFormData({ ...formData, idade: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
                                        placeholder="35"
                                        min="0"
                                        max="120"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Cidade *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.cidade}
                                        onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
                                        placeholder="São Paulo"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Estado
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.estado}
                                        onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
                                        placeholder="SP"
                                        maxLength={2}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Dependentes
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.dependentes}
                                        onChange={(e) => setFormData({ ...formData, dependentes: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
                                        placeholder="0"
                                        min="0"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Idades Dependentes
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.idadesDependentes}
                                        onChange={(e) => setFormData({ ...formData, idadesDependentes: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
                                        placeholder="Ex: 5, 12, 40 (separe por vírgula)"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Plano Desejado
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.planoDesejado || ''}
                                        onChange={(e) => setFormData({ ...formData, planoDesejado: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
                                        placeholder="Ex: Enf. 44-58"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Valor Plano (R$)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.valorPlano}
                                        onChange={(e) => setFormData({ ...formData, valorPlano: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
                                        placeholder="1200.00"
                                        min="0"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Urgência
                                </label>
                                <select
                                    value={formData.urgencia}
                                    onChange={(e) => setFormData({ ...formData, urgencia: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
                                >
                                    <option value="">Não informada</option>
                                    <option value="Hoje">Quero Contratar Hoje</option>
                                    <option value="Esta Semana">Quero Contratar essa Semana</option>
                                    <option value="Sem Urgência">Não tenho Urgência</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Observações
                                </label>
                                <textarea
                                    value={formData.observacoes}
                                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
                                    placeholder="Anotações sobre o lead..."
                                    rows={3}
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingLead(null);
                                        resetForm();
                                    }}
                                    className="flex-1 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={createMutation.isPending || updateMutation.isPending}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {(createMutation.isPending || updateMutation.isPending) ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Salvando...
                                        </>
                                    ) : (
                                        editingLead ? 'Atualizar' : 'Criar Lead'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
