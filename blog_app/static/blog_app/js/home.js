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

// Use template
document.querySelectorAll('.use-template').forEach(btn => {
    btn.addEventListener('click', () => {
        const template = btn.dataset.template;
        const templates = {
            tech: {
                keyPoints: 'Latest technology trends, innovations, and best practices',
                examples: 'AI, cloud computing, cybersecurity, software development',
                tone: 'informative',
                audience: ['Developers', 'Tech Enthusiasts', 'IT Professionals']
            },
            marketing: {
                keyPoints: 'Digital marketing strategies, SEO, content marketing, social media',
                examples: 'Content marketing, email campaigns, social media trends',
                tone: 'professional',
                audience: ['Marketers', 'Business Owners', 'Content Creators']
            },
            design: {
                keyPoints: 'UI/UX design principles, trends, tools, and best practices',
                examples: 'Design systems, user experience, visual design trends',
                tone: 'friendly',
                audience: ['Designers', 'UI/UX Professionals', 'Creatives']
            }
        };
        
        const templateData = templates[template];
        if (templateData) {
            // Store in sessionStorage and redirect
            sessionStorage.setItem('template', JSON.stringify(templateData));
            window.location.href = '/new/';
        }
    });
});

