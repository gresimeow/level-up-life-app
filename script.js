document.addEventListener('DOMContentLoaded', () => {
    // --- Constants ---
    const STORAGE_KEY = 'levelUpLifeData_v5'; // Updated key
    const DEFAULT_XP_INCREMENT = 25;
    const QUEST_COMPLETION_BONUS_XP = 100;
    const QUEST_COMPLETION_BONUS_SHARDS = 10;
    const SKILL_LEVEL_MULTIPLIER = 1.5;
    const OVERALL_LEVEL_MULTIPLIER = 1.7;
    const INITIAL_SKILL_XP_TARGET = 100;
    const INITIAL_OVERALL_XP_TARGET = 500;
    const PIN_LENGTH = 4;

    // --- State Variables ---
    let appState = {
        username: null, pinHash: null, shards: 0, ownedItemIds: [],
        overallLevel: 1, overallXp: 0, overallXpToNextLevel: INITIAL_OVERALL_XP_TARGET,
        skills: [], // Start empty, user adds them
        quests: [],
        shopItems: [], // Populated on init
    };
    let isLocked = true;

    // --- DOM Elements ---
    const loadingOverlay = document.getElementById('loading-overlay');
    const pinModal = document.getElementById('pin-modal');
    const pinInput = document.getElementById('pin-input');
    const pinSubmitButton = document.getElementById('pin-submit-button');
    const pinModalTitle = document.getElementById('pin-modal-title');
    const pinError = document.getElementById('pin-error');
    const settingsModal = document.getElementById('settings-modal');
    const settingsButton = document.getElementById('settings-button');
    const settingsCloseButton = document.getElementById('settings-close-button');
    const settingNicknameInput = document.getElementById('setting-nickname');
    const saveNicknameButton = document.getElementById('save-nickname-button');
    const settingCurrentPinInput = document.getElementById('setting-current-pin');
    const settingNewPinInput = document.getElementById('setting-new-pin');
    const settingConfirmPinInput = document.getElementById('setting-confirm-pin');
    const savePinButton = document.getElementById('save-pin-button');
    const pinChangeError = document.getElementById('pin-change-error');
    const pinChangeSuccess = document.getElementById('pin-change-success');
    const addSkillModal = document.getElementById('add-skill-modal');
    const addSkillCloseButton = document.getElementById('add-skill-close-button');
    const addSkillForm = document.getElementById('add-skill-form');
    const newSkillNameInput = document.getElementById('new-skill-name');
    const newSkillIconInput = document.getElementById('new-skill-icon');
    const newSkillColorInput = document.getElementById('new-skill-color');
    const addSkillError = document.getElementById('add-skill-error');

    const appContainer = document.getElementById('app-container');
    const appTitle = document.getElementById('app-title');
    const contentSections = document.querySelectorAll('.content-section');
    const navButtons = document.querySelectorAll('.nav-button');
    const welcomeMessage = document.getElementById('welcome-message');
    const footerUsername = document.getElementById('footer-username');
    const userCurrencyDisplay = document.getElementById('user-currency-display');

    const overallLevelEl = document.getElementById('overall-level');
    const overallXpEl = document.getElementById('overall-xp');
    const overallXpNextEl = document.getElementById('overall-xp-next');
    const overallXpBarEl = document.getElementById('overall-xp-bar');
    const overallXpBarText = document.querySelector('#overall-xp-bar .progress-bar-text');
    const resetDataButton = document.getElementById('reset-data-button');

    const skillsListContainer = document.getElementById('skills-list');
    const addSkillButton = document.getElementById('add-skill-button');

    const newQuestForm = document.getElementById('new-quest-form');
    const questNameInput = document.getElementById('quest-name');
    const questCategorySelect = document.getElementById('quest-category');
    const questStepsInputsContainer = document.getElementById('quest-steps-inputs');
    const addStepButton = document.getElementById('add-step-button');
    const activeQuestListContainer = document.getElementById('active-quest-list');
    const completedQuestListContainer = document.getElementById('completed-quest-list');
    const completedQuestsHeader = document.getElementById('completed-quests-header');
    const completedQuestContainer = document.getElementById('completed-quest-container');

    const shopListContainer = document.getElementById('shop-items-list');
    const inventoryListContainer = document.getElementById('inventory-items-list');

    const notificationEl = document.getElementById('notification');
    let notificationTimeout;


    // --- Shop Item Definition ---
    function defineShopItems() {
        return [
            { id: 'theme_dark', name: 'Midnight Theme', description: 'A sleek, dark look for your dashboard.', icon: '🌙', cost: 150, type: 'theme' },
            { id: 'theme_forest', name: 'Forest Theme', description: 'Bring calming nature vibes.', icon: '🌲', cost: 150, type: 'theme' },
            { id: 'theme_ocean', name: 'Ocean Theme', description: 'Ride the waves of productivity.', icon: '🌊', cost: 150, type: 'theme' },
            { id: 'collect_gem_rare', name: 'Rare Gemstone', description: 'A sparkling collectible.', icon: '💎', cost: 500, type: 'collectible' },
            { id: 'collect_statue_gold', name: 'Golden Statue', description: 'Proof of your dedication!', icon: '🏆', cost: 1000, type: 'collectible' },
            { id: 'collect_badge_lvl10', name: 'Level 10 Badge', description: 'Awarded for reaching Level 10 overall.', icon: '🔟', cost: 50, type: 'collectible' },
            { id: 'collect_sticker_cat', name: 'Cute Cat Sticker', description: 'A purrfectly adorable sticker.', icon: '😻', cost: 25, type: 'collectible' },
            { id: 'collect_sticker_star', name: 'Shooting Star Sticker', description: 'Make a wish!', icon: '🌟', cost: 25, type: 'collectible' },
            { id: 'bg_stars', name: 'Starry Night Background', description: 'Gaze at the cosmos.', icon: '✨', cost: 200, type: 'background' },
            { id: 'bg_mountains', name: 'Mountain Peak Background', description: 'Reach new heights.', icon: '⛰️', cost: 200, type: 'background' },
             { id: 'collect_potion_blue', name: 'Mystic Blue Potion', description: 'What does it do?', icon: '🧪', cost: 75, type: 'collectible' },
             { id: 'collect_scroll_ancient', name: 'Ancient Scroll', description: 'Contains forgotten knowledge.', icon: '📜', cost: 120, type: 'collectible' },
             { id: 'theme_sunset', name: 'Sunset Theme', description: 'Warm colors for a relaxing end.', icon: '🌇', cost: 150, type: 'theme' },
             { id: 'collect_key_mystery', name: 'Mystery Key', description: 'Unlocks... something?', icon: '🔑', cost: 250, type: 'collectible' },
             { id: 'bg_clouds', name: 'Cloudy Sky Background', description: 'Float through your tasks.', icon: '☁️', cost: 200, type: 'background' },
             { id: 'collect_artifact_orb', name: 'Glowing Orb Artifact', description: 'Pulses with soft energy.', icon: '🔮', cost: 750, type: 'collectible' },
        ];
    }


    // --- Initialization & Security Flow ---

    function simpleHash(str) {
        let hash = 0;
        if (!str || str.length === 0) return hash.toString(16);
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char; hash |= 0;
        }
        return (hash * 31).toString(16);
    }

    function initializeApp() {
        showLoadingOverlay(true, "Initializing...");
        appState.shopItems = defineShopItems();
        loadInitialState();
    }

    function loadInitialState() {
        try {
            const savedData = localStorage.getItem(STORAGE_KEY);
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                if (parsedData.pinHash && parsedData.username) {
                    appState.pinHash = parsedData.pinHash;
                    appState.username = parsedData.username;
                    appState.shards = parsedData.shards ?? 0;
                    appState.ownedItemIds = Array.isArray(parsedData.ownedItemIds) ? parsedData.ownedItemIds : [];
                    promptForPin();
                } else { handleFirstTimeSetup(); }
            } else { handleFirstTimeSetup(); }
        } catch (error) { console.error("Initial load error:", error); handleFirstTimeSetup(); }
    }

    function handleFirstTimeSetup() {
        showLoadingOverlay(false);
        setupPin();
    }

    function setupPin() {
        pinModalTitle.textContent = "Create a 4-Digit PIN";
        pinInput.value = ''; pinError.classList.add('hidden');
        pinModal.classList.remove('hidden'); pinInput.focus();
        pinSubmitButton.onclick = () => {
            const enteredPin = pinInput.value;
            if (enteredPin.length === PIN_LENGTH && /^\d+$/.test(enteredPin)) {
                const confirmedPin = prompt(`Re-enter PIN to confirm:`);
                if (confirmedPin === enteredPin) {
                    appState.pinHash = simpleHash(enteredPin);
                    pinModal.classList.add('hidden');
                    setupNickname();
                } else if (confirmedPin !== null) { pinError.textContent = "PINs don't match."; pinError.classList.remove('hidden'); pinInput.value=''; pinInput.focus(); }
                else { pinInput.value=''; pinInput.focus(); }
            } else { pinError.textContent = `PIN must be ${PIN_LENGTH} digits.`; pinError.classList.remove('hidden'); pinInput.value=''; pinInput.focus(); }
        };
    }

    function setupNickname() {
         const username = prompt("Enter your Nickname:");
         if (username && username.trim()) {
             appState.username = username.trim();
             initializeDefaultGameData();
             saveData();
             unlockApp();
         } else { showNotification("Nickname required.", 3000, true); setupNickname(); }
    }

    function promptForPin() {
        showLoadingOverlay(false);
        pinModalTitle.textContent = "Enter Your PIN";
        pinInput.value = ''; pinError.classList.add('hidden');
        pinModal.classList.remove('hidden'); pinInput.focus();
        pinSubmitButton.onclick = () => {
             const enteredPin = pinInput.value;
             if (enteredPin.length === PIN_LENGTH) {
                 if (simpleHash(enteredPin) === appState.pinHash) { pinModal.classList.add('hidden'); loadDataAndUnlock(); }
                 else { pinError.textContent = "Incorrect PIN."; pinError.classList.remove('hidden'); pinInput.value=''; pinInput.focus(); }
             } else { pinError.textContent = `PIN must be ${PIN_LENGTH} digits.`; pinError.classList.remove('hidden'); pinInput.value=''; pinInput.focus(); }
         };
    }

     function loadDataAndUnlock() {
         showLoadingOverlay(true, "Loading your world...");
         try {
             const savedData = localStorage.getItem(STORAGE_KEY);
             if (savedData) {
                  const parsedData = JSON.parse(savedData);
                  // PIN/User/Shards/Inventory already loaded
                  appState.overallLevel = parsedData.overallLevel ?? 1;
                  appState.overallXp = parsedData.overallXp ?? 0;
                  appState.overallXpToNextLevel = parsedData.overallXpToNextLevel ?? INITIAL_OVERALL_XP_TARGET;
                  appState.skills = Array.isArray(parsedData.skills) ? parsedData.skills : []; // Load saved skills
                  appState.quests = Array.isArray(parsedData.quests) ? parsedData.quests : [];
                  appState.shopItems = defineShopItems(); // Always use defined items, don't load from save
                  ensureIdsExist();
                  console.log("Game data loaded.");
                  unlockApp();
             } else { console.error("Data missing after unlock."); showNotification("Error: Saved data missing.", 5000, true); handleFirstTimeSetup();}
         } catch (error) { console.error("Load/Parse error:", error); showNotification("Error loading progress.", 5000, true); showLoadingOverlay(false); }
    }

    function unlockApp() {
        isLocked = false;
        appContainer.classList.remove('hidden');
        setupEventListeners();
        renderUI();
        setActiveSection('dashboard-section');
        showLoadingOverlay(false);
        console.log("App Unlocked and Ready!");
        showNotification(`Welcome back, ${appState.username}!`, 2500);
    }

    function showLoadingOverlay(show, message = "Loading...") {
         if (loadingOverlay) {
             loadingOverlay.querySelector('p').textContent = message;
             loadingOverlay.classList.toggle('hidden', !show);
         }
    }


    // --- Data Persistence & Management ---

    function initializeDefaultGameData() {
        appState.shards = 0;
        appState.ownedItemIds = [];
        appState.overallLevel = 1;
        appState.overallXp = 0;
        appState.overallXpToNextLevel = INITIAL_OVERALL_XP_TARGET;
        appState.skills = []; // NO DEFAULT SKILLS
        appState.quests = [];
        appState.shopItems = defineShopItems(); // Ensure shop items are set
        console.log("Default game data initialized.");
    }

    function ensureIdsExist() {
         appState.skills.forEach(skill => { if (!skill.id) skill.id = generateId('sk'); });
         appState.quests.forEach(quest => {
             if (!quest.id) quest.id = generateId('q');
             if(quest.steps) quest.steps.forEach(step => { if (!step.id) step.id = generateId('s'); });
             else quest.steps = [];
         });
    }

    function saveData() {
        if (isLocked) return;
        try {
            // Don't save shopItems array itself, it's static definition
            const stateToSave = { ...appState, shopItems: undefined };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
        } catch (error) { console.error("Save error:", error); showNotification("Error saving!", 5000, true); }
    }

    function resetData() {
         const enteredPin = prompt(`Enter PIN to reset ALL data:`);
         if (enteredPin !== null) {
             if (simpleHash(enteredPin) === appState.pinHash) {
                  if (confirm("Reset ALL progress? This cannot be undone.")) {
                     localStorage.removeItem(STORAGE_KEY);
                     isLocked = true; appContainer.classList.add('hidden'); appState = {};
                     showNotification("Data reset. Reloading...", 5000);
                     setTimeout(() => window.location.reload(), 2000);
                 }
             } else { showNotification("Incorrect PIN.", 3000, true); }
         }
    }


    // --- Utility Functions ---
    function showNotification(message, duration = 3000, isError = false) {
         clearTimeout(notificationTimeout);
         notificationEl.textContent = message;
         notificationEl.className = 'notification';
         if (isError) notificationEl.classList.add('error');
         notificationEl.classList.add('show');
         notificationTimeout = setTimeout(() => notificationEl.classList.remove('show'), duration);
    }

    function generateId(prefix = 'id') {
        return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    }

    function findSkillByName(name) {
         if (!name) return null;
         return appState.skills.find(s => s.name.toLowerCase() === name.toLowerCase());
    }

    // --- Core Logic: XP, Leveling, Quests, Currency, Shop, Skills ---

    function addShards(amount) {
         if (isLocked || amount <= 0) return;
         appState.shards += amount;
         // console.log(`+${amount} Shards. Total: ${appState.shards}`);
         updateCurrencyDisplay();
    }

    function spendShards(amount) {
         if (isLocked || amount <= 0 || appState.shards < amount) return false;
         appState.shards -= amount;
         // console.log(`-${amount} Shards. Remaining: ${appState.shards}`);
         updateCurrencyDisplay();
         return true;
     }

    function addXp(skillName, xpAmount) {
        if (xpAmount <= 0 || isLocked) return;
        let skillLeveledUp = false, overallLeveledUp = false;
        let skillLeveledUpMessage = '', overallLeveledUpMessage = '';
        let totalXpGained = 0;
        const skill = findSkillByName(skillName);

        if (skill) {
            skill.currentXp += xpAmount; totalXpGained += xpAmount;
            while (skill.currentXp >= skill.xpToNextLevel) {
                skill.level++; skill.currentXp = Math.max(0, skill.currentXp - skill.xpToNextLevel);
                skill.xpToNextLevel = Math.round(skill.xpToNextLevel * SKILL_LEVEL_MULTIPLIER);
                skillLeveledUp = true; skillLeveledUpMessage = `${skill.icon} ${skill.name} Lvl ${skill.level}! ✨`;
                console.log(`SKILL LVL UP: ${skill.name} to ${skill.level}`);
            }
            updateSkillCardUI(skill.id);
        } else { totalXpGained += xpAmount; console.warn(`XP added directly, skill "${skillName}" not found.`); }

        if (totalXpGained > 0) {
            appState.overallXp += totalXpGained;
            while (appState.overallXp >= appState.overallXpToNextLevel) {
                appState.overallLevel++; appState.overallXp = Math.max(0, appState.overallXp - appState.overallXpToNextLevel);
                appState.overallXpToNextLevel = Math.round(appState.overallXpToNextLevel * OVERALL_LEVEL_MULTIPLIER);
                overallLeveledUp = true; overallLeveledUpMessage = `Overall Level ${appState.overallLevel}! 🎉`;
                console.log(`OVERALL LVL UP: To ${appState.overallLevel}`);
            }
            updateDashboardStatsUI();
        }
        saveData(); // Save after all XP calculations
        if (skillLeveledUp) showNotification(skillLeveledUpMessage);
        if (overallLeveledUp) setTimeout(() => showNotification(overallLeveledUpMessage), skillLeveledUp ? 600 : 100);
    }

    function completeQuestStep(questId, stepId) {
         if (isLocked) return false;
         const quest = appState.quests.find(q => q.id === questId); if (!quest || quest.isCompleted) return false;
         const step = quest.steps.find(s => s.id === stepId); if (!step || step.isCompleted) return false;

         step.isCompleted = true;
         addXp(quest.category, step.xpReward); // Calls save

         const allStepsDone = quest.steps.every(s => s.isCompleted);
         if (allStepsDone) {
             quest.isCompleted = true;
             let completionMessage = `Quest '${quest.name}' Completed!`;
             if (QUEST_COMPLETION_BONUS_XP > 0) {
                 appState.overallXp += QUEST_COMPLETION_BONUS_XP; completionMessage += ` +${QUEST_COMPLETION_BONUS_XP} XP`;
                  while (appState.overallXp >= appState.overallXpToNextLevel) { /* level up check */
                       appState.overallLevel++; appState.overallXp -= appState.overallXpToNextLevel;
                       appState.overallXpToNextLevel = Math.round(appState.overallXpToNextLevel * OVERALL_LEVEL_MULTIPLIER);
                       setTimeout(() => showNotification(`Overall Level ${appState.overallLevel}! 🎉`), 800); // Delayed notification for bonus level up
                   }
                  updateDashboardStatsUI();
             }
             if (QUEST_COMPLETION_BONUS_SHARDS > 0) { addShards(QUEST_COMPLETION_BONUS_SHARDS); completionMessage += ` +${QUEST_COMPLETION_BONUS_SHARDS} 💎`; }
             showNotification(completionMessage + " 🚩", 4000);
             saveData(); // Save after bonuses
             renderQuestsUI(); // Move to completed
             return true;
         } else {
             // Step done, quest not. State saved via addXp.
             updateQuestItemUI(questId);
             return true;
         }
    }

    function handleAddNewQuest(event) {
         event.preventDefault(); if (isLocked) return;
         const questName = questNameInput.value.trim(); const category = questCategorySelect.value;
         if (!questName || !category) { showNotification("Name and Category required.", 3000, true); return; }
         const steps = []; const stepInputGroups = questStepsInputsContainer.querySelectorAll('.quest-step-input-group');
         if (stepInputGroups.length === 0) { showNotification("Add at least one step.", 3000, true); return; }
         let formIsValid = true;
         stepInputGroups.forEach((group, index) => {
            const descInput = group.querySelector('.quest-step-desc'); const xpInput = group.querySelector('.quest-step-xp');
            const description = descInput.value.trim(); const xpReward = parseInt(xpInput.value, 10);
            descInput.style.borderColor = ''; xpInput.style.borderColor = '';
            if (!description || isNaN(xpReward) || xpReward <= 0) {
                showNotification(`Invalid Step ${index + 1}.`, 4000, true);
                if (!description) descInput.style.borderColor = 'var(--color-danger)';
                if (isNaN(xpReward) || xpReward <= 0) xpInput.style.borderColor = 'var(--color-danger)';
                formIsValid = false;
            } else { steps.push({ id: generateId('s'), description, xpReward, isCompleted: false }); }
         });
         if (!formIsValid) return;

         const newQuest = { id: generateId('q'), name: questName, category, isCompleted: false, steps };
         appState.quests.unshift(newQuest); saveData();
         const questElement = createQuestElement(newQuest);
         activeQuestListContainer.prepend(questElement); checkEmptyQuestLists(); // Update placeholders if needed
         newQuestForm.reset(); questStepsInputsContainer.innerHTML = ''; addQuestStepInput(true);
         showNotification("New quest created! ✨");
     }

     function handleRemoveQuest(questId) {
         if (isLocked) return;
         const quest = appState.quests.find(q => q.id === questId); if (!quest) return;
         if (confirm(`Remove quest "${quest.name}"?`)) {
             appState.quests = appState.quests.filter(q => q.id !== questId); saveData();
             const questElement = document.querySelector(`.quest-item[data-quest-id="${questId}"]`);
             if (questElement) questElement.remove();
             else renderQuestsUI(); // Fallback
             showNotification(`Quest removed.`, 3000);
             checkEmptyQuestLists();
         }
     }

     function checkEmptyQuestLists() {
         const activePlaceholder = activeQuestListContainer.querySelector('.placeholder-text');
         const completedPlaceholder = completedQuestListContainer.querySelector('.placeholder-text');

         if (activeQuestListContainer.children.length === 0 || (activeQuestListContainer.children.length === 1 && activePlaceholder)) {
             if(!activePlaceholder) activeQuestListContainer.innerHTML = '<p class="placeholder-text">No active quests. Create one!</p>';
         } else if (activePlaceholder) {
             activePlaceholder.remove();
         }

         if (completedQuestListContainer.children.length === 0 || (completedQuestListContainer.children.length === 1 && completedPlaceholder)) {
              if(!completedPlaceholder) completedQuestListContainer.innerHTML = '<p class="placeholder-text">No quests completed yet.</p>';
              completedQuestContainer.classList.add('hidden'); // Hide section if empty
         } else {
              if(completedPlaceholder) completedPlaceholder.remove();
              completedQuestContainer.classList.remove('hidden'); // Ensure section is visible
         }
     }

    function handleAddSkill(event) {
        event.preventDefault(); if (isLocked) return;
        const name = newSkillNameInput.value.trim(); const icon = newSkillIconInput.value.trim(); const color = newSkillColorInput.value;
        addSkillError.classList.add('hidden');

        if (!name || !icon || !color) { addSkillError.textContent = "All fields required."; addSkillError.classList.remove('hidden'); return; }
        if (appState.skills.some(skill => skill.name.toLowerCase() === name.toLowerCase())) { addSkillError.textContent = `Skill "${name}" already exists.`; addSkillError.classList.remove('hidden'); return; }
        const emojiRegex = /(\p{Emoji_Presentation}|\p{Extended_Pictographic})/u; // Basic check
        if (!emojiRegex.test(icon) || Array.from(icon).length !== 1) { // Check length using Array.from for complex emojis
            addSkillError.textContent = "Use a single standard Emoji icon."; addSkillError.classList.remove('hidden'); return;
        }

        const newSkill = { id: generateId('sk'), name, icon, color, level: 1, currentXp: 0, xpToNextLevel: INITIAL_SKILL_XP_TARGET };
        appState.skills.push(newSkill); saveData();
        renderSkillsUI(); populateCategoryDropdown(); // Update UI
        showNotification(`Skill "${name}" ${icon} created!`, 3000);
        closeAddSkillModal();
    }

    function handleBuyItem(itemId) {
         if (isLocked) return;
         const item = appState.shopItems.find(i => i.id === itemId);
         if (!item || appState.ownedItemIds.includes(itemId) || appState.shards < item.cost) {
             showNotification(appState.ownedItemIds.includes(itemId) ? "Already owned!" : "Not enough 💎!", 2000, true);
             return;
         }
         if (spendShards(item.cost)) {
             appState.ownedItemIds.push(itemId); saveData();
             showNotification(`Purchased ${item.name} ${item.icon}!`, 3000);
             renderShopUI(); renderInventoryUI();
             // applyItemEffect(item); // TODO
         } else { showNotification("Purchase failed.", 3000, true); }
     }

    // --- UI Rendering Functions ---

    function renderUI() {
         if (isLocked) return;
         updateCurrencyDisplay(); renderDashboardUI(); renderSkillsUI(); renderQuestsUI();
         renderShopUI(); renderInventoryUI(); populateCategoryDropdown(); updateWelcomeMessage();
         // checkEmptyQuestLists(); // Called within renderQuestsUI now
    }

    function updateCurrencyDisplay() { if (userCurrencyDisplay) userCurrencyDisplay.textContent = `💎 ${appState.shards}`; }
    function updateWelcomeMessage() { if (welcomeMessage) welcomeMessage.textContent = `Welcome, ${appState.username}!`; if (footerUsername) footerUsername.textContent = appState.username; }
    function renderDashboardUI() { if (isLocked) return; updateDashboardStatsUI(); }
    function updateDashboardStatsUI() { if (isLocked) return; overallLevelEl.textContent = appState.overallLevel; overallXpEl.textContent = appState.overallXp; overallXpNextEl.textContent = appState.overallXpToNextLevel; const progress = appState.overallXpToNextLevel > 0 ? Math.min(100, (appState.overallXp / appState.overallXpToNextLevel) * 100) : 0; overallXpBarEl.style.width = `${progress}%`; if (overallXpBarText) overallXpBarText.innerHTML = `<span>${appState.overallXp}</span> / <span>${appState.overallXpToNextLevel}</span> XP`; }

    function createSkillElement(skill) {
         const card = document.createElement('article'); card.className = 'skill-card'; card.dataset.skillId = skill.id; card.style.setProperty('--skill-color', skill.color);
         const progress = skill.xpToNextLevel > 0 ? Math.min(100, (skill.currentXp / skill.xpToNextLevel) * 100) : 0;
         card.innerHTML = `
             <div class="skill-details">
                  <button class="button skill-xp-button" data-skill-name="${skill.name}" aria-label="Add ${DEFAULT_XP_INCREMENT} XP">+${DEFAULT_XP_INCREMENT} XP</button>
                 <h3>${skill.icon} ${skill.name}</h3>
                 <p>Level: <span class="skill-level">${skill.level}</span></p>
                 <div class="progress-bar-container"><div class="progress-bar skill-progress-bar" style="width: ${progress}%;"></div></div>
                 <p><span class="skill-current-xp">${skill.currentXp}</span> / <span class="skill-xp-next">${skill.xpToNextLevel}</span> XP</p>
             </div>`;
         return card;
    }

    function updateSkillCardUI(skillId) {
         if (isLocked) return;
         const skill = appState.skills.find(s => s.id === skillId); if (!skill) return;
         const card = skillsListContainer.querySelector(`.skill-card[data-skill-id="${skillId}"]`); if (!card) return;
         const levelEl = card.querySelector('.skill-level'); const currentXpEl = card.querySelector('.skill-current-xp');
         const nextXpEl = card.querySelector('.skill-xp-next'); const progressBarEl = card.querySelector('.skill-progress-bar');
         if (levelEl) levelEl.textContent = skill.level; if (currentXpEl) currentXpEl.textContent = skill.currentXp;
         if (nextXpEl) nextXpEl.textContent = skill.xpToNextLevel;
         if (progressBarEl) { const progress = skill.xpToNextLevel > 0 ? Math.min(100, (skill.currentXp / skill.xpToNextLevel) * 100) : 0; progressBarEl.style.width = `${progress}%`; }
    }

    function renderSkillsUI() {
        if (isLocked) return;
        skillsListContainer.innerHTML = ''; // Clear first
        if (!appState.skills || appState.skills.length === 0) {
            skillsListContainer.innerHTML = '<p class="placeholder-text">No skills created yet. Click "Add Skill"!</p>';
            return;
        }
        const fragment = document.createDocumentFragment();
        appState.skills.forEach(skill => fragment.appendChild(createSkillElement(skill)));
        skillsListContainer.appendChild(fragment);
    }

     function createQuestElement(quest) {
         const questItem = document.createElement('article'); questItem.className = `card quest-item ${quest.isCompleted ? 'completed' : ''}`; questItem.dataset.questId = quest.id;
         const skill = findSkillByName(quest.category); const categoryColor = skill ? skill.color : 'var(--color-primary)'; questItem.style.setProperty('--category-color', categoryColor);
         const stepsHTML = (quest.steps || []).map(step => `
             <div class="quest-step">
                 <input type="checkbox" id="step-${step.id}" class="quest-step-checkbox" data-step-id="${step.id}" ${step.isCompleted ? 'checked' : ''} ${quest.isCompleted ? 'disabled' : ''} aria-labelledby="label-step-${step.id}">
                 <label id="label-step-${step.id}" for="step-${step.id}" class="${step.isCompleted ? 'completed' : ''}">${step.description}</label>
                 <span class="xp-reward ${step.isCompleted ? 'completed' : ''}">+${step.xpReward} XP</span>
             </div>`).join('');
         questItem.innerHTML = `
             <div class="quest-header ${quest.isCompleted ? 'completed' : ''}">
                  <h3 title="${quest.name}">${quest.name}</h3>
                  <span class="quest-category-badge">${quest.category}</span>
                 <button class="remove-quest-button" aria-label="Remove Quest" data-quest-id="${quest.id}">×</button>
                 <span class="quest-expand-icon" aria-hidden="true">▼</span>
             </div>
             <div class="quest-steps" id="steps-${quest.id}" style="display: none;">${stepsHTML}</div>`;
         return questItem;
     }

     function renderQuestsUI() {
         if (isLocked) return;
         activeQuestListContainer.innerHTML = ''; completedQuestListContainer.innerHTML = '';
         const activeFragment = document.createDocumentFragment(); const completedFragment = document.createDocumentFragment();
         appState.quests.forEach(quest => {
             const questElement = createQuestElement(quest);
             if (quest.isCompleted) completedFragment.appendChild(questElement); else activeFragment.appendChild(questElement);
         });
         if (activeFragment.children.length > 0) activeQuestListContainer.appendChild(activeFragment);
         if (completedFragment.children.length > 0) completedQuestListContainer.appendChild(completedFragment);
         checkEmptyQuestLists(); // Handle placeholders and visibility
     }

     function updateQuestItemUI(questId) {
         if (isLocked) return;
         const quest = appState.quests.find(q => q.id === questId); if (!quest) return;
         const oldQuestElement = document.querySelector(`.quest-item[data-quest-id="${questId}"]`);
         if (oldQuestElement) {
             const newQuestElement = createQuestElement(quest);
             const stepsContainer = oldQuestElement.querySelector('.quest-steps');
             const isExpanded = stepsContainer && stepsContainer.style.display === 'block';
             if (isExpanded) { const newSteps = newQuestElement.querySelector('.quest-steps'); if(newSteps) newSteps.style.display = 'block'; const newIcon = newQuestElement.querySelector('.quest-expand-icon'); if(newIcon) newIcon.style.transform = 'rotate(180deg)'; }
             oldQuestElement.replaceWith(newQuestElement);
         } else { renderQuestsUI(); }
     }

    function populateCategoryDropdown() {
         if (isLocked) return;
         const currentValue = questCategorySelect.value;
         questCategorySelect.innerHTML = '<option value="" disabled>-- Select Skill --</option>'; // Keep placeholder selected initially
         if (!appState.skills || appState.skills.length === 0) { questCategorySelect.disabled = true; return; }
         questCategorySelect.disabled = false;
         const fragment = document.createDocumentFragment();
         [...appState.skills].sort((a, b) => a.name.localeCompare(b.name)).forEach(skill => { const option = document.createElement('option'); option.value = skill.name; option.textContent = `${skill.icon} ${skill.name}`; fragment.appendChild(option); });
         questCategorySelect.appendChild(fragment);
         questCategorySelect.value = (currentValue && questCategorySelect.querySelector(`option[value="${currentValue}"]`)) ? currentValue : ""; // Reselect or default to placeholder
    }

    function renderShopUI() {
         if (isLocked) return;
         shopListContainer.innerHTML = '';
         if (!appState.shopItems || appState.shopItems.length === 0) { shopListContainer.innerHTML = '<p class="placeholder-text">Shop empty!</p>'; return; }
         const fragment = document.createDocumentFragment();
         appState.shopItems.forEach(item => {
             const isOwned = appState.ownedItemIds.includes(item.id); const canAfford = appState.shards >= item.cost;
             const card = document.createElement('div'); card.className = 'shop-item-card';
             card.innerHTML = `
                 <div class="shop-item-icon">${item.icon}</div> <h4>${item.name}</h4>
                 <p class="shop-item-desc">${item.description}</p> <div class="shop-item-cost"><span>💎</span> ${item.cost}</div>
                 <button class="button buy-button ${isOwned ? 'owned success-button' : (canAfford ? 'primary-button' : 'secondary-button')}"
                         data-item-id="${item.id}" ${isOwned || !canAfford ? 'disabled' : ''}>
                     ${isOwned ? 'Owned ✔' : (canAfford ? 'Buy' : 'Not Enough 💎')} </button>`; // More descriptive disabled state
             fragment.appendChild(card);
         });
         shopListContainer.appendChild(fragment);
     }

    function renderInventoryUI() {
         if (isLocked) return;
         inventoryListContainer.innerHTML = '';
         if (!appState.ownedItemIds || appState.ownedItemIds.length === 0) { inventoryListContainer.innerHTML = '<p class="placeholder-text">Inventory empty.</p>'; return; }
         const fragment = document.createDocumentFragment();
         appState.ownedItemIds.forEach(itemId => {
             const item = appState.shopItems.find(i => i.id === itemId);
             if (item) {
                 const card = document.createElement('div'); card.className = 'inventory-item-card';
                 card.innerHTML = `
                     <div class="inventory-item-icon">${item.icon}</div>
                     <div class="inventory-item-details"><h4>${item.name}</h4><p>${item.description}</p></div>`;
                 fragment.appendChild(card);
             }
         });
         inventoryListContainer.appendChild(fragment);
     }

    // --- Add Skill Modal Logic ---
    function openAddSkillModal() { if(isLocked) return; addSkillForm.reset(); newSkillColorInput.value = '#ff69b4'; addSkillError.classList.add('hidden'); addSkillModal.classList.remove('hidden'); newSkillNameInput.focus(); }
    function closeAddSkillModal() { addSkillModal.classList.add('hidden'); }

    // --- Settings Modal Logic ---
    function openSettingsModal() { if(isLocked) return; settingNicknameInput.value = appState.username; settingCurrentPinInput.value = ''; settingNewPinInput.value = ''; settingConfirmPinInput.value = ''; pinChangeError.classList.add('hidden'); pinChangeSuccess.classList.add('hidden'); settingsModal.classList.remove('hidden'); }
    function closeSettingsModal() { settingsModal.classList.add('hidden'); }
    function handleSaveNickname() { if(isLocked) return; const newNickname = settingNicknameInput.value.trim(); if (newNickname && newNickname !== appState.username) { appState.username = newNickname; saveData(); updateWelcomeMessage(); showNotification("Nickname updated!"); } else if (!newNickname) { showNotification("Nickname cannot be empty.", 3000, true); settingNicknameInput.value = appState.username; }}
    function handleChangePin() { if(isLocked) return; const currentPin = settingCurrentPinInput.value; const newPin = settingNewPinInput.value; const confirmPin = settingConfirmPinInput.value; pinChangeError.classList.add('hidden'); pinChangeSuccess.classList.add('hidden'); if (!currentPin || simpleHash(currentPin) !== appState.pinHash) { pinChangeError.textContent = "Current PIN incorrect."; pinChangeError.classList.remove('hidden'); settingCurrentPinInput.focus(); return; } if (newPin.length !== PIN_LENGTH || !/^\d+$/.test(newPin)) { pinChangeError.textContent = `New PIN must be ${PIN_LENGTH} digits.`; pinChangeError.classList.remove('hidden'); settingNewPinInput.focus(); return; } if (newPin !== confirmPin) { pinChangeError.textContent = "New PINs do not match."; pinChangeError.classList.remove('hidden'); settingConfirmPinInput.focus(); return; } appState.pinHash = simpleHash(newPin); saveData(); pinChangeSuccess.textContent = "PIN changed successfully!"; pinChangeSuccess.classList.remove('hidden'); settingCurrentPinInput.value = ''; settingNewPinInput.value = ''; settingConfirmPinInput.value = ''; setTimeout(() => pinChangeSuccess.classList.add('hidden'), 4000); }


    // --- Event Listener Setup ---
    function setupEventListeners() {
        navButtons.forEach(button => button.addEventListener('click', handleNavClick));
        skillsListContainer.addEventListener('click', handleSkillXpClick);
        activeQuestListContainer.addEventListener('change', handleQuestStepChange);
        activeQuestListContainer.addEventListener('click', handleQuestInteraction);
        completedQuestListContainer.addEventListener('click', handleQuestInteraction);
        newQuestForm.addEventListener('submit', handleAddNewQuest);
        addStepButton.addEventListener('click', () => addQuestStepInput(false));
        questStepsInputsContainer.addEventListener('click', handleRemoveStepClick);
        settingsButton.addEventListener('click', openSettingsModal);
        settingsCloseButton.addEventListener('click', closeSettingsModal);
        saveNicknameButton.addEventListener('click', handleSaveNickname);
        savePinButton.addEventListener('click', handleChangePin);
        resetDataButton.addEventListener('click', resetData);
        completedQuestsHeader.addEventListener('click', toggleCompletedQuests);
        shopListContainer.addEventListener('click', handleShopClick);
        addSkillButton.addEventListener('click', openAddSkillModal);
        addSkillCloseButton.addEventListener('click', closeAddSkillModal);
        addSkillForm.addEventListener('submit', handleAddSkill);
        console.log("Event listeners set up.");
    }

    // --- Event Handlers ---
    function handleNavClick(e) { if(isLocked) return; setActiveSection(e.target.id.replace('nav-', '') + '-section'); }
    function handleSkillXpClick(e) { if(isLocked) return; const button = e.target.closest('.skill-xp-button'); if (button) addXp(button.dataset.skillName, DEFAULT_XP_INCREMENT); }
    function handleQuestStepChange(e) { if(isLocked) return; if (e.target.classList.contains('quest-step-checkbox') && e.target.checked) { const questItem = e.target.closest('.quest-item'); if (!questItem) return; e.target.disabled = true; completeQuestStep(questItem.dataset.questId, e.target.dataset.stepId); } }
    function handleQuestInteraction(e) { if(isLocked) return; const removeButton = e.target.closest('.remove-quest-button'); const header = e.target.closest('.quest-header'); if (removeButton) { e.stopPropagation(); handleRemoveQuest(removeButton.dataset.questId); } else if (header) { const questItem = header.closest('.quest-item'); if(!questItem) return; const stepsContainer = questItem.querySelector('.quest-steps'); const icon = header.querySelector('.quest-expand-icon'); if(stepsContainer){ const isVisible = stepsContainer.style.display==='block'; stepsContainer.style.display = isVisible?'none':'block'; if(icon) icon.style.transform = isVisible?'rotate(0deg)':'rotate(180deg)';}}}
    function handleRemoveStepClick(e) { if(isLocked) return; if (e.target.classList.contains('remove-step-button') && !e.target.disabled) { e.target.closest('.quest-step-input-group').remove(); updateRemoveStepButtonsState(); } }
    function toggleCompletedQuests() { if(isLocked) return; const content = completedQuestListContainer; const header = completedQuestsHeader; const isActive = header.classList.toggle('active'); content.classList.toggle('show', isActive); const icon = header.querySelector('.collapse-icon'); if(icon) icon.textContent = isActive ? '▼' : '▶'; } // Toggle icon
    function handleShopClick(e) { if(isLocked) return; const buyButton = e.target.closest('.buy-button'); if (buyButton && !buyButton.disabled) handleBuyItem(buyButton.dataset.itemId); }

    // --- Helper Functions for UI Interaction ---
    function addQuestStepInput(isFirstStep = false) { const stepNumber = questStepsInputsContainer.children.length + 1; const newStepGroup = document.createElement('div'); newStepGroup.className = 'quest-step-input-group'; newStepGroup.innerHTML = `<input type="text" class="quest-step-desc form-input" required placeholder="Step ${stepNumber} desc."><input type="number" class="quest-step-xp form-input" required placeholder="XP" min="1"><button type="button" class="button icon-button remove-step-button" aria-label="Remove Step ${stepNumber}" ${isFirstStep ? 'disabled' : ''}>✖</button>`; questStepsInputsContainer.appendChild(newStepGroup); if (!isFirstStep) updateRemoveStepButtonsState(); }
    function updateRemoveStepButtonsState() { const stepGroups = questStepsInputsContainer.querySelectorAll('.quest-step-input-group'); stepGroups.forEach((group) => { const removeButton = group.querySelector('.remove-step-button'); if (removeButton) removeButton.disabled = (stepGroups.length <= 1); }); }

    // --- Navigation / Section Visibility ---
    function setActiveSection(targetId) {
         if(isLocked) return;
         contentSections.forEach(s => s.classList.remove('active')); navButtons.forEach(b => b.classList.remove('active'));
         const targetSection = document.getElementById(targetId); const targetButtonId = `nav-${targetId.replace('-section', '')}`; const targetButton = document.getElementById(targetButtonId);
         let title = '✨ Level Up Your Life ✨';
         if (targetSection) {
             targetSection.classList.add('active');
             const sectionMap = { 'dashboard-section': '✨ Your Dashboard ✨', 'skills-section': '💖 Your Skills 💖', 'quests-section': '🚩 Your Quests 🚩', 'shop-section': '🛒 Item Shop', 'inventory-section': '🎒 Your Inventory' };
             title = sectionMap[targetId] || title;
         } else { document.getElementById('dashboard-section').classList.add('active'); document.getElementById('nav-dashboard').classList.add('active'); title = '✨ Your Dashboard ✨'; console.error(`Section ${targetId} not found.`); }
         appTitle.textContent = title;
         if (targetButton) targetButton.classList.add('active'); else { if(!targetSection) document.getElementById('nav-dashboard').classList.add('active'); console.error(`Nav button ${targetButtonId} not found.`); }
     }

    // --- Start the application ---
    initializeApp();

// --- Service Worker Registration ---
// Make sure this runs after the initial DOM setup

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => { // Wait for page load
    navigator.serviceWorker.register('/service-worker.js') // Use root path
      .then(registration => {
        console.log('Service Worker registered successfully:', registration.scope);
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
  });
} else {
    console.log('Service Worker is not supported by this browser.');
}

// --- End of Service Worker Registration ---
}); // End DOMContentLoaded

