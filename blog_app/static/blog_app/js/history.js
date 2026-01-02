// History Page JavaScript

// Convert markdown to plain text for preview
function markdownToText(markdown) {
    if (!markdown) return '';
    
    let text = markdown;
    // Remove markdown headers
    text = text.replace(/^#+\s+/gm, '');
    // Remove markdown bold/italic
    text = text.replace(/\*\*(.+?)\*\*/g, '$1');
    text = text.replace(/\*(.+?)\*/g, '$1');
    // Remove markdown links but keep text
    text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    // Remove code blocks
    text = text.replace(/```[\s\S]*?```/g, '');
    text = text.replace(/`([^`]+)`/g, '$1');
    // Remove images
    text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, '');
    // Clean up extra whitespace
    text = text.replace(/\n{3,}/g, '\n\n');
    text = text.trim();
    return text;
}

// Process previews on page load
document.addEventListener('DOMContentLoaded', () => {
    const previews = document.querySelectorAll('.post-preview[data-content]');
    previews.forEach(preview => {
        const markdown = preview.getAttribute('data-content');
        const text = markdownToText(markdown);
        // Truncate to ~20 words
        const words = text.split(/\s+/).slice(0, 20).join(' ');
        preview.textContent = words + (text.split(/\s+/).length > 20 ? '...' : '');
    });
    
    // Initialize view toggle
    const savedView = localStorage.getItem('historyView') || 'grid';
    setView(savedView);
    
    // Initialize search with debounce
    const searchInput = document.getElementById('searchInput');
    let searchTimeout;
    searchInput?.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            applyFilters();
        }, 500);
    });
    
    // Enter key to search
    searchInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            clearTimeout(searchTimeout);
            applyFilters();
        }
    });
});

// Apply all filters and reload page
function applyFilters() {
    const params = new URLSearchParams();
    
    const status = document.getElementById('filterStatus')?.value;
    const saved = document.getElementById('filterSaved')?.value;
    const tone = document.getElementById('filterTone')?.value;
    const sort = document.getElementById('sortBy')?.value;
    const search = document.getElementById('searchInput')?.value.trim();
    
    if (status) params.set('status', status);
    if (saved) params.set('saved', saved);
    if (tone) params.set('tone', tone);
    if (sort) params.set('sort', sort);
    if (search) params.set('q', search);
    
    const queryString = params.toString();
    window.location.href = '/history/' + (queryString ? '?' + queryString : '');
}

// Remove a specific filter
function removeFilter(filterName) {
    const params = new URLSearchParams(window.location.search);
    params.delete(filterName);
    const queryString = params.toString();
    window.location.href = '/history/' + (queryString ? '?' + queryString : '');
}

// Filter functionality (client-side for instant feedback)
const filterStatus = document.getElementById('filterStatus');
const filterSaved = document.getElementById('filterSaved');
const filterTone = document.getElementById('filterTone');
const sortBy = document.getElementById('sortBy');

filterStatus?.addEventListener('change', applyFilters);
filterSaved?.addEventListener('change', applyFilters);
filterTone?.addEventListener('change', applyFilters);
sortBy?.addEventListener('change', applyFilters);

// View toggle
const viewButtons = document.querySelectorAll('.view-btn');
viewButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const view = btn.dataset.view;
        setView(view);
        localStorage.setItem('historyView', view);
    });
});

function setView(view) {
    const container = document.getElementById('postsContainer');
    const buttons = document.querySelectorAll('.view-btn');
    
    buttons.forEach(btn => {
        if (btn.dataset.view === view) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    if (view === 'list') {
        container.classList.add('posts-list-view');
        container.classList.remove('posts-grid');
        
        // Convert cards to list items
        const cards = container.querySelectorAll('.post-card');
        cards.forEach(card => {
            if (!card.classList.contains('post-list-item')) {
                card.classList.add('post-list-item');
                
                // Reorganize content for list view
                const header = card.querySelector('.post-card-header');
                const preview = card.querySelector('.post-preview');
                const meta = card.querySelector('.post-meta');
                const actions = card.querySelector('.post-actions');
                
                if (header && preview && meta && actions) {
                    const contentDiv = document.createElement('div');
                    contentDiv.className = 'post-list-content';
                    contentDiv.appendChild(header);
                    if (preview) contentDiv.appendChild(preview);
                    if (meta) contentDiv.appendChild(meta);
                    
                    const actionsDiv = document.createElement('div');
                    actionsDiv.className = 'post-list-actions';
                    actionsDiv.appendChild(actions);
                    
                    // Move checkbox to beginning
                    const checkbox = card.querySelector('.post-checkbox');
                    const wrapper = card.querySelector('div[style*="display: flex"]');
                    if (wrapper) {
                        wrapper.remove();
                    }
                    
                    card.innerHTML = '';
                    if (checkbox) card.appendChild(checkbox);
                    card.appendChild(contentDiv);
                    card.appendChild(actionsDiv);
                }
            }
        });
    } else {
        container.classList.remove('posts-list-view');
        container.classList.add('posts-grid');
        
        // Reload to get grid view back
        // Or convert list items back to cards
        const items = container.querySelectorAll('.post-list-item');
        if (items.length > 0) {
            window.location.reload();
        }
    }
}

// Bulk actions
function updateBulkActions() {
    const checkboxes = document.querySelectorAll('.post-checkbox:checked');
    const bulkActions = document.getElementById('bulkActions');
    const selectedCount = document.getElementById('selectedCount');
    
    if (checkboxes.length > 0) {
        bulkActions?.classList.add('active');
        if (selectedCount) selectedCount.textContent = checkboxes.length;
    } else {
        bulkActions?.classList.remove('active');
    }
}

function clearSelection() {
    const checkboxes = document.querySelectorAll('.post-checkbox');
    checkboxes.forEach(cb => cb.checked = false);
    updateBulkActions();
}

function getSelectedPostIds() {
    const checkboxes = document.querySelectorAll('.post-checkbox:checked');
    return Array.from(checkboxes).map(cb => {
        const card = cb.closest('.post-card');
        return card?.dataset.postId;
    }).filter(id => id);
}

async function bulkSave() {
    const ids = getSelectedPostIds();
    if (ids.length === 0) return;
    
    if (!confirm(`Save ${ids.length} post(s)?`)) return;
    
    try {
        const promises = ids.map(id => 
            fetch(`/api/post/${id}/save/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCsrfToken(),
                },
            })
        );
        
        await Promise.all(promises);
        location.reload();
    } catch (error) {
        console.error('Error saving posts:', error);
        alert('Error saving posts');
    }
}

async function bulkDelete() {
    const ids = getSelectedPostIds();
    if (ids.length === 0) return;
    
    if (!confirm(`Delete ${ids.length} post(s)? This cannot be undone.`)) return;
    
    try {
        const promises = ids.map(id => 
            fetch(`/api/post/${id}/`, {
                method: 'DELETE',
                headers: {
                    'X-CSRFToken': getCsrfToken(),
                },
            })
        );
        
        await Promise.all(promises);
        location.reload();
    } catch (error) {
        console.error('Error deleting posts:', error);
        alert('Error deleting posts');
    }
}

// Save post
async function savePost(postId) {
    try {
        const response = await fetch(`/api/post/${postId}/save/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCsrfToken(),
            },
        });
        
        if (response.ok) {
            location.reload();
        } else {
            alert('Failed to save post');
        }
    } catch (error) {
        console.error('Error saving post:', error);
        alert('Error saving post');
    }
}

// Delete post
async function deletePost(postId) {
    if (!confirm('Are you sure you want to delete this post? This cannot be undone.')) return;
    
    try {
        const response = await fetch(`/api/post/${postId}/`, {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': getCsrfToken(),
            },
        });
        
        if (response.ok) {
            location.reload();
        } else {
            alert('Failed to delete post');
        }
    } catch (error) {
        console.error('Error deleting post:', error);
        alert('Error deleting post');
    }
}

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

// Make functions available globally
window.savePost = savePost;
window.deletePost = deletePost;
window.removeFilter = removeFilter;
window.updateBulkActions = updateBulkActions;
window.clearSelection = clearSelection;
window.bulkSave = bulkSave;
window.bulkDelete = bulkDelete;
