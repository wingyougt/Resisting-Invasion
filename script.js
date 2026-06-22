﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿// ================== 首页与弹窗系统 ==================

// ---------- 游戏全局状态 ----------
let gameState = {
    currentLevel: 1,
    currentWave: 1,
    gameStarted: false,
    isGameOver: false,
    lastResult: null, // { level, wave }
    loseReason: null, // 'enemyOverflow' | 'bossTimeout' | null
    bossTimerStarted: false,
    bossTimer: 0,
};

let gameRunning = false;
let gamePaused = false;

// ====== 升级音效 ======
let upgradeAudio = null;
function initUpgradeAudio() {
    upgradeAudio = new Audio('assets/bgm/升级护卫防御塔陷阱/a5c4575b2c53816bba1f32892dd4efb0.mp3');
    upgradeAudio.volume = 0.4;
    upgradeAudio.preload = 'auto';
    upgradeAudio.load();
}
function playUpgradeSound() {
    if (!upgradeAudio || !getSoundEnabled()) return;
    try {
        const a = upgradeAudio.cloneNode(true);
        a.volume = 0.4;
        a.play().catch(() => {});
    } catch(e) {}
}

// ====== 出售音效 ======
let sellAudio = null;
function initSellAudio() {
    sellAudio = new Audio('assets/bgm/出售陷阱和防御塔/b3100b9179e3b5c889e92cf258b661d8.mp3');
    sellAudio.volume = 0.9;
    sellAudio.preload = 'auto';
    sellAudio.load();
}
function playSellSound() {
    if (!sellAudio || !getSoundEnabled()) return;
    try {
        const a = sellAudio.cloneNode(true);
        a.volume = 0.9;
        a.play().catch(() => {});
    } catch(e) {}
}

// ====== 敌人过多警告状态 ======
let enemyWarning = {
    warning80Times: 0,
    warning80Timer: 0,
    warningText: '',
    warningAlpha: 0,
    warningDisplayTimer: 0,
};

// ====== UI 按钮点击音效 ======
let uiClickAudio = null;
function initUiClickAudio() {
    uiClickAudio = new Audio('assets/bgm/首页按钮/a34debd0-6710-44a6-8d83-4c134b44f004.wav');
    uiClickAudio.volume = 0.5;
    uiClickAudio.preload = 'auto';
    uiClickAudio.load();
}
function playUiClickSound() {
    if (!uiClickAudio || !getSoundEnabled()) return;
    try {
        const a = uiClickAudio.cloneNode(true);
        a.volume = 0.5;
        a.play().catch(() => {});
    } catch(e) {}
}
// 页面加载后立即预加载
document.addEventListener('DOMContentLoaded', () => {
    initUiClickAudio();
    initUpgradeAudio();
    initSellAudio();
});

// ---------- 存储键名 ----------
const STORAGE_KEYS = {
    LEADERBOARD: 'tdrg_leaderboard',
    LEVEL_PROGRESS: 'tdrg_level_progress',
    SOUND: 'tdrg_sound',
    MUSIC: 'tdrg_music',
};

function getEl(id) {
    return document.getElementById(id);
}

function safeText(id, value) {
    const el = getEl(id);
    if (el) el.textContent = value;
    return el;
}

// ---------- 初始化 ----------
document.addEventListener('DOMContentLoaded', () => {
    // 🔄 重置关卡进度到初始状态 —— 只有第1关解锁，从第1关开始
    resetToFreshStart();
    initHomePage();
    initSettings();
    initGame();
});

// ---------- 首页函数 ----------

function initHomePage() {
    loadSettings();
    generateLevelButtons();
    // 加载首页中间方块背景图片
    const homeContent = document.querySelector('.home-content');
    if (homeContent) {
        const img = new Image();
        img.onload = function() {
            homeContent.style.backgroundImage = 'url("' + img.src + '")';
            homeContent.style.backgroundSize = 'cover';
            homeContent.style.backgroundPosition = 'center';
            homeContent.style.backgroundRepeat = 'no-repeat';
        };
        img.onerror = function() {
            // 图片加载失败时保持默认渐变
        };
        img.src = 'assets/front page/1782099231837.jpg';
    }
    
    // 加载首页按钮背景图片（开始游戏、排行榜、设置共用同一素材）
    const homeBtns = document.querySelectorAll('.home-btns .home-btn');
    if (homeBtns.length > 0) {
        const btnImg = new Image();
        btnImg.onload = function() {
            for (const btn of homeBtns) {
                btn.style.backgroundImage = 'url("' + btnImg.src + '")';
                btn.style.backgroundSize = '130%';
                btn.style.backgroundPosition = 'center';
                btn.style.backgroundRepeat = 'no-repeat';
                btn.style.color = '#fff';
                btn.style.textShadow = '0 2px 4px rgba(0,0,0,0.8)';
            }
            // 关卡选择按钮也使用相同背景
            const levelBtns = document.querySelectorAll('.level-btn');
            for (const btn of levelBtns) {
                btn.style.backgroundImage = 'url("' + btnImg.src + '")';
                btn.style.backgroundSize = '220%';
                btn.style.backgroundPosition = 'center';
                btn.style.backgroundRepeat = 'no-repeat';
            }
            // 弹窗中的确定/取消按钮也使用相同背景
            const war3Btns = document.querySelectorAll('.war3-btn');
            for (const btn of war3Btns) {
                btn.style.backgroundImage = 'url("' + btnImg.src + '")';
                btn.style.backgroundSize = '220%';
                btn.style.backgroundPosition = 'center';
                btn.style.backgroundRepeat = 'no-repeat';
                btn.style.color = '#fff';
                btn.style.textShadow = '0 2px 4px rgba(0,0,0,0.8)';
            }
        };
        btnImg.src = 'assets/button/开始游戏/huaban-5100639574.webp';
    }
    
    // 加载底部小按钮背景图片
    const tinyBtns = document.querySelectorAll('.progress-tools .tiny-btn');
    const tinyBtnImages = [
        { btnIndex: 0, src: 'assets/button/修复进度/huaban-7053662796.webp' },
        { btnIndex: 1, src: 'assets/button/修复进度/huaban-7053662796.webp' }
    ];
    for (const config of tinyBtnImages) {
        const btn = tinyBtns[config.btnIndex];
        if (btn) {
            const img = new Image();
            img.onload = function() {
                btn.style.backgroundImage = 'url("' + img.src + '")';
                btn.style.backgroundSize = '220%';
                btn.style.backgroundPosition = 'center';
                btn.style.backgroundRepeat = 'no-repeat';
                btn.style.color = '#fff';
                btn.style.textShadow = '0 1px 3px rgba(0,0,0,0.8)';
                btn.style.border = 'none';
                btn.style.fontWeight = '500';
            };
            img.src = config.src;
        }
    }
    
    // 加载弹窗背景图片
    const modalContents = document.querySelectorAll('.modal-content');
    if (modalContents.length > 0) {
        const modalBg = new Image();
        modalBg.onload = function() {
            for (const mc of modalContents) {
                mc.style.backgroundImage = 'url("' + modalBg.src + '")';
                mc.style.backgroundSize = '200%';
                mc.style.backgroundPosition = 'center';
                mc.style.backgroundRepeat = 'no-repeat';
            }
        };
        modalBg.src = 'assets/button/弹窗背景/huaban-6046129199.webp';
    }
    
    // 加载加载进度背景图片
    const loadingContent = document.querySelector('.loading-content');
    if (loadingContent) {
        const loadBg = new Image();
        loadBg.onload = function() {
            loadingContent.style.backgroundImage = 'url("' + loadBg.src + '")';
            loadingContent.style.backgroundSize = '180% 130%';
            loadingContent.style.backgroundPosition = 'center';
            loadingContent.style.backgroundRepeat = 'no-repeat';
        };
        loadBg.src = 'assets/button/加载进度/huaban-6046129199.webp';
    }
}

// ====== 音效/音乐开关帮助函数 ======
function getSoundEnabled() {
    const el = getEl('soundToggle');
    if (el) return el.checked;
    return true; // 默认开启
}
function getMusicEnabled() {
    const el = getEl('musicToggle');
    if (el) return el.checked;
    return true; // 默认开启
}

function loadSettings() {
    const sound = localStorage.getItem(STORAGE_KEYS.SOUND);
    const music = localStorage.getItem(STORAGE_KEYS.MUSIC);
    const soundToggle = getEl('soundToggle');
    const musicToggle = getEl('musicToggle');
    if (soundToggle && sound !== null) soundToggle.checked = sound === 'true';
    if (musicToggle && music !== null) musicToggle.checked = music === 'true';
}

function saveSettings() {
    const soundToggle = getEl('soundToggle');
    const musicToggle = getEl('musicToggle');
    if (soundToggle) localStorage.setItem(STORAGE_KEYS.SOUND, soundToggle.checked);
    if (musicToggle) localStorage.setItem(STORAGE_KEYS.MUSIC, musicToggle.checked);
}

function initSettings() {
    const soundToggle = getEl('soundToggle');
    const musicToggle = getEl('musicToggle');
    if (soundToggle) soundToggle.addEventListener('change', saveSettings);
    if (musicToggle) musicToggle.addEventListener('change', () => { saveSettings(); toggleBGM(); });
}

function showModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('show');
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('show');
}

// War3风格自定义弹窗
let _war3PromptCallback = null;

function showWar3Alert(title, message) {
    document.getElementById('war3AlertTitle').textContent = title;
    document.getElementById('war3AlertMessage').textContent = message;
    showModal('war3AlertModal');
    // Enter键关闭提示弹窗
    setTimeout(function(){
        const modal = document.getElementById('war3AlertModal');
        modal.focus();
        const alertBtn = document.getElementById('war3AlertBtn');
        alertBtn.onkeydown = function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                closeModal('war3AlertModal');
            }
        };
        // 弹窗上的全局Enter监听
        modal.onkeydown = function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                closeModal('war3AlertModal');
            }
        };
    }, 50);
}

function showWar3Prompt(title, message, defaultValue, callback) {
    document.getElementById('war3PromptTitle').textContent = title;
    document.getElementById('war3PromptMessage').textContent = message;
    document.getElementById('war3PromptInput').value = defaultValue;
    _war3PromptCallback = callback;
    showModal('war3PromptModal');
    // 延迟聚焦输入框并选中内容
    setTimeout(function(){
        const input = document.getElementById('war3PromptInput');
        input.focus();
        input.select();
        input.onkeydown = function(e) {
            if (e.key === 'Enter') confirmWar3Prompt();
        };
    }, 100);
}

function confirmWar3Prompt() {
    const input = document.getElementById('war3PromptInput');
    const val = input.value;
    closeModal('war3PromptModal');
    if (_war3PromptCallback) {
        _war3PromptCallback(val);
        _war3PromptCallback = null;
    }
}

function togglePauseMenu() {
    if (!gameRunning || !gameState.gameStarted) return;
    playUiClickSound();
    if (gamePaused) {
        resumeGame();
    } else {
        pauseGame();
    }
}

// HUD 全部收起/展开（右侧按钮控制左右两侧）
function toggleHud() {
    const leftContent = document.querySelector('.hud-left-content');
    const rightContent = document.querySelector('.hud-right-content');
    const btn = document.getElementById('hudToggleBtn');
    if (!rightContent || !btn) return;
    const isHidden = rightContent.classList.toggle('hidden');
    if (leftContent) leftContent.classList.toggle('hidden', isHidden);
    btn.classList.toggle('collapsed');
    btn.textContent = isHidden ? '⬇️' : '⬆️';
}

function pauseGame() {
    if (!gameRunning) return;
    gamePaused = true;
    showModal('pauseModal');
}

function resumeGame() {
    playUiClickSound();
    gamePaused = false;
    closeModal('pauseModal');
    closeModal('perkListModal');
}

function showPerkList() {
    playUiClickSound();
    closeModal('pauseModal');
    const grid = document.getElementById('perkListGrid');
    if (!grid) return;
    grid.innerHTML = '';
    const owned = window.selectedPerks || [];
    const perkMap = window.PERKS || {};
    if (!owned || owned.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'perk-list-item';
        empty.innerHTML = '<h4>暂无已获得词条</h4><p>继续闯关可获取更多词条。</p>';
        grid.appendChild(empty);
    } else {
        // 统计各词条出现次数作为等级
        const perkCounts = {};
        owned.forEach(key => { perkCounts[key] = (perkCounts[key] || 0) + 1; });
        Object.keys(perkCounts).forEach(perkKey => {
            const perk = perkMap[perkKey] || { name: perkKey, desc: '' };
            const level = perkCounts[perkKey];
            const item = document.createElement('div');
            item.className = 'perk-list-item';
            item.innerHTML = `<h4>${perk.name} Lv.${level}</h4>`;
            grid.appendChild(item);
        });
    }
    showModal('perkListModal');
}

function closePerkList() {
    closeModal('perkListModal');
    showModal('pauseModal');
}

function showLevelSelect() {
    playUiClickSound();
    generateLevelButtons();
    showModal('levelSelectModal');
}

function showLeaderboard() {
    playUiClickSound();
    renderLeaderboard();
    showModal('leaderboardModal');
}

function showSettings() {
    playUiClickSound();
    loadSettings();
    showModal('settingsModal');
}

function closeResultModal() {
    closeModal('resultModal');
    backToHome();
    setTimeout(() => showLevelSelect(), 100);
}

function getLevelProgress() {
    const data = localStorage.getItem(STORAGE_KEYS.LEVEL_PROGRESS);
    return data ? JSON.parse(data) : { completed: {}, unlockedLevels: 1 };
}

function saveLevelProgress(progress) {
    localStorage.setItem(STORAGE_KEYS.LEVEL_PROGRESS, JSON.stringify(progress));
}

// ================== 重置到初始状态 ==================
function resetToFreshStart() {
    const progress = {
        completed: {},
        unlockedLevels: 1
    };
    saveLevelProgress(progress);
    // 清空排行榜记录，确保从零开始
    saveLeaderboard([]);
}

// ================== 进度修复工具 ==================
function repairProgress() {
    const progress = getLevelProgress();
    let changed = false;
    
    // 检查并修复不合理的进度
    const maxCompleted = Object.keys(progress.completed)
        .map(Number)
        .filter(k => progress.completed[k] && progress.completed[k].wave >= 20)
        .sort((a, b) => b - a);
    
    if (maxCompleted.length > 0) {
        const highestCompleted = maxCompleted[0];
        if (progress.unlockedLevels < highestCompleted + 1) {
            progress.unlockedLevels = highestCompleted + 1;
            changed = true;
        }
    }
    
    // 确保unlockedLevels至少为1
    if (progress.unlockedLevels < 1) {
        progress.unlockedLevels = 1;
        changed = true;
    }
    
    // 确保unlockedLevels不超过3
    if (progress.unlockedLevels > 3) {
        progress.unlockedLevels = 3;
        changed = true;
    }
    
    if (changed) {
        saveLevelProgress(progress);
        showWar3Alert('修复进度', '✅ 关卡进度已自动修复！\n\n如有疑问，可点击「手动设置进度」按钮。');
    } else {
        showWar3Alert('修复进度', '✅ 进度数据正常，无需修复。\n\n当前进度：\n' +
            `已解锁: 第 ${progress.unlockedLevels} 关\n` +
            `已通关: ${Object.keys(progress.completed).filter(k => progress.completed[k].wave >= 20).length} 关`);
    }
    
    generateLevelButtons();
}

function fixProgressManually() {
    const progress = getLevelProgress();
    const currentUnlocked = progress.unlockedLevels;
    showWar3Prompt(
        '设置进度',
        '输入你想解锁到的关卡数 (1-3)：\n' +
        `当前已解锁到第 ${currentUnlocked} 关\n` +
        `已通关关卡: ${Object.keys(progress.completed).sort((a,b)=>a-b).join(', ') || '无'}`,
        currentUnlocked,
        function(input) {
            if (input === null || input.trim() === '') return;
            const level = parseInt(input);
            if (isNaN(level) || level < 1 || level > 3) {
                showWar3Alert('设置进度', '请输入1到3之间的数字！');
                return;
            }
            progress.unlockedLevels = Math.max(currentUnlocked, level);
            saveLevelProgress(progress);
            showWar3Alert('设置进度', `✅ 已解锁到第 ${progress.unlockedLevels} 关！`);
            generateLevelButtons();
        }
    );
}

function generateLevelButtons() {
    const grid = document.getElementById('levelGrid');
    if (!grid) return;
    grid.innerHTML = '';
    const progress = getLevelProgress();
    for (let i = 1; i <= 3; i++) {
        const btn = document.createElement('button');
        btn.className = 'level-btn';
        const numSpan = document.createElement('span');
        numSpan.className = 'level-num';
        numSpan.textContent = i;
        btn.appendChild(numSpan);
        if (progress.completed[i]) {
            btn.classList.add('completed');
            const starsSpan = document.createElement('span');
            starsSpan.className = 'level-stars';
            starsSpan.textContent = progress.completed[i].stars || '★';
            btn.appendChild(starsSpan);
        } else if (i > progress.unlockedLevels) {
            btn.classList.add('locked');
            const lockSpan = document.createElement('span');
            lockSpan.textContent = '🔒';
            btn.appendChild(lockSpan);
        }
        if (i === progress.unlockedLevels && !progress.completed[i]) btn.classList.add('current');
        btn.addEventListener('click', () => {
            if (progress.completed[i] || i <= progress.unlockedLevels) startGame(i);
        });
        grid.appendChild(btn);
    }
}

function showLoadingScreen(level, callback) {
    const loadingScreen = getEl('loadingScreen');
    const loadingBar = getEl('loadingBar');
    const loadingPercent = getEl('loadingPercent');
    const loadingLevelText = getEl('loadingLevelText');
    if (!loadingScreen || !loadingBar || !loadingPercent || !loadingLevelText) {
        console.error('加载界面 DOM 元素缺失', { loadingScreen, loadingBar, loadingPercent, loadingLevelText });
        return;
    }
    loadingLevelText.textContent = `关卡 ${level}`;
    loadingScreen.classList.add('show');
    let progress = 0;
    function getRandomStep() { return Math.max(1, Math.floor(Math.random() * 3) + 1); }
    function updateLoading() {
        if (progress >= 100) {
            progress = 100;
            loadingBar.style.width = '100%';
            loadingPercent.textContent = '100%';
            setTimeout(() => {
                try {
                    gameState.gameStarted = true;
                    resetGameForLevel(level);
                    loadingScreen.classList.remove('show');
                    const homeScreen = getEl('homeScreen');
                    const canvas = getEl('gameCanvas');
                    const gameHUD = getEl('gameHUD');
                    const uiContainer = getEl('uiContainer');
                    const unitContainer = getEl('unitContainer');
                    const gameLevel = getEl('gameLevel');
                    const skillIcon = getEl('skillIcon');
                    if (homeScreen) homeScreen.style.display = 'none';
                    if (canvas) canvas.style.display = 'block';
                    if (gameHUD) gameHUD.style.display = 'flex';
                    if (skillIcon) skillIcon.style.display = 'flex';
                    if (uiContainer) uiContainer.style.display = 'block';
                    if (unitContainer) unitContainer.style.display = 'block';
                    if (gameLevel) gameLevel.textContent = `关卡: ${level}`;
                    startBGM();
                    if (callback) callback();
                } catch (e) {
                    console.error('❌ 游戏初始化出错:', e);
                    alert('游戏初始化出错: ' + e.message + '\n请刷新页面重试');
                    loadingScreen.classList.remove('show');
                    const homeScreen = getEl('homeScreen');
                    if (homeScreen) homeScreen.style.display = 'flex';
                }
            }, 400);
            return;
        }
        const step = getRandomStep();
        progress = Math.min(100, progress + step);
        loadingBar.style.width = `${progress}%`;
        loadingPercent.textContent = `${progress}%`;
        setTimeout(updateLoading, 20 + Math.random() * 15);
    }
    loadingBar.style.width = '0%';
    loadingPercent.textContent = '0%';
    setTimeout(updateLoading, 200);
}

function startGame(level) {
    playUiClickSound();
    closeModal('levelSelectModal');
    gameState.currentLevel = level;
    gameState.gameStarted = true;
    gameState.isGameOver = false;
    gameState.lastResult = null;
    showLoadingScreen(level);
}

function retryLevel() {
    playUiClickSound();
    startGame(gameState.lastResult ? gameState.lastResult.level : gameState.currentLevel);
}

function backToHome() {
    playUiClickSound();
    gameState.gameStarted = false;
    gamePaused = false;
    closeModal('pauseModal');
    closeModal('perkListModal');
    gameState.isGameOver = false;
    document.getElementById('gameCanvas').style.display = 'none';
    document.getElementById('gameHUD').style.display = 'none';
    document.getElementById('uiContainer').style.display = 'none';
    document.getElementById('unitContainer').style.display = 'none';
    document.getElementById('homeScreen').style.display = 'flex';
    stopBGM();
}

function getLeaderboard() {
    const data = localStorage.getItem(STORAGE_KEYS.LEADERBOARD);
    return data ? JSON.parse(data) : [];
}

function saveLeaderboard(records) {
    localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(records));
}

function addLeaderboardRecord(level, wave) {
    const records = getLeaderboard();
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    records.push({ level, wave, time: timeStr, timestamp: now.getTime() });
    records.sort((a,b) => b.level!==a.level ? b.level-a.level : b.wave-a.wave);
    if (records.length > 50) records.length = 50;
    saveLeaderboard(records);
}

function renderLeaderboard() {
    const container = document.getElementById('leaderboardContent');
    if (!container) return;
    const records = getLeaderboard();
    if (records.length === 0) {
        container.innerHTML = '<div class="empty-leaderboard">暂无记录，快去挑战吧！</div>';
        return;
    }
    let html = '';
    records.slice(0, 20).forEach((record, index) => {
        let rank = index + 1;
        if (index === 0) rank = '🥇';
        else if (index === 1) rank = '🥈';
        else if (index === 2) rank = '🥉';
        html += `<div class="leaderboard-item"><div class="leaderboard-rank">${rank}</div><div class="leaderboard-info"><div class="leaderboard-level">关卡 ${record.level}</div><div class="leaderboard-wave">存活波次: ${record.wave}</div></div><div class="leaderboard-time">${record.time}</div></div>`;
    });
    container.innerHTML = html;
}

function clearLeaderboard() {
    if (confirm('确定要清空所有排行榜记录吗？')) {
        saveLeaderboard([]);
        renderLeaderboard();
    }
}

const MAX_WAVES_PER_LEVEL = 20;

function showGameResult(level, wave) {
    const existingResultModal = document.getElementById('resultModal');
    if (gameState.isGameOver && existingResultModal && existingResultModal.classList.contains('show')) return;
    gameState.lastResult = { level, wave };
    gameState.isGameOver = true;
    addLeaderboardRecord(level, wave);
    // 新通关条件：打满20波即为通关
    const isWin = wave >= MAX_WAVES_PER_LEVEL;
    const loseReason = gameState.loseReason;
    const progress = getLevelProgress();
    if (isWin) {
        progress.completed[level] = { wave, stars: '★' };
        if (level < 3 && level >= progress.unlockedLevels) {
            progress.unlockedLevels = level + 1;
        }
    }
    saveLevelProgress(progress);

    const resultBtns = document.querySelector('#resultModal .result-btns');
    const closeBtn = document.querySelector('#resultModal .close-btn');
    const resultStats = document.getElementById('resultBody').querySelector('.result-stats');

    if (isWin) {
        document.getElementById('resultTitle').textContent = '—  胜 利  —';
        document.getElementById('resultLevel').textContent = level;
        document.getElementById('resultWave').textContent = wave;
        if (resultBtns) resultBtns.style.display = 'none';
        if (closeBtn) closeBtn.style.display = 'none';
        const waveLabel = document.querySelector('.result-stats p:nth-child(2)');
        if (waveLabel) waveLabel.innerHTML = '通关波次: <span id="resultWave">' + wave + '</span>';
        const banner = document.querySelector('.result-banner');
        if (banner) banner.className = 'result-banner result-banner-victory';
        if (resultStats) {
            const existingTip = resultStats.querySelector('.result-tip');
            if (existingTip) existingTip.remove();
            const tip = document.createElement('p');
            tip.className = 'result-tip';
            tip.textContent = '点击屏幕退出';
            resultStats.appendChild(tip);
        }
    } else if (loseReason === 'enemyOverflow') {
        document.getElementById('resultTitle').textContent = '—  失 败  —';
        document.getElementById('resultLevel').textContent = level;
        document.getElementById('resultWave').textContent = wave;
        if (resultBtns) resultBtns.style.display = 'none';
        if (closeBtn) closeBtn.style.display = 'none';
        const waveLabel = document.querySelector('.result-stats p:nth-child(2)');
        if (waveLabel) waveLabel.innerHTML = '最终波次: <span id="resultWave">' + wave + '</span>';
        const banner = document.querySelector('.result-banner');
        if (banner) banner.className = 'result-banner result-banner-defeat';
        if (resultStats) {
            const existingTip = resultStats.querySelector('.result-tip');
            if (existingTip) existingTip.remove();
            const tip = document.createElement('p');
            tip.className = 'result-tip';
            tip.textContent = '敌人数量超过100！点击屏幕退出';
            resultStats.appendChild(tip);
        }
    } else if (loseReason === 'bossTimeout') {
        document.getElementById('resultTitle').textContent = '—  失 败  —';
        document.getElementById('resultLevel').textContent = level;
        document.getElementById('resultWave').textContent = wave;
        if (resultBtns) resultBtns.style.display = 'none';
        if (closeBtn) closeBtn.style.display = 'none';
        const waveLabel = document.querySelector('.result-stats p:nth-child(2)');
        if (waveLabel) waveLabel.innerHTML = '最终波次: <span id="resultWave">' + wave + '</span>';
        const banner = document.querySelector('.result-banner');
        if (banner) banner.className = 'result-banner result-banner-defeat';
        if (resultStats) {
            const existingTip = resultStats.querySelector('.result-tip');
            if (existingTip) existingTip.remove();
            const tip = document.createElement('p');
            tip.className = 'result-tip';
            tip.textContent = 'BOSS未在2分钟内消灭！点击屏幕退出';
            resultStats.appendChild(tip);
        }
    } else {
        document.getElementById('resultTitle').textContent = '—  失 败  —';
        document.getElementById('resultLevel').textContent = level;
        document.getElementById('resultWave').textContent = wave;
        if (resultBtns) resultBtns.style.display = 'none';
        if (closeBtn) closeBtn.style.display = 'none';
        const waveLabel = document.querySelector('.result-stats p:nth-child(2)');
        if (waveLabel) waveLabel.innerHTML = '最终波次: <span id="resultWave">' + wave + '</span>';
        const banner = document.querySelector('.result-banner');
        if (banner) banner.className = 'result-banner result-banner-defeat';
        if (resultStats) {
            const existingTip = resultStats.querySelector('.result-tip');
            if (existingTip) existingTip.remove();
            const tip = document.createElement('p');
            tip.className = 'result-tip';
            tip.textContent = '点击屏幕退出';
            resultStats.appendChild(tip);
        }
    }
    stopBGM();
    showModal('resultModal');
    const resultModal = document.getElementById('resultModal');
    function handleResultClick(e) {
        if (isWin || loseReason) {
            closeResultModal();
            resultModal.removeEventListener('click', handleResultClick);
            return;
        }
        if (e.target.closest('.result-btns') || e.target.closest('.close-btn') || e.target.closest('.modal-header')) return;
        closeResultModal();
        resultModal.removeEventListener('click', handleResultClick);
    }
    const oldHandler = resultModal._clickHandler;
    if (oldHandler) resultModal.removeEventListener('click', oldHandler);
    resultModal.addEventListener('click', handleResultClick);
    resultModal._clickHandler = handleResultClick;
}

// ================== 开始游戏背景音乐（全局） ==================
const bgmSound = new Audio();
bgmSound.loop = true;
bgmSound.volume = 0.2;
let bgmStarted = false;
let bgmLoading = false;
let bgmReady = false;

// 预加载BGM
function loadBGM() {
    if (bgmLoading || bgmReady) return;
    bgmLoading = true;
    bgmSound.src = 'assets/bgm/开始游戏/开始游戏.mp3';
    bgmSound.load();
    bgmSound.addEventListener('canplaythrough', function() {
        bgmReady = true;
        // 如果已经标记了要播放，自动开始
        if (bgmStarted && getMusicEnabled()) {
            bgmSound.play().catch(function(){});
        }
    });
    bgmSound.addEventListener('error', function() {
        // 加载失败，3秒后重试
        bgmLoading = false;
        setTimeout(loadBGM, 3000);
    });
}
// 页面加载后立即预加载BGM（不播放）
if (typeof window !== 'undefined') {
    if (document.readyState === 'complete') {
        loadBGM();
    } else {
        window.addEventListener('load', loadBGM);
    }
}

function startBGM() {
    if (bgmStarted) return;
    if (!getMusicEnabled()) return;
    bgmStarted = true;
    if (bgmReady) {
        bgmSound.play().catch(function(){});
    }
    // 如果还没加载好，等canplaythrough自动播放
}

// 当音乐开关变化时 启停BGM
function toggleBGM() {
    if (getMusicEnabled()) {
        if (!bgmReady) loadBGM(); // 确保加载
        if (!bgmStarted) {
            bgmStarted = true;
            if (bgmReady) {
                bgmSound.currentTime = 0;
                bgmSound.play().catch(function(){});
            }
        } else {
            bgmSound.play().catch(function(){});
        }
    } else {
        bgmSound.pause();
        bgmSound.currentTime = 0;
    }
}
function stopBGM() {
    if (!bgmStarted) return;
    bgmStarted = false;
    bgmSound.pause();
    bgmSound.currentTime = 0;
}

// ================== 游戏核心初始化 ==================

function initGame() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // ================== 网格系统 ==================
    const GRID_SIZE = 40;
    // 固定29列 × 40px = 1160px 画布宽度
    const CANVAS_GRID_COLS = 29;
    const CANVAS_GRID_ROWS = 18;
    canvas.width = CANVAS_GRID_COLS * GRID_SIZE;
    canvas.height = CANVAS_GRID_ROWS * GRID_SIZE;
    let lastTime = 0;

    const COLS = Math.floor(canvas.width / GRID_SIZE);
    const ROWS = Math.floor(canvas.height / GRID_SIZE);
    const CRYSTAL_COL = Math.floor(COLS / 2);
    const CRYSTAL_ROW = ROWS - 1;
    const CRYSTAL_ARRIVAL_RADIUS = 55;
    // 路径辅助常量（自动适应画布宽度）
    const L1 = 0, L2 = 3, L3 = Math.floor(CRYSTAL_COL / 3);          // 左侧三档
    const R1 = COLS - 1, R2 = COLS - 4, R3 = COLS - 1 - Math.floor(CRYSTAL_COL / 3); // 右侧三档
    const T1 = 1, T2 = 3, M1 = Math.floor(CRYSTAL_ROW / 3), M2 = Math.floor(CRYSTAL_ROW * 0.5);
    const CENTER_COL = Math.floor((COLS - 1) / 2);  // 水平居中列 (20列时 = 9)
    const CENTER_ROW = Math.floor(ROWS / 2); // 真正的垂直中心

    function getGridFromPosition(x, y) {
        const col = Math.floor(x / GRID_SIZE);
        const row = Math.floor(y / GRID_SIZE);
        return { col: Math.max(0, Math.min(col, COLS-1)), row: Math.max(0, Math.min(row, ROWS-1)) };
    }

    function getPositionFromGrid(col, row) {
        return { x: col * GRID_SIZE + GRID_SIZE/2, y: row * GRID_SIZE + GRID_SIZE/2 };
    }

    function gridCenter(col, row) {
        return { x: col * GRID_SIZE + GRID_SIZE/2, y: row * GRID_SIZE + GRID_SIZE/2 };
    }

    const pathOccupiedGrids = new Set();

    function getLineCoveredGrids(x1, y1, x2, y2) {
        const grids = new Set();
        let col1 = Math.floor(x1 / GRID_SIZE), row1 = Math.floor(y1 / GRID_SIZE);
        let col2 = Math.floor(x2 / GRID_SIZE), row2 = Math.floor(y2 / GRID_SIZE);
        col1 = Math.max(0, Math.min(COLS-1, col1));
        col2 = Math.max(0, Math.min(COLS-1, col2));
        row1 = Math.max(0, Math.min(ROWS-1, row1));
        row2 = Math.max(0, Math.min(ROWS-1, row2));
        const dc = Math.abs(col2-col1), dr = Math.abs(row2-row1);
        const sc = col1<col2?1:-1, sr = row1<row2?1:-1;
        let err = dc-dr, c=col1, r=row1;
        while (true) {
            grids.add(`${c},${r}`);
            if (c===col2 && r===row2) break;
            const e2 = 2*err;
            if (e2 > -dr) { err -= dr; c += sc; }
            if (e2 < dc) { err += dc; r += sr; }
        }
        return grids;
    }

    function getLevelPaths(level) {
        const indices = getActivePathIndices(level || gameState.currentLevel);
        return indices.map(idx => pathPool[idx]);
    }

    function calculatePathOccupiedGrids(level) {
        pathOccupiedGrids.clear();
        const activePaths = cachedActivePaths.length > 0 ? cachedActivePaths : getLevelPaths(level || gameState.currentLevel);
        for (const path of activePaths) {
            for (let i = 0; i < path.waypoints.length-1; i++) {
                const start = path.waypoints[i], end = path.waypoints[i+1];
                const grids = getLineCoveredGrids(start.x, start.y, end.x, end.y);
                for (const key of grids) pathOccupiedGrids.add(key);
            }
        }
    }

    function isGridOnPath(col, row) { return pathOccupiedGrids.has(`${col},${row}`); }

    function isGridOccupiedByBuilding(col, row) {
        for (const tower of towers) {
            const g = getGridFromPosition(tower.x, tower.y);
            if (g.col === col && g.row === row) return true;
        }
        for (let i = 0; i < campCount; i++) {
            if (!camps[i] || !camps[i].alive) continue;
            const g = getGridFromPosition(camps[i].x, camps[i].y);
            if (g.col === col && g.row === row) return true;
        }
        return false;
    }

    function canPlaceOnGrid(col, row, isTrap = false) {
        if (isGridOccupiedByBuilding(col, row)) return false;
        if (isTrap) return true;
        return !isGridOnPath(col, row);
    }

    // 营地放置检查：不能与其他建筑重叠，但允许放在路径上
    function canPlaceCampOnGrid(col, row) {
        if (isGridOccupiedByBuilding(col, row)) return false;
        return true;
    }

    // ================== 资源定义 ==================
    const gameAssets = {
        towers: {
            arrowTower: { type:'arrowTower', name:'机枪猫', cost:100, color:'#00FFFF', size:24, attackRange:150, attackDamage:5, attackSpeed:1.2, bulletSpeed:300, health:50, description:'前期过渡主力，具备穿透伤害与对空能力，适合清理低血量小怪群。', upgradeCost:20, upgradeDamagePerLvl:5, upgradeHpPerLvl:10 },
            flameTower: { type:'flameTower', name:'炮兵猫', cost:200, color:'#FF4500', size:24, attackRange:80, attackDamage:5, attackSpeed:1, bulletSpeed:220, health:100, description:'中期范围输出核心，可同时攻击3个目标，克制密集怪群。', upgradeCost:30, upgradeDamagePerLvl:5, upgradeHpPerLvl:20 },
            frostTower: { type:'frostTower', name:'冰霜女', cost:100, color:'#ADD8E6', size:24, attackRange:150, attackDamage:5, attackSpeed:0.8, bulletSpeed:280, slowDuration:3, slowPercentage:0.3, health:50, description:'全局控场关键，能大幅减速敌人，为输出塔创造输出窗口。', upgradeCost:30, upgradeSlowPerLvl:0.05, upgradeHpPerLvl:20 },
            laserTower: { type:'laserTower', name:'火箭鼠', cost:400, color:'#FF00FF', size:24, attackRange:250, attackDamage:20, attackSpeed:0.8, bulletSpeed:400, health:200, description:'后期单体爆发塔，无视部分护甲，专门针对精英怪和BOSS。', upgradeCost:50, upgradeDamagePerLvl:20, upgradeHpPerLvl:20 },
            goldMine: { type:'goldMine', name:'金矿', cost:100, color:'#FFD700', size:24, attackRange:0, attackDamage:0, attackSpeed:0, bulletSpeed:0, health:10, description:'经济支援塔，每波提供金币收益，周围有输出塔时可额外增加收益。', upgradeCost:20, upgradeGoldPerLvl:3 }
        },
        traps: {
            blockTrap: { type:'blockTrap', name:'障碍物', cost:50, color:'#8B4513', size:20, health:100, description:'物理阻挡类陷阱，可分割敌人阵型，被摧毁后能自动重生。', upgradeCost:50, upgradeHpPerLvl:50 },
            iceSpikeTrap: { type:'iceSpikeTrap', name:'减速带', cost:100, color:'#B0E0E6', size:20, damage:0, slowFactor:0.3, description:'持续减速陷阱，每1秒造成1点流血伤害，配合输出塔可最大化伤害效果。', upgradeCost:100, upgradeSlowPerLvl:0.08 },
            explosiveTrap: { type:'explosiveTrap', name:'爆炸区', cost:200, color:'#FF0000', size:20, damage:50, explosionRadius:80, cooldown:20, description:'定点清场陷阱，对范围内所有敌人造成高额爆炸伤害，冷却时间较长。', upgradeCost:100, upgradeDamagePerLvl:25 },
            bounceTrap: { type:'bounceTrap', name:'传送器', cost:200, color:'#00FF00', size:20, bounceDistance:140, cooldown:20, description:'位移控场类陷阱，可将敌人传送退后数格，打乱敌人阵型。', upgradeCost:100, upgradeCooldownReduction:2 }
        }
    };

    // ================== 敌人类型系统 ==================
    const ENEMY_TYPES = { NORMAL:'normal', FAST:'fast', TANK:'tank', ARMORED:'armored', SHARPSHOOTER:'sharpshooter', DESTROYER_MAGE:'destroyerMage', MINI_BOSS:'miniBoss', BOSS:'boss' };
    const ENEMY_CONFIG = {
        [ENEMY_TYPES.NORMAL]: { name:'普通小兵', width:20, height:20, color:'#FF4444', baseSpeed:24, baseHealth:100, attackDamage:2, attackSpeed:0.5, goldReward:5, expReward:1, isBoss:false, isArmored:false },
        [ENEMY_TYPES.FAST]: { name:'快速斥候', width:16, height:16, color:'#FF8800', baseSpeed:40, baseHealth:100, attackDamage:4, attackSpeed:0.5, goldReward:5, expReward:2, isBoss:false, isArmored:false },
        [ENEMY_TYPES.TANK]: { name:'重甲步兵', width:28, height:28, color:'#8844AA', baseSpeed:18, baseHealth:200, attackDamage:5, attackSpeed:0.4, goldReward:10, expReward:3, isBoss:false, isArmored:true },
        [ENEMY_TYPES.ARMORED]: { name:'精英护卫', width:24, height:24, color:'#FF00FF', baseSpeed:22, baseHealth:400, attackDamage:10, attackSpeed:0.45, attackRange:80, projectileSpeed:300, projectileRadius:4, projectileColor:'#FF00FF', goldReward:20, expReward:3, isBoss:false, isArmored:true },
        [ENEMY_TYPES.SHARPSHOOTER]: { name:'神射手', width:20, height:20, color:'#E6E6E6', baseSpeed:24, baseHealth:100, attackDamage:10, attackSpeed:0.4, attackRange:120, projectileSpeed:360, projectileRadius:4, projectileColor:'#F0F0F0', goldReward:10, expReward:3, isBoss:false, isArmored:false },
        [ENEMY_TYPES.DESTROYER_MAGE]: { name:'毁灭法师', width:22, height:22, color:'#AA66FF', baseSpeed:20, baseHealth:200, attackDamage:15, attackSpeed:0.35, attackRange:120, projectileSpeed:320, projectileRadius:6, projectileColor:'#AA66FF', goldReward:15, expReward:4, isBoss:false, isArmored:false },
        [ENEMY_TYPES.MINI_BOSS]: { name:'精英BOSS', width:42, height:42, color:'#FF6600', baseSpeed:18, baseHealth:1000, attackDamage:50, attackSpeed:0.3, attackRange:120, projectileSpeed:280, projectileRadius:6, projectileColor:'#FF6600', goldReward:50, expReward:12, isBoss:true, isArmored:true },
        [ENEMY_TYPES.BOSS]: { name:'大BOSS', width:55, height:55, color:'#FF0000', baseSpeed:14, baseHealth:2000, attackDamage:100, attackSpeed:0.25, attackRange:150, projectileSpeed:260, projectileRadius:8, projectileColor:'#FF0000', goldReward:100, expReward:25, isBoss:true, isArmored:true }
    };

    function getRandomEnemyType(level, wave, allowSpecial) {
        const types = [ENEMY_TYPES.NORMAL];
        if (wave >= 3) types.push(ENEMY_TYPES.FAST);
        if (wave >= 5) types.push(ENEMY_TYPES.TANK);
        if (wave >= 7) types.push(ENEMY_TYPES.ARMORED);
        // 神射手从第3波开始出现
        const sharpshooterWave = 3;
        if (wave >= sharpshooterWave) types.push(ENEMY_TYPES.SHARPSHOOTER);
        if (wave >= 12) types.push(ENEMY_TYPES.DESTROYER_MAGE);
        return types[Math.floor(Math.random() * types.length)];
    }

    function getWaveConfig(level, wave) {
        const levelMultiplier = level === 1 ? 1.0 : 1.25;
        const mappedLevel = [0, 1, 6, 11, 16, 21][level] || level;
        const lateGameFactor = mappedLevel >= 11 ? 1.0 + (mappedLevel - 10) * 0.2 : 0;
        const waveMultiplier = 1 + (wave-1)*0.1 + lateGameFactor * 0.5;
        const difficultyMultiplier = levelMultiplier * waveMultiplier;
        const attackLevelMult = 1.0;
        const scaledEnemyCount = 100;
        const baseDelay = 2.0;
        const enemyQueue = [];
        let totalDelay = 0;

        // ========== 关卡1 自定义波次刷新表 ==========
        if (level === 1) {
            // 根据波次选择可用敌人类型
            let types = [ENEMY_TYPES.NORMAL, ENEMY_TYPES.FAST];
            let bossQueue = [];
            if (wave <= 2) {
                // 第1-2波：普通小兵 + 快速斥候
                types = [ENEMY_TYPES.NORMAL, ENEMY_TYPES.FAST];
            } else if (wave <= 4) {
                // 第3-4波：普通小兵 + 快速斥候 + 神射手
                types = [ENEMY_TYPES.NORMAL, ENEMY_TYPES.FAST, ENEMY_TYPES.SHARPSHOOTER];
            } else if (wave <= 6) {
                // 第5-6波：普通小兵 + 快速斥候 + 重甲步兵
                types = [ENEMY_TYPES.NORMAL, ENEMY_TYPES.FAST, ENEMY_TYPES.TANK];
            } else if (wave <= 9) {
                // 第7-9波：普通小兵 + 快速斥候 + 重甲步兵 + 精英护卫
                types = [ENEMY_TYPES.NORMAL, ENEMY_TYPES.FAST, ENEMY_TYPES.TANK, ENEMY_TYPES.ARMORED];
            } else if (wave === 10) {
                // 第10波：普通小兵 + 快速斥候 + 重甲步兵 + 精英护卫 + 精英BOSS×1
                types = [ENEMY_TYPES.NORMAL, ENEMY_TYPES.FAST, ENEMY_TYPES.TANK, ENEMY_TYPES.ARMORED];
                bossQueue.push({ type: ENEMY_TYPES.MINI_BOSS, healthMult: difficultyMultiplier*2.5, speedMult: 1.1+(level-1)*0.02 });
            } else if (wave <= 12) {
                // 第11-12波：普通小兵 + 快速斥候 + 重甲步兵 + 毁灭法师
                types = [ENEMY_TYPES.NORMAL, ENEMY_TYPES.FAST, ENEMY_TYPES.TANK, ENEMY_TYPES.DESTROYER_MAGE];
            } else if (wave <= 14) {
                // 第13-14波：普通小兵 + 快速斥候 + 重甲步兵 + 神射手 + 精英护卫
                types = [ENEMY_TYPES.NORMAL, ENEMY_TYPES.FAST, ENEMY_TYPES.TANK, ENEMY_TYPES.SHARPSHOOTER, ENEMY_TYPES.ARMORED];
            } else if (wave <= 16) {
                // 第15-16波：普通小兵 + 快速斥候 + 重甲步兵 + 毁灭法师 + 精英护卫
                types = [ENEMY_TYPES.NORMAL, ENEMY_TYPES.FAST, ENEMY_TYPES.TANK, ENEMY_TYPES.DESTROYER_MAGE, ENEMY_TYPES.ARMORED];
            } else if (wave <= 19) {
                // 第17-19波：普通小兵 + 快速斥候 + 重甲步兵 + 毁灭法师 + 神射手
                types = [ENEMY_TYPES.NORMAL, ENEMY_TYPES.FAST, ENEMY_TYPES.TANK, ENEMY_TYPES.DESTROYER_MAGE, ENEMY_TYPES.SHARPSHOOTER];
            } else if (wave === 20) {
                // 第20波：普通小兵 + 快速斥候 + 重甲步兵 + 神射手 + 毁灭法师 + 精英护卫 + 精英BOSS×1 + 大BOSS×1
                types = [ENEMY_TYPES.NORMAL, ENEMY_TYPES.FAST, ENEMY_TYPES.TANK, ENEMY_TYPES.SHARPSHOOTER, ENEMY_TYPES.DESTROYER_MAGE, ENEMY_TYPES.ARMORED];
                bossQueue.push({ type: ENEMY_TYPES.MINI_BOSS, healthMult: difficultyMultiplier*2.5, speedMult: 1.1+(level-1)*0.02 });
                bossQueue.push({ type: ENEMY_TYPES.BOSS, healthMult: difficultyMultiplier*3.5, speedMult: 1.3+(level-1)*0.03 });
            }

            // 平均分配敌人数量
            const perType = Math.floor(scaledEnemyCount / types.length);
            const remainder = scaledEnemyCount - perType * types.length;
            const counts = types.map(function(t, idx){ return perType + (idx < remainder ? 1 : 0); });

            for (let t = 0; t < types.length; t++) {
                const type = types[t];
                const count = counts[t];
                for (let i = 0; i < count; i++) {
                    let healthM = difficultyMultiplier;
                    if (type === ENEMY_TYPES.FAST) healthM *= 0.8;
                    else if (type === ENEMY_TYPES.TANK) healthM *= 1.5;
                    else if (type === ENEMY_TYPES.ARMORED) healthM *= 1.8;
                    else if (type === ENEMY_TYPES.SHARPSHOOTER) healthM *= 0.9;
                    enemyQueue.push({
                        type: type, healthMult: healthM, speedMult: 1+(wave-1)*0.015,
                        goldMult: 1+(level-1)*0.1, delay: totalDelay, isBoss: false
                    });
                    const delayMult = type === ENEMY_TYPES.FAST ? 0.7 :
                        (type === ENEMY_TYPES.TANK || type === ENEMY_TYPES.ARMORED ? 1.3 : 1.0);
                    totalDelay += baseDelay * delayMult;
                }
            }

            // 加入BOSS（在第10波/20波最后）
            for (let b = 0; b < bossQueue.length; b++) {
                totalDelay += 1.5;
                const boss = bossQueue[b];
                enemyQueue.push({
                    type: boss.type, healthMult: boss.healthMult, speedMult: boss.speedMult,
                    goldMult: 1+(level-1)*0.1, delay: totalDelay, isBoss: true
                });
            }

            const isBossWave = wave === 10 || wave === 20;
            const isEliteWave = false;
            const batchSize = wave >= 20 ? 3 : wave >= 15 ? 2 : 1;
            if (batchSize > 1 && enemyQueue.length > 1) {
                for (let i = 0; i < enemyQueue.length; i++) {
                    const groupStart = Math.floor(i / batchSize) * batchSize;
                    enemyQueue[i].delay = enemyQueue[groupStart].delay;
                }
            }
            for (let i = 0; i < enemyQueue.length; i++) enemyQueue[i].attackMult = attackLevelMult;
            const goldBonus = Math.floor(5 + wave*1.5 + level*2);
            return { wave, level, isBossWave, isEliteWave, enemyQueue, totalEnemies: enemyQueue.length, goldBonus };
        }

        // ========== 关卡2-3 原有波次逻辑 ==========
        const isBossWave = (wave === 10 || wave === 20);
        const isEliteWave = (wave === 5 || wave === 15);

        if (isBossWave) {
            const bossExtraCount = (wave === 20) ? 4 : 1;
            const minionCount = Math.max(1, scaledEnemyCount - bossExtraCount);
            for (let i = 0; i < minionCount; i++) {
                const type = getRandomEnemyType(level, wave, true);
                const delay = totalDelay;
                totalDelay += baseDelay * (0.5 + Math.random() * 0.5);
                enemyQueue.push({ type, healthMult: difficultyMultiplier, speedMult: 1+(wave-1)*0.015, goldMult: 1+(level-1)*0.1, delay, isBoss: false });
            }
            totalDelay += 1.5;
            if (wave === 20) {
                enemyQueue.push({ type: ENEMY_TYPES.BOSS, healthMult: difficultyMultiplier*3.5, speedMult: 1.3+(level-1)*0.03, goldMult: 1+(level-1)*0.1, delay: totalDelay, isBoss: true });
                totalDelay += 1.0;
                for (let i = 0; i < 3; i++) {
                    enemyQueue.push({ type: ENEMY_TYPES.ARMORED, healthMult: difficultyMultiplier*2, speedMult: 1+(wave-1)*0.015, goldMult: 1+(level-1)*0.1, delay: totalDelay, isBoss: false });
                    totalDelay += baseDelay * 1.5;
                }
            } else {
                enemyQueue.push({ type: ENEMY_TYPES.MINI_BOSS, healthMult: difficultyMultiplier*2.5, speedMult: 1.1+(level-1)*0.02, goldMult: 1+(level-1)*0.1, delay: totalDelay, isBoss: true });
            }
        } else if (isEliteWave) {
            const armoredCount = Math.floor(scaledEnemyCount * 0.3);
            const tankCount = Math.floor(scaledEnemyCount * 0.2);
            const normalCount = scaledEnemyCount - armoredCount - tankCount;
            for (let i = 0; i < normalCount; i++) {
                enemyQueue.push({ type: ENEMY_TYPES.NORMAL, healthMult: difficultyMultiplier*1.2, speedMult: 1+(wave-1)*0.015, goldMult: 1+(level-1)*0.1, delay: totalDelay, isBoss: false });
                totalDelay += baseDelay;
            }
            for (let i = 0; i < tankCount; i++) {
                enemyQueue.push({ type: ENEMY_TYPES.TANK, healthMult: difficultyMultiplier*1.5, speedMult: 1+(wave-1)*0.015, goldMult: 1+(level-1)*0.1, delay: totalDelay, isBoss: false });
                totalDelay += baseDelay * 1.2;
            }
            for (let i = 0; i < armoredCount; i++) {
                enemyQueue.push({ type: ENEMY_TYPES.ARMORED, healthMult: difficultyMultiplier*1.8, speedMult: 1+(wave-1)*0.015, goldMult: 1+(level-1)*0.1, delay: totalDelay, isBoss: false });
                totalDelay += baseDelay * 1.3;
            }
        } else {
            const typeUnlockOrder = [
                { type: ENEMY_TYPES.NORMAL, unlockWave: 1 },
                { type: ENEMY_TYPES.FAST, unlockWave: 3 },
                { type: ENEMY_TYPES.TANK, unlockWave: 5 },
                { type: ENEMY_TYPES.ARMORED, unlockWave: 7 },
                { type: ENEMY_TYPES.SHARPSHOOTER, unlockWave: 3 },
                { type: ENEMY_TYPES.DESTROYER_MAGE, unlockWave: 12 }
            ];
            const availableTypes = typeUnlockOrder.filter(function(t){ return wave >= t.unlockWave; });
            const shares = availableTypes.map(function(t){
                return Math.max(1, 1 + (wave - t.unlockWave) * 0.6);
            });
            const totalShares = shares.reduce(function(a,b){return a+b;}, 0);
            var counts = shares.map(function(s){
                return Math.round(scaledEnemyCount * s / totalShares);
            });
            var sum = counts.reduce(function(a,b){return a+b;}, 0);
            counts[0] += scaledEnemyCount - sum;
            if (counts[0] < 0) counts[0] = 0;

            for (var t = 0; t < availableTypes.length; t++) {
                var type = availableTypes[t].type;
                var count = counts[t];
                for (var i = 0; i < count; i++) {
                    var delay = totalDelay + (t === 0 ? Math.random() * baseDelay * 0.5 : 0);
                    var healthM = difficultyMultiplier;
                    if (type === ENEMY_TYPES.FAST) healthM *= 0.8;
                    else if (type === ENEMY_TYPES.TANK) healthM *= 1.5;
                    else if (type === ENEMY_TYPES.ARMORED) healthM *= 1.8;
                    else if (type === ENEMY_TYPES.SHARPSHOOTER) healthM *= 0.9;
                    enemyQueue.push({ type: type, healthMult: healthM, speedMult: 1+(wave-1)*0.015, goldMult: 1+(level-1)*0.1, delay: delay, isBoss: false });
                    var delayMult = type === ENEMY_TYPES.FAST ? 0.7 : (type === ENEMY_TYPES.TANK || type === ENEMY_TYPES.ARMORED ? 1.3 : 1.0);
                    totalDelay += baseDelay * delayMult;
                }
            }
        }
        for (let i = 0; i < enemyQueue.length; i++) {
            enemyQueue[i].attackMult = attackLevelMult;
        }
        const batchSize = wave >= 20 ? 3 : wave >= 15 ? 2 : 1;
        if (batchSize > 1 && enemyQueue.length > 1) {
            for (let i = 0; i < enemyQueue.length; i++) {
                const groupStart = Math.floor(i / batchSize) * batchSize;
                enemyQueue[i].delay = enemyQueue[groupStart].delay;
            }
        }
        const goldBonus = Math.floor(5 + wave*1.5 + level*2);
        return { wave, level, isBossWave, isEliteWave, enemyQueue, totalEnemies: enemyQueue.length, goldBonus };
    }

    // ================== 兵种升级系统（左侧面板） ==================
    const UNITS = {
        farmer: { type: 'farmer', name: '🌾 农民', cost: 20, unlocked: true,
            width: 14, height: 14, color: '#00FF88', baseSpeed: 55, baseHealth: 50, attackDamage: 2, attackSpeed: 1.2, attackRange: 25,
            upgradeCost: 20, upgradeAtkPerLvl: 2, upgradeHPPerLvl: 10 },
        infantry: { type: 'infantry', name: '⚔️ 步兵', cost: 50,
            width: 16, height: 16, color: '#4488FF', baseSpeed: 50, baseHealth: 100, attackDamage: 4, attackSpeed: 1.0, attackRange: 25,
            upgradeCost: 50, upgradeAtkPerLvl: 4, upgradeHPPerLvl: 20 },
        archer: { type: 'archer', name: '🏹 弓箭手', cost: 100,
            width: 14, height: 14, color: '#FFAA00', baseSpeed: 52, baseHealth: 50, attackDamage: 10, attackSpeed: 0.67, attackRange: 150,
            upgradeCost: 100, upgradeAtkPerLvl: 10, upgradeHPPerLvl: 10, upgradeRangePerLvl: 15 },
        knight: { type: 'knight', name: '🐴 骑士', cost: 150,
            width: 18, height: 18, color: '#CC44FF', baseSpeed: 60, baseHealth: 200, attackDamage: 5, attackSpeed: 1.2, attackRange: 30,
            upgradeCost: 150, upgradeAtkPerLvl: 5, upgradeHPPerLvl: 40 },
        mage: { type: 'mage', name: '🔮 魔法师', cost: 200,
            width: 16, height: 16, color: '#FF44AA', baseSpeed: 45, baseHealth: 100, attackDamage: 15, attackSpeed: 0.5, attackRange: 150,
            upgradeCost: 200, upgradeAtkPerLvl: 15, upgradeHPPerLvl: 20 },
        swordsman: { type: 'swordsman', name: '🗡️ 剑客', cost: 300,
            width: 16, height: 16, color: '#FF8844', baseSpeed: 65, baseHealth: 150, attackDamage: 25, attackSpeed: 0.8, attackRange: 55,
            upgradeCost: 300, upgradeAtkPerLvl: 25, upgradeHPPerLvl: 30 },
        paladin: { type: 'paladin', name: '🛡️ 圣骑士', cost: 400,
            width: 18, height: 18, color: '#FFDD44', baseSpeed: 50, baseHealth: 400, attackDamage: 10, attackSpeed: 1.0, attackRange: 28,
            upgradeCost: 400, upgradeAtkPerLvl: 10, upgradeHPPerLvl: 80 },
        sniper: { type: 'sniper', name: '🎯 狙击手', cost: 250,
            width: 14, height: 14, color: '#44FFDD', baseSpeed: 48, baseHealth: 100, attackDamage: 20, attackSpeed: 0.33, attackRange: 300,
            upgradeCost: 250, upgradeAtkPerLvl: 20, upgradeHPPerLvl: 20, upgradeRangePerLvl: 20 },
        gunner: { type: 'gunner', name: '🔫 机枪兵', cost: 150,
            width: 15, height: 15, color: '#FF6644', baseSpeed: 50, baseHealth: 150, attackDamage: 10, attackSpeed: 1.0, attackRange: 100,
            upgradeCost: 150, upgradeAtkPerLvl: 10, upgradeHPPerLvl: 30 }
    };

    // 兵种购买状态 + 升级等级
    let purchasedUnits = {};
    let unitUpgradeLevels = {};

    // 营地建筑（替代水晶生成，购买后放置在地图上）
    const CAMP_TYPES = {
        farmer: { unitType: 'farmer', name: '农民营地', cost: 20, size: 40, color: '#88DD88', spawnInterval: 10 },
        infantry: { unitType: 'infantry', name: '⚔️ 步兵军营', cost: 50, size: 40, color: '#4488FF', spawnInterval: 10 },
        archer: { unitType: 'archer', name: '🏹 弓箭手军营', cost: 100, size: 40, color: '#FFAA00', spawnInterval: 10 },
        knight: { unitType: 'knight', name: '🐴 骑士军营', cost: 150, size: 40, color: '#CC44FF', spawnInterval: 10 },
        mage: { unitType: 'mage', name: '🔮 魔法师军营', cost: 200, size: 40, color: '#FF44AA', spawnInterval: 10 },
        swordsman: { unitType: 'swordsman', name: '🗡️ 剑客军营', cost: 300, size: 40, color: '#FF8844', spawnInterval: 10 },
        paladin: { unitType: 'paladin', name: '🛡️ 圣骑士军营', cost: 400, size: 40, color: '#FFDD44', spawnInterval: 10 },
        sniper: { unitType: 'sniper', name: '🎯 狙击手军营', cost: 250, size: 40, color: '#44FFDD', spawnInterval: 10 },
        gunner: { unitType: 'gunner', name: '🔫 机枪兵军营', cost: 150, size: 40, color: '#FF6644', spawnInterval: 10 }
    };
    let camps = [];
    let campCount = 0;
    const CAMPS_CAPACITY = 3;
    // 营地标记模式（点击营地后，再点击地图设置标记位置）
    let settingCampMarker = false;
    let campBeingMarked = null;

    // 水晶生成小兵参数
    let friendSpawnTimer = 0;
    const FRIEND_SPAWN_INTERVAL = 10.0;
    let unitSpawnTimers = {};
    let friendCount = 0;
    const FRIENDS_CAPACITY = 50;

    // ================== 经验/等级/词条系统 ==================
    const LEVEL_XP_REQUIREMENTS = [0, 5, 10, 20, 30, 45, 60, 80, 100, 125, 150, 180, 210, 250, 300, 350, 400, 450, 500, 550];
    let playerLevel = 1;
    let currentExp = 0;
    let collectedExpTotal = 0;
    
    // 经验宝石系统（零GC数组）
    const EXP_GEMS_CAPACITY = 100;
    const EXP_GEM_COLLECT_RANGE = 40;
    let expGems = new Array(EXP_GEMS_CAPACITY);
    let expGemCount = 0;
    
    // 生成经验宝石
    function spawnExpGem(x, y, value) {
        if (expGemCount >= EXP_GEMS_CAPACITY) return;
        const gem = expGems[expGemCount];
        if (gem) {
            gem.x = x; gem.y = y; gem.value = value; gem.alive = true;
            gem.bobPhase = Math.random() * Math.PI * 2;
            gem.glowPhase = Math.random() * Math.PI * 2;
        } else {
            expGems[expGemCount] = { x, y, value, alive: true, bobPhase: Math.random() * Math.PI * 2, glowPhase: Math.random() * Math.PI * 2 };
        }
        expGemCount++;
    }

    function dropExpGemsForKill(enemy, x, y, value) {
        const count = enemy.isBoss ? 20 : enemy.isArmored ? 5 : 1;
        const gemValue = Math.max(1, Math.floor(value || 1));
        const spacing = 8;
        for (let i = 0; i < count; i++) {
            const offsetX = ((i % 5) - 2) * spacing;
            const offsetY = (Math.floor(i / 5) - Math.floor(count / 10)) * spacing;
            spawnExpGem(x + offsetX, y + offsetY, gemValue);
        }
    }

    // 更新经验宝石（玩家拾取 + 自动飞向玩家）
    function updateExpGems(deltaTime) {
        let collectedExp = 0;
        let w = 0;
        for (let i = 0; i < expGemCount; i++) {
            const gem = expGems[i];
            if (!gem || !gem.alive) continue;
            
            // 浮动动画
            gem.bobPhase += deltaTime * 3;
            gem.glowPhase += deltaTime * 2;
            
            // 检查玩家距离
            const dx = player.x - gem.x;
            const dy = player.y - gem.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            // 始终自动飞向玩家（无距离限制）
            const speed = Math.min(300, 120 + dist * 0.3) * deltaTime;
            if (dist > 10) {
                gem.x += (dx / dist) * speed;
                gem.y += (dy / dist) * speed;
            }
            
            // 如果玩家碰到宝石，收集
            if (dist < EXP_GEM_COLLECT_RANGE) {
                gem.alive = false;
                collectedExp += gem.value;
                playGemExpSound();
                continue;
            }
            
            if (w !== i) expGems[w] = expGems[i];
            w++;
        }
        for (let i = w; i < expGemCount; i++) expGems[i] = null;
        expGemCount = w;
        
        // 增加经验
        if (collectedExp > 0) {
            addExp(collectedExp);
        }
    }
    
    // 升级及经验管理系统
    function addExp(amount) {
        currentExp += amount;
        collectedExpTotal += amount;
        
        // 检查是否升级
        let leveledUp = false;
        while (playerLevel < LEVEL_XP_REQUIREMENTS.length && currentExp >= LEVEL_XP_REQUIREMENTS[playerLevel]) {
            currentExp -= LEVEL_XP_REQUIREMENTS[playerLevel];
            playerLevel++;
            levelUpSound.currentTime = 0; if (getSoundEnabled()) levelUpSound.play().catch(function(){});
            leveledUp = true;
        }
        
        // 更新经验条显示
        updateExpBarDisplay();
        
        // 如果升级了，显示词条选择
        if (leveledUp) {
            // 玩家升级视觉反馈
            addDamageText(player.x, player.y - player.height/2, 'LEVEL UP!!', '#FFD700', 3, 30);
            showPerkSelection();
        }
    }
    
    // 更新经验条显示（保留数据更新，DOM由画布绘制代替）
    function updateExpBarDisplay() {
        // 经验数据由 draw 循环直接从 playerLevel/currentExp 读取
    }
    
    // 词条三选一弹出
    let isPerkSelecting = false;
    let currentPerkOptions = []; // 当前展示的词条
    
    // 判断词条是否已达上限
    function isPerkMaxed(perkId) {
        const map = {
            multiShot: { current: (perkEffectData.playerBurstShots || 1) - 1, max: 3 },
            spreadShot: { current: perkEffectData.playerSpreadLevel || 0, max: 4 },
            pierceShot: { current: perkEffectData.playerPierceCount || 0, max: 3 },
            critChance: { current: Math.round((perkEffectData.playerCritChance || 0) / 0.2), max: 5 },
            heavyFirepower: { current: perkEffectData.playerFirepowerStacks || 0, max: 5 },
        };
        const info = map[perkId];
        return info && info.current >= info.max;
    }
    
    // 获取词条当前等级
    function getPerkLevel(perkId) {
        const map = {
            multiShot: { current: (perkEffectData.playerBurstShots || 1) - 1, max: 3 },
            spreadShot: { current: perkEffectData.playerSpreadLevel || 0, max: 4 },
            pierceShot: { current: perkEffectData.playerPierceCount || 0, max: 3 },
            critChance: { current: Math.round((perkEffectData.playerCritChance || 0) / 0.2), max: 5 },
            heavyFirepower: { current: perkEffectData.playerFirepowerStacks || 0, max: 5 },
        };
        const info = map[perkId];
        return info ? { current: info.current, max: info.max } : { current: 0, max: 1 };
    }
    
    // 获取未获得/未满级的词条列表
    function getUnobtainedPerks() {
        return Object.keys(PERKS).filter(key => !isPerkMaxed(key));
    }
    
    // 随机选择3个词条（仅从未获得的词条中选择，且不与当前已展示的词条重复）
    function getRandomPerkOptions(excludeKeys = []) {
        const unobtained = getUnobtainedPerks();
        // 过滤掉需要排除的词条（例如刷新时不去重当前已展示的相同三项）
        const available = unobtained.filter(key => !excludeKeys.includes(key));
        // 如果过滤后不足3个，再放宽限制
        const pool = available.length >= 3 ? available : unobtained;
        const shuffled = [...pool].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, 3);
    }
    
    // 渲染词条卡片（3D立体独立弹窗）
    function renderPerkCards(selected) {
        const row = document.getElementById('perkCardsRow');
        row.innerHTML = '';
        
        const categoryIcons = {
            trap: '🪤',
            tower: '🏗️',
            unit: '⚔️',
            general: ''
        };
        
        for (const key of selected) {
            const perk = PERKS[key];
            if (!perk) continue;
            
            const lv = getPerkLevel(key);
            const levelText = lv.current >= lv.max ? 'MAX' : `Lv.${lv.current + 1}`;
            
            const card = document.createElement('div');
            card.className = 'perk-card-3d';
            card.dataset.perkId = perk.id;
            
            const iconHtml = categoryIcons[perk.category] || '';
            
            card.innerHTML = `
                <div class="card-level">${levelText}</div>
                ${iconHtml ? `<div class="card-icon">${iconHtml}</div>` : ''}
                <div class="card-name">${perk.name}</div>
                <div class="card-desc">${perk.desc}</div>
            `;
            
            card.addEventListener('click', function() {
                selectPerk(perk.id);
            });
            
            row.appendChild(card);
        }
    }
    
    function showPerkSelection() {
        if (isPerkSelecting) return;
        isPerkSelecting = true;
        
        // 从未获得的词条中随机选3个
        currentPerkOptions = getRandomPerkOptions();
        if (currentPerkOptions.length === 0) {
            // 所有词条已满级
            isPerkSelecting = false;
            return;
        }
        renderPerkCards(currentPerkOptions);
        
        document.getElementById('perkSelectModal').classList.add('show');
    }
    
    function selectPerk(perkId) {
        const perk = PERKS[perkId];
        if (!perk) return;
        
        // 应用词条效果
        perk.apply();
        selectedPerks.push(perkId);
        
        // 播放选择词条音效
        perkSelectSound.currentTime = 0; if (getSoundEnabled()) perkSelectSound.play().catch(function(){});
        
        // 关闭弹窗
        document.getElementById('perkSelectModal').classList.remove('show');
        isPerkSelecting = false;
        
        // 更新HUD
        updateExpBarDisplay();
        
        // 刷新兵种按钮（某些词条可能改变兵种属性）
        generateUnitButtons();
        
        // ★ 实时刷新玩家属性预览弹窗
        refreshPlayerPreviewStats();
    }
    
    // 已选择词条记录
    let selectedPerks = [];
    
    // ========== 词条定义（5种） ==========
    const PERKS = {
        // ---- 通用类 ----
        multiShot: {
            id: 'multiShot', name: '🔫 连发', category: 'general',
            desc: '连续发射2次子弹（可叠加至4连发）',
            apply: function() {
                const current = perkEffectData.playerBurstShots || 1;
                const next = Math.min(4, current + 1);
                perkEffectData.playerBurstShots = next;
                PERKS.multiShot.desc = `连续发射${next}次子弹（可叠加至4连发）`;
            }
        },
        spreadShot: {
            id: 'spreadShot', name: '💫 散射', category: 'general',
            desc: '每次发射的子弹+1，呈扇形扩散攻击不同敌人（最多叠加4次）',
            apply: function() {
                const current = perkEffectData.playerSpreadLevel || 0;
                const next = Math.min(4, current + 1);
                perkEffectData.playerSpreadLevel = next;
                const bonusBullets = next;
                const totalBullets = 1 + bonusBullets;
                PERKS.spreadShot.desc = `每次发射${totalBullets}颗子弹（Lv.${next}: +${bonusBullets}颗），呈扇形扩散攻击不同敌人（最多叠加4次）`;
            }
        },
        pierceShot: {
            id: 'pierceShot', name: '🎯 穿透', category: 'general',
            desc: '子弹可以穿透1个敌人继续攻击下一个敌人（可叠加3次）',
            apply: function() {
                const current = perkEffectData.playerPierceCount || 0;
                const next = Math.min(3, current + 1);
                perkEffectData.playerPierceCount = next;
                PERKS.pierceShot.desc = `子弹可以穿透${next}个敌人继续攻击下一个敌人（可叠加3次）`;
            }
        },
        critChance: {
            id: 'critChance', name: '💥 暴击', category: 'general',
            desc: '增加20%暴击率，暴击造成双倍伤害（最多叠加5次，最高100%暴击率）',
            apply: function() {
                const current = perkEffectData.playerCritChance || 0;
                const next = Math.min(1.0, current + 0.2);
                perkEffectData.playerCritChance = next;
                const pct = Math.round(next * 100);
                const level = Math.round(next / 0.2);
                PERKS.critChance.desc = `增加20%暴击率，暴击造成双倍伤害（Lv.${level}: ${pct}%暴击率，最多叠加5次，最高100%暴击率）`;
            }
        },
        heavyFirepower: {
            id: 'heavyFirepower', name: '🔫 重火力', category: 'general',
            desc: '增加角色攻击力10点，最多获取5次（最高+50攻击力）',
            apply: function() {
                const currentStacks = perkEffectData.playerFirepowerStacks || 0;
                const nextStacks = Math.min(5, currentStacks + 1);
                perkEffectData.playerFirepowerStacks = nextStacks;
                const firepowerBonus = nextStacks * 10;
                player.bulletDamage = 10 + firepowerBonus;
                PERKS.heavyFirepower.desc = `增加角色攻击力10点（当前 ${nextStacks}/5，共+${firepowerBonus}攻击力，最多获取5次最高+50攻击力）`;
            }
        }
    };

    window.PERKS = PERKS;
    window.selectedPerks = selectedPerks;
    
    // 词条效果累计数据（新放置的建筑也会受加成）
    let perkEffectData = {};

    // ================== 地图背景图片 ==================
    const levelMapImages = {};
    function loadMapImages() {
        for (let level = 1; level <= 5; level++) {
            if (level === 1 || level === 4 || level === 5) continue;
            const img = new Image();
            const mapMap = { 1:1, 2:11, 3:16 };
            img.src = `assets/maps/关卡${mapMap[level]}/map.jpg`;
            levelMapImages[level] = img;
        }
    }
    loadMapImages();

    // ================== 角色帧动画 ==================
    const PLAYER_FRAME_COUNT = 16;
    const PLAYER_FRAME_COUNT_RIGHT = 18;
    const PLAYER_FRAME_COUNT_LEFT = 18;
    const PLAYER_FRAME_COUNT_MOVE = 18;
    const playerFramesRight = [];
    for (let i = 0; i < PLAYER_FRAME_COUNT_RIGHT; i++) {
        const img = new Image();
        const num = String(i * 2).padStart(2, '0');
        img.src = `assets/role/向右移动/frame_${num}_delay-0.png`;
        playerFramesRight.push(img);
    }
    const playerFramesLeft = [];
    for (let i = 0; i < PLAYER_FRAME_COUNT_LEFT; i++) {
        const img = new Image();
        const num = String(i).padStart(2, '0');
        img.src = `assets/role/向左移动/frame_${num}_delay-0.png`;
        playerFramesLeft.push(img);
    }

    // ================== 向左加速移动帧动画（12帧） ==================
    const PLAYER_SPEEDBOOST_LEFT_FRAME_COUNT = 11;
    const playerFramesSpeedLeft = [];
    for (let i = 0; i < PLAYER_SPEEDBOOST_LEFT_FRAME_COUNT; i++) {
        const img = new Image();
        const num = String(i).padStart(2, '0');
        img.src = `assets/role/向左加速移动/frame_${num}_delay-0.png`;
        playerFramesSpeedLeft.push(img);
    }

    // ================== 向右加速移动帧动画（12帧） ==================
    const PLAYER_SPEEDBOOST_RIGHT_FRAME_COUNT = 11;
    const playerFramesSpeedRight = [];
    for (let i = 0; i < PLAYER_SPEEDBOOST_RIGHT_FRAME_COUNT; i++) {
        const img = new Image();
        const num = String(i * 2).padStart(2, '0');
        img.src = `assets/role/向右加速移动/frame_${num}_delay-0.png`;
        playerFramesSpeedRight.push(img);
    }

    const PLAYER_ATTACK_FRAME_COUNT = 16;
    const playerFramesAttack = [];
    for (let i = 0; i < PLAYER_ATTACK_FRAME_COUNT; i++) {
        const img = new Image();
        const num = String(i).padStart(2, '0');
        img.src = `assets/role/向右攻击发射子弹/frame_${num}_delay-0.2s.png`;
        playerFramesAttack.push(img);
    }
    const playerFramesAttackLeft = [];
    for (let i = 0; i < PLAYER_ATTACK_FRAME_COUNT; i++) {
        const img = new Image();
        const num = String(i).padStart(2, '0');
        img.src = `assets/role/向左攻击发射子弹/frame_${num}_delay-0.2s.png`;
        playerFramesAttackLeft.push(img);
    }

    // ================== 左移后待机帧动画（18帧） ==================
    const PLAYER_IDLE_LEFT_FRAME_COUNT = 18;
    const playerIdleLeftFrames = [];
    for (let i = 0; i < PLAYER_IDLE_LEFT_FRAME_COUNT; i++) {
        const img = new Image();
        const num = String(i).padStart(2, '0');
        img.src = `assets/role/左移后待机状态/frame_${num}_delay-0.2s.png`;
        playerIdleLeftFrames.push(img);
    }

    // ================== 右移后待机帧动画（18帧） ==================
    const PLAYER_IDLE_RIGHT_FRAME_COUNT = 18;
    const playerIdleRightFrames = [];
    for (let i = 0; i < PLAYER_IDLE_RIGHT_FRAME_COUNT; i++) {
        const img = new Image();
        const num = String(i).padStart(2, '0');
        img.src = `assets/role/右移后待机状态/frame_${num}_delay-0.2s.png`;
        playerIdleRightFrames.push(img);
    }

    // ================== 玩家子弹素材 ==================
    const playerBulletRightImg = new Image();
    playerBulletRightImg.src = 'assets/attack/向右发射的子弹/huaban-4045539730-ezgif.com-rotate.webp';
    const playerBulletLeftImg = new Image();
    playerBulletLeftImg.src = 'assets/attack/向左发射的子弹/huaban-4045539730.webp';

    // ================== 金矿帧动画素材 ==================
    const goldMineFrames = [];
    for (let i = 0; i < 6; i++) {
        const img = new Image();
        img.src = `assets/Defense tower/金矿/frame_${i}_delay-0.png`;
        goldMineFrames.push(img);
    }

    // ================== 经验宝石素材 ==================
    const expGemImg = new Image();
    expGemImg.src = 'assets/Experience/huaban-6882206204.webp';

    // ================== 初始发射子弹音效 ==================
    const playerShootSound = new Audio('assets/bgm/初始发射子弹/7581329d-2983-4668-aef0-6b69cd77fb6b.wav');
    playerShootSound.volume = 0.5;

    // ================== 敌人过多警告音效 ==================
    const warningSound = new Audio('assets/bgm/警告/833bb5ac1eb4f710bb8deb61624d6200.mp3');
    warningSound.volume = 0.6;

    // ================== 获得宝石经验音效 ==================
    const gemExpSound = new Audio('assets/bgm/获得宝石经验/104b7d06a2eb49e15221676aca089a0a.mp3');
    gemExpSound.volume = 0.25;
    const gemExpSoundAlt = new Audio('assets/bgm/获得宝石经验/104b7d06a2eb49e15221676aca089a0a.mp3');
    gemExpSoundAlt.volume = 0.25;
    let gemExpSoundIdx = 0;
    function playGemExpSound() {
        if (!getSoundEnabled()) return;
        const s = gemExpSoundIdx % 2 === 0 ? gemExpSound : gemExpSoundAlt;
        s.currentTime = 0;
        s.play().catch(function(){});
        gemExpSoundIdx++;
    }

    // ================== 角色升级音效 ==================
    const levelUpSound = new Audio('assets/bgm/角色升级/d2e61a8e07a81517be5a40d9bd128880.mp3');
    levelUpSound.volume = 0.6;

    // ================== 选择词条音效 ==================
    const perkSelectSound = new Audio('assets/bgm/选择词条/d2e61a8e07a81517be5a40d9bd128880.mp3');
    perkSelectSound.volume = 0.5;

    // ================== 使用加速按钮音效（Web Audio 预解码，零延迟） ==================
    let speedBoostBuffer = null;
    let speedBoostAudioCtx = null;
    let speedBoostFallbackAudio = null;
    function initSpeedBoostAudio() {
        // 提前 fetch 并解码音频数据（不创建 AudioContext，等用户手势再创建）
        fetch('assets/bgm/使用加速按钮/d482fdbc1173f87eed6cf30a30cdcd5b.wav')
            .then(r => r.arrayBuffer())
            .then(buf => {
                // 暂存原始 buffer，等 AudioContext 就绪后再 decode
                speedBoostBuffer = buf;
            })
            .catch(() => {});
        // 同时预加载一个 Audio 元素做 fallback
        speedBoostFallbackAudio = new Audio('assets/bgm/使用加速按钮/d482fdbc1173f87eed6cf30a30cdcd5b.wav');
        speedBoostFallbackAudio.volume = 0.5;
        speedBoostFallbackAudio.preload = 'auto';
        speedBoostFallbackAudio.load();
    }
    function ensureSpeedBoostCtx() {
        if (!speedBoostAudioCtx) {
            speedBoostAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
            if (speedBoostBuffer && speedBoostBuffer.byteLength > 0) {
                try {
                    speedBoostAudioCtx.decodeAudioData(speedBoostBuffer.slice(0), decoded => { speedBoostBuffer = decoded; });
                } catch(e) {}
            }
        }
        if (speedBoostAudioCtx.state === 'suspended') {
            speedBoostAudioCtx.resume().catch(() => {});
        }
    }
    function playSpeedBoostSound() {
        if (!getSoundEnabled()) return;
        try {
            ensureSpeedBoostCtx();
            if (speedBoostBuffer && speedBoostBuffer instanceof AudioBuffer) {
                const source = speedBoostAudioCtx.createBufferSource();
                source.buffer = speedBoostBuffer;
                const gain = speedBoostAudioCtx.createGain();
                gain.gain.value = 0.5;
                source.connect(gain).connect(speedBoostAudioCtx.destination);
                source.start(0, 0.1);
            } else if (speedBoostFallbackAudio) {
                const a = speedBoostFallbackAudio.cloneNode(true);
                a.volume = 0.5;
                a.currentTime = 0.1;
                a.play().catch(() => {});
            }
        } catch(e) {}
    }

    // ================== 敌人被击杀音效（音频池） ==================
    const DEATH_POOL_SIZE = 6;
    const deathAudioPool = [];
    for (let i = 0; i < DEATH_POOL_SIZE; i++) {
        const a = new Audio('assets/bgm/敌人被击杀/敌人被击杀.mp3');
        a.volume = 0.25;
        a.preload = 'auto';
        a.load();
        deathAudioPool.push(a);
    }
    let deathPoolIndex = 0;
    function playEnemyDeathSound() {
        if (!getSoundEnabled()) return;
        try {
            const audio = deathAudioPool[deathPoolIndex];
            deathPoolIndex = (deathPoolIndex + 1) % DEATH_POOL_SIZE;
            audio.currentTime = 0;
            audio.play().catch(() => {});
            setTimeout(() => { try { audio.pause(); } catch(e) {} }, 400);
        } catch(e) {}
    }

    // ================== 己方击中敌人音效（音频池方案，避免 cloneNode 加载延迟） ==================
    const HIT_POOL_SIZE = 8;
    const hitAudioPool = [];
    for (let i = 0; i < HIT_POOL_SIZE; i++) {
        const a = new Audio('assets/bgm/击中敌人/击中敌人.mp3');
        a.volume = 0.3;
        a.preload = 'auto';
        a.load();
        hitAudioPool.push(a);
    }
    let hitPoolIndex = 0;
    function playFriendlyHitSound() {
        if (!getSoundEnabled()) return;
        try {
            const audio = hitAudioPool[hitPoolIndex];
            hitPoolIndex = (hitPoolIndex + 1) % HIT_POOL_SIZE;
            audio.currentTime = 0.2;
            audio.play().catch(() => {});
            setTimeout(() => { try { audio.pause(); } catch(e) {} }, 200);
        } catch(e) {}
    }

    // ================== 爆炸区爆炸音效（音频池） ==================
    const EXPLOSION_POOL_SIZE = 4;
    const explosionAudioPool = [];
    for (let i = 0; i < EXPLOSION_POOL_SIZE; i++) {
        const a = new Audio('assets/bgm/爆炸区爆炸/57a2fc533367aba386c23525abd64d7d.wav');
        a.volume = 0.5;
        a.preload = 'auto';
        a.load();
        explosionAudioPool.push(a);
    }
    let explosionPoolIndex = 0;
    function playExplosionSound() {
        if (!getSoundEnabled()) return;
        try {
            const audio = explosionAudioPool[explosionPoolIndex];
            explosionPoolIndex = (explosionPoolIndex + 1) % EXPLOSION_POOL_SIZE;
            audio.currentTime = 0;
            audio.play().catch(() => {});
        } catch(e) {}
    }

    // ================== 传送器弹射音效（音频池） ==================
    const BOUNCE_POOL_SIZE = 4;
    const bounceAudioPool = [];
    for (let i = 0; i < BOUNCE_POOL_SIZE; i++) {
        const a = new Audio('assets/bgm/传送器/传送.wav');
        a.volume = 0.5;
        a.preload = 'auto';
        a.load();
        bounceAudioPool.push(a);
    }
    let bouncePoolIndex = 0;
    function playBounceSound() {
        if (!getSoundEnabled()) return;
        try {
            const audio = bounceAudioPool[bouncePoolIndex];
            bouncePoolIndex = (bouncePoolIndex + 1) % BOUNCE_POOL_SIZE;
            audio.currentTime = 0;
            audio.play().catch(() => {});
        } catch(e) {}
    }

    // ================== 普通小兵帧动画（10帧） ==================
    const NORMAL_ENEMY_FRAME_COUNT = 10;
    const normalEnemyFrames = [];
    for (let i = 0; i < NORMAL_ENEMY_FRAME_COUNT; i++) {
        const img = new Image();
        const num = String(i).padStart(2, '0');
        img.src = `assets/enemy/普通小兵/从左往右移动/frame_${num}_delay-0.03s.png`;
        normalEnemyFrames.push(img);
    }

    // ================== 普通小兵（从右往左移动）帧动画（10帧） ==================
    const normalEnemyFramesLeft = [];
    for (let i = 0; i < NORMAL_ENEMY_FRAME_COUNT; i++) {
        const img = new Image();
        const num = String(i).padStart(2, '0');
        img.src = `assets/enemy/普通小兵/从右往左移动/frame_${num}_delay-0.03s.png`;
        normalEnemyFramesLeft.push(img);
    }

    // ================== 快速斥候帧动画（8帧） ==================
    const FAST_ENEMY_FRAME_COUNT = 8;
    const fastEnemyFrames = [];
    for (let i = 0; i < FAST_ENEMY_FRAME_COUNT; i++) {
        const img = new Image();
        img.src = `assets/enemy/快速斥候/从左往右移动/frame_${i}_delay-0.05s.png`;
        fastEnemyFrames.push(img);
    }

    // ================== 快速斥候（从右往左移动）帧动画（8帧） ==================
    const fastEnemyFramesLeft = [];
    for (let i = 0; i < FAST_ENEMY_FRAME_COUNT; i++) {
        const img = new Image();
        img.src = `assets/enemy/快速斥候/从右往左移动/frame_${i}_delay-0.05s.png`;
        fastEnemyFramesLeft.push(img);
    }

    // ================== 重甲步兵帧动画（8帧） ==================
    const TANK_ENEMY_FRAME_COUNT = 8;
    const tankEnemyFrames = [];
    for (let i = 0; i < TANK_ENEMY_FRAME_COUNT; i++) {
        const img = new Image();
        img.src = `assets/enemy/重甲步兵/从左往右移动/frame_${i}_delay-0.05s.png`;
        tankEnemyFrames.push(img);
    }

    // ================== 重甲步兵（从右往左移动）帧动画（8帧） ==================
    const tankEnemyFramesLeft = [];
    for (let i = 0; i < TANK_ENEMY_FRAME_COUNT; i++) {
        const img = new Image();
        img.src = `assets/enemy/重甲步兵/从右往左移动/frame_${i}_delay-0.05s.png`;
        tankEnemyFramesLeft.push(img);
    }

    // ================== 毁灭法师帧动画（8帧） ==================
    const DESTROYER_MAGE_ENEMY_FRAME_COUNT = 8;
    const destroyerMageEnemyFrames = [];
    for (let i = 0; i < DESTROYER_MAGE_ENEMY_FRAME_COUNT; i++) {
        const img = new Image();
        img.src = `assets/enemy/毁灭法师/从左往右移动/frame_${i}_delay-0.05s.png`;
        destroyerMageEnemyFrames.push(img);
    }

    // ================== 毁灭法师（从右往左移动）帧动画（8帧） ==================
    const destroyerMageEnemyFramesLeft = [];
    for (let i = 0; i < DESTROYER_MAGE_ENEMY_FRAME_COUNT; i++) {
        const img = new Image();
        img.src = `assets/enemy/毁灭法师/从右往左移动/frame_${i}_delay-0.05s.png`;
        destroyerMageEnemyFramesLeft.push(img);
    }

    // ================== 神射手帧动画（11帧） ==================
    const SHARPSHOOTER_ENEMY_FRAME_COUNT = 11;
    const sharpshooterEnemyFrames = [];
    for (let i = 0; i < SHARPSHOOTER_ENEMY_FRAME_COUNT; i++) {
        const img = new Image();
        const num = String(i).padStart(2, '0');
        img.src = `assets/enemy/神射手/从左往右移动/frame_${num}_delay-0.05s.png`;
        sharpshooterEnemyFrames.push(img);
    }

    // ================== 神射手（从右往左移动）帧动画（11帧） ==================
    const sharpshooterEnemyFramesLeft = [];
    for (let i = 0; i < SHARPSHOOTER_ENEMY_FRAME_COUNT; i++) {
        const img = new Image();
        const num = String(i).padStart(2, '0');
        img.src = `assets/enemy/神射手/从右往左移动/frame_${num}_delay-0.05s.png`;
        sharpshooterEnemyFramesLeft.push(img);
    }

    // ================== 神射手（从左往右攻击）帧动画（9帧） ==================
    const SHARPSHOOTER_ATTACK_FRAME_COUNT = 9;
    const SHARPSHOOTER_ATTACK_DELAYS = [0.05, 0.05, 0.05, 0.05, 0.05, 0.15, 0.05, 0.05, 0.05];
    const SHARPSHOOTER_ATTACK_DURATION = SHARPSHOOTER_ATTACK_DELAYS.reduce(function(a,b){return a+b;}, 0);
    const sharpshooterAttackFramesRight = [];
    for (let i = 0; i < SHARPSHOOTER_ATTACK_FRAME_COUNT; i++) {
        const img = new Image();
        img.src = `assets/enemy/神射手/从左往右攻击/frame_${i}_delay-${SHARPSHOOTER_ATTACK_DELAYS[i].toFixed(2)}s.png`;
        sharpshooterAttackFramesRight.push(img);
    }

    // ================== 神射手（从右往左攻击）帧动画（9帧） ==================
    const sharpshooterAttackFramesLeft = [];
    for (let i = 0; i < SHARPSHOOTER_ATTACK_FRAME_COUNT; i++) {
        const img = new Image();
        img.src = `assets/enemy/神射手/从右往左攻击/frame_${i}_delay-${SHARPSHOOTER_ATTACK_DELAYS[i].toFixed(2)}s.png`;
        sharpshooterAttackFramesLeft.push(img);
    }

    // ================== 精英护卫帧动画（9帧） ==================
    const ARMORED_ENEMY_FRAME_COUNT = 9;
    const armoredEnemyFrames = [];
    for (let i = 0; i < ARMORED_ENEMY_FRAME_COUNT; i++) {
        const img = new Image();
        img.src = `assets/enemy/精英护卫/从左往右移动/frame_${i}_delay-0.25s.png`;
        armoredEnemyFrames.push(img);
    }

    // ================== 精英护卫（从右往左移动）帧动画（9帧） ==================
    const armoredEnemyFramesLeft = [];
    for (let i = 0; i < ARMORED_ENEMY_FRAME_COUNT; i++) {
        const img = new Image();
        img.src = `assets/enemy/精英护卫/从右往左移动/frame_${i}_delay-0.25s.png`;
        armoredEnemyFramesLeft.push(img);
    }

    // ================== 精英BOSS帧动画（10帧） ==================
    const MINI_BOSS_ENEMY_FRAME_COUNT = 10;
    const miniBossEnemyFrames = [];
    for (let i = 0; i < MINI_BOSS_ENEMY_FRAME_COUNT; i++) {
        const img = new Image();
        const num = String(i).padStart(2, '0');
        img.src = `assets/enemy/精英BOSS/从左向右移动/frame_${num}_delay-0.05s.png`;
        miniBossEnemyFrames.push(img);
    }

    // ================== 精英BOSS（从右向左移动）帧动画（10帧） ==================
    const miniBossEnemyFramesLeft = [];
    for (let i = 0; i < MINI_BOSS_ENEMY_FRAME_COUNT; i++) {
        const img = new Image();
        const num = String(i).padStart(2, '0');
        img.src = `assets/enemy/精英BOSS/从右向左移动/frame_${num}_delay-0.05s.png`;
        miniBossEnemyFramesLeft.push(img);
    }

    // ================== 精英BOSS（从左往右攻击）帧动画（13帧） ==================
    const MINI_BOSS_ATTACK_FRAME_COUNT = 13;
    const MINI_BOSS_ATTACK_DELAYS = [0.05,0.05,0.05,0.05,0.05,0.05,0.05,0.05,0.15,0.05,0.05,0.05,0.05];
    const MINI_BOSS_ATTACK_DURATION = MINI_BOSS_ATTACK_DELAYS.reduce(function(a,b){return a+b;}, 0);
    const miniBossAttackFramesRight = [];
    for (let i = 0; i < MINI_BOSS_ATTACK_FRAME_COUNT; i++) {
        const img = new Image();
        const num = String(i).padStart(2, '0');
        img.src = `assets/enemy/精英BOSS/从左往右攻击/frame_${num}_delay-${MINI_BOSS_ATTACK_DELAYS[i].toFixed(2)}s.png`;
        miniBossAttackFramesRight.push(img);
    }

    // ================== 精英BOSS（从右往左攻击）帧动画（13帧） ==================
    const miniBossAttackFramesLeft = [];
    for (let i = 0; i < MINI_BOSS_ATTACK_FRAME_COUNT; i++) {
        const img = new Image();
        const num = String(i).padStart(2, '0');
        img.src = `assets/enemy/精英BOSS/从右往左攻击/frame_${num}_delay-${MINI_BOSS_ATTACK_DELAYS[i].toFixed(2)}s.png`;
        miniBossAttackFramesLeft.push(img);
    }

    // ================== 大BOSS帧动画（10帧） ==================
    const BOSS_ENEMY_FRAME_COUNT = 10;
    const bossEnemyFrames = [];
    for (let i = 0; i < BOSS_ENEMY_FRAME_COUNT; i++) {
        const img = new Image();
        const num = String(i).padStart(2, '0');
        img.src = `assets/enemy/大BOSS/从左往右移动/frame_${num}_delay-0.05s.png`;
        bossEnemyFrames.push(img);
    }

    // ================== 大BOSS（从右往左移动）帧动画（10帧） ==================
    const bossEnemyFramesLeft = [];
    for (let i = 0; i < BOSS_ENEMY_FRAME_COUNT; i++) {
        const img = new Image();
        const num = String(i).padStart(2, '0');
        img.src = `assets/enemy/大BOSS/从右往左移动/frame_${num}_delay-0.05s.png`;
        bossEnemyFramesLeft.push(img);
    }

    // ================== 大BOSS（从左往右攻击）帧动画（18帧） ==================
    const BOSS_ATTACK_FRAME_COUNT = 18;
    const BOSS_ATTACK_DELAYS = [];
    for (let i = 0; i < BOSS_ATTACK_FRAME_COUNT; i++) BOSS_ATTACK_DELAYS.push(0.05);
    const BOSS_ATTACK_DURATION = BOSS_ATTACK_DELAYS.reduce(function(a,b){return a+b;}, 0);
    const bossAttackFramesRight = [];
    for (let i = 0; i < BOSS_ATTACK_FRAME_COUNT; i++) {
        const img = new Image();
        const num = String(i).padStart(2, '0');
        img.src = `assets/enemy/大BOSS/从左往右攻击/frame_${num}_delay-0.05s.png`;
        bossAttackFramesRight.push(img);
    }

    // ================== 大BOSS（从右往左攻击）帧动画（18帧） ==================
    const bossAttackFramesLeft = [];
    for (let i = 0; i < BOSS_ATTACK_FRAME_COUNT; i++) {
        const img = new Image();
        const num = String(i).padStart(2, '0');
        img.src = `assets/enemy/大BOSS/从右往左攻击/frame_${num}_delay-0.05s.png`;
        bossAttackFramesLeft.push(img);
    }

    // ================== 农民从右往左移动帧动画（16帧） ==================
    const FARMER_FRAME_COUNT = 16;
    const farmerFramesRight = [];
    const farmerFramesLeft = [];
    for (let i = 0; i < FARMER_FRAME_COUNT; i++) {
        const img = new Image();
        const num = String(i).padStart(2, '0');
        img.src = `assets/guard/农民/从右往左移动/frame_${num}_delay-0.png`;
        farmerFramesLeft.push(img);
    }
    for (let i = 0; i < FARMER_FRAME_COUNT; i++) {
        const img = new Image();
        const num = String(i).padStart(2, '0');
        img.src = `assets/guard/农民/从左往右移动/frame_${num}_delay-0.png`;
        farmerFramesRight.push(img);
    }

    // ================== 农民从右往左攻击帧动画（17帧） ==================
    const FARMER_ATTACK_FRAME_COUNT = 17;
    const farmerAttackFramesLeft = [];
    const farmerAttackFramesRight = [];
    for (let i = 0; i < FARMER_ATTACK_FRAME_COUNT; i++) {
        const img = new Image();
        const num = String(i).padStart(2, '0');
        img.src = `assets/guard/农民/从右往左攻击/frame_${num}_delay-0.png`;
        farmerAttackFramesLeft.push(img);
    }
    for (let i = 0; i < FARMER_ATTACK_FRAME_COUNT; i++) {
        const img = new Image();
        const num = String(i).padStart(2, '0');
        img.src = `assets/guard/农民/从左往右攻击/frame_${num}_delay-0.png`;
        farmerAttackFramesRight.push(img);
    }

    // ================== 怪物死亡帧动画（12帧） ==================
    const ENEMY_DEATH_FRAME_COUNT = 12;
    const ENEMY_DEATH_DURATION = 0.5;
    const enemyDeathFrames = [];
    for (let i = 0; i < ENEMY_DEATH_FRAME_COUNT; i++) {
        const img = new Image();
        const num = String(i).padStart(2, '0');
        img.src = `assets/enemy/怪物死亡/frame_${num}_delay-0.png`;
        enemyDeathFrames.push(img);
    }

    // ================== 步兵帧动画（10帧） ==================
    const INFANTRY_FRAME_COUNT = 10;
    const infantryFramesLeft = [];  // 从右往左移动
    const infantryFramesRight = []; // 从左往右移动
    for (let i = 0; i < INFANTRY_FRAME_COUNT; i++) {
        const img = new Image();
        const num = String(i).padStart(2, '0');
        img.src = `assets/guard/步兵/从右往左移动/frame_${num}_delay-0.05s.png`;
        infantryFramesLeft.push(img);
    }
    for (let i = 0; i < INFANTRY_FRAME_COUNT; i++) {
        const img = new Image();
        const num = String(i).padStart(2, '0');
        img.src = `assets/guard/步兵/从左往右移动/frame_${num}_delay-0.05s.png`;
        infantryFramesRight.push(img);
    }

    // ================== 步兵从右往左攻击帧动画（11帧） ==================
    const INFANTRY_ATTACK_FRAME_COUNT = 11;
    const infantryAttackFramesLeft = [];
    const infantryAttackFramesRight = [];
    for (let i = 0; i < INFANTRY_ATTACK_FRAME_COUNT; i++) {
        const img = new Image();
        const num = String(i).padStart(2, '0');
        img.src = `assets/guard/步兵/从右往左攻击/frame_${num}_delay-0.05s.png`;
        infantryAttackFramesLeft.push(img);
    }
    for (let i = 0; i < INFANTRY_ATTACK_FRAME_COUNT; i++) {
        const img = new Image();
        const num = String(i).padStart(2, '0');
        img.src = `assets/guard/步兵/从左往右攻击/frame_${num}_delay-0.05s.png`;
        infantryAttackFramesRight.push(img);
    }

    // ================== 弓手帧动画（10帧） ==================
    const ARCHER_FRAME_COUNT = 10;
    const archerFramesLeft = [];  // 从右往左移动
    const archerFramesRight = []; // 从左往右移动
    for (let i = 0; i < ARCHER_FRAME_COUNT; i++) {
        const img = new Image();
        const num = String(i).padStart(2, '0');
        img.src = `assets/guard/弓手/从右往左移动/frame_${num}_delay-0.2s.png`;
        archerFramesLeft.push(img);
    }
    for (let i = 0; i < ARCHER_FRAME_COUNT; i++) {
        const img = new Image();
        const num = String(i).padStart(2, '0');
        img.src = `assets/guard/弓手/从左往右移动/frame_${num}_delay-0.png`;
        archerFramesRight.push(img);
    }

    // ================== 弓手从右往左攻击帧动画（18帧） ==================
    const ARCHER_ATTACK_FRAME_COUNT = 18;
    const archerAttackFramesLeft = [];
    const archerAttackFramesRight = [];
    for (let i = 0; i < ARCHER_ATTACK_FRAME_COUNT; i++) {
        const img = new Image();
        const num = String(i).padStart(2, '0');
        img.src = `assets/guard/弓手/从右往左攻击/frame_${num}_delay-0.2s.png`;
        archerAttackFramesLeft.push(img);
    }
    for (let i = 0; i < ARCHER_ATTACK_FRAME_COUNT; i++) {
        const img = new Image();
        const num = String(i).padStart(2, '0');
        img.src = `assets/guard/弓手/从左往右攻击/frame_${num}_delay-0.png`;
        archerAttackFramesRight.push(img);
    }

    // ================== 骑士帧动画（8帧） ==================
    const KNIGHT_FRAME_COUNT = 8;
    const knightFramesLeft = [];   // 从右往左移动
    const knightFramesRight = [];  // 从左往右移动
    for (let i = 0; i < KNIGHT_FRAME_COUNT; i++) {
        const img = new Image();
        const num = String(i).padStart(2, '0');
        img.src = `assets/guard/骑士/从右往左移动/frame_${num}_delay-0.05.png`;
        knightFramesLeft.push(img);
    }
    for (let i = 0; i < KNIGHT_FRAME_COUNT; i++) {
        const img = new Image();
        const num = String(i).padStart(2, '0');
        img.src = `assets/guard/骑士/从左往右移动/frame_${num}_delay-0.05.png`;
        knightFramesRight.push(img);
    }

    // ================== 骑士从右往左攻击帧动画（10帧） ==================
    const KNIGHT_ATTACK_FRAME_COUNT = 10;
    const knightAttackFramesLeft = [];
    const knightAttackFramesRight = [];  // 从左往右攻击
    for (let i = 0; i < KNIGHT_ATTACK_FRAME_COUNT; i++) {
        const img = new Image();
        const num = String(i).padStart(2, '0');
        img.src = `assets/guard/骑士/从右往左攻击/frame_${num}_delay-0.05.png`;
        knightAttackFramesLeft.push(img);
    }
    for (let i = 0; i < KNIGHT_ATTACK_FRAME_COUNT; i++) {
        const img = new Image();
        const num = String(i).padStart(2, '0');
        img.src = `assets/guard/骑士/从左往右攻击/frame_${num}_delay-0.05.png`;
        knightAttackFramesRight.push(img);
    }

    // ================== 法师帧动画（8帧） ==================
    const MAGE_FRAME_COUNT = 8;
    const mageFramesLeft = [];   // 从右往左移动
    const mageFramesRight = [];  // 从左往右移动
    for (let i = 0; i < MAGE_FRAME_COUNT; i++) {
        const img = new Image();
        const num = String(i).padStart(2, '0');
        img.src = `assets/guard/法师/从右往左移动/frame_${num}_delay-0.2s.png`;
        mageFramesLeft.push(img);
    }
    for (let i = 0; i < MAGE_FRAME_COUNT; i++) {
        const img = new Image();
        const num = String(i).padStart(2, '0');
        img.src = `assets/guard/法师/从左往右移动/frame_${num}_delay-0.2s.png`;
        mageFramesRight.push(img);
    }

    // ================== 法师从右往左攻击帧动画（12帧） ==================
    const MAGE_ATTACK_FRAME_COUNT = 12;
    const mageAttackFramesLeft = [];
    const mageAttackFramesRight = [];  // 从左往右攻击
    for (let i = 0; i < MAGE_ATTACK_FRAME_COUNT; i++) {
        const img = new Image();
        const num = String(i).padStart(2, '0');
        img.src = `assets/guard/法师/从右往左攻击/frame_${num}_delay-0.2s.png`;
        mageAttackFramesLeft.push(img);
    }
    for (let i = 0; i < MAGE_ATTACK_FRAME_COUNT; i++) {
        const img = new Image();
        const num = String(i).padStart(2, '0');
        img.src = `assets/guard/法师/从左往右攻击/frame_${num}_delay-0.2s.png`;
        mageAttackFramesRight.push(img);
    }

    // ================== 剑客帧动画（9帧） ==================
    const SWORDSMAN_FRAME_COUNT = 9;
    const swordsmanFramesLeft = [];   // 从右往左移动
    const swordsmanFramesRight = [];  // 从左往右移动
    for (let i = 0; i < SWORDSMAN_FRAME_COUNT; i++) {
        const img = new Image();
        const num = String(i).padStart(2, '0');
        img.src = `assets/guard/剑客/从右往左移动/frame_${num}_delay-0.2s.png`;
        swordsmanFramesLeft.push(img);
    }
    for (let i = 0; i < SWORDSMAN_FRAME_COUNT; i++) {
        const img = new Image();
        const num = String(i).padStart(2, '0');
        img.src = `assets/guard/剑客/从左往右移动/frame_${num}_delay-0.2s.png`;
        swordsmanFramesRight.push(img);
    }

    // ================== 剑客从右往左攻击帧动画（15帧） ==================
    const SWORDSMAN_ATTACK_FRAME_COUNT = 15;
    const swordsmanAttackFramesLeft = [];
    const swordsmanAttackFramesRight = [];  // 从左往右攻击
    for (let i = 0; i < SWORDSMAN_ATTACK_FRAME_COUNT; i++) {
        const img = new Image();
        const num = String(i).padStart(2, '0');
        img.src = `assets/guard/剑客/从右往左攻击/frame_${num}_delay-0.2s.png`;
        swordsmanAttackFramesLeft.push(img);
    }
    for (let i = 0; i < SWORDSMAN_ATTACK_FRAME_COUNT; i++) {
        const img = new Image();
        const num = String(i).padStart(2, '0');
        img.src = `assets/guard/剑客/从左往右攻击/frame_${num}_delay-0.2s.png`;
        swordsmanAttackFramesRight.push(img);
    }

    // ================== 机枪兵帧动画（8帧） ==================
    const GUNNER_FRAME_COUNT = 8;
    const gunnerFramesLeft = [];   // 从右往左移动
    const gunnerFramesRight = [];  // 从左往右移动
    for (let i = 0; i < GUNNER_FRAME_COUNT; i++) {
        const img = new Image();
        const num = String(i);
        img.src = `assets/guard/机枪兵/从右往左移动/frame_${num}_delay-0.21s.png`;
        gunnerFramesLeft.push(img);
    }
    for (let i = 0; i < GUNNER_FRAME_COUNT; i++) {
        const img = new Image();
        const num = String(i);
        img.src = `assets/guard/机枪兵/从左往右移动/frame_${num}_delay-0.21s.png`;
        gunnerFramesRight.push(img);
    }

    // ================== 机枪兵从右往左攻击帧动画（3帧） ==================
    const GUNNER_ATTACK_FRAME_COUNT = 3;
    const gunnerAttackFramesLeft = [];
    const gunnerAttackFramesRight = [];  // 从左往右攻击
    for (let i = 0; i < GUNNER_ATTACK_FRAME_COUNT; i++) {
        const img = new Image();
        const num = String(i);
        img.src = `assets/guard/机枪兵/从右往左攻击/frame_${num}_delay-0.05s.png`;
        gunnerAttackFramesLeft.push(img);
    }
    for (let i = 0; i < GUNNER_ATTACK_FRAME_COUNT; i++) {
        const img = new Image();
        const num = String(i);
        img.src = `assets/guard/机枪兵/从左往右攻击/frame_${num}_delay-0.05s.png`;
        gunnerAttackFramesRight.push(img);
    }

    // ================== 狙击手帧动画（7帧） ==================
    const SNIPER_FRAME_COUNT = 7;
    const sniperFramesLeft = [];   // 从右往左移动
    const sniperFramesRight = [];  // 从左往右移动
    for (let i = 0; i < SNIPER_FRAME_COUNT; i++) {
        const img = new Image();
        const num = String(i).padStart(2, '0');
        img.src = `assets/guard/狙击手/从右往左移动/frame_${num}_delay-0.png`;
        sniperFramesLeft.push(img);
    }
    for (let i = 0; i < SNIPER_FRAME_COUNT; i++) {
        const img = new Image();
        const num = String(i).padStart(2, '0');
        img.src = `assets/guard/狙击手/从左往右移动/frame_${num}_delay-0.png`;
        sniperFramesRight.push(img);
    }

    // ================== 狙击手从右往左攻击帧动画（12帧） ==================
    const SNIPER_ATTACK_FRAME_COUNT = 12;
    const sniperAttackFramesLeft = [];
    const sniperAttackFramesRight = [];  // 从左往右攻击
    for (let i = 0; i < SNIPER_ATTACK_FRAME_COUNT; i++) {
        const img = new Image();
        const num = String(i).padStart(2, '0');
        img.src = `assets/guard/狙击手/从右往左攻击/frame_${num}_delay-0.png`;
        sniperAttackFramesLeft.push(img);
    }
    for (let i = 0; i < SNIPER_ATTACK_FRAME_COUNT; i++) {
        const img = new Image();
        const num = String(i).padStart(2, '0');
        img.src = `assets/guard/狙击手/从左往右攻击/frame_${num}_delay-0.png`;
        sniperAttackFramesRight.push(img);
    }

    // ================== 圣骑士帧动画（8帧） ==================
    const PALADIN_FRAME_COUNT = 8;
    const paladinFramesLeft = [];   // 从右往左移动
    const paladinFramesRight = [];  // 从左往右移动
    for (let i = 0; i < PALADIN_FRAME_COUNT; i++) {
        const img = new Image();
        const num = String(i).padStart(2, '0');
        img.src = `assets/guard/圣骑士/从右往左移动/frame_${num}_delay-0.2s.png`;
        paladinFramesLeft.push(img);
    }
    for (let i = 0; i < PALADIN_FRAME_COUNT; i++) {
        const img = new Image();
        const num = String(i).padStart(2, '0');
        img.src = `assets/guard/圣骑士/从左往右移动/frame_${num}_delay-0.2s.png`;
        paladinFramesRight.push(img);
    }

    // ================== 圣骑士从右往左攻击帧动画（13帧） ==================
    const PALADIN_ATTACK_FRAME_COUNT = 13;
    const paladinAttackFramesLeft = [];
    const paladinAttackFramesRight = [];  // 从左往右攻击
    for (let i = 0; i < PALADIN_ATTACK_FRAME_COUNT; i++) {
        const img = new Image();
        const num = String(i).padStart(2, '0');
        img.src = `assets/guard/圣骑士/从右往左攻击/frame_${num}_delay-0.2s.png`;
        paladinAttackFramesLeft.push(img);
    }
    for (let i = 0; i < PALADIN_ATTACK_FRAME_COUNT; i++) {
        const img = new Image();
        const num = String(i).padStart(2, '0');
        img.src = `assets/guard/圣骑士/从左往右攻击/frame_${num}_delay-0.2s.png`;
        paladinAttackFramesRight.push(img);
    }

    // ================== 圣骑士从右往左释放加血帧动画（15帧） ==================
    const PALADIN_HEAL_FRAME_COUNT = 15;
    const paladinHealFramesLeft = [];
    const paladinHealFramesRight = [];  // ← 待补充从左往右释放加血
    for (let i = 0; i < PALADIN_HEAL_FRAME_COUNT; i++) {
        const img = new Image();
        const num = String(i).padStart(2, '0');
        img.src = `assets/guard/圣骑士/从右往左释放加血/frame_${num}_delay-0.2s.png`;
        paladinHealFramesLeft.push(img);
    }
    for (let i = 0; i < PALADIN_HEAL_FRAME_COUNT; i++) {
        const img = new Image();
        const num = String(i).padStart(2, '0');
        img.src = `assets/guard/圣骑士/从左往右释放加血/frame_${num}_delay-0.2s.png`;
        paladinHealFramesRight.push(img);
    }

    // ================== 子弹击中爆炸帧动画（11帧） ==================
    const EXPLOSION_FRAME_COUNT = 11;
    const EXPLOSION_FRAME_DELAY = 0.03;
    const explosionFrames = [];
    for (let i = 0; i < EXPLOSION_FRAME_COUNT; i++) {
        const img = new Image();
        const num = String(i).padStart(2, '0');
        img.src = `assets/attack/子弹击中敌人爆炸/frame_${num}_delay-0.03s.png`;
        explosionFrames.push(img);
    }
    const EXPLOSIONS_CAPACITY = 100;
    const explosions = [];

    // ================== 护卫攻击敌人爆炸帧动画（11帧） ==================
    const GUARD_EXPLOSION_FRAME_COUNT = 11;
    const GUARD_EXPLOSION_DELAY = 0.03;
    const guardExplosionFrames = [];
    for (let i = 0; i < GUARD_EXPLOSION_FRAME_COUNT; i++) {
        const img = new Image();
        const num = String(i).padStart(2, '0');
        img.src = `assets/guard/护卫攻击敌人爆炸/frame_${num}_delay-0.03s.png`;
        guardExplosionFrames.push(img);
    }
    const GUARD_EXPLOSIONS_CAPACITY = 100;
    const guardExplosions = [];
    let guardExplosionCount = 0;

    // ================== 护卫死亡帧动画（7帧） ==================
    const GUARD_DEATH_FRAME_COUNT = 7;
    const GUARD_DEATH_DURATION = 0.6;
    const guardDeathFrames = [];
    for (let i = 0; i < GUARD_DEATH_FRAME_COUNT; i++) {
        const img = new Image();
        const num = String(i).padStart(2, '0');
        img.src = `assets/guard/护卫死亡/frame_${num}_delay-0.21s.png`;
        guardDeathFrames.push(img);
    }
    const GUARD_DEATHS_CAPACITY = 50;
    const guardDeaths = [];
    let guardDeathCount = 0;

    // ================== 防御塔帧动画 ==================
    const ARROW_TOWER_FRAME_COUNT = 6;
    const ARROW_TOWER_FRAME_DELAY = 0.12;
    const arrowTowerFrames = [];
    for (let i = 0; i < ARROW_TOWER_FRAME_COUNT; i++) {
        const img = new Image();
        img.src = `assets/Defense tower/机枪猫/从左往右待机/frame_${i}_delay-0.05s.png`;
        arrowTowerFrames.push(img);
    }
    // 从右往左待机动图
    const arrowTowerFramesRight = [];
    for (let i = 0; i < ARROW_TOWER_FRAME_COUNT; i++) {
        const img = new Image();
        img.src = `assets/Defense tower/机枪猫/从右往左待机/frame_${i}_delay-0.05s.png`;
        arrowTowerFramesRight.push(img);
    }
    let arrowTowerFrameTimer = 0;

    // ================== 机枪猫攻击帧动画 ==================
    const ARROW_TOWER_ATTACK_FRAME_COUNT = 3;
    const ARROW_TOWER_ATTACK_FRAME_DELAY = 0.05;
    const arrowTowerAttackFrames = [];
    for (let i = 0; i < ARROW_TOWER_ATTACK_FRAME_COUNT; i++) {
        const img = new Image();
        img.src = `assets/Defense tower/机枪猫/从左往右攻击/frame_${i}_delay-0.05s.png`;
        arrowTowerAttackFrames.push(img);
    }
    // 从右往左攻击动画
    const arrowTowerAttackFramesRight = [];
    for (let i = 0; i < ARROW_TOWER_ATTACK_FRAME_COUNT; i++) {
        const img = new Image();
        img.src = `assets/Defense tower/机枪猫/从右往左攻击/frame_${i}_delay-0.05s.png`;
        arrowTowerAttackFramesRight.push(img);
    }
    let arrowTowerAttackFrameTimer = 0;

    // ================== 机枪猫图标 ==================
    const arrowTowerIcon = new Image();
    arrowTowerIcon.src = 'assets/icon/机枪猫/frame_0_delay-0.05s.png';

    // ================== 炮兵猫图标 ==================
    const flameTowerIcon = new Image();
    flameTowerIcon.src = 'assets/icon/炮兵猫/frame_0_delay-0.05s.png';

    // ================== 冰霜女图标 ==================
    const frostTowerIcon = new Image();
    frostTowerIcon.src = 'assets/icon/冰霜女/frame_00_delay-0.2s.png';

    // ================== 火箭鼠图标 ==================
    const laserTowerIcon = new Image();
    laserTowerIcon.src = 'assets/icon/火箭鼠/frame_1_delay-0.2s.png';

    // ================== 金矿图标 ==================
    const goldMineIcon = new Image();
    goldMineIcon.src = 'assets/icon/金矿/frame_2_delay-0.png';

    // ================== 减速带单帧素材 ==================
    const iceSpikeTrapImg = new Image();
    iceSpikeTrapImg.src = 'assets/trap/减速域/huaban-6988479485.webp';

    // ================== 减速带图标 ==================
    const iceSpikeTrapIcon = new Image();
    iceSpikeTrapIcon.src = 'assets/icon/减速带/huaban-6988479485.webp';

    // ================== 障碍物图标 ==================
    const blockTrapIcon = new Image();
    blockTrapIcon.src = 'assets/icon/障碍物/huaban-5655871398.png';

    // ================== 爆炸区图标 ==================
    const explosiveTrapIcon = new Image();
    explosiveTrapIcon.src = 'assets/icon/爆炸区/pngtree_1781576174448_frame_01_delay-0.png';

    // ================== 传送器图标 ==================
    const bounceTrapIcon = new Image();
    bounceTrapIcon.src = 'assets/icon/传送器/frame_03_delay-0.21s.png';

    // ================== 障碍物素材 ==================
    const blockTrapImg = new Image();
    blockTrapImg.src = 'assets/trap/障碍物/huaban-5655871398.png';

    // ================== 爆炸区待机素材 ==================
    const explosiveTrapImg = new Image();
    let explosiveTrapImgCleanCanvas = null;
    // 用fetch读取blob，再createImageBitmap绕过file://的canvas污染
    (async function loadExplosiveTrap() {
        try {
            const resp = await fetch('assets/trap/爆炸区/待机/pngtree_1781576174448_frame_01_delay-0.png');
            const blob = await resp.blob();
            const bitmap = await createImageBitmap(blob);
            const c = document.createElement('canvas');
            c.width = bitmap.width;
            c.height = bitmap.height;
            const cx = c.getContext('2d');
            cx.drawImage(bitmap, 0, 0);
            const imageData = cx.getImageData(0, 0, c.width, c.height);
            const d = imageData.data;
            for (let i = 0; i < d.length; i += 4) {
                if (d[i] > 200 && d[i+1] < 80 && d[i+2] < 80) {
                    d[i+3] = 0;
                }
            }
            cx.putImageData(imageData, 0, 0);
            explosiveTrapImgCleanCanvas = c;
        } catch(e) {
            explosiveTrapImgCleanCanvas = null;
        }
    })();
    explosiveTrapImg.src = 'assets/trap/爆炸区/待机/pngtree_1781576174448_frame_01_delay-0.png';

    // ================== 爆炸区引爆帧动画 ==================
    const trapExplosionFrameCount = 12;
    const trapExplosionFrames = [];
    const trapExplosionFrameNames = [
        'frame_00_delay-0',
        'frame_01_delay-0',
        'frame_02_delay-0',
        'frame_03_delay-0',
        'frame_06_delay-0',
        'frame_07_delay-0',
        'frame_09_delay-0',
        'frame_10_delay-0',
        'frame_12_delay-0',
        'frame_13_delay-0',
        'frame_15_delay-0',
        'frame_16_delay-0'
    ];
    for (const name of trapExplosionFrameNames) {
        const img = new Image();
        img.src = 'assets/trap/爆炸区/爆炸/' + name + '.png';
        trapExplosionFrames.push(img);
    }
    let trapExplosions = [];
    let trapExplosionCount = 0;

    // ================== 传送器弹射效果 ==================
    let bounceEffects = [];
    let bounceEffectCount = 0;

    // ================== 传送器帧动画素材 ==================
    const BOUNCE_TRAP_FRAME_COUNT = 10;
    const BOUNCE_TRAP_FRAME_DELAY = 0.12;
    const bounceTrapFrames = [];
    for (let i = 0; i < BOUNCE_TRAP_FRAME_COUNT; i++) {
        const img = new Image();
        img.src = `assets/trap/传送器/frame_${String(i).padStart(2,'0')}_delay-0.21s.png`;
        bounceTrapFrames.push(img);
    }
    let bounceTrapFrameTimer = 0;

    // ================== 传送器待机素材 ==================
    const bounceTrapIdleImg = new Image();
    bounceTrapIdleImg.src = 'assets/trap/传送器/待机/frame_03_delay-0.21s.png';

    // ================== 农民图标 ==================
    const farmerIcon = new Image();
    farmerIcon.src = 'assets/icon/农民/frame_00_delay-0.png';

    // ================== 全护卫营地图标 ==================
    const campIconPaths = {
        infantry: '步兵/frame_00_delay-0.05s.png',
        archer: '弓箭手/frame_01_delay-0.png',
        knight: '骑士/frame_06_delay-0.05.png',
        mage: '法师/frame_00_delay-0.2s.png',
        swordsman: '剑客/frame_00_delay-0.2s.png',
        paladin: '圣骑士/frame_05_delay-0.2s.png',
        sniper: '狙击手/frame_00_delay-0.png',
        gunner: '机枪兵/frame_0_delay-0.05s.png'
    };
    const campIcons = {};
    for (const [key, path] of Object.entries(campIconPaths)) {
        const img = new Image();
        img.src = 'assets/icon/' + path;
        campIcons[key] = img;
    }

    // ================== 炮兵猫帧动画 ==================
    const FLAME_TOWER_FRAME_COUNT = 6;
    const FLAME_TOWER_FRAME_DELAY = 0.12;
    const flameTowerFrames = [];
    for (let i = 0; i < FLAME_TOWER_FRAME_COUNT; i++) {
        const img = new Image();
        img.src = `assets/Defense tower/炮兵猫/从左往右待机/frame_${i}_delay-0.05s.png`;
        flameTowerFrames.push(img);
    }
    // 从右往左待机动图
    const flameTowerFramesRight = [];
    for (let i = 0; i < FLAME_TOWER_FRAME_COUNT; i++) {
        const img = new Image();
        img.src = `assets/Defense tower/炮兵猫/从右往左待机/frame_${i}_delay-0.05s.png`;
        flameTowerFramesRight.push(img);
    }
    let flameTowerFrameTimer = 0;

    // ================== 炮兵猫攻击帧动画 ==================
    const FLAME_TOWER_ATTACK_FRAME_COUNT = 7;
    const FLAME_TOWER_ATTACK_FRAME_DELAY = 0.05;
    const flameTowerAttackFrames = [];
    for (let i = 0; i < FLAME_TOWER_ATTACK_FRAME_COUNT; i++) {
        const img = new Image();
        img.src = `assets/Defense tower/炮兵猫/从左往右攻击/frame_${i}_delay-0.05s.png`;
        flameTowerAttackFrames.push(img);
    }
    // 从右往左攻击动画
    const flameTowerAttackFramesRight = [];
    for (let i = 0; i < FLAME_TOWER_ATTACK_FRAME_COUNT; i++) {
        const img = new Image();
        img.src = `assets/Defense tower/炮兵猫/从右往左攻击/frame_${i}_delay-0.05s.png`;
        flameTowerAttackFramesRight.push(img);
    }
    let flameTowerAttackFrameTimer = 0;

    // ================== 火箭鼠帧动画 ==================
    const LASER_TOWER_FRAME_COUNT = 4;
    const LASER_TOWER_FRAME_DELAY = 0.2;
    const laserTowerFrames = [];
    for (let i = 0; i < LASER_TOWER_FRAME_COUNT; i++) {
        const img = new Image();
        img.src = `assets/Defense tower/火箭鼠/从左往右待机/frame_${i}_delay-0.2s.png`;
        laserTowerFrames.push(img);
    }
    // 从右往左待机动图
    const laserTowerFramesRight = [];
    for (let i = 0; i < LASER_TOWER_FRAME_COUNT; i++) {
        const img = new Image();
        img.src = `assets/Defense tower/火箭鼠/从右往左待机/frame_${i}_delay-0.2s.png`;
        laserTowerFramesRight.push(img);
    }
    let laserTowerFrameTimer = 0;

    // ================== 火箭鼠攻击帧动画 ==================
    const LASER_TOWER_ATTACK_FRAME_COUNT = 5;
    const LASER_TOWER_ATTACK_FRAME_DELAY = 0.1;
    const laserTowerAttackFrames = [];
    for (let i = 0; i < LASER_TOWER_ATTACK_FRAME_COUNT; i++) {
        const img = new Image();
        img.src = `assets/Defense tower/火箭鼠/从左往右攻击/frame_${i}_delay-0.2s.png`;
        laserTowerAttackFrames.push(img);
    }
    const laserTowerAttackFramesRight = [];
    for (let i = 0; i < LASER_TOWER_ATTACK_FRAME_COUNT; i++) {
        const img = new Image();
        img.src = `assets/Defense tower/火箭鼠/从右往左攻击/frame_${i}_delay-0.2s.png`;
        laserTowerAttackFramesRight.push(img);
    }
    let laserTowerAttackFrameTimer = 0;

    // ================== 冰霜女帧动画 ==================
    const FROST_TOWER_FRAME_COUNT = 10;
    const FROST_TOWER_FRAME_DELAY = 0.12;
    const frostTowerFrames = [];
    for (let i = 0; i < FROST_TOWER_FRAME_COUNT; i++) {
        const img = new Image();
        img.src = `assets/Defense tower/冰霜女/从左往右待机/frame_${String(i).padStart(2, '0')}_delay-0.2s.png`;
        frostTowerFrames.push(img);
    }
    const frostTowerFramesRight = [];
    for (let i = 0; i < FROST_TOWER_FRAME_COUNT; i++) {
        const img = new Image();
        img.src = `assets/Defense tower/冰霜女/从右往左待机/frame_${String(i).padStart(2, '0')}_delay-0.2s.png`;
        frostTowerFramesRight.push(img);
    }
    let frostTowerFrameTimer = 0;

    // ================== 冰霜女攻击帧动画 ==================
    const FROST_TOWER_ATTACK_FRAME_COUNT = 13;
    const FROST_TOWER_ATTACK_FRAME_DELAY = 0.06;
    const frostTowerAttackFrames = [];
    for (let i = 0; i < FROST_TOWER_ATTACK_FRAME_COUNT; i++) {
        const img = new Image();
        img.src = `assets/Defense tower/冰霜女/从左往右攻击/frame_${String(i).padStart(2, '0')}_delay-0.2s.png`;
        frostTowerAttackFrames.push(img);
    }
    const frostTowerAttackFramesRight = [];
    for (let i = 0; i < FROST_TOWER_ATTACK_FRAME_COUNT; i++) {
        const img = new Image();
        img.src = `assets/Defense tower/冰霜女/从右往左攻击/frame_${String(i).padStart(2, '0')}_delay-0.2s.png`;
        frostTowerAttackFramesRight.push(img);
    }
    let frostTowerAttackFrameTimer = 0;

    function addGuardDeath(x, y) {
        if (guardDeathCount >= GUARD_DEATHS_CAPACITY) return;
        const d = guardDeaths[guardDeathCount];
        if (d) {
            d.x = x; d.y = y; d.timer = 0;
        } else {
            guardDeaths[guardDeathCount] = { x, y, timer: 0 };
        }
        guardDeathCount++;
    }
    function removeExpiredGuardDeaths() {
        let w = 0;
        for (let i = 0; i < guardDeathCount; i++) {
            const d = guardDeaths[i];
            d.timer += lastDeltaTime || 0.016;
            if (d.timer < GUARD_DEATH_DURATION) {
                if (w !== i) guardDeaths[w] = guardDeaths[i];
                w++;
            }
        }
        for (let i = w; i < guardDeathCount; i++) guardDeaths[i] = null;
        guardDeathCount = w;
    }
    function addExplosion(x, y, size) {
        if (explosionCount >= EXPLOSIONS_CAPACITY) return;
        const e = explosions[explosionCount];
        if (e) {
            e.x = x; e.y = y; e.size = size;
            e.frame = 0; e.timer = 0;
        } else {
            explosions[explosionCount] = { x, y, size, frame: 0, timer: 0 };
        }
        explosionCount++;
    }
    function addGuardExplosion(x, y, damageFriend, damageTarget) {
        if (guardExplosionCount >= GUARD_EXPLOSIONS_CAPACITY) return;
        const e = guardExplosions[guardExplosionCount];
        if (e) {
            e.x = x; e.y = y;
            e.frame = 0; e.timer = 0;
            e.damageFriend = damageFriend || null;
            e.damageTarget = damageTarget || null;
            e.damageApplied = false;
        } else {
            guardExplosions[guardExplosionCount] = { x, y, frame: 0, timer: 0, damageFriend: damageFriend || null, damageTarget: damageTarget || null, damageApplied: false };
        }
        guardExplosionCount++;
    }
    function removeExpiredGuardExplosions() {
        let w = 0;
        for (let i = 0; i < guardExplosionCount; i++) {
            const e = guardExplosions[i];
            e.timer += lastDeltaTime || 0.016;
            e.frame = Math.min(GUARD_EXPLOSION_FRAME_COUNT - 1, Math.floor(e.timer / GUARD_EXPLOSION_DELAY));
            // 爆炸播放 0.01s 后出伤
            if (!e.damageApplied && e.damageFriend && e.damageTarget && e.timer >= 0.01) {
                e.damageApplied = true;
                if (e.damageTarget.alive) applyFriendDamage(e.damageFriend, e.damageTarget);
            }
            if (e.frame < GUARD_EXPLOSION_FRAME_COUNT - 1) {
                if (w !== i) guardExplosions[w] = guardExplosions[i];
                w++;
            }
        }
        for (let i = w; i < guardExplosionCount; i++) guardExplosions[i] = null;
        guardExplosionCount = w;
    }
    function removeExpiredExplosions() {
        let w = 0;
        for (let i = 0; i < explosionCount; i++) {
            const e = explosions[i];
            e.timer += lastDeltaTime || 0.016;
            e.frame = Math.min(EXPLOSION_FRAME_COUNT - 1, Math.floor(e.timer / EXPLOSION_FRAME_DELAY));
            if (e.frame < EXPLOSION_FRAME_COUNT - 1) {
                if (w !== i) explosions[w] = explosions[i];
                w++;
            }
        }
        for (let i = w; i < explosionCount; i++) explosions[i] = null;
        explosionCount = w;
    }

    // ================== 深渊大门帧动画 ==================
    const GATE_FRAME_COUNT = 9;
    const gateFrames = [];
    for (let i = 0; i < GATE_FRAME_COUNT; i++) {
        const img = new Image();
        img.src = `assets/material/深渊大门/frame_${i}_delay-0.07s.png`;
        gateFrames.push(img);
    }

    // ================== 游戏变量（立即初始化默认值，防止draw时player/crystal为undefined） ==================
let player = { x:400, y:380, width:20, height:20, color:'blue', speed:100, bulletSpeed:500, bulletDamage:10, attackCooldown:1, attackTimer:0, attackRange:150,
        burstShotsRemaining: 0, burstTimer: 0, burstInterval: 0.08, burstTarget: null, facing:1, animFrame:0, animTimer:0, attacking:0 };
    let crystal = { x:0, y:0, radius:0, color:'transparent', health:99999, level:1 };
    let towers = [];
    let playerGold = 0, playerExperience = 0, currentWave = 1;
    gameRunning = false;
    gamePaused = false;
    let activePathCount;
    let placingTower, selectedAsset;
    let selectedTower = null;
    let selectedCamp = null;
    let selectedEnemy = null;
    let selectedUnitKey = null; // 新增：当前选中的兵种Key // 当前选中的防御塔/陷阱（用于升级）
    let unitHideTimer = null; // 兵种升级面板关闭计时器

    // ========== 零GC数组：全部使用预分配 + 计数器模式 ==========
    let enemies, bullets, attacks, damageTexts, friendlies, friendShots;
    let enemyCount = 0, bulletCount = 0, attackCount = 0, damageTextCount = 0, friendShotCount = 0, explosionCount = 0;
    const ENEMIES_CAPACITY = 100, BULLETS_CAPACITY = 500, ATTACKS_CAPACITY = 50, DAMAGE_TEXTS_CAPACITY = 100, FRIEND_SHOTS_CAPACITY = 250;

    // 零GC添加/移除辅助函数
    function addDamageText(x, y, value, color, duration, speed) {
        if (damageTextCount >= DAMAGE_TEXTS_CAPACITY) return null;
        const t = damageTexts[damageTextCount];
        if (t) {
            t.x = x; t.y = y; t.value = value; t.color = color;
            t.duration = duration || 1.8; t.timer = 0; t.speed = speed || 50;
        } else {
            damageTexts[damageTextCount] = { x, y, value, color, duration: duration||1.8, timer: 0, speed: speed||50 };
        }
        return damageTexts[damageTextCount++];
    }

    let hudGoldGainEl = null;
    let hudGoldGainHideTimer = null;
    let hudGoldGainResetTimer = null;
    let hudGoldGainPending = 0;

    function ensureHudGoldGainEl() {
        if (hudGoldGainEl && document.body.contains(hudGoldGainEl)) return hudGoldGainEl;
        const hudGold = document.getElementById('gameGold');
        if (!hudGold) return null;
        let el = document.getElementById('hudGoldGain');
        if (!el) {
            el = document.createElement('span');
            el.id = 'hudGoldGain';
            el.className = 'hud-gold-gain';
            hudGold.appendChild(el);
        }
        hudGoldGainEl = el;
        return el;
    }

    function showHudGoldGain(amount) {
        const el = ensureHudGoldGainEl();
        if (!el) return;
        hudGoldGainPending += amount;
        el.textContent = hudGoldGainPending >= 0 ? `+${hudGoldGainPending}` : `${hudGoldGainPending}`;
        el.classList.add('show');
        if (hudGoldGainHideTimer) clearTimeout(hudGoldGainHideTimer);
        if (hudGoldGainResetTimer) clearTimeout(hudGoldGainResetTimer);
        hudGoldGainHideTimer = setTimeout(() => {
            el.classList.remove('show');
        }, 650);
        hudGoldGainResetTimer = setTimeout(() => {
            hudGoldGainPending = 0;
            el.textContent = '';
        }, 900);
    }

    function addGoldText(amount) {
        showHudGoldGain(amount);
    }

    function addBullet(x, y, target, radius, color, speed, damage, slowDuration, slowPercentage, isLaser, isFlame, fromTower, fromPlayer, fromEnemy, pierceCount) {
        if (bulletCount >= BULLETS_CAPACITY) return null;
        const pc = pierceCount || 0;
        const b = bullets[bulletCount];
        if (b) {
            b.x = x; b.y = y; b.target = target; b.radius = radius;
            b.color = color; b.speed = speed; b.damage = damage;
            b.slowDuration = slowDuration||0; b.slowPercentage = slowPercentage||0;
            b.isLaser = isLaser||false; b.isFlame = isFlame||false; b.dx = 0; b.dy = 0;
            b.fromTower = !!fromTower;
            b.fromPlayer = !!fromPlayer;
            b.fromEnemy = !!fromEnemy;
            b.pierceCount = pc;
            if (pc > 0) {
                if (!b.piercedEnemies) b.piercedEnemies = [];
                else b.piercedEnemies.length = 0; // 清空复用数组
            } else {
                b.piercedEnemies = undefined;
            }
        } else {
            bullets[bulletCount] = { x, y, target, radius, color, speed, damage,
                slowDuration: slowDuration||0, slowPercentage: slowPercentage||0,
                isLaser: isLaser||false, isFlame: isFlame||false, dx: 0, dy: 0,
                fromTower: !!fromTower, fromPlayer: !!fromPlayer, fromEnemy: !!fromEnemy,
                pierceCount: pc, piercedEnemies: pc > 0 ? [] : undefined };
        }
        return bullets[bulletCount++];
    }

    function addAttack(x, y, width, height, color, duration) {
        if (attackCount >= ATTACKS_CAPACITY) return null;
        const a = attacks[attackCount];
        if (a) {
            a.x = x; a.y = y; a.width = width; a.height = height;
            a.color = color; a.duration = duration; a.timer = 0;
        } else {
            attacks[attackCount] = { x, y, width, height, color, duration, timer: 0 };
        }
        return attacks[attackCount++];
    }

    function addFriendShot(type, x, y, tx, ty, color, speed, guardExplosion, damageFriend, damageTarget) {
        if (friendShotCount >= FRIEND_SHOTS_CAPACITY) return null;
        const dx = tx - x, dy = ty - y;
        const dist = Math.sqrt(dx*dx + dy*dy) || 1;
        const vx = (dx / dist) * speed;
        const vy = (dy / dist) * speed;
        const life = Math.max(0.12, Math.min(0.6, dist / speed));
        const s = friendShots[friendShotCount];
        if (s) {
            s.type = type;
            s.x = x; s.y = y;
            s.vx = vx; s.vy = vy;
            s.tx = tx; s.ty = ty;
            s.life = life; s.timer = 0;
            s.color = color;
            s.guardExplosion = guardExplosion || false;
            s.damageFriend = damageFriend || null;
            s.damageTarget = damageTarget || null;
        } else {
            friendShots[friendShotCount] = { type, x, y, vx, vy, tx, ty, life, timer: 0, color, guardExplosion: guardExplosion || false, damageFriend: damageFriend || null, damageTarget: damageTarget || null };
        }
        return friendShots[friendShotCount++];
    }

    // 零GC移除已死亡/过期元素（原地压缩）
    function removeDeadEnemies() {
        let w = 0;
        for (let i = 0; i < enemyCount; i++) {
            const e = enemies[i];
            if (e.alive || e.dying) {
                if (w !== i) enemies[w] = enemies[i];
                w++;
            }
        }
        for (let i = w; i < enemyCount; i++) enemies[i] = null;
        enemyCount = w;
    }

    function removeExpiredBullets() {
        let w = 0;
        for (let i = 0; i < bulletCount; i++) {
            const b = bullets[i];
            // 存活条件：
            // 1. 追踪子弹：target存在且存活且在屏幕内
            // 2. 方向子弹（散射等）：target为null，且未命中过(!b.hit)，且在屏幕内
            const isDirectionBullet = b && !b.target && !b.hit;
            const isTrackingBullet = b && b.target && b.target.alive;
            const inBounds = b && b.x >= -50 && b.x <= canvas.width + 50 && b.y >= -50 && b.y <= canvas.height + 50;
            const alive = (isDirectionBullet || isTrackingBullet) && inBounds;
            if (alive) {
                if (w !== i) bullets[w] = bullets[i];
                w++;
            }
        }
        for (let i = w; i < bulletCount; i++) bullets[i] = null;
        bulletCount = w;
    }

    function removeExpiredAttacks() {
        let w = 0;
        for (let i = 0; i < attackCount; i++) {
            attacks[i].timer += lastDeltaTime || 0.016;
            if (attacks[i].timer < attacks[i].duration) {
                if (w !== i) attacks[w] = attacks[i];
                w++;
            }
        }
        for (let i = w; i < attackCount; i++) attacks[i] = null;
        attackCount = w;
        // 爆炸区帧动画清理
        let tew = 0;
        for (let i = 0; i < trapExplosionCount; i++) {
            trapExplosions[i].timer += lastDeltaTime || 0.016;
            if (trapExplosions[i].timer < 0.5) {
                if (tew !== i) trapExplosions[tew] = trapExplosions[i];
                tew++;
            }
        }
        for (let i = tew; i < trapExplosionCount; i++) trapExplosions[i] = null;
        trapExplosionCount = tew;
        // 传送器弹射效果清理
        let bew = 0;
        for (let i = 0; i < bounceEffectCount; i++) {
            bounceEffects[i].timer += lastDeltaTime || 0.016;
            if (bounceEffects[i].timer < bounceEffects[i].duration) {
                if (bew !== i) bounceEffects[bew] = bounceEffects[i];
                bew++;
            }
        }
        for (let i = bew; i < bounceEffectCount; i++) bounceEffects[i] = null;
        bounceEffectCount = bew;
    }

    function removeExpiredDamageTexts() {
        let w = 0;
        for (let i = 0; i < damageTextCount; i++) {
            const t = damageTexts[i];
            t.timer += lastDeltaTime || 0.016;
            t.y -= t.speed * (lastDeltaTime || 0.016);
            if (t.timer < t.duration) {
                if (w !== i) damageTexts[w] = damageTexts[i];
                w++;
            }
        }
        for (let i = w; i < damageTextCount; i++) damageTexts[i] = null;
        damageTextCount = w;
    }

    function removeExpiredFriendShots() {
        let w = 0;
        for (let i = 0; i < friendShotCount; i++) {
            const s = friendShots[i];
            s.timer += lastDeltaTime || 0.016;
            s.x += s.vx * (lastDeltaTime || 0.016);
            s.y += s.vy * (lastDeltaTime || 0.016);
            if (s.timer < s.life) {
                if (w !== i) friendShots[w] = friendShots[i];
                w++;
            } else if (s.guardExplosion) {
                // 子弹到达目标位置，在敌人正中心触发爆炸，0.25s后出伤
                if (s.damageFriend && s.damageTarget) {
                    addGuardExplosion(s.tx, s.ty, s.damageFriend, s.damageTarget);
                } else {
                    addGuardExplosion(s.tx, s.ty);
                }
            }
        }
        for (let i = w; i < friendShotCount; i++) friendShots[i] = null;
        friendShotCount = w;
    }

    // ================== 其他系统变量 ==================
    let maxWavesPerLevel = 20;
    let waveConfig = null, spawnQueue = [], spawnTimer = 0, spawnQueueIndex = 0;
    let waveActive = false, waveCompleted = false, waveRewardTimer = 0;
    let waveSpawnComplete = false, waveCooldownActive = false, waveCooldownTimer = 0;
    const WAVE_COOLDOWN_DURATION = 30;
    let lastDeltaTime = 0.016;

    // ========== 性能优化：预计算所有波次配置 ==========
    let precomputedWaveConfigs = [], cachedActivePaths = [];

    function precomputeAllWaveConfigs(level) {
        precomputedWaveConfigs = [];
        for (let w = 1; w <= maxWavesPerLevel; w++) precomputedWaveConfigs[w] = getWaveConfig(level, w);
    }

    // ========== 对象池 ==========
    const enemyPool = [];
    let enemyPoolIndex = 0;

    function acquireEnemy() {
        if (enemyPoolIndex < enemyPool.length) return enemyPool[enemyPoolIndex++];
        const e = { x:0, y:0, width:15, height:15, color:'#FF4444', baseSpeed:50, currentSpeed:50,
            health:30, originalHealth:30, isBlocked:false, targetTrap:null,
            attackDamage:5, attackSpeed:1, attackCooldown:1, attackTimer:0, rangedAttackCooldown:1, rangedAttackTimer:0,
            slowedByIceSpike:false, iceSpikeSlowFactor:0,
            frozenByFrostTower:false, frostTowerSlowFactor:0, frozenTimer:0,
            isArmored:false, isBoss:false, goldReward:5, expReward:1,
            bounceCooldown:0, path:null, pathIndex:0, alive:false, dying:false, deathTimer:0,
            facingX:1, attackAnimTimer:0, type:null, attackRange:0, projectileSpeed:0, projectileRadius:0, projectileColor:null,
            bleeding:false, bleedTimer:0, bleedDps:0, bleedAccumulatedDamage:0, lastBleedTextTimer:0,
            bloodParticles:[], bloodSpawnTimer:0 };
        enemyPool.push(e);
        enemyPoolIndex = enemyPool.length;
        return e;
    }

    function resetEnemyPool() { enemyPoolIndex = 0; }

    function createEnemyFromPool(enemyConfig, pathWaypoints) {
        const typeConfig = ENEMY_CONFIG[enemyConfig.type];
        if (!typeConfig) return null;
        const startPoint = pathWaypoints[0];
        const health = Math.floor(typeConfig.baseHealth * enemyConfig.healthMult);
        const speed = Math.floor(typeConfig.baseSpeed * enemyConfig.speedMult);
        const goldReward = Math.floor(typeConfig.goldReward * enemyConfig.goldMult);
        const enemy = acquireEnemy();
        enemy.x = startPoint.x; enemy.y = startPoint.y;
        enemy.type = enemyConfig.type;
        enemy.width = typeConfig.width; enemy.height = typeConfig.height;
        enemy.color = typeConfig.color; enemy.alive = true;
        enemy.baseSpeed = speed; enemy.currentSpeed = speed;
        enemy.health = health; enemy.originalHealth = health;
        enemy.isBlocked = false; enemy.targetTrap = null;
        enemy.attackDamage = Math.max(1, Math.floor(typeConfig.attackDamage * (enemyConfig.attackMult || 1)));
        enemy.attackSpeed = typeConfig.attackSpeed;
        enemy.attackCooldown = 1 / typeConfig.attackSpeed; enemy.attackTimer = 0;
        enemy.rangedAttackCooldown = enemy.attackCooldown; enemy.rangedAttackTimer = 0;
        enemy.attackRange = typeConfig.attackRange || 0;
        enemy.projectileSpeed = typeConfig.projectileSpeed || 0;
        enemy.projectileRadius = typeConfig.projectileRadius || 0;
        enemy.projectileColor = typeConfig.projectileColor || null;
        enemy.slowedByIceSpike = false; enemy.iceSpikeSlowFactor = 0;
        enemy.frozenByFrostTower = false; enemy.frostTowerSlowFactor = 0; enemy.frozenTimer = 0;
        enemy.isArmored = typeConfig.isArmored || false;
        enemy.isBoss = enemyConfig.isBoss || false;
        enemy.goldReward = goldReward; enemy.expReward = typeConfig.expReward;
        enemy.bounceCooldown = 0; enemy.path = pathWaypoints; enemy.pathIndex = 0;
        // 根据第一个路径段方向初始化 facingX，避免出生方向错误
        if (pathWaypoints.length >= 2) {
            const initDx = pathWaypoints[1].x - pathWaypoints[0].x;
            if (initDx < 0) enemy.facingX = -1;
        }
        enemy.animFrame = Math.floor(Math.random() * NORMAL_ENEMY_FRAME_COUNT);
        // animFrame 上限在帧动画更新循环中按类型取模修正
        enemy.animTimer = Math.random() * 0.15;
        // 流血粒子
        enemy.bloodParticles = [];
        enemy.bloodSpawnTimer = 0;
        if (enemy.isBoss) { enemy.width = typeConfig.width; enemy.height = typeConfig.height; }
        return enemy;
    }

    // ========== 路径索引缓存 ==========
    const pathIndexCacheForDraw = new Map();
    function resetPathIndexCache() { pathIndexCacheForDraw.clear(); }

    const mouse = { x:0, y:0 };
    const keys = {};
    function initKeys() {
        ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','s','a','d',' ','z'].forEach(k => keys[k]=false);
    }

    // ================== 路径与关卡设置 ==================
    function getActivePathIndices(level) {
        // 从LEVEL_PATH_MAP获取当前关卡使用的路径索引
        const levelConfig = LEVEL_PATH_MAP[level];
        if (levelConfig) {
            return levelConfig.indices;
        }
        // 降级策略：如果找不到配置（不应该发生），返回1条默认路径
        return [0];
    }

    function getActivePathCount(level) {
        return getActivePathIndices(level).length;
    }

    function getActivePaths() {
        const indices = getActivePathIndices(gameState.currentLevel);
        return indices.map(idx => pathPool[idx]);
    }

    function getSpawnEntranceWaypointIndex(path) {
        // 优先选择路径上第一个在画布内的节点（敌人真正出现的位置）
        if (!path || path.length === 0) return 0;
        if (path.length <= 2) return path.length - 1;
        for (let i = 1; i < path.length - 1; i++) {
            const p = path[i];
            if (p.x >= 0 && p.x <= canvas.width && p.y >= 0 && p.y <= canvas.height) {
                return i;
            }
        }
        // 如果没有找到可见节点，回退到距离出生点最近的内部节点
        const spawnPoint = path[0];
        let bestIndex = 1;
        let bestDist = Infinity;
        for (let i = 1; i < path.length - 1; i++) {
            const dx = path[i].x - spawnPoint.x;
            const dy = path[i].y - spawnPoint.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < bestDist) {
                bestDist = dist;
                bestIndex = i;
            }
        }
        return Math.max(1, Math.min(bestIndex, path.length - 2));
    }

    function setFriendPatrolCenter(friend) {
        if (!friend || !friend.path || friend.patrolIndex === undefined) return;
        const patrolWaypoint = friend.path[friend.patrolIndex];
        if (!patrolWaypoint) return;
        friend.patrolCenterX = patrolWaypoint.x;
        friend.patrolCenterY = patrolWaypoint.y;
    }

    // ================== 波次管理系统 ==================
    function startNextWave() {
        if (currentWave > maxWavesPerLevel) {
            gameRunning = false;
            showGameResult(gameState.currentLevel, currentWave - 1);
            return;
        }
        waveSpawnComplete = false;
        waveCooldownActive = false;
        waveCooldownTimer = 0;
        waveConfig = precomputedWaveConfigs[currentWave] || getWaveConfig(gameState.currentLevel, currentWave);
        spawnQueue = waveConfig.enemyQueue;
        spawnQueueIndex = 0;
        spawnTimer = 0;
        waveActive = true;
        waveCompleted = false;
        
        console.log(`✅ Wave ${currentWave} started. Enemy count:`, spawnQueue.length);
        console.log('✅ cachedActivePaths:', cachedActivePaths.length, cachedActivePaths);
        
        const hudGameWave = document.getElementById('gameWave');
        if (hudGameWave) hudGameWave.textContent = `波次: ${currentWave}/${maxWavesPerLevel}`;

        requestAnimationFrame(() => {
            if (waveConfig.isBossWave) {
                addDamageText(canvas.width/2, canvas.height/2, 'BOSS来袭！', '#FF0000', 3, 15);
                addDamageText(canvas.width/2, canvas.height/2+10, waveConfig.wave===20?'最终BOSS！':'BOSS出现！', '#FF6600', 3, 15);
            } else if (waveConfig.isEliteWave) {
                addDamageText(canvas.width/2, canvas.height/2, '精英来袭', '#FF00FF', 2.5, 15);
            } else if (currentWave > 1) {
                addDamageText(canvas.width/2, canvas.height/2, `第 ${currentWave} 波`, 'gold', 1.5, 15);
            }
        });
    }

    function startWaveCooldown() {
        waveCooldownActive = true;
        waveCooldownTimer = WAVE_COOLDOWN_DURATION;
        addDamageText(canvas.width/2, canvas.height/2-60, `⏰ 距离下一波刷新还有 ${WAVE_COOLDOWN_DURATION} 秒`, '#FFA500', 1.5, 10);
    }

    function handleWaveComplete() {
        waveActive = false;
        waveCompleted = true;
        waveRewardTimer = 0.5;
        const goldBonus = waveConfig ? waveConfig.goldBonus : 10;
        playerGold += goldBonus;
        addDamageText(canvas.width/2, canvas.height/2, `💰 波次奖励: +${goldBonus} 金币`, '#FFD700', 1.5, 20);
        
        
        waveCooldownActive = false;
        waveCooldownTimer = 0;
        if (currentWave >= maxWavesPerLevel) {
            gameRunning = false;
            showGameResult(gameState.currentLevel, currentWave);
            return;
        }
    }

    // ================== 关卡重置 ==================
    window.resetGameForLevel = function(level) {
        resetEnemyPool();
        resetPathIndexCache();
        cachedActivePaths = [];

        // 修复：重置水晶摧毁状态
        // 水晶已移除，不再重置其状态
        gameState.isGameOver = false;
        gameState.lastResult = null;
        gameState.loseReason = null;
        gameState.bossTimerStarted = false;
        gameState.bossTimer = 0;
        closeModal('resultModal');

        player = { x:canvas.width/2-80, y:canvas.height/2+80, width:20, height:20, color:'blue',
            speed:100, bulletSpeed:900, bulletDamage:10, attackCooldown:1, attackTimer:0, attackRange:150,
            burstShotsRemaining: 0, burstTimer: 0, burstInterval: 0.08, burstTarget: null,
            speedBoostTimer: 0, speedBoostCooldown: 0 };

        // 水晶已移除，不再使用
        crystal = { x:0, y:0, radius:0, color:'transparent', health:99999, maxHealth:99999, level:1, maxLevel:1 };

        console.log('✅ Player created:', player);
        console.log('✅ Game initialized (no crystal mode)');

        // ========== 零GC：只初始化一次数组，之后只用计数器重置 ==========
        if (!enemies) {
            enemies = new Array(ENEMIES_CAPACITY);
            bullets = new Array(BULLETS_CAPACITY);
            attacks = new Array(ATTACKS_CAPACITY);
            damageTexts = new Array(DAMAGE_TEXTS_CAPACITY);
            friendlies = new Array(FRIENDS_CAPACITY);
            friendShots = new Array(FRIEND_SHOTS_CAPACITY);
            // 清空旧引用
            for (let i = 0; i < ENEMIES_CAPACITY; i++) enemies[i] = null;
            for (let i = 0; i < BULLETS_CAPACITY; i++) bullets[i] = null;
            for (let i = 0; i < ATTACKS_CAPACITY; i++) attacks[i] = null;
            for (let i = 0; i < DAMAGE_TEXTS_CAPACITY; i++) damageTexts[i] = null;
            for (let i = 0; i < FRIENDS_CAPACITY; i++) friendlies[i] = null;
            for (let i = 0; i < FRIEND_SHOTS_CAPACITY; i++) friendShots[i] = null;
        }
        enemyCount = 0;
        bulletCount = 0;
        explosionCount = 0;
        guardExplosionCount = 0;
        towerCount = 0;
        towers = [];
        attackCount = 0;
        damageTextCount = 0;
        friendCount = 0;
        friendShotCount = 0;
        friendSpawnTimer = 0;
        // 重置营地
        for (let i = 0; i < CAMPS_CAPACITY; i++) camps[i] = null;
        campCount = 0;
        settingCampMarker = false;
        campBeingMarked = null;
        placingTower = false;
        selectedAsset = null;
        selectedTower = null;
        initKeys();

        // 重置经验/等级/词条系统
        playerLevel = 1;
        currentExp = 0;
        collectedExpTotal = 0;
        expGemCount = 0;
        for (let i = 0; i < EXP_GEMS_CAPACITY; i++) expGems[i] = null;
        selectedPerks = [];
        window.selectedPerks = selectedPerks;
        perkEffectData = {};
        isPerkSelecting = false;
        // 隐藏词条弹窗（如果开着）
        document.getElementById('perkSelectModal').classList.remove('show');

        activePathCount = getActivePathCount(level);
        playerGold = 200;
        playerExperience = 0;
        currentWave = 1;
        maxWavesPerLevel = 20;

        waveConfig = null; spawnQueue = []; spawnTimer = 0; spawnQueueIndex = 0;
        waveActive = false; waveCompleted = false; waveRewardTimer = 0;
        waveSpawnComplete = false; waveCooldownActive = false; waveCooldownTimer = 0;

        precomputedWaveConfigs = [];
        precomputeAllWaveConfigs(level);
        
        // 填充缓存的活跃路径
        const indices = getActivePathIndices(level);
        cachedActivePaths = indices.map(idx => pathPool[idx]);
        
        console.log('✅ Level', level, 'paths loaded:', cachedActivePaths.length, 'paths');
        console.log('✅ Wave configs precomputed:', precomputedWaveConfigs.length);
        
        calculatePathOccupiedGrids();

        // 水晶已移除，不再放置围墙

        enemyWarning.warning80Times = 0;
        enemyWarning.warning80Timer = 0;
        enemyWarning.warningText = '';
        enemyWarning.warningAlpha = 0;
        enemyWarning.warningDisplayTimer = 0;

        gameRunning = true;

        const towerContainer = document.getElementById('towerButtons');
        const trapContainer = document.getElementById('trapButtons');
        if (towerContainer) towerContainer.innerHTML = '';
        if (trapContainer) trapContainer.innerHTML = '';
        
        // 初始化兵种购买状态（农民默认已拥有）
        purchasedUnits = {};
        unitUpgradeLevels = {};
        unitSpawnTimers = {};
        for (const key in UNITS) {
            purchasedUnits[key] = UNITS[key].unlocked || false;
            unitUpgradeLevels[key] = 0;
            unitSpawnTimers[key] = 0;
        }
        generateUnitButtons();
        generateAssetButtons();
        showPlayerPreviewPanel();
        // 延迟一帧重新定位，确保布局完成
        requestAnimationFrame(() => showPlayerPreviewPanel());
        
        // 更新经验条
        gamePaused = false;
        updateExpBarDisplay();

        document.getElementById('gameWave').textContent = `波次: 1/${maxWavesPerLevel}`;
        document.getElementById('gameGold').textContent = `金币: ${playerGold}`;
        document.getElementById('gameHP').textContent = `敌人: 0/100`;
        document.getElementById('gameLevel').textContent = `关卡: ${gameState.currentLevel}`;
        document.getElementById('gameGuardians').textContent = (friendCount >= FRIENDS_CAPACITY) ? `护卫: ${friendCount}/已达上限` : `护卫: ${friendCount}`;
        document.getElementById('gameEnemies').textContent = `剩余敌人: ${enemyCount}`;
        document.getElementById('gameNextWave').textContent = `距离下一波刷新：0秒`;

        // 确保角色属性面板始终显示
        ensurePlayerPreviewVisible();
        
        setTimeout(() => { if (gameRunning) startNextWave(); }, 3000);
    };

    let towerCount = 0;

    // ================== 防御塔/陷阱升级系统 ==================
    // 获取建筑对应的资产数据
    function getAssetDataForTower(tower) {
        // 先从towers查找
        for (const key in gameAssets.towers) {
            if (gameAssets.towers[key].type === tower.type) return { category: 'tower', key: key, data: gameAssets.towers[key] };
        }
        // 再从traps查找
        for (const key in gameAssets.traps) {
            if (gameAssets.traps[key].type === tower.type) return { category: 'trap', key: key, data: gameAssets.traps[key] };
        }
        return null;
    }

    // 获取建筑升级描述
    function getUpgradeDescription(tower, assetInfo) {
        if (!assetInfo) return '';
        const data = assetInfo.data;
        const lvl = tower.upgradeLevel;
        if (tower.type === 'goldMine') return `金币/10秒 +${tower.upgradeLevel * 1 + 1} (升级每级+1)`;
        if (tower.type === 'arrowTower' || tower.type === 'flameTower' || tower.type === 'laserTower') return `伤害 +${data.upgradeDamagePerLvl || 0}, 血量 +${data.upgradeHpPerLvl || 0}`;
        if (tower.type === 'frostTower') return `减速 +${Math.round((data.upgradeSlowPerLvl || 0.05) * 100)}%, 血量 +${data.upgradeHpPerLvl || 0}`;
        if (tower.type === 'blockTrap') return `生命 +${data.upgradeHpPerLvl || 0}`;
        if (tower.type === 'iceSpikeTrap') return `减速 +${Math.round((data.upgradeSlowPerLvl || 0.08) * 100)}%, 范围 +${data.upgradeRangePerLvl || 0}`;
        if (tower.type === 'explosiveTrap') return `伤害 +${data.upgradeDamagePerLvl || 0}`;
        if (tower.type === 'bounceTrap') return `冷却 -2秒（最低2秒）`;
        return '';
    }

    const MAX_UPGRADE_LEVEL = 5; // 炮塔和陷阱最多升级5次

    function formatUpgradeStars(level) {
        const starCount = Math.max(0, Math.min(level, MAX_UPGRADE_LEVEL));
        return '⭐'.repeat(starCount);
    }

    // ★ 修复：升级函数 - 检查selectedTower是否存在，避免引用无效对象
    function upgradeSelectedTower() {
        if (!selectedTower) return;
        playUpgradeSound();
        const tower = selectedTower;
        const assetInfo = getAssetDataForTower(tower);
        if (!assetInfo) return;
        const data = assetInfo.data;
        
        const lvl = tower.upgradeLevel;
        
        // 检查是否已达最大升级等级
        if (lvl >= MAX_UPGRADE_LEVEL) {
            return;
        }
        
        const upgradeCost = data.cost;
        
        if (playerGold < upgradeCost) {
            addDamageText(tower.x, tower.y - tower.size/2 - 20, `金币不足！需要 ${upgradeCost}`, 'red', 1.5, 30);
            return;
        }
        
        // 扣除金币并应用升级效果
        playerGold -= upgradeCost;
        tower.upgradeLevel = lvl + 1;
        
        // 根据建筑类型应用不同升级效果
        if (tower.type === 'arrowTower' || tower.type === 'flameTower' || tower.type === 'laserTower') {
            const dmgGain = data.upgradeDamagePerLvl || 0;
            const hpGain = data.upgradeHpPerLvl || 0;
            tower.attackDamage += dmgGain;
            if (hpGain > 0) {
                tower.originalHealth += hpGain;
                tower.health += hpGain;
            }
            addDamageText(tower.x, tower.y - tower.size/2 - 20, `⬆ 伤害+${dmgGain} 血量+${hpGain}!`, '#00FF88', 2, 20);
        } else if (tower.type === 'frostTower') {
            tower.slowPercentage = Math.min(0.9, (tower.slowPercentage || 0.3) + (data.upgradeSlowPerLvl || 0.05));
            const hpGain = data.upgradeHpPerLvl || 0;
            if (hpGain > 0) {
                tower.originalHealth += hpGain;
                tower.health += hpGain;
            }
            addDamageText(tower.x, tower.y - tower.size/2 - 20, `⬆ 减速+${Math.round((data.upgradeSlowPerLvl || 0.05) * 100)}% 血量+${hpGain}!`, '#00FF88', 2, 20);
        } else if (tower.type === 'goldMine') {
            addDamageText(tower.x, tower.y - tower.size/2 - 20, `⬆ 金币/10秒+5!`, '#00FF88', 2, 20);
        } else if (tower.type === 'blockTrap') {
            const hpGain = data.upgradeHpPerLvl || 25;
            tower.originalHealth += hpGain;
            tower.health += hpGain;
            addDamageText(tower.x, tower.y - tower.size/2 - 20, `⬆ 生命+${hpGain}!`, '#00FF88', 2, 20);
        } else if (tower.type === 'iceSpikeTrap') {
            tower.slowFactor = Math.min(0.7, (tower.slowFactor || 0.3) + (data.upgradeSlowPerLvl || 0.08));
            addDamageText(tower.x, tower.y - tower.size/2 - 20, `⬆ 减速+${Math.round((data.upgradeSlowPerLvl || 0.08)*100)}%`, '#00FF88', 2, 20);
        } else if (tower.type === 'explosiveTrap') {
            tower.trapDamage += data.upgradeDamagePerLvl || 25;
            tower.explosionRadius += 0;
            addDamageText(tower.x, tower.y - tower.size/2 - 20, `⬆ 伤害+${data.upgradeDamagePerLvl||25}!`, '#00FF88', 2, 20);
        } else if (tower.type === 'bounceTrap') {
            const cdReduction = data.upgradeCooldownReduction || 2;
            tower.attackCooldown = Math.max(2, tower.attackCooldown - cdReduction);
            tower.attackSpeed = 1 / tower.attackCooldown;
            addDamageText(tower.x, tower.y - tower.size/2 - 20, `⬆ 冷却-${cdReduction}秒!`, '#00FF00', 2, 20);
        }
        
        document.getElementById('gameGold').textContent = `金币: ${playerGold}`;
        // 刷新塔面板
        showTowerPanels(tower);
        // 刷新按钮显示
        generateAssetButtons();
    }

    // 取消选中
    window.deselectTower = function() {
        selectedTower = null;
    };

    // 暴露升级函数到全局
    window.upgradeSelectedTower = upgradeSelectedTower;

    // ================== 生成左侧兵种面板按钮（含升级功能） ==================
    function generateUnitButtons() {
        const unitContainer = document.getElementById('unitButtons');
        if (!unitContainer) return;
        unitContainer.innerHTML = '';
        
        const title = document.createElement('h3');
        title.textContent = '— 护卫 —';
        unitContainer.appendChild(title);
        
        for (const key in CAMP_TYPES) {
            const campData = CAMP_TYPES[key];
            let campCountOfType = 0;
            for (let ci = 0; ci < campCount; ci++) {
                if (camps[ci] && camps[ci].unitType === key) campCountOfType++;
            }
            const maxAllowed = playerLevel >= 10 ? 3 : (playerLevel >= 5 ? 2 : 1);
            const canPlaceMore = campCountOfType < maxAllowed;
            
            const wrapper = document.createElement('div');
            wrapper.className = 'unit-btn-wrapper';
            const mainBtn = document.createElement('button');
            mainBtn.className = !canPlaceMore ? 'unit-btn unit-btn-bought' : 'unit-btn unit-btn-buy';
            if (!canPlaceMore) mainBtn.disabled = true;
            mainBtn.dataset.type = key;
            mainBtn.dataset.cost = campData.cost;
            const unitIcons = {
                farmer: '🌾', infantry: '⚔', archer: '🏹', knight: '🐴',
                mage: '🔮', swordsman: '⚔', paladin: '🛡', sniper: '🎯', gunner: '🔫'
            };
            const unitShortNames = {
                farmer: '农民', infantry: '步兵', archer: '弓箭手', knight: '骑士',
                mage: '法师', swordsman: '剑客', paladin: '圣骑士', sniper: '狙击手', gunner: '机枪兵'
            };
            const nameSpan = document.createElement('span'); nameSpan.className = 'unit-btn-name'; nameSpan.textContent = (unitShortNames[key] || campData.name);
            const statusSpan = document.createElement('span'); statusSpan.className = 'unit-btn-status';
            const infoDiv = document.createElement('div'); infoDiv.className = 'unit-btn-info';
            infoDiv.appendChild(nameSpan);
            statusSpan.textContent = `💰${campData.cost}金 (${campCountOfType}/${maxAllowed})`;
            statusSpan.style.color = canPlaceMore ? '#C8A96E' : '#4a6a4a';
            infoDiv.appendChild(statusSpan);
            // 图标占位（先放图标，与右侧面板布局一致）
            const iconDiv = document.createElement('div');
            iconDiv.className = 'unit-btn-icon';
            iconDiv.dataset.type = key;
            const campIconImg = (key === 'farmer') ? farmerIcon : campIcons[key];
            if (campIconImg && campIconImg.complete && campIconImg.naturalWidth > 0) {
                const imgEl = document.createElement('img');
                imgEl.src = campIconImg.src;
                const iconSize = (key === 'farmer') ? 95 : (key === 'infantry') ? 72 : (key === 'archer') ? 72 : (key === 'knight') ? 50 : (key === 'mage') ? 75 : (key === 'swordsman') ? 45 : (key === 'paladin') ? 100 : (key === 'sniper') ? 44 : (key === 'gunner') ? 40 : 56;
                imgEl.style.width = iconSize + 'px';
                imgEl.style.height = iconSize + 'px';
                imgEl.style.objectFit = 'contain';
                if (key === 'farmer') { imgEl.style.marginLeft = '10px'; imgEl.style.marginTop = '0px'; }
                if (key === 'infantry') { imgEl.style.marginTop = '-6px'; imgEl.style.marginLeft = '18px'; }
                if (key === 'archer') { imgEl.style.marginTop = '-16px'; imgEl.style.marginLeft = '16px'; }
                if (key === 'knight') { imgEl.style.marginTop = '-4px'; imgEl.style.marginLeft = '8px'; }
                if (key === 'mage') { imgEl.style.marginTop = '-8px'; imgEl.style.marginLeft = '8px'; }
                if (key === 'swordsman') { imgEl.style.marginTop = '-6px'; }
                if (key === 'paladin') { imgEl.style.marginTop = '-9px'; imgEl.style.marginLeft = '1px'; }
                if (key === 'sniper') { imgEl.style.marginLeft = '8px'; }
                if (key === 'gunner') { imgEl.style.marginTop = '-4px'; imgEl.style.marginLeft = '4px'; }
                iconDiv.appendChild(imgEl);
            } else {
                const iconText = document.createElement('span');
                iconText.className = 'icon-text';
                iconText.textContent = unitIcons ? (unitIcons[key]||'?') : '?';
                iconDiv.appendChild(iconText);
            }
            mainBtn.appendChild(iconDiv);
            mainBtn.appendChild(infoDiv);
            mainBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (!canPlaceMore) {
                    addDamageText(canvas.width/2, 100, `${campData.name}已达上限（最多${maxAllowed}个）`, '#FFD700', 1.5, 30);
                    return;
                }
                if (playerGold >= campData.cost) {
                    if (assetHideTimer) { clearTimeout(assetHideTimer); assetHideTimer = null; }
                    closeAssetPreviewPanel();
                    placingTower = true;
                    selectedAsset = {
                        name: campData.name, cost: campData.cost, size: campData.size, color: campData.color,
                        _isCamp: true, _unitType: key, spawnInterval: campData.spawnInterval
                    };
                    selectedTower = null;
                    const info = document.getElementById('selectedTowerInfo');
                    if (info) info.remove();
                    Array.from(document.getElementById('towerButtons').children).forEach(b => b.disabled = true);
                    Array.from(document.getElementById('trapButtons').children).forEach(b => b.disabled = true);
                    Array.from(unitContainer.querySelectorAll('button')).forEach(b => b.disabled = true);
                } else {
                    addDamageText(canvas.width/2, 100, '金币不足！', 'red', 1.5, 30);
                }
            });
            wrapper.appendChild(mainBtn);
            unitContainer.appendChild(wrapper);
        }
        updateUnitButtonsGoldState();
    }

    // 根据金币刷新兵种按钮的可购买状态
    function updateUnitButtonsGoldState() {
        const container = document.getElementById('unitContainer');
        if (!container) return;
        const btns = container.querySelectorAll('button.unit-btn-buy');
        for (let i = 0; i < btns.length; i++) {
            const btn = btns[i];
            const cost = parseInt(btn.dataset.cost) || 0;
            btn.disabled = playerGold < cost;
        }
    }

    function updateAssetButtonsGoldState() {
        const towerContainer = document.getElementById('towerButtons');
        const trapContainer = document.getElementById('trapButtons');
        const containers = [towerContainer, trapContainer];
        for (let ci = 0; ci < containers.length; ci++) {
            const container = containers[ci];
            if (!container) continue;
            const btns = container.querySelectorAll('button');
            for (let i = 0; i < btns.length; i++) {
                const btn = btns[i];
                const cost = parseInt(btn.dataset.cost) || 0;
                // 只修改金币不足导致的禁用，不覆盖放置中的禁用状态
                if (!btn._placedDisabled) btn.disabled = playerGold < cost;
            }
        }
    }

    function resetAssetButtonsPlacedDisabled() {
        ['towerButtons', 'trapButtons'].forEach(id => {
            const container = document.getElementById(id);
            if (!container) return;
            container.querySelectorAll('button').forEach(btn => {
                btn._placedDisabled = false;
                const cost = parseInt(btn.dataset.cost) || 0;
                btn.disabled = playerGold < cost;
            });
        });
    }

    let assetHideTimer = null;

    function initAssetPreviewPanelEvents() {
        const panel = document.getElementById('assetPreviewPanel');
        if (!panel || panel._initialized) return;
        panel._initialized = true;
        panel.addEventListener('mouseenter', () => {
            if (assetHideTimer) {
                clearTimeout(assetHideTimer);
                assetHideTimer = null;
            }
        });
        panel.addEventListener('mouseleave', () => {
            assetHideTimer = setTimeout(() => {
                closeAssetPreviewPanel();
            }, 250);
        });
    }

    window.closeAssetPreviewPanel = function() {
        const panel = document.getElementById('assetPreviewPanel');
        if (panel) panel.style.display = 'none';
    };

    function showAssetPreviewPanel(assetData, sourceEl) {
        const panel = document.getElementById('assetPreviewPanel');
        if (!panel || !assetData) return;

        initAssetPreviewPanelEvents();

        const nameEl = document.getElementById('assetPreviewName');
        if (nameEl) nameEl.textContent = assetData.name;

        const statsContainer = document.getElementById('assetPreviewStats');
        if (statsContainer) {
            statsContainer.innerHTML = '';
            const stats = [];
            const type = assetData.type || '';

            if (type === 'goldMine') {
                stats.push({ name: '血量', value: Math.round(assetData.health ?? 0) });
                stats.push({ name: '产出', value: `0.5/s` });
            } else if (assetData.attackRange !== undefined && assetData.attackSpeed !== undefined) {
                const attack = Math.round(assetData.attackDamage || 0);
                const hp = Math.round(assetData.health ?? 0);
                const range = Math.round(assetData.attackRange || 0);
                const targets = type === 'flameTower' ? '3' : '1';
                stats.push({ name: '攻击', value: attack });
                stats.push({ name: '血量', value: hp });
                if (type === 'frostTower') {
                    stats.push({ name: '减速效果', value: `${Math.round((assetData.slowPercentage || 0) * 100)}%` });
                }
                stats.push({ name: '射程', value: range });
                stats.push({ name: '攻击目标', value: targets });
            } else if (type.includes('Trap')) {
                if (type === 'blockTrap') {
                    stats.push({ name: '血量', value: Math.round(assetData.health ?? 0) });
                } else if (type === 'iceSpikeTrap') {
                    stats.push({ name: '减速效果', value: `${Math.round((assetData.slowFactor || 0) * 100)}%` });
                } else if (type === 'explosiveTrap') {
                    stats.push({ name: '爆炸伤害', value: Math.round(assetData.damage || 0) });
                    stats.push({ name: '爆炸范围', value: Math.round(assetData.explosionRadius || 0) });
                    stats.push({ name: '冷却时间', value: assetData.cooldown ? assetData.cooldown.toFixed(1) + 's' : '—' });
                } else if (type === 'bounceTrap') {
                    stats.push({ name: '作用目标', value: '1' });
                    stats.push({ name: '冷却时间', value: assetData.cooldown ? assetData.cooldown.toFixed(1) + 's' : '—' });
                    stats.push({ name: '弹射距离', value: Math.round(assetData.bounceDistance || 0) });
                } else {
                    stats.push({ name: '攻击', value: Math.round(assetData.damage || 0) });
                }
            }

            for (const s of stats) {
                const row = document.createElement('div');
                row.className = 'stat-row';
                row.innerHTML = `<span class="stat-name">${s.name}</span><span class="stat-value">${s.value}</span>`;
                statsContainer.appendChild(row);
            }
        }

        panel.style.display = 'block';

        if (sourceEl && sourceEl.getBoundingClientRect) {
            const rect = sourceEl.getBoundingClientRect();
            const panelWidth = panel.offsetWidth || 220;
            const panelHeight = panel.offsetHeight || 200;

            let left = rect.left - panelWidth - 10;
            if (left < 10) left = rect.right + 10;
            let top = rect.top;

            const upgradePanel = document.getElementById('upgradePanel');
            if (upgradePanel && upgradePanel.style.display === 'block') {
                const upRect = upgradePanel.getBoundingClientRect();
                const overlapX = left < upRect.right && (left + panelWidth) > upRect.left;
                if (overlapX) top = Math.max(top, upRect.bottom + 10);
            }

            top = Math.max(10, Math.min(top, window.innerHeight - panelHeight - 10));
            left = Math.max(10, Math.min(left, window.innerWidth - panelWidth - 10));

            panel.style.left = `${left}px`;
            panel.style.top = `${top}px`;
        }
    }

    function generateAssetButtons() {
        const towerContainer = document.getElementById('towerButtons');
        const trapContainer = document.getElementById('trapButtons');
        if (!towerContainer || !trapContainer) return;
        towerContainer.innerHTML = '';
        trapContainer.innerHTML = '';
        const towerIcons = {
            arrowTower: null, flameTower: '🔥', frostTower: '❄',
            laserTower: '⚡', goldMine: '💰'
        };
        const towerIconImages = {
            arrowTower: arrowTowerIcon,
            flameTower: flameTowerIcon,
            frostTower: frostTowerIcon,
            laserTower: laserTowerIcon,
            goldMine: goldMineIcon
        };
        const trapIcons = {
            blockTrap: '🪨', iceSpikeTrap: '❄', explosiveTrap: '💣', bounceTrap: '🔄'
        };
        const towerIconColors = {
            arrowTower: '#00FFFF', flameTower: '#FF4500', frostTower: '#ADD8E6',
            laserTower: '#FF00FF', goldMine: '#FFD700'
        };
        const towerIconSizes = {
            frostTower: 36,
            laserTower: 56
        };
        const towerIconMargins = {
            flameTower: -9,
            arrowTower: -7,
            laserTower: -2
        };
        const trapIconColors = {
            blockTrap: '#8B4513', iceSpikeTrap: '#B0E0E6', explosiveTrap: '#FF0000', bounceTrap: '#00FF00'
        };
        const trapIconImages = {
            iceSpikeTrap: iceSpikeTrapIcon,
            blockTrap: blockTrapIcon,
            explosiveTrap: explosiveTrapIcon,
            bounceTrap: bounceTrapIcon
        };
        const trapIconSizes = {
            blockTrap: 36,
            explosiveTrap: 100,
            bounceTrap: 100
        };
        const trapIconMargins = {
            explosiveTrap: 3,
            iceSpikeTrap: -2
        };
        const trapIconExtraStyles = {
            explosiveTrap: { marginLeft: '6px', marginTop: 5 }
        };
        for (const key in gameAssets.towers) {
            const towerData = gameAssets.towers[key];
            const button = createAssetButton(key, towerData, towerIcons[key] || '🏗', towerIconColors[key] || '#888', towerIconImages[key], towerIconSizes[key] || 48, towerIconMargins[key] || 0);
            button.addEventListener('click', () => {
                if (playerGold >= towerData.cost) {
                    closeAssetPreviewPanel();
                    placingTower = true;
                    selectedAsset = towerData;
                    selectedTower = null; // 取消当前选中
                    const info = document.getElementById('selectedTowerInfo');
                    if (info) info.remove();
                    Array.from(towerContainer.children).forEach(btn => { btn._placedDisabled = true; btn.disabled = true; });
                    Array.from(trapContainer.children).forEach(btn => { btn._placedDisabled = true; btn.disabled = true; });
                } else {
                    addDamageText(canvas.width/2, 100, '金币不足！', 'red', 1.5, 30);
                }
            });
            towerContainer.appendChild(button);
        }
        for (const key in gameAssets.traps) {
            const trapData = gameAssets.traps[key];
            const button = createAssetButton(key, trapData, trapIcons[key] || '🪤', trapIconColors[key] || '#888', trapIconImages[key], trapIconSizes[key], trapIconMargins[key] ?? 0);
            // 应用图标额外样式
            const extraStyle = trapIconExtraStyles?.[key];
            if (extraStyle) {
                const imgEl = button.querySelector('.asset-icon img');
                if (imgEl) {
                    if (extraStyle.marginLeft) imgEl.style.marginLeft = extraStyle.marginLeft;
                    if (extraStyle.marginTop !== undefined) imgEl.style.marginTop = extraStyle.marginTop + 'px';
                }
            }
            button.addEventListener('click', () => {
                if (playerGold >= trapData.cost) {
                    closeAssetPreviewPanel();
                    placingTower = true;
                    selectedAsset = trapData;
                    selectedTower = null; // 取消当前选中
                    const info = document.getElementById('selectedTowerInfo');
                    if (info) info.remove();
                    Array.from(towerContainer.children).forEach(btn => { btn._placedDisabled = true; btn.disabled = true; });
                    Array.from(trapContainer.children).forEach(btn => { btn._placedDisabled = true; btn.disabled = true; });
                } else {
                    addDamageText(canvas.width/2, 100, '金币不足！', 'red', 1.5, 30);
                }
            });
            trapContainer.appendChild(button);
        }
    }

    function createAssetButton(key, data, iconEmoji, iconColor, iconImg, iconSize, iconMarginTop) {
        const button = document.createElement('button');
        button.dataset.assetKey = key;
        button.dataset.cost = data.cost;
        if (playerGold < data.cost) button.disabled = true;
        // 图标
        const iconDiv = document.createElement('div');
        iconDiv.className = 'asset-icon';
        if (iconImg && iconImg.complete && iconImg.naturalWidth > 0) {
            const sz = iconSize || 48;
            const imgEl = document.createElement('img');
            imgEl.src = iconImg.src;
            imgEl.style.width = sz + 'px';
            imgEl.style.height = sz + 'px';
            imgEl.style.objectFit = 'contain';
            imgEl.style.marginTop = (iconMarginTop !== undefined ? iconMarginTop : -5) + 'px';
            iconDiv.appendChild(imgEl);
        } else {
            const iconText = document.createElement('span');
            iconText.className = 'icon-text';
            iconText.textContent = iconEmoji;
            iconDiv.appendChild(iconText);
        }
        button.appendChild(iconDiv);
        // 信息
        const infoDiv = document.createElement('div');
        infoDiv.className = 'asset-btn-info';
        const nameSpan = document.createElement('span');
        nameSpan.className = 'asset-btn-name';
        // 精简名称（去掉可能的前缀emoji/空格）
        nameSpan.textContent = data.name;
        infoDiv.appendChild(nameSpan);
        const costSpan = document.createElement('span');
        costSpan.className = 'asset-btn-cost';
        costSpan.textContent = `💰${data.cost}金`;
        infoDiv.appendChild(costSpan);
        button.appendChild(infoDiv);
        return button;
    }


    // 水晶位置：画布底部中间（对齐 40px 网格）
    function getCrystalPos() {
        return gridCenter(CRYSTAL_COL, CRYSTAL_ROW);
    }
    const CRYSTAL_X = gridCenter(CRYSTAL_COL, 0).x;
    const CRYSTAL_Y = gridCenter(CRYSTAL_COL, CRYSTAL_ROW).y;

    // ================== 环绕路径系统 ==================
    // 所有敌人从地图中心出发 → 向下到屏幕底部 → 随机选择左/右方向沿边缘绕圈
    const pathPool = [
        // 0: 顺时针（底部 → 右 → 上 → 左 → 底部）
        { waypoints: (function() {
            const cx = canvas.width / 2, cy = canvas.height / 2;
            const topY = gridCenter(0, 1).y, bottomY = gridCenter(0, ROWS-2).y;
            return [
                { x: cx, y: cy },
                { x: cx, y: bottomY },
                { x: canvas.width - 20, y: bottomY },
                { x: canvas.width - 20, y: topY },
                { x: 20, y: topY },
                { x: 20, y: bottomY },
                { x: cx, y: bottomY },
            ];
        })(), color:'rgba(255,100,100,0.3)', name:'顺时针', tier:1 },
        // 1: 逆时针（底部 → 左 → 上 → 右 → 底部）
        { waypoints: (function() {
            const cx = canvas.width / 2, cy = canvas.height / 2;
            const topY = gridCenter(0, 1).y, bottomY = gridCenter(0, ROWS-2).y;
            return [
                { x: cx, y: cy },
                { x: cx, y: bottomY },
                { x: 20, y: bottomY },
                { x: 20, y: topY },
                { x: canvas.width - 20, y: topY },
                { x: canvas.width - 20, y: bottomY },
                { x: cx, y: bottomY },
            ];
        })(), color:'rgba(100,200,255,0.3)', name:'逆时针', tier:1 },
        // 2: 上行顺时针→（↑顶→⌝右下→⌟左下→⌞左上→⌈cx底）
        { waypoints: (function() {
            const cx = canvas.width / 2, cy = canvas.height / 2;
            const topY = gridCenter(0, 1).y, bottomY = gridCenter(0, ROWS-2).y;
            const rightX = gridCenter(COLS-2, 0).x, leftX = gridCenter(1, 0).x;
            return [
                { x: cx, y: cy },
                { x: cx, y: topY },
                { x: rightX, y: topY },
                { x: rightX, y: bottomY },
                { x: leftX, y: bottomY },
                { x: leftX, y: topY },
                { x: cx, y: topY },
                { x: cx, y: bottomY },
            ];
        })(), color:'rgba(255,100,100,0.3)', name:'上行顺时针→', tier:2 },
        // 3: 下行顺时针→（↓底→⌝右上→⌞左上→⌟左下→cx底）
        { waypoints: (function() {
            const cx = canvas.width / 2, cy = canvas.height / 2;
            const topY = gridCenter(0, 1).y, bottomY = gridCenter(0, ROWS-2).y;
            const rightX = gridCenter(COLS-2, 0).x, leftX = gridCenter(1, 0).x;
            return [
                { x: cx, y: cy },
                { x: cx, y: bottomY },
                { x: rightX, y: bottomY },
                { x: rightX, y: topY },
                { x: leftX, y: topY },
                { x: leftX, y: bottomY },
                { x: cx, y: bottomY },
            ];
        })(), color:'rgba(100,200,255,0.3)', name:'下行顺时针→', tier:2 },
        // 4: 上行逆时针→（↑顶→⌝左上→⌟左下→⌞右下→cx底）
        { waypoints: (function() {
            const cx = canvas.width / 2, cy = canvas.height / 2;
            const topY = gridCenter(0, 1).y, bottomY = gridCenter(0, ROWS-2).y;
            const rightX = gridCenter(COLS-2, 0).x, leftX = gridCenter(1, 0).x;
            return [
                { x: cx, y: cy },
                { x: cx, y: topY },
                { x: leftX, y: topY },
                { x: leftX, y: bottomY },
                { x: rightX, y: bottomY },
                { x: rightX, y: topY },
                { x: cx, y: topY },
                { x: cx, y: bottomY },
            ];
        })(), color:'rgba(255,200,50,0.3)', name:'上行逆时针→', tier:2 },
        // 5: 下行逆时针→（↓底→⌝左下→⌞左上→⌟右上→cx底）
        { waypoints: (function() {
            const cx = canvas.width / 2, cy = canvas.height / 2;
            const topY = gridCenter(0, 1).y, bottomY = gridCenter(0, ROWS-2).y;
            const rightX = gridCenter(COLS-2, 0).x, leftX = gridCenter(1, 0).x;
            return [
                { x: cx, y: cy },
                { x: cx, y: bottomY },
                { x: leftX, y: bottomY },
                { x: leftX, y: topY },
                { x: rightX, y: topY },
                { x: rightX, y: bottomY },
                { x: cx, y: bottomY },
            ];
        })(), color:'rgba(100,255,150,0.3)', name:'下行逆时针→', tier:2 },
                // 6: 上行→（↑顶→右→底→左→顶→右→中→左→底→出口）
        { waypoints: (function() {
            const cx = canvas.width / 2, cy = canvas.height / 2;
            const topY = gridCenter(0, 1).y, bottomY = gridCenter(0, ROWS-2).y;
            const rightX = gridCenter(COLS-2, 0).x, leftX = gridCenter(1, 0).x;
            return [
                { x: cx, y: cy },
                { x: cx, y: topY },
                { x: rightX, y: topY },
                { x: rightX, y: bottomY },
                { x: leftX, y: bottomY },
                { x: leftX, y: topY },
                { x: rightX, y: topY },
                { x: rightX, y: cy },
                { x: leftX, y: cy },
                { x: leftX, y: bottomY },
                { x: cx, y: bottomY },
            ];
        })(), color:'rgba(200,30,30,0.3)', name:'上行→', tier:3 },
        // 7: 下行→（↓底→右→顶→左→底→右→中→左→顶→中顶→出口）
        { waypoints: (function() {
            const cx = canvas.width / 2, cy = canvas.height / 2;
            const topY = gridCenter(0, 1).y, bottomY = gridCenter(0, ROWS-2).y;
            const rightX = gridCenter(COLS-2, 0).x, leftX = gridCenter(1, 0).x;
            return [
                { x: cx, y: cy },
                { x: cx, y: bottomY },
                { x: rightX, y: bottomY },
                { x: rightX, y: topY },
                { x: leftX, y: topY },
                { x: leftX, y: bottomY },
                { x: rightX, y: bottomY },
                { x: rightX, y: cy },
                { x: leftX, y: cy },
                { x: leftX, y: topY },
                { x: cx, y: topY },
                { x: cx, y: bottomY },
            ];
        })(), color:'rgba(180,50,50,0.3)', name:'下行→', tier:3 },
        // 8: 左行→（左→上→右→中→左→底→右→顶→中→出口）
        { waypoints: (function() {
            const cx = canvas.width / 2, cy = canvas.height / 2;
            const topY = gridCenter(0, 1).y, bottomY = gridCenter(0, ROWS-2).y;
            const rightX = gridCenter(COLS-2, 0).x, leftX = gridCenter(1, 0).x;
            return [
                { x: cx, y: cy },
                { x: leftX, y: cy },
                { x: leftX, y: topY },
                { x: rightX, y: topY },
                { x: rightX, y: cy },
                { x: leftX, y: cy },
                { x: leftX, y: bottomY },
                { x: rightX, y: bottomY },
                { x: rightX, y: topY },
                { x: cx, y: topY },
                { x: cx, y: bottomY },
            ];
        })(), color:'rgba(220,60,20,0.3)', name:'左行→', tier:3 },
        // 9: 右行→（右→上→左→中→右→底→左→顶→中→出口）
        { waypoints: (function() {
            const cx = canvas.width / 2, cy = canvas.height / 2;
            const topY = gridCenter(0, 1).y, bottomY = gridCenter(0, ROWS-2).y;
            const rightX = gridCenter(COLS-2, 0).x, leftX = gridCenter(1, 0).x;
            return [
                { x: cx, y: cy },
                { x: rightX, y: cy },
                { x: rightX, y: topY },
                { x: leftX, y: topY },
                { x: leftX, y: cy },
                { x: rightX, y: cy },
                { x: rightX, y: bottomY },
                { x: leftX, y: bottomY },
                { x: leftX, y: topY },
                { x: cx, y: topY },
                { x: cx, y: bottomY },
            ];
        })(), color:'rgba(180,40,40,0.3)', name:'右行→', tier:3 },
    ];
    const LEVEL_PATH_MAP = {
        1:  { indices: [0, 1], desc:'2条 顺时针+逆时针' },
        2:  { indices: [2, 3, 4, 5], desc:'4条 上行+下行 顺时针+逆时针 全四边 6拐点' },
        3:  { indices: [6, 7, 8, 9], desc:'4条 上行+下行+左行+右行 ★★★全对称全四边' },
        4:  { indices: [0, 1], desc:'2条 顺时针+逆时针' },
        5:  { indices: [0, 1], desc:'2条 顺时针+逆时针' },
    };

    // ================== 构造函数 ==================
    function Enemy(x, y, width, height, color, baseSpeed, health, attackDamage, attackSpeed) {
        this.x = x; this.y = y; this.width = width; this.height = height; this.color = color;
        this.baseSpeed = baseSpeed; this.currentSpeed = baseSpeed; this.health = health; this.originalHealth = health;
        this.isBlocked = false; this.targetTrap = null; this.attackDamage = attackDamage||5;
        this.attackSpeed = attackSpeed||1; this.attackCooldown = 1/(attackSpeed||1); this.attackTimer = 0;
        this.slowedByIceSpike = false; this.iceSpikeSlowFactor = 0;
        this.bleeding = false; this.bleedDps = 0; this.bleedTimer = 0; this.bleedAccumulatedDamage = 0; this.lastBleedTextTimer = 0;
        this.frozenByFrostTower = false; this.frostTowerSlowFactor = 0; this.frozenTimer = 0;
        this.isArmored = false; this.isBoss = false; this.goldReward = 5; this.expReward = 1;
        this.bounceCooldown = 0; this.path = null; this.pathIndex = 0; this.alive = true;
    }

    function Bullet(x, y, target, radius, color, speed, damage, slowDuration, slowPercentage, isLaser) {
        this.x = x; this.y = y; this.target = target; this.radius = radius; this.color = color;
        this.speed = speed; this.damage = damage; this.slowDuration = slowDuration||0;
        this.slowPercentage = slowPercentage||0; this.isLaser = isLaser||false; this.dx = 0; this.dy = 0;
    }

    function Tower(type, x, y, size, color, attackRange, attackDamage, attackSpeed, bulletSpeed, health, trapDamage, slowFactor, bounceDistance, maxUses, explosionRadius) {
        this.type = type; this.x = x; this.y = y; this.size = size; this.color = color;
        this.width = size; this.height = size; this.alive = true;
        this.attackRange = attackRange; this.attackDamage = attackDamage; this.attackSpeed = attackSpeed;
        this.attackCooldown = attackSpeed > 0 ? 1/attackSpeed : 0; this.attackTimer = 0;
        this.bulletSpeed = bulletSpeed; this.health = health; this.originalHealth = health;
        this.trapDamage = trapDamage||0; this.slowFactor = slowFactor||0;
        this.bounceDistance = bounceDistance||0; this.maxUses = maxUses||null;
        this.remainingUses = maxUses||null; this.explosionRadius = explosionRadius||0;
        this.trapTriggerRange = size; // 陷阱触发范围，初始等于个头
        this.upgradeLevel = 0; // 升级等级，0=初始
        this.attackAnimTimer = 0; // 攻击动画计时器
        this.attackFrameTimer = 0; // 攻击帧动画独立计时器
        this.bounceAnimTimer = 0; // 传送器弹射动画计时器
        this.attackDelayTimer = 0; // 攻击延迟计时器（用于动画先播放再伤害）
        this.pendingTarget = null; // 延迟攻击的目标
        
        // 存储基础范围值（用于双色范围显示）
        this.baseAttackRange = attackRange;
        this.baseExplosionRadius = explosionRadius || 0;
        
        // 冰霜女初始减速值
        if (type === 'frostTower') {
            this.slowPercentage = 0.3;
        }
        this.baseTrapTriggerRange = size;
        
            // 金矿专属属性：每10秒自动生产金币
            if (type === 'goldMine') {
                this.productionTimer = 10;    // 初始10秒计时
                this.productionInterval = 10;  // 生产间隔10秒
                this.goldPerProduction = 5;    // 每次生产5金币
            }
    }

    function Attack(x, y, width, height, color, duration) {
        this.x = x; this.y = y; this.width = width; this.height = height;
        this.color = color; this.duration = duration; this.timer = 0;
    }

    function DamageText(x, y, value, color, duration, speed) {
        this.x = x; this.y = y; this.value = value; this.color = color;
        this.duration = duration||1; this.timer = 0; this.speed = speed||50;
    }

    function checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width && rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height && rect1.y + rect1.height > rect2.y;
    }

    function isWaveComplete() {
        return spawnQueueIndex >= spawnQueue.length && enemyCount === 0 && waveActive;
    }

    // ================== 事件监听 ==================
    window.addEventListener('keydown', (e) => { if (keys.hasOwnProperty(e.key)) keys[e.key] = true; });
    window.addEventListener('keyup', (e) => { if (keys.hasOwnProperty(e.key)) keys[e.key] = false; });

    canvas.addEventListener('click', (e) => {
        if (!gameRunning || !gameState.gameStarted) return;
        
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const mouseX = (e.clientX - rect.left) * scaleX;
        const mouseY = (e.clientY - rect.top) * scaleY;
        
        // 清理不一致的放置状态
        if (placingTower && !selectedAsset) {
            placingTower = false;
            resetAssetButtonsPlacedDisabled();
        }
        if (selectedAsset && !placingTower) selectedAsset = null;

        if (placingTower && selectedAsset) {
            const grid = getGridFromPosition(mouseX, mouseY);
            const snappedPos = getPositionFromGrid(grid.col, grid.row);
            const isTrap = selectedAsset.type && String(selectedAsset.type).includes('Trap');
            
            // 营地放置
            if (selectedAsset._isCamp) {
                let placed = false;
                if (campCount >= CAMPS_CAPACITY) {
                    addDamageText(mouseX, mouseY-20, '提高角色等级可增加上限！', 'red', 1.5, 30);
                } else if (!canPlaceCampOnGrid(grid.col, grid.row)) {
                    addDamageText(mouseX, mouseY-20, '❌ 此处不可放置（建筑重叠）！', 'red', 1.5, 30);
                } else {
                    // 检查水晶等级限制
                    let typeCount = 0;
                    for (let ci = 0; ci < campCount; ci++) {
                        if (camps[ci] && camps[ci].unitType === selectedAsset._unitType) typeCount++;
                    }
                    const maxAllowed = playerLevel >= 10 ? 3 : (playerLevel >= 5 ? 2 : 1);
                    if (typeCount >= maxAllowed) {
                        addDamageText(mouseX, mouseY-20, `已达上限！最多${maxAllowed}个`, '#FFD700', 1.5, 30);
                    } else if (playerGold >= selectedAsset.cost) {
                        playerGold -= selectedAsset.cost;
                        const camp = {
                            x: snappedPos.x, y: snappedPos.y,
                            size: selectedAsset.size, unitType: selectedAsset._unitType,
                            upgradeLevel: 0, alive: true, spawnTimer: 0,
                            spawnInterval: selectedAsset.spawnInterval || 10,
                            markerX: null, markerY: null,
                            guardRadius: 80
                        };
                        camps[campCount++] = camp;
                        addDamageText(snappedPos.x, snappedPos.y-20, '✓ 营地已放置！', 'lime', 1, 30);
                        // 放置后直接生成 1 个，后续定时补充到 3 个上限
                        for (let si = 0; si < 1; si++) spawnFriendlyForCamp(camp, si);
                        purchasedUnits[selectedAsset._unitType] = true;
                        placed = true;
                    } else {
                        addDamageText(mouseX, mouseY-20, '金币不足！', 'red', 1.5, 30);
                    }
                }
                selectedAsset = null;
                generateUnitButtons();
                // 恢复按钮
                resetAssetButtonsPlacedDisabled();
                return;
            }
            
            if (!canPlaceOnGrid(grid.col, grid.row, isTrap)) {
                addDamageText(mouseX, mouseY-20, '❌ 此处不可放置！', 'red', 1.5, 30);
                placingTower = false;
                selectedAsset = null;
                resetAssetButtonsPlacedDisabled();
                return;
            }
            if (playerGold >= selectedAsset.cost) {
                if (selectedAsset.type.includes('Tower') || selectedAsset.type === 'goldMine') {
                    towers.push(new Tower(selectedAsset.type, snappedPos.x, snappedPos.y, selectedAsset.size, selectedAsset.color, selectedAsset.attackRange, selectedAsset.attackDamage, selectedAsset.attackSpeed, selectedAsset.bulletSpeed, selectedAsset.health));
                } else if (isTrap) {
                    const attackSpeed = selectedAsset.cooldown ? 1/selectedAsset.cooldown : 0;
                    towers.push(new Tower(selectedAsset.type, snappedPos.x, snappedPos.y, selectedAsset.size, selectedAsset.color, 0, 0, attackSpeed, 0, selectedAsset.health, selectedAsset.damage||0, selectedAsset.slowFactor||0, selectedAsset.bounceDistance||0, selectedAsset.maxUses||null, selectedAsset.explosionRadius||0));
                }
                playerGold -= selectedAsset.cost;
                addDamageText(snappedPos.x, snappedPos.y-20, '✓ 放置成功！', 'lime', 1, 30);
            } else {
                addDamageText(mouseX, mouseY-20, '金币不足！', 'red', 1.5, 30);
            }
            placingTower = false;
            selectedAsset = null;
            resetAssetButtonsPlacedDisabled();
            return;
        }

        // 点击玩家角色（属性弹窗始终显示，只关闭其他面板）
        const playerHalfW = player.width / 2;
        const playerHalfH = player.height / 2;
        if (mouseX >= player.x - playerHalfW && mouseX <= player.x + playerHalfW &&
            mouseY >= player.y - playerHalfH && mouseY <= player.y + playerHalfH) {
            closeEnemyPreviewPanel();
            closeUpgradePanel();
            if (window.closeAssetPreviewPanel) window.closeAssetPreviewPanel();
            if (window.closeUnitUpgradePanel) window.closeUnitUpgradePanel();
            return;
        }

        // 水晶已移除，不再处理点击

        // 点击选择敌人（预览属性）
        let foundEnemy = null;
        for (let i = enemyCount - 1; i >= 0; i--) {
            const en = enemies[i];
            if (!en || !en.alive) continue;
            const halfW = en.width / 2;
            const halfH = en.height / 2;
            if (mouseX >= en.x - halfW && mouseX <= en.x + halfW &&
                mouseY >= en.y - halfH && mouseY <= en.y + halfH) {
                foundEnemy = en;
                break;
            }
        }
        if (foundEnemy) {
            const enemyPanel = document.getElementById('enemyPreviewPanel');
            if (selectedEnemy === foundEnemy && enemyPanel && enemyPanel.style.display === 'block') {
                closeEnemyPreviewPanel();
            } else {
                selectedEnemy = foundEnemy;
                showEnemyPreviewPanel(foundEnemy);
                closePlayerPreviewPanel();
                closeUpgradePanel();
                if (window.closeAssetPreviewPanel) window.closeAssetPreviewPanel();
                if (window.closeUnitUpgradePanel) window.closeUnitUpgradePanel();
            }
            return;
        }
        
        // 点击选择建筑
        let foundTower = null;
        for (let i = towers.length - 1; i >= 0; i--) {
            const t = towers[i];
            const hitSize = Math.max(t.size, 50);
            const halfSize = hitSize / 2;
            if (mouseX >= t.x - halfSize && mouseX <= t.x + halfSize &&
                mouseY >= t.y - halfSize && mouseY <= t.y + halfSize) {
                foundTower = t;
                break;
            }
        }
        
        // 如果正在设置营地标记，点击地图设置标记点
        if (settingCampMarker && campBeingMarked) {
            campBeingMarked.markerX = mouseX;
            campBeingMarked.markerY = mouseY;
            // 立即通知该营地的所有护卫前往标记位置（强制服从，忽略敌人）
            for (let fi = 0; fi < friendCount; fi++) {
                const f = friendlies[fi];
                if (f && f.alive && f.campX === campBeingMarked.x && f.campY === campBeingMarked.y) {
                    f.campMarkerX = mouseX;
                    f.campMarkerY = mouseY;
                    f.targetEnemy = null;
                    f.fighting = false;
                    f.state = 'movingToMarker';
                    f.obeyMarker = true;
                    f.patrolTimer = 0;
                }
            }
            settingCampMarker = false;
            campBeingMarked = null;
            closeUpgradePanel();
            closeEnemyPreviewPanel();
            document.getElementById('gameCanvas').style.cursor = 'default';
            addDamageText(mouseX, mouseY-20, '集合点', '#FF4444', 1.5, 40);
            return;
        }

        // 点击选择营地
        let foundCamp = null;
        for (let i = 0; i < campCount; i++) {
            const c = camps[i];
            if (!c || !c.alive) continue;
            const halfSize = c.size / 2;
            if (mouseX >= c.x - halfSize && mouseX <= c.x + halfSize &&
                mouseY >= c.y - halfSize && mouseY <= c.y + halfSize) {
                foundCamp = c;
                break;
            }
        }
        
        if (foundCamp) {
            if (selectedCamp === foundCamp) {
                closeCampPanels();
            } else {
                closeUpgradePanel(); // 关闭塔升级面板
                closeEnemyPreviewPanel();
                closePlayerPreviewPanel();
                selectedCamp = foundCamp;
                showCampPanels(foundCamp);
            }
            return;
        }

        if (foundTower) {
            closeCampPanels();
            closePlayerPreviewPanel();
            // 不要 closeEnemyPreviewPanel — showTowerPanels 会复用这个面板
            if (selectedTower === foundTower) {
                closeTowerPanels();
                closeEnemyPreviewPanel();
            } else {
                selectedTower = foundTower;
                showTowerPanels(foundTower);
                if (window.closeUnitUpgradePanel) window.closeUnitUpgradePanel();
            }
        } else {
            closeCampPanels();
            closeUpgradePanel();
            closeEnemyPreviewPanel();
            if (window.closeUnitUpgradePanel) window.closeUnitUpgradePanel(); // 点击空白处同时关闭兵种面板
        }
    });

    // 点击屏幕任意地方关闭升级面板 (除了面板内部和侧边栏按钮)
    window.addEventListener('click', (e) => {
        const unitPanel = document.getElementById('unitUpgradePanel');
        const assetPreviewPanel = document.getElementById('assetPreviewPanel');
        const enemyPreviewPanel = document.getElementById('enemyPreviewPanel');
        const playerPreviewPanel = document.getElementById('playerPreviewPanel');
        const towerPanel = document.getElementById('upgradePanel');
        const campUpBtn = document.getElementById('campUpgradeBtn');
        const campMarkerBtn = document.getElementById('campMarkerBtn');
        const towerUpBtn = document.getElementById('towerUpgradeBtn');
        const towerSellBtn = document.getElementById('towerSellBtn');
        const sidebarLeft = document.getElementById('unitContainer');
        const sidebarRight = document.getElementById('uiContainer');
        
        // 如果点击的目标不在面板内，且不在侧边栏内，则尝试关闭
        if (unitPanel && !unitPanel.contains(e.target) && 
            assetPreviewPanel && !assetPreviewPanel.contains(e.target) &&
            enemyPreviewPanel && !enemyPreviewPanel.contains(e.target) &&
            playerPreviewPanel && !playerPreviewPanel.contains(e.target) &&
            towerPanel && !towerPanel.contains(e.target) &&
            (!campUpBtn || !campUpBtn.contains(e.target)) &&
            (!campMarkerBtn || !campMarkerBtn.contains(e.target)) &&
            (!towerUpBtn || !towerUpBtn.contains(e.target)) &&
            (!towerSellBtn || !towerSellBtn.contains(e.target)) &&
            sidebarLeft && !sidebarLeft.contains(e.target) &&
            sidebarRight && !sidebarRight.contains(e.target) &&
            e.target !== canvas) { // canvas 的点击由它自己的 listener 处理
            
            closeCampPanels();
            closeTowerPanels();
            if (window.closeUnitUpgradePanel) window.closeUnitUpgradePanel();
            if (window.closeAssetPreviewPanel) window.closeAssetPreviewPanel();
            if (window.closeEnemyPreviewPanel) window.closeEnemyPreviewPanel();
            if (window.closeUpgradePanel) window.closeUpgradePanel();
        }
    });

    // ================== 浮动按钮点击事件委托 ==================
    document.addEventListener('click', function(e) {
        // 塔升级按钮
        const towerUpBtn = document.getElementById('towerUpgradeBtn');
        if (towerUpBtn && towerUpBtn.contains(e.target) && !towerUpBtn.disabled) {
            upgradeSelectedTower();
            return;
        }
        // 塔出售按钮
        const towerSellBtn = document.getElementById('towerSellBtn');
        if (towerSellBtn && towerSellBtn.contains(e.target) && !towerSellBtn.disabled) {
            sellSelectedTower();
            return;
        }
        // 营地升星按钮
        const campUpBtn = document.getElementById('campUpgradeBtn');
        if (campUpBtn && campUpBtn.contains(e.target) && !campUpBtn.disabled) {
            if (selectedCamp) upgradeCamp(selectedCamp);
            return;
        }
        // 营地标记按钮
        const campMarkerBtn = document.getElementById('campMarkerBtn');
        if (campMarkerBtn && campMarkerBtn.contains(e.target) && !campMarkerBtn.disabled) {
            if (selectedCamp) {
                settingCampMarker = true;
                campBeingMarked = selectedCamp;
                const cUpBtn = document.getElementById('campUpgradeBtn');
                if (cUpBtn) cUpBtn.style.display = 'none';
                campMarkerBtn.style.color = '#44DD44';
                campMarkerBtn.textContent = '✅集合';
                // 根据护卫类型获取颜色
                const unitCfg = UNITS[selectedCamp.unitType];
                const cursorColor = unitCfg ? unitCfg.color : '#00FF88';
                const svgCursor = "url('data:image/svg+xml," + encodeURIComponent(
                    '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">' +
                        '<circle cx="16" cy="16" r="14" fill="none" stroke="' + cursorColor + '" stroke-width="1.2" opacity="0.5"/>' +
                        '<circle cx="16" cy="16" r="9" fill="none" stroke="' + cursorColor + '" stroke-width="0.8" opacity="0.35"/>' +
                        '<circle cx="16" cy="16" r="4" fill="none" stroke="' + cursorColor + '" stroke-width="0.6" opacity="0.2"/>' +
                        '<line x1="16" y1="16" x2="30" y2="16" stroke="' + cursorColor + '" stroke-width="1.5"/>' +
                        '<polygon points="16,16 28,12 30,16 28,20" fill="' + cursorColor + '" opacity="0.7"/>' +
                    '</svg>'
                ) + "') 16 16, crosshair";
                document.getElementById('gameCanvas').style.cursor = svgCursor;
                addDamageText(selectedCamp.x, selectedCamp.y - selectedCamp.size/2 - 10, '点击地图集合', '#FF4444', 1.2, 30);
            }
            return;
        }
    });

    // ================== 升级面板逻辑 ==================
    
    // ★ 修复：showUpgradePanel - 使用upgradeCost本地变量，不依赖DOM span元素，
    // 避免满级时textContent="已达最高等级"破坏span，导致切换建筑升级按钮失效
    // ================== 左侧面板定位辅助 ==================
    function positionLeftPanelBelowUnitButtons(panel) {
        if (!panel) return;
        const unitContainer = document.getElementById('unitContainer');
        if (unitContainer && unitContainer.style.display !== 'none') {
            const rect = unitContainer.getBoundingClientRect();
            panel.style.top = (rect.top + rect.height + 6) + 'px';
        } else {
            panel.style.top = '10px';
        }
    }

    // ================== 营地面板（左侧属性 + 浮动按钮） ==================
    function showCampPanels(camp) {
        if (!camp || !camp.alive) return;
        const campTypeData = CAMP_TYPES[camp.unitType];
        const unitConfig = UNITS[camp.unitType];
        if (!campTypeData || !unitConfig) return;
        const lvl = camp.upgradeLevel || 0;
        const isMaxLevel = lvl >= MAX_UPGRADE_LEVEL;
        const campName = campTypeData.name;

        // ---- 左侧面板显示属性 ----
        const leftPanel = document.getElementById('enemyPreviewPanel');
        if (leftPanel) {
            const titleEl = document.getElementById('enemyPreviewName');
            if (titleEl) titleEl.textContent = campName + ' ' + formatUpgradeStars(lvl);

            const statsContainer = document.getElementById('enemyPreviewStats');
            if (statsContainer) {
                statsContainer.innerHTML = '';

                const atk = unitConfig.attackDamage + lvl * unitConfig.upgradeAtkPerLvl;
                const hp = unitConfig.baseHealth + lvl * unitConfig.upgradeHPPerLvl;
                let rangeVal = unitConfig.attackRange;
                if (unitConfig.upgradeRangePerLvl) rangeVal = unitConfig.attackRange + lvl * unitConfig.upgradeRangePerLvl;
                const targetCount = (camp.unitType === 'archer') ? (1 + lvl) :
                    (camp.unitType === 'mage') ? Math.min(5, 1 + lvl) :
                    (camp.unitType === 'swordsman') ? 3 : 1;

                const stats = [
                    { name: '攻击', value: atk, upgrade: !isMaxLevel ? unitConfig.upgradeAtkPerLvl : null },
                    { name: '血量', value: hp, upgrade: !isMaxLevel ? unitConfig.upgradeHPPerLvl : null },
                    { name: '射程', value: rangeVal, upgrade: (!isMaxLevel && unitConfig.upgradeRangePerLvl) ? unitConfig.upgradeRangePerLvl : null },
                    { name: '攻击目标', value: targetCount, upgrade: (!isMaxLevel && (camp.unitType === 'archer' || camp.unitType === 'mage')) ? 1 : null },
                ];

                for (const s of stats) {
                    const row = document.createElement('p');
                    row.style.cssText = 'display:flex;justify-content:space-between;margin:4px 0;font-size:14px;';
                    let leftText = s.name;
                    let rightText = String(s.value);
                    if (s.upgrade !== undefined && s.upgrade !== null) {
                        row.innerHTML = `<span>${leftText}</span><span>${rightText} <span style="color:#00FF88;font-weight:bold">→ +${s.upgrade}</span></span>`;
                    } else {
                        row.innerHTML = `<span>${leftText}</span><span>${rightText}</span>`;
                    }
                    statsContainer.appendChild(row);
                }
            }
            leftPanel.style.display = 'block';
            positionLeftPanelBelowUnitButtons(leftPanel);
        }

        // ---- 营地浮动按钮（升星在上面，标记在下面） ----
        const canvasRect = canvas.getBoundingClientRect();
        const scaleX = canvasRect.width / canvas.width;
        const scaleY = canvasRect.height / canvas.height;
        const btnX = canvasRect.left + camp.x * scaleX;
        const campSize = camp.size * scaleY;

        // 升星按钮（营地上面）
        const upBtn = document.getElementById('campUpgradeBtn');
        if (upBtn) {
            upBtn.style.left = (btnX - 20) + 'px';
            upBtn.style.display = 'block';
            if (isMaxLevel) {
                upBtn.innerHTML = '已满级';
                upBtn.disabled = true;
                upBtn.style.top = (canvasRect.top + (camp.y - camp.size/2) * scaleY - 20) + 'px';
            } else {
                const cost = (campTypeData.cost || 0) + lvl * 20;
                const padded = String(cost).padStart(3, '0');
                upBtn.innerHTML = `<span class="up-arrow">⬆</span><span class="cost-text">(${padded}G)</span>`;
                upBtn.disabled = false;
                upBtn.dataset.cost = cost;
                upBtn.style.top = (canvasRect.top + (camp.y - camp.size/2) * scaleY - 30) + 'px';
            }
        }

        // 设置标记按钮（营地下面）
        const markerBtn = document.getElementById('campMarkerBtn');
        if (markerBtn) {
            markerBtn.style.left = (btnX - 20) + 'px';
            markerBtn.style.top = (canvasRect.top + (camp.y + camp.size/2) * scaleY + 4) + 'px';
            markerBtn.style.display = 'block';
            if (settingCampMarker && campBeingMarked === camp) {
                markerBtn.style.color = '#44DD44';
                markerBtn.textContent = '✅集合';
            } else {
                markerBtn.style.color = '';
                markerBtn.textContent = '🚩集合';
            }
            markerBtn.disabled = false;
        }
    }

    function closeCampPanels() {
        const upBtn = document.getElementById('campUpgradeBtn');
        if (upBtn) upBtn.style.display = 'none';
        const markerBtn = document.getElementById('campMarkerBtn');
        if (markerBtn) markerBtn.style.display = 'none';
        selectedCamp = null;
    }

    window.closeCampPanels = closeCampPanels;

    function upgradeCamp(camp) {
        playUpgradeSound();
        if (!camp) return;
        const lvl = camp.upgradeLevel || 0;
        if (lvl >= MAX_UPGRADE_LEVEL) return;
        const cost = (CAMP_TYPES[camp.unitType]?.cost || 0) + lvl * 20;
        if (playerGold < cost) {
            addDamageText(camp.x, camp.y - camp.size/2 - 10, '金币不足！', 'red', 1.5, 30);
            return;
        }
        playerGold -= cost;
        camp.upgradeLevel = lvl + 1;
        camp.spawnInterval = Math.max(4, camp.spawnInterval - 0.5);
        const unitConfig = UNITS[camp.unitType];
        const atkGain = unitConfig?.upgradeAtkPerLvl || 0;
        const hpGain = unitConfig?.upgradeHPPerLvl || 0;
        addDamageText(camp.x, camp.y - camp.size/2 - 10, `⬆ 攻击+${atkGain} 血量+${hpGain}!`, '#00FF88', 2, 20);
        document.getElementById('gameGold').textContent = `金币: ${playerGold}`;
        showCampPanels(camp);
        generateUnitButtons();
    }

    function showTowerPanels(tower) {
        if (!tower || !tower.type) return;
        const assetInfo = getAssetDataForTower(tower);
        if (!assetInfo) return;
        const data = assetInfo.data;
        const lvl = tower.upgradeLevel;
        const isMax = lvl >= MAX_UPGRADE_LEVEL;

        // ---- 左侧面板显示属性 ----
        const leftPanel = document.getElementById('enemyPreviewPanel');
        if (leftPanel) {
            const titleEl = document.getElementById('enemyPreviewName');
            if (titleEl) titleEl.textContent = data.name + (lvl > 0 ? ` ${'⭐'.repeat(lvl)}` : '');

            const statsContainer = document.getElementById('enemyPreviewStats');
            if (statsContainer) {
                statsContainer.innerHTML = '';

                const stats = [];
                const isTrap = tower.type.includes('Trap');
                const isTowerAsset = assetInfo.category === 'tower';
                const hasValidHealth = tower.health !== null && !isNaN(tower.health);
                const shouldShowHealth = tower.type === 'blockTrap' || isTowerAsset;

                if (isTowerAsset) {
                    if (tower.type === 'goldMine') {
                        if (hasValidHealth && shouldShowHealth) {
                            stats.push({ name: '血量', value: Math.round(tower.health), max: Math.round(tower.originalHealth), upgrade: isMax ? null : data.upgradeHpPerLvl });
                        }
                        const currentProd = (5 + lvl * 5) / 10;
                        stats.push({ name: '产出', value: `${currentProd.toFixed(1)}/s`, upgrade: isMax ? null : '0.5/s' });
                    } else {
                        if (tower.attackDamage > 0 && !isTrap) {
                            stats.push({ name: '攻击', value: Math.round(tower.attackDamage), upgrade: isMax ? null : data.upgradeDamagePerLvl });
                        }
                        if (hasValidHealth && shouldShowHealth) {
                            stats.push({ name: '血量', value: Math.round(tower.health), max: Math.round(tower.originalHealth), upgrade: isMax ? null : data.upgradeHpPerLvl });
                        }
                        if (tower.type === 'frostTower') {
                            stats.push({ name: '减速', value: `${Math.round((tower.slowPercentage || 0) * 100)}%`, upgrade: isMax || !data.upgradeSlowPerLvl ? null : `${Math.round(data.upgradeSlowPerLvl * 100)}%` });
                        }
                        if (tower.attackRange > 0) {
                            stats.push({ name: '射程', value: Math.round(tower.attackRange) });
                        }
                        stats.push({ name: '攻击目标', value: tower.type === 'flameTower' ? 3 : 1 });
                    }
                } else {
                    if (hasValidHealth && shouldShowHealth) {
                        stats.push({ name: '血量', value: Math.round(tower.health), max: Math.round(tower.originalHealth), upgrade: isMax ? null : data.upgradeHpPerLvl });
                    }
                }

                // 陷阱特定属性
                if (tower.type === 'iceSpikeTrap') {
                    stats.push({ name: '减速', value: `${Math.round(tower.slowFactor * 100)}%`, upgrade: isMax || !data.upgradeSlowPerLvl ? null : `${Math.round(data.upgradeSlowPerLvl * 100)}%` });
                    const currentBleed = 1 + (tower.upgradeLevel || 0) * 1;
                    stats.push({ name: '流血', value: `${currentBleed}/s`, upgrade: isMax ? null : '1/s' });
                } else if (tower.type === 'explosiveTrap') {
                    stats.push({ name: '爆炸伤害', value: Math.round(tower.trapDamage), upgrade: isMax ? null : data.upgradeDamagePerLvl });
                    stats.push({ name: '爆炸范围', value: tower.explosionRadius, upgrade: isMax ? null : data.upgradeRangePerLvl });
                    const cd = tower.attackSpeed > 0 ? (1/tower.attackSpeed).toFixed(1) : 0;
                    stats.push({ name: '冷却', value: `${cd}s` });
                } else if (tower.type === 'bounceTrap') {
                    stats.push({ name: '弹射距离', value: tower.bounceDistance });
                    stats.push({ name: '冷却', value: `${tower.attackCooldown.toFixed(1)}s`, upgrade: isMax ? null : `-${data.upgradeCooldownReduction || 2}s` });
                }

                for (const s of stats) {
                    const row = document.createElement('p');
                    row.style.cssText = 'display:flex;justify-content:space-between;margin:4px 0;font-size:14px;';
                    let leftText = s.name;
                    let rightText = String(s.value);
                    if (s.max !== undefined) rightText += ` / ${s.max}`;
                    if (s.upgrade !== undefined && s.upgrade !== null) {
                        const upStr = String(s.upgrade);
                        const upgradeText = upStr.startsWith('-') ? upStr : `+${upStr}`;
                        row.innerHTML = `<span>${leftText}</span><span>${rightText} <span style="color:#00FF88;font-weight:bold">→ ${upgradeText}</span></span>`;
                    } else {
                        row.innerHTML = `<span style="color:${s.color||'inherit'}">${leftText}</span><span>${rightText}</span>`;
                    }
                    statsContainer.appendChild(row);
                }
            }
            leftPanel.style.display = 'block';
            positionLeftPanelBelowUnitButtons(leftPanel);
        }

        // ---- 塔旁边浮动按钮 ----
        const canvasRect = canvas.getBoundingClientRect();
        const scaleX = canvasRect.width / canvas.width;
        const scaleY = canvasRect.height / canvas.height;
        const btnX = canvasRect.left + tower.x * scaleX;
        const halfH = (tower.size || 24) * scaleY / 2;

        const upBtn = document.getElementById('towerUpgradeBtn');
        if (upBtn) {
            if (isMax) {
                upBtn.textContent = '已满级';
                upBtn.disabled = true;
                upBtn.dataset.action = '';
            } else {
                const cost = data.cost;
                const paddedCost = String(cost).padStart(3, '0');
                upBtn.innerHTML = `<span class="tower-up-icon">⬆</span><span class="tower-cost-text">(${paddedCost}G)</span>`;
                upBtn.disabled = playerGold < cost;
                upBtn.dataset.cost = cost;
            }
            upBtn.style.left = (btnX - 20) + 'px';
            upBtn.style.top = (canvasRect.top + (tower.y - tower.size/2) * scaleY - (isMax ? 28 : 38)) + 'px';
            upBtn.style.display = 'block';
        }

        const sellBtn = document.getElementById('towerSellBtn');
        if (sellBtn) {
            const totalCost = data.cost + (tower.upgradeLevel || 0) * data.cost;
            const sellValue = Math.floor(totalCost / 2);
            const paddedSell = String(sellValue).padStart(3, '0');
            sellBtn.innerHTML = `(${paddedSell}G)`;
            sellBtn.disabled = false;
            sellBtn.style.left = (btnX - 20) + 'px';
            sellBtn.style.top = (canvasRect.top + (tower.y + tower.size/2) * scaleY + 12) + 'px';
            sellBtn.style.display = 'block';
        }
    }

    function closeTowerPanels() {
        const upBtn = document.getElementById('towerUpgradeBtn');
        if (upBtn) upBtn.style.display = 'none';
        const sellBtn = document.getElementById('towerSellBtn');
        if (sellBtn) sellBtn.style.display = 'none';
        selectedTower = null;
    }

    window.closeTowerPanels = closeTowerPanels;

    function showUpgradePanel(tower) {
        // 兼容旧调用 - 转发到新实现
        showTowerPanels(tower);
    }

    window.closeUpgradePanel = function() {
        const panel = document.getElementById('upgradePanel');
        if (panel) {
            panel.classList.remove('upgrade-panel-left');
            panel.style.display = 'none';
        }
        // 恢复出售按钮原始状态
        const sellBtn = document.getElementById('sellBtn');
        if (sellBtn && sellBtn._origHTML) {
            sellBtn.innerHTML = sellBtn._origHTML;
            sellBtn.onclick = sellBtn._origOnClick;
            sellBtn._origHTML = null;
            sellBtn._origOnClick = null;
        }
        selectedTower = null;
        settingCampMarker = false;
        document.getElementById('gameCanvas').style.cursor = 'default';
        campBeingMarked = null;
        closeCampPanels();
        closeTowerPanels();
    };

    function showEnemyPreviewPanel(enemy) {
        const panel = document.getElementById('enemyPreviewPanel');
        if (!panel || !enemy) return;
        const typeConfig = ENEMY_CONFIG[enemy.type];
        const name = (typeConfig && typeConfig.name) ? typeConfig.name : (enemy.type || '未知敌人');
        const titleEl = document.getElementById('enemyPreviewName');
        if (titleEl) titleEl.textContent = name;

        const statsContainer = document.getElementById('enemyPreviewStats');
        if (!statsContainer) return;
        statsContainer.innerHTML = '';

        const attackInterval = enemy.attackCooldown > 0 ? `${enemy.attackCooldown.toFixed(1)}s` : '—';
        const rangeText = enemy.attackRange > 0 ? Math.round(enemy.attackRange) : '近战';
        const speedText = (enemy.currentSpeed !== undefined && enemy.currentSpeed !== enemy.baseSpeed)
            ? `${Math.round(enemy.currentSpeed)}/${Math.round(enemy.baseSpeed)}`
            : `${Math.round(enemy.baseSpeed)}`;

        const stats = [
            { name: '血量', value: Math.ceil(enemy.health), max: Math.ceil(enemy.originalHealth || enemy.health) },
            { name: '攻击', value: Math.round(enemy.attackDamage) },
            { name: '射程', value: rangeText },
            { name: '金币', value: Math.round(enemy.goldReward || 0) }
        ];

        stats.forEach(s => {
            const row = document.createElement('div');
            row.className = 'stat-row';
            const valueStr = s.max ? `${s.value}/${s.max}` : s.value;
            row.innerHTML = `<span class="stat-name">${s.name}</span><span class="stat-value">${valueStr}</span>`;
            statsContainer.appendChild(row);
        });

        // 定位到护卫面板正下方
        const unitContainer = document.getElementById('unitContainer');
        if (unitContainer) {
            const rect = unitContainer.getBoundingClientRect();
            panel.style.top = (rect.bottom + 2) + 'px';
            panel.style.left = rect.left + 'px';
        }
        panel.style.display = 'block';
    }
    // ================== 角色属性预览弹窗（右下角） ==================
    function showPlayerPreviewPanel() {
        const panel = document.getElementById('playerPreviewPanel');
        if (!panel || !player) return;

        const titleEl = document.getElementById('playerPreviewName');
        if (titleEl) titleEl.textContent = '我的角色';

        // 填充实时数据
        refreshPlayerPreviewStats();

        // 定位到右侧建筑面板正下方
        const uiContainer = document.getElementById('uiContainer');
        if (uiContainer) {
            const rect = uiContainer.getBoundingClientRect();
            if (rect.bottom > 0 && rect.left > 0) {
                panel.style.top = (rect.bottom + 2) + 'px';
                panel.style.left = rect.left + 'px';
            }
        }
        panel.style.display = 'block';
    }
    
    // 刷新玩家属性面板数据（不重建DOM，只更新数值）
    function refreshPlayerPreviewStats() {
        const statsContainer = document.getElementById('playerPreviewStats');
        if (!statsContainer) return;
        
        const panel = document.getElementById('playerPreviewPanel');
        if (!panel) return;
        
        const atk = player.bulletDamage || 10;
        const critChance = Math.round((perkEffectData.playerCritChance || 0) * 100);
        
        // 获取所有现有行
        const rows = statsContainer.querySelectorAll('.stat-row');
        let rowIndex = 0;
        
        // 只显示 等级、攻击、射程、暴击率
        const baseStats = [
            { name: '等级', value: `Lv.${playerLevel}` },
            { name: '攻击', value: Math.round(atk) },
            { name: '射程', value: Math.round(player.attackRange || 150) },
            { name: '暴击率', value: `${critChance}%` },
        ];
        
        // 更新或创建行
        baseStats.forEach((s, idx) => {
            if (idx < rows.length) {
                const nameSpan = rows[idx].querySelector('.stat-name');
                const valueSpan = rows[idx].querySelector('.stat-value');
                if (nameSpan) nameSpan.textContent = s.name;
                if (valueSpan) valueSpan.textContent = s.value;
            } else {
                const row = document.createElement('div');
                row.className = 'stat-row';
                row.innerHTML = `<span class="stat-name">${s.name}</span><span class="stat-value">${s.value}</span>`;
                statsContainer.appendChild(row);
            }
        });
        
        // 移除多余的行
        while (statsContainer.children.length > baseStats.length) {
            statsContainer.removeChild(statsContainer.lastChild);
        }
    }

    window.closePlayerPreviewPanel = function() {
        // 角色属性面板始终显示，无法关闭
    };

    // 确保游戏开始时角色属性面板显示
    function ensurePlayerPreviewVisible() {
        const panel = document.getElementById('playerPreviewPanel');
        if (panel) panel.style.display = 'block';
    }

    window.closeEnemyPreviewPanel = function() {
        const panel = document.getElementById('enemyPreviewPanel');
        if (panel) panel.style.display = 'none';
        selectedEnemy = null;
        closeCampPanels();
        closeTowerPanels();
    };

    function sellSelectedTower() {
        if (!selectedTower) return;
        playSellSound();
        const tower = selectedTower;
        const assetInfo = getAssetDataForTower(tower);
        if (!assetInfo) return;
        
        const totalCost = assetInfo.data.cost + (tower.upgradeLevel || 0) * assetInfo.data.cost;
        const sellValue = Math.floor(totalCost / 2);
        playerGold += sellValue;
        
        // 在出售陷阱前，解除所有被此陷阱阻挡的敌人
        if (tower.type === 'blockTrap' || tower.health !== undefined) {
            for (let i = 0; i < enemyCount; i++) {
                const enemy = enemies[i];
                if (enemy && enemy.alive && enemy.targetTrap === tower) {
                    enemy.isBlocked = false;
                    enemy.targetTrap = null;
                }
            }
        }
        
        const index = towers.indexOf(tower);
        if (index !== -1) {
            towers.splice(index, 1);
            addDamageText(tower.x, tower.y, `💰 +${sellValue}`, '#FFD700', 1.5, 40);
        }
        
        closeTowerPanels();
        closeEnemyPreviewPanel();
        document.getElementById('gameGold').textContent = `金币: ${playerGold}`;
    }

    // ================== 兵种升级面板逻辑 ==================

    // 初始化面板鼠标事件（只执行一次）
    function initUnitPanelEvents() {
        const panel = document.getElementById('unitUpgradePanel');
        if (!panel || panel._initialized) return;
        panel._initialized = true;
        
        panel.addEventListener('mouseenter', () => {
            if (unitHideTimer) {
                clearTimeout(unitHideTimer);
                unitHideTimer = null;
            }
        });
        panel.addEventListener('mouseleave', () => {
            unitHideTimer = setTimeout(() => {
                closeUnitUpgradePanel();
            }, 300);
        });
    }

    function showUnitUpgradePanel(unitKey) {
        const panel = document.getElementById('unitUpgradePanel');
        const unit = UNITS[unitKey];
        if (!unit || !panel) return;

        // 初始化面板鼠标事件（仅首次调用时绑定）
        initUnitPanelEvents();

        if (window.closeUpgradePanel) window.closeUpgradePanel(); // 关闭右侧建筑面板
        selectedUnitKey = unitKey;
        const isUnlocked = purchasedUnits[unitKey];
        const upgradeLvl = unitUpgradeLevels[unitKey] || 0;
        
        document.getElementById('unitUpgradeName').textContent = unit.name;
        document.getElementById('unitUpgradeLevel').textContent = isUnlocked ? `等级: LV.${upgradeLvl}` : '未解锁';
        
        const statsContainer = document.getElementById('unitUpgradeStats');
        statsContainer.innerHTML = '';
        
        const currentAtk = unit.attackDamage + upgradeLvl * unit.upgradeAtkPerLvl;
        const currentHP = unit.baseHealth + upgradeLvl * unit.upgradeHPPerLvl;
        let currentRange = unit.attackRange;
        if (unitKey === 'archer' && unit.upgradeRangePerLvl) {
            currentRange += upgradeLvl * unit.upgradeRangePerLvl;
        }
        const maxTargets = (unitKey === 'archer') ? (1 + upgradeLvl) :
            (unitKey === 'mage') ? Math.min(5, 1 + upgradeLvl) :
            (unitKey === 'swordsman') ? 3 : 1;
        let targetText = String(maxTargets);

        const stats = [
            { name: '攻击', value: currentAtk, upgrade: isUnlocked ? unit.upgradeAtkPerLvl : undefined },
            { name: '血量', value: currentHP, upgrade: isUnlocked ? unit.upgradeHPPerLvl : undefined },
            { name: '射程', value: currentRange, upgrade: (isUnlocked && unitKey === 'archer' && unit.upgradeRangePerLvl) ? unit.upgradeRangePerLvl : undefined },
            { name: '攻击目标', value: targetText, upgrade: (isUnlocked && (unitKey === 'archer' || unitKey === 'mage') && upgradeLvl < MAX_UPGRADE_LEVEL) ? 1 : undefined },
        ];

        stats.forEach(s => {
            const row = document.createElement('div');
            row.className = 'stat-row';
            let upgradeStr = (s.upgrade && upgradeLvl < MAX_UPGRADE_LEVEL) ? `<span class="stat-upgrade" style="color: #00FF88; font-weight: bold; margin-left: 5px;">➔ +${s.upgrade}</span>` : '';
            row.innerHTML = `<span class="stat-name">${s.name}</span><span class="stat-value">${s.value}${upgradeStr}</span>`;
            statsContainer.appendChild(row);
        });

        const upgradeBtn = document.getElementById('unitUpgradeBtn');
        const descEl = document.getElementById('unitUpgradeDesc');

        if (!isUnlocked) {
            upgradeBtn.disabled = playerGold < unit.cost;
            upgradeBtn.innerHTML = `💰 购买 (${unit.cost} 金币)`;
            upgradeBtn.onclick = purchaseSelectedUnit;
            if (descEl) descEl.textContent = `当前金币: ${playerGold}`;
        } else {
            const upgradeCost = unit.upgradeCost * (upgradeLvl + 1);
            if (upgradeLvl >= MAX_UPGRADE_LEVEL) {
                upgradeBtn.disabled = true;
                upgradeBtn.textContent = '已达最高等级';
            } else {
                upgradeBtn.disabled = playerGold < upgradeCost;
                upgradeBtn.innerHTML = `🔼 升级 (${upgradeCost} 金币)`;
            }
            upgradeBtn.onclick = upgradeSelectedUnit;
            if (descEl) descEl.textContent = `当前金币: ${playerGold}`;
        }

        panel.style.display = 'block';
        positionLeftPanelBelowUnitButtons(panel);
    }

    window.closeUnitUpgradePanel = function() {
        const panel = document.getElementById('unitUpgradePanel');
        if (panel) panel.style.display = 'none';
        selectedUnitKey = null;
    };

    function upgradeSelectedUnit() {
        if (!selectedUnitKey) return;
        playUpgradeSound();
        const key = selectedUnitKey;
        const unit = UNITS[key];
        if (!purchasedUnits[key]) return;
        const upgradeLvl = unitUpgradeLevels[key] || 0;
        const upgradeCost = unit.upgradeCost * (upgradeLvl + 1);

        if (playerGold >= upgradeCost && upgradeLvl < MAX_UPGRADE_LEVEL) {
            playerGold -= upgradeCost;
            unitUpgradeLevels[key] = upgradeLvl + 1;
            
            // 视觉反馈
            addDamageText(canvas.width/4, 100, `⬆ ${unit.name} 升级 Lv.${upgradeLvl+2}!`, '#00BFFF', 2, 40);
            
            // 为所有活跃的同类兵种应用升级属性
            for (let i = 0; i < friendCount; i++) {
                const f = friendlies[i];
                if (f && f.alive && f.type === key) {
                    f.maxHealth += unit.upgradeHPPerLvl || 10;
                    f.health += unit.upgradeHPPerLvl || 10;
                    f.attackDamage += unit.upgradeAtkPerLvl || 5;
                    if (key === 'archer' && unit.upgradeRangePerLvl) {
                        f.attackRange += unit.upgradeRangePerLvl;
                    }
                }
            }

            document.getElementById('gameGold').textContent = `金币: ${playerGold}`;
            generateUnitButtons();
            showUnitUpgradePanel(key); // 刷新面板
        }
    }

    function spawnFriendlyUnitByKey(unitKey) {
        if (friendCount >= FRIENDS_CAPACITY) return false;
        const unitConfig = UNITS[unitKey];
        if (!unitConfig) return false;
        if (!cachedActivePaths || cachedActivePaths.length === 0) {
            const indices = getActivePathIndices(gameState.currentLevel);
            cachedActivePaths = indices.map(idx => pathPool[idx]);
        }
        if (!cachedActivePaths || cachedActivePaths.length === 0) return false;

        function computePatrolHoldPoint(path, patrolIndex, slot) {
            if (!path || patrolIndex === undefined || patrolIndex === null) return null;
            if (patrolIndex < 0 || patrolIndex >= path.length) return null;
            const a = path[patrolIndex];
            const b = path[Math.min(patrolIndex + 1, path.length - 1)];
            if (!a || !b) return null;
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const len = Math.hypot(dx, dy);
            if (len < 1) return null;
            const unitX = dx / len;
            const unitY = dy / len;
            const base = 4 + ((slot || 0) % 6) * 3;
            const jitter = (Math.random() - 0.5) * 2;
            const dist = Math.min(len - 2, Math.max(0, base + jitter));
            return { x: a.x + unitX * dist, y: a.y + unitY * dist };
        }

        const upgradeLvl = unitUpgradeLevels[unitKey] || 0;
        const atk = unitConfig.attackDamage + upgradeLvl * unitConfig.upgradeAtkPerLvl;
        const hp = unitConfig.baseHealth + upgradeLvl * unitConfig.upgradeHPPerLvl;
        let range = unitConfig.attackRange;
        if (unitKey === 'archer' && unitConfig.upgradeRangePerLvl) {
            range += upgradeLvl * unitConfig.upgradeRangePerLvl;
        }

        const pathIdx = Math.floor(Math.random() * cachedActivePaths.length);
        const selectedPath = cachedActivePaths[pathIdx];

        const spawnSlot = friendCount;
        const spawnAngle = (spawnSlot * 2.399963229728653) % (Math.PI * 2);
        const spawnRadius = 4 + (spawnSlot % 3) * 3;
        const spawnX = canvas.width / 2 + Math.cos(spawnAngle) * spawnRadius;
        const spawnY = canvas.height / 2 + Math.sin(spawnAngle) * spawnRadius;
        const clampedX = Math.max(unitConfig.width / 2, Math.min(canvas.width - unitConfig.width / 2, spawnX));
        const clampedY = Math.max(unitConfig.height / 2, Math.min(canvas.height - unitConfig.height / 2, spawnY));

        const friend = {
            x: clampedX,
            y: clampedY,
            width: unitConfig.width,
            height: unitConfig.height,
            color: unitConfig.color,
            baseSpeed: unitConfig.baseSpeed,
            currentSpeed: unitConfig.baseSpeed,
            health: hp,
            maxHealth: hp,
            attackDamage: atk,
            attackCooldown: 1 / unitConfig.attackSpeed,
            attackTimer: 0,
            attackRange: range,
            type: unitKey,
            unitName: unitConfig.name,
            alive: true,
            path: selectedPath.waypoints,
            pathIndex: selectedPath.waypoints.length - 1,
            targetEnemy: null,
            fighting: false,
            state: 'moving',
            patrolIndex: 0,
            patrolOffset: { x: 0, y: 0 },
            patrolTimer: 0,
            facingX: 1, lastX: spawnX,
            animFrame: 0, animTimer: 0,
            obeyMarker: false,
            centerGuard: gameState.currentLevel === 4 || gameState.currentLevel === 5
        };
        friend.patrolIndex = getSpawnEntranceWaypointIndex(friend.path);
        setFriendPatrolCenter(friend);
        const hold = computePatrolHoldPoint(friend.path, friend.patrolIndex, friendCount);
        if (hold) {
            friend.patrolHoldX = hold.x;
            friend.patrolHoldY = hold.y;
        }
        friendlies[friendCount++] = friend;
        return true;
    }

    function getRecruitBonusForUnit(unitKey) {
        if (unitKey === 'infantry') return perkEffectData.infantryCount || 0;
        if (unitKey === 'archer') return perkEffectData.archerCount || 0;
        if (unitKey === 'knight') return perkEffectData.knightCount || 0;
        if (unitKey === 'mage') return perkEffectData.mageCount || 0;
        return 0;
    }

    // 通用：友方对敌人造成伤害
    function applyFriendDamage(friend, targetEnemy) {
        targetEnemy.health -= friend.attackDamage;
        addDamageText(targetEnemy.x, targetEnemy.y - 10, friend.attackDamage, '#FFFFFF');
        playFriendlyHitSound();
        if (targetEnemy.health <= 0) {
            targetEnemy.alive = false; targetEnemy.dying = true; targetEnemy.deathTimer = ENEMY_DEATH_DURATION;
            const reward = Math.floor(targetEnemy.goldReward / 2) || 1;
            playerGold += reward;
            addGoldText(reward);
            const halfExp = Math.max(1, Math.floor(targetEnemy.expReward / 2));
            playerExperience += halfExp;
            dropExpGemsForKill(targetEnemy, targetEnemy.x, targetEnemy.y, halfExp);
        }
    }

    // 从营地召唤一个护卫
    // spawnIndex 可选：传入 0/1/2 等让初始生成位置均匀分散，防止重叠
    function spawnFriendlyForCamp(camp, spawnIndex) {
        if (friendCount >= FRIENDS_CAPACITY) return false;
        const unitConfig = UNITS[camp.unitType];
        if (!unitConfig) return false;
        const upgradeLvl = camp.upgradeLevel || 0;
        const atk = unitConfig.attackDamage + upgradeLvl * unitConfig.upgradeAtkPerLvl;
        const hp = unitConfig.baseHealth + upgradeLvl * unitConfig.upgradeHPPerLvl;
        const range = unitConfig.attackRange + (camp.unitType === 'archer' && unitConfig.upgradeRangePerLvl ? upgradeLvl * unitConfig.upgradeRangePerLvl : 0);
        // 有 spawnIndex 时均匀分布在圆周上，否则随机分散
        let offsetAngle, offsetDist;
        if (spawnIndex !== undefined) {
            offsetAngle = (spawnIndex / 3) * Math.PI * 2;
            offsetDist = 28;
        } else {
            offsetAngle = Math.random() * Math.PI * 2;
            offsetDist = 10 + Math.random() * 20;
        }
        const spawnX = Math.max(unitConfig.width/2, Math.min(canvas.width - unitConfig.width/2, camp.x + Math.cos(offsetAngle) * offsetDist));
        const spawnY = Math.max(unitConfig.height/2, Math.min(canvas.height - unitConfig.height/2, camp.y + Math.sin(offsetAngle) * offsetDist));
        const friend = {
            x: spawnX, y: spawnY,
            width: unitConfig.width, height: unitConfig.height,
            color: unitConfig.color,
            baseSpeed: unitConfig.baseSpeed, currentSpeed: unitConfig.baseSpeed,
            health: hp, maxHealth: hp,
            attackDamage: atk, attackCooldown: 1 / unitConfig.attackSpeed, attackTimer: 0,
            attackRange: range, type: unitConfig.type, unitName: unitConfig.name,
            alive: true, targetEnemy: null, fighting: false, state: 'patrolling',
            facingX: 1, lastX: spawnX,
            animFrame: 0, animTimer: 0, attackAnimTimer: 0, damageDelay: 0, delayedTarget: null, obeyMarker: camp.markerX !== null && camp.markerY !== null,
            // 营地引用
            campX: camp.x, campY: camp.y,
            campMarkerX: camp.markerX, campMarkerY: camp.markerY,
            guardRadius: 60,
            patrolTimer: 0, patrolOffset: { x: 0, y: 0 },
            campLevel: upgradeLvl
        };
        friendlies[friendCount++] = friend;
        return true;
    }

    function purchaseSelectedUnit() {
        if (!selectedUnitKey) return;
        const key = selectedUnitKey;
        const unit = UNITS[key];
        if (!unit || purchasedUnits[key]) return;
        if (playerGold < unit.cost) {
            addDamageText(canvas.width/2, 100, `金币不足！需要 ${unit.cost} 金币`, 'red', 1.5, 30);
            showUnitUpgradePanel(key);
            return;
        }
        purchasedUnits[key] = true;
        unitSpawnTimers[key] = 0;
        playerGold -= unit.cost;
        addDamageText(canvas.width/2, 100, `✅ 解锁 ${unit.name}！`, '#FFD700', 2, 40);
        const spawnTimes = 1 + getRecruitBonusForUnit(key);
        let spawned = 0;
        for (let i = 0; i < spawnTimes && friendCount < FRIENDS_CAPACITY; i++) {
            if (spawnFriendlyUnitByKey(key)) spawned++;
        }
        if (spawned > 0) addDamageText(canvas.width/2, canvas.height/2 - 30, `🛡️ 召唤 ${unit.name}`, '#00FF88', 1.2, 30);
        document.getElementById('gameGold').textContent = `金币: ${playerGold}`;
        const hudGuardians = document.getElementById('gameGuardians');
        if (hudGuardians) hudGuardians.textContent = (friendCount >= FRIENDS_CAPACITY) ? `护卫: ${friendCount}/已达上限` : `护卫: ${friendCount}`;
        generateUnitButtons();
        showUnitUpgradePanel(key);
    }

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        mouse.x = (e.clientX - rect.left) * scaleX;
        mouse.y = (e.clientY - rect.top) * scaleY;
    });

    // ================== HUD 更新（更新右上角信息） ==================
    function updateHUD() {
        const hudHP = document.getElementById('gameHP');
        const hudGold = document.getElementById('gameGold');
        const hudGuardians = document.getElementById('gameGuardians');
        const hudEnemies = document.getElementById('gameEnemies');
        const hudNextWave = document.getElementById('gameNextWave');
        if (hudHP) hudHP.textContent = `敌人: ${Math.min(enemyCount, 100)}/100`;
        if (hudGold) hudGold.textContent = `金币: ${playerGold}`;
        updateUnitButtonsGoldState();
        updateAssetButtonsGoldState();
        if (hudGuardians) hudGuardians.textContent = (friendCount >= FRIENDS_CAPACITY) ? `护卫: ${friendCount}/已达上限` : `护卫: ${friendCount}`;
        if (hudEnemies) hudEnemies.textContent = `剩余敌人: ${enemyCount}`;
        // 第20波 BOSS 倒计时
        if (currentWave === maxWavesPerLevel && gameState.bossTimerStarted) {
            const remaining = Math.ceil(Math.max(0, gameState.bossTimer));
            if (hudEnemies) hudEnemies.textContent += ` | ⏱BOSS: ${remaining}s`;
        }
        if (hudNextWave) {
            if (waveCooldownActive) {
                hudNextWave.textContent = `距离下一波刷新：${Math.ceil(waveCooldownTimer)}秒`;
            } else if (waveActive) {
                hudNextWave.textContent = `当前波次中`;
            } else {
                hudNextWave.textContent = `距离下一波刷新：0秒`;
            }
        }
    }

    // ================== 游戏更新 ==================
    function update(deltaTime) {
        lastDeltaTime = deltaTime;
        if (!gameRunning || !gameState.gameStarted || gamePaused) return;
        
        // ===== 提前退出检查 =====
        // 敌人数量 >= 100，游戏失败
        if (enemyCount >= 100) {
            gameRunning = false;
            gameState.loseReason = 'enemyOverflow';
            if (!gameState.isGameOver) {
                showGameResult(gameState.currentLevel, currentWave);
            }
            return;
        }
        // 如果超过最大波次
        if (currentWave > maxWavesPerLevel) {
            gameRunning = false;
            if (!gameState.isGameOver) showGameResult(gameState.currentLevel, maxWavesPerLevel);
            return;
        }

        // 第20波 BOSS 存活超过2分钟 → 失败
        if (currentWave === maxWavesPerLevel && !gameState.isGameOver) {
            if (!gameState.bossTimerStarted) {
                gameState.bossTimerStarted = true;
                gameState.bossTimer = 120; // 2分钟倒计时
            }
            gameState.bossTimer -= deltaTime;
            if (gameState.bossTimer <= 0) {
                // 检查是否还有BOSS存活
                let bossAlive = false;
                for (let i = 0; i < enemyCount; i++) {
                    if (enemies[i] && enemies[i].alive && enemies[i].isBoss) {
                        bossAlive = true;
                        break;
                    }
                }
                if (bossAlive) {
                    gameRunning = false;
                    gameState.loseReason = 'bossTimeout';
                    if (!gameState.isGameOver) showGameResult(gameState.currentLevel, currentWave);
                    return;
                }
            }
        }

        // ===== 防御塔帧动画计时器 =====
        arrowTowerFrameTimer += deltaTime;
        if (arrowTowerFrameTimer >= ARROW_TOWER_FRAME_COUNT * ARROW_TOWER_FRAME_DELAY) {
            arrowTowerFrameTimer = 0;
        }
        arrowTowerAttackFrameTimer += deltaTime;
        if (arrowTowerAttackFrameTimer >= ARROW_TOWER_ATTACK_FRAME_COUNT * ARROW_TOWER_ATTACK_FRAME_DELAY) {
            arrowTowerAttackFrameTimer = 0;
        }
        flameTowerFrameTimer += deltaTime;
        if (flameTowerFrameTimer >= FLAME_TOWER_FRAME_COUNT * FLAME_TOWER_FRAME_DELAY) {
            flameTowerFrameTimer = 0;
        }
        flameTowerAttackFrameTimer += deltaTime;
        if (flameTowerAttackFrameTimer >= FLAME_TOWER_ATTACK_FRAME_COUNT * FLAME_TOWER_ATTACK_FRAME_DELAY) {
            flameTowerAttackFrameTimer = 0;
        }
        laserTowerFrameTimer += deltaTime;
        if (laserTowerFrameTimer >= LASER_TOWER_FRAME_COUNT * LASER_TOWER_FRAME_DELAY) {
            laserTowerFrameTimer = 0;
        }
        laserTowerAttackFrameTimer += deltaTime;
        if (laserTowerAttackFrameTimer >= LASER_TOWER_ATTACK_FRAME_COUNT * LASER_TOWER_ATTACK_FRAME_DELAY) {
            laserTowerAttackFrameTimer = 0;
        }
        frostTowerFrameTimer += deltaTime;
        if (frostTowerFrameTimer >= FROST_TOWER_FRAME_COUNT * FROST_TOWER_FRAME_DELAY) {
            frostTowerFrameTimer = 0;
        }
        frostTowerAttackFrameTimer += deltaTime;
        if (frostTowerAttackFrameTimer >= FROST_TOWER_ATTACK_FRAME_COUNT * FROST_TOWER_ATTACK_FRAME_DELAY) {
            frostTowerAttackFrameTimer = 0;
        }
        bounceTrapFrameTimer += deltaTime;
        if (bounceTrapFrameTimer >= BOUNCE_TRAP_FRAME_COUNT * BOUNCE_TRAP_FRAME_DELAY) {
            bounceTrapFrameTimer = 0;
        }
        // 衰减各塔的攻击动画计时器
        for (const t of towers) {
            if (t.attackAnimTimer > 0) t.attackAnimTimer -= deltaTime;
            if (t.bounceAnimTimer > 0) t.bounceAnimTimer -= deltaTime;
        }

        // ===== 波次完成过渡 =====
        if (waveCompleted && !waveActive) {
            waveRewardTimer -= deltaTime;
            if (waveRewardTimer <= 0) {
                waveCompleted = false;
                waveRewardTimer = 0;
                currentWave++;
                const hudGameWave = document.getElementById('gameWave');
                const hudGameGold = document.getElementById('gameGold');
                if (hudGameWave) hudGameWave.textContent = `波次: ${currentWave}/${maxWavesPerLevel}`;
                if (hudGameGold) hudGameGold.textContent = `金币: ${playerGold}`;
                if (currentWave > maxWavesPerLevel) {
                    gameRunning = false;
                    if (!gameState.isGameOver) showGameResult(gameState.currentLevel, maxWavesPerLevel);
                    return;
                }
                startNextWave();
            }
        }

        // ===== 玩家移动 =====
        if (player.speedBoostCooldown > 0) player.speedBoostCooldown -= deltaTime;
        if (player.speedBoostTimer > 0) {
            player.speedBoostTimer -= deltaTime;
            player.skillCooldownNotified = false;
            if (player.speedBoostTimer <= 0) {
                player.animFrame = 0;
            }
        } else if (keys.z && player.speedBoostCooldown <= 0 && player.speedBoostTimer <= 0) {
            player.speedBoostTimer = 5;
            player.speedBoostCooldown = 60;
            player.skillCooldownNotified = false;
            player.animFrame = 0;
            playSpeedBoostSound();
        } else if (keys.z && player.speedBoostCooldown > 0 && !player.skillCooldownNotified) {
            player.skillCooldownNotified = true;
        }
        const currentSpeed = player.speed * (player.speedBoostTimer > 0 ? 2 : 1);
        if (player.attacking > 0) {
            player.attackFrameTimer = (player.attackFrameTimer || 0) + deltaTime;
            if (player.attackFrameTimer > 0.012) {
                player.attackFrameTimer = 0;
                player.attacking--;
            }
        }
        let moving = false;
        if (keys.ArrowUp || keys.w) { player.y -= currentSpeed * deltaTime; moving = true; }
        if (keys.ArrowDown || keys.s) { player.y += currentSpeed * deltaTime; moving = true; }
        if (keys.ArrowLeft || keys.a) { player.x -= currentSpeed * deltaTime; player.facing = -1; moving = true; }
        if (keys.ArrowRight || keys.d) { player.x += currentSpeed * deltaTime; player.facing = 1; moving = true; }

        // 攻击期间但连射已结束，持续根据范围内血量最少敌人更新面向
        if (player.attacking > 0 && player.burstShotsRemaining <= 0 && enemyCount > 0) {
            let lowestHealth = Infinity;
            let nearestEnemy = null;
            for (let i = 0; i < enemyCount; i++) {
                const enemy = enemies[i];
                if (!enemy || !enemy.alive) continue;
                const dx = enemy.x - player.x, dy = enemy.y - player.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist <= player.attackRange) {
                    if (enemy.health < lowestHealth) {
                        lowestHealth = enemy.health;
                        nearestEnemy = enemy;
                    }
                }
            }
            if (nearestEnemy) player.facing = nearestEnemy.x > player.x ? 1 : -1;
        }

        if (moving) {
            player.animTimer = (player.animTimer || 0) + deltaTime;
            if (player.animTimer > 0.06) {
                player.animTimer = 0;
                const isBoost = player.speedBoostTimer > 0;
                const maxFrames = isBoost
                    ? Math.max(PLAYER_SPEEDBOOST_LEFT_FRAME_COUNT, PLAYER_SPEEDBOOST_RIGHT_FRAME_COUNT)
                    : PLAYER_FRAME_COUNT_MOVE;
                player.animFrame = ((player.animFrame || 0) + 1) % maxFrames;
            }
        } else {
            player.animTimer = (player.animTimer || 0) + deltaTime;
            if (player.animTimer > 0.12) {
                player.animTimer = 0;
                player.animFrame = ((player.animFrame || 0) + 1) % Math.max(PLAYER_IDLE_LEFT_FRAME_COUNT, PLAYER_IDLE_RIGHT_FRAME_COUNT);
            }
            if (player.attacking <= 0 && enemyCount > 0) {
                let lowestHealth = Infinity;
                let nearestEnemy = null;
                for (let i = 0; i < enemyCount; i++) {
                    const enemy = enemies[i];
                    if (!enemy || !enemy.alive) continue;
                    const dx = enemy.x - player.x, dy = enemy.y - player.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist <= player.attackRange && enemy.health < lowestHealth) {
                        lowestHealth = enemy.health;
                        nearestEnemy = enemy;
                    }
                }
                if (nearestEnemy) player.facing = nearestEnemy.x > player.x ? 1 : -1;
            }
        }
        player.x = Math.max(player.width/2, Math.min(canvas.width-player.width/2, player.x));
        player.y = Math.max(player.height/2, Math.min(canvas.height-player.height/2, player.y));
        if (player.attackTimer > 0) player.attackTimer -= deltaTime;

        // ===== 玩家自动攻击 =====
        if (player.burstShotsRemaining > 0) {
            player.burstTimer -= deltaTime;
            if (player.burstTimer <= 0) {
                let targetEnemy = player.burstTarget;
                if (!targetEnemy || !targetEnemy.alive) {
                    targetEnemy = null;
                    let lowestHealth = Infinity;
                    let nearestDist = Infinity;
                    for (let i = 0; i < enemyCount; i++) {
                        const enemy = enemies[i];
                        if (!enemy || !enemy.alive) continue;
                        const dx = enemy.x - player.x, dy = enemy.y - player.y;
                        const dist = Math.sqrt(dx*dx + dy*dy);
                        if (dist <= player.attackRange) {
                            if (enemy.health < lowestHealth) {
                                lowestHealth = enemy.health;
                                nearestDist = dist;
                                targetEnemy = enemy;
                            } else if (enemy.health === lowestHealth && dist < nearestDist) {
                                nearestDist = dist;
                                targetEnemy = enemy;
                            }
                        }
                    }
                    player.burstTarget = targetEnemy;
                }
                if (targetEnemy) {
                    player.facing = targetEnemy.x > player.x ? 1 : -1;
                    const primaryAngle = Math.atan2(targetEnemy.y - player.y, targetEnemy.x - player.x);
                    const spreadLevel = perkEffectData.playerSpreadLevel || 0;
                    const totalSpreadBullets = 1 + spreadLevel;
                    const playerPierceCount = perkEffectData.playerPierceCount || 0;
                    const SPREAD_ANGLE = 0.175;
                    playerShootSound.currentTime = 0;
                    if (getSoundEnabled()) playerShootSound.play().catch(function(){});
                    for (let s = 0; s < totalSpreadBullets; s++) {
                        let angle = primaryAngle;
                        if (s > 0) {
                            const side = (s % 2 === 1) ? 1 : -1;
                            const offset = Math.ceil(s / 2);
                            const concentratedOffset = Math.sqrt(offset);
                            angle = primaryAngle + side * concentratedOffset * SPREAD_ANGLE;
                        }
                        const b = addBullet(player.x, player.y, null, 5, '#BFFF00', player.bulletSpeed, player.bulletDamage, 0, 0, false, false, false, true, false, playerPierceCount);
                        if (b) {
                            b.dx = Math.cos(angle) * player.bulletSpeed;
                            b.dy = Math.sin(angle) * player.bulletSpeed;
                            b.target = null;
                        }
                    }
                    player.burstShotsRemaining -= 1;
                    player.burstTimer = player.burstInterval;
                } else {
                    player.burstShotsRemaining = 0;
                }
            }
        }
        if (player.attackTimer <= 0 && player.burstShotsRemaining <= 0 && enemyCount > 0) {
            let targetEnemy = null;
            let lowestHealth = Infinity;
            let nearestDist = Infinity;
            for (let i = 0; i < enemyCount; i++) {
                const enemy = enemies[i];
                if (!enemy || !enemy.alive) continue;
                const dx = enemy.x - player.x, dy = enemy.y - player.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist <= player.attackRange) {
                    if (enemy.health < lowestHealth) {
                        lowestHealth = enemy.health;
                        nearestDist = dist;
                        targetEnemy = enemy;
                    } else if (enemy.health === lowestHealth && dist < nearestDist) {
                        nearestDist = dist;
                        targetEnemy = enemy;
                    }
                }
            }
            if (targetEnemy) {
                player.attacking = PLAYER_ATTACK_FRAME_COUNT;
                player.facing = targetEnemy.x > player.x ? 1 : -1;
                const shots = Math.max(1, Math.min(4, perkEffectData.playerBurstShots || 1));
                player.burstTarget = targetEnemy;
                player.burstShotsRemaining = shots;
                player.burstTimer = 0;
                player.attackTimer = player.attackCooldown;
            }
        }

        // ===== 敌人过多警告 =====
        // 兜底检查：场上敌人超过上限则游戏结束
        if (enemyCount >= ENEMIES_CAPACITY && !gameState.isGameOver) {
            gameRunning = false;
            gameState.crystalDestroyed = true;
            gameState.isGameOver = true;
            gameState.lastResult = 'defeat';
            showGameResult(gameState.currentLevel, currentWave || 1);
        }

        if (enemyCount >= 80) {
            if (enemyWarning.warning80Times < 2) {
                enemyWarning.warning80Timer -= deltaTime;
                if (enemyWarning.warning80Timer <= 0) {
                    enemyWarning.warningText = '⚠️ 警告！敌人过多，请立刻消灭！';
                    enemyWarning.warningAlpha = 1;
                    enemyWarning.warningDisplayTimer = 3;
                    enemyWarning.warning80Times++;
                    enemyWarning.warning80Timer = 3;
                    if (enemyWarning.warning80Times === 1) {
                        warningSound.currentTime = 0;
                        if (getSoundEnabled()) warningSound.play().catch(function(){});
                    }
                }
            }
        } else {
            enemyWarning.warningText = '';
            enemyWarning.warningAlpha = 0;
            enemyWarning.warningDisplayTimer = 0;
        }
        
        // 警告文字计时淡化（3秒后渐隐）
        if (enemyWarning.warningDisplayTimer > 0) {
            enemyWarning.warningDisplayTimer -= deltaTime;
            if (enemyWarning.warningDisplayTimer <= 1.5) {
                enemyWarning.warningAlpha = Math.max(0, enemyWarning.warningDisplayTimer / 1.5);
            }
        }

        // ===== 更新过期视觉特效 =====
        removeExpiredAttacks();
        removeExpiredExplosions();
        removeExpiredGuardExplosions();
        removeExpiredGuardDeaths();
        removeExpiredBullets();
        removeExpiredFriendShots();

        // ===== 子弹更新 =====
        for (let i = 0; i < bulletCount; i++) {
            const bullet = bullets[i];
            
            // 对于没有target的子弹（散射等方向子弹），按固定方向飞行
            if (!bullet.target) {
                bullet.x += bullet.dx * deltaTime;
                bullet.y += bullet.dy * deltaTime;
                
                // 出界检测
                if (bullet.x < -50 || bullet.x > canvas.width + 50 || bullet.y < -50 || bullet.y > canvas.height + 50) {
                    bullet.target = null; // 标记为无效
                    continue;
                }
                
                // 方向子弹碰撞检测（支持穿透：沿子弹路径继续飞行）
                        for (let ei = 0; ei < enemyCount; ei++) {
                            const enemy = enemies[ei];
                            if (!enemy || !enemy.alive) continue;
                            // 跳过已经穿透过的敌人
                            if (bullet.piercedEnemies && bullet.piercedEnemies.indexOf(enemy) !== -1) continue;
                            
                            if (bullet.x - bullet.radius < enemy.x + enemy.width/2 &&
                                bullet.x + bullet.radius > enemy.x - enemy.width/2 &&
                                bullet.y - bullet.radius < enemy.y + enemy.height/2 &&
                                bullet.y + bullet.radius > enemy.y - enemy.height/2) {
                                
                                let actualDamage = bullet.damage;
                                // 暴击判定（玩家子弹）
                                let isCrit = false;
                                if (bullet.fromPlayer && (perkEffectData.playerCritChance || 0) > 0 && Math.random() < (perkEffectData.playerCritChance || 0)) {
                                    actualDamage *= 2;
                                    isCrit = true;
                                }
                                enemy.health -= actualDamage;
                                // 击中音效
                                if (bullet.fromPlayer || bullet.fromTower) playFriendlyHitSound();
                                // 击退效果（玩家子弹轻微击退敌人）
                                if (bullet.fromPlayer && (bullet.dx || bullet.dy)) {
                                    const kbPower = 1;
                                    const kbLen = Math.sqrt(bullet.dx*bullet.dx + bullet.dy*bullet.dy);
                                    if (kbLen > 0) {
                                        enemy.x += (bullet.dx / kbLen) * kbPower;
                                        enemy.y += (bullet.dy / kbLen) * kbPower;
                                    }
                                }
                                addDamageText(enemy.x, enemy.y, actualDamage, isCrit ? '#FFD700' : 'white');
                                addExplosion(enemy.x, enemy.y, 0);
                                
                                if (enemy.health <= 0) {
                                    playerGold += enemy.goldReward;
                                    addGoldText(enemy.goldReward);
                                    playerExperience += enemy.expReward;
                                    dropExpGemsForKill(enemy, enemy.x, enemy.y);
                                    playEnemyDeathSound();
                                    enemy.alive = false; enemy.dying = true; enemy.deathTimer = ENEMY_DEATH_DURATION;
                                }
                                
                                // 穿透逻辑：沿子弹路径继续飞行，攻击下一个敌人
                                if (bullet.pierceCount > 0) {
                                    if (!bullet.piercedEnemies) bullet.piercedEnemies = [];
                                    bullet.piercedEnemies.push(enemy);
                                    bullet.pierceCount--;
                                    // 不销毁子弹，继续沿原方向飞行检测下一个敌人
                                } else {
                                    bullet.hit = true; // 无穿透次数，标记命中
                                }
                                break;
                            }
                        }
                        if (bullet.hit) continue;
                        continue; // 方向子弹继续飞行
            }
            
            if (!bullet.target || !bullet.target.alive) continue;
            const dx = bullet.target.x - bullet.x, dy = bullet.target.y - bullet.y;
            const distance = Math.sqrt(dx*dx + dy*dy);
            if (distance > 0) {
                const angle = Math.atan2(dy, dx);
                bullet.dx = Math.cos(angle) * bullet.speed;
                bullet.dy = Math.sin(angle) * bullet.speed;
            }
            bullet.x += bullet.dx * deltaTime;
            bullet.y += bullet.dy * deltaTime;

            if (bullet.x < 0 || bullet.x > canvas.width || bullet.y < 0 || bullet.y > canvas.height) continue;

            // 碰撞检测
            if (bullet.target &&
                bullet.x - bullet.radius < bullet.target.x + bullet.target.width/2 &&
                bullet.x + bullet.radius > bullet.target.x - bullet.target.width/2 &&
                bullet.y - bullet.radius < bullet.target.y + bullet.target.height/2 &&
                bullet.y + bullet.radius > bullet.target.y - bullet.target.height/2) {
                
                let actualDamage = bullet.damage;
                if (bullet.target && bullet.target.isArmored && bullet.fromTower) {
                    actualDamage *= bullet.isLaser ? 1.5 : 0.5;
                }
                                // 暴击判定（玩家子弹）
                                let isCrit = false;
                                if (bullet.fromPlayer && (perkEffectData.playerCritChance || 0) > 0 && Math.random() < (perkEffectData.playerCritChance || 0)) {
                                    actualDamage *= 2;
                                    isCrit = true;
                                }
                                bullet.target.health -= actualDamage;
                                // 击中音效
                                if (!bullet.fromEnemy) playFriendlyHitSound();
                                // 击退效果（玩家子弹轻微击退敌人）
                                if (bullet.fromPlayer && (bullet.dx || bullet.dy)) {
                                    const kbPower = 3;
                                    const kbLen = Math.sqrt(bullet.dx*bullet.dx + bullet.dy*bullet.dy);
                                    if (kbLen > 0) {
                                        bullet.target.x += (bullet.dx / kbLen) * kbPower;
                                        bullet.target.y += (bullet.dy / kbLen) * kbPower;
                                    }
                                }
                                addDamageText(bullet.target.x, bullet.target.y, actualDamage, isCrit ? '#FFD700' : 'white');
                                addExplosion(bullet.target.x, bullet.target.y, 20);
                
                // 冰冻减速
                if (!bullet.fromEnemy && bullet.slowDuration > 0 && bullet.slowPercentage > 0) {
                    bullet.target.frozenByFrostTower = true;
                    bullet.target.frostTowerSlowFactor = bullet.slowPercentage;
                    bullet.target.frozenTimer = bullet.slowDuration;
                }
                const hitTarget = bullet.target;
                
                // 穿透逻辑：如果子弹有穿透次数，转为方向模式沿子弹当前路径继续飞行
                if (bullet.pierceCount > 0 && hitTarget && hitTarget.alive) {
                    // 记录已穿透的敌人
                    if (!bullet.piercedEnemies) bullet.piercedEnemies = [];
                    bullet.piercedEnemies.push(hitTarget);
                    bullet.pierceCount--;
                    
                    // 计算当前飞行方向（沿子弹到被穿透敌人的方向继续飞行）
                    const dx = hitTarget.x - bullet.x;
                    const dy = hitTarget.y - bullet.y;
                    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                    // 沿原路径方向继续飞行（即子弹飞向被穿透敌人的方向）
                    bullet.dx = (dx / dist) * bullet.speed;
                    bullet.dy = (dy / dist) * bullet.speed;
                    // 转为方向模式，沿路径继续飞行检测路线上的下一个敌人
                    bullet.target = null;
                } else {
                    bullet.target = null;
                }

                if (hitTarget.health <= 0) {
                    if (hitTarget.goldReward !== undefined) {
                        if (hitTarget.isBoss) addDamageText(hitTarget.x, hitTarget.y-30, '💀 BOSS被击杀！', '#FF0000', 2, 15);
                        playerGold += hitTarget.goldReward;
                        addGoldText(hitTarget.goldReward);
                        playerExperience += hitTarget.expReward;
                        dropExpGemsForKill(hitTarget, hitTarget.x, hitTarget.y);
                        hitTarget.alive = false; hitTarget.dying = true; hitTarget.deathTimer = ENEMY_DEATH_DURATION;
                    } else if (hitTarget.size !== undefined) {
                        hitTarget.alive = false;
                        hitTarget._pendingRemove = true;
                        for (let j = 0; j < enemyCount; j++) {
                            const otherEnemy = enemies[j];
                            if (otherEnemy && otherEnemy.alive && otherEnemy.targetTrap === hitTarget) {
                                otherEnemy.isBlocked = false;
                                otherEnemy.targetTrap = null;
                            }
                        }
                    } else {
                        hitTarget.alive = false;
                    }
                }
            }
        }

        const enemyPreviewPanel = document.getElementById('enemyPreviewPanel');
        if (selectedEnemy && enemyPreviewPanel && enemyPreviewPanel.style.display === 'block' && !selectedEnemy.alive) {
            closeEnemyPreviewPanel();
        }

        // ===== 防御塔攻击（统一放在敌人更新前，每帧执行一次） =====
        // 先触发所有塔的攻击
        for (let ti = 0; ti < towers.length; ti++) {
            const t = towers[ti];
            if (!t || t._pendingRemove || t.alive === false || t.health <= 0) continue;
            // 每帧更新每个塔的攻击帧动画计时器
            t.attackFrameTimer += deltaTime;
            if (t.type === 'goldMine') {
                // 金矿：每10秒自动生产金币
                t.productionTimer -= deltaTime;
                if (t.productionTimer <= 0) {
                    t.productionTimer = t.productionInterval;
                    let goldProduced = t.goldPerProduction + t.upgradeLevel * 5;
                    goldProduced += (perkEffectData.goldMineBoost || 0);
                    playerGold += goldProduced;
                    // 在矿机头顶显示产出金币数字（不显示在左侧Gold区域）
                    addDamageText(t.x, t.y - t.size/2 - 16, `💰+${goldProduced}`, '#FFD700', 1.5, 25);
                }
                continue; // 金矿没有攻击逻辑
            }
            t.attackTimer -= deltaTime;
            // 每帧更新目标用于朝向判断（即使攻击冷却中）
            if ((t.type === 'arrowTower' || t.type === 'flameTower' || t.type === 'frostTower' || t.type === 'laserTower') && t.attackRange > 0) {
                let nearestEnemy = null;
                let nearestDist = t.attackRange;
                for (let i = 0; i < enemyCount; i++) {
                    const enemy = enemies[i];
                    if (!enemy.alive) continue;
                    const dx = enemy.x - t.x, dy = enemy.y - t.y;
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    if (dist <= nearestDist) {
                        nearestDist = dist;
                        nearestEnemy = enemy;
                    }
                }
                t.target = nearestEnemy;
            }
            if (t.attackTimer <= 0 && t.attackRange > 0) {
                if (t.type === 'flameTower') {
                    // 烈焰炮塔：寻找射程内血量最低的3个敌人
                    let targets = [];
                    for (let i = 0; i < enemyCount; i++) {
                        const enemy = enemies[i];
                        if (!enemy.alive) continue;
                        const dx = enemy.x - t.x, dy = enemy.y - t.y;
                        const dist = Math.sqrt(dx*dx + dy*dy);
                        if (dist <= t.attackRange) targets.push(enemy);
                    }
                    targets.sort((a, b) => a.health - b.health);
                    const finalTargets = targets.slice(0, 3);
                    if (finalTargets.length > 0) {
                        for (const targetEnemy of finalTargets) {
                            addBullet(t.x, t.y, targetEnemy, 5, '#FF4500', t.bulletSpeed, t.attackDamage, 0, 0, false, true, true, false, false);
                        }
                        t.attackTimer = t.attackCooldown;
                        t.attackFrameTimer = 0;
                        t.lastAttackFaceLeft = finalTargets[0].x < t.x;
                        t.attackAnimTimer = FLAME_TOWER_ATTACK_FRAME_COUNT * FLAME_TOWER_ATTACK_FRAME_DELAY;
                    }
                } else {
                    // 其他炮塔：优先攻击血量最低的1个敌人
                    let targetEnemy = null;
                    let lowestHealth = Infinity;
                    for (let i = 0; i < enemyCount; i++) {
                        const enemy = enemies[i];
                        if (!enemy.alive) continue;
                        const dx = enemy.x - t.x, dy = enemy.y - t.y;
                        const dist = Math.sqrt(dx*dx + dy*dy);
                        if (dist <= t.attackRange && enemy.health < lowestHealth) {
                            lowestHealth = enemy.health;
                            targetEnemy = enemy;
                        }
                    }
                    if (targetEnemy) {
                        if (t.type === 'frostTower') {
                            // 冰霜女：先播放攻击动画，0.25s后发射子弹
                            t.attackDelayTimer = 0.25;
                            t.pendingTarget = targetEnemy;
                            const ft = gameAssets.towers.frostTower;
                            t.pendingBulletConfig = { radius: 5, color: '#40DFFF', bulletSpeed: t.bulletSpeed, damage: t.attackDamage, slowDuration: ft.slowDuration, slowPercentage: ft.slowPercentage };
                        } else if (t.type === 'laserTower') {
                            addBullet(t.x, t.y, targetEnemy, 5, '#FFD600', t.bulletSpeed, t.attackDamage, 0, 0, true, false, true, false, false);
                        } else if (t.type === 'magicTower') {
                            addBullet(t.x, t.y, targetEnemy, 5, '#D500F9', t.bulletSpeed, t.attackDamage, 0, 0, false, false, true, false, false);
                        } else if (t.type === 'arrowTower') {
                            addBullet(t.x, t.y, targetEnemy, 5, '#A0522D', t.bulletSpeed, t.attackDamage, 0, 0, false, false, true, false, false);
                        } else {
                            addBullet(t.x, t.y, targetEnemy, 5, '#FFB300', t.bulletSpeed, t.attackDamage, 0, 0, false, false, true, false, false);
                        }
                        t.attackTimer = t.attackCooldown;
                        t.attackFrameTimer = 0;
                        t.lastAttackFaceLeft = targetEnemy.x < t.x;
                        // 触发攻击动画
                        if (t.type === 'arrowTower') {
                            t.attackAnimTimer = ARROW_TOWER_ATTACK_FRAME_COUNT * ARROW_TOWER_ATTACK_FRAME_DELAY;
                        } else if (t.type === 'frostTower') {
                            t.attackAnimTimer = FROST_TOWER_ATTACK_FRAME_COUNT * FROST_TOWER_ATTACK_FRAME_DELAY;
                        } else if (t.type === 'laserTower') {
                            t.attackAnimTimer = LASER_TOWER_ATTACK_FRAME_COUNT * LASER_TOWER_ATTACK_FRAME_DELAY;
                        }
                    }
                }
            }
        }

        // ===== 处理延迟攻击（冰霜女：动画先播放，延迟后发射子弹） =====
        for (const t of towers) {
            if (!t || t._pendingRemove || t.alive === false || t.health <= 0) continue;
            if (t.attackDelayTimer > 0) {
                t.attackDelayTimer -= deltaTime;
                if (t.attackDelayTimer <= 0) {
                    if (t.pendingTarget && t.pendingTarget.alive) {
                        const cfg = t.pendingBulletConfig;
                        addBullet(t.x, t.y, t.pendingTarget, cfg.radius, cfg.color, cfg.bulletSpeed, cfg.damage, cfg.slowDuration, cfg.slowPercentage, false, false, true, false, false);
                    }
                    t.pendingTarget = null;
                    t.pendingBulletConfig = null;
                }
            }
        }

        // ===== 敌人更新 =====
        for (let i = 0; i < enemyCount; i++) {
            if (!gameRunning) break; // 游戏结束立即停止处理
            
            const enemy = enemies[i];
            if (!enemy.alive) continue;

            // 计算当前速度（考虑减速效果）
            enemy.currentSpeed = enemy.baseSpeed;
            if (enemy.slowedByIceSpike) enemy.currentSpeed *= (1 - enemy.iceSpikeSlowFactor);
            if (enemy.frozenByFrostTower) enemy.currentSpeed *= (1 - enemy.frostTowerSlowFactor);

            // ===== 帧动画更新 =====
            enemy.animTimer = (enemy.animTimer || 0) + deltaTime;
            if (enemy.animTimer > 0.06) {
                enemy.animTimer = 0;
                let fc = NORMAL_ENEMY_FRAME_COUNT;
                if (enemy.type === ENEMY_TYPES.FAST) fc = FAST_ENEMY_FRAME_COUNT;
                else if (enemy.type === ENEMY_TYPES.TANK) fc = TANK_ENEMY_FRAME_COUNT;
                else if (enemy.type === ENEMY_TYPES.SHARPSHOOTER) fc = SHARPSHOOTER_ENEMY_FRAME_COUNT;
                else if (enemy.type === ENEMY_TYPES.ARMORED) fc = ARMORED_ENEMY_FRAME_COUNT;
                else if (enemy.type === ENEMY_TYPES.DESTROYER_MAGE) fc = DESTROYER_MAGE_ENEMY_FRAME_COUNT;
                else if (enemy.type === ENEMY_TYPES.MINI_BOSS) fc = MINI_BOSS_ENEMY_FRAME_COUNT;
                else if (enemy.type === ENEMY_TYPES.BOSS) fc = BOSS_ENEMY_FRAME_COUNT;
                enemy.animFrame = ((enemy.animFrame || 0) + 1) % fc;
            }

            // ===== 攻击动画计时 =====
            if (enemy.attackAnimTimer > 0) {
                enemy.attackAnimTimer -= deltaTime;
                if (enemy.attackAnimTimer < 0) enemy.attackAnimTimer = 0;
            }

            // ===== 流血效果 =====
            if (enemy.bleeding && enemy.bloodParticles) {
                // 生成流血粒子
                enemy.bloodSpawnTimer = (enemy.bloodSpawnTimer || 0) + deltaTime;
                while (enemy.bloodSpawnTimer >= 0.05) {
                    enemy.bloodSpawnTimer -= 0.05;
                    if (enemy.bloodParticles.length < 30) {
                        enemy.bloodParticles.push({
                            x: enemy.x + (Math.random() - 0.5) * enemy.width * 0.6,
                            y: enemy.y - enemy.height * 0.3,
                            vx: (Math.random() - 0.5) * 60,
                            vy: -Math.random() * 80 - 20,
                            size: 0.8 + Math.random() * 1.2,
                            life: 0.3 + Math.random() * 0.4,
                            maxLife: 0.3 + Math.random() * 0.4
                        });
                    }
                }
                // 粒子物理更新
                for (let pi = enemy.bloodParticles.length - 1; pi >= 0; pi--) {
                    const p = enemy.bloodParticles[pi];
                    p.x += p.vx * deltaTime;
                    p.y += p.vy * deltaTime;
                    p.vy += 120 * deltaTime; // 重力
                    p.life -= deltaTime;
                    if (p.life <= 0) { enemy.bloodParticles.splice(pi, 1); }
                }
                enemy.bleedTimer -= deltaTime;
                const bleedDmg = enemy.bleedDps * deltaTime;
                enemy.health -= bleedDmg;
                enemy.bleedAccumulatedDamage += bleedDmg;
                enemy.lastBleedTextTimer += deltaTime;
                if (enemy.lastBleedTextTimer >= 1.0) {
                    const displayDmg = Math.max(1, Math.round(enemy.bleedAccumulatedDamage));
                    addDamageText(enemy.x, enemy.y - 20, '-' + displayDmg, '#FF6666', 0.6, 18);
                    enemy.bleedAccumulatedDamage = 0;
                    enemy.lastBleedTextTimer = 0;
                }
                if (enemy.bleedTimer <= 0) {
                    enemy.bleeding = false;
                    enemy.bleedAccumulatedDamage = 0;
                }
                if (enemy.health <= 0) {
                    playerGold += enemy.goldReward;
                    addGoldText(enemy.goldReward);
                    playerExperience += enemy.expReward;
                    dropExpGemsForKill(enemy, enemy.x, enemy.y);
                    playEnemyDeathSound();
                    enemy.alive = false; enemy.dying = true; enemy.deathTimer = ENEMY_DEATH_DURATION;
                    continue;
                }
            }

            // ===== 冰冻计时 =====
            if (enemy.frozenByFrostTower) {
                enemy.frozenTimer -= deltaTime;
                if (enemy.frozenTimer <= 0) {
                    enemy.frozenByFrostTower = false;
                    enemy.frostTowerSlowFactor = 0;
                }
            }

            if (enemy.attackRange > 0 && enemy.projectileSpeed > 0 && (enemy.type === ENEMY_TYPES.SHARPSHOOTER || enemy.type === ENEMY_TYPES.DESTROYER_MAGE || enemy.type === ENEMY_TYPES.ARMORED || enemy.type === ENEMY_TYPES.MINI_BOSS || enemy.type === ENEMY_TYPES.BOSS)) {
                let targetFriend = null;
                let bestFriendDist = Infinity;
                for (let fi = 0; fi < friendCount; fi++) {
                    const friend = friendlies[fi];
                    if (!friend || !friend.alive) continue;
                    const dx = friend.x - enemy.x;
                    const dy = friend.y - enemy.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist <= enemy.attackRange && dist < bestFriendDist) {
                        bestFriendDist = dist;
                        targetFriend = friend;
                    }
                }

                if (targetFriend && bestFriendDist > 25) {
                    enemy.rangedAttackTimer -= deltaTime;
                    if (enemy.rangedAttackTimer <= 0) {
                        addBullet(enemy.x, enemy.y, targetFriend, enemy.projectileRadius || 4, enemy.projectileColor || 'white', enemy.projectileSpeed, enemy.attackDamage, 0, 0, false, false, false, false, true);
                        enemy.rangedAttackTimer = enemy.rangedAttackCooldown;
                        if (enemy.type === ENEMY_TYPES.SHARPSHOOTER || enemy.type === ENEMY_TYPES.MINI_BOSS || enemy.type === ENEMY_TYPES.BOSS) enemy.attackAnimTimer = enemy.type === ENEMY_TYPES.SHARPSHOOTER ? SHARPSHOOTER_ATTACK_DURATION : (enemy.type === ENEMY_TYPES.MINI_BOSS ? MINI_BOSS_ATTACK_DURATION : BOSS_ATTACK_DURATION);
                    }
                } else if (!targetFriend) {
                    let targetBuilding = null;
                    let bestDist = Infinity;
                    for (let ti = 0; ti < towers.length; ti++) {
                        const tower = towers[ti];
                        if (!tower || tower._pendingRemove || tower.alive === false || tower.health <= 0) continue;
                        const canBeTargeted = (tower.type === 'blockTrap' || tower.type === 'arrowTower' || tower.type === 'flameTower' || tower.type === 'frostTower' || tower.type === 'laserTower' || tower.type === 'goldMine');
                        if (!canBeTargeted) continue;
                        const dx = tower.x - enemy.x;
                        const dy = tower.y - enemy.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist <= enemy.attackRange && dist < bestDist) {
                            bestDist = dist;
                            targetBuilding = tower;
                        }
                    }

                    if (targetBuilding) {
                        enemy.rangedAttackTimer -= deltaTime;
                        if (enemy.rangedAttackTimer <= 0) {
                            addBullet(enemy.x, enemy.y, targetBuilding, enemy.projectileRadius || 4, enemy.projectileColor || 'white', enemy.projectileSpeed, enemy.attackDamage, 0, 0, false, false, false, false, true);
                            enemy.rangedAttackTimer = enemy.rangedAttackCooldown;
                            if (enemy.type === ENEMY_TYPES.SHARPSHOOTER || enemy.type === ENEMY_TYPES.MINI_BOSS || enemy.type === ENEMY_TYPES.BOSS) enemy.attackAnimTimer = enemy.type === ENEMY_TYPES.SHARPSHOOTER ? SHARPSHOOTER_ATTACK_DURATION : (enemy.type === ENEMY_TYPES.MINI_BOSS ? MINI_BOSS_ATTACK_DURATION : BOSS_ATTACK_DURATION);
                        }
                    }
                }
            }

            // ===== 障碍物阻挡 =====
            if (enemy.isBlocked && enemy.targetTrap) {
                enemy.attackTimer -= deltaTime;
                if (enemy.attackTimer <= 0) {
                    enemy.targetTrap.health -= enemy.attackDamage;
                    addDamageText(enemy.targetTrap.x, enemy.targetTrap.y - 10, `-${enemy.attackDamage}`, '#FF0000');
                    enemy.attackTimer = enemy.attackCooldown;
                    if (enemy.targetTrap.health <= 0) {
                        const destroyedTrap = enemy.targetTrap;
                        for (let j = 0; j < enemyCount; j++) {
                            const otherEnemy = enemies[j];
                            if (otherEnemy && otherEnemy.alive && otherEnemy.targetTrap === destroyedTrap) {
                                otherEnemy.isBlocked = false;
                                otherEnemy.targetTrap = null;
                            }
                        }
                        destroyedTrap.alive = false;
                        destroyedTrap._pendingRemove = true;
                    }
                }
                if (enemy.isBlocked) continue;
            }

            // ===== 碰撞检测建筑（触发阻挡） =====
            if (!enemy.isBlocked) {
                for (let ti = 0; ti < towers.length; ti++) {
                    const tower = towers[ti];
                    if (!tower || tower._pendingRemove || tower.alive === false || tower.health <= 0) continue;
                    if (tower.health !== undefined && tower.health !== null) {
                        const buildingRect = { x: tower.x-tower.size/2, y: tower.y-tower.size/2, width: tower.size, height: tower.size };
                        const enemyRect = { x: enemy.x-enemy.width/2, y: enemy.y-enemy.height/2, width: enemy.width, height: enemy.height };
                        if (checkCollision(enemyRect, buildingRect)) {
                            enemy.isBlocked = true;
                            enemy.targetTrap = tower;
                            break;
                        }
                    }
                }
            }
            if (enemy.isBlocked) continue;

            // ===== 减速带 =====
            let isCollidingWithIceSpike = false;
            for (let ti = 0; ti < towers.length; ti++) {
                const tower = towers[ti];
                if (!tower || tower._pendingRemove || tower.alive === false || tower.health <= 0) continue;
                if (tower.type === 'iceSpikeTrap' && tower.slowFactor !== undefined) {
                    const trapRect = { x: tower.x-tower.trapTriggerRange/2, y: tower.y-tower.trapTriggerRange/2, width: tower.trapTriggerRange, height: tower.trapTriggerRange };
                    const enemyRect = { x: enemy.x-enemy.width/2, y: enemy.y-enemy.height/2, width: enemy.width, height: enemy.height };
                    if (checkCollision(enemyRect, trapRect)) {
                        isCollidingWithIceSpike = true;
                        // 减速 + 流血效果
                        enemy.slowedByIceSpike = true;
                        enemy.iceSpikeSlowFactor = tower.slowFactor;
                        // 流血：基础1点/秒，每升1级+1点/秒（满级LV5→5点/秒）
                        const bleedDps = 1 + (tower.upgradeLevel || 0) * 1;
                        const wasNotBleeding = !enemy.bleeding;
                        if (!enemy.bleeding || bleedDps > enemy.bleedDps) {
                            enemy.bleeding = true;
                            enemy.bleedDps = bleedDps;
                            enemy.bleedTimer = 3;
                            enemy.lastBleedTextTimer = 0;
                            enemy.bleedAccumulatedDamage = 0;
                        }
                        // 进入减速带立即扣血并显示
                        if (wasNotBleeding) {
                            const instantDmg = Math.round(bleedDps);
                            enemy.health -= instantDmg;
                            addDamageText(enemy.x, enemy.y - 20, '-' + instantDmg, '#FF6666', 0.6, 18);
                            playFriendlyHitSound();
                            if (enemy.health <= 0) {
                                playEnemyDeathSound();
                                enemy.alive = false; enemy.dying = true; enemy.deathTimer = ENEMY_DEATH_DURATION;
                                playerGold += enemy.goldReward; addGoldText(enemy.goldReward);
                                playerExperience += enemy.expReward; dropExpGemsForKill(enemy, enemy.x, enemy.y);
                            }
                        }
                    }
                }
            }
            if (!enemy.alive) continue;
            if (!isCollidingWithIceSpike && enemy.slowedByIceSpike) {
                enemy.slowedByIceSpike = false;
                enemy.iceSpikeSlowFactor = 0;
            }

        // ===== 爆炸区 =====
            for (let ti = 0; ti < towers.length; ti++) {
                const tower = towers[ti];
                if (!tower || tower._pendingRemove || tower.alive === false || tower.health <= 0) continue;
                if (tower.type === 'explosiveTrap' && tower.attackTimer <= 0) {
                    const trapRect = { x: tower.x-tower.trapTriggerRange/2, y: tower.y-tower.trapTriggerRange/2, width: tower.trapTriggerRange, height: tower.trapTriggerRange };
                    const enemyRect = { x: enemy.x-enemy.width/2, y: enemy.y-enemy.height/2, width: enemy.width, height: enemy.height };
                    if (checkCollision(enemyRect, trapRect)) {
                        const explosionCenterX = tower.x, explosionCenterY = tower.y;
                        const explosionRadius = tower.explosionRadius, explosionDamage = tower.trapDamage;
                        playExplosionSound();
                        for (let j = 0; j < enemyCount; j++) {
                            const targetEnemy = enemies[j];
                            if (!targetEnemy.alive) continue;
                            const dx = targetEnemy.x - explosionCenterX, dy = targetEnemy.y - explosionCenterY;
                            const dist = Math.sqrt(dx*dx + dy*dy);
                            if (dist <= explosionRadius) {
                                targetEnemy.health -= explosionDamage;
                                addDamageText(targetEnemy.x, targetEnemy.y, explosionDamage, '#FF3333');
                                if (targetEnemy.health <= 0) {
                                    targetEnemy.alive = false; targetEnemy.dying = true; targetEnemy.deathTimer = ENEMY_DEATH_DURATION;
                                    playerGold += targetEnemy.goldReward;
                                    addGoldText(targetEnemy.goldReward);
                                    playerExperience += targetEnemy.expReward;
                                    dropExpGemsForKill(targetEnemy, targetEnemy.x, targetEnemy.y);
                                }
                            }
                        }
                        // 爆炸帧动画效果
                        if (trapExplosionCount < 100) {
                            trapExplosions[trapExplosionCount++] = { x: explosionCenterX, y: explosionCenterY, timer: 0, size: explosionRadius * 2 };
                        }
                        tower.attackTimer = tower.attackCooldown;
                        addDamageText(explosionCenterX, explosionCenterY-20, "💥 爆炸！", '#FF4500', 1.0, 40);
                        break;
                    }
                }
            }

            // ===== 传送器 =====
            if (enemy.bounceCooldown > 0) enemy.bounceCooldown -= deltaTime;
            if (enemy.bounceCooldown <= 0) {
                for (let ti = 0; ti < towers.length; ti++) {
                    const tower = towers[ti];
                    if (!tower || tower._pendingRemove || tower.alive === false || tower.health <= 0) continue;
                    if (tower.type === 'bounceTrap' && tower.attackTimer <= 0) {
                        const trapRect = { x: tower.x-tower.trapTriggerRange/2, y: tower.y-tower.trapTriggerRange/2, width: tower.trapTriggerRange, height: tower.trapTriggerRange };
                        const enemyRect = { x: enemy.x-enemy.width/2, y: enemy.y-enemy.height/2, width: enemy.width, height: enemy.height };
                        if (checkCollision(enemyRect, trapRect)) {
                            playBounceSound();
                            let remainingBounce = tower.bounceDistance;
                            while (remainingBounce > 0 && enemy.pathIndex > 0) {
                                const prevPoint = enemy.pathIndex === 0 ? {x:enemy.x,y:enemy.y} : enemy.path[enemy.pathIndex-1];
                                const dx = enemy.x - prevPoint.x, dy = enemy.y - prevPoint.y;
                                const distToPrev = Math.sqrt(dx*dx + dy*dy);
                                if (distToPrev <= remainingBounce) {
                                    enemy.x = prevPoint.x; enemy.y = prevPoint.y;
                                    remainingBounce -= distToPrev;
                                    enemy.pathIndex = Math.max(0, enemy.pathIndex-1);
                                    if (enemy.pathIndex === 0) break;
                                } else {
                                    const angle = Math.atan2(dy, dx);
                                    enemy.x -= Math.cos(angle) * remainingBounce;
                                    enemy.y -= Math.sin(angle) * remainingBounce;
                                    remainingBounce = 0;
                                }
                            }
                            tower.attackTimer = tower.attackCooldown;
                            tower.bounceAnimTimer = BOUNCE_TRAP_FRAME_COUNT * BOUNCE_TRAP_FRAME_DELAY;
                            // 在敌人新位置创建弹射效果
                            if (bounceEffectCount < 100) {
                                bounceEffects[bounceEffectCount++] = { x: enemy.x, y: enemy.y, timer: 0, duration: BOUNCE_TRAP_FRAME_COUNT * BOUNCE_TRAP_FRAME_DELAY };
                            }
                            enemy.bounceCooldown = 1.0;
                            break;
                        }
                    }
                }
            }

            // ===== 敌人攻击附近的友方小兵 =====
            let attackingFriend = false;
            const enemyAttackFriend = (friend) => {
                attackingFriend = true;
                enemy.attackTimer -= deltaTime;
                if (enemy.attackTimer <= 0) {
                    friend.health -= enemy.attackDamage;
                    addDamageText(friend.x, friend.y - 10, `-${enemy.attackDamage}`, '#FF0000');
                    enemy.attackTimer = enemy.attackCooldown;
                    if (friend.health <= 0) { addGuardDeath(friend.x, friend.y); friend.alive = false; }
                }
            };
            for (let fi = 0; fi < friendCount; fi++) {
                const friend = friendlies[fi];
                if (!friend || !friend.alive) continue;
                // 远程护卫：只在贴身距离停下
                if (friend.type === 'archer' || friend.type === 'mage' || friend.type === 'sniper' || friend.type === 'gunner') {
                    const dx = friend.x - enemy.x;
                    const dy = friend.y - enemy.y;
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    if (dist < 25) { enemyAttackFriend(friend); break; }
                    continue;
                }
                // 近战护卫：只要正在攻击此敌人，敌人就停下对打
                if (friend.targetEnemy === enemy && friend.state === 'fighting') {
                    enemyAttackFriend(friend); break;
                }
                const dx = friend.x - enemy.x;
                const dy = friend.y - enemy.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < 25) { enemyAttackFriend(friend); break; }
            }
            if (attackingFriend) continue;

            // ===== 敌人持续沿路径行走（绕外圈循环，不回到中心出生点） =====
            if (!enemy.path || !enemy.path[enemy.pathIndex] || enemy.pathIndex >= enemy.path.length) {
                // 到达终点 → 回到外圈起点（path[1]），继续绕圈
                enemy.pathIndex = 1;
                if (enemy.path && enemy.path.length > 1) {
                    const sp = enemy.path[1];
                    enemy.x = sp.x;
                    enemy.y = sp.y;
                }
                continue;
            }

            const targetPoint = enemy.path[enemy.pathIndex];
            if (targetPoint) {
                const dx = targetPoint.x - enemy.x, dy = targetPoint.y - enemy.y;
                if (dx < 0) enemy.facingX = -1;
                else if (dx > 0) enemy.facingX = 1;
                const distance = Math.sqrt(dx*dx + dy*dy);
                if (distance < enemy.currentSpeed * deltaTime) {
                    enemy.x = targetPoint.x;
                    enemy.y = targetPoint.y;
                    enemy.pathIndex++;
                    // 到达路径点时立即更新朝向
                    if (enemy.pathIndex < enemy.path.length) {
                        const nextDx = enemy.path[enemy.pathIndex].x - enemy.x;
                        if (nextDx < 0) enemy.facingX = -1;
                        else if (nextDx > 0) enemy.facingX = 1;
                    }
                    if (enemy.pathIndex >= enemy.path.length) {
                        enemy.pathIndex = enemy.path.length;
                    }
                } else {
                    const angle = Math.atan2(dy, dx);
                    enemy.x += Math.cos(angle) * enemy.currentSpeed * deltaTime;
                    enemy.y += Math.sin(angle) * enemy.currentSpeed * deltaTime;
                }
            } else {
                enemy.attackTimer -= deltaTime;
                if (enemy.attackTimer <= 0) {
                    const damage = enemy.attackDamage;
                    crystal.health -= damage;
                    addDamageText(crystal.x, crystal.y - 10, `-${damage}`, '#FF0000');
                    enemy.attackTimer = enemy.attackCooldown;
                    if (crystal.health <= 0) {
                        crystal.health = 0;
                        gameRunning = false;
                        gameState.crystalDestroyed = true;
                        if (!gameState.isGameOver) showGameResult(gameState.currentLevel, currentWave);
                    }
                }
            }
        }

        // ===== 清理被标记删除的tower（安全地延迟删除） =====
        let tw = 0;
        for (let ti = 0; ti < towers.length; ti++) {
            if (!towers[ti]._pendingRemove) {
                if (tw !== ti) towers[tw] = towers[ti];
                tw++;
            }
        }
        towers.length = tw;

        // ===== 水晶生成友方小兵 =====
        // ===== 从营地定时生成护卫 =====
        if (gameRunning && gameState.gameStarted && friendCount < FRIENDS_CAPACITY) {
            for (let ci = 0; ci < campCount; ci++) {
                const camp = camps[ci];
                if (!camp || !camp.alive) continue;
                camp.spawnTimer = (camp.spawnTimer || 0) + deltaTime;
                if (camp.spawnTimer >= camp.spawnInterval && friendCount < FRIENDS_CAPACITY) {
                    camp.spawnTimer = 0;
                    // 每类兵种最多存活 3 个，死亡后再补充
                    let aliveOfType = 0;
                    for (let fi = 0; fi < friendCount; fi++) {
                        const f = friendlies[fi];
                        if (f && f.alive && f.type === camp.unitType) aliveOfType++;
                    }
                    if (aliveOfType < 3) {
                        spawnFriendlyForCamp(camp);
                    }
                    if (friendCount >= FRIENDS_CAPACITY) break;
                }
            }
        }

        // ===== 更新友方小兵 =====
        for (let i = 0; i < friendCount; i++) {
            const friend = friendlies[i];
            if (!friend || !friend.alive) continue;

            // 圣骑士：每5秒范围治疗（加血中不触发，但战斗中可以触发）
            if (friend.type === 'paladin' && !friend.healing) {
                if (friend.healTimer === undefined) friend.healTimer = 0;
                friend.healTimer += deltaTime;
                if (friend.healTimer >= 5.0) {
                    friend.healTimer = 0;
                    const healAmount = 20 + (unitUpgradeLevels.paladin || 0) * 8;
                    const HEAL_RADIUS = 100;
                    // 先检查范围内是否有不满血的单位（包括自己）
                    let needHeal = false;
                    for (let hi = 0; hi < friendCount; hi++) {
                        const target = friendlies[hi];
                        if (!target || !target.alive) continue;
                        const dx = target.x - friend.x, dy = target.y - friend.y;
                        if (Math.sqrt(dx*dx + dy*dy) <= HEAL_RADIUS && target.health < target.maxHealth) {
                            needHeal = true;
                            break;
                        }
                    }
                    if (needHeal) {
                        friend.healing = true;
                        friend.healAnimTimer = 0;
                        friend.healDamageDelay = 0.25;  // 延迟0.25s后加血生效+显示数字
                        friend.healAmount = 20 + (unitUpgradeLevels.paladin || 0) * 8;
                        // 先加血和显示文字，延迟到 healDamageDelay 为0时执行
                    }
                }
            }
            
            // 圣骑士加血延迟出伤
            if (friend.type === 'paladin' && friend.healing && friend.healDamageDelay > 0) {
                friend.healDamageDelay -= deltaTime;
                if (friend.healDamageDelay <= 0) {
                    friend.healDamageDelay = 0;
                    const HEAL_RADIUS = 100;
                    for (let hi = 0; hi < friendCount; hi++) {
                        const target = friendlies[hi];
                        if (!target || !target.alive) continue;
                        const dx = target.x - friend.x, dy = target.y - friend.y;
                        if (Math.sqrt(dx*dx + dy*dy) <= HEAL_RADIUS) {
                            if (target.health < target.maxHealth) {
                                target.health = Math.min(target.maxHealth, target.health + friend.healAmount);
                            }
                            addDamageText(target.x, target.y - 15, `+${friend.healAmount}`, '#55FF55');
                        }
                    }
                }
            }

            // 动态查找所属营地等级（营地升级后已有的护卫也同步生效）
            let campLevel = 0;
            if (friend.campX !== undefined && friend.campX !== null) {
                for (let ci = 0; ci < campCount; ci++) {
                    if (camps[ci] && camps[ci].x === friend.campX && camps[ci].y === friend.campY) {
                        campLevel = camps[ci].upgradeLevel || 0;
                        break;
                    }
                }
            } else {
                campLevel = friend.campLevel !== undefined ? friend.campLevel : (unitUpgradeLevels[friend.type] || 0);
            }
            const maxTargets = (friend.type === 'archer') ? (1 + campLevel) :
                (friend.type === 'mage') ? Math.min(5, 1 + campLevel) :
                (friend.type === 'swordsman') ? 3 : 1;
            
            let targets = [];
            for (let j = 0; j < enemyCount; j++) {
                const enemy = enemies[j];
                if (!enemy || !enemy.alive) continue;
                const dx = enemy.x - friend.x;
                const dy = enemy.y - friend.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < friend.attackRange) {
                    targets.push(enemy);
                }
            }
            
            targets.sort((a, b) => a.health - b.health);
            const finalTargets = targets.slice(0, maxTargets);

            if (friend.attackTimer > 0) friend.attackTimer -= deltaTime;

            // 强制移动到标记点：优先于战斗 AI
            if (friend.obeyMarker && friend.campX !== undefined && friend.campX !== null) {
                let campRef = null;
                for (let ci = 0; ci < campCount; ci++) {
                    if (camps[ci] && camps[ci].x === friend.campX && camps[ci].y === friend.campY) { campRef = camps[ci]; break; }
                }
                const gx = friend.campMarkerX !== null && friend.campMarkerY !== null ? friend.campMarkerX : (campRef && campRef.markerX !== null ? campRef.markerX : friend.campX);
                const gy = friend.campMarkerY !== null && friend.campMarkerY !== null ? friend.campMarkerY : (campRef && campRef.markerY !== null ? campRef.markerY : friend.campY);
                const dxC = friend.x - gx, dyC = friend.y - gy;
                const distToCenter = Math.sqrt(dxC * dxC + dyC * dyC);
                if (distToCenter > 10) {
                    const angle = Math.atan2(gy - friend.y, gx - friend.x);
                    friend.x += Math.cos(angle) * friend.currentSpeed * deltaTime;
                    friend.y += Math.sin(angle) * friend.currentSpeed * deltaTime;
                    friend.state = 'movingToMarker';
                } else {
                    friend.obeyMarker = false;
                    friend.fighting = false;
                    friend.targetEnemy = null;
                    friend.state = 'patrolling';
                    friend.patrolTimer = 0;
                }
                // 跳过后续所有战斗/巡逻 AI
                // 更新朝向和动画帧
                // 根据目标方向或移动方向更新朝向
                const dxObey = friend.x - friend.lastX;
                if (Math.abs(dxObey) > 0.5) {
                    friend.facingX = dxObey > 0 ? 1 : -1;
                }
                friend.lastX = friend.x;
                if (friend.type === 'farmer') {
                    friend.animTimer += deltaTime;
                    if (friend.animTimer > 0.1) { friend.animTimer = 0; friend.animFrame = (friend.animFrame + 1) % FARMER_FRAME_COUNT; }
                }
                if (friend.type === 'infantry') {
                    if (friend.fighting) { friend.attackAnimTimer += deltaTime; if (friend.attackAnimTimer > friend.attackCooldown) friend.attackAnimTimer = friend.attackCooldown; }
                    else { friend.attackAnimTimer = 0; }
                    friend.animTimer += deltaTime;
                    if (friend.animTimer > 0.05) { friend.animTimer = 0; friend.animFrame = (friend.animFrame + 1) % INFANTRY_FRAME_COUNT; }
                }
                if (friend.type === 'archer') {
                    friend.animTimer += deltaTime;
                    if (friend.animTimer > 0.08) { friend.animTimer = 0; friend.animFrame = (friend.animFrame + 1) % ARCHER_FRAME_COUNT; }
                }
                if (friend.type === 'knight') {
                    friend.animTimer += deltaTime;
                    if (friend.animTimer > 0.05) { friend.animTimer = 0; friend.animFrame = (friend.animFrame + 1) % KNIGHT_FRAME_COUNT; }
                }
                if (friend.type === 'mage') {
                    friend.animTimer += deltaTime;
                    if (friend.animTimer > 0.2) { friend.animTimer = 0; friend.animFrame = (friend.animFrame + 1) % MAGE_FRAME_COUNT; }
                }
                if (friend.type === 'swordsman') {
                    friend.animTimer += deltaTime;
                    if (friend.animTimer > 0.1) { friend.animTimer = 0; friend.animFrame = (friend.animFrame + 1) % SWORDSMAN_FRAME_COUNT; }
                }
                if (friend.type === 'gunner') {
                    friend.animTimer += deltaTime;
                    if (friend.animTimer > 0.12) { friend.animTimer = 0; friend.animFrame = (friend.animFrame + 1) % GUNNER_FRAME_COUNT; }
                }
                if (friend.type === 'sniper') {
                    friend.animTimer += deltaTime;
                    if (friend.animTimer > 0.08) { friend.animTimer = 0; friend.animFrame = (friend.animFrame + 1) % SNIPER_FRAME_COUNT; }
                }
                if (friend.type === 'paladin') {
                    if (friend.healing) {
                        friend.healAnimTimer += deltaTime;
                        const healFrameDuration = 0.067;
                        if (friend.healAnimTimer >= healFrameDuration * PALADIN_HEAL_FRAME_COUNT) {
                            friend.healing = false;
                            friend.healAnimTimer = 0;
                        }
                    } else {
                        friend.animTimer += deltaTime;
                        if (friend.animTimer > 0.1) { friend.animTimer = 0; friend.animFrame = (friend.animFrame + 1) % PALADIN_FRAME_COUNT; }
                    }
                }
                if (friend.health <= 0) { addGuardDeath(friend.x, friend.y); friend.alive = false; }
                continue;
            }

            if (finalTargets.length > 0 && !(friend.type === 'paladin' && friend.healing)) {
                friend.state = 'fighting';
                friend.fighting = true;
                friend.targetEnemy = finalTargets[0];
                // 立即更新朝向面对目标
                const dxFirstTarget = finalTargets[0].x - friend.x;
                if (Math.abs(dxFirstTarget) > 2) friend.facingX = dxFirstTarget > 0 ? 1 : -1;
                // 近战攻击动画计时（在 continue 之前更新）
                if (friend.type === 'farmer' || friend.type === 'infantry' || friend.type === 'archer' || friend.type === 'knight' || friend.type === 'mage' || friend.type === 'swordsman' || friend.type === 'paladin' || friend.type === 'sniper' || friend.type === 'gunner') friend.attackAnimTimer += deltaTime;
                
                if (friend.attackTimer <= 0 && !(friend.damageDelay !== undefined && friend.damageDelay > 0)) {
                    // 重置攻击动画从头播放
                    if (friend.type === 'farmer' || friend.type === 'infantry' || friend.type === 'archer' || friend.type === 'knight' || friend.type === 'mage' || friend.type === 'swordsman' || friend.type === 'paladin' || friend.type === 'sniper' || friend.type === 'gunner') {
                        friend.attackAnimTimer = 0;
                    }
                    if (friend.type === 'swordsman') friend.delayedTargets = [];  // 清除旧目标
                    for (const targetEnemy of finalTargets) {
                        if (friend.type === 'archer') {
                            // 弓手：延迟0.4秒后发射，存储所有目标
                            if (!friend.delayedTargets) friend.delayedTargets = [];
                            friend.delayedTargets.push(targetEnemy);
                            friend.damageDelay = 0.4;
                        } else if (friend.type === 'gunner') {
                            // 机枪兵：延迟0.25秒后发射，存储所有目标
                            if (!friend.delayedTargets) friend.delayedTargets = [];
                            friend.delayedTargets.push(targetEnemy);
                            friend.damageDelay = 0.25;
                        } else if (friend.type === 'sniper') {
                            // 狙击手：延迟0.5秒后发射，存储所有目标
                            if (!friend.delayedTargets) friend.delayedTargets = [];
                            friend.delayedTargets.push(targetEnemy);
                            friend.damageDelay = 0.5;
                        } else if (friend.type === 'mage') {
                            // 法师：存下所有目标，延迟1秒后发射
                            if (!friend.delayedTargets) friend.delayedTargets = [];
                            friend.delayedTargets.push(targetEnemy);
                            friend.damageDelay = 1.0;
                        } else if (friend.type !== 'farmer' && friend.type !== 'infantry' && friend.type !== 'knight' && friend.type !== 'swordsman' && friend.type !== 'paladin') {
                            // 其他兵种直接出伤害
                            addGuardExplosion(targetEnemy.x, targetEnemy.y); applyFriendDamage(friend, targetEnemy);
                        } else if (friend.type === 'knight') {
                            // 骑士：延迟0.5秒后出伤
                            friend.delayedTarget = targetEnemy;
                            friend.damageDelay = 0.5;
                        } else if (friend.type === 'swordsman') {
                            // 剑客：存下所有目标，延迟1秒后范围出伤
                            friend.delayedTargets.push(targetEnemy);
                            friend.damageDelay = 1.0;
                        } else if (friend.type === 'infantry') {
                            // 步兵：延迟0.5秒后出伤
                            friend.delayedTarget = targetEnemy;
                            friend.damageDelay = 0.5;
                        } else if (friend.type === 'farmer') {
                            // 农民：延迟0.25秒后出伤
                            friend.delayedTarget = targetEnemy;
                            friend.damageDelay = 0.25;
                        } else {
                            // 其他（圣骑士等）：延迟0.5秒后出伤
                            friend.delayedTarget = targetEnemy;
                            friend.damageDelay = 0.5;
                        }
                    }
                    friend.attackTimer = friend.attackCooldown; // 立即进入冷却，防止重复触发
                }
                
                // 延迟出伤/发射：农民/步兵/弓手/骑士/魔法师/剑客
                if (friend.damageDelay !== undefined && friend.damageDelay > 0) {
                    friend.damageDelay -= deltaTime;
                    if (friend.damageDelay <= 0) {
                        friend.damageDelay = 0;
                        if (friend.type === 'swordsman' && friend.delayedTargets) {
                            for (let ti = 0; ti < friend.delayedTargets.length; ti++) {
                                const t = friend.delayedTargets[ti];
                                if (t && t.alive) { addGuardExplosion(t.x, t.y); applyFriendDamage(friend, t); }
                            }
                            friend.delayedTargets = [];
                        } else if (friend.delayedTargets && friend.delayedTargets.length > 0) {
                            for (let ti = 0; ti < friend.delayedTargets.length; ti++) {
                                const t = friend.delayedTargets[ti];
                                const tx = t && t.x !== undefined ? t.x : (friend.lastTargetX || friend.x + 100);
                                const ty = t && t.y !== undefined ? t.y : (friend.lastTargetY || friend.y);
                                if (friend.type === 'archer') addFriendShot('arrow', friend.x, friend.y, tx, ty, '#44DDFF', 900, true, friend, t);
                                else if (friend.type === 'mage') addFriendShot('magic', friend.x, friend.y, tx, ty, '#CC44FF', 420, true, friend, t);
                                else if (friend.type === 'sniper') addFriendShot('sniper', friend.x, friend.y, tx, ty, '#44FFDD', 800, true, friend, t);
                                else if (friend.type === 'gunner') addFriendShot('bullet', friend.x, friend.y, tx, ty, '#FF6644', 600, true, friend, t);
                            }
                            friend.delayedTargets = [];
                        } else if (friend.delayedTarget) {
                            const tx = friend.delayedTarget.x !== undefined ? friend.delayedTarget.x : (friend.lastTargetX || friend.x + 100);
                            const ty = friend.delayedTarget.y !== undefined ? friend.delayedTarget.y : (friend.lastTargetY || friend.y);
                            if (friend.type === 'archer') { addFriendShot('arrow', friend.x, friend.y, tx, ty, '#44DDFF', 900, true, friend, friend.delayedTarget); }
                            else if (friend.type === 'mage') { addFriendShot('magic', friend.x, friend.y, tx, ty, '#CC44FF', 420, true, friend, friend.delayedTarget); }
                            else if (friend.type === 'sniper') { addFriendShot('sniper', friend.x, friend.y, tx, ty, '#44FFDD', 800, true, friend, friend.delayedTarget); }
                            else if (friend.type === 'gunner') { addFriendShot('bullet', friend.x, friend.y, tx, ty, '#FF6644', 600, true, friend, friend.delayedTarget); }
                            else if (friend.delayedTarget.alive) { addGuardExplosion(tx, ty); applyFriendDamage(friend, friend.delayedTarget); }
                            friend.delayedTarget = null;
                        }
                    }
                }
                // 每帧更新朝向面对目标
                if (friend.targetEnemy && friend.targetEnemy.alive) {
                    const dxToTarget = friend.targetEnemy.x - friend.x;
                    if (Math.abs(dxToTarget) > 2) friend.facingX = dxToTarget > 0 ? 1 : -1;
                }
                continue;
            }
            
            // 战斗中根据目标方向更新朝向
            if (friend.targetEnemy && friend.targetEnemy.alive) {
                const dxToEnemy = friend.targetEnemy.x - friend.x;
                if (Math.abs(dxToEnemy) > 2) {
                    friend.facingX = dxToEnemy > 0 ? 1 : -1;
                }
            }
            friend.lastX = friend.x;
            // 2nd damage delay：独立于战斗状态，确保延迟伤害/子弹一定打出
            if (friend.damageDelay !== undefined && friend.damageDelay > 0) {
                friend.damageDelay -= deltaTime;
                if (friend.type === 'farmer' || friend.type === 'infantry' || friend.type === 'archer' || friend.type === 'knight' || friend.type === 'mage' || friend.type === 'swordsman' || friend.type === 'paladin' || friend.type === 'sniper' || friend.type === 'gunner') friend.attackAnimTimer += deltaTime;
                if (friend.damageDelay <= 0) {
                    friend.damageDelay = 0;
                    if (friend.type === 'swordsman' && friend.delayedTargets) {
                        for (let ti = 0; ti < friend.delayedTargets.length; ti++) {
                            const t = friend.delayedTargets[ti];
                            if (t && t.alive) { addGuardExplosion(t.x, t.y); applyFriendDamage(friend, t); }
                        }
                        friend.delayedTargets = [];
                    } else if (friend.delayedTargets && friend.delayedTargets.length > 0) {
                        for (let ti = 0; ti < friend.delayedTargets.length; ti++) {
                            const t = friend.delayedTargets[ti];
                            const tx = t && t.x !== undefined ? t.x : (friend.lastTargetX || friend.x + 100);
                            const ty = t && t.y !== undefined ? t.y : (friend.lastTargetY || friend.y);
                            if (friend.type === 'archer') addFriendShot('arrow', friend.x, friend.y, tx, ty, '#44DDFF', 900, true, friend, t);
                            else if (friend.type === 'mage') addFriendShot('magic', friend.x, friend.y, tx, ty, '#CC44FF', 420, true, friend, t);
                            else if (friend.type === 'sniper') addFriendShot('sniper', friend.x, friend.y, tx, ty, '#44FFDD', 800, true, friend, t);
                            else if (friend.type === 'gunner') addFriendShot('bullet', friend.x, friend.y, tx, ty, '#FF6644', 600, true, friend, t);
                        }
                        friend.delayedTargets = [];
                    } else if (friend.delayedTarget) {
                        const tx = friend.delayedTarget.x !== undefined ? friend.delayedTarget.x : (friend.lastTargetX || friend.x + 100);
                        const ty = friend.delayedTarget.y !== undefined ? friend.delayedTarget.y : (friend.lastTargetY || friend.y);
                        if (friend.type === 'archer') { addFriendShot('arrow', friend.x, friend.y, tx, ty, '#44DDFF', 900, true, friend, friend.delayedTarget); }
                        else if (friend.type === 'mage') { addFriendShot('magic', friend.x, friend.y, tx, ty, '#CC44FF', 420, true, friend, friend.delayedTarget); }
                        else if (friend.type === 'sniper') { addFriendShot('sniper', friend.x, friend.y, tx, ty, '#44FFDD', 800, true, friend, friend.delayedTarget); }
                        else if (friend.type === 'gunner') { addFriendShot('bullet', friend.x, friend.y, tx, ty, '#FF6644', 600, true, friend, friend.delayedTarget); }
                        else if (friend.delayedTarget.alive) { addGuardExplosion(tx, ty); applyFriendDamage(friend, friend.delayedTarget); }
                        friend.delayedTarget = null;
                    }
                }
            }
            
            // 修复：查找最近的敌人（用于 chase 和 patrol 逻辑）
            let nearestEnemy = null;
            let nearestDist = Infinity;
            for (let j = 0; j < enemyCount; j++) {
                const enemy = enemies[j];
                if (!enemy || !enemy.alive) continue;
                const dx = enemy.x - friend.x;
                const dy = enemy.y - friend.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < nearestDist) {
                    nearestDist = dist;
                    nearestEnemy = enemy;
                }
            }

            // 营地护卫模式：以营地为中心巡逻
            if (friend.campX !== undefined && friend.campX !== null) {
                // 从营地对象读取最新标记位置
                let campRef = null;
                for (let ci = 0; ci < campCount; ci++) {
                    if (camps[ci] && camps[ci].x === friend.campX && camps[ci].y === friend.campY) { campRef = camps[ci]; break; }
                }
                const gx = friend.campMarkerX !== null && friend.campMarkerY !== null ? friend.campMarkerX : (campRef && campRef.markerX !== null && campRef.markerY !== null ? campRef.markerX : friend.campX);
                const gy = friend.campMarkerX !== null && friend.campMarkerY !== null ? friend.campMarkerY : (campRef && campRef.markerX !== null && campRef.markerY !== null ? campRef.markerY : friend.campY);
                const GUARD_RADIUS = 80;
                const CHASE_RADIUS = 200;
                const dxC = friend.x - gx, dyC = friend.y - gy;
                const distToCenter = Math.sqrt(dxC * dxC + dyC * dyC);

                // 旧obeyMarker检查已被移除，统一放在上方处理
                // ===== 距离超限检测：任何状态下超出规定半径立即返回 =====
                const RETURN_RADIUS = GUARD_RADIUS * 0.85;
                if (distToCenter > GUARD_RADIUS && !(friend.state === 'returning')) {
                    friend.fighting = false; friend.targetEnemy = null;
                    friend.delayedTargets = []; friend.damageDelay = 0; friend.delayedTarget = null;
                    friend.state = 'returning'; friend.patrolTimer = 0;
                }

                if (friend.state === 'fighting') {
                    if (!friend.targetEnemy || !friend.targetEnemy.alive) {
                        friend.attackAnimTimer = 0; friend.fighting = false; friend.targetEnemy = null;
                        friend.delayedTargets = []; friend.damageDelay = 0; friend.delayedTarget = null;
                        friend.state = 'patrolling'; friend.patrolTimer = 0;
                    } else {
                        const dxE = friend.targetEnemy.x - friend.x;
                        const dyE = friend.targetEnemy.y - friend.y;
                        if (Math.sqrt(dxE*dxE + dyE*dyE) > friend.attackRange) {
                            // 超出射程：不追逐，直接完成当前攻击后切巡逻
                            if (friend.damageDelay !== undefined && friend.damageDelay > 0) {
                                // 远程攻击延迟未到，等伤害打出
                            } else if (friend.attackTimer <= 0 && (friend.type === 'farmer' || friend.type === 'infantry' || friend.type === 'knight' || friend.type === 'paladin')) {
                                addGuardExplosion(friend.targetEnemy.x, friend.targetEnemy.y); applyFriendDamage(friend, friend.targetEnemy);
                                friend.attackTimer = friend.attackCooldown;
                                friend.attackAnimTimer = 0; friend.fighting = false; friend.targetEnemy = null;
                                friend.state = 'patrolling'; friend.patrolTimer = 0;
                            } else if (friend.attackTimer <= 0 && (friend.type === 'archer' || friend.type === 'mage' || friend.type === 'sniper' || friend.type === 'gunner')) {
                                if (!friend.delayedTargets) friend.delayedTargets = [];
                                friend.delayedTargets.push(friend.targetEnemy);
                                friend.damageDelay = 0.01;
                                friend.attackTimer = friend.attackCooldown;
                            } else if (friend.type === 'swordsman') {
                                if (!friend.delayedTargets) friend.delayedTargets = [];
                                friend.delayedTargets.push(friend.targetEnemy);
                                friend.damageDelay = 0.01;
                                friend.attackTimer = friend.attackCooldown;
                            } else {
                                friend.fighting = false; friend.targetEnemy = null;
                                friend.state = 'patrolling'; friend.patrolTimer = 0;
                            }
                        }
                    }
                }

                if (friend.state !== 'fighting') {
                    if (friend.state === 'returning') {
                        const dxFromCenter = friend.x - gx, dyFromCenter = friend.y - gy;
                        if (Math.sqrt(dxFromCenter*dxFromCenter + dyFromCenter*dyFromCenter) > RETURN_RADIUS) {
                            const angle = Math.atan2(gy - friend.y, gx - friend.x);
                            friend.x += Math.cos(angle) * friend.currentSpeed * deltaTime;
                            friend.y += Math.sin(angle) * friend.currentSpeed * deltaTime;
                            friend.facingX = Math.cos(angle) > 0 ? 1 : -1;
                        } else {
                            friend.state = 'patrolling'; friend.patrolTimer = 0;
                        }
                    } else if (nearestEnemy && nearestEnemy.alive && nearestDist < CHASE_RADIUS && distToCenter < GUARD_RADIUS * 0.7) {
                        friend.state = 'chasing'; friend.targetEnemy = nearestEnemy;
                    } else if (friend.state !== 'chasing') {
                        if (distToCenter > GUARD_RADIUS * 0.6) {
                            const angle = Math.atan2(gy - friend.y, gx - friend.x);
                            friend.x += Math.cos(angle) * friend.currentSpeed * deltaTime;
                            friend.y += Math.sin(angle) * friend.currentSpeed * deltaTime;
                            friend.facingX = Math.cos(angle) > 0 ? 1 : -1;
                            friend.state = 'patrolling'; friend.patrolTimer = 0;
                        } else {
                            friend.patrolTimer += deltaTime;
                            if (friend.patrolTimer > 2) {
                                friend.patrolTimer = 0;
                                friend.patrolOffset = { x: (Math.random()-0.5)*GUARD_RADIUS*0.5, y: (Math.random()-0.5)*GUARD_RADIUS*0.5 };
                            }
                            const targetX = gx + friend.patrolOffset.x;
                            const targetY = gy + friend.patrolOffset.y;
                            const ddx = targetX - friend.x, ddy = targetY - friend.y;
                            if (Math.abs(ddx)+Math.abs(ddy) > 5) {
                                const angle = Math.atan2(ddy, ddx);
                                friend.x += Math.cos(angle) * friend.currentSpeed * deltaTime * 0.5;
                                friend.y += Math.sin(angle) * friend.currentSpeed * deltaTime * 0.5;
                                friend.facingX = Math.cos(angle) > 0 ? 1 : -1;
                            }
                            friend.state = 'patrolling';
                        }
                    }
                }
                if (friend.state === 'chasing' && friend.targetEnemy && friend.targetEnemy.alive) {
                    // 追敌超出 GUARD_RADIUS 就放弃，返回巡逻
                    const dxFromCenter = friend.x - gx, dyFromCenter = friend.y - gy;
                    if (Math.sqrt(dxFromCenter*dxFromCenter + dyFromCenter*dyFromCenter) > GUARD_RADIUS * 0.8) {
                        friend.targetEnemy = null; friend.state = 'returning'; friend.patrolTimer = 0;
                    } else {
                        const angle = Math.atan2(friend.targetEnemy.y - friend.y, friend.targetEnemy.x - friend.x);
                        friend.x += Math.cos(angle) * friend.currentSpeed * deltaTime;
                        friend.y += Math.sin(angle) * friend.currentSpeed * deltaTime;
                        friend.facingX = Math.cos(angle) > 0 ? 1 : -1;
                        const dxE = friend.targetEnemy.x - friend.x;
                        const dyE = friend.targetEnemy.y - friend.y;
                        if (Math.sqrt(dxE*dxE + dyE*dyE) <= friend.attackRange) friend.state = 'fighting';
                    }
                } else if (friend.state === 'chasing') {
                    friend.targetEnemy = null; friend.state = 'patrolling'; friend.patrolTimer = 0;
                }
            } else if (friend.centerGuard) {
                const GUARD_RADIUS = 90;
                const CHASE_RADIUS = 200;
                const cx = canvas.width / 2, cy = canvas.height / 2;
                const dxC = friend.x - cx, dyC = friend.y - cy;
                const distToCrystal = Math.sqrt(dxC * dxC + dyC * dyC);

                // ===== 距离超限检测 =====
                const GUARD_RETURN = GUARD_RADIUS * 0.85;
                if (distToCrystal > GUARD_RADIUS && !(friend.state === 'returning')) {
                    friend.fighting = false; friend.targetEnemy = null;
                    friend.delayedTargets = []; friend.damageDelay = 0; friend.delayedTarget = null;
                    friend.state = 'returning'; friend.patrolTimer = 0;
                }

                if (friend.state === 'fighting') {
                    if (!friend.targetEnemy || !friend.targetEnemy.alive) {
                        friend.attackAnimTimer = 0; friend.fighting = false;
                        friend.targetEnemy = null;
                        friend.delayedTargets = []; friend.damageDelay = 0; friend.delayedTarget = null;
                        friend.state = 'patrolling';
                        friend.patrolTimer = 0;
                    } else {
                        const dxE = friend.targetEnemy.x - friend.x;
                        const dyE = friend.targetEnemy.y - friend.y;
                        const distToTarget = Math.sqrt(dxE * dxE + dyE * dyE);
                        // 超出射程：不追逐，完成当前攻击后切巡逻
                        if (distToTarget > friend.attackRange) {
                            if (friend.damageDelay !== undefined && friend.damageDelay > 0) {
                                // 远程延迟未到，等伤害打出
                            } else if (friend.attackTimer <= 0 && (friend.type === 'farmer' || friend.type === 'infantry' || friend.type === 'knight' || friend.type === 'paladin')) {
                                addGuardExplosion(friend.targetEnemy.x, friend.targetEnemy.y); applyFriendDamage(friend, friend.targetEnemy);
                                friend.attackTimer = friend.attackCooldown;
                                friend.attackAnimTimer = 0; friend.fighting = false; friend.targetEnemy = null;
                                friend.state = 'patrolling'; friend.patrolTimer = 0;
                            } else if (friend.attackTimer <= 0 && (friend.type === 'archer' || friend.type === 'mage' || friend.type === 'sniper' || friend.type === 'gunner')) {
                                if (!friend.delayedTargets) friend.delayedTargets = [];
                                friend.delayedTargets.push(friend.targetEnemy);
                                friend.damageDelay = 0.01;
                                friend.attackTimer = friend.attackCooldown;
                            } else if (friend.type === 'swordsman') {
                                if (!friend.delayedTargets) friend.delayedTargets = [];
                                friend.delayedTargets.push(friend.targetEnemy);
                                friend.damageDelay = 0.01;
                                friend.attackTimer = friend.attackCooldown;
                            } else {
                                friend.fighting = false; friend.targetEnemy = null;
                                friend.state = 'patrolling'; friend.patrolTimer = 0;
                            }
                        }
                    }
                }

                if (friend.state !== 'fighting') {
                    if (friend.state === 'returning') {
                        const dxFromCenter = friend.x - cx, dyFromCenter = friend.y - cy;
                        if (Math.sqrt(dxFromCenter*dxFromCenter + dyFromCenter*dyFromCenter) > GUARD_RETURN) {
                            const angle = Math.atan2(cy - friend.y, cx - friend.x);
                            friend.x += Math.cos(angle) * friend.currentSpeed * deltaTime;
                            friend.y += Math.sin(angle) * friend.currentSpeed * deltaTime;
                        } else {
                            friend.state = 'patrolling'; friend.patrolTimer = 0;
                        }
                    } else if (nearestEnemy && nearestEnemy.alive && nearestDist < CHASE_RADIUS && distToCrystal < GUARD_RADIUS * 0.7) {
                        friend.state = 'chasing';
                        friend.targetEnemy = nearestEnemy;
                    } else if (friend.state !== 'chasing') {
                        if (distToCrystal > GUARD_RADIUS * 0.6) {
                            const angle = Math.atan2(cy - friend.y, cx - friend.x);
                            friend.x += Math.cos(angle) * friend.currentSpeed * deltaTime;
                            friend.y += Math.sin(angle) * friend.currentSpeed * deltaTime;
                            friend.state = 'patrolling';
                            friend.patrolTimer = 0;
                        } else {
                            friend.patrolTimer += deltaTime;
                            if (friend.patrolTimer > 2) {
                                friend.patrolTimer = 0;
                                friend.patrolOffset = {
                                    x: (Math.random() - 0.5) * GUARD_RADIUS * 0.5,
                                    y: (Math.random() - 0.5) * GUARD_RADIUS * 0.5
                                };
                            }
                            const targetX = cx + friend.patrolOffset.x;
                            const targetY = cy + friend.patrolOffset.y;
                            const ddx = targetX - friend.x;
                            const ddy = targetY - friend.y;
                            if (Math.abs(ddx) + Math.abs(ddy) > 5) {
                                const angle = Math.atan2(ddy, ddx);
                                friend.x += Math.cos(angle) * friend.currentSpeed * deltaTime * 0.5;
                                friend.y += Math.sin(angle) * friend.currentSpeed * deltaTime * 0.5;
                            }
                            friend.state = 'patrolling';
                        }
                    }
                }

                if (friend.state === 'chasing' && friend.targetEnemy && friend.targetEnemy.alive) {
                    const dxFromCenter = friend.x - cx, dyFromCenter = friend.y - cy;
                    if (Math.sqrt(dxFromCenter*dxFromCenter + dyFromCenter*dyFromCenter) > GUARD_RADIUS * 0.8) {
                        friend.targetEnemy = null; friend.state = 'returning'; friend.patrolTimer = 0;
                    } else {
                        const angle = Math.atan2(friend.targetEnemy.y - friend.y, friend.targetEnemy.x - friend.x);
                        friend.x += Math.cos(angle) * friend.currentSpeed * deltaTime;
                        friend.y += Math.sin(angle) * friend.currentSpeed * deltaTime;
                        friend.facingX = Math.cos(angle) > 0 ? 1 : -1;
                        const dxE = friend.targetEnemy.x - friend.x;
                        const dyE = friend.targetEnemy.y - friend.y;
                        const distToTarget = Math.sqrt(dxE * dxE + dyE * dyE);
                        if (distToTarget <= friend.attackRange) friend.state = 'fighting';
                    }
                } else if (friend.state === 'chasing') {
                    friend.targetEnemy = null;
                    friend.state = 'patrolling';
                    friend.patrolTimer = 0;
                }
            } else {
                if (friend.state === 'moving') {
                    if (friend.path && friend.pathIndex >= 0) {
                        const targetPoint = friend.path[friend.pathIndex];
                        const dx = targetPoint.x - friend.x;
                        const dy = targetPoint.y - friend.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);

                        if (distance < friend.currentSpeed * deltaTime) {
                            friend.x = targetPoint.x;
                            friend.y = targetPoint.y;
                            friend.pathIndex--;

                            if (friend.pathIndex < friend.patrolIndex) {
                                setFriendPatrolCenter(friend);
                                friend.pathIndex = friend.patrolIndex;
                                if (friend.patrolHoldX !== undefined && friend.patrolHoldY !== undefined) {
                                    friend.x = friend.patrolHoldX;
                                    friend.y = friend.patrolHoldY;
                                }
                                friend.state = 'patrolling';
                                friend.patrolTimer = 0;
                            }
                        } else {
                            const angle = Math.atan2(dy, dx);
                            friend.x += Math.cos(angle) * friend.currentSpeed * deltaTime;
                            friend.y += Math.sin(angle) * friend.currentSpeed * deltaTime;
                        }
                    } else {
                        friend.state = 'patrolling';
                        friend.patrolTimer = 0;
                    }
                }

                if (friend.state === 'chasing') {
                    if (nearestEnemy && nearestEnemy.alive && nearestDist > friend.attackRange) {
                        const angle = Math.atan2(nearestEnemy.y - friend.y, nearestEnemy.x - friend.x);
                        friend.x += Math.cos(angle) * friend.currentSpeed * deltaTime;
                        friend.y += Math.sin(angle) * friend.currentSpeed * deltaTime;
                        friend.targetEnemy = nearestEnemy;
                    } else if (!nearestEnemy || !nearestEnemy.alive) {
                        friend.targetEnemy = null;
                        friend.fighting = false;
                        if (friend.path && friend.pathIndex > friend.patrolIndex) {
                            friend.state = 'moving';
                        } else {
                            friend.state = 'patrolling';
                            friend.patrolTimer = 0;
                        }
                    }
                }

                if (friend.state === 'patrolling') {
                    friend.patrolTimer += deltaTime;
                }
            }

            if (friend.state === 'fighting' && (!friend.targetEnemy || !friend.targetEnemy.alive)) {
                friend.fighting = false;
                friend.targetEnemy = null;
                if (friend.centerGuard) {
                    friend.state = 'patrolling';
                    friend.patrolTimer = 0;
                } else if (friend.campX !== undefined && friend.campX !== null) {
                    friend.state = 'patrolling';
                    friend.patrolTimer = 0;
                } else if (friend.path && friend.pathIndex > friend.patrolIndex) {
                    friend.state = 'moving';
                } else {
                    friend.state = 'patrolling';
                    friend.patrolTimer = 0;
                }
            }

            // 更新朝向和动画帧
            // 根据目标方向或移动方向更新朝向
            if (friend.targetEnemy && friend.targetEnemy.alive) {
                const dxToTarget = friend.targetEnemy.x - friend.x;
                if (Math.abs(dxToTarget) > 2) {
                    friend.facingX = dxToTarget > 0 ? 1 : -1;
                }
            } else {
                const dxMove = friend.x - friend.lastX;
                if (Math.abs(dxMove) > 0.5) {
                    friend.facingX = dxMove > 0 ? 1 : -1;
                }
            }
            friend.lastX = friend.x;
            if (friend.type === 'farmer') {
                if (friend.fighting) {
                    friend.attackAnimTimer += deltaTime;
                } else {
                    friend.attackAnimTimer = 0;
                }
                friend.animTimer += deltaTime;
                if (friend.animTimer > 0.1) {
                    friend.animTimer = 0;
                    friend.animFrame = (friend.animFrame + 1) % FARMER_FRAME_COUNT;
                }
            }
            if (friend.type === 'infantry') {
                if (friend.fighting) {
                    friend.attackAnimTimer += deltaTime;
                    if (friend.attackAnimTimer > friend.attackCooldown) friend.attackAnimTimer = friend.attackCooldown;
                } else {
                    friend.attackAnimTimer = 0;
                }
                friend.animTimer += deltaTime;
                if (friend.animTimer > 0.05) {
                    friend.animTimer = 0;
                    friend.animFrame = (friend.animFrame + 1) % INFANTRY_FRAME_COUNT;
                }
            }
            if (friend.type === 'archer') {
                if (friend.fighting) {
                    friend.attackAnimTimer += deltaTime;
                } else {
                    friend.attackAnimTimer = 0;
                    friend.animTimer += deltaTime;
                    if (friend.animTimer > 0.08) {
                        friend.animTimer = 0;
                        friend.animFrame = (friend.animFrame + 1) % ARCHER_FRAME_COUNT;
                    }
                }
            }
            if (friend.type === 'knight') {
                if (friend.fighting) {
                    friend.attackAnimTimer += deltaTime;
                } else {
                    friend.attackAnimTimer = 0;
                    friend.animTimer += deltaTime;
                    if (friend.animTimer > 0.05) {
                        friend.animTimer = 0;
                        friend.animFrame = (friend.animFrame + 1) % KNIGHT_FRAME_COUNT;
                    }
                }
            }
            if (friend.type === 'mage') {
                if (friend.fighting) {
                    friend.attackAnimTimer += deltaTime;
                } else {
                    friend.attackAnimTimer = 0;
                    friend.animTimer += deltaTime;
                    if (friend.animTimer > 0.2) {
                        friend.animTimer = 0;
                        friend.animFrame = (friend.animFrame + 1) % MAGE_FRAME_COUNT;
                    }
                }
            }
            if (friend.type === 'swordsman') {
                friend.animTimer += deltaTime;
                if (friend.animTimer > 0.1) {
                    friend.animTimer = 0;
                    friend.animFrame = (friend.animFrame + 1) % SWORDSMAN_FRAME_COUNT;
                }
            }
            if (friend.type === 'gunner') {
                friend.animTimer += deltaTime;
                if (friend.animTimer > 0.12) {
                    friend.animTimer = 0;
                    friend.animFrame = (friend.animFrame + 1) % GUNNER_FRAME_COUNT;
                }
            }
            if (friend.type === 'sniper') {
                friend.animTimer += deltaTime;
                if (friend.animTimer > 0.08) {
                    friend.animTimer = 0;
                    friend.animFrame = (friend.animFrame + 1) % SNIPER_FRAME_COUNT;
                }
            }
            if (friend.type === 'paladin') {
                // 加血动画计时
                if (friend.healing) {
                    friend.healAnimTimer += deltaTime;
                    const healFrameDuration = 0.067;
                    if (friend.healAnimTimer >= healFrameDuration * PALADIN_HEAL_FRAME_COUNT) {
                        friend.healing = false;
                        friend.healAnimTimer = 0;
                    }
                }
                if (friend.fighting) {
                    friend.attackAnimTimer += deltaTime;
                } else {
                    friend.attackAnimTimer = 0;
                    friend.animTimer += deltaTime;
                    if (friend.animTimer > 0.1) {
                        friend.animTimer = 0;
                        friend.animFrame = (friend.animFrame + 1) % PALADIN_FRAME_COUNT;
                    }
                }
            }

            if (friend.health <= 0) { addGuardDeath(friend.x, friend.y); friend.alive = false; }
        }

        // 友方单位之间的自然分散，防止模型重叠
        for (let si = 0; si < friendCount; si++) {
            const a = friendlies[si];
            if (!a || !a.alive) continue;
            for (let sj = si + 1; sj < friendCount; sj++) {
                const b = friendlies[sj];
                if (!b || !b.alive) continue;
                const dx = a.x - b.x, dy = a.y - b.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const minDist = (a.type === b.type) ? 20 : 15;
                if (dist < minDist && dist > 0.1) {
                    const force = (minDist - dist) / minDist * 1.5;
                    const nx = dx / dist, ny = dy / dist;
                    a.x += nx * force;
                    a.y += ny * force;
                    b.x -= nx * force;
                    b.y -= ny * force;
                }
            }
        }

        // ===== 移除死亡友方小兵 =====
        let fw = 0;
        for (let i = 0; i < friendCount; i++) {
            if (friendlies[i].alive) {
                if (fw !== i) friendlies[fw] = friendlies[i];
                fw++;
            }
        }
        for (let i = fw; i < friendCount; i++) friendlies[i] = null;
        friendCount = fw;

        // ===== 波次生成系统 =====
        if (gameRunning && waveActive && spawnQueueIndex < spawnQueue.length) {
            // 确保路径已加载
            if (cachedActivePaths.length === 0) {
                console.warn('⚠️ cachedActivePaths empty, reloading...');
                const indices = getActivePathIndices(gameState.currentLevel);
                cachedActivePaths = indices.map(idx => pathPool[idx]);
            }
            const activePaths = cachedActivePaths;
            const pathsLen = activePaths.length;
            if (pathsLen > 0) {
                while (spawnQueueIndex < spawnQueue.length) {
                    const spawnEvent = spawnQueue[spawnQueueIndex];
                    if (spawnTimer >= spawnEvent.delay) {
                        const pathIndex = Math.floor(Math.random() * pathsLen);
                        const selectedPath = activePaths[pathIndex];
                        const enemy = createEnemyFromPool(spawnEvent, selectedPath.waypoints);
                        if (enemy && enemyCount < ENEMIES_CAPACITY) {
                            // 关卡5：敌人从地图边缘随机产生
                            if (gameState.currentLevel === 5) {
                                const side = Math.floor(Math.random() * 4);
                                const edgeMargin = 20;
                                if (side === 0) { // 上
                                    enemy.x = Math.random() * canvas.width;
                                    enemy.y = edgeMargin;
                                } else if (side === 1) { // 下
                                    enemy.x = Math.random() * canvas.width;
                                    enemy.y = canvas.height - edgeMargin;
                                } else if (side === 2) { // 左
                                    enemy.x = edgeMargin;
                                    enemy.y = Math.random() * canvas.height;
                                } else { // 右
                                    enemy.x = canvas.width - edgeMargin;
                                    enemy.y = Math.random() * canvas.height;
                                }
                            }
                            enemies[enemyCount++] = enemy;
                            console.log(`✅ Enemy spawned. Total: ${enemyCount}. Type:`, spawnEvent.type);
                            if (enemy.isBoss) addAttack(enemy.x, enemy.y, 80, 80, 'rgba(255,0,0,0.3)', 0.5);
                        } else if (enemyCount >= ENEMIES_CAPACITY && gameRunning) {
                            gameRunning = false;
                            gameState.crystalDestroyed = true;
                            gameState.isGameOver = true;
                            gameState.lastResult = 'defeat';
                            showGameResult(gameState.currentLevel, currentWave);
                            break;
                        }
                        spawnQueueIndex++;
                    } else break;
                }
            } else {
                console.error('❌ No paths available after reload!');
            }
            spawnTimer += deltaTime;
            if (!waveSpawnComplete && spawnQueueIndex >= spawnQueue.length) {
                waveSpawnComplete = true;
                console.log('✅ Wave spawn complete. Total enemies:', enemyCount);
                startWaveCooldown();
            }
        }

        // ===== 波次冷却倒计时 =====
        if (gameRunning && waveCooldownActive && waveActive) {
            waveCooldownTimer -= deltaTime;
            if (waveCooldownTimer <= 0) {
                waveCooldownTimer = 0;
                waveCooldownActive = false;
                handleWaveComplete();
            }
        }

        // ===== 更新敌人死亡动画计时 =====
        for (let i = 0; i < enemyCount; i++) {
            const e = enemies[i];
            if (e.dying && !e.alive) {
                e.deathTimer -= deltaTime;
                if (e.deathTimer <= 0) {
                    e.dying = false;
                }
            }
        }

        // ===== 移除死亡敌人 =====
        removeDeadEnemies();

        // ===== 上限检查（已由 update 函数处理，此处不再重复触发） =====

        // ===== 波次完成检测 =====
        if (gameRunning && isWaveComplete()) {
            handleWaveComplete();
        }

        // ===== 更新经验宝石 =====
        updateExpGems(deltaTime);

        // ===== 更新伤害文本 =====
        removeExpiredDamageTexts();

        // ===== 更新HUD =====
        updateHUD();

        // ===== 实时更新购买按钮状态 =====
        updateButtonStyles();
        
        // ★ 实时刷新玩家属性预览弹窗（如果已打开）
        refreshPlayerPreviewStats();
    }

    // 辅助函数：更新所有购买按钮的视觉样式
    function updateButtonStyles() {
        // 更新防御塔和陷阱按钮
        const assetButtons = document.querySelectorAll('.btn-group button');
        assetButtons.forEach(btn => {
            const cost = parseInt(btn.dataset.cost);
            if (cost > 0) {
                if (playerGold >= cost) {
                    btn.classList.add('can-buy');
                    btn.classList.remove('cant-buy');
                } else {
                    btn.classList.add('cant-buy');
                    btn.classList.remove('can-buy');
                }
            }
        });

        // 更新左侧兵种按钮
        const unitButtons = document.querySelectorAll('.unit-btn');
        unitButtons.forEach(btn => {
            const type = btn.dataset.type;
            const unit = UNITS[type];
            if (unit) {
                const isUnlocked = purchasedUnits[type];
                if (!isUnlocked) {
                    if (playerGold >= unit.cost) {
                        btn.classList.add('can-buy');
                        btn.classList.remove('cant-buy');
                    } else {
                        btn.classList.add('cant-buy');
                        btn.classList.remove('can-buy');
                    }
                } else {
                    btn.classList.remove('cant-buy');
                    btn.classList.add('can-buy');
                }
            }
        });

        // 动态更新兵种升级面板按钮
        const unitUpgradePanel = document.getElementById('unitUpgradePanel');
        if (unitUpgradePanel && unitUpgradePanel.style.display === 'block' && selectedUnitKey) {
            const unit = UNITS[selectedUnitKey];
            if (unit) {
                const upgradeBtn = document.getElementById('unitUpgradeBtn');
                const descEl = document.getElementById('unitUpgradeDesc');
                if (descEl) descEl.textContent = `当前金币: ${playerGold}`;
                const isUnlocked = purchasedUnits[selectedUnitKey];
                if (!isUnlocked) {
                    if (upgradeBtn) upgradeBtn.disabled = playerGold < unit.cost;
                } else {
                    const upgradeLvl = unitUpgradeLevels[selectedUnitKey] || 0;
                    const upgradeCost = unit.upgradeCost * (upgradeLvl + 1);
                    if (upgradeBtn && upgradeLvl < MAX_UPGRADE_LEVEL) {
                        upgradeBtn.disabled = playerGold < upgradeCost;
                    }
                }
            }
        }
    }

    // ================== 绘制深渊大门 ==================
    function drawAbyssGates() {
        if (!cachedActivePaths || cachedActivePaths.length === 0) return;
        const now = Date.now();
        const frameIdx = Math.floor(now / 100) % GATE_FRAME_COUNT;
        const frameImg = gateFrames[frameIdx];
        const frameReady = frameImg && frameImg.complete && frameImg.naturalWidth > 0;
        for (let p = 0; p < cachedActivePaths.length; p++) {
            const path = cachedActivePaths[p];
            const waypoints = path.waypoints;
            const gateX = waypoints[0].x;
            const gateY = waypoints[0].y;

            const pulse = Math.sin(now / 800 + p * 2.3) * 0.15 + 0.85;

            ctx.save();

            if (frameReady) {
                const size = 72;
                const radius = size / 2;
                ctx.save();
                ctx.beginPath();
                ctx.arc(gateX, gateY, radius, 0, Math.PI * 2);
                ctx.clip();
                ctx.drawImage(frameImg, gateX - radius, gateY - radius, size, size);
                ctx.restore();
            } else {
                ctx.shadowColor = 'purple';
                ctx.shadowBlur = 25 * pulse;
                ctx.fillStyle = `rgba(128, 0, 128, ${0.6 * pulse})`;
                ctx.beginPath();
                ctx.arc(gateX, gateY, 22, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;

                ctx.fillStyle = '#800080';
                ctx.beginPath();
                ctx.arc(gateX, gateY, 16, 0, Math.PI * 2);
                ctx.fill();

                ctx.strokeStyle = `rgba(180, 50, 255, ${pulse})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(gateX, gateY, 22, 0, Math.PI * 2);
                ctx.stroke();
            }

            ctx.restore();
        }
    }

    // ================== 绘制 ==================
    function draw() {
        if (!gameState || !gameState.gameStarted || !player) {
            if (!gameState) console.warn('⚠️ gameState is undefined');
            if (gameState && !gameState.gameStarted) console.warn('⚠️ gameState.gameStarted is false');
            if (!player) console.warn('⚠️ player is undefined');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#5EA05E';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            // 极淡网格
            ctx.strokeStyle = 'rgba(100,100,80,0.08)';
            ctx.lineWidth = 1;
            for (let x = 0; x <= canvas.width; x += GRID_SIZE) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,canvas.height); ctx.stroke(); }
            for (let y = 0; y <= canvas.height; y += GRID_SIZE) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(canvas.width,y); ctx.stroke(); }
            return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const level = gameState.currentLevel;
        // 关卡1：城市绿地广场风格
        if (level === 1) {
            for (let row = 0; row < ROWS; row++) {
                for (let col = 0; col < COLS; col++) {
                    const isOdd = (row + col) % 2 === 0;
                    ctx.fillStyle = isOdd ? '#6BAF6B' : '#5EA05E';
                    ctx.fillRect(col * GRID_SIZE, row * GRID_SIZE, GRID_SIZE, GRID_SIZE);
                }
            }
            const cx = canvas.width / 2, cy = canvas.height / 2;
            const plazaRadius = 80;
            const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, plazaRadius);
            grad.addColorStop(0, '#D4C8A8');
            grad.addColorStop(0.7, '#C0B490');
            grad.addColorStop(1, '#A89870');
            ctx.fillStyle = grad;
            ctx.beginPath(); ctx.arc(cx, cy, plazaRadius, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = 'rgba(100,90,70,0.25)';
            ctx.lineWidth = 1;
            for (let r = 10; r < plazaRadius; r += 12) {
                ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
            }
            const corners = [
                { x: 30, y: 30 }, { x: canvas.width - 30, y: 30 },
                { x: 30, y: canvas.height - 30 }, { x: canvas.width - 30, y: canvas.height - 30 }
            ];
            for (const c of corners) {
                ctx.fillStyle = '#8B6B4A';
                ctx.beginPath(); ctx.arc(c.x, c.y, 18, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#4A8B3A';
                ctx.beginPath(); ctx.arc(c.x, c.y, 12, 0, Math.PI * 2); ctx.fill();
                for (let p = 0; p < 6; p++) {
                    const angle = p / 6 * Math.PI * 2;
                    ctx.fillStyle = '#E8C87A';
                    ctx.beginPath(); ctx.arc(c.x + Math.cos(angle) * 14, c.y + Math.sin(angle) * 14, 3, 0, Math.PI * 2); ctx.fill();
                }
            }
            const lampPositions = [
                { x: 20, y: 320 }, { x: canvas.width - 20, y: 320 },
                { x: 380, y: 20 }, { x: 380, y: 580 },
                { x: 100, y: 100 }, { x: 700, y: 100 },
                { x: 100, y: 500 }, { x: 700, y: 500 },
            ];
            for (const lp of lampPositions) {
                ctx.fillStyle = '#555';
                ctx.fillRect(lp.x - 2, lp.y, 4, 14);
                ctx.fillStyle = '#FFE88A';
                ctx.shadowColor = '#FFE88A';
                ctx.shadowBlur = 12;
                ctx.beginPath(); ctx.arc(lp.x, lp.y - 2, 5, 0, Math.PI * 2); ctx.fill();
                ctx.shadowBlur = 0;
            }
            ctx.strokeStyle = 'rgba(100,100,80,0.08)';
            ctx.lineWidth = 1;
            for (let x = 0; x <= canvas.width; x += GRID_SIZE) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,canvas.height); ctx.stroke(); }
            for (let y = 0; y <= canvas.height; y += GRID_SIZE) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(canvas.width,y); ctx.stroke(); }
        // 关卡2：城市街道公园风格
        } else if (level === 2) {
            // —— 公园草地 ——
            for (let row = 0; row < ROWS; row++) {
                for (let col = 0; col < COLS; col++) {
                    const isOdd = (row + col) % 2 === 0;
                    ctx.fillStyle = isOdd ? '#7AB87A' : '#6DAD6D';
                    ctx.fillRect(col * GRID_SIZE, row * GRID_SIZE, GRID_SIZE, GRID_SIZE);
                }
            }
            // —— 花坛（四角+中心） ——
            const gardenBeds = [
                { x: 40, y: 40, r: 20 }, { x: canvas.width-40, y: 40, r: 20 },
                { x: 40, y: canvas.height-40, r: 20 }, { x: canvas.width-40, y: canvas.height-40, r: 20 },
                { x: canvas.width/2, y: canvas.height/2-40, r: 28 },
            ];
            for (const gb of gardenBeds) {
                ctx.fillStyle = '#8B6B4A';
                ctx.beginPath(); ctx.arc(gb.x, gb.y, gb.r, 0, Math.PI*2); ctx.fill();
                ctx.fillStyle = '#4A9A4A';
                ctx.beginPath(); ctx.arc(gb.x, gb.y, gb.r-5, 0, Math.PI*2); ctx.fill();
                for (let p = 0; p < 7; p++) {
                    const angle = p / 7 * Math.PI * 2;
                    ctx.fillStyle = p % 2 === 0 ? '#E8C87A' : '#FF9A9A';
                    ctx.beginPath(); ctx.arc(gb.x + Math.cos(angle)*(gb.r-3), gb.y + Math.sin(angle)*(gb.r-3), 3, 0, Math.PI*2); ctx.fill();
                }
            }
            // —— 极淡网格 ——
            ctx.strokeStyle = 'rgba(100,100,80,0.06)';
            ctx.lineWidth = 1;
            for (let x = 0; x <= canvas.width; x += GRID_SIZE) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,canvas.height); ctx.stroke(); }
            for (let y = 0; y <= canvas.height; y += GRID_SIZE) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(canvas.width,y); ctx.stroke(); }
        // 关卡3：雪地道路飘雪丧尸危机风格
        } else if (level === 3) {
            // —— 阴沉雪天基底 ——
            const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
            skyGrad.addColorStop(0, '#4A5058');
            skyGrad.addColorStop(0.3, '#606870');
            skyGrad.addColorStop(0.5, '#707880');
            skyGrad.addColorStop(0.7, '#808890');
            skyGrad.addColorStop(1, '#6A7278');
            ctx.fillStyle = skyGrad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            // —— 灰云层 ——
            ctx.fillStyle = 'rgba(80, 85, 95, 0.4)';
            for (let i = 0; i < 6; i++) {
                const cx = -40 + i * 160;
                const cy = 10 + (i % 3) * 30;
                ctx.beginPath();
                ctx.arc(cx, cy, 45, 0, Math.PI*2);
                ctx.arc(cx + 50, cy - 10, 38, 0, Math.PI*2);
                ctx.arc(cx + 90, cy + 5, 42, 0, Math.PI*2);
                ctx.arc(cx + 40, cy + 10, 35, 0, Math.PI*2);
                ctx.fill();
            }
            // —— 雪地基底 ——
            ctx.fillStyle = '#C8D0D0';
            ctx.fillRect(0, 280, canvas.width, canvas.height - 280);
            // 雪地起伏
            for (let i = 0; i < 30; i++) {
                const sx = (i * 35 + 7) % canvas.width;
                const sy = 280 + (i * 17 + 11) % (canvas.height - 280);
                ctx.fillStyle = `rgba(220, 228, 232, ${0.03 + (i%5)*0.015})`;
                ctx.beginPath(); ctx.arc(sx, sy, 8 + (i%4)*4, 0, Math.PI*2); ctx.fill();
            }
            // —— 飘雪粒子（60个动态雪花） ——
            if (!window._snowParticles_l3) {
                window._snowParticles_l3 = [];
                for (let i = 0; i < 60; i++) {
                    window._snowParticles_l3.push({
                        x: Math.random() * canvas.width,
                        y: Math.random() * canvas.height,
                        r: 1 + Math.random() * 3,
                        speed: 0.5 + Math.random() * 1.5,
                        wind: Math.random() * 0.5,
                        opacity: 0.3 + Math.random() * 0.7,
                        swing: Math.random() * Math.PI * 2,
                    });
                }
            }
            const snowP = window._snowParticles_l3;
            const now = Date.now() * 0.001;
            for (let i = 0; i < snowP.length; i++) {
                const s = snowP[i];
                if (!s) continue;
                s.swing += 0.02;
                s.x += s.wind + Math.sin(now + i) * 0.3;
                s.y += s.speed;
                if (s.y > canvas.height) { s.y = -5; s.x = Math.random() * canvas.width; }
                if (s.x < -5) s.x = canvas.width + 5;
                if (s.x > canvas.width + 5) s.x = -5;
                ctx.fillStyle = `rgba(255, 255, 255, ${s.opacity * 0.9})`;
                ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2); ctx.fill();
            }
            // —— 极淡网格 ——
            ctx.strokeStyle = 'rgba(180, 190, 195, 0.06)';
            ctx.lineWidth = 1;
            for (let x = 0; x <= canvas.width; x += GRID_SIZE) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,canvas.height); ctx.stroke(); }
            for (let y = 0; y <= canvas.height; y += GRID_SIZE) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(canvas.width,y); ctx.stroke(); }
        } else {
            const mapImg = levelMapImages[level];
            if (mapImg && mapImg.complete && mapImg.naturalWidth > 0) {
                ctx.drawImage(mapImg, 0, 0, canvas.width, canvas.height);
            } else {
                ctx.fillStyle = '#1a1a2e';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
        }

        // 放置模式
        if (placingTower && selectedAsset) {
            const isTrap = selectedAsset.type && String(selectedAsset.type).includes('Trap');
            const isCamp = selectedAsset._isCamp;
            for (let row = 0; row < ROWS; row++) {
                for (let col = 0; col < COLS; col++) {
                    const canPlace = isCamp ? canPlaceCampOnGrid(col, row) : canPlaceOnGrid(col, row, isTrap);
                    const isOccupied = isGridOccupiedByBuilding(col, row);
                    if (isOccupied) {
                        ctx.fillStyle = 'rgba(255,255,0,0.15)';
                        ctx.fillRect(col*GRID_SIZE, row*GRID_SIZE, GRID_SIZE, GRID_SIZE);
                    } else if (canPlace) {
                        ctx.fillStyle = 'rgba(0,255,0,0.08)';
                        ctx.fillRect(col*GRID_SIZE, row*GRID_SIZE, GRID_SIZE, GRID_SIZE);
                    } else {
                        ctx.fillStyle = 'rgba(255,0,0,0.15)';
                        ctx.fillRect(col*GRID_SIZE, row*GRID_SIZE, GRID_SIZE, GRID_SIZE);
                        ctx.strokeStyle = 'rgba(255,0,0,0.4)';
                        ctx.lineWidth = 1;
                        ctx.beginPath(); ctx.moveTo(col*GRID_SIZE+5,row*GRID_SIZE+5); ctx.lineTo(col*GRID_SIZE+GRID_SIZE-5,row*GRID_SIZE+GRID_SIZE-5);
                        ctx.moveTo(col*GRID_SIZE+GRID_SIZE-5,row*GRID_SIZE+5); ctx.lineTo(col*GRID_SIZE+5,row*GRID_SIZE+GRID_SIZE-5); ctx.stroke();
                    }
                }
            }
        }

        // 网格（仅非城市绿地广场关卡时显示）
        if (level !== 1 && level !== 2 && level !== 3) {
            ctx.strokeStyle = 'rgba(255,255,255,0.03)';
            ctx.lineWidth = 1;
            for (let x = 0; x < canvas.width; x += GRID_SIZE) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,canvas.height); ctx.stroke(); }
            for (let y = 0; y < canvas.height; y += GRID_SIZE) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(canvas.width,y); ctx.stroke(); }
        }

        // 路径 → 道路
        const activePaths = cachedActivePaths;
        for (let p = 0; p < activePaths.length; p++) {
            const path = activePaths[p], waypoints = path.waypoints;
            // —— 道路阴影 ——
            ctx.beginPath(); ctx.moveTo(waypoints[0].x, waypoints[0].y);
            for (let i = 1; i < waypoints.length; i++) ctx.lineTo(waypoints[i].x, waypoints[i].y);
            if (level === 1) {
                // 石板路面（城市道路）
                ctx.strokeStyle = '#7A7060';
                ctx.lineWidth = 20; ctx.stroke();
                ctx.strokeStyle = '#9A9080';
                ctx.lineWidth = 24; ctx.globalAlpha = 0.3; ctx.stroke(); ctx.globalAlpha = 1;
                ctx.setLineDash([10, 12]);
                ctx.strokeStyle = 'rgba(200,180,60,0.5)';
                ctx.lineWidth = 2; ctx.stroke();
                ctx.setLineDash([]);
                for (let i = 0; i < waypoints.length; i++) {
                    const wp = waypoints[i];
                    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
                    ctx.lineWidth = 2;
                    ctx.beginPath(); ctx.arc(wp.x, wp.y, 10, 0, Math.PI*2); ctx.stroke();
                    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
                    ctx.beginPath(); ctx.arc(wp.x, wp.y, 16, 0, Math.PI*2); ctx.stroke();
                }
            } else if (level === 2) {
                // 城市柏油路
                ctx.strokeStyle = '#3A3A44';
                ctx.lineWidth = 26; ctx.stroke();
                ctx.strokeStyle = '#555560';
                ctx.lineWidth = 20; ctx.globalAlpha = 0.5; ctx.stroke(); ctx.globalAlpha = 1;
                // 中央黄色双实线
                ctx.strokeStyle = 'rgba(255, 200, 50, 0.5)';
                ctx.lineWidth = 3; ctx.stroke();
                // 两侧白色虚线车道
                ctx.setLineDash([6, 12]);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
                ctx.lineWidth = 12; ctx.stroke();
                ctx.setLineDash([]);
                // 拐点 - 十字路口/井盖
                for (let i = 0; i < waypoints.length; i++) {
                    const wp = waypoints[i];
                    ctx.fillStyle = 'rgba(80,80,90,0.3)';
                    ctx.beginPath(); ctx.arc(wp.x, wp.y, 10, 0, Math.PI*2); ctx.fill();
                    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
                    ctx.lineWidth = 1;
                    ctx.beginPath(); ctx.arc(wp.x, wp.y, 6, 0, Math.PI*2); ctx.stroke();
                }
            } else if (level === 3) {
                // 积雪道路+血迹（丧尸雪地路）
                ctx.strokeStyle = '#D0D8D8';
                ctx.lineWidth = 30; ctx.stroke();
                ctx.strokeStyle = '#E0E8E8';
                ctx.lineWidth = 24; ctx.globalAlpha = 0.3; ctx.stroke(); ctx.globalAlpha = 1;
                // 中央泥雪混合
                ctx.strokeStyle = 'rgba(120, 130, 120, 0.15)';
                ctx.lineWidth = 12; ctx.stroke();
                // 血迹斑斑虚线
                ctx.setLineDash([4, 22]);
                ctx.strokeStyle = 'rgba(150, 20, 20, 0.1)';
                ctx.lineWidth = 3; ctx.stroke();
                ctx.setLineDash([]);
                // 拐点 - 血脚印/尸堆
                for (let i = 0; i < waypoints.length; i++) {
                    const wp = waypoints[i];
                    ctx.fillStyle = 'rgba(160, 30, 30, 0.08)';
                    ctx.beginPath(); ctx.arc(wp.x, wp.y, 14, 0, Math.PI*2); ctx.fill();
                    ctx.fillStyle = 'rgba(100, 110, 115, 0.1)';
                    ctx.beginPath(); ctx.ellipse(wp.x-3, wp.y-3, 3, 5, 0, 0, Math.PI*2); ctx.fill();
                    ctx.fillStyle = 'rgba(100, 110, 115, 0.1)';
                    ctx.beginPath(); ctx.ellipse(wp.x+3, wp.y-3, 3, 5, 0, 0, Math.PI*2); ctx.fill();
                }
            } else {
                ctx.strokeStyle = path.color;
                ctx.lineWidth = 6; ctx.stroke();
                for (let i = 0; i < waypoints.length; i++) {
                    ctx.beginPath(); ctx.arc(waypoints[i].x, waypoints[i].y, 4, 0, Math.PI*2);
                    ctx.fillStyle = path.color.replace('0.3','0.6'); ctx.fill();
                }
            }
        }

        // 深渊大门（在每个入口处绘制）
        drawAbyssGates();

        // HUD信息 已由 HTML 覆盖显示，不再在画布左上角重复绘制
        // 关卡/波次/剩余敌人信息已通过顶部 HUD 显示，无需再次在画布左上角重复绘制
        if (waveConfig) {
            if (waveConfig.isBossWave) {
                ctx.fillStyle = 'rgba(255,0,0,0.8)'; ctx.font = 'bold 16px Arial'; ctx.textAlign = 'left';
                ctx.fillText('⚠️ BOSS 波次 ⚠️', 10, 162);
            } else if (waveConfig.isEliteWave) {
                ctx.fillStyle = 'rgba(255,0,255,0.8)'; ctx.font = 'bold 14px Arial'; ctx.textAlign = 'left';
                ctx.fillText('🔥 精英波次', 10, 162);
            }
        }

        // 防御塔 - 先绘制选中高亮（在建筑之下）
        if (selectedTower) {
            const t = selectedTower;
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 3;
            ctx.shadowColor = '#FFD700';
            ctx.shadowBlur = 15;
            const boxSize = 40;
            ctx.strokeRect(t.x - boxSize/2, t.y - boxSize/2, boxSize, boxSize);
            ctx.shadowBlur = 0;

            // ---- 绘制选中的建筑范围圈（双色：基础范围 + 当前范围） ----
            let baseRadius = 0;
            let currentRadius = 0;
            let baseFillColor = 'rgba(200, 200, 200, 0.05)';
            let baseStrokeColor = 'rgba(200, 200, 200, 0.35)';
            let currentFillColor = '';
            let currentStrokeColor = '';
            let rangeLabel = '';

            if (t.type === 'arrowTower') {
                baseRadius = t.baseAttackRange;
                currentRadius = t.attackRange;
                currentFillColor = 'rgba(0, 255, 255, 0.10)';
                currentStrokeColor = 'rgba(0, 255, 255, 0.50)';
                baseStrokeColor = 'rgba(0, 255, 255, 0.20)';
                rangeLabel = '射程';
            } else if (t.type === 'flameTower') {
                baseRadius = t.baseAttackRange;
                currentRadius = t.attackRange;
                currentFillColor = 'rgba(255, 69, 0, 0.10)';
                currentStrokeColor = 'rgba(255, 69, 0, 0.50)';
                baseStrokeColor = 'rgba(255, 69, 0, 0.20)';
                rangeLabel = '射程';
            } else if (t.type === 'frostTower') {
                baseRadius = t.baseAttackRange;
                currentRadius = t.attackRange;
                currentFillColor = 'rgba(173, 216, 230, 0.12)';
                currentStrokeColor = 'rgba(173, 216, 230, 0.55)';
                baseStrokeColor = 'rgba(173, 216, 230, 0.22)';
                rangeLabel = '射程';
            } else if (t.type === 'laserTower') {
                baseRadius = t.baseAttackRange;
                currentRadius = t.attackRange;
                currentFillColor = 'rgba(255, 0, 255, 0.08)';
                currentStrokeColor = 'rgba(255, 0, 255, 0.45)';
                baseStrokeColor = 'rgba(255, 0, 255, 0.18)';
                rangeLabel = '射程';
            } else if (t.type === 'explosiveTrap') {
                baseRadius = 0;
                currentRadius = 0;
            } else if (t.type === 'iceSpikeTrap') {
                baseRadius = 0;
                currentRadius = 0;
            } else if (t.type === 'bounceTrap') {
                baseRadius = 0;
                currentRadius = 0;
            } else if (t.type === 'blockTrap') {
                baseRadius = 0;
                currentRadius = 0;
            }

            if (currentRadius > 0) {
                if (baseRadius > 0) {
                    ctx.beginPath();
                    ctx.arc(t.x, t.y, baseRadius, 0, Math.PI * 2);
                    ctx.fillStyle = baseFillColor;
                    ctx.fill();
                    ctx.strokeStyle = baseStrokeColor;
                    ctx.lineWidth = 1.5;
                    ctx.setLineDash([5, 5]);
                    ctx.stroke();
                    ctx.setLineDash([]);
                }
                ctx.beginPath();
                ctx.arc(t.x, t.y, currentRadius, 0, Math.PI * 2);
                ctx.fillStyle = currentFillColor;
                ctx.fill();
                ctx.strokeStyle = currentStrokeColor;
                ctx.lineWidth = 2;
                ctx.stroke();
                const isUpgraded = Math.abs(currentRadius - baseRadius) > 0.5;
                ctx.fillStyle = 'rgba(255, 255, 255, 0.60)';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                if (isUpgraded) {
                    ctx.fillStyle = 'rgba(200, 200, 200, 0.45)';
                    ctx.font = '10px Arial';
                    ctx.fillText(`基础: ${Math.round(baseRadius)} [+${Math.round(currentRadius - baseRadius)}]`, t.x, t.y - currentRadius - 28);
                }
                ctx.textAlign = 'start';
            }
        }

        for (const tower of towers) {
            ctx.fillStyle = tower.color;
            
            // === 金矿帧动画 ===
            if (tower.type === 'goldMine') {
                const frameCount = goldMineFrames.length;
                if (frameCount > 0 && goldMineFrames[0].complete) {
                    const frameIndex = Math.floor(Date.now() / 150) % frameCount;
                    const img = goldMineFrames[frameIndex];
                    ctx.save();
                    // 绘制金矿素材
                    const drawSize = 46;
                    ctx.drawImage(img, tower.x - drawSize/2 + 1, tower.y - drawSize/2, drawSize, drawSize);
                    ctx.restore();
                } else {
                    // 图片未加载完成时的后备绘制
                    ctx.fillStyle = '#FF3333';
                    ctx.fillRect(tower.x - tower.size/2, tower.y - tower.size/2, tower.size, tower.size);
                }
                // 升级星星
                if (tower.upgradeLevel > 0) {
                    const stars = formatUpgradeStars(tower.upgradeLevel);
                    ctx.fillStyle = '#FF3333';
                    ctx.font = 'bold 9px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText(stars, tower.x, tower.y + tower.size/2 + 18);
                    ctx.textAlign = 'start';
                }
                continue;
            }
            
            // === 机枪猫帧动画渲染（待机/攻击 + 左右朝向） ===
            if (tower.type === 'arrowTower') {
                const isAttacking = tower.attackAnimTimer > 0;
                const faceLeft = tower.target && tower.target.x < tower.x;
                if (tower.target) tower.lastFaceLeft = faceLeft;
                const liveFaceLeft = tower.target ? faceLeft : (tower.lastFaceLeft || false);
                const currentFaceLeft = isAttacking ? (tower.lastAttackFaceLeft ?? liveFaceLeft) : liveFaceLeft;
                let frames, frameIdx;
                if (isAttacking) {
                    const atkFrames = currentFaceLeft ? arrowTowerAttackFramesRight : arrowTowerAttackFrames;
                    if (atkFrames.length > 0 && atkFrames[0] && atkFrames[0].complete && atkFrames[0].naturalWidth > 0) {
                        frameIdx = Math.floor((tower.attackFrameTimer / ARROW_TOWER_ATTACK_FRAME_DELAY) % ARROW_TOWER_ATTACK_FRAME_COUNT);
                        frames = atkFrames;
                    } else {
                        frameIdx = Math.floor((arrowTowerFrameTimer / ARROW_TOWER_FRAME_DELAY) % ARROW_TOWER_FRAME_COUNT);
                        frames = currentFaceLeft ? arrowTowerFramesRight : arrowTowerFrames;
                    }
                } else {
                    frameIdx = Math.floor((arrowTowerFrameTimer / ARROW_TOWER_FRAME_DELAY) % ARROW_TOWER_FRAME_COUNT);
                    frames = currentFaceLeft ? arrowTowerFramesRight : arrowTowerFrames;
                }
                const img = frames[frameIdx];
                if (img && img.complete && img.naturalWidth > 0) {
                    const s = 52;
                    ctx.drawImage(img, tower.x - s/2, tower.y - s/2 - 6, s, s);
                } else {
                    ctx.fillStyle = tower.color;
                    ctx.fillRect(tower.x-tower.size/2, tower.y-tower.size/2, tower.size, tower.size);
                }
            // === 炮兵猫帧动画渲染（待机/攻击 + 左右朝向） ===
            } else if (tower.type === 'flameTower') {
                const isAttacking = tower.attackAnimTimer > 0;
                const faceLeft = tower.target && tower.target.x < tower.x;
                if (tower.target) tower.lastFaceLeft = faceLeft;
                const liveFaceLeft = tower.target ? faceLeft : (tower.lastFaceLeft || false);
                const currentFaceLeft = isAttacking ? (tower.lastAttackFaceLeft ?? liveFaceLeft) : liveFaceLeft;
                let frames, frameIdx;
                if (isAttacking) {
                    const atkFrames = currentFaceLeft ? flameTowerAttackFramesRight : flameTowerAttackFrames;
                    if (atkFrames.length > 0 && atkFrames[0] && atkFrames[0].complete && atkFrames[0].naturalWidth > 0) {
                        frameIdx = Math.floor((tower.attackFrameTimer / FLAME_TOWER_ATTACK_FRAME_DELAY) % FLAME_TOWER_ATTACK_FRAME_COUNT);
                        frames = atkFrames;
                    } else {
                        frameIdx = Math.floor((flameTowerFrameTimer / FLAME_TOWER_FRAME_DELAY) % FLAME_TOWER_FRAME_COUNT);
                        frames = currentFaceLeft ? flameTowerFramesRight : flameTowerFrames;
                    }
                } else {
                    frameIdx = Math.floor((flameTowerFrameTimer / FLAME_TOWER_FRAME_DELAY) % FLAME_TOWER_FRAME_COUNT);
                    frames = currentFaceLeft ? flameTowerFramesRight : flameTowerFrames;
                }
                const img = frames[frameIdx];
                if (img && img.complete && img.naturalWidth > 0) {
                    const s = 56;
                    ctx.drawImage(img, tower.x - s/2, tower.y - s/2 - 6, s, s);
                } else {
                    ctx.fillStyle = tower.color;
                    ctx.fillRect(tower.x-tower.size/2, tower.y-tower.size/2, tower.size, tower.size);
                }
            // === 火箭鼠帧动画渲染 ===
            } else if (tower.type === 'laserTower') {
                const isAttacking = tower.attackAnimTimer > 0;
                const faceLeft = tower.target && tower.target.x < tower.x;
                if (tower.target) tower.lastFaceLeft = faceLeft;
                const liveFaceLeft = tower.target ? faceLeft : (tower.lastFaceLeft || false);
                const currentFaceLeft = isAttacking ? (tower.lastAttackFaceLeft ?? liveFaceLeft) : liveFaceLeft;
                let frames, frameIdx;
                if (isAttacking) {
                    const atkFrames = currentFaceLeft ? laserTowerAttackFramesRight : laserTowerAttackFrames;
                    if (atkFrames.length > 0 && atkFrames[0] && atkFrames[0].complete && atkFrames[0].naturalWidth > 0) {
                        frameIdx = Math.floor((tower.attackFrameTimer / LASER_TOWER_ATTACK_FRAME_DELAY) % LASER_TOWER_ATTACK_FRAME_COUNT);
                        frames = atkFrames;
                    } else {
                        frameIdx = Math.floor((laserTowerFrameTimer / LASER_TOWER_FRAME_DELAY) % LASER_TOWER_FRAME_COUNT);
                        frames = currentFaceLeft ? laserTowerFramesRight : laserTowerFrames;
                    }
                } else {
                    frameIdx = Math.floor((laserTowerFrameTimer / LASER_TOWER_FRAME_DELAY) % LASER_TOWER_FRAME_COUNT);
                    frames = currentFaceLeft ? laserTowerFramesRight : laserTowerFrames;
                }
                const img = frames[frameIdx];
                if (img && img.complete && img.naturalWidth > 0) {
                    const s = 48;
                    ctx.drawImage(img, tower.x - s/2, tower.y - s/2 - 6, s, s);
                } else {
                    ctx.fillStyle = tower.color;
                    ctx.fillRect(tower.x-tower.size/2, tower.y-tower.size/2, tower.size, tower.size);
                }
            // === 冰霜女帧动画渲染（待机/攻击 + 左右朝向） ===
            } else if (tower.type === 'frostTower') {
                const isAttacking = tower.attackAnimTimer > 0;
                const faceLeft = tower.target && tower.target.x < tower.x;
                if (tower.target) tower.lastFaceLeft = faceLeft;
                const liveFaceLeft = tower.target ? faceLeft : (tower.lastFaceLeft || false);
                const currentFaceLeft = isAttacking ? (tower.lastAttackFaceLeft ?? liveFaceLeft) : liveFaceLeft;
                let frames, frameIdx;
                if (isAttacking) {
                    const atkFrames = currentFaceLeft ? frostTowerAttackFramesRight : frostTowerAttackFrames;
                    if (atkFrames.length > 0 && atkFrames[0] && atkFrames[0].complete && atkFrames[0].naturalWidth > 0) {
                        frameIdx = Math.floor((tower.attackFrameTimer / FROST_TOWER_ATTACK_FRAME_DELAY) % FROST_TOWER_ATTACK_FRAME_COUNT);
                        frames = atkFrames;
                    } else {
                        frameIdx = Math.floor((frostTowerFrameTimer / FROST_TOWER_FRAME_DELAY) % FROST_TOWER_FRAME_COUNT);
                        frames = currentFaceLeft ? frostTowerFramesRight : frostTowerFrames;
                    }
                } else {
                    frameIdx = Math.floor((frostTowerFrameTimer / FROST_TOWER_FRAME_DELAY) % FROST_TOWER_FRAME_COUNT);
                    frames = currentFaceLeft ? frostTowerFramesRight : frostTowerFrames;
                }
                const img = frames[frameIdx];
                if (img && img.complete && img.naturalWidth > 0) {
                    const s = isAttacking ? 45 : 40;
                    ctx.drawImage(img, tower.x - s/2, tower.y - s/2 - 1, s, s);
                } else {
                    ctx.fillStyle = tower.color;
                    ctx.fillRect(tower.x-tower.size/2, tower.y-tower.size/2, tower.size, tower.size);
                }
            // === 障碍物素材渲染 ===
            } else if (tower.type === 'blockTrap') {
                if (blockTrapImg.complete && blockTrapImg.naturalWidth > 0) {
                    const s = 42;
                    ctx.drawImage(blockTrapImg, tower.x - s/2, tower.y - s/2 - 3, s, s);
                } else {
                    ctx.fillStyle = tower.color;
                    ctx.fillRect(tower.x-tower.size/2, tower.y-tower.size/2, tower.size, tower.size);
                }
            // === 减速带单帧素材渲染 ===
            } else if (tower.type === 'iceSpikeTrap') {
                if (iceSpikeTrapImg.complete && iceSpikeTrapImg.naturalWidth > 0) {
                    const s = 50;
                    ctx.drawImage(iceSpikeTrapImg, tower.x - s/2, tower.y - s/2 - 3, s, s);
                } else {
                    ctx.fillStyle = tower.color;
                    ctx.fillRect(tower.x-tower.size/2, tower.y-tower.size/2, tower.size, tower.size);
                }
            // === 爆炸区待机素材渲染 ===
            } else if (tower.type === 'explosiveTrap') {
                if (tower.attackTimer > 0) ctx.globalAlpha = 0.35;
                if (explosiveTrapImgCleanCanvas) {
                    const s = 80;
                    ctx.drawImage(explosiveTrapImgCleanCanvas, tower.x - s/2 + 2, tower.y - s/2 + 1, s, s);
                } else if (explosiveTrapImg.complete && explosiveTrapImg.naturalWidth > 0) {
                    const s = 80;
                    ctx.drawImage(explosiveTrapImg, tower.x - s/2 + 2, tower.y - s/2 + 1, s, s);
                } else {
                    ctx.fillStyle = tower.color;
                    ctx.fillRect(tower.x-tower.size/2, tower.y-tower.size/2, tower.size, tower.size);
                }
                if (tower.attackTimer > 0) ctx.globalAlpha = 1.0;
                // 冷却倒计时
                if (tower.attackTimer > 0) {
                    const remaining = Math.ceil(tower.attackTimer);
                    const fontSize = remaining <= 3 ? 32 : 16;
                    ctx.fillStyle = '#FF3333';
                    ctx.font = 'bold ' + fontSize + 'px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(remaining + 's', tower.x, tower.y);
                    ctx.textAlign = 'start';
                    ctx.textBaseline = 'alphabetic';
                }
            } else if (tower.type === 'bounceTrap') {
                let img = null;
                if (tower.bounceAnimTimer > 0 && bounceTrapFrames.length > 0) {
                    const totalDuration = BOUNCE_TRAP_FRAME_COUNT * BOUNCE_TRAP_FRAME_DELAY;
                    const elapsed = totalDuration - tower.bounceAnimTimer;
                    const frameIndex = Math.floor((elapsed / BOUNCE_TRAP_FRAME_DELAY) % BOUNCE_TRAP_FRAME_COUNT);
                    img = bounceTrapFrames[frameIndex];
                } else {
                    img = bounceTrapIdleImg;
                }
                if (img && img.complete && img.naturalWidth > 0) {
                    const s = 120;
                    ctx.drawImage(img, tower.x - s/2, tower.y - s/2, s, s);
                } else {
                    ctx.fillStyle = tower.color;
                    ctx.fillRect(tower.x-tower.size/2, tower.y-tower.size/2, tower.size, tower.size);
                }
                // 冷却倒计时
                if (tower.attackTimer > 0) {
                    const remaining = Math.ceil(tower.attackTimer);
                    const fontSize = remaining <= 3 ? 32 : 16;
                    ctx.fillStyle = '#FF3333';
                    ctx.font = 'bold ' + fontSize + 'px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(remaining + 's', tower.x, tower.y);
                    ctx.textAlign = 'start';
                    ctx.textBaseline = 'alphabetic';
                }
            } else {
                ctx.fillRect(tower.x-tower.size/2, tower.y-tower.size/2, tower.size, tower.size);
            }
            if (tower.health !== undefined) {
                const maxHealth = tower.originalHealth || tower.maxHealth || tower.health;
                const healthRatio = maxHealth > 0 ? Math.max(0, Math.min(1, tower.health / maxHealth)) : 0;
                const barWidth = tower.size + 4;
                const barHeight = 5;
                const barX = tower.x - barWidth / 2;
                const barY = tower.y + tower.size / 2 + 5;
                ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
                ctx.fillRect(barX, barY, barWidth, barHeight);
                ctx.fillStyle = '#55FF55';
                ctx.fillRect(barX + 1, barY + 1, Math.max(0, (barWidth - 2) * healthRatio), barHeight - 2);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
                ctx.lineWidth = 1;
                ctx.strokeRect(barX, barY, barWidth, barHeight);
            }
            ctx.globalAlpha = 1.0;
            // 爆炸区冷却时显示爆炸范围虚线圆圈
            if (tower.type === 'explosiveTrap' && tower.attackTimer <= 0) {
                ctx.strokeStyle = 'rgba(255,69,0,0.2)'; ctx.lineWidth = 1.5; ctx.setLineDash([4,4]);
                ctx.beginPath(); ctx.arc(tower.x, tower.y, tower.explosionRadius, 0, Math.PI*2); ctx.stroke();
                ctx.setLineDash([]);
            }
            if (tower.upgradeLevel > 0) {
                const stars = formatUpgradeStars(tower.upgradeLevel);
                ctx.fillStyle = 'gold';
                ctx.font = 'bold 9px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(stars, tower.x, tower.y + tower.size/2 + 18);
                ctx.textAlign = 'start';
            }
        }

        // ===== 绘制营地 =====
        for (let ci = 0; ci < campCount; ci++) {
            const c = camps[ci];
            if (!c || !c.alive) continue;
            const campColor = CAMP_TYPES[c.unitType]?.color || '#4488FF';

            // 营地主体（圆角矩形）
            const r = 6;
            const x = c.x - c.size/2, y = c.y - c.size/2, w = c.size, h = c.size;
            ctx.fillStyle = '#1A1A3A';
            ctx.shadowColor = campColor;
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.lineTo(x + w - r, y);
            ctx.quadraticCurveTo(x + w, y, x + w, y + r);
            ctx.lineTo(x + w, y + h - r);
            ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
            ctx.lineTo(x + r, y + h);
            ctx.quadraticCurveTo(x, y + h, x, y + h - r);
            ctx.lineTo(x, y + r);
            ctx.quadraticCurveTo(x, y, x + r, y);
            ctx.closePath();
            ctx.fill();
            ctx.shadowBlur = 0;

            // 边框
            ctx.strokeStyle = campColor;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.lineTo(x + w - r, y);
            ctx.quadraticCurveTo(x + w, y, x + w, y + r);
            ctx.lineTo(x + w, y + h - r);
            ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
            ctx.lineTo(x + r, y + h);
            ctx.quadraticCurveTo(x, y + h, x, y + h - r);
            ctx.lineTo(x, y + r);
            ctx.quadraticCurveTo(x, y, x + r, y);
            ctx.closePath();
            ctx.stroke();

            // 顶部装饰条
            ctx.fillStyle = campColor;
            ctx.globalAlpha = 0.5;
            ctx.fillRect(x + 2, y + 2, w - 4, 4);
            ctx.globalAlpha = 1;

            // 营地名称首字母
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const labels = { farmer: '农', infantry: '步', archer: '弓', knight: '骑', mage: '法', swordsman: '剑', paladin: '圣', sniper: '狙', gunner: '机' };
            ctx.fillText(labels[c.unitType] || '营', c.x, c.y);

            // 升星显示
            if (c.upgradeLevel > 0) {
                ctx.font = 'bold 8px Arial';
                ctx.fillStyle = '#FFD700';
                ctx.fillText(formatUpgradeStars(c.upgradeLevel), c.x, c.y + c.size/2 + 8);
            }
            
            ctx.textBaseline = 'alphabetic';
            ctx.textAlign = 'start';
            
            // 绘制标记点
            if (c.markerX !== null && c.markerY !== null) {
                const flagColor = CAMP_TYPES[c.unitType]?.color || '#FFD700';
                // hex 转 rgb 分量
                const hex = flagColor.replace('#', '');
                const r = parseInt(hex.substring(0,2), 16);
                const g = parseInt(hex.substring(2,4), 16);
                const b = parseInt(hex.substring(4,6), 16);
                const now = Date.now() / 1000;
                // 雷达旋转扫描
                ctx.lineWidth = 3;
                for (let ri = 0; ri < 3; ri++) {
                    const phase = (now * 1.5 + ri * 0.7) % 2;
                    const progress = phase / 2;
                    const startAngle = -Math.PI / 2 + progress * Math.PI * 2;
                    const endAngle = startAngle + Math.PI * 0.6;
                    const alpha = 0.3 + 0.7 * (1 - progress);
                    ctx.strokeStyle = `rgba(${r},${g},${b},${alpha.toFixed(2)})`;
                    ctx.shadowColor = `rgba(${r},${g},${b},${(alpha * 0.8).toFixed(2)})`;
                    ctx.shadowBlur = 12;
                    ctx.beginPath();
                    ctx.arc(c.markerX, c.markerY, 20 + ri * 8, startAngle, endAngle);
                    ctx.stroke();
                }
                ctx.shadowBlur = 0;
                // 外圈虚线
                ctx.strokeStyle = `rgba(${r},${g},${b},0.6)`;
                ctx.lineWidth = 1.5;
                ctx.setLineDash([4, 6]);
                ctx.beginPath();
                ctx.arc(c.markerX, c.markerY, 20, 0, Math.PI * 2);
                ctx.stroke();
                ctx.setLineDash([]);
                // 中心脉冲旗
                const pulse = 0.5 + 0.5 * Math.sin(now * 4);
                ctx.shadowColor = `rgba(${r},${g},${b},0.8)`;
                ctx.shadowBlur = 20;
                ctx.font = `${(14 + pulse * 4).toFixed(0)}px Arial`;
                ctx.textAlign = 'center';
                ctx.fillText('🚩', c.markerX, c.markerY + 5);
                ctx.textAlign = 'start';
                ctx.shadowBlur = 0;
            }
        }

        // 经验宝石
        for (let i = 0; i < expGemCount; i++) {
            const gem = expGems[i];
            if (!gem || !gem.alive) continue;
            const bobY = Math.sin(gem.bobPhase) * 3;
            const gemX = gem.x;
            const gemY = gem.y + bobY;
            const gemSize = 7 + Math.sin(gem.glowPhase) * 1;
            ctx.save();
            ctx.shadowColor = '#7B68EE';
            ctx.shadowBlur = 12;
            if (expGemImg.complete && expGemImg.naturalWidth > 0) {
                ctx.drawImage(expGemImg, gemX - gemSize, gemY - gemSize, gemSize * 2, gemSize * 2);
            } else {
                ctx.fillStyle = '#9370DB';
                ctx.beginPath();
                ctx.moveTo(gemX, gemY - gemSize);
                ctx.lineTo(gemX + gemSize * 0.7, gemY);
                ctx.lineTo(gemX, gemY + gemSize);
                ctx.lineTo(gemX - gemSize * 0.7, gemY);
                ctx.closePath();
                ctx.fill();
            }
            ctx.restore();
        }

        // 敌人
        for (let i = 0; i < enemyCount; i++) {
            const enemy = enemies[i];
            if (!enemy.alive && !enemy.dying) continue;
            if (enemy.isBoss) { ctx.shadowColor = enemy.color; ctx.shadowBlur = 20; }
            const enemyFrameSize = 60;
            let enemyFrameImg = null;

            // 死亡动画优先渲染
            if (enemy.dying && !enemy.alive) {
                const deathFrameIndex = Math.floor((1 - enemy.deathTimer / ENEMY_DEATH_DURATION) * ENEMY_DEATH_FRAME_COUNT);
                const clampedIdx = Math.max(0, Math.min(ENEMY_DEATH_FRAME_COUNT - 1, deathFrameIndex));
                if (enemyDeathFrames[clampedIdx] && enemyDeathFrames[clampedIdx].complete && enemyDeathFrames[clampedIdx].naturalWidth > 0) {
                    enemyFrameImg = enemyDeathFrames[clampedIdx];
                    const deathSize = 60;
                    ctx.drawImage(enemyFrameImg, enemy.x - deathSize / 2, enemy.y - deathSize / 2, deathSize, deathSize);
                    enemyFrameImg = null;
                }
            } else if (enemy.type === ENEMY_TYPES.NORMAL && normalEnemyFrames[0] && normalEnemyFrames[0].complete && normalEnemyFrames[0].naturalWidth > 0) {
                const frames = enemy.facingX < 0 ? normalEnemyFramesLeft : normalEnemyFrames;
                enemyFrameImg = frames[enemy.animFrame % NORMAL_ENEMY_FRAME_COUNT];
            } else if (enemy.type === ENEMY_TYPES.FAST) {
                const frames = enemy.facingX < 0 ? fastEnemyFramesLeft : fastEnemyFrames;
                if (frames[0] && frames[0].complete && frames[0].naturalWidth > 0) {
                    enemyFrameImg = frames[enemy.animFrame % FAST_ENEMY_FRAME_COUNT];
                }
            } else if (enemy.type === ENEMY_TYPES.TANK) {
                const frames = enemy.facingX < 0 ? tankEnemyFramesLeft : tankEnemyFrames;
                if (frames[0] && frames[0].complete && frames[0].naturalWidth > 0) {
                    enemyFrameImg = frames[enemy.animFrame % TANK_ENEMY_FRAME_COUNT];
                }
            } else if (enemy.type === ENEMY_TYPES.SHARPSHOOTER) {
                if (enemy.attackAnimTimer > 0 && sharpshooterAttackFramesRight[0] && sharpshooterAttackFramesRight[0].complete && sharpshooterAttackFramesRight[0].naturalWidth > 0 && sharpshooterAttackFramesLeft[0] && sharpshooterAttackFramesLeft[0].complete && sharpshooterAttackFramesLeft[0].naturalWidth > 0) {
                    const attackFrames = enemy.facingX < 0 ? sharpshooterAttackFramesLeft : sharpshooterAttackFramesRight;
                    const progress = 1 - enemy.attackAnimTimer / SHARPSHOOTER_ATTACK_DURATION;
                    let accumulated = 0;
                    let frameIdx = SHARPSHOOTER_ATTACK_FRAME_COUNT - 1;
                    for (let f = 0; f < SHARPSHOOTER_ATTACK_FRAME_COUNT; f++) {
                        accumulated += SHARPSHOOTER_ATTACK_DELAYS[f] / SHARPSHOOTER_ATTACK_DURATION;
                        if (progress < accumulated) { frameIdx = f; break; }
                    }
                    enemyFrameImg = attackFrames[frameIdx];
                } else {
                    const frames = enemy.facingX < 0 ? sharpshooterEnemyFramesLeft : sharpshooterEnemyFrames;
                    if (frames[0] && frames[0].complete && frames[0].naturalWidth > 0) {
                        enemyFrameImg = frames[enemy.animFrame % SHARPSHOOTER_ENEMY_FRAME_COUNT];
                    }
                }
            } else if (enemy.type === ENEMY_TYPES.ARMORED && armoredEnemyFrames[0] && armoredEnemyFrames[0].complete && armoredEnemyFrames[0].naturalWidth > 0 && armoredEnemyFramesLeft[0] && armoredEnemyFramesLeft[0].complete && armoredEnemyFramesLeft[0].naturalWidth > 0) {
                const frames = enemy.facingX < 0 ? armoredEnemyFramesLeft : armoredEnemyFrames;
                enemyFrameImg = frames[enemy.animFrame % ARMORED_ENEMY_FRAME_COUNT];
            } else if (enemy.type === ENEMY_TYPES.DESTROYER_MAGE && destroyerMageEnemyFrames[0] && destroyerMageEnemyFrames[0].complete && destroyerMageEnemyFrames[0].naturalWidth > 0 && destroyerMageEnemyFramesLeft[0] && destroyerMageEnemyFramesLeft[0].complete && destroyerMageEnemyFramesLeft[0].naturalWidth > 0) {
                const frames = enemy.facingX < 0 ? destroyerMageEnemyFramesLeft : destroyerMageEnemyFrames;
                enemyFrameImg = frames[enemy.animFrame % DESTROYER_MAGE_ENEMY_FRAME_COUNT];
            } else if (enemy.type === ENEMY_TYPES.MINI_BOSS && miniBossEnemyFrames[0] && miniBossEnemyFrames[0].complete && miniBossEnemyFrames[0].naturalWidth > 0 && miniBossEnemyFramesLeft[0] && miniBossEnemyFramesLeft[0].complete && miniBossEnemyFramesLeft[0].naturalWidth > 0) {
                if (enemy.attackAnimTimer > 0 && miniBossAttackFramesRight[0] && miniBossAttackFramesRight[0].complete && miniBossAttackFramesRight[0].naturalWidth > 0 && miniBossAttackFramesLeft[0] && miniBossAttackFramesLeft[0].complete && miniBossAttackFramesLeft[0].naturalWidth > 0) {
                    const attackFrames = enemy.facingX < 0 ? miniBossAttackFramesLeft : miniBossAttackFramesRight;
                    const progress = 1 - enemy.attackAnimTimer / MINI_BOSS_ATTACK_DURATION;
                    let accumulated = 0;
                    let frameIdx = MINI_BOSS_ATTACK_FRAME_COUNT - 1;
                    for (let f = 0; f < MINI_BOSS_ATTACK_FRAME_COUNT; f++) {
                        accumulated += MINI_BOSS_ATTACK_DELAYS[f] / MINI_BOSS_ATTACK_DURATION;
                        if (progress < accumulated) { frameIdx = f; break; }
                    }
                    enemyFrameImg = attackFrames[frameIdx];
                } else {
                    const frames = enemy.facingX < 0 ? miniBossEnemyFramesLeft : miniBossEnemyFrames;
                    enemyFrameImg = frames[enemy.animFrame % MINI_BOSS_ENEMY_FRAME_COUNT];
                }
            } else if (enemy.type === ENEMY_TYPES.BOSS && bossEnemyFrames[0] && bossEnemyFrames[0].complete && bossEnemyFrames[0].naturalWidth > 0 && bossEnemyFramesLeft[0] && bossEnemyFramesLeft[0].complete && bossEnemyFramesLeft[0].naturalWidth > 0) {
                if (enemy.attackAnimTimer > 0 && bossAttackFramesRight[0] && bossAttackFramesRight[0].complete && bossAttackFramesRight[0].naturalWidth > 0 && bossAttackFramesLeft[0] && bossAttackFramesLeft[0].complete && bossAttackFramesLeft[0].naturalWidth > 0) {
                    const attackFrames = enemy.facingX < 0 ? bossAttackFramesLeft : bossAttackFramesRight;
                    const progress = 1 - enemy.attackAnimTimer / BOSS_ATTACK_DURATION;
                    let accumulated = 0;
                    let frameIdx = BOSS_ATTACK_FRAME_COUNT - 1;
                    for (let f = 0; f < BOSS_ATTACK_FRAME_COUNT; f++) {
                        accumulated += BOSS_ATTACK_DELAYS[f] / BOSS_ATTACK_DURATION;
                        if (progress < accumulated) { frameIdx = f; break; }
                    }
                    enemyFrameImg = attackFrames[frameIdx];
                } else {
                    const frames = enemy.facingX < 0 ? bossEnemyFramesLeft : bossEnemyFrames;
                    enemyFrameImg = frames[enemy.animFrame % BOSS_ENEMY_FRAME_COUNT];
                }
            }
            if (enemyFrameImg && enemyFrameImg.complete && enemyFrameImg.naturalWidth > 0) {
                ctx.drawImage(enemyFrameImg, enemy.x - enemyFrameSize / 2, enemy.y - enemyFrameSize / 2, enemyFrameSize, enemyFrameSize);
            } else if (enemy.type !== ENEMY_TYPES.NORMAL && enemy.type !== ENEMY_TYPES.FAST && enemy.type !== ENEMY_TYPES.TANK && enemy.type !== ENEMY_TYPES.SHARPSHOOTER && enemy.type !== ENEMY_TYPES.ARMORED && enemy.type !== ENEMY_TYPES.DESTROYER_MAGE && enemy.type !== ENEMY_TYPES.MINI_BOSS && enemy.type !== ENEMY_TYPES.BOSS) {
                ctx.fillStyle = enemy.color;
                ctx.fillRect(enemy.x-enemy.width/2, enemy.y-enemy.height/2, enemy.width, enemy.height);
            }
            // 减速带：减速紫色光环（脚下）
            if (enemy.slowedByIceSpike) {
                ctx.fillStyle = 'rgba(180, 80, 255, 0.35)';
                ctx.beginPath();
                ctx.ellipse(enemy.x, enemy.y + enemy.height * 0.3, enemy.width * 0.7, enemy.width * 0.3, 0, 0, Math.PI * 2);
                ctx.fill();
            }
            // 冰霜女：减速紫色光环（脚下，同减速带效果）
            if (enemy.frozenByFrostTower) {
                ctx.fillStyle = 'rgba(180, 80, 255, 0.35)';
                ctx.beginPath();
                ctx.ellipse(enemy.x, enemy.y + enemy.height * 0.3, enemy.width * 0.7, enemy.width * 0.3, 0, 0, Math.PI * 2);
                ctx.fill();
            }
            // 减速带：流血粒子效果
            if (enemy.bleeding && enemy.bloodParticles) {
                for (let pi = enemy.bloodParticles.length - 1; pi >= 0; pi--) {
                    const p = enemy.bloodParticles[pi];
                    if (p.life <= 0) { enemy.bloodParticles.splice(pi, 1); continue; }
                    const alpha = Math.min(1, p.life / p.maxLife * 1.5);
                    const size = p.size * (0.4 + 0.4 * (p.life / p.maxLife));
                    ctx.fillStyle = p.life > p.maxLife * 0.5 ? '#FF2222' : '#CC0000';
                    ctx.globalAlpha = alpha * 0.8;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.globalAlpha = 1;
            }

            // 敌人血条
            const maxHealth = enemy.originalHealth || enemy.maxHealth || enemy.health;
            const healthRatio = maxHealth > 0 ? Math.max(0, Math.min(1, enemy.health / maxHealth)) : 0;
            const barWidth = enemy.width + 4;
            const barHeight = 5;
            const barX = enemy.x - barWidth / 2;
            const barY = enemy.y - enemy.height / 2 - barHeight;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.fillRect(barX, barY, barWidth, barHeight);
            ctx.fillStyle = '#FF5555';
            ctx.fillRect(barX + 1, barY + 1, Math.max(0, (barWidth - 2) * healthRatio), barHeight - 2);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.lineWidth = 1;
            ctx.strokeRect(barX, barY, barWidth, barHeight);

            if (enemy.isBoss) {
                ctx.shadowBlur = 0;
                ctx.fillStyle = '#FF0000'; ctx.font = 'bold 12px Arial'; ctx.textAlign = 'center';
                ctx.fillText('BOSS', enemy.x, enemy.y-enemy.height/2-16);
            }
            ctx.shadowBlur = 0;
        }

        // 友方小兵
        for (let i = 0; i < friendCount; i++) {
            const friend = friendlies[i];
            if (!friend || !friend.alive) continue;
            
            // 帧动画护卫：农民 / 步兵 / 弓手 / 骑士 / 法师，其他兵种保持圆形
            const isSpriteUnit = (friend.type === 'farmer' && farmerFramesLeft[0] && farmerFramesLeft[0].complete && farmerFramesLeft[0].naturalWidth > 0) ||
                                 (friend.type === 'infantry' && infantryFramesLeft[0] && infantryFramesLeft[0].complete && infantryFramesLeft[0].naturalWidth > 0) ||
                                 (friend.type === 'archer' && archerFramesLeft[0] && archerFramesLeft[0].complete && archerFramesLeft[0].naturalWidth > 0) ||
                                 (friend.type === 'knight' && knightFramesLeft[0] && knightFramesLeft[0].complete && knightFramesLeft[0].naturalWidth > 0) ||
                                 (friend.type === 'mage' && mageFramesLeft[0] && mageFramesLeft[0].complete && mageFramesLeft[0].naturalWidth > 0) ||
                                 (friend.type === 'swordsman' && swordsmanFramesLeft[0] && swordsmanFramesLeft[0].complete && swordsmanFramesLeft[0].naturalWidth > 0) ||
                                 (friend.type === 'gunner' && gunnerFramesLeft[0] && gunnerFramesLeft[0].complete && gunnerFramesLeft[0].naturalWidth > 0) ||
                                 (friend.type === 'sniper' && sniperFramesLeft[0] && sniperFramesLeft[0].complete && sniperFramesLeft[0].naturalWidth > 0) ||
                                 (friend.type === 'paladin' && paladinFramesLeft[0] && paladinFramesLeft[0].complete && paladinFramesLeft[0].naturalWidth > 0);
            if (isSpriteUnit) {
                let frames, frameIdx;
                if (friend.type === 'farmer') {
                    const isAttacking = friend.state === 'fighting' && farmerAttackFramesLeft[0] && farmerAttackFramesLeft[0].complete;
                    if (isAttacking) {
                        const useRight = friend.facingX >= 0 && farmerAttackFramesRight[0] && farmerAttackFramesRight[0].complete;
                        frames = useRight ? farmerAttackFramesRight : farmerAttackFramesLeft;
                        frameIdx = Math.floor(friend.attackAnimTimer / 0.06) % FARMER_ATTACK_FRAME_COUNT;
                    } else {
                        const useRight = friend.facingX >= 0 && farmerFramesRight[0] && farmerFramesRight[0].complete && farmerFramesRight[0].naturalWidth;
                        frames = useRight ? farmerFramesRight : farmerFramesLeft;
                        frameIdx = friend.animFrame % FARMER_FRAME_COUNT;
                    }
                } else if (friend.type === 'infantry') {
                    const isAttacking = friend.state === 'fighting' && infantryAttackFramesLeft[0] && infantryAttackFramesLeft[0].complete;
                    if (isAttacking) {
                        const useRight = friend.facingX >= 0 && infantryAttackFramesRight[0] && infantryAttackFramesRight[0].complete;
                        frames = useRight ? infantryAttackFramesRight : infantryAttackFramesLeft;
                        const frameDuration = friend.attackCooldown / INFANTRY_ATTACK_FRAME_COUNT;
                        frameIdx = Math.floor(friend.attackAnimTimer / frameDuration) % INFANTRY_ATTACK_FRAME_COUNT;
                    } else {
                        const useRight = friend.facingX >= 0 && infantryFramesRight[0] && infantryFramesRight[0].complete && infantryFramesRight[0].naturalWidth;
                        frames = useRight ? infantryFramesRight : infantryFramesLeft;
                        frameIdx = friend.animFrame % INFANTRY_FRAME_COUNT;
                    }
                } else if (friend.type === 'archer') {
                    // 弓手
                    const isAttacking = friend.state === 'fighting' && archerAttackFramesLeft[0] && archerAttackFramesLeft[0].complete;
                    if (isAttacking) {
                        const useRight = friend.facingX >= 0 && archerAttackFramesRight[0] && archerAttackFramesRight[0].complete;
                        frames = useRight ? archerAttackFramesRight : archerAttackFramesLeft;
                        const frameDuration = (friend.attackCooldown / ARCHER_ATTACK_FRAME_COUNT) * 0.4;
                        frameIdx = Math.min(Math.floor(friend.attackAnimTimer / frameDuration), ARCHER_ATTACK_FRAME_COUNT - 1);
                    } else {
                        const useRight = friend.facingX >= 0 && archerFramesRight[0] && archerFramesRight[0].complete && archerFramesRight[0].naturalWidth;
                        frames = useRight ? archerFramesRight : archerFramesLeft;
                        frameIdx = friend.animFrame % ARCHER_FRAME_COUNT;
                    }
                } else if (friend.type === 'knight') {
                    // 骑士
                    const isAttacking = friend.state === 'fighting' && knightAttackFramesLeft[0] && knightAttackFramesLeft[0].complete;
                    if (isAttacking) {
                        const useRight = friend.facingX >= 0 && knightAttackFramesRight[0] && knightAttackFramesRight[0].complete;
                        frames = useRight ? knightAttackFramesRight : knightAttackFramesLeft;
                        const frameDuration = friend.attackCooldown / KNIGHT_ATTACK_FRAME_COUNT;
                        frameIdx = Math.floor(friend.attackAnimTimer / frameDuration) % KNIGHT_ATTACK_FRAME_COUNT;
                    } else {
                        const useRight = friend.facingX >= 0 && knightFramesRight[0] && knightFramesRight[0].complete && knightFramesRight[0].naturalWidth;
                        frames = useRight ? knightFramesRight : knightFramesLeft;
                        frameIdx = friend.animFrame % KNIGHT_FRAME_COUNT;
                    }
                } else if (friend.type === 'mage') {
                    // 法师
                    const isAttacking = friend.state === 'fighting' && mageAttackFramesLeft[0] && mageAttackFramesLeft[0].complete;
                    if (isAttacking) {
                        const useRight = friend.facingX >= 0 && mageAttackFramesRight[0] && mageAttackFramesRight[0].complete;
                        frames = useRight ? mageAttackFramesRight : mageAttackFramesLeft;
                        const frameDuration = friend.attackCooldown / MAGE_ATTACK_FRAME_COUNT;
                        frameIdx = Math.floor(friend.attackAnimTimer / frameDuration) % MAGE_ATTACK_FRAME_COUNT;
                    } else {
                        const useRight = friend.facingX >= 0 && mageFramesRight[0] && mageFramesRight[0].complete && mageFramesRight[0].naturalWidth;
                        frames = useRight ? mageFramesRight : mageFramesLeft;
                        frameIdx = friend.animFrame % MAGE_FRAME_COUNT;
                    }
                } else if (friend.type === 'swordsman') {
                    // 剑客
                    const isAttacking = friend.state === 'fighting' && swordsmanAttackFramesLeft[0] && swordsmanAttackFramesLeft[0].complete;
                    if (isAttacking) {
                        const useRight = friend.facingX >= 0 && swordsmanAttackFramesRight[0] && swordsmanAttackFramesRight[0].complete;
                        frames = useRight ? swordsmanAttackFramesRight : swordsmanAttackFramesLeft;
                        const frameDuration = friend.attackCooldown / SWORDSMAN_ATTACK_FRAME_COUNT;
                        frameIdx = Math.floor(friend.attackAnimTimer / frameDuration) % SWORDSMAN_ATTACK_FRAME_COUNT;
                    } else {
                        const useRight = friend.facingX >= 0 && swordsmanFramesRight[0] && swordsmanFramesRight[0].complete && swordsmanFramesRight[0].naturalWidth;
                        frames = useRight ? swordsmanFramesRight : swordsmanFramesLeft;
                        frameIdx = friend.animFrame % SWORDSMAN_FRAME_COUNT;
                    }
                } else if (friend.type === 'gunner') {
                    // 机枪兵
                    const isAttacking = friend.state === 'fighting' && gunnerAttackFramesLeft[0] && gunnerAttackFramesLeft[0].complete;
                    if (isAttacking) {
                        const useRight = friend.facingX >= 0 && gunnerAttackFramesRight[0] && gunnerAttackFramesRight[0].complete;
                        frames = useRight ? gunnerAttackFramesRight : gunnerAttackFramesLeft;
                        const frameDuration = friend.attackCooldown / GUNNER_ATTACK_FRAME_COUNT;
                        frameIdx = Math.floor(friend.attackAnimTimer / frameDuration) % GUNNER_ATTACK_FRAME_COUNT;
                    } else {
                        const useRight = friend.facingX >= 0 && gunnerFramesRight[0] && gunnerFramesRight[0].complete && gunnerFramesRight[0].naturalWidth;
                        frames = useRight ? gunnerFramesRight : gunnerFramesLeft;
                        frameIdx = friend.animFrame % GUNNER_FRAME_COUNT;
                    }
                } else if (friend.type === 'sniper') {
                    // 狙击手
                    const isAttacking = friend.state === 'fighting' && sniperAttackFramesLeft[0] && sniperAttackFramesLeft[0].complete;
                    if (isAttacking) {
                        const useRight = friend.facingX >= 0 && sniperAttackFramesRight[0] && sniperAttackFramesRight[0].complete;
                        frames = useRight ? sniperAttackFramesRight : sniperAttackFramesLeft;
                        const frameDuration = 0.1;
                        frameIdx = Math.min(Math.floor(friend.attackAnimTimer / frameDuration), SNIPER_ATTACK_FRAME_COUNT - 1);
                    } else {
                        const useRight = friend.facingX >= 0 && sniperFramesRight[0] && sniperFramesRight[0].complete && sniperFramesRight[0].naturalWidth;
                        frames = useRight ? sniperFramesRight : sniperFramesLeft;
                        frameIdx = friend.animFrame % SNIPER_FRAME_COUNT;
                    }
                } else if (friend.type === 'paladin') {
                    // 圣骑士：加血动画 > 攻击动画 > 行走动画
                    const isHealing = friend.healing && paladinHealFramesLeft[0] && paladinHealFramesLeft[0].complete;
                    if (isHealing) {
                        const useRight = friend.facingX >= 0 && paladinHealFramesRight[0] && paladinHealFramesRight[0].complete;
                        frames = useRight ? paladinHealFramesRight : paladinHealFramesLeft;
                        const healFrameDuration = 0.067;
                        frameIdx = Math.min(Math.floor(friend.healAnimTimer / healFrameDuration), PALADIN_HEAL_FRAME_COUNT - 1);
                    } else if (friend.state === 'fighting' && paladinAttackFramesLeft[0] && paladinAttackFramesLeft[0].complete) {
                        const useRight = friend.facingX >= 0 && paladinAttackFramesRight[0] && paladinAttackFramesRight[0].complete;
                        frames = useRight ? paladinAttackFramesRight : paladinAttackFramesLeft;
                        const frameDuration = friend.attackCooldown / PALADIN_ATTACK_FRAME_COUNT;
                        frameIdx = Math.min(Math.floor(friend.attackAnimTimer / frameDuration), PALADIN_ATTACK_FRAME_COUNT - 1);
                    } else {
                        const useRight = friend.facingX >= 0 && paladinFramesRight[0] && paladinFramesRight[0].complete && paladinFramesRight[0].naturalWidth;
                        frames = useRight ? paladinFramesRight : paladinFramesLeft;
                        frameIdx = friend.animFrame % PALADIN_FRAME_COUNT;
                    }
                } else {
                    // 其他精灵单位
                    const useRight = friend.facingX >= 0 && swordsmanFramesRight[0] && swordsmanFramesRight[0].complete && swordsmanFramesRight[0].naturalWidth;
                    frames = useRight ? swordsmanFramesRight : swordsmanFramesLeft;
                    frameIdx = friend.animFrame % SWORDSMAN_FRAME_COUNT;
                }
                const frameImg = frames[frameIdx];
                let s = friend.type === 'farmer' ? 86 : (friend.type === 'mage' ? 72 : friend.type === 'sniper' ? 48 : friend.type === 'gunner' ? 48 : friend.type === 'paladin' ? 120 : 60);
                if (friend.type === 'knight') {
                    s = (frames === knightAttackFramesLeft || frames === knightAttackFramesRight) ? 75 : 46;
                }
                if (friend.type === 'swordsman' && (frames === swordsmanAttackFramesLeft || frames === swordsmanAttackFramesRight)) {
                    s = 110;
                }
                let drawYOffset = 0;
                if (friend.type === 'knight' && (frames === knightAttackFramesLeft || frames === knightAttackFramesRight)) {
                    drawYOffset = 8;
                }
                if (friend.type === 'swordsman' && (frames === swordsmanAttackFramesLeft || frames === swordsmanAttackFramesRight)) {
                    drawYOffset = -22;
                }
                if (friend.type === 'archer' && (frames === archerAttackFramesLeft || frames === archerAttackFramesRight)) {
                    s = 70;
                    drawYOffset = -4;
                }
                ctx.save();
                ctx.drawImage(frameImg, friend.x - s/2, friend.y - s/2 + drawYOffset, s, s);
                ctx.restore();
            } else {
                ctx.shadowColor = friend.color;
                ctx.shadowBlur = 10;
                ctx.fillStyle = friend.color;
                ctx.beginPath();
                ctx.arc(friend.x, friend.y, friend.width/2 + 12, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.fillStyle = 'rgba(255,255,255,0.3)';
                ctx.beginPath();
                ctx.arc(friend.x - 4, friend.y - 4, friend.width/4 + 4, 0, Math.PI * 2);
                ctx.fill();
            }
            if (friend.health !== undefined) {
                const healthRatio = friend.maxHealth > 0 ? Math.max(0, Math.min(1, friend.health / friend.maxHealth)) : 0;
                const isSprite = friend.type === 'farmer' || (friend.type === 'infantry' && infantryFramesLeft[0] && infantryFramesLeft[0].complete && infantryFramesLeft[0].naturalWidth > 0) || (friend.type === 'archer' && archerFramesLeft[0] && archerFramesLeft[0].complete && archerFramesLeft[0].naturalWidth > 0) || (friend.type === 'knight' && knightFramesLeft[0] && knightFramesLeft[0].complete && knightFramesLeft[0].naturalWidth > 0) || (friend.type === 'mage' && mageFramesLeft[0] && mageFramesLeft[0].complete && mageFramesLeft[0].naturalWidth > 0) || (friend.type === 'swordsman' && swordsmanFramesLeft[0] && swordsmanFramesLeft[0].complete && swordsmanFramesLeft[0].naturalWidth > 0) ||
                                 (friend.type === 'gunner' && gunnerFramesLeft[0] && gunnerFramesLeft[0].complete && gunnerFramesLeft[0].naturalWidth > 0) ||
                                 (friend.type === 'sniper' && sniperFramesLeft[0] && sniperFramesLeft[0].complete && sniperFramesLeft[0].naturalWidth > 0) ||
                                 (friend.type === 'paladin' && paladinFramesLeft[0] && paladinFramesLeft[0].complete && paladinFramesLeft[0].naturalWidth > 0);
                let barYOffset = 0;
                if (friend.type === 'swordsman' && friend.state === 'fighting') {
                    barYOffset = -2;
                }
                const barY = (isSprite ? (friend.type === 'farmer' ? friend.y + 17 : friend.type === 'knight' ? friend.y + 16 : friend.type === 'mage' ? friend.y + 21 : friend.type === 'gunner' ? friend.y + 20 : friend.type === 'sniper' ? friend.y + 18 : friend.type === 'paladin' ? friend.y + 33 : friend.y + 24) : friend.y + friend.height / 2 + 4) + barYOffset;
                const barWidth = isSprite ? (friend.type === 'farmer' || friend.type === 'infantry' || friend.type === 'archer' || friend.type === 'mage' ? 24 : 30) : friend.width + 4;
                const barHeight = 5;
                const barX = friend.x - barWidth / 2 + ((friend.type === 'knight' || friend.type === 'archer' || friend.type === 'infantry' || friend.type === 'swordsman' || friend.type === 'sniper') && friend.state === 'fighting' ? (friend.facingX < 0 ? 10 : -10) : 0) + (friend.type === 'paladin' && friend.state === 'fighting' ? (friend.facingX < 0 ? -3 : 3) : 0) + (friend.type === 'paladin' && friend.healing ? (friend.facingX < 0 ? 1 : -1) : 0);
                ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
                ctx.fillRect(barX, barY, barWidth, barHeight);
                ctx.fillStyle = '#55FF55';
                ctx.fillRect(barX + 1, barY + 1, Math.max(0, (barWidth - 2) * healthRatio), barHeight - 2);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
                ctx.lineWidth = 1;
                ctx.strokeRect(barX, barY, barWidth, barHeight);
            }
            const unitLvl = friend.campLevel || unitUpgradeLevels[friend.type] || 0;
            if (unitLvl > 0) {
                const stars = formatUpgradeStars(unitLvl);
                ctx.fillStyle = '#FFD700';
                ctx.font = 'bold 8px Arial';
                ctx.textAlign = 'center';
                const isSprite = friend.type === 'farmer' || (friend.type === 'infantry' && infantryFramesLeft[0] && infantryFramesLeft[0].complete && infantryFramesLeft[0].naturalWidth > 0) || (friend.type === 'archer' && archerFramesLeft[0] && archerFramesLeft[0].complete && archerFramesLeft[0].naturalWidth > 0) || (friend.type === 'knight' && knightFramesLeft[0] && knightFramesLeft[0].complete && knightFramesLeft[0].naturalWidth > 0) || (friend.type === 'mage' && mageFramesLeft[0] && mageFramesLeft[0].complete && mageFramesLeft[0].naturalWidth > 0) || (friend.type === 'swordsman' && swordsmanFramesLeft[0] && swordsmanFramesLeft[0].complete && swordsmanFramesLeft[0].naturalWidth > 0) ||
                                 (friend.type === 'gunner' && gunnerFramesLeft[0] && gunnerFramesLeft[0].complete && gunnerFramesLeft[0].naturalWidth > 0) ||
                                 (friend.type === 'sniper' && sniperFramesLeft[0] && sniperFramesLeft[0].complete && sniperFramesLeft[0].naturalWidth > 0) ||
                                 (friend.type === 'paladin' && paladinFramesLeft[0] && paladinFramesLeft[0].complete && paladinFramesLeft[0].naturalWidth > 0);
                const starY = isSprite ? (
                    friend.type === 'farmer' ? friend.y + 28 :
                    friend.type === 'knight' ? friend.y + 27 :
                    friend.type === 'mage' ? friend.y + 32 :
                    friend.type === 'gunner' ? friend.y + 31 :
                    friend.type === 'sniper' ? friend.y + 29 :
                    friend.type === 'paladin' ? friend.y + 44 :
                    friend.type === 'swordsman' ? friend.y + 35 :
                    friend.y + 35
                ) : friend.y + friend.height/2 + 8;
                ctx.fillText(stars, friend.x, starY);
                ctx.textAlign = 'start';
            }
            ctx.shadowBlur = 0;
        }

        // 攻击效果
        for (let i = 0; i < attackCount; i++) {
            const a = attacks[i];
            ctx.fillStyle = a.color;
            ctx.fillRect(a.x-a.width/2, a.y-a.height/2, a.width, a.height);
        }

        // 玩家（画在最上层，覆盖建筑和敌人）
        const isMoving = keys.ArrowUp || keys.ArrowDown || keys.ArrowLeft || keys.ArrowRight || keys.w || keys.a || keys.s || keys.d;
        const isAttacking = player.attacking > 0;
        const atkFrameIdx = isAttacking ? (PLAYER_ATTACK_FRAME_COUNT - player.attacking) : 0;
        let playerFrameImg;
        if (isAttacking) {
            if (player.facing < 0) {
                playerFrameImg = playerFramesAttackLeft[atkFrameIdx] || playerIdleLeftFrames[(player.animFrame || 0) % PLAYER_IDLE_LEFT_FRAME_COUNT] || playerFramesLeft[0] || playerFramesRight[0];
            } else {
                playerFrameImg = playerFramesAttack[atkFrameIdx] || playerIdleRightFrames[(player.animFrame || 0) % PLAYER_IDLE_RIGHT_FRAME_COUNT] || playerFramesRight[0];
            }
        } else {
            if (isMoving) {
                const isBoost = player.speedBoostTimer > 0;
                if (player.facing < 0) {
                    playerFrameImg = isBoost
                        ? (playerFramesSpeedLeft[(player.animFrame || 0) % PLAYER_SPEEDBOOST_LEFT_FRAME_COUNT] || playerFramesLeft[(player.animFrame || 0)] || playerFramesRight[0])
                        : (playerFramesLeft[(player.animFrame || 0)] || playerFramesRight[0]);
                } else {
                    playerFrameImg = isBoost
                        ? (playerFramesSpeedRight[(player.animFrame || 0) % PLAYER_SPEEDBOOST_RIGHT_FRAME_COUNT] || playerFramesRight[(player.animFrame || 0)] || playerFramesRight[0])
                        : (playerFramesRight[(player.animFrame || 0)] || playerFramesRight[0]);
                }
            } else {
                playerFrameImg = player.facing < 0 ? (playerIdleLeftFrames[(player.animFrame || 0) % PLAYER_IDLE_LEFT_FRAME_COUNT] || playerFramesLeft[0] || playerFramesRight[0]) : (playerIdleRightFrames[(player.animFrame || 0) % PLAYER_IDLE_RIGHT_FRAME_COUNT] || playerFramesRight[0]);
            }
        }
        const playerFrameReady = playerFrameImg && playerFrameImg.complete && playerFrameImg.naturalWidth > 0;
        if (playerFrameReady) {
            const isBoost = player.speedBoostTimer > 0;
            const pSize = (isMoving && !isAttacking && !isBoost) ? 78 : 52;
            const frameW = playerFrameImg.naturalWidth || pSize;
            const frameH = playerFrameImg.naturalHeight || pSize;
            const aspect = frameW / frameH;
            const drawH = pSize;
            const drawW = pSize * aspect;
            const offsetY = (isMoving && !isAttacking && !isBoost) ? -5 : 0;
            if (isBoost) {
                ctx.save();
                const now = Date.now() * 0.001;
                const pulse = Math.sin(now * 12) * 0.3 + 0.7;
                for (let i = 0; i < 3; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const dist = 10 + Math.random() * 20;
                    const alpha = (0.2 + Math.random() * 0.3) * pulse;
                    ctx.fillStyle = `rgba(200, 180, 140, ${alpha})`;
                    ctx.beginPath();
                    ctx.arc(player.x + Math.cos(angle) * dist, player.y + drawH/4 + Math.sin(angle) * dist * 0.4, 2 + Math.random() * 4, 0, Math.PI * 2);
                    ctx.fill();
                }
                const trailDir = player.facing < 0 ? 1 : -1;
                for (let i = 1; i <= 4; i++) {
                    const alpha = (0.08 + (4 - i) * 0.04) * pulse;
                    const offsetX = trailDir * i * 12;
                    ctx.globalAlpha = alpha;
                    ctx.shadowColor = '#FF6600';
                    ctx.shadowBlur = 20 - i * 3;
                    ctx.drawImage(playerFrameImg, player.x - drawW/2 + offsetX, player.y - drawH/2 + offsetY, drawW * 0.85, drawH * 0.85);
                }
                ctx.globalAlpha = 1;
                ctx.shadowColor = '#FF4400';
                ctx.shadowBlur = 50;
                ctx.drawImage(playerFrameImg, player.x - drawW/2, player.y - drawH/2 + offsetY, drawW, drawH);
                ctx.shadowColor = '#FFD700';
                ctx.shadowBlur = 30;
                ctx.globalAlpha = 0.35 * pulse;
                ctx.drawImage(playerFrameImg, player.x - drawW/2, player.y - drawH/2 + offsetY, drawW, drawH);
                ctx.globalAlpha = 1;
                ctx.shadowBlur = 0;
                for (let i = 0; i < 6; i++) {
                    const theta = Math.random() * Math.PI * 2;
                    const lineLen = 15 + Math.random() * 25;
                    const spread = Math.sin(theta) * 8;
                    const alpha = (0.15 + Math.random() * 0.25) * pulse;
                    ctx.strokeStyle = `rgba(255, ${180 + Math.random() * 75}, ${Math.random() * 80}, ${alpha})`;
                    ctx.lineWidth = 1.5 + Math.random() * 2;
                    ctx.beginPath();
                    ctx.moveTo(player.x + spread * 0.3, player.y + Math.cos(theta) * 10);
                    ctx.lineTo(player.x + trailDir * lineLen + spread, player.y + Math.cos(theta) * 10 + (Math.random() - 0.5) * 6);
                    ctx.stroke();
                }
                for (let i = 0; i < 8; i++) {
                    const angle2 = Math.random() * Math.PI * 2;
                    const dist2 = 8 + Math.random() * 18;
                    const alpha2 = (0.3 + Math.random() * 0.5) * pulse;
                    const size = 1.5 + Math.random() * 3;
                    ctx.fillStyle = `rgba(255, ${200 + Math.random() * 55}, ${Math.random() * 100}, ${alpha2})`;
                    ctx.shadowColor = '#FF8800';
                    ctx.shadowBlur = 8;
                    ctx.beginPath();
                    ctx.arc(player.x + Math.cos(angle2) * dist2, player.y + Math.sin(angle2) * dist2, size, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();
            } else {
                ctx.drawImage(playerFrameImg, player.x - drawW/2, player.y - drawH/2 + offsetY, drawW, drawH);
            }
        }

        // 角色头顶经验条
        {
            const barWidth = 38;
            const barHeight = 6;
            const barX = player.x - barWidth / 2;
            const barY = player.y - 33;
            const radius = 4;
            const nextLevelExp = playerLevel < LEVEL_XP_REQUIREMENTS.length ? LEVEL_XP_REQUIREMENTS[playerLevel] : LEVEL_XP_REQUIREMENTS[LEVEL_XP_REQUIREMENTS.length - 1];
            const pct = Math.min(1, (currentExp || 0) / (nextLevelExp || 1));
            ctx.beginPath();
            ctx.roundRect(barX, barY, barWidth, barHeight, radius);
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.fill();
            ctx.save();
            ctx.beginPath();
            ctx.roundRect(barX, barY, barWidth, barHeight, radius);
            ctx.clip();
            const fillW = barWidth * Math.max(pct, 0.05);
            const grad = ctx.createLinearGradient(barX, barY, barX + barWidth, barY);
            grad.addColorStop(0, '#00BFFF');
            grad.addColorStop(0.5, '#4A90D9');
            grad.addColorStop(1, '#7B68EE');
            ctx.fillStyle = grad;
            ctx.fillRect(barX, barY, fillW, barHeight);
            ctx.restore();
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 0.65em Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`Lv.${playerLevel}`, player.x, barY - 3);
            ctx.textAlign = 'start';
        }

        // 爆炸区帧动画渲染
        for (let i = 0; i < trapExplosionCount; i++) {
            const e = trapExplosions[i];
            const frameIndex = Math.min(trapExplosionFrameCount - 1, Math.floor(e.timer / 0.5 * trapExplosionFrameCount));
            const frameImg = trapExplosionFrames[frameIndex];
            const s = 120;
            if (frameImg && frameImg.complete && frameImg.naturalWidth > 0) {
                ctx.drawImage(frameImg, e.x - s/2 + 2, e.y - s/2 - 2, s, s);
            } else {
                // 备用渲染：橙红色膨胀圆圈
                const progress = e.timer / 0.5;
                const radius = s/2 * (0.3 + progress * 0.7);
                ctx.globalAlpha = 1 - progress;
                ctx.fillStyle = '#FF4500';
                ctx.beginPath();
                ctx.arc(e.x + 2, e.y - 2, radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
            }
        }
        // 传送器弹射效果渲染
        for (let i = 0; i < bounceEffectCount; i++) {
            const e = bounceEffects[i];
            const frameIndex = Math.floor((e.timer / e.duration) * BOUNCE_TRAP_FRAME_COUNT);
            const frameImg = bounceTrapFrames[frameIndex];
            if (frameImg && frameImg.complete && frameImg.naturalWidth > 0) {
                const s = 80;
                ctx.drawImage(frameImg, e.x - s/2, e.y - s/2, s, s);
            }
        }

        // 子弹击中爆炸效果
        const defaultExplodeSize = 40;
        for (let i = 0; i < explosionCount; i++) {
            const e = explosions[i];
            const frameImg = explosionFrames[e.frame];
            const esize = e.size || defaultExplodeSize;
            if (frameImg && frameImg.complete && frameImg.naturalWidth > 0) {
                ctx.drawImage(frameImg, e.x - esize / 2, e.y - esize / 2, esize, esize);
            }
        }

        // 护卫攻击爆炸效果
        const guardExplodeSize = 40;
        for (let i = 0; i < guardExplosionCount; i++) {
            const e = guardExplosions[i];
            const frameImg = guardExplosionFrames[e.frame];
            if (frameImg && frameImg.complete && frameImg.naturalWidth > 0) {
                ctx.drawImage(frameImg, e.x - guardExplodeSize / 2, e.y - guardExplodeSize / 2, guardExplodeSize, guardExplodeSize);
            }
        }

        // 护卫死亡效果
        const guardDeathSize = 60;
        for (let i = 0; i < guardDeathCount; i++) {
            const d = guardDeaths[i];
            const frameIndex = Math.min(GUARD_DEATH_FRAME_COUNT - 1, Math.floor((d.timer / GUARD_DEATH_DURATION) * GUARD_DEATH_FRAME_COUNT));
            const frameImg = guardDeathFrames[frameIndex];
            if (frameImg && frameImg.complete && frameImg.naturalWidth > 0) {
                ctx.drawImage(frameImg, d.x - guardDeathSize / 2, d.y - guardDeathSize / 2, guardDeathSize, guardDeathSize);
            }
        }

        // 护卫攻击动画
        for (let i = 0; i < friendShotCount; i++) {
            const s = friendShots[i];
            const alpha = 1 - (s.timer / s.life);
            ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
            if (s.type === 'arrow') {
                // 弓箭：亮蓝刺眼弹道
                const angle = Math.atan2(s.vy, s.vx);
                const len = 26;
                const hx = Math.cos(angle) * (len / 2);
                const hy = Math.sin(angle) * (len / 2);
                const c = s.color || '#44DDFF';
                // 外层大光晕
                ctx.shadowColor = c;
                ctx.shadowBlur = 30;
                ctx.fillStyle = c;
                ctx.beginPath();
                ctx.arc(s.x, s.y, 10, 0, Math.PI * 2);
                ctx.fill();
                // 弹道轨迹线
                ctx.shadowBlur = 25;
                ctx.strokeStyle = c;
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo(s.x - hx - Math.cos(angle) * 10, s.y - hy - Math.sin(angle) * 10);
                ctx.lineTo(s.x + hx, s.y + hy);
                ctx.stroke();
                // 内层亮线
                ctx.shadowBlur = 0;
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(s.x - hx * 0.3, s.y - hy * 0.3);
                ctx.lineTo(s.x + hx, s.y + hy);
                ctx.stroke();
                // 弹头
                ctx.shadowBlur = 35;
                ctx.fillStyle = c;
                ctx.beginPath();
                ctx.arc(s.x + hx, s.y + hy, 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.fillStyle = '#FFFFFF';
                ctx.beginPath();
                ctx.arc(s.x + hx, s.y + hy, 2, 0, Math.PI * 2);
                ctx.fill();
            } else if (s.type === 'magic') {
                // 法师：亮深紫粉色刺眼弹道
                const angle = Math.atan2(s.vy, s.vx);
                const len = 30;
                const hx = Math.cos(angle) * (len / 2);
                const hy = Math.sin(angle) * (len / 2);
                const c = s.color || '#CC44FF';
                // 外层大光晕
                ctx.shadowColor = c;
                ctx.shadowBlur = 40;
                ctx.fillStyle = c;
                ctx.beginPath();
                ctx.arc(s.x, s.y, 14, 0, Math.PI * 2);
                ctx.fill();
                // 弹道轨迹线
                ctx.shadowBlur = 35;
                ctx.strokeStyle = c;
                ctx.lineWidth = 5;
                ctx.beginPath();
                ctx.moveTo(s.x - hx - Math.cos(angle) * 15, s.y - hy - Math.sin(angle) * 15);
                ctx.lineTo(s.x + hx, s.y + hy);
                ctx.stroke();
                // 内层亮线
                ctx.shadowBlur = 0;
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(s.x - hx * 0.3, s.y - hy * 0.3);
                ctx.lineTo(s.x + hx, s.y + hy);
                ctx.stroke();
                // 弹头
                ctx.shadowBlur = 45;
                ctx.fillStyle = c;
                ctx.beginPath();
                ctx.arc(s.x + hx, s.y + hy, 7, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.fillStyle = '#FFFFFF';
                ctx.beginPath();
                ctx.arc(s.x + hx, s.y + hy, 3, 0, Math.PI * 2);
                ctx.fill();
            } else if (s.type === 'bullet') {
                // 机枪兵：金黄色刺眼弹道
                const angle = Math.atan2(s.vy, s.vx);
                const len = 34;
                const hx = Math.cos(angle) * (len / 2);
                const hy = Math.sin(angle) * (len / 2);
                const c = s.color || '#FFEE44';
                // 外层大光晕
                ctx.shadowColor = c;
                ctx.shadowBlur = 40;
                ctx.fillStyle = c;
                ctx.beginPath();
                ctx.arc(s.x, s.y, 14, 0, Math.PI * 2);
                ctx.fill();
                // 弹道轨迹线
                ctx.shadowBlur = 35;
                ctx.strokeStyle = c;
                ctx.lineWidth = 5;
                ctx.beginPath();
                ctx.moveTo(s.x - hx - Math.cos(angle) * 15, s.y - hy - Math.sin(angle) * 15);
                ctx.lineTo(s.x + hx, s.y + hy);
                ctx.stroke();
                // 内层亮线
                ctx.shadowBlur = 0;
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(s.x - hx * 0.3, s.y - hy * 0.3);
                ctx.lineTo(s.x + hx, s.y + hy);
                ctx.stroke();
                // 弹头
                ctx.shadowBlur = 45;
                ctx.fillStyle = c;
                ctx.beginPath();
                ctx.arc(s.x + hx, s.y + hy, 7, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.fillStyle = '#FFFFFF';
                ctx.beginPath();
                ctx.arc(s.x + hx, s.y + hy, 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            } else if (s.type === 'sniper') {
                // 狙击手子弹：刺眼亮蓝高速弹道
                const angle = Math.atan2(s.vy, s.vx);
                const len = 38;
                const hx = Math.cos(angle) * (len / 2);
                const hy = Math.sin(angle) * (len / 2);
                const c = s.color || '#44FFDD';
                // 外层大光晕
                ctx.shadowColor = c;
                ctx.shadowBlur = 40;
                ctx.fillStyle = c;
                ctx.beginPath();
                ctx.arc(s.x, s.y, 16, 0, Math.PI * 2);
                ctx.fill();
                // 弹道轨迹线
                ctx.shadowBlur = 35;
                ctx.strokeStyle = c;
                ctx.lineWidth = 5;
                ctx.beginPath();
                ctx.moveTo(s.x - hx - Math.cos(angle) * 15, s.y - hy - Math.sin(angle) * 15);
                ctx.lineTo(s.x + hx, s.y + hy);
                ctx.stroke();
                // 内层亮线
                ctx.shadowBlur = 0;
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(s.x - hx * 0.3, s.y - hy * 0.3);
                ctx.lineTo(s.x + hx, s.y + hy);
                ctx.stroke();
                // 弹头爆炸点
                ctx.shadowBlur = 45;
                ctx.fillStyle = c;
                ctx.beginPath();
                ctx.arc(s.x + hx, s.y + hy, 7, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.fillStyle = '#FFFFFF';
                ctx.beginPath();
                ctx.arc(s.x + hx, s.y + hy, 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }
            ctx.shadowBlur = 0;
        }
        ctx.globalAlpha = 1;

        // 子弹（发光球体科技感渲染）
    const bulletRenderSize = 40;
        for (let i = 0; i < bulletCount; i++) {
            const b = bullets[i];
            if (b.hit) continue;
            if (!b.target && !b.fromPlayer) continue;
            
            // 玩家子弹（使用图片渲染）
            if (b.fromPlayer && playerBulletRightImg.complete && playerBulletRightImg.naturalWidth > 0) {
                const angle = Math.atan2(b.dy, b.dx);
                ctx.save();
                ctx.translate(b.x, b.y);
                ctx.rotate(angle);
                ctx.drawImage(playerBulletRightImg, -bulletRenderSize / 2, -bulletRenderSize / 2, bulletRenderSize, bulletRenderSize);
                ctx.restore();
                // 叠加发光效果
                ctx.save();
                ctx.shadowColor = '#BFFF00';
                ctx.shadowBlur = 30;
                ctx.globalAlpha = 0.35;
                ctx.fillStyle = '#BFFF00';
                ctx.beginPath();
                ctx.arc(b.x, b.y, b.radius * 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
                continue;
            }
            
            // 科技感发光球体渲染
            const glowColor = b.color;
            const r = b.radius || 4;
            ctx.save();
            
            // 1. 外层光晕
            ctx.shadowColor = glowColor;
            ctx.shadowBlur = 35;
            ctx.globalAlpha = 0.25;
            ctx.fillStyle = glowColor;
            ctx.beginPath();
            ctx.arc(b.x, b.y, r * 3, 0, Math.PI * 2);
            ctx.fill();
            
            // 2. 中层辉光
            ctx.shadowBlur = 20;
            ctx.globalAlpha = 0.6;
            ctx.fillStyle = glowColor;
            ctx.beginPath();
            ctx.arc(b.x, b.y, r * 1.8, 0, Math.PI * 2);
            ctx.fill();
            
            // 3. 球体主体（用更亮的版本）
            ctx.shadowBlur = 10;
            ctx.globalAlpha = 0.95;
            const brightColor = (b.color === '#FF4500') ? '#FF6D00' :
                (b.color === '#40DFFF') ? '#80EFFF' :
                (b.color === '#FFD600') ? '#FFE040' :
                (b.color === '#D500F9') ? '#E040FB' :
                (b.color === '#A0522D') ? '#C07040' :
                (b.color === '#BFFF00') ? '#D0FF40' :
                (b.color === '#FFB300') ? '#FFC040' :
                '#FFFFFF';
            ctx.fillStyle = brightColor;
            ctx.beginPath();
            ctx.arc(b.x, b.y, r * 1.2, 0, Math.PI * 2);
            ctx.fill();
            
            // 4. 白色高亮核心
            ctx.shadowBlur = 5;
            ctx.globalAlpha = 1;
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(b.x, b.y, r * 0.45, 0, Math.PI * 2);
            ctx.fill();
            
            // 5. 高光点（偏左上）
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 0.85;
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(b.x - r * 0.35, b.y - r * 0.35, r * 0.2, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        }

        // 伤害文本
        ctx.textAlign = 'center';
        const MAX_RENDER = 15;
        const startIdx = Math.max(0, damageTextCount - MAX_RENDER);
        for (let i = startIdx; i < damageTextCount; i++) {
            const t = damageTexts[i];
            ctx.globalAlpha = 1 - (t.timer/t.duration);
            ctx.fillStyle = t.color;
            // 所有⬆/💰开头的提示和小字类文本用小字
            if (typeof t.value === 'string' && (t.value.startsWith('⬆') || t.value === 'UP!!' || t.value === 'LEVEL UP!!' || t.value.startsWith('💰') || t.value.includes('点击地图') || t.value.includes('集合点') || t.value.includes('提高角色等级'))) {
                ctx.font = 'bold 13px "Segoe UI", sans-serif';
                ctx.shadowColor = 'rgba(0,0,0,0.8)';
                ctx.shadowBlur = 3;
            } else if (t.color === '#FFD700') {
                ctx.font = 'bold 32px "Arial Black", Impact, sans-serif';
                ctx.shadowColor = 'rgba(255,215,0,0.5)';
                ctx.shadowBlur = 8;
            } else {
                ctx.font = 'bold 18px "Segoe UI", "Arial Black", sans-serif';
                ctx.shadowColor = 'rgba(0,0,0,0.8)';
                ctx.shadowBlur = 4;
            }
            ctx.fillText(t.value, t.x, t.y);
            ctx.shadowBlur = 0;
        }
        ctx.globalAlpha = 1; ctx.textAlign = 'start';

        // 放置预览（含攻击范围显示）
        if (placingTower && selectedAsset) {
            ctx.save();
            const grid = getGridFromPosition(mouse.x, mouse.y);
            const snappedPos = getPositionFromGrid(grid.col, grid.row);
            
            // 营地放置预览
            if (selectedAsset._isCamp) {
                const campSize = selectedAsset.size || 28;
                const campColor = selectedAsset.color || '#4488FF';
                const canPlace = canPlaceCampOnGrid(grid.col, grid.row);
                ctx.globalAlpha = canPlace ? 0.6 : 0.3;
                // 系统绘制方块
                ctx.fillStyle = campColor;
                ctx.shadowColor = campColor;
                ctx.shadowBlur = 30;
                ctx.fillRect(snappedPos.x - campSize/2, snappedPos.y - campSize/2, campSize, campSize);
                ctx.shadowBlur = 0;
                ctx.fillStyle = '#FFF';
                ctx.font = 'bold 35px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('🏕️', snappedPos.x, snappedPos.y);
                ctx.textBaseline = 'alphabetic';
                ctx.textAlign = 'start';
                ctx.globalAlpha = 1;
                ctx.restore();
                return;
            }
            
            const isTrap = selectedAsset.type && String(selectedAsset.type).includes('Trap');
            const canPlace = canPlaceOnGrid(grid.col, grid.row, isTrap);
            
            // ---- 在放置位置预览攻击/触发范围 ----
            const assetType = selectedAsset.type;
            let previewRange = 0;
            let previewRangeColor = 'rgba(0, 255, 255, 0.15)';
            let previewRangeStroke = 'rgba(0, 255, 255, 0.45)';
            let rangeLabel = '';
            
            if (assetType === 'arrowTower') {
                previewRange = selectedAsset.attackRange || 150;
                previewRangeColor = 'rgba(0, 255, 255, 0.15)';
                previewRangeStroke = 'rgba(0, 255, 255, 0.45)';
                rangeLabel = '射程';
            } else if (assetType === 'flameTower') {
                previewRange = selectedAsset.attackRange || 80;
                previewRangeColor = 'rgba(255, 69, 0, 0.15)';
                previewRangeStroke = 'rgba(255, 69, 0, 0.45)';
                rangeLabel = '射程';
            } else if (assetType === 'frostTower') {
                previewRange = selectedAsset.attackRange || 150;
                previewRangeColor = 'rgba(173, 216, 230, 0.18)';
                previewRangeStroke = 'rgba(173, 216, 230, 0.50)';
                rangeLabel = '射程(减速)';
            } else if (assetType === 'laserTower') {
                previewRange = selectedAsset.attackRange || 250;
                previewRangeColor = 'rgba(255, 0, 255, 0.12)';
                previewRangeStroke = 'rgba(255, 0, 255, 0.40)';
                rangeLabel = '射程';
            } else if (assetType === 'explosiveTrap') {
                previewRange = selectedAsset.explosionRadius || 80;
                previewRangeColor = 'rgba(255, 69, 0, 0.15)';
                previewRangeStroke = 'rgba(255, 69, 0, 0.55)';
                rangeLabel = '爆炸范围';
            } else if (assetType === 'iceSpikeTrap') {
                previewRange = selectedAsset.size || 20;
                previewRangeColor = 'rgba(176, 224, 230, 0.15)';
                previewRangeStroke = 'rgba(176, 224, 230, 0.40)';
                rangeLabel = '触发范围';
            } else if (assetType === 'bounceTrap') {
                previewRange = selectedAsset.size || 20;
                previewRangeColor = 'rgba(0, 255, 0, 0.12)';
                previewRangeStroke = 'rgba(0, 255, 0, 0.35)';
                rangeLabel = '触发范围';
            } else if (assetType === 'blockTrap') {
                previewRange = selectedAsset.size || 20;
                previewRangeColor = 'rgba(139, 69, 19, 0.12)';
                previewRangeStroke = 'rgba(139, 69, 19, 0.35)';
                rangeLabel = '阻挡范围';
            }
            
            if (previewRange > 0) {
                ctx.beginPath();
                ctx.arc(snappedPos.x, snappedPos.y, previewRange, 0, Math.PI * 2);
                ctx.fillStyle = previewRangeColor;
                ctx.fill();
                ctx.strokeStyle = previewRangeStroke;
                ctx.lineWidth = 2;
                ctx.stroke();
                
                // 标注范围数值
                
            }
            
            ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 1; ctx.setLineDash([4,4]);
            ctx.strokeRect(grid.col*GRID_SIZE, grid.row*GRID_SIZE, GRID_SIZE, GRID_SIZE);
            ctx.setLineDash([]);
            ctx.globalAlpha = canPlace ? 0.7 : 0.3;
            ctx.strokeStyle = canPlace ? 'lime' : 'red'; ctx.lineWidth = 2;
            ctx.strokeRect(grid.col*GRID_SIZE, grid.row*GRID_SIZE, GRID_SIZE, GRID_SIZE);
            ctx.fillStyle = selectedAsset.color;
            const previewSize = 50;
            // 优先使用图标素材
            let usedIcon = false;
            if (assetType === 'arrowTower' && arrowTowerIcon.complete && arrowTowerIcon.naturalWidth > 0) {
                ctx.drawImage(arrowTowerIcon, snappedPos.x-previewSize/2, snappedPos.y-previewSize/2 - 5, previewSize, previewSize);
                usedIcon = true;
            } else if (assetType === 'flameTower' && flameTowerIcon.complete && flameTowerIcon.naturalWidth > 0) {
                ctx.drawImage(flameTowerIcon, snappedPos.x-previewSize/2, snappedPos.y-previewSize/2 - 5, previewSize, previewSize);
                usedIcon = true;
            } else if (assetType === 'frostTower' && frostTowerIcon.complete && frostTowerIcon.naturalWidth > 0) {
                ctx.drawImage(frostTowerIcon, snappedPos.x-20, snappedPos.y-20, 40, 40);
                usedIcon = true;
            } else if (assetType === 'laserTower' && laserTowerIcon.complete && laserTowerIcon.naturalWidth > 0) {
                ctx.drawImage(laserTowerIcon, snappedPos.x-previewSize/2, snappedPos.y-previewSize/2 - 5, previewSize, previewSize);
                usedIcon = true;
            } else if (assetType === 'goldMine' && goldMineIcon.complete && goldMineIcon.naturalWidth > 0) {
                ctx.drawImage(goldMineIcon, snappedPos.x-23, snappedPos.y-24, 48, 48);
                usedIcon = true;
            } else if (assetType === 'iceSpikeTrap' && iceSpikeTrapImg.complete && iceSpikeTrapImg.naturalWidth > 0) {
                ctx.drawImage(iceSpikeTrapImg, snappedPos.x-25, snappedPos.y-28, 50, 50);
                usedIcon = true;
            } else if (assetType === 'blockTrap' && blockTrapImg.complete && blockTrapImg.naturalWidth > 0) {
                ctx.drawImage(blockTrapImg, snappedPos.x-21, snappedPos.y-24, 42, 42);
                usedIcon = true;
            } else if (assetType === 'explosiveTrap' && ((explosiveTrapImgCleanCanvas) || (explosiveTrapImg.complete && explosiveTrapImg.naturalWidth > 0))) {
                const src = explosiveTrapImgCleanCanvas || explosiveTrapImg;
                ctx.drawImage(src, snappedPos.x-38, snappedPos.y-39, 80, 80);
                usedIcon = true;
            } else if (assetType === 'bounceTrap' && bounceTrapIdleImg.complete && bounceTrapIdleImg.naturalWidth > 0) {
                ctx.drawImage(bounceTrapIdleImg, snappedPos.x-60, snappedPos.y-60, 120, 120);
                usedIcon = true;
            }
            if (!usedIcon) {
                // 无图标的默认方块缩小到32x32
                ctx.fillRect(snappedPos.x-16, snappedPos.y-16, 32, 32);
            }
            
            // 重置文本对齐
            ctx.textAlign = 'start';
            ctx.restore();
        }

        // 结束覆盖
        if (!gameRunning && gameState.isGameOver) {
            const isWin = gameState.lastResult && gameState.lastResult.wave >= MAX_WAVES_PER_LEVEL;
            ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(0,0,canvas.width,canvas.height);
            if (isWin) {
                ctx.fillStyle = '#FFD700'; ctx.font = 'bold 42px Arial'; ctx.textAlign = 'center';
                ctx.fillText('🎉 恭喜您通关！', canvas.width/2, canvas.height/2-20);
                ctx.fillStyle = 'rgba(255,215,0,0.8)'; ctx.font = '22px Arial';
                ctx.fillText(`关卡 ${gameState.lastResult ? gameState.lastResult.level : '?'} 全部完成！`, canvas.width/2, canvas.height/2+30);
            } else {
                ctx.fillStyle = 'red'; ctx.font = 'bold 48px Arial'; ctx.textAlign = 'center';
                ctx.fillText('游戏结束', canvas.width/2, canvas.height/2-20);
                ctx.fillStyle = 'white'; ctx.font = '24px Arial';
                ctx.fillText(`关卡 ${gameState.lastResult ? gameState.lastResult.level : '?'} - 第 ${gameState.lastResult ? gameState.lastResult.wave : '?'} 波`, canvas.width/2, canvas.height/2+40);
            }
        }

        // ===== 敌人过多警告文字（画布中下方） =====
        if (enemyWarning.warningAlpha > 0 && enemyWarning.warningText) {
            const pulse = 0.85 + 0.15 * Math.sin(Date.now() / 150);
            ctx.save();
            ctx.textAlign = 'center';
            ctx.globalAlpha = enemyWarning.warningAlpha * pulse;
            ctx.shadowColor = '#FF0000';
            ctx.shadowBlur = 30;
            ctx.fillStyle = '#FF2222';
            ctx.font = 'bold 22px Arial';
            ctx.fillText(enemyWarning.warningText, canvas.width / 2, 60);
            ctx.restore();
        }
    }

    // ================== 游戏循环 ==================
    function gameLoop(currentTime) {
        const dt = (currentTime - lastTime) / 1000;
        // 切屏回来后 dt 可能很大，限制最大值防止位置跳变
        const deltaTime = Math.min(dt, 0.05);
        lastTime = currentTime;
        try { update(deltaTime); } catch(e) { /* silent */ }
        draw();
        updateSkillIcon();
        try { refreshUpgradePanelIfOpen(); } catch(e) { /* silent */ }
        requestAnimationFrame(gameLoop);
    }

    // 每帧刷新升级面板，使属性（如血量）实时更新
    function refreshUpgradePanelIfOpen() {
        const panel = document.getElementById('upgradePanel');
        if (panel && panel.style.display !== 'none' && selectedTower) {
            showUpgradePanel(selectedTower);
        }
        // 只更新左侧面板血量数值，不重建浮动按钮 DOM
        const enemyPanel = document.getElementById('enemyPreviewPanel');
        if (enemyPanel && enemyPanel.style.display !== 'none') {
            const stats = document.getElementById('enemyPreviewStats');
            if (stats) {
                const rows = stats.querySelectorAll('p');
                for (const row of rows) {
                    if (row.textContent.startsWith('血量:') && selectedTower) {
                        row.textContent = `血量: ${Math.round(selectedTower.health)} / ${Math.round(selectedTower.originalHealth)}`;
                    }
                    if (row.textContent.startsWith('血量:') && selectedCamp && selectedCamp.alive) {
                        const unitConfig = UNITS[selectedCamp.unitType];
                        if (unitConfig) {
                            const lvl = selectedCamp.upgradeLevel || 0;
                            const hp = unitConfig.baseHealth + lvl * unitConfig.upgradeHPPerLvl;
                            row.textContent = `血量: ${hp}`;
                        }
                    }
                }
                // 更新金币状态（仅 disabled 属性，不改内容）
                const towerUpBtn = document.getElementById('towerUpgradeBtn');
                if (towerUpBtn && towerUpBtn.dataset.cost) {
                    const cost = parseInt(towerUpBtn.dataset.cost);
                    towerUpBtn.disabled = playerGold < cost;
                }
                const campUpBtn = document.getElementById('campUpgradeBtn');
                if (campUpBtn && campUpBtn.dataset.cost) {
                    const cost = parseInt(campUpBtn.dataset.cost);
                    campUpBtn.disabled = playerGold < cost;
                }
            }
        }
    }

    // 更新加速技能图标状态
    function updateSkillIcon() {
        const icon = getEl('skillIcon');
        if (!icon || !player) return;
        const inner = icon.querySelector('.skill-icon-inner');
        if (player.speedBoostTimer > 0) {
            icon.className = 'skill-icon active';
            icon.style.borderColor = '';
            icon.style.boxShadow = '';
            if (inner) { inner.style.color = ''; inner.style.textShadow = ''; }
        } else if (player.speedBoostCooldown > 0) {
            icon.className = 'skill-icon on-cooldown';
            // 冷却从黑色慢慢变为青色：t=1(刚用完/纯黑) → t=0(就绪/青色)
            const t = player.speedBoostCooldown / 60;
            const gb = Math.floor(180 * (1 - t));
            const col = `rgb(${Math.floor(80 * t)}, ${gb}, ${gb})`;
            icon.style.borderColor = col;
            icon.style.boxShadow = gb > 50 ? `0 0 ${12 * (1 - t)}px rgba(0, ${gb}, ${gb}, ${0.3 * (1 - t)})` : 'none';
            if (inner) {
                inner.style.color = col;
                inner.style.textShadow = gb > 50 ? `0 0 ${8 * (1 - t)}px rgba(0, ${gb}, ${gb}, ${0.4 * (1 - t)})` : 'none';
            }
        } else {
            icon.className = 'skill-icon ready';
            icon.style.borderColor = '';
            icon.style.boxShadow = '';
            if (inner) { inner.style.color = ''; inner.style.textShadow = ''; }
        }
    }

    console.log('✅ Game initialized: Canvas', canvas.width, 'x', canvas.height);
    console.log('✅ gameState:', gameState);
    initSpeedBoostAudio(); // 提前预加载加速音效
    requestAnimationFrame(gameLoop);
}
