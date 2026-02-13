module.exports = {
    apps: [
        {
            name: 'corretor-backend',
            cwd: './backend',
            script: 'dist/server.js',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '500M',
            env: {
                NODE_ENV: 'production',
                PORT: 3001,
                // O diretório de sessão do WhatsApp será criado na raiz do projeto (fora da pasta backend)
                WHATSAPP_AUTH_DIR: '../whatsapp_auth_session'
            }
        },
        {
            name: 'corretor-frontend',
            cwd: './frontend',
            script: 'npm',
            args: 'start', // Executa 'next start'
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '500M',
            env: {
                NODE_ENV: 'production',
                PORT: 3000
            }
        }
    ]
};
