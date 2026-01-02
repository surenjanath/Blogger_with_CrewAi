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
        // Truncate to ~25 words
        const words = text.split(/\s+/).slice(0, 25).join(' ');
        preview.textContent = words + (text.split(/\s+/).length > 25 ? '...' : '');
    });
});

// Filter functionality
const filterStatus = document.getElementById('filterStatus');
const filterSaved = document.getElementById('filterSaved');

function filterPosts() {
    const statusFilter = filterStatus?.value || '';
    const savedFilter = filterSaved?.value || '';
    const postCards = document.querySelectorAll('.post-card');
    
    postCards.forEach(card => {
        const status = card.dataset.status;
        const saved = card.dataset.saved;
        
        let show = true;
        
        if (statusFilter && status !== statusFilter) {
            show = false;
        }
        
        if (savedFilter === 'true' && saved !== 'true') {
            show = false;
        }
        
        card.style.display = show ? 'block' : 'none';
    });
}

filterStatus?.addEventListener('change', filterPosts);
filterSaved?.addEventListener('change', filterPosts);

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
    if (!confirm('Are you sure you want to delete this post?')) return;
    
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

