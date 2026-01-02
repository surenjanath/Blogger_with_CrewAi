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
let postContent = document.getElementById('postContent'); // Use let for reassignment
let postTitle = document.getElementById('postTitle'); // Use let for reassignment
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

// Progress elements
const progressBar = document.getElementById('progressBar');
const progressPercentage = document.getElementById('progressPercentage');
const currentAgentName = document.getElementById('currentAgentName');
const currentTaskDescription = document.getElementById('currentTaskDescription');
const progressMessageText = document.getElementById('progressMessageText');

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

// PDF Export using browser's print functionality
document.getElementById('exportPDF').addEventListener('click', () => {
    exportModal.classList.add('hidden');
    
    // Create a new window with the content formatted for PDF
    const printWindow = window.open('', '_blank');
    const title = postTitle.textContent || postTitle.innerText;
    const content = postContent.innerHTML;
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>${title}</title>
            <style>
                @media print {
                    @page {
                        margin: 2cm;
                    }
                    body {
                        margin: 0;
                        padding: 0;
                    }
                }
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 40px 20px;
                    line-height: 1.8;
                    color: #0f172a;
                    font-size: 14px;
                }
                h1 {
                    font-size: 32px;
                    font-weight: 700;
                    color: #0f172a;
                    margin-bottom: 24px;
                    margin-top: 0;
                    line-height: 1.2;
                }
                h2 {
                    font-size: 24px;
                    font-weight: 600;
                    color: #0f172a;
                    margin-top: 32px;
                    margin-bottom: 16px;
                    line-height: 1.3;
                }
                h3 {
                    font-size: 20px;
                    font-weight: 600;
                    color: #0f172a;
                    margin-top: 24px;
                    margin-bottom: 12px;
                    line-height: 1.4;
                }
                h4 {
                    font-size: 18px;
                    font-weight: 600;
                    color: #0f172a;
                    margin-top: 20px;
                    margin-bottom: 10px;
                }
                p {
                    margin-bottom: 16px;
                    line-height: 1.8;
                }
                ul, ol {
                    margin-bottom: 16px;
                    padding-left: 24px;
                }
                li {
                    margin-bottom: 8px;
                    line-height: 1.6;
                }
                code {
                    background: #f1f5f9;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-family: 'Courier New', monospace;
                    font-size: 13px;
                }
                pre {
                    background: #f8fafc;
                    padding: 16px;
                    border-radius: 8px;
                    overflow-x: auto;
                    margin-bottom: 16px;
                    border: 1px solid #e2e8f0;
                }
                pre code {
                    background: none;
                    padding: 0;
                }
                blockquote {
                    border-left: 4px solid #3b82f6;
                    padding-left: 16px;
                    margin: 16px 0;
                    color: #475569;
                    font-style: italic;
                }
                a {
                    color: #3b82f6;
                    text-decoration: none;
                }
                a:hover {
                    text-decoration: underline;
                }
                hr {
                    border: none;
                    border-top: 1px solid #e2e8f0;
                    margin: 32px 0;
                }
                strong {
                    font-weight: 600;
                    color: #0f172a;
                }
                em {
                    font-style: italic;
                }
            </style>
        </head>
        <body>
            <h1>${title}</h1>
            ${content}
        </body>
        </html>
    `);
    
    printWindow.document.close();
    
    // Wait for content to load, then print
    setTimeout(() => {
        printWindow.print();
    }, 250);
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

// Convert markdown to HTML (comprehensive markdown parser)
function markdownToHtml(markdown) {
    if (!markdown) return '';
    
    let html = markdown;
    
    // Remove title from content if it's the first line (we handle title separately)
    html = html.replace(/^#\s+(.+)$/m, '');
    
    // Code blocks (must be done before other processing to preserve content)
    html = html.replace(/```([\s\S]*?)```/g, (match, code) => {
        return '<pre><code>' + code.trim() + '</code></pre>';
    });
    
    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Headers (must be done before other processing)
    html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
    
    // Bold and italic (order matters - bold before italic)
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.+?)_/g, '<em>$1</em>');
    
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    
    // Images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto;" />');
    
    // Horizontal rules
    html = html.replace(/^---$/gm, '<hr />');
    html = html.replace(/^\*\*\*$/gm, '<hr />');
    
    // Blockquotes
    html = html.replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>');
    
    // Tables - process before line-by-line processing
    // Match table pattern: header row, separator row, data rows
    html = html.replace(/(\|[^\n]+\|\n\|[-\s|:]+\|\n(?:\|[^\n]+\|\n?)+)/g, (match) => {
        const lines = match.trim().split('\n').filter(line => line.trim());
        if (lines.length < 2) return match;
        
        // Parse header row
        const headerRow = lines[0];
        const headers = headerRow.split('|').map(h => h.trim()).filter(h => h);
        
        if (headers.length === 0) return match;
        
        // Skip separator row (lines[1])
        // Parse data rows
        const dataRows = lines.slice(2);
        
        let tableHtml = '<table>\n<thead>\n<tr>\n';
        headers.forEach(header => {
            // Process markdown in headers (bold, italic, etc.)
            let headerText = header;
            headerText = headerText.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
            headerText = headerText.replace(/\*(.+?)\*/g, '<em>$1</em>');
            tableHtml += `<th>${headerText}</th>\n`;
        });
        tableHtml += '</tr>\n</thead>\n<tbody>\n';
        
        dataRows.forEach(row => {
            const cells = row.split('|').map(c => c.trim()).filter(c => c);
            if (cells.length > 0) {
                tableHtml += '<tr>\n';
                cells.forEach(cell => {
                    // Process markdown in cells (bold, italic, links, etc.)
                    let cellText = cell;
                    cellText = cellText.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
                    cellText = cellText.replace(/\*(.+?)\*/g, '<em>$1</em>');
                    cellText = cellText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
                    tableHtml += `<td>${cellText}</td>\n`;
                });
                tableHtml += '</tr>\n';
            }
        });
        
        tableHtml += '</tbody>\n</table>';
        return tableHtml;
    });
    
    // Lists - process line by line with nested list support
    const lines = html.split('\n');
    let listStack = []; // Stack to track nested lists: {type: 'ul'|'ol', level: number}
    let result = [];
    let lastWasOrderedItem = false;
    
    function getIndentLevel(line) {
        const match = line.match(/^(\s*)/);
        return match ? Math.floor(match[1].length / 2) : 0; // 2 spaces = 1 level
    }
    
    function closeListsToLevel(level) {
        while (listStack.length > 0 && listStack[listStack.length - 1].level >= level) {
            const list = listStack.pop();
            result.push(`</${list.type}>`);
        }
    }
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();
        
        // Check for unordered list item (with or without indentation)
        const unorderedMatch = trimmed.match(/^[\*\-\+]\s+(.+)$/);
        // Check for ordered list item (with or without indentation)
        const orderedMatch = trimmed.match(/^\d+\.\s+(.+)$/);
        
        if (unorderedMatch) {
            const level = getIndentLevel(line);
            const content = unorderedMatch[1];
            
            // If previous item was ordered and this is unindented, nest it under the ordered item
            let actualLevel = level;
            if (lastWasOrderedItem && level === 0 && listStack.length > 0 && listStack[listStack.length - 1].type === 'ol') {
                actualLevel = listStack[listStack.length - 1].level + 1;
            }
            
            // Close lists at same or higher level
            closeListsToLevel(actualLevel);
            
            // Open unordered list if needed
            if (listStack.length === 0 || listStack[listStack.length - 1].type !== 'ul' || listStack[listStack.length - 1].level !== actualLevel) {
                result.push('<ul>');
                listStack.push({type: 'ul', level: actualLevel});
            }
            
            result.push('<li>' + content + '</li>');
            lastWasOrderedItem = false;
        } else if (orderedMatch) {
            const level = getIndentLevel(line);
            const content = orderedMatch[1];
            
            // Close lists at same or higher level
            closeListsToLevel(level);
            
            // Open ordered list if needed
            if (listStack.length === 0 || listStack[listStack.length - 1].type !== 'ol' || listStack[listStack.length - 1].level !== level) {
                result.push('<ol>');
                listStack.push({type: 'ol', level: level});
            }
            
            result.push('<li>' + content + '</li>');
            lastWasOrderedItem = true;
        } else {
            lastWasOrderedItem = false;
            
            // Close all lists when we hit non-list content (unless it's a blank line within a list)
            if (trimmed || listStack.length === 0) {
                closeListsToLevel(0);
            }
            
            // Process paragraphs and other block elements
            // Skip table rows (they're already processed) and blank lines
            if (trimmed && !trimmed.match(/^<(h[1-4]|pre|blockquote|hr|table|thead|tbody|tr|th|td)/) && !trimmed.match(/^\|/)) {
                result.push('<p>' + trimmed + '</p>');
            } else if (trimmed) {
                result.push(trimmed);
            }
        }
    }
    
    // Close any remaining open lists
    closeListsToLevel(0);
    
    html = result.join('\n');
    
    // Clean up multiple empty paragraphs
    html = html.replace(/<p>\s*<\/p>/g, '');
    html = html.replace(/\n{3,}/g, '\n\n');
    
    return html.trim();
}

function convertToMarkdown(html) {
    let md = html;
    md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n');
    md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n');
    md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n');
    md = md.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n');
    md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
    md = md.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
    md = md.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
    md = md.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');
    md = md.replace(/<pre[^>]*>(.*?)<\/pre>/gi, '```\n$1\n```');
    md = md.replace(/<a[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi, '[$2]($1)');
    md = md.replace(/<ul[^>]*>/gi, '');
    md = md.replace(/<\/ul>/gi, '\n');
    md = md.replace(/<ol[^>]*>/gi, '');
    md = md.replace(/<\/ol>/gi, '\n');
    md = md.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');
    md = md.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '> $1\n');
    md = md.replace(/<hr\s*\/?>/gi, '---\n');
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

// Comprehensive Templates System (same as in index.html)
const allTemplates = {
    // Business Templates
    marketing: {
        keyPoints: 'Digital marketing strategies, SEO optimization, content marketing, social media trends, email campaigns, and conversion optimization',
        examples: 'Content marketing campaigns, SEO best practices, social media strategies, email marketing automation, PPC advertising',
        tone: 'professional',
        length: 'medium',
        audience: ['Marketers', 'Business Owners', 'Content Creators', 'Digital Marketing Professionals']
    },
    business: {
        keyPoints: 'Business growth strategies, entrepreneurship, leadership principles, management insights, and organizational development',
        examples: 'Successful startups, business case studies, leadership examples, management frameworks, growth strategies',
        tone: 'professional',
        length: 'medium',
        audience: ['Entrepreneurs', 'Business Leaders', 'Managers', 'Business Students']
    },
    startup: {
        keyPoints: 'Startup advice, funding strategies, product development, scaling businesses, and entrepreneurial insights',
        examples: 'Successful startup stories, funding rounds, product launches, scaling challenges, founder experiences',
        tone: 'friendly',
        length: 'medium',
        audience: ['Startup Founders', 'Entrepreneurs', 'Investors', 'Aspiring Business Owners']
    },
    // Technology Templates
    tech: {
        keyPoints: 'Latest technology trends, software development, innovations, best practices, and tech industry insights',
        examples: 'AI developments, cloud computing, cybersecurity, software frameworks, programming languages, tech tools',
        tone: 'informative',
        length: 'medium',
        audience: ['Developers', 'Tech Enthusiasts', 'IT Professionals', 'Software Engineers']
    },
    ai: {
        keyPoints: 'Artificial intelligence, machine learning, neural networks, AI applications, and future of AI technology',
        examples: 'ChatGPT, neural networks, deep learning, AI tools, machine learning models, AI ethics',
        tone: 'informative',
        length: 'long',
        audience: ['AI Researchers', 'Data Scientists', 'Tech Enthusiasts', 'Developers']
    },
    programming: {
        keyPoints: 'Programming tutorials, coding best practices, software development, frameworks, and development workflows',
        examples: 'Code examples, programming languages, development tools, coding patterns, software architecture',
        tone: 'informative',
        length: 'medium',
        audience: ['Developers', 'Programmers', 'Software Engineers', 'Coding Students']
    },
    // Creative Templates
    design: {
        keyPoints: 'UI/UX design principles, design trends, tools, design systems, user experience, and visual design',
        examples: 'Design systems, user experience case studies, design tools, visual design trends, interface examples',
        tone: 'friendly',
        length: 'medium',
        audience: ['Designers', 'UI/UX Professionals', 'Creatives', 'Product Designers']
    },
    writing: {
        keyPoints: 'Creative writing tips, storytelling techniques, narrative structure, writing inspiration, and author advice',
        examples: 'Writing examples, storytelling techniques, narrative structures, writing prompts, author interviews',
        tone: 'friendly',
        length: 'medium',
        audience: ['Writers', 'Authors', 'Content Creators', 'Creative Professionals']
    },
    photography: {
        keyPoints: 'Photography tips, camera techniques, composition rules, editing workflows, and gear recommendations',
        examples: 'Photo examples, camera settings, composition techniques, editing software, photography gear',
        tone: 'friendly',
        length: 'medium',
        audience: ['Photographers', 'Visual Artists', 'Content Creators', 'Hobbyists']
    },
    // Education Templates
    tutorial: {
        keyPoints: 'Step-by-step instructions, how-to guides, tutorials, educational content, and learning resources',
        examples: 'Tutorial examples, step-by-step processes, instructional content, learning resources, practical guides',
        tone: 'informative',
        length: 'long',
        audience: ['Learners', 'Students', 'Educators', 'Tutorial Seekers']
    },
    review: {
        keyPoints: 'Product reviews, comparisons, pros and cons, buying guides, and detailed analysis',
        examples: 'Product features, user experiences, comparisons, pros and cons, recommendations',
        tone: 'informative',
        length: 'medium',
        audience: ['Consumers', 'Shoppers', 'Tech Enthusiasts', 'Review Readers']
    },
    news: {
        keyPoints: 'Current events, news analysis, industry updates, trend reports, and breaking news coverage',
        examples: 'Recent events, industry news, trend analysis, current affairs, news updates',
        tone: 'professional',
        length: 'medium',
        audience: ['News Readers', 'Industry Professionals', 'General Public', 'Analysts']
    },
    // Lifestyle Templates
    health: {
        keyPoints: 'Health tips, fitness advice, nutrition guidance, mental wellness, and healthy living strategies',
        examples: 'Fitness routines, healthy recipes, wellness practices, mental health tips, nutrition advice',
        tone: 'friendly',
        length: 'medium',
        audience: ['Health Enthusiasts', 'Fitness Seekers', 'Wellness Advocates', 'General Public']
    },
    travel: {
        keyPoints: 'Travel destinations, travel tips, itineraries, travel experiences, and destination guides',
        examples: 'Travel destinations, itinerary examples, travel tips, destination reviews, travel experiences',
        tone: 'friendly',
        length: 'medium',
        audience: ['Travelers', 'Adventure Seekers', 'Tourists', 'Travel Enthusiasts']
    },
    food: {
        keyPoints: 'Recipes, cooking tips, restaurant reviews, culinary experiences, and food culture',
        examples: 'Recipe examples, cooking techniques, restaurant experiences, food trends, culinary tips',
        tone: 'friendly',
        length: 'medium',
        audience: ['Food Lovers', 'Home Cooks', 'Foodies', 'Culinary Enthusiasts']
    }
};

// Template functionality - opens modal instead of prompt
templateBtn.addEventListener('click', () => {
    const templatesModal = document.getElementById('templatesModal');
    if (templatesModal) {
        templatesModal.classList.remove('hidden');
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
            length: length.value,
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
                // Update progress from real data
                updateProgressFromData(data);
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

// Update progress from API data
function updateProgressFromData(data) {
    // Update progress bar
    const percentage = data.progress_percentage || 0;
    updateProgressBar(percentage);
    
    // Update current agent
    if (data.current_agent) {
        currentAgentName.textContent = data.current_agent;
    }
    
    // Update current task
    if (data.current_task) {
        currentTaskDescription.textContent = data.current_task;
    }
    
    // Update progress message
    if (data.progress_message) {
        progressMessageText.textContent = data.progress_message;
    }
    
    // Update agent status indicators based on current agent
    updateAgentStatusFromProgress(data.current_agent);
}

// Update progress bar
function updateProgressBar(percentage) {
    if (progressBar && progressPercentage) {
        const clampedPercentage = Math.min(100, Math.max(0, percentage));
        progressBar.style.width = `${clampedPercentage}%`;
        progressPercentage.textContent = `${clampedPercentage}%`;
    }
}

// Update current agent display
function updateCurrentAgent(agentName, taskDescription) {
    if (currentAgentName) {
        currentAgentName.textContent = agentName || 'Initializing...';
    }
    if (currentTaskDescription) {
        currentTaskDescription.textContent = taskDescription || 'Preparing...';
    }
}

// Update progress message
function updateProgressMessage(message) {
    if (progressMessageText) {
        progressMessageText.textContent = message || '';
    }
}

// Update agent status indicators based on real progress
function updateAgentStatusFromProgress(currentAgent) {
    if (!currentAgent) return;
    
    const agentLower = currentAgent.toLowerCase();
    
    // Reset all to waiting first
    updateAgentStatus('researcher', 'waiting');
    updateAgentStatus('writer', 'waiting');
    updateAgentStatus('editor', 'waiting');
    
    // Set active agent based on current agent name
    if (agentLower.includes('research') || agentLower.includes('researcher')) {
        updateAgentStatus('researcher', 'active');
    } else if (agentLower.includes('writer') || agentLower.includes('write') || agentLower.includes('content')) {
        updateAgentStatus('researcher', 'completed');
        updateAgentStatus('writer', 'active');
    } else if (agentLower.includes('editor') || agentLower.includes('edit') || agentLower.includes('review')) {
        updateAgentStatus('researcher', 'completed');
        updateAgentStatus('writer', 'completed');
        updateAgentStatus('editor', 'active');
    }
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
    
    // Hide initial state
    const initialState = document.getElementById('initialState');
    if (initialState) {
        initialState.classList.add('hidden');
    }
    
    resultSection.classList.remove('hidden');
    
    const content = data.content || '';
    const titleMatch = content.match(/^#\s*(.+)$/m) || content.match(/^(.+)$/m);
    const title = titleMatch ? titleMatch[1].trim() : data.topic;
    
    // Set title (editable)
    postTitle.textContent = title;
    currentPostId = data.id;
    
    // Convert markdown to HTML for display and editing
    let formattedContent = markdownToHtml(content);
    
    postContent.innerHTML = formattedContent;
    currentContent = formattedContent;
    
    // Add event listeners for content changes
    setupContentEditing();
    
    updateStats(formattedContent);
    savedIndicator.textContent = '●';
    savedIndicator.style.color = '#64748b';
    
    // Show save button
    showSaveButton();
    
    document.querySelector('.editor-container').scrollTop = 0;
}

// Setup content editing
function setupContentEditing() {
    // Update stats when content changes
    const updateContentStats = () => {
        const text = postContent.innerText || postContent.textContent;
        updateStats(text);
        
        // Mark as unsaved
        savedIndicator.textContent = '●';
        savedIndicator.style.color = '#f59e0b';
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.textContent = 'Save';
            saveBtn.style.background = '';
        }
    };
    
    // Remove existing listeners by cloning (this removes all event listeners)
    // Then re-add listeners to the cloned elements
    const newPostTitle = postTitle.cloneNode(true);
    postTitle.parentNode.replaceChild(newPostTitle, postTitle);
    // Update the global reference
    postTitle = document.getElementById('postTitle');
    
    const newPostContent = postContent.cloneNode(true);
    postContent.parentNode.replaceChild(newPostContent, postContent);
    // Update the global reference
    postContent = document.getElementById('postContent');
    
    // Add input listeners to the new elements
    if (postTitle) {
        postTitle.addEventListener('input', updateContentStats);
    }
    if (postContent) {
        postContent.addEventListener('input', updateContentStats);
        postContent.addEventListener('blur', () => {
            currentContent = postContent.innerHTML;
        });
    }
}

// Save button functionality
function showSaveButton() {
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
        saveBtn.classList.remove('hidden');
        // Remove existing listener and add new one
        const newSaveBtn = saveBtn.cloneNode(true);
        saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
        newSaveBtn.addEventListener('click', saveCurrentPost);
    }
}

// Save current post
async function saveCurrentPost() {
    if (!currentPostId) return;
    
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving...';
    }
    
    try {
        const title = postTitle.textContent.trim() || postTitle.innerText.trim();
        const content = postContent.innerHTML || postContent.innerText;
        
        const response = await fetch(`/api/post/${currentPostId}/update/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCsrfToken(),
            },
            body: JSON.stringify({
                title: title,
                content: content
            }),
        });
        
        if (response.ok) {
            savedIndicator.textContent = '✓ Saved';
            savedIndicator.style.color = '#10b981';
            if (saveBtn) {
                saveBtn.textContent = '✓ Saved';
                saveBtn.style.background = '#10b981';
                setTimeout(() => {
                    saveBtn.disabled = false;
                    saveBtn.textContent = 'Save';
                    saveBtn.style.background = '';
                }, 2000);
            }
        } else {
            throw new Error('Failed to save post');
        }
    } catch (error) {
        console.error('Error saving post:', error);
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.textContent = 'Save';
        }
        alert('Failed to save post. Please try again.');
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
        const title = postTitle.textContent.trim() || postTitle.innerText.trim();
        const content = postContent.innerHTML || postContent.innerText;
        
        const response = await fetch(`/api/post/${currentPostId}/update/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCsrfToken(),
            },
            body: JSON.stringify({
                title: title,
                content: content
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
    
    // Hide initial state
    const initialState = document.getElementById('initialState');
    if (initialState) {
        initialState.classList.add('hidden');
    }
    
    document.getElementById('errorText').textContent = message;
}

// Show loading
function showLoading() {
    hideAllSections();
    loadingSection.classList.remove('hidden');
    
    // Hide initial state
    const initialState = document.getElementById('initialState');
    if (initialState) {
        initialState.classList.add('hidden');
    }
    
    updateAgentStatus('researcher', 'waiting');
    updateAgentStatus('writer', 'waiting');
    updateAgentStatus('editor', 'waiting');
}

// Hide all sections
function hideAllSections() {
    loadingSection.classList.add('hidden');
    errorSection.classList.add('hidden');
    resultSection.classList.add('hidden');
    const initialState = document.getElementById('initialState');
    if (initialState) {
        initialState.classList.add('hidden');
    }
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
    
    // Reset progress display
    updateAgentStatus('researcher', 'waiting');
    updateAgentStatus('writer', 'waiting');
    updateAgentStatus('editor', 'waiting');
    
    if (progressBar) progressBar.style.width = '0%';
    if (progressPercentage) progressPercentage.textContent = '0%';
    if (currentAgentName) currentAgentName.textContent = 'Initializing...';
    if (currentTaskDescription) currentTaskDescription.textContent = 'Preparing crew...';
    if (progressMessageText) progressMessageText.textContent = 'Initializing crew and agents...';
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

// Load template from sessionStorage if available
window.addEventListener('load', () => {
    // Check for template data from sessionStorage
    const templateData = sessionStorage.getItem('template');
    if (templateData) {
        try {
            const template = JSON.parse(templateData);
            applyTemplate(template);
            sessionStorage.removeItem('template');
        } catch (error) {
            console.error('Error loading template:', error);
            sessionStorage.removeItem('template');
        }
    }
    
    keyPoints.focus();
    updateTopicPreview();
    updateAudienceCount();
    updateStats('');
});

// Apply template function
function applyTemplate(template) {
    if (!template) return;
    
    // Apply template data
    if (template.keyPoints) {
        keyPoints.value = template.keyPoints;
        keyPointsCount.textContent = keyPoints.value.length;
    }
    if (template.examples) {
        examples.value = template.examples;
        examplesCount.textContent = examples.value.length;
    }
    if (template.tone) {
        tone.value = template.tone;
    }
    if (template.length) {
        length.value = template.length;
    }
    
    // Clear existing tags and add new ones
    if (template.audience && Array.isArray(template.audience)) {
        audienceTagList = [];
        renderTags();
        template.audience.forEach(tag => {
            addTag(tag);
        });
    }
    
    // Update UI
    updateTopicPreview();
    updateAudienceCount();
    
    // Show success notification
    if (templateBtn) {
        const originalText = templateBtn.textContent;
        templateBtn.textContent = '✓ Template Loaded';
        templateBtn.style.background = '#10b981';
        setTimeout(() => {
            templateBtn.textContent = originalText;
            templateBtn.style.background = '';
        }, 2000);
    }
}

// Make functions available globally
window.removeTag = removeTag;
window.applyTemplate = applyTemplate;
window.allTemplates = allTemplates;

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
