/* =========================================
   BASES DE DONNÉES STATIQUES
   ========================================= */
const INGREDIENTS_DB = [
    {n: "Carotte crue", g: 9.6, p: 0.8, l: 0.2}, {n: "Tomate crue", g: 3.9, p: 0.9, l: 0.2},
    {n: "Oignon cru", g: 9.3, p: 1.3, l: 0.2}, {n: "Courgette crue", g: 3.1, p: 1.2, l: 0.1},
    {n: "Poivron rouge cru", g: 6.0, p: 0.9, l: 0.2}, {n: "Concombre cru", g: 2.2, p: 0.6, l: 0.1},
    {n: "Salade verte", g: 1.8, p: 1.2, l: 0.2}, {n: "Épinard cru", g: 3.6, p: 2.9, l: 0.4},
    {n: "Champignon de Paris", g: 0.5, p: 2.0, l: 0.3}, {n: "Haricot vert cuit", g: 4.4, p: 2.4, l: 0.2},
    {n: "Brocoli cuit", g: 1.4, p: 2.4, l: 0.5}, {n: "Chou-fleur cru", g: 5.0, p: 2.0, l: 0.2},
    {n: "Potiron cuit", g: 5.1, p: 0.9, l: 0.1}, {n: "Endive crue", g: 3.4, p: 0.9, l: 0.1},
    {n: "Betterave cuite", g: 10.0, p: 1.7, l: 0.1}, {n: "Céleri-rave cru", g: 9.2, p: 2.3, l: 0.3},
    {n: "Asperge cuite", g: 1.9, p: 2.3, l: 0.3}, {n: "Petit pois cuit", g: 11.0, p: 6.0, l: 0.7},
    {n: "Poireau cuit", g: 5.4, p: 1.5, l: 0.2}, {n: "Radis rose", g: 3.4, p: 0.8, l: 0.1},
    {n: "Pomme", g: 14.0, p: 0.3, l: 0.2}, {n: "Banane", g: 22.8, p: 1.1, l: 0.3},
    {n: "Orange", g: 11.7, p: 0.8, l: 0.2}, {n: "Kiwi", g: 14.7, p: 1.1, l: 0.6},
    {n: "Fraise", g: 7.7, p: 0.7, l: 0.3}, {n: "Pêche", g: 9.0, p: 0.8, l: 0.1},
    {n: "Poire", g: 15.5, p: 0.4, l: 0.1}, {n: "Raisin blanc", g: 17.2, p: 0.6, l: 0.3},
    {n: "Cerise", g: 16.0, p: 1.1, l: 0.2}, {n: "Abricot", g: 11.1, p: 0.9, l: 0.1},
    {n: "Clémentine", g: 10.3, p: 0.8, l: 0.2}, {n: "Melon", g: 7.4, p: 0.8, l: 0.1},
    {n: "Pastèque", g: 7.6, p: 0.6, l: 0.1}, {n: "Prune", g: 11.4, p: 0.6, l: 0.2},
    {n: "Ananas", g: 13.1, p: 0.5, l: 0.1}, {n: "Mangue", g: 15.3, p: 0.6, l: 0.1},
    {n: "Citron (pulpe)", g: 2.4, p: 0.7, l: 0.3}, {n: "Avocat", g: 1.8, p: 1.9, l: 14.7},
    {n: "Mûre", g: 9.6, p: 1.3, l: 0.5}, {n: "Framboise", g: 11.9, p: 1.4, l: 0.6},
    {n: "Blanc de poulet", g: 0.0, p: 23.0, l: 1.2}, {n: "Escalope de dinde", g: 0.0, p: 23.0, l: 1.2},
    {n: "Filet de poulet", g: 0.0, p: 24.0, l: 1.5}, {n: "Steak haché 5%", g: 0.0, p: 21.0, l: 5.0},
    {n: "Steak haché 15%", g: 0.0, p: 19.0, l: 15.0}, {n: "Rosbif cru", g: 0.0, p: 21.5, l: 4.5},
    {n: "Foie de volaille", g: 2.0, p: 24.0, l: 6.0}, {n: "Jambon blanc", g: 0.8, p: 20.0, l: 3.0},
    {n: "Jambon cru", g: 0.5, p: 28.0, l: 15.0}, {n: "Bacon", g: 0.7, p: 15.0, l: 35.0},
    {n: "Rôti de porc", g: 0.0, p: 25.0, l: 10.0}, {n: "Saucisse Toulouse", g: 1.5, p: 14.0, l: 25.0},
    {n: "Gigot d'agneau", g: 0.0, p: 26.0, l: 12.0}, {n: "Magret canard", g: 0.0, p: 19.0, l: 15.0},
    {n: "Filet mignon porc", g: 0.0, p: 22.0, l: 3.0}, {n: "Cabillaud", g: 0.0, p: 20.0, l: 0.7},
    {n: "Saumon", g: 0.0, p: 22.0, l: 12.0}, {n: "Thon nature", g: 0.0, p: 27.0, l: 1.0},
    {n: "Dorade", g: 0.0, p: 20.0, l: 5.0}, {n: "Sole", g: 0.0, p: 19.0, l: 1.5},
    {n: "Truite", g: 0.0, p: 22.0, l: 7.0}, {n: "Sardine huile", g: 0.0, p: 24.0, l: 15.0},
    {n: "Maquereau", g: 0.0, p: 20.0, l: 18.0}, {n: "Crevette", g: 0.0, p: 22.0, l: 0.8},
    {n: "Moules", g: 3.7, p: 20.0, l: 2.5}, {n: "Coquilles St-Jacques", g: 2.2, p: 16.0, l: 0.8},
    {n: "Colin d'Alaska", g: 0.0, p: 17.0, l: 0.8}, {n: "Hareng fumé", g: 0.0, p: 18.0, l: 13.0},
    {n: "Anchois huile", g: 0.0, p: 25.0, l: 12.0}, {n: "Œuf entier", g: 0.7, p: 12.5, l: 10.0},
    {n: "Blanc d'œuf", g: 0.7, p: 10.5, l: 0.1}, {n: "Jaune d'œuf", g: 0.3, p: 16.0, l: 31.0},
    {n: "Lait entier", g: 4.8, p: 3.2, l: 3.6}, {n: "Lait demi", g: 4.8, p: 3.2, l: 1.5},
    {n: "Lait écrémé", g: 5.0, p: 3.4, l: 0.1}, {n: "Yaourt entier", g: 4.6, p: 3.5, l: 3.3},
    {n: "Yaourt demi", g: 5.1, p: 3.8, l: 1.5}, {n: "Skyr", g: 4.0, p: 9.0, l: 0.2},
    {n: "Fromage blanc 20%", g: 3.8, p: 6.6, l: 3.3}, {n: "Fromage blanc 0%", g: 4.0, p: 7.0, l: 0.2},
    {n: "Faisselle 0%", g: 3.5, p: 7.5, l: 0.2}, {n: "Petit-suisse 40%", g: 4.1, p: 8.4, l: 6.6},
    {n: "Crème fraîche 30%", g: 3.0, p: 2.4, l: 30.0}, {n: "Crème légère 15%", g: 4.0, p: 2.8, l: 15.0},
    {n: "Beurre doux", g: 0.7, p: 0.5, l: 82.0}, {n: "Emmental", g: 0.0, p: 28.0, l: 29.0},
    {n: "Comté", g: 0.0, p: 28.0, l: 34.0}, {n: "Camembert", g: 0.0, p: 21.0, l: 22.0},
    {n: "Chèvre sec", g: 0.7, p: 22.0, l: 27.0}, {n: "Mozzarella", g: 2.2, p: 19.0, l: 19.0},
    {n: "Feta", g: 1.5, p: 15.0, l: 21.0}, {n: "Ricotta", g: 3.0, p: 8.0, l: 13.0},
    {n: "Lentilles cuites", g: 20.0, p: 9.0, l: 0.4}, {n: "Haricots rouges", g: 19.0, p: 8.0, l: 0.6},
    {n: "Pois chiches", g: 21.0, p: 7.0, l: 2.4}, {n: "Haricots blancs", g: 18.0, p: 8.0, l: 0.6},
    {n: "Flageolets", g: 16.0, p: 6.0, l: 0.6}, {n: "Riz blanc", g: 28.0, p: 2.7, l: 0.3},
    {n: "Riz complet", g: 26.0, p: 2.8, l: 1.0}, {n: "Pâtes", g: 30.0, p: 5.0, l: 0.8},
    {n: "Pâtes complètes", g: 26.0, p: 5.0, l: 1.0}, {n: "Semoule", g: 23.0, p: 3.6, l: 0.2},
    {n: "Pomme de terre", g: 20.0, p: 2.0, l: 0.1}, {n: "Patate douce", g: 24.0, p: 1.6, l: 0.3},
    {n: "Quinoa", g: 26.0, p: 4.4, l: 1.9}, {n: "Boulgour", g: 19.0, p: 3.7, l: 0.4},
    {n: "Polenta", g: 16.0, p: 1.6, l: 0.2}, {n: "Purée", g: 14.0, p: 2.0, l: 0.3},
    {n: "Blé (épeautre)", g: 26.0, p: 5.0, l: 1.0}, {n: "Baguette", g: 58.0, p: 9.0, l: 1.0},
    {n: "Pain de mie complet", g: 45.0, p: 9.0, l: 3.5}, {n: "Pain de mie blanc", g: 53.0, p: 8.0, l: 3.5},
    {n: "Pain complet", g: 41.0, p: 9.0, l: 3.0}, {n: "Flocons d'avoine", g: 66.0, p: 13.0, l: 7.0},
    {n: "Muesli", g: 66.0, p: 10.0, l: 5.0}, {n: "Corn-flakes", g: 84.0, p: 7.0, l: 0.9},
    {n: "Biscotte complète", g: 72.0, p: 12.0, l: 3.5}, {n: "Huile d'olive", g: 0.0, p: 0.0, l: 100.0},
    {n: "Huile de tournesol", g: 0.0, p: 0.0, l: 100.0}, {n: "Huile de colza", g: 0.0, p: 0.0, l: 100.0},
    {n: "Margarine", g: 0.5, p: 0.2, l: 40.0}, {n: "Noix", g: 11.0, p: 15.0, l: 64.0},
    {n: "Amande", g: 21.7, p: 21.2, l: 50.0}, {n: "Noisette", g: 16.7, p: 15.0, l: 61.0},
    {n: "Cacahuète", g: 14.0, p: 26.0, l: 49.0}, {n: "Graine tournesol", g: 20.0, p: 21.0, l: 51.0},
    {n: "Graine de lin", g: 29.0, p: 18.0, l: 42.0}, {n: "Pignon de pin", g: 13.0, p: 14.0, l: 68.0},
    {n: "Beurre cacahuète", g: 12.0, p: 25.0, l: 50.0}, {n: "Tahini", g: 12.0, p: 18.0, l: 54.0},
    {n: "Tofu", g: 0.7, p: 12.0, l: 7.0}, {n: "Lait de coco", g: 3.3, p: 1.8, l: 18.0},
    {n: "Chocolat noir 70%", g: 43.0, p: 8.0, l: 42.0}, {n: "Chocolat lait", g: 57.0, p: 7.0, l: 30.0},
    {n: "Miel", g: 82.0, p: 0.3, l: 0.0}, {n: "Sucre blanc", g: 100.0, p: 0.0, l: 0.0},
    {n: "Confiture", g: 68.0, p: 0.4, l: 0.1}, {n: "Ketchup", g: 23.0, p: 1.2, l: 0.3},
    {n: "Mayonnaise", g: 1.3, p: 1.1, l: 75.0}, {n: "Moutarde", g: 12.0, p: 7.0, l: 11.0},
    {n: "Sauce tomate", g: 7.0, p: 1.5, l: 0.2}, {n: "Vinaigre", g: 0.5, p: 0.1, l: 0.0},
    {n: "Cornichon", g: 1.3, p: 0.9, l: 0.2}, {n: "Olives noires", g: 3.0, p: 1.5, l: 35.0},
    {n: "Câpre", g: 5.0, p: 2.0, l: 0.9}, {n: "Ail", g: 27.0, p: 6.4, l: 0.5},
    {n: "Échalote", g: 16.8, p: 1.8, l: 0.2}, {n: "Persil", g: 6.3, p: 3.0, l: 0.8},
    {n: "Basilic", g: 5.1, p: 3.2, l: 0.6}, {n: "Gingembre", g: 15.8, p: 1.8, l: 0.8}
];

const ALCOHOL_DB = [
    {n: "Bière blonde (5%)", alc: 0.39, g: 0.35, p: 0.05, l: 0.0},
    {n: "Bière brune (5.5%)", alc: 0.43, g: 0.45, p: 0.04, l: 0.0},
    {n: "Bière forte (7%)", alc: 0.55, g: 0.50, p: 0.06, l: 0.0},
    {n: "Bière forte (8%)", alc: 0.63, g: 0.75, p: 0.07, l: 0.0},
    {n: "Stout (4.2%)", alc: 0.33, g: 0.38, p: 0.05, l: 0.0},
    {n: "Porter (6.5%)", alc: 0.51, g: 0.70, p: 0.06, l: 0.0},
    {n: "Vin rouge (12%)", alc: 0.95, g: 0.02, p: 0.01, l: 0.0},
    {n: "Vin rouge (14%)", alc: 1.10, g: 0.05, p: 0.01, l: 0.0},
    {n: "Vin rouge (15%)", alc: 1.18, g: 0.10, p: 0.01, l: 0.0},
    {n: "Vin blanc sec (12%)", alc: 0.95, g: 0.05, p: 0.01, l: 0.0},
    {n: "Vin blanc moelleux", alc: 1.07, g: 0.80, p: 0.01, l: 0.0},
    {n: "Porto (20%)", alc: 1.58, g: 1.00, p: 0.01, l: 0.0},
    {n: "Pineau (17%)", alc: 1.34, g: 1.20, p: 0.01, l: 0.0},
    {n: "Pastis (dilué 1:5)", alc: 0.59, g: 0.08, p: 0.00, l: 0.0},
    {n: "Picon pur", alc: 1.66, g: 2.80, p: 0.00, l: 0.0},
    {n: "Cynar", alc: 1.30, g: 0.70, p: 0.01, l: 0.0},
    {n: "Spiritueux (40%)", alc: 3.16, g: 0.00, p: 0.00, l: 0.0},
    {n: "Cognac (40%)", alc: 3.16, g: 0.05, p: 0.00, l: 0.0},
    {n: "Liqueur (40%)", alc: 3.16, g: 2.80, p: 0.00, l: 0.0},
    {n: "Get 27 (21%)", alc: 1.66, g: 3.50, p: 0.00, l: 0.0}
];

/* =========================================
   ÉTAT DE L'APPLICATION
   ========================================= */

const defaultState = {
    profile: {
        gender: 'm', weight: 80, height: 180, age: 30,
        jobFactor: 1.2, stepFactor: 0, workFactor: 0,
        goalAdjust: 0, protG: 1.8, fatG: 1.0
    },
    targets: { kcal: 2500, p: 150, c: 300, f: 80 },
    consumed: { kcal: 0, p: 0, c: 0, f: 0 },
    lastDate: new Date().toLocaleDateString('fr-CA'),
    customFoods: [],
    recipes: [],
    history: [] 
};

let appState = JSON.parse(JSON.stringify(defaultState));
let editingRecipeIndex = -1;
let currentSelectedFood = null;
let currentRecipeDraft = { name: "", ingredients: [], totals: {kcal:0, p:0, c:0, f:0} };
let scannedFoodTemp = null; // Stockage temporaire du produit scanné

/* =========================================
   INITIALISATION
   ========================================= */

window.onload = function() {
    loadDataLocally();
    checkDateReset();
    initAlcoholSelect();
    updateUI();
};

function showView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
    
    if(viewId === 'scanner-view') startScanner();
    else stopScanner();
}

function saveDataLocally() {
    try { localStorage.setItem('huskyData', JSON.stringify(appState)); }
    catch(e) { console.error("Erreur sauvegarde", e); }
}

function loadDataLocally() {
    const saved = localStorage.getItem('huskyData');
    if (saved) {
        try { appState = { ...defaultState, ...JSON.parse(saved) }; }
        catch(e) { console.error("Données corrompues", e); }
    }
}

function checkDateReset() {
    const today = new Date().toLocaleDateString('fr-CA');
    if (appState.lastDate !== today) {
        if (appState.consumed.kcal > 0) {
            appState.history.push({
                date: appState.lastDate,
                consumed: { ...appState.consumed },
                targets: { ...appState.targets }
            });
        }
        appState.consumed = { kcal: 0, p: 0, c: 0, f: 0 };
        appState.lastDate = today;
        saveDataLocally();
    }
}

function updateUI() {
    const remaining = Math.round(appState.targets.kcal - appState.consumed.kcal);
    document.getElementById('display-remaining-cal').innerText = remaining;
    document.getElementById('display-target-cal').innerText = Math.round(appState.targets.kcal);
    
    const percent = Math.min(100, Math.max(0, (appState.consumed.kcal / appState.targets.kcal) * 100));
    document.getElementById('circle-progress').setAttribute('stroke-dasharray', `${percent}, 100`);
    
    updateMacroUI('prot', appState.consumed.p, appState.targets.p);
    updateMacroUI('carb', appState.consumed.c, appState.targets.c);
    updateMacroUI('fat', appState.consumed.f, appState.targets.f);
}

function updateMacroUI(type, val, target) {
    document.getElementById(`val-${type}`).innerText = Math.round(val);
    document.getElementById(`target-${type}`).innerText = Math.round(target);
    document.getElementById(`prog-${type}`).value = (target > 0) ? (val / target) * 100 : 0;
}

/* =========================================
   CALCUL BESOINS
   ========================================= */

function applyGoalTemplate() {
    const type = document.getElementById('goal-type').value;
    const musc = document.getElementById('goal-muscle').value;
    const fat = document.getElementById('goal-fat').value;
    let adj = 0, prot = 1.6;
    if (type === 'cut') {
        adj = -15; if(fat === 'med') adj = -20; if(fat === 'high') adj = -25; prot = 2.0;
    } else if (type === 'maint') { adj = 0; prot = 1.8;
    } else if (type === 'bulk') {
        adj = 15; if(fat === 'high') adj = 10; if(fat === 'low') adj = 20; prot = 2.0;
    }
    document.getElementById('calc-adjust-percent').value = adj;
    document.getElementById('calc-prot-g').value = prot;
}

function saveCalculation() {
    const p = appState.profile;
    p.gender = document.getElementById('calc-gender').value;
    p.weight = parseFloat(document.getElementById('calc-weight').value) || 80;
    p.height = parseFloat(document.getElementById('calc-height').value) || 180;
    p.age = parseFloat(document.getElementById('calc-age').value) || 30;
    p.jobFactor = parseFloat(document.getElementById('calc-job').value);
    p.stepFactor = parseFloat(document.getElementById('calc-steps').value);
    p.workFactor = parseFloat(document.getElementById('calc-workouts').value);
    p.goalAdjust = parseFloat(document.getElementById('calc-adjust-percent').value);
    p.protG = parseFloat(document.getElementById('calc-prot-g').value);
    p.fatG = parseFloat(document.getElementById('calc-fat-g').value);

    let bmr = (10 * p.weight) + (6.25 * p.height) - (5 * p.age);
    bmr += (p.gender === 'm') ? 5 : -161;
    const tdee = bmr * (p.jobFactor + p.stepFactor + p.workFactor);
    const targetKcal = tdee * (1 + (p.goalAdjust / 100));
    const targetP = p.weight * p.protG;
    const targetF = p.weight * p.fatG;
    const targetC = Math.max(0, (targetKcal - ((targetP*4)+(targetF*9))) / 4);

    appState.targets = { kcal: targetKcal, p: targetP, c: targetC, f: targetF };
    saveDataLocally();
    alert("Calcul effectué et sauvegardé !");
    showView('home-view');
    updateUI();
}

/* =========================================
   TRACKER
   ========================================= */

function searchDatabase() {
    const query = document.getElementById('search-input').value.toLowerCase().trim();
    const resultsDiv = document.getElementById('search-results');
    resultsDiv.innerHTML = '';
    if(query.length < 1) return;

    const allFoods = [...INGREDIENTS_DB, ...appState.customFoods, ...appState.recipes];
    const matches = allFoods.filter(f => f.n.toLowerCase().includes(query)).slice(0, 30);

    if (matches.length === 0) { resultsDiv.innerHTML = '<div style="padding:10px; color:#666;">Aucun résultat</div>'; return; }

    matches.forEach(food => {
        const div = document.createElement('div');
        div.className = 'result-item';
        div.innerHTML = `<strong>${food.isRecipe?"🍽️ ":"🍎 "}${food.n}</strong>`;
        div.onclick = () => selectFood(food);
        resultsDiv.appendChild(div);
    });
}

function selectFood(food) {
    currentSelectedFood = food;
    document.getElementById('selected-food-area').style.display = 'block';
    document.getElementById('selected-food-name').innerText = food.n;
    document.getElementById('search-results').innerHTML = ''; 
    const label = document.getElementById('lbl-qty');
    const input = document.getElementById('food-qty');
    if (food.isRecipe) { label.innerText = "Portion (1=tout, 0.5=moitié) :"; input.value = "1"; } 
    else { label.innerText = "Quantité (g) :"; input.value = "100"; }
}

function confirmEaten() {
    if(!currentSelectedFood) return;
    const qty = parseFloat(document.getElementById('food-qty').value) || 0;
    let k, p, c, f;

    if (currentSelectedFood.isRecipe) {
        const t = currentSelectedFood.totals;
        k=t.kcal*qty; p=t.p*qty; c=t.c*qty; f=t.f*qty;
    } else {
        const r = qty / 100;
        const bP = currentSelectedFood.p;
        const bC = (currentSelectedFood.g!==undefined)?currentSelectedFood.g:(currentSelectedFood.c||0);
        const bF = (currentSelectedFood.l!==undefined)?currentSelectedFood.l:(currentSelectedFood.f||0);
        p=bP*r; c=bC*r; f=bF*r; k=(p*4)+(c*4)+(f*9);
    }
    addMacros(k,p,c,f);
    document.getElementById('selected-food-area').style.display = 'none';
    document.getElementById('search-input').value = '';
    showView('home-view');
}

function addMacros(k, p, c, f) {
    appState.consumed.kcal += k; appState.consumed.p += p; appState.consumed.c += c; appState.consumed.f += f;
    saveDataLocally(); updateUI();
}

/* =========================================
   RECETTES
   ========================================= */

function openRecipeCreator() {
    editingRecipeIndex = -1;
    currentRecipeDraft = { name: "", ingredients: [], totals: {kcal:0, p:0, c:0, f:0} };
    document.getElementById('recipe-name').value = "";
    document.querySelector('#recipe-creator-view h2').innerText = "Nouvelle Recette";
    document.getElementById('recipe-search-results').innerHTML = "";
    updateRecipeDraftUI();
    showView('recipe-creator-view');
}

function editRecipe(index, event) {
    if(event) event.stopPropagation();
    editingRecipeIndex = index; 
    currentRecipeDraft = JSON.parse(JSON.stringify(appState.recipes[index]));
    document.getElementById('recipe-name').value = currentRecipeDraft.n;
    document.querySelector('#recipe-creator-view h2').innerText = "Modifier Recette";
    updateRecipeDraftUI();
    showView('recipe-creator-view');
}

function searchIngredientForRecipe() {
    const query = document.getElementById('recipe-ingredient-search').value.toLowerCase().trim();
    const resultsDiv = document.getElementById('recipe-search-results');
    resultsDiv.innerHTML = '';
    if(query.length < 1) return;
    const all = [...INGREDIENTS_DB, ...appState.customFoods].filter(f => f.n.toLowerCase().includes(query)).slice(0, 20);
    all.forEach(food => {
        const div = document.createElement('div');
        div.className = 'result-item'; div.innerText = food.n;
        div.onclick = () => {
            const q = prompt(`Quantité (g) pour ${food.n}?`, "100");
            if(q && !isNaN(q)) {
                currentRecipeDraft.ingredients.push({
                    name: food.n, qty: parseFloat(q),
                    baseP: food.p, baseC: (food.g||food.c||0), baseF: (food.l||food.f||0)
                });
                document.getElementById('recipe-ingredient-search').value="";
                resultsDiv.innerHTML=""; updateRecipeDraftUI();
            }
        };
        resultsDiv.appendChild(div);
    });
}

function updateRecipeDraftUI() {
    const listDiv = document.getElementById('recipe-draft-list'); listDiv.innerHTML = "";
    let tk=0, tp=0, tc=0, tf=0;
    currentRecipeDraft.ingredients.forEach((i, idx) => {
        const r = i.qty/100; const p=i.baseP*r; const c=i.baseC*r; const f=i.baseF*r; const k=(p*4)+(c*4)+(f*9);
        tk+=k; tp+=p; tc+=c; tf+=f;
        listDiv.innerHTML += `<div class="draft-item"><div>${i.name}<br><span>${i.qty}g (${Math.round(k)} kcal)</span></div><button class="btn-remove" onclick="removeIngredientFromDraft(${idx})">X</button></div>`;
    });
    currentRecipeDraft.totals = { kcal: tk, p: tp, c: tc, f: tf };
    document.getElementById('recipe-total-cal').innerText = Math.round(tk);
    document.getElementById('recipe-total-p').innerText = Math.round(tp);
    document.getElementById('recipe-total-c').innerText = Math.round(tc);
    document.getElementById('recipe-total-f').innerText = Math.round(tf);
}

function removeIngredientFromDraft(idx) { currentRecipeDraft.ingredients.splice(idx,1); updateRecipeDraftUI(); }

function saveRecipe() {
    const name = document.getElementById('recipe-name').value;
    if (!name || currentRecipeDraft.ingredients.length === 0) { alert("Incomplet"); return; }
    const rec = { n: name, isRecipe: true, ingredients: currentRecipeDraft.ingredients, totals: currentRecipeDraft.totals };
    if (editingRecipeIndex > -1) appState.recipes[editingRecipeIndex] = rec;
    else appState.recipes.push(rec);
    saveDataLocally(); renderRecipesList(); showView('recipes-view');
}

function renderRecipesList() {
    const container = document.getElementById('saved-recipes-list'); container.innerHTML = "";
    appState.recipes.forEach((rec, idx) => {
        container.innerHTML += `<div class="result-item"><div style="display:flex;justify-content:space-between;width:100%"><span style="flex-grow:1">🍽️ ${rec.n} (${Math.round(rec.totals.kcal)} kcal)</span><div><button class="btn-small" style="background:#2196F3;color:white;margin-right:5px;" onclick="editRecipe(${idx}, event)">Modif</button><button class="btn-small" style="background:#f44336;color:white;" onclick="deleteRecipe(${idx}, event)">Suppr</button></div></div></div>`;
    });
}

function deleteRecipe(idx, e) { e.stopPropagation(); if(confirm("Supprimer?")){ appState.recipes.splice(idx,1); saveDataLocally(); renderRecipesList(); } }

/* =========================================
   SCANNER & ACTIONS (FIXED API + NEW FLOW)
   ========================================= */

let html5QrCode;
function startScanner() {
    html5QrCode = new Html5Qrcode("reader");
    html5QrCode.start({ facingMode: "environment" }, { fps: 10, qrbox: { width: 250, height: 250 } }, onScanSuccess)
    .catch(err => console.log("Caméra non dispo", err));
}
function stopScanner() { if(html5QrCode) html5QrCode.stop().then(() => html5QrCode.clear()).catch(()=>{}); }

function onScanSuccess(decodedText) {
    stopScanner();
    fetchOpenFoodFacts(decodedText);
}

function fetchOpenFoodFacts(code) {
    if(!code) return;
    const url = `https://world.openfoodfacts.org/api/v0/product/${code}.json`;
    
    fetch(url)
    .then(res => res.json())
    .then(data => {
        // status 1 = found, status 0 = not found but often returns 0 even if basics exist
        if(data.status === 1 || (data.product && data.product.product_name)) {
            const p = data.product;
            scannedFoodTemp = {
                n: p.product_name || "Produit scanné",
                p: p.nutriments.proteins_100g || 0,
                // L'API renvoie parfois "carbohydrates_100g" ou juste "carbohydrates"
                c: p.nutriments.carbohydrates_100g || 0,
                f: p.nutriments.fat_100g || 0
            };
            
            // Affichage de la vue intermédiaire
            document.getElementById('scan-match-name').innerText = scannedFoodTemp.n;
            document.getElementById('scan-match-macros').innerText = 
                `P: ${scannedFoodTemp.p}g | G: ${scannedFoodTemp.c}g | L: ${scannedFoodTemp.f}g`;
            
            showView('scan-result-view');
        } else {
            alert("Produit inconnu dans OpenFoodFacts (Status 0)");
            showView('scanner-view'); // Retour au scan
        }
    })
    .catch(err => {
        console.error(err);
        alert("Erreur de connexion à l'API. Vérifiez votre internet.");
    });
}

// Action 1: Manger directement
function scanActionEat() {
    if(!scannedFoodTemp) return;
    selectFood(scannedFoodTemp); // Prépare le tracker
    showView('tracker-view');
}

// Action 2: Sauvegarder dans "Mes Aliments"
function scanActionSave() {
    if(!scannedFoodTemp) return;
    // On mappe vers le format interne "custom" (n, p, g, l) ou (n, p, c, f)
    // Ici on normalise vers customFoods (c, f)
    appState.customFoods.push({
        n: scannedFoodTemp.n,
        p: scannedFoodTemp.p,
        c: scannedFoodTemp.c, // API donne c, custom attend c ou g
        f: scannedFoodTemp.f
    });
    saveDataLocally();
    alert("Produit ajouté à votre bibliothèque !");
    showView('foods-view');
    renderAllFoods();
}

/* =========================================
   ALIMENTS & ALCOOL & IMPORT
   ========================================= */

function renderAllFoods() {
    const container = document.getElementById('all-foods-container');
    const filter = document.getElementById('food-list-search').value.toLowerCase();
    container.innerHTML = "";
    let all = [...INGREDIENTS_DB, ...appState.customFoods].sort((a,b)=>a.n.localeCompare(b.n));
    all.forEach(f => {
        if(filter===""||f.n.toLowerCase().includes(filter)) {
            const c=(f.g!==undefined)?f.g:(f.c||0); const fa=(f.l!==undefined)?f.l:(f.f||0); const k=(f.p*4)+(c*4)+(fa*9);
            container.innerHTML += `<div class="result-item"><div style="display:flex;justify-content:space-between"><strong>${f.n}</strong><span>${Math.round(k)}kcal</span></div><div style="font-size:0.75rem;color:#888">P:${f.p} G:${c} L:${fa}</div></div>`;
        }
    });
}

function createCustomFood() {
    const n=document.getElementById('new-food-name').value;
    const p=parseFloat(document.getElementById('new-food-p').value)||0;
    const c=parseFloat(document.getElementById('new-food-c').value)||0;
    const f=parseFloat(document.getElementById('new-food-f').value)||0;
    if(n){ appState.customFoods.push({n:n,p:p,c:c,f:f}); saveDataLocally(); alert("Saved!"); renderAllFoods(); }
}

function initAlcoholSelect() {
    const s = document.getElementById('alcohol-select');
    ALCOHOL_DB.forEach((a,i) => { s.innerHTML += `<option value="${i}">${a.n}</option>`; });
}
function addAlcohol() {
    const item = ALCOHOL_DB[document.getElementById('alcohol-select').value];
    const q = parseFloat(document.getElementById('alcohol-qty').value)||0;
    const k = (item.alc*q*7) + (item.g*q*4) + (item.p*q*4) + (item.l*q*9);
    addMacros(k, item.p*q, item.g*q, item.l*q); showView('home-view');
}

function exportData() {
    const a = document.createElement('a');
    a.href = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appState));
    a.download = "husky_data.json"; document.body.appendChild(a); a.click(); a.remove();
}
function importData(inp) {
    const f = inp.files[0]; if(!f) return;
    const r = new FileReader();
    r.onload = e => { try { appState = JSON.parse(e.target.result); checkDateReset(); saveDataLocally(); updateUI(); alert("Chargé!"); } catch(x){alert("Erreur fichier");} };
    r.readAsText(f);
}
