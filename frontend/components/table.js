// Componente de visualização em tabela

/**
 * Inicializa a visualização em tabela
 */
function initTableView() {
    // Criar elementos da tabela se não existirem
    if (!document.getElementById('table-view')) {
        createTableView();
    }
    
    // Adicionar event listeners
    setupTableListeners();
}

/**
 * Cria a estrutura HTML da visualização em tabela
 */
function createTableView() {
    const container = document.getElementById('graph-container');
    
    const tableView = document.createElement('div');
    tableView.id = 'table-view';
    tableView.className = 'hidden';
    tableView.innerHTML = `
        <div id="table-container">
            <div id="table-header">
                <h2></h2>
                <button id="close-table" title="Voltar ao Grafo">&times;</button>
            </div>
            <table id="members-table">
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>LinkedIn</th>
                        <th>Organizações</th>
                    </tr>
                </thead>
                <tbody id="table-body">
                    <!-- Dados serão inseridos aqui -->
                </tbody>
            </table>
        </div>
    `;
    
    container.appendChild(tableView);
}

/**
 * Configura os event listeners da tabela
 */
function setupTableListeners() {
    const closeBtn = document.getElementById('close-table');
    if (closeBtn) {
        closeBtn.addEventListener('click', hideTableView);
    }
}

/**
 * Exibe a visualização em tabela
 */
function showTableView() {
    const tableView = document.getElementById('table-view');
    const graphView = document.getElementById('cy');
    
    if (!tableView || !graphData) {
        console.error('Visualização em tabela não disponível');
        return;
    }
    
    // Definir título da tabela
    const tableHeader = document.querySelector('#table-header h2');
    if (tableHeader) {
        const memberCount = graphData.node_members ? graphData.node_members.length : 0;
        tableHeader.textContent = `Membros (${memberCount})`;
    }
    
    // Renderizar dados na tabela
    renderTableData();
    
    // Esconder grafo e mostrar tabela
    if (graphView) graphView.style.display = 'none';
    tableView.classList.remove('hidden');
    
    // Atualizar botão ativo
    updateActiveLayoutButton('layout-table');
}

/**
 * Esconde a visualização em tabela
 */
function hideTableView() {
    const tableView = document.getElementById('table-view');
    const graphView = document.getElementById('cy');
    
    if (tableView) tableView.classList.add('hidden');
    if (graphView) graphView.style.display = 'block';
    
    // Resetar botão ativo para o último layout de grafo
    const activeButton = document.querySelector('#layout-controls button.active:not(#layout-table)');
    if (activeButton) {
        updateActiveLayoutButton(activeButton.id);
    }
}

/**
 * Renderiza os dados na tabela
 */
function renderTableData() {
    const tbody = document.getElementById('table-body');
    if (!tbody) return;
    
    // Limpar tabela
    tbody.innerHTML = '';
    
    // Verificar se há dados
    if (!graphData.node_members || graphData.node_members.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="no-data">Nenhum membro encontrado</td></tr>';
        return;
    }
    
    // Criar mapa de organizações por membro
    const memberOrganizations = getMemberOrganizations();
    
    // Criar mapa de nomes de organizações
    const orgNames = {};
    const orgUrls = {};
    if (graphData.node_organizations) {
        graphData.node_organizations.forEach(org => {
            orgNames[org.id] = org.label;
            orgUrls[org.id] = org.url;
        });
    }
    console.log(graphData.node_organizations);
    
    // Adicionar cada membro à tabela
    graphData.node_members.forEach(member => {
        const row = document.createElement('tr');
        
        // Coluna Nome
        const nameCell = document.createElement('td');
        if (member.name) {
            const nameLink = document.createElement('a');
            nameLink.href = '#';
            nameLink.className = 'member-name-link';
            nameLink.textContent = member.name;
            nameLink.title = 'Clique para ver no grafo';
            
            // Adicionar event listener para voltar ao grafo
            nameLink.addEventListener('click', function(e) {
                e.preventDefault();
                selectMemberInGraph(member.id);
            });
            
            nameCell.appendChild(nameLink);
        } else {
            nameCell.innerHTML = '<span class="no-data">Sem nome</span>';
        }
        row.appendChild(nameCell);
        
        // Coluna LinkedIn
        const linkedinCell = document.createElement('td');
        if (member.linkedin) {
            const link = document.createElement('a');
            link.href = `https://www.linkedin.com/in/${member.linkedin}`;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.textContent = 'Ver perfil';
            linkedinCell.appendChild(link);
        } else {
            linkedinCell.innerHTML = '<span class="no-data">Não disponível</span>';
        }
        row.appendChild(linkedinCell);
        
        // Coluna Organizações
        const orgsCell = document.createElement('td');
        const memberOrgs = memberOrganizations[member.id] || [];
        
        if (memberOrgs.length > 0) {
            memberOrgs.forEach(orgId => {
                const orgName = orgNames[orgId] || orgId;
                const orgUrl = orgUrls[orgId] || '';
                const tag = document.createElement('span');
                tag.className = 'org-tag';
                tag.textContent = orgName;
                if (orgUrl != '') {
                    const link = document.createElement('a');
                    link.href = orgUrl;
                    link.target = '_blank';
                    link.rel = 'noopener noreferrer';
                    link.appendChild(tag);
                    orgsCell.appendChild(link);
                } else {
                    orgsCell.appendChild(tag);
                }
            });
        } else {
            orgsCell.innerHTML = '<span class="no-data">Nenhuma</span>';
        }
        row.appendChild(orgsCell);
        
        tbody.appendChild(row);
    });
}

/**
 * Cria um mapa de organizações por membro
 */
function getMemberOrganizations() {
    const memberOrgs = {};
    
    if (!graphData.edge_members_organizations) {
        return memberOrgs;
    }
    
    graphData.edge_members_organizations.forEach(edge => {
        const memberId = edge.member_id;
        const orgId = edge.organization_id;
        
        if (!memberOrgs[memberId]) {
            memberOrgs[memberId] = [];
        }
        
        memberOrgs[memberId].push(orgId);
    });
    return memberOrgs;
}

/**
 * Seleciona um membro no grafo e volta à visualização do grafo
 * @param {string} memberId - ID do membro a ser selecionado
 */
function selectMemberInGraph(memberId) {
    // Voltar ao grafo
    hideTableView();
    
    // Verificar se o Cytoscape está disponível
    if (typeof cy === 'undefined' || !cy) {
        console.error('Grafo não está disponível');
        return;
    }
    
    // Construir o ID do nó (prefixado com "member-")
    const nodeId = `member-${memberId}`;
    
    // Encontrar o nó do membro
    const node = cy.getElementById(nodeId);
    
    if (node && node.length > 0) {
        // Centralizar e dar zoom no nó
        cy.animate({
            fit: {
                eles: node,
                padding: 100
            },
            duration: 500,
            easing: 'ease-out'
        });
        
        // Simular clique no nó (selecionar e mostrar informações)
        setTimeout(() => {
            node.select();
            if (typeof showNodeInfo === 'function') {
                showNodeInfo(node);
            }
            if (typeof highlightConnections === 'function') {
                highlightConnections(node);
            }
        }, 500);
    } else {
        console.warn('Nó do membro não encontrado:', nodeId);
    }
}

/**
 * Atualiza qual botão de layout está ativo
 */
function updateActiveLayoutButton(buttonId) {
    const buttons = document.querySelectorAll('#layout-controls button');
    buttons.forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeBtn = document.getElementById(buttonId);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
}
