// Homepage JavaScript

// Search functionality
const searchBtn = document.getElementById('searchBtn');
const searchModal = document.getElementById('searchModal');
const closeSearchModal = document.getElementById('closeSearchModal');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');

searchBtn?.addEventListener('click', () => {
    searchModal.classList.remove('hidden');
    searchInput.focus();
});

closeSearchModal?.addEventListener('click', () => {
    searchModal.classList.add('hidden');
    searchInput.value = '';
    searchResults.innerHTML = '';
});

searchModal?.addEventListener('click', (e) => {
    if (e.target === searchModal) {
        searchModal.classList.add('hidden');
    }
});

// Search with debounce
let searchTimeout;
searchInput?.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const query = e.target.value.trim();
    
    if (query.length < 2) {
        searchResults.innerHTML = '';
        return;
    }
    
    searchTimeout = setTimeout(async () => {
        try {
            const response = await fetch(`/api/posts/search/?q=${encodeURIComponent(query)}`);
            const posts = await response.json();
            
            if (posts.length === 0) {
                searchResults.innerHTML = '<div class="search-result-item"><p style="color: #94a3b8; text-align: center; padding: 20px;">No results found</p></div>';
                return;
            }
            
            searchResults.innerHTML = posts.map(post => `
                <div class="search-result-item" onclick="window.location.href='/edit/${post.id}/'">
                    <div class="search-result-title">${post.topic || post.title || 'Untitled'}</div>
                    <div class="search-result-preview">${(post.content || '').substring(0, 100)}...</div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Search error:', error);
            searchResults.innerHTML = '<div class="search-result-item"><p style="color: #dc2626; text-align: center; padding: 20px;">Error searching posts</p></div>';
        }
    }, 300);
});

// Templates functionality
const templatesBtn = document.getElementById('templatesBtn');
const templatesModal = document.getElementById('templatesModal');
const closeTemplatesModal = document.getElementById('closeTemplatesModal');

templatesBtn?.addEventListener('click', () => {
    templatesModal.classList.remove('hidden');
});

closeTemplatesModal?.addEventListener('click', () => {
    templatesModal.classList.add('hidden');
});

templatesModal?.addEventListener('click', (e) => {
    if (e.target === templatesModal) {
        templatesModal.classList.add('hidden');
    }
});

// Comprehensive Templates System
const templates = {
    marketing: {
        keyPoints: 'Digital marketing strategies, SEO optimization, content marketing, social media trends, email campaigns, and conversion optimization',
        examples: 'Content marketing campaigns, SEO best practices, social media strategies, email marketing automation, PPC advertising',
        tone: 'professional',
        length: 'medium',
        audience: ['Marketers', 'Business Owners', 'Content Creators', 'Digital Marketing Professionals']
    },
    tech: {
        keyPoints: 'Latest technology trends, software development, innovations, best practices, and tech industry insights',
        examples: 'AI developments, cloud computing, cybersecurity, software frameworks, programming languages, tech tools',
        tone: 'informative',
        length: 'medium',
        audience: ['Developers', 'Tech Enthusiasts', 'IT Professionals', 'Software Engineers']
    },
    design: {
        keyPoints: 'UI/UX design principles, design trends, tools, design systems, user experience, and visual design',
        examples: 'Design systems, user experience case studies, design tools, visual design trends, interface examples',
        tone: 'friendly',
        length: 'medium',
        audience: ['Designers', 'UI/UX Professionals', 'Creatives', 'Product Designers']
    }
};

// Templates modal functionality
const templatesBtn = document.getElementById('templatesBtn');
const templatesModal = document.getElementById('templatesModal');
const closeTemplatesModal = document.getElementById('closeTemplatesModal');
const categoryButtons = document.querySelectorAll('.category-btn');
const templateCards = document.querySelectorAll('.template-card');

templatesBtn?.addEventListener('click', () => {
    templatesModal.classList.remove('hidden');
});

closeTemplatesModal?.addEventListener('click', () => {
    templatesModal.classList.add('hidden');
});

templatesModal?.addEventListener('click', (e) => {
    if (e.target === templatesModal) {
        templatesModal.classList.add('hidden');
    }
});

// Category filtering
categoryButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const category = btn.dataset.category;
        categoryButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        templateCards.forEach(card => {
            const cardCategory = card.dataset.category;
            if (category === 'all' || cardCategory === category) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        });
    });
});

// Use template - redirects to /new/ with template data
document.querySelectorAll('.use-template').forEach(btn => {
    btn.addEventListener('click', () => {
        const template = btn.dataset.template;
        const templateData = templates[template];
        if (templateData) {
            sessionStorage.setItem('template', JSON.stringify(templateData));
            window.location.href = '/new/';
        }
    });
});

// Real-time updates for active posts
function updateActivePosts() {
    const activePostCards = document.querySelectorAll('.active-post-card[data-post-id]');
    
    if (activePostCards.length === 0) return;
    
    activePostCards.forEach(card => {
        const postId = card.dataset.postId;
        
        fetch(`/api/post/${postId}/`)
            .then(response => response.json())
            .then(post => {
                // Update progress bar
                const progressFill = card.querySelector('.progress-fill');
                const progressText = card.querySelector('.progress-text');
                const progressAgent = card.querySelector('.progress-agent');
                const statusBadge = card.querySelector('.status-badge');
                
                if (progressFill && post.progress_percentage !== undefined) {
                    progressFill.style.width = `${post.progress_percentage}%`;
                }
                
                if (progressText) {
                    progressText.textContent = `${post.progress_percentage || 0}%`;
                }
                
                if (progressAgent && post.current_agent) {
                    progressAgent.textContent = post.current_agent;
                }
                
                // Update status badge
                if (statusBadge && post.status) {
                    statusBadge.textContent = post.status.charAt(0).toUpperCase() + post.status.slice(1);
                    statusBadge.className = `status-badge status-${post.status}`;
                }
                
                // If completed, reload page after a delay
                if (post.status === 'completed') {
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                }
                
                // If failed, update styling
                if (post.status === 'failed') {
                    card.style.borderColor = '#ef4444';
                }
            })
            .catch(error => {
                console.error('Error updating post:', error);
            });
    });
}

// Update active posts every 3 seconds
if (document.querySelectorAll('.active-post-card[data-post-id]').length > 0) {
    updateActivePosts();
    setInterval(updateActivePosts, 3000);
}

// Animate stat cards on load
document.addEventListener('DOMContentLoaded', () => {
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
            card.style.transition = 'all 0.4s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
    
    // Animate post cards
    const postCards = document.querySelectorAll('.post-card');
    postCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
            card.style.transition = 'all 0.4s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, (statCards.length * 100) + (index * 50));
    });
});

