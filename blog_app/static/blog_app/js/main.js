// DOM elements
const blogForm = document.getElementById('blogForm');
const audienceInput = document.getElementById('audienceInput');
const audienceTags = document.getElementById('audienceTags');
const keyPoints = document.getElementById('keyPoints');
const examples = document.getElementById('examples');
const tone = document.getElementById('tone');
const length = document.getElementById('length');
const generateBtn = document.getElementById('generateBtn');
const stopBtn = document.getElementById('stopBtn');
const loadingSection = document.getElementById('loadingSection');
const resultSection = document.getElementById('resultSection');
const errorSection = document.getElementById('errorSection');
const postContent = document.getElementById('postContent');
const postTitle = document.getElementById('postTitle');
const topicPreview = document.getElementById('topicPreview');
const savedIndicator = document.getElementById('savedIndicator');
const wordCount = document.getElementById('wordCount');
const readTime = document.getElementById('readTime');

// Feature buttons
const copyBtn = document.getElementById('copyBtn');
const downloadBtn = document.getElementById('downloadBtn');
const exportBtn = document.getElementById('exportBtn');
const shareBtn = document.getElementById('shareBtn');
const clearBtn = document.getElementById('clearBtn');
const templateBtn = document.getElementById('templateBtn');
const exportModal = document.getElementById('exportModal');
const closeExportModal = document.getElementById('closeExportModal');

// Status elements
const researcherStatus = document.getElementById('researcherStatus');
const writerStatus = document.getElementById('writerStatus');
const editorStatus = document.getElementById('editorStatus');

// Character counters
const audienceCount = document.getElementById('audienceCount');
const keyPointsCount = document.getElementById('keyPointsCount');
const examplesCount = document.getElementById('examplesCount');

let pollInterval = null;
let currentPostId = null;
let audienceTagList = [];
let currentContent = '';

// Initialize character counters
keyPoints.addEventListener('input', () => {
    const count = keyPoints.value.length;
    keyPointsCount.textContent = count;
    keyPointsCount.style.color = count > 1000 ? '#dc2626' : '#94a3b8';
    updateTopicPreview();
});

examples.addEventListener('input', () => {
    const count = examples.value.length;
    examplesCount.textContent = count;
    examplesCount.style.color = count > 1000 ? '#dc2626' : '#94a3b8';
});

// Tag input handling
audienceInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && audienceInput.value.trim() && audienceTagList.length < 10) {
        e.preventDefault();
        addTag(audienceInput.value.trim());
        audienceInput.value = '';
        updateAudienceCount();
    }
});

function addTag(tagText) {
    if (audienceTagList.length >= 10) return;
    if (audienceTagList.includes(tagText)) return;
    
    audienceTagList.push(tagText);
    renderTags();
}

function removeTag(tagText) {
    audienceTagList = audienceTagList.filter(tag => tag !== tagText);
    renderTags();
    updateAudienceCount();
}

function renderTags() {
    audienceTags.innerHTML = audienceTagList.map(tag => `
        <span class="tag">
            ${tag}
            <span class="tag-remove" onclick="removeTag('${tag.replace(/'/g, "\\'")}')">×</span>
        </span>
    `).join('');
    updateAudienceCount();
}

function updateAudienceCount() {
    const count = audienceTagList.length;
    audienceCount.textContent = count;
    audienceCount.style.color = count >= 10 ? '#dc2626' : '#94a3b8';
}

function updateTopicPreview() {
    const preview = keyPoints.value.substring(0, 40) || 'your topic';
    topicPreview.textContent = preview.length < 40 ? preview : preview + '...';
}

// Word count and reading time
function updateStats(content) {
    const text = content.replace(/<[^>]*>/g, '').trim();
    const words = text.split(/\s+/).filter(word => word.length > 0).length;
    const readingTime = Math.ceil(words / 200); // Average reading speed: 200 words/min
    
    wordCount.textContent = `${words} words`;
    readTime.textContent = `${readingTime} min read`;
}

// Copy to clipboard
copyBtn.addEventListener('click', async () => {
    if (!currentContent) return;
    
    const text = postContent.innerText || postContent.textContent;
    try {
        await navigator.clipboard.writeText(text);
        copyBtn.textContent = '✓ Copied';
        setTimeout(() => {
            copyBtn.textContent = '📋';
        }, 2000);
    } catch (err) {
        console.error('Failed to copy:', err);
    }
});

// Download functionality
downloadBtn.addEventListener('click', () => {
    if (!currentContent) return;
    
    const text = postContent.innerText || postContent.textContent;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${postTitle.textContent.replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

// Export modal
exportBtn.addEventListener('click', () => {
    exportModal.classList.remove('hidden');
});

closeExportModal.addEventListener('click', () => {
    exportModal.classList.add('hidden');
});

exportModal.addEventListener('click', (e) => {
    if (e.target === exportModal) {
        exportModal.classList.add('hidden');
    }
});

// Export options
document.getElementById('exportMarkdown').addEventListener('click', () => {
    const content = postContent.innerHTML;
    const markdown = convertToMarkdown(content);
    downloadFile(markdown, `${postTitle.textContent.replace(/\s+/g, '-')}.md`, 'text/markdown');
    exportModal.classList.add('hidden');
});

document.getElementById('exportText').addEventListener('click', () => {
    const text = postContent.innerText || postContent.textContent;
    downloadFile(text, `${postTitle.textContent.replace(/\s+/g, '-')}.txt`, 'text/plain');
    exportModal.classList.add('hidden');
});

document.getElementById('exportHTML').addEventListener('click', () => {
    const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${postTitle.textContent}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.8; }
        h1, h2, h3 { color: #0f172a; }
        p { margin-bottom: 16px; }
    </style>
</head>
<body>
    <h1>${postTitle.textContent}</h1>
    ${postContent.innerHTML}
</body>
</html>`;
    downloadFile(html, `${postTitle.textContent.replace(/\s+/g, '-')}.html`, 'text/html');
    exportModal.classList.add('hidden');
});

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function convertToMarkdown(html) {
    let md = html;
    md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n');
    md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n');
    md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n');
    md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
    md = md.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
    md = md.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
    md = md.replace(/<u[^>]*>(.*?)<\/u>/gi, '$1');
    md = md.replace(/<br\s*\/?>/gi, '\n');
    md = md.replace(/<[^>]+>/g, '');
    md = md.replace(/\n{3,}/g, '\n\n');
    return md.trim();
}

// Share functionality
shareBtn.addEventListener('click', async () => {
    if (!currentContent) return;
    
    const text = postTitle.textContent + '\n\n' + (postContent.innerText || postContent.textContent);
    
    if (navigator.share) {
        try {
            await navigator.share({
                title: postTitle.textContent,
                text: text.substring(0, 500),
            });
        } catch (err) {
            console.log('Share cancelled');
        }
    } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(text);
        shareBtn.textContent = '✓ Shared';
        setTimeout(() => {
            shareBtn.textContent = 'Share';
        }, 2000);
    }
});

// Clear form
clearBtn.addEventListener('click', () => {
    if (confirm('Clear all form data?')) {
        keyPoints.value = '';
        examples.value = '';
        audienceTagList = [];
        renderTags();
        updateAudienceCount();
        keyPointsCount.textContent = '0';
        examplesCount.textContent = '0';
        updateTopicPreview();
    }
});

// Template functionality
templateBtn.addEventListener('click', () => {
    const templates = {
        'Tech Blog': {
            keyPoints: 'Latest technology trends, innovations, and best practices',
            examples: 'AI, cloud computing, cybersecurity, software development',
            tone: 'informative',
            audience: ['Developers', 'Tech Enthusiasts', 'IT Professionals']
        },
        'Marketing': {
            keyPoints: 'Digital marketing strategies, SEO, content marketing, social media',
            examples: 'Content marketing, email campaigns, social media trends',
            tone: 'professional',
            audience: ['Marketers', 'Business Owners', 'Content Creators']
        },
        'Design': {
            keyPoints: 'UI/UX design principles, trends, tools, and best practices',
            examples: 'Design systems, user experience, visual design trends',
            tone: 'friendly',
            audience: ['Designers', 'UI/UX Professionals', 'Creatives']
        }
    };
    
    const templateNames = Object.keys(templates);
    const selected = prompt(`Choose template:\n${templateNames.map((t, i) => `${i + 1}. ${t}`).join('\n')}`);
    const index = parseInt(selected) - 1;
    
    if (index >= 0 && index < templateNames.length) {
        const template = templates[templateNames[index]];
        keyPoints.value = template.keyPoints;
        examples.value = template.examples;
        tone.value = template.tone;
        template.audience.forEach(tag => addTag(tag));
        updateTopicPreview();
        keyPointsCount.textContent = keyPoints.value.length;
        examplesCount.textContent = examples.value.length;
    }
});

// Form submission handler
blogForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const topic = keyPoints.value.trim() || 'Blog Post';
    
    hideAllSections();
    showLoading();
    
    generateBtn.classList.add('hidden');
    stopBtn.classList.remove('hidden');
    
    disableForm();
    
    try {
        const crewConfigSelect = document.getElementById('crewConfig');
        const formData = {
            topic: topic,
            subtitle: `Write a blog post about ${topic}`,
            target_audience: audienceTagList,
            key_points: keyPoints.value.trim(),
            examples: examples.value.trim(),
            tone: tone.value,
            crew_config_id: crewConfigSelect.value ? parseInt(crewConfigSelect.value) : null,
        };
        
        const response = await fetch('/api/generate-post/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCsrfToken(),
            },
            body: JSON.stringify(formData),
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to start blog post generation');
        }
        
        const data = await response.json();
        currentPostId = data.post_id;
        
        startPolling(currentPostId);
        updateAgentStatus('researcher', 'active');
        
    } catch (error) {
        showError(error.message);
        resetForm();
    }
});

// Stop button handler
stopBtn.addEventListener('click', () => {
    if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
    }
    resetForm();
    showError('Generation stopped by user');
});

// Poll for blog post status
function startPolling(postId) {
    if (pollInterval) {
        clearInterval(pollInterval);
    }
    
    pollInterval = setInterval(async () => {
        try {
            const response = await fetch(`/api/post/${postId}/`);
            if (!response.ok) {
                throw new Error('Failed to fetch post status');
            }
            
            const data = await response.json();
            
            if (data.status === 'processing') {
                if (!researcherStatus.textContent.includes('Completed')) {
                    updateAgentStatus('researcher', 'active');
                }
                setTimeout(() => {
                    if (!writerStatus.textContent.includes('Completed')) {
                        updateAgentStatus('writer', 'active');
                    }
                }, 3000);
                setTimeout(() => {
                    if (!editorStatus.textContent.includes('Completed')) {
                        updateAgentStatus('editor', 'active');
                    }
                }, 6000);
            } else if (data.status === 'completed') {
                clearInterval(pollInterval);
                showResult(data);
                resetForm();
            } else if (data.status === 'failed') {
                clearInterval(pollInterval);
                showError(data.content || 'Blog post generation failed');
                resetForm();
            }
            
        } catch (error) {
            clearInterval(pollInterval);
            showError(error.message);
            resetForm();
        }
    }, 2000);
}

// Update agent status display
function updateAgentStatus(agent, status) {
    const statusMap = {
        researcher: { element: researcherStatus, icon: '🔍' },
        writer: { element: writerStatus, icon: '✍️' },
        editor: { element: editorStatus, icon: '📝' },
    };
    
    const agentInfo = statusMap[agent];
    if (!agentInfo) return;
    
    const statusText = {
        'waiting': 'Waiting...',
        'active': 'Working...',
        'completed': 'Done ✓',
    };
    
    const agentName = agent.charAt(0).toUpperCase() + agent.slice(1);
    agentInfo.element.textContent = `${agentInfo.icon} ${statusText[status] || statusText.waiting}`;
}

// Show result
function showResult(data) {
    hideAllSections();
    resultSection.classList.remove('hidden');
    
    const content = data.content || '';
    const titleMatch = content.match(/^#\s*(.+)$/m) || content.match(/^(.+)$/m);
    const title = titleMatch ? titleMatch[1].trim() : data.topic;
    
    postTitle.textContent = title;
    currentPostId = data.id;
    
    let formattedContent = content;
    formattedContent = formattedContent.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    formattedContent = formattedContent.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    formattedContent = formattedContent.replace(/^# (.+)$/gm, '<h1>$1</h1>');
    
    formattedContent = formattedContent.split(/\n\n+/).map(para => {
        if (para.trim() && !para.match(/^<h[1-3]>/)) {
            return `<p>${para.trim().replace(/\n/g, '<br>')}</p>`;
        }
        return para;
    }).join('\n');
    
    postContent.innerHTML = formattedContent;
    currentContent = formattedContent;
    
    updateStats(formattedContent);
    savedIndicator.textContent = '✓';
    savedIndicator.style.color = '#10b981';
    
    // Show save button
    showSaveButton();
    
    document.querySelector('.editor-container').scrollTop = 0;
}

// Save button functionality
function showSaveButton() {
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
        saveBtn.classList.remove('hidden');
    }
}

async function saveCurrentPost() {
    if (!currentPostId) return;
    
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving...';
    }
    
    try {
        const response = await fetch(`/api/post/${currentPostId}/save/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCsrfToken(),
            },
            body: JSON.stringify({
                title: postTitle.textContent
            }),
        });
        
        if (response.ok) {
            savedIndicator.textContent = '✓ Saved';
            savedIndicator.style.color = '#10b981';
            if (saveBtn) {
                saveBtn.textContent = '✓ Saved';
                saveBtn.disabled = true;
                saveBtn.style.background = '#10b981';
            }
        } else {
            alert('Failed to save post');
        }
    } catch (error) {
        console.error('Error saving post:', error);
        alert('Error saving post');
    } finally {
        if (saveBtn && !saveBtn.disabled) {
            setTimeout(() => {
                saveBtn.disabled = false;
                saveBtn.textContent = 'Save';
                saveBtn.style.background = '';
            }, 2000);
        }
    }
}

// Show error
function showError(message) {
    hideAllSections();
    errorSection.classList.remove('hidden');
    document.getElementById('errorText').textContent = message;
}

// Show loading
function showLoading() {
    hideAllSections();
    loadingSection.classList.remove('hidden');
    
    updateAgentStatus('researcher', 'waiting');
    updateAgentStatus('writer', 'waiting');
    updateAgentStatus('editor', 'waiting');
}

// Hide all sections
function hideAllSections() {
    loadingSection.classList.add('hidden');
    errorSection.classList.add('hidden');
}

// Disable form
function disableForm() {
    audienceInput.disabled = true;
    keyPoints.disabled = true;
    examples.disabled = true;
    tone.disabled = true;
    length.disabled = true;
}

// Enable form
function enableForm() {
    audienceInput.disabled = false;
    keyPoints.disabled = false;
    examples.disabled = false;
    tone.disabled = false;
    length.disabled = false;
}

// Reset form
function resetForm() {
    generateBtn.classList.remove('hidden');
    stopBtn.classList.add('hidden');
    generateBtn.disabled = false;
    currentPostId = null;
    enableForm();
    
    if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
    }
}

// Retry button
document.getElementById('retryBtn')?.addEventListener('click', () => {
    hideAllSections();
    blogForm.dispatchEvent(new Event('submit'));
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

// Initialize
window.addEventListener('load', () => {
    keyPoints.focus();
    updateTopicPreview();
    updateAudienceCount();
    updateStats('');
});

// Make removeTag available globally
window.removeTag = removeTag;

// ==================== Agent Management ====================

// Crew Config Selector
const crewConfigSelect = document.getElementById('crewConfig');

// Load crew configs for dropdown
async function loadCrewConfigs() {
    if (!crewConfigSelect) return;
    try {
        const response = await fetch('/api/crew-configs/');
        const crews = await response.json();
        crewConfigSelect.innerHTML = '<option value="">Use Default</option>' + 
            crews.map(crew => `<option value="${crew.id}">${crew.name}${crew.is_default ? ' (Default)' : ''}</option>`).join('');
    } catch (error) {
        console.error('Error loading crew configs:', error);
    }
}

// Load crew configs on page load
window.addEventListener('load', () => {
    loadCrewConfigs();
});

// Load tasks
async function loadTasks() {
    try {
        const response = await fetch('/api/tasks/');
        const tasks = await response.json();
        tasksList.innerHTML = tasks.map(task => `
            <div class="item-card">
                <div class="item-header">
                    <h5>${task.name} <span class="badge">${task.agent_name}</span></h5>
                    <div class="item-actions">
                        <button class="icon-btn" onclick="editTask(${task.id})" title="Edit">✏️</button>
                        <button class="icon-btn" onclick="deleteTask(${task.id})" title="Delete">🗑️</button>
                    </div>
                </div>
                <p class="item-description">${task.description.substring(0, 100)}...</p>
                <div class="item-meta">
                    <span class="badge ${task.is_active ? 'active' : 'inactive'}">${task.is_active ? 'Active' : 'Inactive'}</span>
                    <span>Order: ${task.order}</span>
                    ${task.depends_on_name ? `<span>Depends on: ${task.depends_on_name}</span>` : ''}
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading tasks:', error);
    }
}

// Load crews
async function loadCrews() {
    try {
        const response = await fetch('/api/crew-configs/');
        const crews = await response.json();
        crewsList.innerHTML = crews.map(crew => `
            <div class="item-card">
                <div class="item-header">
                    <h5>${crew.name} ${crew.is_default ? '<span class="badge">Default</span>' : ''}</h5>
                    <div class="item-actions">
                        <button class="icon-btn" onclick="editCrew(${crew.id})" title="Edit">✏️</button>
                        <button class="icon-btn" onclick="deleteCrew(${crew.id})" title="Delete">🗑️</button>
                    </div>
                </div>
                <p class="item-description">${crew.description || 'No description'}</p>
                <div class="item-meta">
                    <span class="badge">${crew.process_type}</span>
                    <span>Agents: ${crew.agents_detail?.length || 0}</span>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading crews:', error);
    }
}

// Load crew configs for dropdown
async function loadCrewConfigs() {
    try {
        const response = await fetch('/api/crew-configs/');
        const crews = await response.json();
        crewConfigSelect.innerHTML = '<option value="">Use Default</option>' + 
            crews.map(crew => `<option value="${crew.id}">${crew.name}${crew.is_default ? ' (Default)' : ''}</option>`).join('');
    } catch (error) {
        console.error('Error loading crew configs:', error);
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
    if (!confirm('Are you sure you want to delete this agent?')) return;
    try {
        const response = await fetch(`/api/agents/${agentId}/`, {
            method: 'DELETE',
            headers: { 'X-CSRFToken': getCsrfToken() },
        });
        if (response.ok) {
            loadAgents();
            loadTasks();
            loadCrewConfigs();
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
            loadCrewConfigs();
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
            loadCrewConfigs();
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
            loadCrewConfigs();
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
            loadCrewConfigs();
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
            loadCrewConfigs();
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

// Load crew configs on page load
window.addEventListener('load', () => {
    loadCrewConfigs();
});

// Make functions available globally
window.saveCurrentPost = saveCurrentPost;
window.getCsrfToken = getCsrfToken;
