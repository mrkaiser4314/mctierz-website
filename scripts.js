// Configuración de la API
const API_URL = 'https://web-production-8abc3.up.railway.app/api';  // Cambiar en producción
const REFRESH_INTERVAL = 10000; // Actualizar cada 10 segundos

// Modo actual seleccionado
let currentMode = 'overall';
let refreshTimer = null;

// Iconos de modalidades
const MODE_ICONS = {
    'Overall': '🏆',
    'UHC': '❤️',
    'Sword': '🗡️',
    'Mazo': '🔨',
    'NethOP': '🧪',
    'Crystal': '💎'
};

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    setupTabs();
    setupCopyButton();
    setupSearch();
    setupModal();
    loadRankings(currentMode);
    startAutoRefresh();
});

// Configurar pestañas
function setupTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentMode = tab.dataset.mode;
            loadRankings(currentMode);
        });
    });
}

// Cargar rankings desde la API
async function loadRankings(mode) {
    try {
        showLoading();
        
        const response = await fetch(`${API_URL}/rankings/${mode}`);
        
        if (!response.ok) {
            throw new Error('Error al cargar rankings');
        }
        
        const data = await response.json();
        
        // Si no hay jugadores, mostrar mensaje vacío
        if (data.total_players === 0) {
            showEmpty();
            return;
        }
        
        // Mostrar rankings
        showRankings();
        
        // Cargar cada tier
        loadTier(1, data.tier1 || []);
        loadTier(2, data.tier2 || []);
        loadTier(3, data.tier3 || []);
        loadTier(4, data.tier4 || []);
        loadTier(5, data.tier5 || []);
        
    } catch (error) {
        console.error('Error loading rankings:', error);
        showError();
    }
}

// Cargar jugadores en un tier
function loadTier(tierNumber, players) {
    const container = document.getElementById(`tier${tierNumber}Players`);
    
    if (players.length === 0) {
        container.innerHTML = '<div class="empty-tier">No players</div>';
        return;
    }

    container.innerHTML = players.map(player => `
        <div class="player-card" data-player-id="${player.id}" onclick="openPlayerModal('${player.id}')">
            <img src="https://mc-heads.net/avatar/${player.name}/32" 
                 alt="${player.name}" 
                 class="player-avatar"
                 onerror="this.src='https://via.placeholder.com/32/444/fff?text=${player.name.charAt(0)}'">
            <div class="player-info">
                <span class="player-name">${player.name}</span>
                <span class="player-points">${player.points} pts</span>
            </div>
            <span class="player-rank">↗</span>
        </div>
    `).join('');
}

// Estados de visualización
function showLoading() {
    document.getElementById('loadingMessage').style.display = 'block';
    document.getElementById('emptyMessage').style.display = 'none';
    document.getElementById('rankingsGrid').style.display = 'none';
}

function showEmpty() {
    document.getElementById('loadingMessage').style.display = 'none';
    document.getElementById('emptyMessage').style.display = 'block';
    document.getElementById('rankingsGrid').style.display = 'none';
}

function showRankings() {
    document.getElementById('loadingMessage').style.display = 'none';
    document.getElementById('emptyMessage').style.display = 'none';
    document.getElementById('rankingsGrid').style.display = 'grid';
}

function showError() {
    document.getElementById('loadingMessage').innerHTML = `
        <div class="empty-icon">⚠️</div>
        <h2>Error al cargar rankings</h2>
        <p>Verifica que la API esté corriendo</p>
        <button onclick="location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: var(--accent); border: none; color: white; border-radius: 6px; cursor: pointer;">Reintentar</button>
    `;
    document.getElementById('loadingMessage').style.display = 'block';
    document.getElementById('emptyMessage').style.display = 'none';
    document.getElementById('rankingsGrid').style.display = 'none';
}

// Auto-refresh
function startAutoRefresh() {
    refreshTimer = setInterval(() => {
        loadRankings(currentMode);
    }, REFRESH_INTERVAL);
}

function stopAutoRefresh() {
    if (refreshTimer) {
        clearInterval(refreshTimer);
        refreshTimer = null;
    }
}

// Modal del jugador
function setupModal() {
    const modal = document.getElementById('playerModal');
    const closeBtn = document.querySelector('.modal-close');
    
    closeBtn.onclick = () => {
        modal.style.display = 'none';
    };
    
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
}

async function openPlayerModal(playerId) {
    const modal = document.getElementById('playerModal');
    
    try {
        const response = await fetch(`${API_URL}/player/${playerId}`);
        
        if (!response.ok) {
            throw new Error('Player not found');
        }
        
        const player = await response.json();
        
        // Actualizar contenido del modal
        document.getElementById('modalAvatar').src = `https://mc-heads.net/avatar/${player.name}/100`;
        document.getElementById('modalName').textContent = player.name;
        document.getElementById('modalNameMC').textContent = `NameMC ${player.name}`;
        document.getElementById('modalPosition').textContent = player.position || '?';
        document.getElementById('modalTotalPoints').textContent = player.puntos_totales || 0;
        
        // Actualizar tiers
        const tiersContainer = document.getElementById('modalTiers');
        tiersContainer.innerHTML = '';
        
        for (const [mode, tierInfo] of Object.entries(player.tiers || {})) {
            const badge = document.createElement('div');
            badge.className = 'tier-badge';
            badge.innerHTML = `
                <div class="tier-badge-icon">${MODE_ICONS[mode] || '🎮'}</div>
                <div class="tier-badge-label">${tierInfo.tier || 'N/A'}</div>
            `;
            tiersContainer.appendChild(badge);
        }
        
        modal.style.display = 'block';
        
    } catch (error) {
        console.error('Error loading player:', error);
        alert('Error al cargar información del jugador');
    }
}

// Botón copiar IP
function setupCopyButton() {
    const copyBtn = document.querySelector('.copy-btn');
    const serverIp = document.querySelector('.server-ip').textContent;
    
    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(serverIp).then(() => {
            copyBtn.textContent = '✓';
            setTimeout(() => {
                copyBtn.textContent = '📋';
            }, 2000);
        });
    });
}

// Búsqueda de jugadores
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const playerCards = document.querySelectorAll('.player-card');
        
        playerCards.forEach(card => {
            const playerName = card.querySelector('.player-name').textContent.toLowerCase();
            if (playerName.includes(searchTerm)) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    });
}

// Log
console.log('%cMCTierz', 'font-size: 2rem; font-weight: bold; background: linear-gradient(135deg, #ff6b00, #ffd700); -webkit-background-clip: text; -webkit-text-fill-color: transparent;');
console.log('%c🏆 Rankings en Tiempo Real', 'font-size: 1.2rem; color: #ffd700;');
console.log('\n📡 Conectado a API:', API_URL);
console.log('🔄 Auto-refresh cada', REFRESH_INTERVAL / 1000, 'segundos');
console.log('\n💡 Los datos vienen directamente del bot de Discord');
console.log('💡 La página se actualiza automáticamente');
