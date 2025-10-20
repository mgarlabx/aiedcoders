// Variáveis globais para armazenar os dados do grafo
let graphData = {
    node_members: [],
    node_organizations: [],
    node_organization_types: [],
    edge_members_organizations: [],
    edge_organizations_types: []
};


// Função para fazer o fetch dos dados
async function fetchGraphData() {
    const endpoint = 'https://www.aiedcoders.net/backend/';
    
    try {
        const response = await fetch(endpoint);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
    
        
        // Armazena os dados nas variáveis globais
        graphData = {
            node_members: data.node_members || [],
            node_organizations: data.node_organizations || [],
            node_organization_types: data.node_organization_types || [],
            edge_members_organizations: data.edge_members_organizations || [],
            edge_organizations_types: data.edge_organizations_types || []
        };
        
        // Ordena os arrays alfabeticamente (ignorando acentos)
        graphData.node_members.sort((a, b) => 
            a.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').localeCompare(
                b.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            )
        );

        graphData.node_organizations.sort((a, b) => 
            a.label.normalize('NFD').replace(/[\u0300-\u036f]/g, '').localeCompare(
                b.label.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            )
        );
        
        return graphData;
        
    } catch (error) {
        console.error('Erro ao buscar dados do grafo:', error);
        throw error;
    }
}

// Inicializa a aplicação
async function init() {
    
    try {
        // Mostrar indicador de carregamento
        showLoading();
        
        // Buscar dados do backend
        await fetchGraphData();
        
        // Inicializar o grafo com os dados obtidos
        initGraph(graphData);
        
        // Inicializar visualização em tabela
        initTableView();
        
        // Remover indicador de carregamento
        hideLoading();
        
    } catch (error) {
        console.error('Erro ao inicializar aplicação:', error);
        hideLoading();
        showError('Erro ao carregar dados do grafo. Verifique a conexão.');
    }
}

// Mostra indicador de carregamento
function showLoading() {
    const container = document.getElementById('graph-container');
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loading-indicator';
    loadingDiv.className = 'loading';
    loadingDiv.innerHTML = `
        <div class="loading-spinner"></div>
        <div class="loading-text">Carregando Grafo...</div>
    `;
    container.appendChild(loadingDiv);
}

// Remove indicador de carregamento
function hideLoading() {
    const loadingDiv = document.getElementById('loading-indicator');
    if (loadingDiv) {
        loadingDiv.remove();
    }
}

// Mostra mensagem de erro
function showError(message) {
    const container = document.getElementById('graph-container');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'loading';
    errorDiv.innerHTML = `
        <div class="loading-text" style="color: #ff0000;">${message}</div>
    `;
    container.appendChild(errorDiv);
}
