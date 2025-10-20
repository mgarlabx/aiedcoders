// Grafo 3D Esférico com Cytoscape.js
// Sistema de visualização futurista

let cy; // Instância do Cytoscape
let selectedNode = null;

/**
 * Inicializa o grafo esférico com os dados fornecidos
 */
function initGraph(graphData) {
    
    // Validar se há dados
    if (!graphData || typeof graphData !== 'object') {
        console.error('Dados do grafo inválidos:', graphData);
        throw new Error('Dados do grafo inválidos');
    }
    
    // Prepara os elementos para o Cytoscape
    const elements = prepareGraphElements(graphData);
    
    if (elements.length === 0) {
        console.warn('Nenhum elemento foi criado. Verifique a estrutura dos dados.');
        throw new Error('Nenhum dado disponível para visualização');
    }
    
    // Configuração do Cytoscape
    cy = cytoscape({
        container: document.getElementById('cy'),
        
        elements: elements,
        
        style: [
            // Estilo para membros (pessoas)
            {
                selector: 'node[type="member"]',
                style: {
                    'background-color': '#00ffff',
                    'label': 'data(label)',
                    'color': '#00ffff',
                    'text-valign': 'center',
                    'text-halign': 'center',
                    'font-size': '10px',
                    'text-outline-width': 2,
                    'text-outline-color': '#000',
                    'width': 30,
                    'height': 30,
                    'border-width': 2,
                    'border-color': '#00ffff',
                    'border-opacity': 0.8,
                    'box-shadow': '0 0 15px #00ffff'
                }
            },
            
            // Estilo para organizações
            {
                selector: 'node[type="organization"]',
                style: {
                    'background-color': '#ff00ff',
                    'label': 'data(label)',
                    'color': '#ff00ff',
                    'text-valign': 'center',
                    'text-halign': 'center',
                    'font-size': '12px',
                    'text-outline-width': 2,
                    'text-outline-color': '#000',
                    'width': 40,
                    'height': 40,
                    'shape': 'diamond',
                    'border-width': 2,
                    'border-color': '#ff00ff',
                    'border-opacity': 0.8,
                    'box-shadow': '0 0 15px #ff00ff'
                }
            },
            
            // Estilo para tipos de organização
            {
                selector: 'node[type="organization_type"]',
                style: {
                    'background-color': '#00cc99',
                    'label': 'data(label)',
                    'color': '#00cc99',
                    'text-valign': 'center',
                    'text-halign': 'center',
                    'font-size': '12px',
                    'text-outline-width': 2,
                    'text-outline-color': '#000',
                    'width': 40,
                    'height': 40,
                    'shape': 'hexagon',
                    'border-width': 2,
                    'border-color': '#00cc99',
                    'border-opacity': 0.8,
                    'box-shadow': '0 0 15px #00cc99'
                }
            },
            
            // Estilo para nó selecionado
            {
                selector: 'node:selected',
                style: {
                    'border-width': 6,
                    'border-color': '#fff',
                    'width': 'data(selectedWidth)',
                    'height': 'data(selectedHeight)',
                    'z-index': 999
                }
            },
            
            // Estilo para arestas (member-organization)
            {
                selector: 'edge[type="member-organization"]',
                style: {
                    'width': 2,
                    'line-color': '#00ffff',
                    'target-arrow-color': '#00ffff',
                    'target-arrow-shape': 'triangle',
                    'curve-style': 'bezier',
                    'opacity': 0.6,
                    'line-style': 'solid'
                }
            },
            
            // Estilo para arestas (organization-type)
            {
                selector: 'edge[type="organization-type"]',
                style: {
                    'width': 3,
                    'line-color': '#ff00ff',
                    'target-arrow-color': '#ff00ff',
                    'target-arrow-shape': 'triangle',
                    'curve-style': 'bezier',
                    'opacity': 0.7,
                    'line-style': 'dashed'
                }
            },
            
            // Estilo para arestas destacadas
            {
                selector: 'edge.highlighted',
                style: {
                    'width': 4,
                    'opacity': 1,
                    'z-index': 999
                }
            }
        ],
        
        layout: {
            name: 'cose', // Layout baseado em física (force-directed)
            animate: true,
            animationDuration: 1500,
            animationEasing: 'ease-out',
            
            // Qualidade do layout
            quality: 'default', // 'draft', 'default' ou 'proof'
            
            // Parâmetros de força
            nodeRepulsion: function(node) { return 8000; }, // Repulsão entre nós
            nodeOverlap: 20, // Espaço extra ao redor dos nós
            idealEdgeLength: function(edge) { return 100; }, // Comprimento ideal das arestas
            edgeElasticity: function(edge) { return 200; }, // Elasticidade das arestas
            
            // Separação de componentes
            componentSpacing: 150, // Espaço entre componentes desconectados
            
            // Controle de temperatura
            nestingFactor: 1.2,
            gravity: 1, // Força gravitacional para o centro
            
            // Iterações
            numIter: 1000, // Número de iterações
            initialTemp: 200,
            coolingFactor: 0.95,
            minTemp: 1.0,
            
            // Randomização
            randomize: false, // Usar posições existentes se disponíveis
            
            // Performance
            refresh: 20, // Quantos frames pular entre atualizações
            fit: true, // Ajustar zoom automaticamente
            padding: 50, // Padding ao redor do grafo
            
            // Evitar sobreposição
            avoidOverlap: true
        },
        
        // Configurações de interação
        minZoom: 0.1,
        maxZoom: 3,
        wheelSensitivity: 0.2,
        // Zoom inicial será definido pelo fit do layout
        
        // Habilitar física para movimento suave
        autoungrabify: false,
        autounselectify: false
    });
    
    // Adicionar evento de clique nos nós
    cy.on('tap', 'node', function(evt) {
        const node = evt.target;
        showNodeInfo(node);
        highlightConnections(node);
    });
    
    // Adicionar evento de clique no fundo para desselecionar
    cy.on('tap', function(evt) {
        if (evt.target === cy) {
            hideNodeInfo();
            clearHighlight();
        }
    });
    
    // Adicionar evento de hover
    cy.on('mouseover', 'node', function(evt) {
        document.body.style.cursor = 'pointer';
        evt.target.animate({
            style: {
                'width': evt.target.data('selectedWidth'),
                'height': evt.target.data('selectedHeight')
            }
        }, {
            duration: 200
        });
    });
    
    cy.on('mouseout', 'node', function(evt) {
        document.body.style.cursor = 'default';
        if (!evt.target.selected()) {
            evt.target.animate({
                style: {
                    'width': evt.target.data('originalWidth'),
                    'height': evt.target.data('originalHeight')
                }
            }, {
                duration: 200
            });
        }
    });
    
    // Configurar botão de fechar
    document.getElementById('close-info').addEventListener('click', function() {
        hideNodeInfo();
        clearHighlight();
        if (selectedNode) {
            selectedNode.unselect();
        }
    });
    
    // Configurar controles de zoom
    setupZoomControls();
    
    // Configurar controles de layout
    setupLayoutControls();
    
    // Configurar busca
    setupSearch();
    
    // Animar a entrada dos nós
    animateGraphEntrance();
}

/**
 * Configura a funcionalidade de busca
 */
function setupSearch() {
    const searchInput = document.getElementById('search-input');
    const searchClear = document.getElementById('search-clear');
    const searchResults = document.getElementById('search-results');
    
    let searchTimeout;
    
    // Evento de input com debounce
    searchInput.addEventListener('input', function(e) {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim().toLowerCase();
        
        if (query.length === 0) {
            hideSearchResults();
            clearSearchHighlight();
            return;
        }
        
        searchTimeout = setTimeout(() => {
            performSearch(query);
        }, 300);
    });
    
    // Limpar busca
    searchClear.addEventListener('click', function() {
        searchInput.value = '';
        hideSearchResults();
        clearSearchHighlight();
        searchInput.focus();
    });
    
    // Fechar resultados ao clicar fora
    document.addEventListener('click', function(e) {
        if (!document.getElementById('search-container').contains(e.target)) {
            hideSearchResults();
        }
    });
    
    // Busca ao pressionar Enter
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            const query = e.target.value.trim().toLowerCase();
            if (query.length > 0) {
                performSearch(query);
            }
        }
    });
}

/**
 * Realiza a busca nos nós
 */
function performSearch(query) {
    const results = [];
    
    cy.nodes().forEach(node => {
        const label = node.data('label').toLowerCase();
        const properties = node.data('properties');
        
        // Buscar no label
        if (label.includes(query)) {
            results.push({
                node: node,
                relevance: 2 // maior relevância para match no label
            });
            return;
        }
        
        // Buscar nas propriedades
        for (const [key, value] of Object.entries(properties)) {
            if (value && String(value).toLowerCase().includes(query)) {
                results.push({
                    node: node,
                    relevance: 1
                });
                return;
            }
        }
    });
    
    // Ordenar por relevância
    results.sort((a, b) => b.relevance - a.relevance);
    
    displaySearchResults(results, query);
    highlightSearchResults(results);
}

/**
 * Exibe os resultados da busca
 */
function displaySearchResults(results, query) {
    const searchResults = document.getElementById('search-results');
    
    if (results.length === 0) {
        searchResults.innerHTML = `
            <div class="search-no-results">
                Nenhum resultado encontrado para "${query}"
            </div>
        `;
        searchResults.classList.remove('hidden');
        return;
    }
    
    let html = '';
    results.forEach(({ node }) => {
        const label = node.data('label');
        const type = node.data('type');
        const typeLabel = getTypeLabel(type);
        
        html += `
            <div class="search-result-item" data-node-id="${node.id()}">
                <div class="search-result-icon ${type}"></div>
                <div class="search-result-label">${highlightMatch(label, query)}</div>
                <div class="search-result-type">${typeLabel}</div>
            </div>
        `;
    });
    
    searchResults.innerHTML = html;
    searchResults.classList.remove('hidden');
    
    // Adicionar eventos de clique nos resultados
    document.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', function() {
            const nodeId = this.getAttribute('data-node-id');
            const node = cy.getElementById(nodeId);
            
            if (node) {
                // Centralizar e dar zoom no nó
                cy.animate({
                    fit: {
                        eles: node,
                        padding: 100
                    },
                    duration: 500,
                    easing: 'ease-out'
                });
                
                // Mostrar informações do nó
                setTimeout(() => {
                    node.select();
                    showNodeInfo(node);
                    highlightConnections(node);
                }, 500);
            }
        });
    });
}

/**
 * Esconde os resultados da busca
 */
function hideSearchResults() {
    document.getElementById('search-results').classList.add('hidden');
}

/**
 * Destaca os nós encontrados na busca
 */
function highlightSearchResults(results) {
    if (results.length === 0) {
        cy.elements().style('opacity', 1);
        return;
    }
    
    // Reduzir opacidade de todos
    cy.elements().style('opacity', 0.2);
    
    // Destacar resultados
    results.forEach(({ node }) => {
        node.style('opacity', 1);
        node.connectedEdges().style('opacity', 0.5);
    });
}

/**
 * Remove o destaque da busca
 */
function clearSearchHighlight() {
    cy.elements().style('opacity', 1);
}

/**
 * Retorna o label do tipo de nó
 */
function getTypeLabel(type) {
    const labels = {
        'member': 'Membro',
        'organization': 'Organização',
        'organization_type': 'Tipo'
    };
    return labels[type] || type;
}

/**
 * Destaca o texto correspondente na busca
 */
function highlightMatch(text, query) {
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<strong style="color: #fff; text-shadow: 0 0 10px #00ffff;">$1</strong>');
}

/**
 * Configura os controles de zoom
 */
function setupZoomControls() {
    document.getElementById('zoom-in').addEventListener('click', function() {
        cy.zoom(cy.zoom() * 1.2);
        cy.center();
    });
    
    document.getElementById('zoom-out').addEventListener('click', function() {
        cy.zoom(cy.zoom() * 0.8);
        cy.center();
    });
    
    document.getElementById('zoom-fit').addEventListener('click', function() {
        cy.fit(null, 50); // fit com padding de 50px
    });
    
    document.getElementById('zoom-reset').addEventListener('click', function() {
        applyGraphLayout();
    });
}

/**
 * Configura os controles de layout
 */
function setupLayoutControls() {
    const buttons = {
        'layout-cose': 'cose',
        'layout-circle': 'circle',
        // 'layout-grid': 'grid'
    };
    
    Object.keys(buttons).forEach(buttonId => {
        document.getElementById(buttonId).addEventListener('click', function() {
            // Remover classe active de todos os botões
            Object.keys(buttons).forEach(id => {
                document.getElementById(id).classList.remove('active');
            });
            document.getElementById('layout-table').classList.remove('active');
            
            // Adicionar classe active no botão clicado
            this.classList.add('active');
            
            // Garantir que a tabela está escondida
            const tableView = document.getElementById('table-view');
            if (tableView) {
                tableView.classList.add('hidden');
            }
            const graphView = document.getElementById('cy');
            if (graphView) {
                graphView.style.display = 'block';
            }
            
            // Aplicar o layout selecionado
            changeLayout(buttons[buttonId]);
        });
    });
    
    // Adicionar evento para o botão de tabela
    document.getElementById('layout-table').addEventListener('click', function() {
        // Remover classe active de todos os botões de layout
        Object.keys(buttons).forEach(id => {
            document.getElementById(id).classList.remove('active');
        });
        
        // Adicionar classe active no botão de tabela
        this.classList.add('active');
        
        // Mostrar visualização em tabela
        showTableView();
    });
}

/**
 * Muda o layout do grafo
 */
function changeLayout(layoutName) {
    let layoutConfig = {
        name: layoutName,
        animate: true,
        animationDuration: 1000,
        animationEasing: 'ease-in-out',
        fit: true,
        padding: 50
    };
    
    // Configurações específicas por layout
    switch(layoutName) {
        case 'cose':
            layoutConfig = {
                ...layoutConfig,
                nodeRepulsion: function(node) { return 8000; },
                nodeOverlap: 20,
                idealEdgeLength: function(edge) { return 100; },
                edgeElasticity: function(edge) { return 200; },
                componentSpacing: 150,
                gravity: 1,
                numIter: 1000,
                initialTemp: 200,
                coolingFactor: 0.95,
                minTemp: 1.0,
                randomize: false,
                avoidOverlap: true
            };
            break;
            
        case 'circle':
            layoutConfig = {
                ...layoutConfig,
                radius: Math.min(window.innerWidth, window.innerHeight) * 0.3,
                spacingFactor: 0.8,
                startAngle: 0,
                sweep: 2 * Math.PI,
                clockwise: true
            };
            break;
            
        case 'grid':
            layoutConfig = {
                ...layoutConfig,
                rows: undefined, // Auto-calcular
                cols: undefined, // Auto-calcular
                position: function(node) { return {}; },
                condense: true,
                avoidOverlap: true,
                avoidOverlapPadding: 10
            };
            break;
    }
    
    cy.layout(layoutConfig).run();
}

/**
 * Prepara os elementos (nós e arestas) do grafo
 */
function prepareGraphElements(graphData) {
    const elements = [];
    const nodeIds = new Set(); // Para validar se os nós existem
    
  
    // Adicionar nós de membros
    if (graphData.node_members && Array.isArray(graphData.node_members)) {
        graphData.node_members.forEach(member => {
            // Encontrar o campo ID correto (pode ser 'id', 'member_id', etc.)
            const memberId = member.id || member.member_id || member.ID;
            
            if (memberId !== undefined && memberId !== null) {
                const nodeId = `member-${memberId}`;
                nodeIds.add(nodeId);
                
                elements.push({
                    data: {
                        id: nodeId,
                        label: member.name || member.member_name || `Member ${memberId}`,
                        type: 'member',
                        properties: member,
                        originalWidth: 30,
                        originalHeight: 30,
                        selectedWidth: 40,
                        selectedHeight: 40
                    }
                });
            } else {
                console.warn('Membro sem ID:', member);
            }
        });
    }
    
    // Adicionar nós de organizações
    if (graphData.node_organizations && Array.isArray(graphData.node_organizations)) {
        graphData.node_organizations.forEach(org => {
            const orgId = org.id || org.organization_id || org.ID;
            
            if (orgId !== undefined && orgId !== null) {
                const nodeId = `org-${orgId}`;
                nodeIds.add(nodeId);
                
                elements.push({
                    data: {
                        id: nodeId,
                        label: org.title || org.label || `Org ${orgId}`,
                        type: 'organization',
                        properties: org,
                        originalWidth: 40,
                        originalHeight: 40,
                        selectedWidth: 50,
                        selectedHeight: 50
                    }
                });
            } else {
                console.warn('Organização sem ID:', org);
            }
        });
    }
    
    // Adicionar nós de tipos de organização
    if (graphData.node_organization_types && Array.isArray(graphData.node_organization_types)) {
        graphData.node_organization_types.forEach(type => {
            const typeId = type.id || type.type_id || type.ID;
            
            if (typeId !== undefined && typeId !== null) {
                const nodeId = `type-${typeId}`;
                nodeIds.add(nodeId);
                
                elements.push({
                    data: {
                        id: nodeId,
                        label: type.title || type.label || `Type ${typeId}`,
                        type: 'organization_type',
                        properties: type,
                        originalWidth: 40,
                        originalHeight: 40,
                        selectedWidth: 50,
                        selectedHeight: 50
                    }
                });
            } else {
                console.warn('Tipo sem ID:', type);
            }
        });
    }
    
    
    // Adicionar arestas member-organization
    if (graphData.edge_members_organizations && Array.isArray(graphData.edge_members_organizations)) {
        graphData.edge_members_organizations.forEach((edge, index) => {
            const sourceId = edge.source || edge.member_id || edge.from;
            const targetId = edge.target || edge.organization_id || edge.to;
            
            if (sourceId !== undefined && sourceId !== null && targetId !== undefined && targetId !== null) {
                const sourceNodeId = `member-${sourceId}`;
                const targetNodeId = `org-${targetId}`;
                
                // Validar se os nós existem
                if (nodeIds.has(sourceNodeId) && nodeIds.has(targetNodeId)) {
                    elements.push({
                        data: {
                            id: `edge-mo-${index}`,
                            source: sourceNodeId,
                            target: targetNodeId,
                            type: 'member-organization'
                        }
                    });
                }
            }
        });
    }
    
    // Adicionar arestas organization-type
    if (graphData.edge_organizations_types && Array.isArray(graphData.edge_organizations_types)) {
        
        graphData.edge_organizations_types.forEach((edge, index) => {
            
            // Tentar múltiplos campos para source e target
            const sourceId = edge.source || edge.organization_id || edge.org_id || edge.from || edge.source_id;
            const targetId = edge.target || edge.type_id || edge.organization_type_id || edge.to || edge.target_id;
            
            if (sourceId !== undefined && sourceId !== null && targetId !== undefined && targetId !== null) {
                const sourceNodeId = `org-${sourceId}`;
                const targetNodeId = `type-${targetId}`;
                
                // Validar se os nós existem
                if (nodeIds.has(sourceNodeId) && nodeIds.has(targetNodeId)) {
                    elements.push({
                        data: {
                            id: `edge-ot-${index}`,
                            source: sourceNodeId,
                            target: targetNodeId,
                            type: 'organization-type'
                        }
                    });
                } else {
                    console.warn(`  ✗ Aresta ignorada (nós não existem): ${sourceNodeId} -> ${targetNodeId}`, edge);
                }
            } else {
                console.warn('  ✗ Aresta organization-type com IDs inválidos:', edge);
            }
        });
    } else {
        console.warn('Nenhuma aresta organization-type encontrada ou não é array');
    }
    
    // Filtrar nós isolados (sem arestas)
    const filteredElements = filterIsolatedNodes(elements);
    
    return filteredElements;
}

/**
 * Remove nós que não possuem nenhuma aresta
 */
function filterIsolatedNodes(elements) {
    // Identificar todos os nós que têm conexões
    const connectedNodeIds = new Set();
    
    elements.forEach(element => {
        if (element.data.source && element.data.target) {
            // É uma aresta
            connectedNodeIds.add(element.data.source);
            connectedNodeIds.add(element.data.target);
        }
    });
    
    // Filtrar elementos - manter apenas nós conectados e todas as arestas
    const filtered = elements.filter(element => {
        // Se for aresta, sempre manter
        if (element.data.source && element.data.target) {
            return true;
        }
        // Se for nó, manter apenas se estiver conectado
        return connectedNodeIds.has(element.data.id);
    });
    
    const removedCount = elements.length - filtered.length;
    
    return filtered;
}

/**
 * Mostra informações do nó selecionado
 */
function showNodeInfo(node) {
    selectedNode = node;
    const infoPanel = document.getElementById('node-info');
    const titleElement = document.getElementById('node-title');
    const contentElement = document.getElementById('info-content');
    
    // Definir título
    titleElement.textContent = node.data('label');
    
    // Construir conteúdo de propriedades
    const properties = node.data('properties');
    let html = '';
    
    for (const [key, value] of Object.entries(properties)) {
        // Ocultar campos de ID
        const isIdField = key.toLowerCase() === 'id' || 
                         key.toLowerCase() === 'member_id' || 
                         key.toLowerCase() === 'organization_id' || 
                         key.toLowerCase() === 'type_id' ||
                         key.toLowerCase().endsWith('_id');
        
        if (value !== null && value !== undefined && value !== '' && !isIdField) {
            html += `
                <div class="property">
                    <div class="property-label">${formatPropertyLabel(key)}</div>
                    <div class="property-value">${formatPropertyValue(value, key)}</div>
                </div>
            `;
        }
    }
    
    contentElement.innerHTML = html;
    
    // Mostrar painel
    infoPanel.classList.remove('hidden');
}

/**
 * Esconde o painel de informações
 */
function hideNodeInfo() {
    const infoPanel = document.getElementById('node-info');
    infoPanel.classList.add('hidden');
    selectedNode = null;
}

/**
 * Destaca as conexões do nó selecionado
 */
function highlightConnections(node) {
    // Remover destaque anterior
    cy.elements().removeClass('highlighted');
    
    // Destacar nó selecionado e suas arestas conectadas
    node.addClass('highlighted');
    const connectedEdges = node.connectedEdges();
    connectedEdges.addClass('highlighted');
    
    // Reduzir opacidade dos outros elementos
    cy.elements().not(node).not(connectedEdges).style('opacity', 0.3);
    node.connectedEdges().connectedNodes().style('opacity', 0.8);
    node.style('opacity', 1);
    connectedEdges.style('opacity', 1);
}

/**
 * Remove o destaque das conexões
 */
function clearHighlight() {
    cy.elements().removeClass('highlighted');
    cy.elements().style('opacity', 1);
}

/**
 * Formata o label da propriedade
 */
function formatPropertyLabel(key) {
    return key.replace(/_/g, ' ').toUpperCase();
}

/**
 * Formata o valor da propriedade
 */
function formatPropertyValue(value, key) {
    if (typeof value === 'object') {
        return JSON.stringify(value, null, 2);
    }
    
    // Tratar LinkedIn como link
    if (key && key.toLowerCase() === 'linkedin') {
        const linkedinUsername = String(value).trim();
        const linkedinUrl = `https://www.linkedin.com/in/${linkedinUsername}`;
        return `<a href="${linkedinUrl}" target="_blank" rel="noopener noreferrer" class="linkedin-link">${linkedinUsername}</a>`;
    }
    
    return String(value);
}

/**
 * Anima a entrada dos nós no grafo
 */
function animateGraphEntrance() {
    cy.nodes().forEach((node, index) => {
        node.style('opacity', 0);
        setTimeout(() => {
            node.animate({
                style: { 'opacity': 1 }
            }, {
                duration: 500,
                easing: 'ease-out'
            });
        }, index * 20);
    });
}

/**
 * Reaplica o layout do grafo
 */
function applyGraphLayout() {
    cy.layout({
        name: 'cose',
        animate: true,
        animationDuration: 1000,
        animationEasing: 'ease-in-out-cubic',
        
        nodeRepulsion: function(node) { return 8000; },
        nodeOverlap: 20,
        idealEdgeLength: function(edge) { return 100; },
        edgeElasticity: function(edge) { return 200; },
        
        componentSpacing: 150,
        gravity: 1,
        numIter: 1000,
        initialTemp: 200,
        coolingFactor: 0.95,
        minTemp: 1.0,
        
        randomize: false,
        fit: true,
        padding: 50,
        avoidOverlap: true
    }).run();
}

/**
 * Redimensiona o grafo quando a janela muda de tamanho
 */
window.addEventListener('resize', () => {
    if (cy) {
        cy.resize();
        cy.fit(null, 50); // Apenas ajusta o zoom, sem recalcular layout
    }
});
