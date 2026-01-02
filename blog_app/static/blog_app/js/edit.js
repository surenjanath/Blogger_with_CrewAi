// Edit Page JavaScript

// Get CSRF token
function getCsrfToken() {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'csrftoken') return value;
    }
    return '';
}

// Convert markdown to HTML (same as main.js)
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

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const postId = window.postId;
    const postContent = document.getElementById('postContent');
    const postTitle = document.getElementById('postTitle');
    const saveEditBtn = document.getElementById('saveEditBtn');
    const exportBtn = document.getElementById('exportBtn');
    const wordCount = document.getElementById('wordCount');
    const readTime = document.getElementById('readTime');
    
    // Convert markdown content to HTML if needed
    if (postContent) {
        // Check if content is markdown (has markdown syntax but no HTML tags)
        const textContent = postContent.textContent || '';
        const innerHTML = postContent.innerHTML || '';
        
        // If content looks like markdown (has markdown syntax) and doesn't have HTML tags
        if (textContent && (textContent.includes('**') || textContent.includes('##') || textContent.includes('`')) && !innerHTML.includes('<p>') && !innerHTML.includes('<h')) {
            const originalContent = textContent;
            const htmlContent = markdownToHtml(originalContent);
            postContent.innerHTML = htmlContent;
        }
    }
    
    // Update stats
    function updateStats() {
        const text = postContent.innerText || postContent.textContent;
        const words = text.split(/\s+/).filter(word => word.length > 0).length;
        const readingTime = Math.max(1, Math.ceil(words / 200));
        
        wordCount.textContent = `${words} words`;
        readTime.textContent = `${readingTime} min read`;
    }
    
    postContent.addEventListener('input', updateStats);
    postTitle.addEventListener('input', updateStats);
    updateStats();
    
    // Save functionality
    saveEditBtn.addEventListener('click', async () => {
        saveEditBtn.disabled = true;
        saveEditBtn.textContent = 'Saving...';
        
        try {
            const response = await fetch(`/api/post/${postId}/update/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCsrfToken(),
                },
                body: JSON.stringify({
                    title: postTitle.value || postTitle.textContent,
                    topic: postTitle.value || postTitle.textContent,
                    content: postContent.innerHTML
                }),
            });
            
            if (response.ok) {
                saveEditBtn.textContent = '✓ Saved';
                saveEditBtn.style.background = '#10b981';
                setTimeout(() => {
                    saveEditBtn.textContent = '💾 Save';
                    saveEditBtn.style.background = '';
                    saveEditBtn.disabled = false;
                }, 2000);
            } else {
                alert('Failed to save');
                saveEditBtn.disabled = false;
                saveEditBtn.textContent = '💾 Save';
            }
        } catch (error) {
            console.error('Error saving:', error);
            alert('Error saving post');
            saveEditBtn.disabled = false;
            saveEditBtn.textContent = '💾 Save';
        }
    });
    
    // Export functionality
    const exportModal = document.getElementById('exportModal');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            if (exportModal) {
                exportModal.classList.remove('hidden');
            }
        });
    }
    
    // Export options
    const exportPDF = document.getElementById('exportPDF');
    const exportMarkdown = document.getElementById('exportMarkdown');
    const exportText = document.getElementById('exportText');
    const exportHTML = document.getElementById('exportHTML');
    const closeExportModal = document.getElementById('closeExportModal');
    
    if (closeExportModal && exportModal) {
        closeExportModal.addEventListener('click', () => {
            exportModal.classList.add('hidden');
        });
    }
    
    if (exportPDF) {
        exportPDF.addEventListener('click', () => {
            exportModal.classList.add('hidden');
            
            const printWindow = window.open('', '_blank');
            const title = postTitle.value || postTitle.textContent;
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
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            margin: 24px 0;
                            font-size: 14px;
                        }
                        table thead {
                            background-color: #f6f8fa;
                        }
                        table th {
                            padding: 10px 13px;
                            text-align: left;
                            font-weight: 600;
                            color: #24292f;
                            border: 1px solid #d0d7de;
                            border-bottom: 2px solid #d0d7de;
                        }
                        table td {
                            padding: 10px 13px;
                            border: 1px solid #d0d7de;
                            color: #24292f;
                        }
                        table tbody tr {
                            background-color: #ffffff;
                        }
                        table tbody tr:nth-child(even) {
                            background-color: #f6f8fa;
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
            
            setTimeout(() => {
                printWindow.print();
            }, 250);
        });
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
    
    if (exportMarkdown) {
        exportMarkdown.addEventListener('click', () => {
            const content = postContent.innerHTML;
            const markdown = convertToMarkdown(content);
            const title = postTitle.value || postTitle.textContent;
            downloadFile(markdown, `${title.replace(/\s+/g, '-')}.md`, 'text/markdown');
            exportModal.classList.add('hidden');
        });
    }
    
    if (exportText) {
        exportText.addEventListener('click', () => {
            const text = postContent.innerText || postContent.textContent;
            const title = postTitle.value || postTitle.textContent;
            downloadFile(text, `${title.replace(/\s+/g, '-')}.txt`, 'text/plain');
            exportModal.classList.add('hidden');
        });
    }
    
    if (exportHTML) {
        exportHTML.addEventListener('click', () => {
            const title = postTitle.value || postTitle.textContent;
            const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.8; }
        h1, h2, h3 { color: #0f172a; }
        p { margin-bottom: 16px; }
    </style>
</head>
<body>
    <h1>${title}</h1>
    ${postContent.innerHTML}
</body>
</html>`;
            downloadFile(html, `${title.replace(/\s+/g, '-')}.html`, 'text/html');
            exportModal.classList.add('hidden');
        });
    }
});

