// --- БАЗЫ ДАННЫХ ---
const ITEMS_DB = {
    g22_nest: { id: 'g22_nest', name: "G22 'Nest'", rarity: 'common', price: 10, image: 'images/g22_nest.webp', model: '' },
    ump45_beast: { id: 'ump45_beast', name: "AKR Nano'", rarity: 'common', price: 12, image: 'images/akr_nano.webp', model: '' },
    p350_forest: { id: 'p350_forest', name: "FS Venom", rarity: 'rare', price: 55, image: 'images/fs.webp', model: '' },
    fabm_fatal: { id: 'fabm_fatal', name: "Fnfal Splash", rarity: 'rare', price: 10, image: 'images/fnfal.webp', model: '' },
    akr_carbon: { id: 'akr_carbon', name: "AKR Genesis", rarity: 'legendary', price: 520, image: 'images/akr_genesis.webp', model: '' },
    awp_dragon: { id: 'awp_dragon', name: "AWP 'Genesis'", rarity: 'legendary', price: 1800, image: 'images/awm_genesis.webp', model: '' },
    k_gold: { id: 'k_gold', name: "Karambit 'Gold'", rarity: 'legendary', price: 15000, image: 'images/kerambit_gold.webp', model: '' },
    gloves_furious: { id: 'gloves_furious', name: "Gloves", rarity: 'legendary', price: 850, image: 'images/gloves.webp', model: '' },
    karambit_univers: { id: 'karambit_new', name: "Karambit Univers", rarity: 'legendary', price: 11000, image: 'images/karambit.webp', model: '' },
    dualdaggers_retrorade: { id: 'dual_berettas', name: "Dual Daggers Retrorade", rarity: 'legendary', price: 500, image: 'images/dual.webp', model: '' },
    famas_monester: { id: 'falos_cyber', name: "FAMAS Monster", rarity: 'epic', price: 150, image: 'images/famas.webp', model: '' },
    m16_seaglint: { id: 'm16_serpent', name: "M16 Seaglint'", rarity: 'epic', price: 600, image: 'images/m16.webp', model: '' },
    m4a1_impact: { id: 'm4a1_ice', name: "M4A1 Impact", rarity: 'epic', price: 750, image: 'images/weapon.webp', model: '' },
    m60_grunge: { id: 'negev_toxic', name: "M60 Grunge", rarity: 'rare', price: 120, image: 'images/negev.webp', model: '' },
    m16_ironwill: { id: 'p90_venom', name: "M16 Ironwill", rarity: 'epic', price: 550, image: 'images/weapon1.webp', model: '' },
    mantis_eclips: { id: 'tec9_decal', name: "Mantis Eclips", rarity: 'legendary', price: 3333, image: 'images/weapon2.webp', model: '' }
};

const CASES_DB = [
    { id: 'origin', name: 'Origin Case', price: 100, image: 'images/case2.webp', model: "", contains: [ ITEMS_DB.g22_nest, ITEMS_DB.ump45_beast, ITEMS_DB.p350_forest, ITEMS_DB.fabm_fatal, ITEMS_DB.m60_grunge ] },
    { id: 'furious', name: 'Furious Case', price: 500, image: 'images/furios.webp', model: '', contains: [ ITEMS_DB.famas_monester, ITEMS_DB.m16_seaglint, ITEMS_DB.m4a1_impact, ITEMS_DB.m16_ironwill ] },
    { id: 'legend', name: 'Legend Case', price: 2000, image: 'images/legend.jpg', model: '', contains: [ ITEMS_DB.akr_carbon, ITEMS_DB.awp_dragon, ITEMS_DB.k_gold, ITEMS_DB.gloves_furious, ITEMS_DB.karambit_univers, ITEMS_DB.dualdaggers_retrorade, ITEMS_DB.mantis_eclips ] }
];


// --- ГЛАВНЫЙ СКРИПТ ---
document.addEventListener('DOMContentLoaded', () => {
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand();
        document.body.style.setProperty('--tg-theme-bg-color', window.Telegram.WebApp.themeParams.bg_color);
        document.body.style.setProperty('--tg-theme-secondary-bg-color', window.Telegram.WebApp.themeParams.secondary_bg_color);
        document.body.style.setProperty('--tg-theme-text-color', window.Telegram.WebApp.themeParams.text_color);
        document.body.style.setProperty('--tg-theme-hint-color', window.Telegram.WebApp.themeParams.hint_color);
    }
    
    // --- ЛОГИКА ДЛЯ КНОПКИ СБРОСА ---
    document.getElementById('hard-reset-button').addEventListener('click', () => {
        if (confirm("Вы уверены, что хотите сбросить весь прогресс? Баланс станет 10,000, а инвентарь очистится.")) {
            localStorage.removeItem('csMoneyState');
            location.reload();
        }
    });

    let state = {};
    const defaultState = { balance: 10000, inventory: [], currentPage: 'page-cases', isSpinning: false, upgrade: { selectedItem: null, multiplier: null, targetItem: null, chance: 0, }, mines: { isActive: false, bet: 0, minesCount: 0, grid: [], revealedCount: 0, nextMultiplier: 0, currentWin: 0 }};

    const DOM = {
        logo: document.querySelector('.logo'), balanceEl: document.getElementById('balance-amount'),
        pages: document.querySelectorAll('.page'), navLinks: document.querySelectorAll('.nav-link'),
        inventoryEl: document.getElementById('inventory'), inventoryActionTextEl: document.getElementById('inventory-action-text'),
        toastEl: document.getElementById('toast-notification'), caseSelectionEl: document.getElementById('case-selection'),
        rouletteEl: document.getElementById('roulette'), resultItemEl: document.getElementById('result-item'),
        modal: document.getElementById('modal-preview'), modalCloseBtn: document.querySelector('.modal-close-button'),
        modalCaseName: document.getElementById('modal-case-name'), modalCaseItems: document.getElementById('modal-case-items'),
        yourItemSlot: document.getElementById('your-item-slot'), targetItemSlot: document.getElementById('target-item-slot'),
        chanceDisplay: document.getElementById('upgrade-chance'), upgradeButton: document.getElementById('upgrade-button'),
        upgradeWheel: document.getElementById('upgrade-wheel'), multipliersContainer: document.querySelector('.multipliers'),
        minesGridEl: document.getElementById('mines-grid'),
    };

    function loadState() { 
        const savedState = localStorage.getItem('csMoneyState'); 
        state = savedState ? JSON.parse(savedState) : { ...defaultState }; 
        state.currentPage = 'page-cases'; 
        state.mines.isActive = false; 
        state.isSpinning = false;
    }
    function saveState() { localStorage.setItem('csMoneyState', JSON.stringify(state)); }

    function render() {
        DOM.balanceEl.textContent = Math.floor(state.balance);
        renderInventory();
        DOM.pages.forEach(p => p.classList.toggle('active', p.id === state.currentPage));
        DOM.navLinks.forEach(l => l.classList.toggle('active', l.dataset.page === state.currentPage));
        const actionTextMap = { 'page-cases': 'Нажмите на предмет, чтобы продать его.', 'page-upgrade': 'Выберите предмет для апгрейда.', 'page-game-mines': 'Ваши предметы.', 'page-games-hub': 'Нажмите на предмет, чтобы продать его.' };
        DOM.inventoryActionTextEl.textContent = actionTextMap[state.currentPage] || actionTextMap['page-cases'];
        if (state.currentPage === 'page-cases') renderCases();
        if (state.currentPage === 'page-upgrade') renderUpgradePage();
        if (state.currentPage === 'page-game-mines') renderMinesGame();
    }

    function createItemCard(item, context = {}) {
        const { isSlot, isInventory, inventoryIndex } = context;
        const selectedClass = isInventory && state.upgrade.selectedItem?.inventoryIndex === inventoryIndex ? 'selected' : '';
        const mediaElement = `<img src="${item.image}" alt="${item.name}" class="item-image" loading="lazy">`;
        return `<div class="item-card ${item.rarity || ''} ${selectedClass}" ${isInventory ? `data-inventory-index="${inventoryIndex}"` : ''}>
                    ${mediaElement}
                    <div class="item-info">
                        <p class="item-name">${item.name}</p>
                        <p class="item-price">${item.price} G</p>
                    </div>
                </div>`;
    }
    
    function renderInventory() {
        if (state.inventory.length === 0) { 
            DOM.inventoryEl.innerHTML = '<p class="placeholder">Пусто... Откройте кейс!</p>'; 
            return; 
        }
        DOM.inventoryEl.innerHTML = state.inventory.map((item, i) => createItemCard(item, { isInventory: true, inventoryIndex: i })).join('');
    }

    function renderCases() {
        if (!DOM.caseSelectionEl) return;
        DOM.caseSelectionEl.innerHTML = CASES_DB.map(c => {
            const caseMedia = `<img src="${c.image}" alt="${c.name}" class="item-image">`;
            return `<div class="case-card">
                        ${caseMedia}
                        <h3>${c.name}</h3>
                        <p class="price">${c.price} G</p>
                        <div class="case-buttons">
                            <button class="control-button preview-case-btn" data-case-id="${c.id}">?</button>
                            <button class="control-button open-case-btn" data-case-id="${c.id}">Открыть</button>
                        </div>
                    </div>`;
        }).join('');
    }

    function renderUpgradePage() {
        if (state.upgrade.selectedItem) DOM.yourItemSlot.innerHTML = createItemCard(state.upgrade.selectedItem.item, { isSlot: true }); else DOM.yourItemSlot.innerHTML = '<p class="placeholder">Выберите скин</p>';
        if (state.upgrade.targetItem) DOM.targetItemSlot.innerHTML = createItemCard(state.upgrade.targetItem, { isSlot: true }); else DOM.targetItemSlot.innerHTML = '<p class="placeholder">Выберите множитель</p>';
        const chancePercent = state.upgrade.chance.toFixed(2);
        DOM.chanceDisplay.textContent = `${chancePercent}%`;
        const successAngle = (chancePercent / 100) * 360;
        DOM.upgradeWheel.style.backgroundImage = `conic-gradient(var(--success) 0deg, var(--success) ${successAngle}deg, var(--fail) ${successAngle}deg, var(--fail) 360deg)`;
        DOM.upgradeButton.disabled = !state.upgrade.selectedItem || !state.upgrade.targetItem || state.isSpinning;
        DOM.multipliersContainer.querySelectorAll('.multiplier-btn').forEach(btn => btn.classList.remove('active'));
        if(state.upgrade.multiplier) { const activeBtn = DOM.multipliersContainer.querySelector(`[data-multiplier="${state.upgrade.multiplier}"]`); if (activeBtn) activeBtn.classList.add('active');}
    }
    
    function renderMinesGame() {
        document.getElementById('mines-bet-amount').disabled = state.mines.isActive;
        document.getElementById('mines-count').disabled = state.mines.isActive;
        document.getElementById('mines-start-button').disabled = state.mines.isActive;
        document.getElementById('mines-cashout-button').disabled = !state.mines.isActive || state.mines.revealedCount === 0;
        document.getElementById('mines-next-multiplier').textContent = `x${state.mines.nextMultiplier.toFixed(2)}`;
        document.getElementById('mines-current-win').textContent = Math.floor(state.mines.currentWin);
        DOM.minesGridEl.classList.toggle('game-over', !state.mines.isActive && state.mines.grid.length > 0);
        DOM.minesGridEl.innerHTML = Array(25).fill().map((_, i) => {
            const r = Math.floor(i / 5), c = i % 5;
            const cellData = state.mines.grid[r]?.[c];
            const isGameOver = !state.mines.isActive && state.mines.grid.length > 0;
            const revealed = cellData?.revealed || isGameOver;
            const isMine = cellData?.isMine;
            return `<div class="mine-cell ${revealed ? `revealed ${isMine ? 'mine' : 'safe'}` : ''}" data-row="${r}" data-col="${c}">${revealed ? (isMine ? '💣' : '💎') : ''}</div>`;
        }).join('');
    }

    document.body.addEventListener('click', (e) => {
        const target = e.target.closest('button, .nav-link, .logo, .game-card, .item-card[data-inventory-index], .mine-cell:not(.revealed), .modal-close-button');
        if (!target) return;
        if (target.matches('.nav-link, .logo')) { e.preventDefault(); state.currentPage = target.dataset.page; resetAllGames(); render(); return; }
        if (target.matches('.game-card:not(.disabled)')) { state.currentPage = target.dataset.page; render(); return; }
        if (target.matches('.item-card[data-inventory-index]')) { handleInventoryClick(parseInt(target.dataset.inventoryIndex)); return; }
        switch(target.dataset.caseId ? 'case-btn' : target.id) {
            case 'case-btn':
                const caseId = target.dataset.caseId;
                if(target.classList.contains('open-case-btn')) handleCaseOpening(caseId);
                else if(target.classList.contains('preview-case-btn')) showCasePreview(caseId);
                break;
            case 'upgrade-button': handleUpgrade(); break;
            case 'mines-start-button': startMinesGame(); break;
            case 'mines-cashout-button': cashoutMines(); break;
        }
        if (target.matches('.multiplier-btn')) { state.upgrade.multiplier = parseInt(target.dataset.multiplier); calculateUpgrade(); render(); }
        if (target.matches('.mine-cell')) { revealMineCell(parseInt(target.dataset.row), parseInt(target.dataset.col)); }
        if (target.matches('.modal-close-button')) { DOM.modal.style.display = "none"; }
    });
    
    window.onclick = (e) => { if (e.target == DOM.modal) DOM.modal.style.display = "none"; }

    function handleInventoryClick(index) {
        if(isNaN(index)) return;
        const item = state.inventory[index];
        if (!item) return;
        if (state.currentPage === 'page-upgrade') {
            state.upgrade.selectedItem = { item, inventoryIndex: index };
            calculateUpgrade();
        } else {
            state.balance += item.price;
            state.inventory.splice(index, 1);
            showToast(`Продано ${item.name} за ${item.price} G`, 'success');
        }
        saveState(); render();
    }

    function handleCaseOpening(caseId) {
        if (state.isSpinning) return;
        const selectedCase = CASES_DB.find(c => c.id === caseId);

        state.isSpinning = true;
        // БАЛАНС НЕ ТРАТИТСЯ
        // state.balance -= selectedCase.price; 
        
        render();
        
        const wonItem = selectedCase.contains[Math.floor(Math.random() * selectedCase.contains.length)];
        let rouletteItems = Array(200).fill(0).map(() => selectedCase.contains[Math.floor(Math.random() * selectedCase.contains.length)]);
        const winning_index = 190;
        rouletteItems[winning_index] = wonItem;

        DOM.rouletteEl.style.transition = 'none'; 
        DOM.rouletteEl.style.transform = 'translateX(0)';
        DOM.rouletteEl.innerHTML = rouletteItems.map(item => createItemCard(item)).join('');
        DOM.resultItemEl.innerHTML = '<p class="placeholder">Открываем...</p>';

        setTimeout(() => {
            DOM.rouletteEl.style.transition = 'transform 18s cubic-bezier(0.25, 0.1, 0.25, 1.0)';
            
            const itemCardWidth = 110;
            const stopPosition = (winning_index * itemCardWidth) - (DOM.rouletteEl.parentElement.offsetWidth / 2) + (itemCardWidth / 2);
            DOM.rouletteEl.style.transform = `translateX(-${stopPosition}px)`;
        }, 100);

        setTimeout(() => {
            state.isSpinning = false; 
            state.inventory.push(wonItem); 
            showToast(`Выпал ${wonItem.name}!`, wonItem.rarity);
            DOM.resultItemEl.innerHTML = createItemCard(wonItem); 
            saveState(); 
            render();
        }, 18100);
    }
    
    function showCasePreview(caseId) {
        const selectedCase = CASES_DB.find(c => c.id === caseId); if (!selectedCase) return;
        DOM.modalCaseName.textContent = selectedCase.name;
        DOM.modalCaseItems.innerHTML = [...selectedCase.contains].sort((a, b) => b.price - a.price).map(item => createItemCard(item, {isPreview: true})).join('');
        DOM.modal.style.display = "block";
    }

    function calculateUpgrade() {
        if (!state.upgrade.selectedItem || !state.upgrade.multiplier) return;
        const { price, id } = state.upgrade.selectedItem.item;
        const targetPrice = price * state.upgrade.multiplier;
        const possibleTargets = Object.values(ITEMS_DB).filter(item => item.price >= targetPrice && item.id !== id).sort((a,b) => a.price - b.price);
        state.upgrade.targetItem = possibleTargets[0] || null;
        state.upgrade.chance = state.upgrade.targetItem ? Math.min((price / state.upgrade.targetItem.price) * 50, 95) : 0;
    }

    function handleUpgrade() {
        if (state.isSpinning || !state.upgrade.selectedItem || !state.upgrade.targetItem) return;
        state.isSpinning = true; render();
        
        const { item, inventoryIndex } = state.upgrade.selectedItem;
        const isSuccess = Math.random() * 100 < state.upgrade.chance;
        const finalRotation = 360 * 5 + (isSuccess ? (Math.random() * ((state.upgrade.chance/100)*360 - 20) + 10) : ((state.upgrade.chance/100)*360 + (Math.random() * (360-((state.upgrade.chance/100)*360) - 20) + 10)));

        DOM.upgradeWheel.style.transition = 'transform 5s cubic-bezier(0.2, 0.8, 0.2, 1)';
        DOM.upgradeWheel.style.transform = `rotate(${finalRotation}deg)`;
        
        state.inventory.splice(inventoryIndex, 1);
        
        setTimeout(() => {
            if (isSuccess) { state.inventory.push(state.upgrade.targetItem); showToast('Апгрейд успешен!', 'success'); }
            else { showToast(`Апгрейд провален! Вы потеряли ${item.name}`, 'fail'); }
            
            DOM.upgradeWheel.style.transition = 'none';
            DOM.upgradeWheel.style.transform = `rotate(0deg)`;
            
            resetAllGames(); state.isSpinning = false; saveState(); render();
        }, 5100);
    }

    function startMinesGame() {
        const bet = parseInt(document.getElementById('mines-bet-amount').value);
        const minesCount = parseInt(document.getElementById('mines-count').value);
        if (minesCount < 3 || minesCount > 24) { showToast('Кол-во мин от 3 до 24!', 'fail'); return; }

        // БАЛАНС НЕ ТРАТИТСЯ
        // state.balance -= bet;

        state.mines = { isActive: true, bet, minesCount, grid: [], revealedCount: 0, nextMultiplier: 0, currentWin: 0 };
        for (let r = 0; r < 5; r++) { state.mines.grid[r] = Array(5).fill().map(() => ({ revealed: false, isMine: false })); }
        let minesPlaced = 0;
        while (minesPlaced < minesCount) {
            const r = Math.floor(Math.random() * 5), c = Math.floor(Math.random() * 5);
            if (!state.mines.grid[r][c].isMine) { state.mines.grid[r][c].isMine = true; minesPlaced++; }
        }
        calculateMinesMultiplier(); saveState(); render();
    }

    function revealMineCell(r, c) {
        if (!state.mines.isActive || state.mines.grid[r][c].revealed) return;
        const cell = state.mines.grid[r][c]; cell.revealed = true;
        if (cell.isMine) {
            showToast(`Вы проиграли ${state.mines.bet} G!`, 'fail'); 
            state.mines.isActive = false;
        } else {
            state.mines.revealedCount++;
            state.mines.currentWin = state.mines.bet * state.mines.nextMultiplier;
            calculateMinesMultiplier();
            if (state.mines.revealedCount === (25 - state.mines.minesCount)) {
                showToast('Вы нашли все алмазы!', 'success');
                state.mines.isActive = false;
            }
        }
        saveState(); render();
    }

    function cashoutMines() {
        if (!state.mines.isActive || state.mines.revealedCount === 0) return;
        showToast(`Выиграно ${Math.floor(state.mines.currentWin)} G!`, 'success');
        state.balance += state.mines.currentWin;
        state.mines.isActive = false;
        saveState(); render();
    }

    function calculateMinesMultiplier() {
        const total = 25, safe = total - state.mines.minesCount;
        if (state.mines.revealedCount >= safe) { state.mines.nextMultiplier = state.mines.nextMultiplier; return; } 
        const chance = (safe - state.mines.revealedCount) / (total - state.mines.revealedCount);
        state.mines.nextMultiplier = (0.95 / chance) * (state.mines.nextMultiplier || 1);
    }
    
    function showToast(message, type = 'success') {
        const rarityTypes = ['common', 'rare', 'epic', 'legendary'];
        if (rarityTypes.includes(type)) { DOM.toastEl.style.backgroundImage = `radial-gradient(circle, var(--${type}-color) 0%, var(--bg-main) 120%)`;}
        else { DOM.toastEl.style.backgroundImage = `none`; DOM.toastEl.style.backgroundColor = `var(--${type})`; }
        DOM.toastEl.textContent = message; DOM.toastEl.classList.add('show');
        setTimeout(() => { DOM.toastEl.classList.remove('show'); }, 3000);
    }
    
    function resetAllGames() { 
        state.upgrade = { ...defaultState.upgrade }; 
        state.mines.isActive = false; 
    }
    
    loadState();
    render();
});