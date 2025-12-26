import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useGlobalSettings } from '../hooks/useGlobalSettings';
import { api } from '../services/api';
import { Toaster, toast } from 'react-hot-toast';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Esquema de validação para as configurações do n8n
const aiAgentSettingsSchema = z.object({
  n8nWebhookUrl: z.string().url('URL do Webhook do n8n deve ser uma URL válida').optional().or(z.literal('')),
  n8nApiKey: z.string().min(10, 'API Key do n8n deve ter pelo menos 10 caracteres').optional().or(z.literal('')),
  aiAgentEnabled: z.boolean().optional(),
});

type AIAgentSettingsForm = z.infer<typeof aiAgentSettingsSchema>;

export const AIAgentPage: React.FC = () => {
  const { user } = useAuth();
  const { settings, refetchSettings } = useGlobalSettings();
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AIAgentSettingsForm>({
    resolver: zodResolver(aiAgentSettingsSchema),
    defaultValues: {
      n8nWebhookUrl: settings?.n8nWebhookUrl || '',
      n8nApiKey: settings?.n8nApiKey || '',
      aiAgentEnabled: settings?.aiAgentEnabled || false,
    },
  });

  useEffect(() => {
    // Atualiza o formulário quando as configurações globais são carregadas ou alteradas
    reset({
      n8nWebhookUrl: settings?.n8nWebhookUrl || '',
      n8nApiKey: settings?.n8nApiKey || '',
      aiAgentEnabled: settings?.aiAgentEnabled || false,
    });
  }, [settings, reset]);

  const onSubmit = async (data: AIAgentSettingsForm) => {
    setIsSaving(true);
    try {
      const payload = {
        ...data,
        // Garantir que campos vazios sejam enviados como null ou string vazia, dependendo do backend
        n8nWebhookUrl: data.n8nWebhookUrl || null,
        n8nApiKey: data.n8nApiKey || null,
      };

      await api.put('/settings', payload);
      toast.success('Configurações do Agente de IA salvas com sucesso!');
      refetchSettings(); // Recarrega as configurações globais
    } catch (error) {
      console.error('Erro ao salvar configurações do Agente de IA:', error);
      toast.error('Erro ao salvar configurações. Verifique o console.');
    } finally {
      setIsSaving(false);
    }
  };

  if (user?.role === 'SUPERADMIN') {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Agente de IA (n8n)</h1>
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6" role="alert">
          <p className="font-bold">Acesso Restrito</p>
          <p>A configuração do Agente de IA é feita por Tenant. Por favor, acesse a página de configurações de um Tenant específico para gerenciar esta funcionalidade.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Toaster />
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Agente de IA (n8n)</h1>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Configuração de Integração n8n
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Configure a conexão com o n8n para habilitar o Agente de IA no fluxo de campanhas.
          </p>
        </div>
        <div className="border-t border-gray-200">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
            
            {/* Campo n8n Webhook URL */}
            <div>
              <label htmlFor="n8nWebhookUrl" className="block text-sm font-medium text-gray-700">
                Webhook URL do n8n
              </label>
              <div className="mt-1">
                <input
                  id="n8nWebhookUrl"
                  type="url"
                  {...register('n8nWebhookUrl')}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="https://seu-n8n.com/webhook/..."
                />
              </div>
              {errors.n8nWebhookUrl && <p className="mt-2 text-sm text-red-600">{errors.n8nWebhookUrl.message}</p>}
            </div>

            {/* Campo n8n API Key */}
            <div>
              <label htmlFor="n8nApiKey" className="block text-sm font-medium text-gray-700">
                API Key do n8n (Opcional)
              </label>
              <div className="mt-1">
                <input
                  id="n8nApiKey"
                  type="password"
                  {...register('n8nApiKey')}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Sua chave de API para autenticação"
                />
              </div>
              {errors.n8nApiKey && <p className="mt-2 text-sm text-red-600">{errors.n8nApiKey.message}</p>}
            </div>

            {/* Switch para Habilitar Agente de IA */}
            <div className="flex items-center justify-between">
              <span className="flex-grow flex flex-col">
                <span className="text-sm font-medium text-gray-900">Habilitar Agente de IA</span>
                <span className="text-sm text-gray-500">Permite que o Agente de IA seja usado nas campanhas.</span>
              </span>
              <label htmlFor="aiAgentEnabled" className="relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <input
                  type="checkbox"
                  id="aiAgentEnabled"
                  {...register('aiAgentEnabled')}
                  className="sr-only"
                />
                <span
                  aria-hidden="true"
                  className={`${
                    settings?.aiAgentEnabled ? 'translate-x-5 bg-indigo-600' : 'translate-x-0 bg-gray-200'
                  } pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
                ></span>
              </label>
            </div>

            {/* Botão de Salvar */}
            <div className="pt-5">
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isSaving ? 'Salvando...' : 'Salvar Configurações'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
