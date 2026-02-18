import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import leadsRoutes from './routes/leads';
import propostasRoutes from './routes/propostas';
import dashboardRoutes from './routes/dashboard';
import chatRoutes from './routes/chat';
import whatsappRoutes from './routes/whatsapp';
import { getWhatsAppService } from './services/whatsapp';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'API Corretor Saúde funcionando!' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/propostas', propostasRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/whatsapp', whatsappRoutes);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('❌ Global Error Handler:', err);
    console.error(err.stack);
    res.status(500).json({ error: 'Erro interno do servidor', details: err.message });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log('\n=================================');
    console.log('🚀 Servidor rodando na porta', PORT);
    console.log('📊 API: http://localhost:' + PORT);
    console.log('❤️  Health: http://localhost:' + PORT + '/health');
    console.log('=================================\n');
});

// Iniciar WhatsApp Bot automaticamente
const startWhatsApp = async () => {
    try {
        console.log('🤖 Iniciando WhatsApp Bot...\n');
        const whatsapp = getWhatsAppService();
        await whatsapp.conectar();
    } catch (error) {
        console.error('❌ Erro ao iniciar WhatsApp:', error);
        console.log('💡 Dica: O bot WhatsApp é opcional. O sistema funciona sem ele.\n');
    }
};

// Iniciar WhatsApp após 5 segundos
setTimeout(startWhatsApp, 5000);