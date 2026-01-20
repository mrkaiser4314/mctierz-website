// ConfiguraciÃ³n de la API - IMPORTANTE: URL de Railway
const API_URL = 'https://web-production-8abc3.up.railway.app/api';

let currentMode = 'overall';

// Cargar rankings al iniciar
document.addEventListener('DOMContentLoaded', () => {
    console.log('ðŸš€ Iniciando MCTierz Rankings');
    console.log('ðŸ“¡ API URL:', API_URL);
    loadRankings('overall');
    setupModeButtons();
    // Auto-refresh cada 10 segundos
    setInterval(() => loadRankings(currentMode), 10000);
});

// Configurar botones de modalidad
function setupModeButtons() {
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMode = btn.dataset.mode;
            loadRankings(currentMode);
        });
    });
}

// Cargar rankings desde la API
async function loadRankings(mode) {
    try {
        console.log(`ðŸ“¥ Cargando rankings para: ${mode}`);
        console.log(`ðŸ”— URL completa: ${API_URL}/rankings/${mode}`);
        
        const response = await fetch(`${API_URL}/rankings/${mode}`);
        
        console.log('ðŸ“¡ Respuesta recibida:', response.status, response.statusText);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('âœ… Datos recibidos:', data);
        console.log('ðŸ‘¥ Total jugadores:', data.total_players);
        
        displayRankings(data);
        
    } catch (error) {
        console.error('âŒ Error cargando rankings:', error);
        showError(error.message);
    }
}

// Mostrar rankings en la pÃ¡gina
function displayRankings(data) {
    const container = document.getElementById('rankings-container');
    
    if (!data || data.total_players === 0) {
        container.innerHTML = `
            <div class="no-data">
                <h2>ðŸ“Š No hay jugadores testeados aÃºn</h2>
                <p>Los rankings aparecerÃ¡n cuando se publiquen los primeros resultados</p>
                <p style="margin-top: 20px; font-size: 14px; opacity: 0.7;">
                    Conectado a: ${API_URL}
                </p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    // Mostrar cada tier
    for (let tier = 1; tier <= 5; tier++) {
        const tierData = data[`tier${tier}`];
        
        if (tierData && tierData.length > 0) {
            const tierSection = createTierSection(tier, tierData);
            container.appendChild(tierSection);
        }
    }
}

// Crear secciÃ³n de tier
function createTierSection(tierNum, players) {
    const section = document.createElement('div');
    section.className = 'tier-section';
    
    const tierColors = {
        1: '#ff4444',
        2: '#ffaa00',
        3: '#44ff44',
        4: '#4444ff',
        5: '#aa44ff'
    };
    
    section.innerHTML = `
        <div class="tier-header" style="background: ${tierColors[tierNum]};">
            <h2>ðŸ† Tier ${tierNum}</h2>
            <span class="player-count">${players.length} jugadores</span>
        </div>
        <div class="tier-players">
            ${players.map((player, index) => createPlayerCard(player, index + 1)).join('')}
        </div>
    `;
    
    return section;
}

// Crear tarjeta de jugador
function createPlayerCard(player, position) {
    return `
        <div class="player-card" onclick="showPlayerModal('${player.id}')">
            <div class="player-position">#${position}</div>
            <div class="player-info">
                <h3>${player.name}</h3>
                <p class="player-points">â­ ${player.points} puntos</p>
            </div>
            <div class="player-tier">
                Tier ${player.tier}
            </div>
        </div>
    `;
}

// Mostrar modal de jugador
async function showPlayerModal(playerId) {
    try {
        console.log(`ðŸ“¥ Cargando datos del jugador: ${playerId}`);
        const response = await fetch(`${API_URL}/player/${playerId}`);
        
        if (!response.ok) {
            throw new Error(`Error cargando jugador: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('âœ… Datos del jugador:', data);
        
        const modal = document.getElementById('player-modal');
        const content = document.getElementById('modal-content');
        
        content.innerHTML = `
            <div class="modal-header">
                <h2>ðŸ‘¤ ${data.name}</h2>
                <button class="close-btn" onclick="closeModal()">âœ•</button>
            </div>
            <div class="modal-body">
                <div class="stat-row">
                    <span class="stat-label">Discord:</span>
                    <span class="stat-value">${data.discord_name}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Puntos Totales:</span>
                    <span class="stat-value">â­ ${data.puntos_totales}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">PosiciÃ³n:</span>
                    <span class="stat-value">#${data.position} de ${data.total_players}</span>
                </div>
                <h3>ðŸ“Š Tiers por Modalidad</h3>
                <div class="modes-grid">
                    ${Object.entries(data.tiers).map(([mode, info]) => `
                        <div class="mode-stat">
                            <strong>${getModeEmoji(mode)} ${mode}</strong>
                            <span>${info.tier} (${info.puntos} pts)</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        modal.style.display = 'flex';
        
    } catch (error) {
        console.error('âŒ Error cargando jugador:', error);
        alert('Error al cargar informaciÃ³n del jugador');
    }
}

// Cerrar modal
function closeModal() {
    document.getElementById('player-modal').style.display = 'none';
}

// Obtener emoji de modalidad
function getModeEmoji(mode) {
    const emojis = {
        'Mace': 'ðŸ”¨',
        'Sword': 'âš”ï¸',
        'UHC': 'â¤ï¸',
        'Crystal': 'ðŸ’Ž',
        'NethOP': 'ðŸ§ª'
    };
    return emojis[mode] || 'ðŸŽ®';
}

// Mostrar error
function showError(errorMsg) {
    const container = document.getElementById('rankings-container');
    container.innerHTML = `
        <div class="error-message">
            <h2>âš ï¸ Error al cargar rankings</h2>
            <p>No se pudo conectar con la API</p>
            <div style="background: #f44; padding: 10px; border-radius: 5px; margin: 10px 0;">
                <strong>Error:</strong> ${errorMsg}
            </div>
            <p style="font-size: 14px; opacity: 0.7;">URL de API: ${API_URL}</p>
            <button onclick="loadRankings(currentMode)" class="retry-btn" style="margin-top: 15px; padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">
                ðŸ”„ Reintentar
            </button>
        </div>
    `;
}

// Cerrar modal al hacer click fuera
window.onclick = function(event) {
    const modal = document.getElementById('player-modal');
    if (event.target === modal) {
        closeModal();
    }
}
