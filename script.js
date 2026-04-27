const regexInput = document.getElementById('regexInput');
const sourceText = document.getElementById('sourceText');
const backdrop = document.getElementById('backdrop');
const resultList = document.getElementById('resultList');
const matchCount = document.getElementById('matchCount');
const regexError = document.getElementById('regexError');
const copyBtn = document.getElementById('copyBtn');
const clearBtn = document.getElementById('clearBtn');

let matches = [];

function handleInput() {
    const text = sourceText.value;
    const pattern = regexInput.value;

    regexError.textContent = '';
    matches = [];
    
    if (!pattern) {
        updateDisplay(text, escapeHTML(text));
        renderResults();
        return;
    }

    try {
        const re = new RegExp(pattern, 'g');
        const highlightedText = applyHighlights(text, re);
        updateDisplay(text, highlightedText);
        renderResults();
    } catch (e) {
        regexError.textContent = '无效的正则表达式: ' + e.message;
        updateDisplay(text, escapeHTML(text));
        renderResults();
    }
}

function applyHighlights(text, re) {
    let match;
    let lastIndex = 0;
    let result = '';
    
    if (re.global && re.source === "(?:)") {
        return escapeHTML(text);
    }

    re.lastIndex = 0;

    while ((match = re.exec(text)) !== null) {
        if (match.index === re.lastIndex) {
            re.lastIndex++;
        }
        
        matches.push(match[0]);
        
        result += escapeHTML(text.substring(lastIndex, match.index));
        result += '<mark>' + escapeHTML(match[0]) + '</mark>';
        lastIndex = match.index + match[0].length;
        
        if (!re.global) break;
    }
    
    result += escapeHTML(text.substring(lastIndex));
    
    // 关键修正：在 pre 标签中，如果以 \n 结尾，需要额外加一个 \n 才能撑开高度
    if (text.endsWith('\n')) {
        result += '\n';
    }
    
    return result;
}

function updateDisplay(originalText, highlightedHtml) {
    backdrop.innerHTML = highlightedHtml;
    syncScroll();
}

function renderResults() {
    matchCount.textContent = matches.length;
    
    if (matches.length === 0) {
        resultList.innerHTML = '<p class="empty-tip">等待匹配数据...</p>';
        return;
    }

    resultList.innerHTML = matches.map(m => `<div class="match-item">${escapeHTML(m)}</div>`).join('');
}

function escapeHTML(str) {
    return str
        .replace(/&/g, '&')
        .replace(/</g, '<')
        .replace(/>/g, '>')
        .replace(/"/g, '"')
        .replace(/'/g, '&#039;');
}

function syncScroll() {
    backdrop.scrollTop = sourceText.scrollTop;
    backdrop.scrollLeft = sourceText.scrollLeft;
}

// 事件监听
sourceText.addEventListener('input', handleInput);
regexInput.addEventListener('input', handleInput);
sourceText.addEventListener('scroll', syncScroll);

copyBtn.addEventListener('click', () => {
    if (matches.length === 0) return;
    const textToCopy = matches.join('\n');
    navigator.clipboard.writeText(textToCopy).then(() => {
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '已复制！';
        setTimeout(() => copyBtn.textContent = originalText, 2000);
    });
});

clearBtn.addEventListener('click', () => {
    sourceText.value = '';
    handleInput();
});

// 初始化
handleInput();
