const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const pino = require('pino');

async function listLabels() {
    const { state } = await useMultiFileAuthState('auth_info');
    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' })
    });

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;
        console.log('📡 Conexão:', connection || 'atualizando...');

        if (qr) console.log('⚠️ Requer leitura de QR Code! (Use o auth_info atual)');

        if (connection === 'open') {
            console.log('✅ WhatsApp Conectado! Buscando etiquetas...');
            try {
                // Tenta buscar etiquetas usando query
                const result = await sock.query({
                    tag: 'iq',
                    attrs: {
                        display_name: 'WhatsApp business labels',
                        type: 'get',
                        xmlns: 'w:biz:label',
                        to: '@s.whatsapp.net',
                    },
                    content: [{ tag: 'labels', attrs: {} }]
                });

                console.log('📋 Etiquetas encontradas:');
                console.log(JSON.stringify(result, null, 2));

                process.exit(0);
            } catch (err) {
                console.error('❌ Erro ao buscar etiquetas:', err);
                process.exit(1);
            }
        }
    });
}

listLabels();
