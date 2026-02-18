import express from 'express';
import { getWhatsAppService } from '../services/whatsapp';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Middleware de autenticação para proteger as rotas
router.use(authMiddleware);

// GET /api/whatsapp/status
router.get('/status', (req, res) => {
    try {
        const whatsapp = getWhatsAppService();
        const isConnected = whatsapp.isConnected();
        const qrCode = whatsapp.getQRCode();

        res.json({
            connected: isConnected,
            qrCode: isConnected ? null : qrCode // Só manda QR se não estiver conectado
        });
    } catch (error) {
        console.error('Erro ao pegar status do WhatsApp:', error);
        res.status(500).json({ error: 'Erro interno ao verificar status' });
    }
});

// POST /api/whatsapp/connect
router.post('/connect', async (req, res) => {
    try {
        const whatsapp = getWhatsAppService();

        if (whatsapp.isConnected()) {
            return res.status(400).json({ message: 'Já está conectado' });
        }

        // Inicia conexão (vai gerar QR Code)
        await whatsapp.conectar();

        res.json({ message: 'Iniciando conexão... Aguarde o QR Code.' });
    } catch (error) {
        console.error('Erro ao conectar WhatsApp:', error);
        res.status(500).json({ error: 'Erro ao iniciar conexão' });
    }
});

// POST /api/whatsapp/disconnect
router.post('/disconnect', async (req, res) => {
    try {
        const whatsapp = getWhatsAppService();
        whatsapp.desconectar();

        res.json({ message: 'Desconectado com sucesso' });
    } catch (error) {
        console.error('Erro ao desconectar WhatsApp:', error);
        res.status(500).json({ error: 'Erro ao desconectar' });
    }
});

export default router;
