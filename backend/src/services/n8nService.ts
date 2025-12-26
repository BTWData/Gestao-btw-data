import axios from 'axios';
import { TenantSettingsService } from './tenantSettingsService';

const tenantSettingsService = new TenantSettingsService();

export class N8nService {
  /**
   * Envia um webhook para o n8n para iniciar o fluxo do Agente de IA.
   * @param tenantId ID do tenant
   * @param contact Dados do contato
   * @param campaign Dados da campanha
   * @returns Resultado da chamada do webhook
   */
  public async sendAiAgentWebhook(tenantId: string, contact: any, campaign: any): Promise<{ success: boolean, message: string }> {
    try {
      const settings = await tenantSettingsService.getTenantSettings(tenantId);

      if (!settings.aiAgentEnabled) {
        return { success: false, message: 'Agente de IA desabilitado para este tenant.' };
      }

      const webhookUrl = settings.n8nWebhookUrl;
      const apiKey = settings.n8nApiKey;

      if (!webhookUrl) {
        return { success: false, message: 'URL do Webhook do n8n não configurada.' };
      }

      const payload = {
        event: 'start_ai_agent',
        tenantId: tenantId,
        contact: contact,
        campaign: {
          id: campaign.id,
          nome: campaign.nome,
          messageType: campaign.messageType,
          messageContent: campaign.messageContent,
          sessionNames: campaign.sessionNames,
        },
        timestamp: new Date().toISOString(),
      };

      const headers: any = {
        'Content-Type': 'application/json',
      };

      if (apiKey) {
        headers['X-N8N-Api-Key'] = apiKey;
      }

      console.log(`🤖 Chamando webhook do n8n: ${webhookUrl}`);
      
      const response = await axios.post(webhookUrl, payload, { headers });

      if (response.status >= 200 && response.status < 300) {
        console.log('✅ Webhook do n8n chamado com sucesso.');
        return { success: true, message: 'Webhook do n8n chamado com sucesso.' };
      } else {
        console.error(`❌ Webhook do n8n retornou status ${response.status}: ${response.data}`);
        return { success: false, message: `Webhook do n8n retornou erro: ${response.status} - ${response.data}` };
      }

    } catch (error: any) {
      console.error('❌ Erro ao chamar webhook do n8n:', error.message);
      return { success: false, message: `Erro ao chamar webhook do n8n: ${error.message}` };
    }
  }
}

export const n8nService = new N8nService();
