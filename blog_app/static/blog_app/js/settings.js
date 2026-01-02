// Settings Page JavaScript

// Tab switching
document.querySelectorAll('.settings-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        document.querySelectorAll('.settings-tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.settings-tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(`${tab}Tab`).classList.add('active');
        
        // Load data for active tab
        if (tab === 'ollama') {
            loadOllamaSettings();
            loadActiveSettings();
        } else if (tab === 'agents') loadAgents();
        else if (tab === 'tasks') loadTasks();
        else if (tab === 'crews') loadCrews();
    });
});

// ==================== Ollama Testing ====================

const testConnectionBtn = document.getElementById('testConnectionBtn');
const fetchModelsBtn = document.getElementById('fetchModelsBtn');
const testModelBtn = document.getElementById('testModelBtn');
const testResults = document.getElementById('testResults');

// Load active settings info
async function loadActiveSettings() {
    try {
        const response = await fetch('/api/ollama-settings/active/');
        if (response.ok) {
            const settings = await response.json();
            testResults.innerHTML = `
                <div class="test-info">
                    <strong>Active Configuration:</strong> ${settings.name}<br>
                    <strong>Base URL:</strong> ${settings.base_url}<br>
                    <strong>Model:</strong> ${settings.model}<br>
                    <strong>Temperature:</strong> ${settings.temperature}
                </div>
            `;
        } else {
            testResults.innerHTML = '<div class="test-warning">No active Ollama configuration found. Please create and activate one.</div>';
        }
    } catch (error) {
        console.error('Error loading active settings:', error);
    }
}

// Test Connection
testConnectionBtn?.addEventListener('click', async () => {
    testConnectionBtn.disabled = true;
    testConnectionBtn.textContent = 'Testing...';
    testResults.innerHTML = '<div class="test-loading">Testing connection...</div>';
    
    try {
        const response = await fetch('/api/ollama-settings/test-connection/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCsrfToken(),
            },
        });
        
        const data = await response.json();
        
        if (data.success) {
            testResults.innerHTML = `
                <div class="test-success">
                    <strong>✓ Connection Successful!</strong><br>
                    ${data.message}<br><br>
                    <strong>Settings:</strong><br>
                    Base URL: ${data.settings.base_url}<br>
                    Model: ${data.settings.model}<br>
                    Temperature: ${data.settings.temperature}
                </div>
            `;
        } else {
            testResults.innerHTML = `
                <div class="test-error">
                    <strong>✗ Connection Failed</strong><br>
                    ${data.error}<br>
                    ${data.base_url ? `Base URL: ${data.base_url}` : ''}
                </div>
            `;
        }
    } catch (error) {
        testResults.innerHTML = `
            <div class="test-error">
                <strong>✗ Error</strong><br>
                ${error.message}
            </div>
        `;
    } finally {
        testConnectionBtn.disabled = false;
        testConnectionBtn.textContent = '🔌 Test Connection';
    }
});

// Fetch Models
fetchModelsBtn?.addEventListener('click', async () => {
    fetchModelsBtn.disabled = true;
    fetchModelsBtn.textContent = 'Fetching...';
    testResults.innerHTML = '<div class="test-loading">Fetching available models from Ollama...</div>';
    
    try {
        const response = await fetch('/api/ollama-settings/fetch-models/');
        const data = await response.json();
        
        if (data.success) {
            if (data.models && data.models.length > 0) {
                const modelsList = data.models.map(model => {
                    const sizeGB = (model.size / (1024 * 1024 * 1024)).toFixed(2);
                    return `
                        <div class="model-item">
                            <strong>${model.name}</strong>
                            <span class="model-size">${sizeGB} GB</span>
                            ${model.modified_at ? `<span class="model-date">Modified: ${new Date(model.modified_at).toLocaleDateString()}</span>` : ''}
                        </div>
                    `;
                }).join('');
                
                testResults.innerHTML = `
                    <div class="test-success">
                        <strong>✓ Found ${data.count} Model(s)</strong><br>
                        <div class="models-list">
                            ${modelsList}
                        </div>
                    </div>
                `;
            } else {
                testResults.innerHTML = `
                    <div class="test-warning">
                        <strong>No models found</strong><br>
                        You may need to pull models using: ollama pull &lt;model-name&gt;
                    </div>
                `;
            }
        } else {
            testResults.innerHTML = `
                <div class="test-error">
                    <strong>✗ Failed to Fetch Models</strong><br>
                    ${data.error}<br>
                    ${data.base_url ? `Base URL: ${data.base_url}` : ''}
                </div>
            `;
        }
    } catch (error) {
        testResults.innerHTML = `
            <div class="test-error">
                <strong>✗ Error</strong><br>
                ${error.message}
            </div>
        `;
    } finally {
        fetchModelsBtn.disabled = false;
        fetchModelsBtn.textContent = '📦 Fetch Available Models';
    }
});

// Test Model
testModelBtn?.addEventListener('click', async () => {
    testModelBtn.disabled = true;
    testModelBtn.textContent = 'Testing...';
    testResults.innerHTML = '<div class="test-loading">Testing model with a simple prompt...</div>';
    
    try {
        const response = await fetch('/api/ollama-settings/test-model/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCsrfToken(),
            },
        });
        
        const data = await response.json();
        
        if (data.success) {
            testResults.innerHTML = `
                <div class="test-success">
                    <strong>✓ Model Test Successful!</strong><br>
                    <strong>Model:</strong> ${data.model}<br>
                    <strong>Response:</strong> "${data.response}"<br>
                    <strong>Base URL:</strong> ${data.base_url}
                </div>
            `;
        } else {
            testResults.innerHTML = `
                <div class="test-error">
                    <strong>✗ Model Test Failed</strong><br>
                    ${data.error}<br>
                    Model: ${data.model || 'N/A'}<br>
                    ${data.base_url ? `Base URL: ${data.base_url}` : ''}
                </div>
            `;
        }
    } catch (error) {
        testResults.innerHTML = `
            <div class="test-error">
                <strong>✗ Error</strong><br>
                ${error.message}
            </div>
        `;
    } finally {
        testModelBtn.disabled = false;
        testModelBtn.textContent = '🧪 Test Active Model';
    }
});

// ==================== Ollama Settings ====================

const ollamaFormModal = document.getElementById('ollamaFormModal');
const ollamaForm = document.getElementById('ollamaForm');
const closeOllamaFormModal = document.getElementById('closeOllamaFormModal');
const cancelOllamaForm = document.getElementById('cancelOllamaForm');
const ollamaSettingsList = document.getElementById('ollamaSettingsList');

// Load Ollama Settings
async function loadOllamaSettings() {
    try {
        const response = await fetch('/api/ollama-settings/');
        const settings = await response.json();
        ollamaSettingsList.innerHTML = settings.map(setting => `
            <div class="settings-item-card">
                <div class="item-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                        <line x1="8" y1="21" x2="16" y2="21"></line>
                        <line x1="12" y1="17" x2="12" y2="21"></line>
                    </svg>
                </div>
                <div class="item-header">
                    <div>
                        <h5>${setting.name} ${setting.is_active ? '<span class="badge active">Active</span>' : ''}</h5>
                        <p class="item-subtitle">Model: ${setting.model}</p>
                    </div>
                </div>
                <div class="item-details">
                    <div class="detail-item">
                        <span class="detail-label">Base URL:</span>
                        <span class="detail-value">${setting.base_url}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Temperature:</span>
                        <span class="detail-value">${setting.temperature}</span>
                    </div>
                </div>
                <div class="item-actions">
                    <button class="btn-edit" onclick="editOllamaSettings(${setting.id})">Edit</button>
                    <button class="btn-remove" onclick="deleteOllamaSettings(${setting.id})">Remove</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading Ollama settings:', error);
    }
}

// Add Ollama Settings
document.getElementById('addOllamaBtn')?.addEventListener('click', () => {
    document.getElementById('ollamaFormTitle').textContent = 'Add Ollama Configuration';
    document.getElementById('ollamaId').value = '';
    ollamaForm.reset();
    document.getElementById('ollamaBaseUrl').value = 'http://localhost:11434';
    document.getElementById('ollamaModel').value = 'llama3';
    document.getElementById('ollamaTemperature').value = '0.7';
    ollamaFormModal.classList.remove('hidden');
});

// Edit Ollama Settings
window.editOllamaSettings = async function(settingsId) {
    try {
        const response = await fetch(`/api/ollama-settings/${settingsId}/`);
        const setting = await response.json();
        document.getElementById('ollamaFormTitle').textContent = 'Edit Ollama Configuration';
        document.getElementById('ollamaId').value = setting.id;
        document.getElementById('ollamaName').value = setting.name;
        document.getElementById('ollamaBaseUrl').value = setting.base_url;
        document.getElementById('ollamaModel').value = setting.model;
        document.getElementById('ollamaTemperature').value = setting.temperature;
        document.getElementById('ollamaIsActive').checked = setting.is_active;
        ollamaFormModal.classList.remove('hidden');
    } catch (error) {
        console.error('Error loading Ollama settings:', error);
    }
};

// Delete Ollama Settings
window.deleteOllamaSettings = async function(settingsId) {
    if (!confirm('Are you sure you want to delete this Ollama configuration?')) return;
    try {
        const response = await fetch(`/api/ollama-settings/${settingsId}/`, {
            method: 'DELETE',
            headers: { 'X-CSRFToken': getCsrfToken() },
        });
        if (response.ok) {
            loadOllamaSettings();
        }
    } catch (error) {
        console.error('Error deleting Ollama settings:', error);
    }
};

// Save Ollama Settings
ollamaForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const settingsId = document.getElementById('ollamaId').value;
    const data = {
        name: document.getElementById('ollamaName').value,
        base_url: document.getElementById('ollamaBaseUrl').value,
        model: document.getElementById('ollamaModel').value,
        temperature: parseFloat(document.getElementById('ollamaTemperature').value),
        is_active: document.getElementById('ollamaIsActive').checked,
    };
    
    try {
        const url = settingsId ? `/api/ollama-settings/${settingsId}/` : '/api/ollama-settings/';
        const method = settingsId ? 'PUT' : 'POST';
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCsrfToken(),
            },
            body: JSON.stringify(data),
        });
        
        if (response.ok) {
            ollamaFormModal.classList.add('hidden');
            loadOllamaSettings();
        } else {
            const error = await response.json();
            alert('Error: ' + JSON.stringify(error));
        }
    } catch (error) {
        console.error('Error saving Ollama settings:', error);
    }
});

closeOllamaFormModal?.addEventListener('click', () => {
    ollamaFormModal.classList.add('hidden');
});

cancelOllamaForm?.addEventListener('click', () => {
    ollamaFormModal.classList.add('hidden');
});

// ==================== Agent Management ====================

const agentsList = document.getElementById('agentsList');
const agentFormModal = document.getElementById('agentFormModal');
const agentForm = document.getElementById('agentForm');
const closeAgentFormModal = document.getElementById('closeAgentFormModal');
const cancelAgentForm = document.getElementById('cancelAgentForm');

// Load agents
async function loadAgents() {
    try {
        const response = await fetch('/api/agents/');
        const agents = await response.json();
        agentsList.innerHTML = agents.map(agent => `
            <div class="settings-item-card">
                <div class="item-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                </div>
                <div class="item-header">
                    <div>
                        <h5>${agent.name} ${agent.is_active ? '<span class="badge active">Active</span>' : '<span class="badge inactive">Inactive</span>'}</h5>
                        <p class="item-subtitle">${agent.role}</p>
                    </div>
                </div>
                <div class="item-details">
                    <div class="detail-item">
                        <span class="detail-label">Goal:</span>
                        <span class="detail-value">${agent.goal.substring(0, 100)}${agent.goal.length > 100 ? '...' : ''}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Tasks:</span>
                        <span class="detail-value">${agent.tasks_count || 0}</span>
                    </div>
                </div>
                <div class="item-actions">
                    <button class="btn-edit" onclick="editAgent(${agent.id})">Edit</button>
                    <button class="btn-remove" onclick="deleteAgent(${agent.id})">Remove</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading agents:', error);
    }
}

// Add Agent
document.getElementById('addAgentBtn')?.addEventListener('click', () => {
    document.getElementById('agentFormTitle').textContent = 'Add Agent';
    document.getElementById('agentId').value = '';
    agentForm.reset();
    agentFormModal.classList.remove('hidden');
});

// Edit Agent
window.editAgent = async function(agentId) {
    try {
        const response = await fetch(`/api/agents/${agentId}/`);
        const agent = await response.json();
        document.getElementById('agentFormTitle').textContent = 'Edit Agent';
        document.getElementById('agentId').value = agent.id;
        document.getElementById('agentName').value = agent.name;
        document.getElementById('agentRole').value = agent.role;
        document.getElementById('agentGoal').value = agent.goal;
        document.getElementById('agentBackstory').value = agent.backstory;
        document.getElementById('agentOrder').value = agent.order;
        document.getElementById('agentIsActive').checked = agent.is_active;
        agentFormModal.classList.remove('hidden');
    } catch (error) {
        console.error('Error loading agent:', error);
    }
};

// Delete Agent
window.deleteAgent = async function(agentId) {
    if (!confirm('Are you sure you want to delete this agent? This will also delete all associated tasks.')) return;
    try {
        const response = await fetch(`/api/agents/${agentId}/`, {
            method: 'DELETE',
            headers: { 'X-CSRFToken': getCsrfToken() },
        });
        if (response.ok) {
            loadAgents();
            loadTasks();
            loadCrews();
        }
    } catch (error) {
        console.error('Error deleting agent:', error);
    }
};

// Save Agent
agentForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const agentId = document.getElementById('agentId').value;
    const data = {
        name: document.getElementById('agentName').value,
        role: document.getElementById('agentRole').value,
        goal: document.getElementById('agentGoal').value,
        backstory: document.getElementById('agentBackstory').value,
        order: parseInt(document.getElementById('agentOrder').value),
        is_active: document.getElementById('agentIsActive').checked,
    };
    
    try {
        const url = agentId ? `/api/agents/${agentId}/` : '/api/agents/';
        const method = agentId ? 'PUT' : 'POST';
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCsrfToken(),
            },
            body: JSON.stringify(data),
        });
        
        if (response.ok) {
            agentFormModal.classList.add('hidden');
            loadAgents();
            loadCrews();
        } else {
            const error = await response.json();
            alert('Error: ' + JSON.stringify(error));
        }
    } catch (error) {
        console.error('Error saving agent:', error);
    }
});

closeAgentFormModal?.addEventListener('click', () => {
    agentFormModal.classList.add('hidden');
});

cancelAgentForm?.addEventListener('click', () => {
    agentFormModal.classList.add('hidden');
});

// ==================== Task Management ====================

const tasksList = document.getElementById('tasksList');
const taskFormModal = document.getElementById('taskFormModal');
const taskForm = document.getElementById('taskForm');
const closeTaskFormModal = document.getElementById('closeTaskFormModal');
const cancelTaskForm = document.getElementById('cancelTaskForm');

// Load tasks
async function loadTasks() {
    try {
        const response = await fetch('/api/tasks/');
        const tasks = await response.json();
        tasksList.innerHTML = tasks.map(task => `
            <div class="settings-item-card">
                <div class="item-icon document">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                    </svg>
                </div>
                <div class="item-header">
                    <div>
                        <h5>${task.name} ${task.is_active ? '<span class="badge active">Active</span>' : '<span class="badge inactive">Inactive</span>'}</h5>
                        <p class="item-subtitle">Agent: ${task.agent_name}</p>
                    </div>
                </div>
                <div class="item-details">
                    <div class="detail-item">
                        <span class="detail-label">Description:</span>
                        <span class="detail-value">${task.description.substring(0, 100)}${task.description.length > 100 ? '...' : ''}</span>
                    </div>
                    ${task.depends_on_name ? `<div class="detail-item">
                        <span class="detail-label">Depends on:</span>
                        <span class="detail-value">${task.depends_on_name}</span>
                    </div>` : ''}
                </div>
                <div class="item-actions">
                    <button class="btn-edit" onclick="editTask(${task.id})">Edit</button>
                    <button class="btn-remove" onclick="deleteTask(${task.id})">Remove</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading tasks:', error);
    }
}

// Add Task
document.getElementById('addTaskBtn')?.addEventListener('click', async () => {
    document.getElementById('taskFormTitle').textContent = 'Add Task';
    document.getElementById('taskId').value = '';
    taskForm.reset();
    
    // Load agents for dropdown
    const response = await fetch('/api/agents/');
    const agents = await response.json();
    const agentSelect = document.getElementById('taskAgent');
    agentSelect.innerHTML = agents.filter(a => a.is_active).map(a => 
        `<option value="${a.id}">${a.name} (${a.role})</option>`
    ).join('');
    
    // Load tasks for dependency dropdown
    const taskResponse = await fetch('/api/tasks/');
    const tasks = await taskResponse.json();
    const dependsSelect = document.getElementById('taskDependsOn');
    dependsSelect.innerHTML = '<option value="">None</option>' + 
        tasks.filter(t => t.is_active).map(t => 
            `<option value="${t.id}">${t.name}</option>`
        ).join('');
    
    taskFormModal.classList.remove('hidden');
});

// Edit Task
window.editTask = async function(taskId) {
    try {
        const response = await fetch(`/api/tasks/${taskId}/`);
        const task = await response.json();
        document.getElementById('taskFormTitle').textContent = 'Edit Task';
        document.getElementById('taskId').value = task.id;
        document.getElementById('taskName').value = task.name;
        document.getElementById('taskDescription').value = task.description;
        document.getElementById('taskExpectedOutput').value = task.expected_output;
        document.getElementById('taskOrder').value = task.order;
        document.getElementById('taskIsActive').checked = task.is_active;
        
        // Load agents
        const agentResponse = await fetch('/api/agents/');
        const agents = await agentResponse.json();
        const agentSelect = document.getElementById('taskAgent');
        agentSelect.innerHTML = agents.filter(a => a.is_active).map(a => 
            `<option value="${a.id}" ${a.id === task.agent ? 'selected' : ''}>${a.name} (${a.role})</option>`
        ).join('');
        
        // Load tasks for dependency
        const taskResponse = await fetch('/api/tasks/');
        const tasks = await taskResponse.json();
        const dependsSelect = document.getElementById('taskDependsOn');
        dependsSelect.innerHTML = '<option value="">None</option>' + 
            tasks.filter(t => t.is_active && t.id !== task.id).map(t => 
                `<option value="${t.id}" ${t.id === task.depends_on ? 'selected' : ''}>${t.name}</option>`
            ).join('');
        
        taskFormModal.classList.remove('hidden');
    } catch (error) {
        console.error('Error loading task:', error);
    }
};

// Delete Task
window.deleteTask = async function(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
        const response = await fetch(`/api/tasks/${taskId}/`, {
            method: 'DELETE',
            headers: { 'X-CSRFToken': getCsrfToken() },
        });
        if (response.ok) {
            loadTasks();
            loadCrews();
        }
    } catch (error) {
        console.error('Error deleting task:', error);
    }
};

// Save Task
taskForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const taskId = document.getElementById('taskId').value;
    const dependsOn = document.getElementById('taskDependsOn').value;
    const data = {
        name: document.getElementById('taskName').value,
        description: document.getElementById('taskDescription').value,
        agent: parseInt(document.getElementById('taskAgent').value),
        expected_output: document.getElementById('taskExpectedOutput').value,
        order: parseInt(document.getElementById('taskOrder').value),
        is_active: document.getElementById('taskIsActive').checked,
        depends_on: dependsOn ? parseInt(dependsOn) : null,
    };
    
    try {
        const url = taskId ? `/api/tasks/${taskId}/` : '/api/tasks/';
        const method = taskId ? 'PUT' : 'POST';
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCsrfToken(),
            },
            body: JSON.stringify(data),
        });
        
        if (response.ok) {
            taskFormModal.classList.add('hidden');
            loadTasks();
            loadCrews();
        } else {
            const error = await response.json();
            alert('Error: ' + JSON.stringify(error));
        }
    } catch (error) {
        console.error('Error saving task:', error);
    }
});

closeTaskFormModal?.addEventListener('click', () => {
    taskFormModal.classList.add('hidden');
});

cancelTaskForm?.addEventListener('click', () => {
    taskFormModal.classList.add('hidden');
});

// ==================== Crew Management ====================

const crewsList = document.getElementById('crewsList');
const crewFormModal = document.getElementById('crewFormModal');
const crewForm = document.getElementById('crewForm');
const closeCrewFormModal = document.getElementById('closeCrewFormModal');
const cancelCrewForm = document.getElementById('cancelCrewForm');

// Load crews
async function loadCrews() {
    try {
        const response = await fetch('/api/crew-configs/');
        const crews = await response.json();
        crewsList.innerHTML = crews.map(crew => `
            <div class="settings-item-card">
                <div class="item-icon card">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                </div>
                <div class="item-header">
                    <div>
                        <h5>${crew.name} ${crew.is_default ? '<span class="badge default">Default</span>' : ''}</h5>
                        <p class="item-subtitle">${crew.description || 'No description'}</p>
                    </div>
                </div>
                <div class="item-details">
                    <div class="detail-item">
                        <span class="detail-label">Process:</span>
                        <span class="detail-value">${crew.process_type}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Agents:</span>
                        <span class="detail-value">${crew.agents_detail ? crew.agents_detail.length : 0}</span>
                    </div>
                </div>
                <div class="item-actions">
                    <button class="btn-edit" onclick="editCrew(${crew.id})">Edit</button>
                    <button class="btn-remove" onclick="deleteCrew(${crew.id})">Remove</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading crews:', error);
    }
}

// Add Crew
document.getElementById('addCrewBtn')?.addEventListener('click', async () => {
    document.getElementById('crewFormTitle').textContent = 'Add Crew Configuration';
    document.getElementById('crewId').value = '';
    crewForm.reset();
    
    // Load agents for checkbox list
    const response = await fetch('/api/agents/');
    const agents = await response.json();
    const agentsList = document.getElementById('crewAgentsList');
    agentsList.innerHTML = agents.filter(a => a.is_active).map(a => `
        <label class="checkbox-label">
            <input type="checkbox" value="${a.id}" name="crewAgents">
            ${a.name} (${a.role})
        </label>
    `).join('');
    
    crewFormModal.classList.remove('hidden');
});

// Edit Crew
window.editCrew = async function(crewId) {
    try {
        const response = await fetch(`/api/crew-configs/${crewId}/`);
        const crew = await response.json();
        document.getElementById('crewFormTitle').textContent = 'Edit Crew Configuration';
        document.getElementById('crewId').value = crew.id;
        document.getElementById('crewName').value = crew.name;
        document.getElementById('crewDescription').value = crew.description || '';
        document.getElementById('crewProcessType').value = crew.process_type;
        document.getElementById('crewIsDefault').checked = crew.is_default;
        
        // Load agents
        const agentResponse = await fetch('/api/agents/');
        const agents = await agentResponse.json();
        const agentsList = document.getElementById('crewAgentsList');
        const selectedAgentIds = crew.agents_detail?.map(a => a.id) || [];
        agentsList.innerHTML = agents.filter(a => a.is_active).map(a => `
            <label class="checkbox-label">
                <input type="checkbox" value="${a.id}" name="crewAgents" ${selectedAgentIds.includes(a.id) ? 'checked' : ''}>
                ${a.name} (${a.role})
            </label>
        `).join('');
        
        crewFormModal.classList.remove('hidden');
    } catch (error) {
        console.error('Error loading crew:', error);
    }
};

// Delete Crew
window.deleteCrew = async function(crewId) {
    if (!confirm('Are you sure you want to delete this crew configuration?')) return;
    try {
        const response = await fetch(`/api/crew-configs/${crewId}/`, {
            method: 'DELETE',
            headers: { 'X-CSRFToken': getCsrfToken() },
        });
        if (response.ok) {
            loadCrews();
        }
    } catch (error) {
        console.error('Error deleting crew:', error);
    }
};

// Save Crew
crewForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const crewId = document.getElementById('crewId').value;
    const selectedAgents = Array.from(document.querySelectorAll('input[name="crewAgents"]:checked')).map(cb => parseInt(cb.value));
    const data = {
        name: document.getElementById('crewName').value,
        description: document.getElementById('crewDescription').value,
        process_type: document.getElementById('crewProcessType').value,
        is_default: document.getElementById('crewIsDefault').checked,
        agents: selectedAgents,
    };
    
    try {
        const url = crewId ? `/api/crew-configs/${crewId}/` : '/api/crew-configs/';
        const method = crewId ? 'PUT' : 'POST';
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCsrfToken(),
            },
            body: JSON.stringify(data),
        });
        
        if (response.ok) {
            crewFormModal.classList.add('hidden');
            loadCrews();
        } else {
            const error = await response.json();
            alert('Error: ' + JSON.stringify(error));
        }
    } catch (error) {
        console.error('Error saving crew:', error);
    }
});

closeCrewFormModal?.addEventListener('click', () => {
    crewFormModal.classList.add('hidden');
});

cancelCrewForm?.addEventListener('click', () => {
    crewFormModal.classList.add('hidden');
});

// Get CSRF token
function getCsrfToken() {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'csrftoken') {
            return value;
        }
    }
    return '';
}

// Initialize - load default tab
window.addEventListener('load', () => {
    loadOllamaSettings();
    loadActiveSettings();
    loadAgents();
    loadTasks();
    loadCrews();
});

