// Clés de stockage
const STORAGE_KEY_SETTINGS = 'huskySettings';
const STORAGE_KEY_ENTRIES = 'huskyEntries';

/**
 * Retourne la date du jour au format YYYY-MM-DD.
 */
function getTodayDateString() {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${m}-${day}`;
}

/**
 * Charge les réglages depuis localStorage ou retourne les valeurs par défaut.
 * Complète les anciennes configs si des champs manquent.
 */
function loadSettings() {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (raw) {
        try {
            const parsed = JSON.parse(raw);
            if (!parsed.defaultMeasures) parsed.defaultMeasures = {};
            if (!parsed.splitMeasures) parsed.splitMeasures = {};
            if (parsed.defaultMeasures['tour_poignets'] === undefined) {
                parsed.defaultMeasures['tour_poignets'] = true;
            }
            if (parsed.splitMeasures['tour_poignet_g'] === undefined) {
                parsed.splitMeasures['tour_poignet_g'] = false;
            }
            if (parsed.splitMeasures['tour_poignet_d'] === undefined) {
                parsed.splitMeasures['tour_poignet_d'] = false;
            }
            if (!parsed.customMeasures) parsed.customMeasures = [];
            return parsed;
        } catch (e) {
            console.error('Erreur parse settings', e);
        }
    }
    // Configuration par défaut
    return {
        defaultMeasures: {
            'tour_epaules': true,
            'tour_poitrine': true,
            'tour_bras': true,
            'tour_avant_bras': true,
            'tour_taille': true,
            'tour_ventre': true,
            'tour_cuisse': true,
            'tour_mollet': true,
            'tour_cou': true,
            'tour_hanches': true,
            'tour_poignets': true
        },
        splitMeasures: {
            'tour_bras_g': false,
            'tour_bras_d': false,
            'tour_avant_bras_g': false,
            'tour_avant_bras_d': false,
            'tour_poignet_g': false,
            'tour_poignet_d': false,
            'tour_cuisse_g': false,
            'tour_cuisse_d': false,
            'tour_mollet_g': false,
            'tour_mollet_d': false
        },
        customMeasures: []
    };
}

/**
 * Sauvegarde les réglages dans localStorage.
 */
function saveSettings(settings) {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
}

/**
 * Charge les saisies depuis localStorage.
 */
function loadEntries() {
    const raw = localStorage.getItem(STORAGE_KEY_ENTRIES);
    if (raw) {
        try {
            return JSON.parse(raw);
        } catch (e) {
            console.error('Erreur parse entries', e);
        }
    }
    return [];
}

/**
 * Sauvegarde les saisies dans localStorage.
 */
function saveEntries(entries) {
    localStorage.setItem(STORAGE_KEY_ENTRIES, JSON.stringify(entries));
}

/**
 * Tri les saisies par date décroissante.
 */
function sortEntriesByDateDesc(entries) {
    return entries.sort(function (a, b) {
        return new Date(b.date) - new Date(a.date);
    });
}

/**
 * Affiche la vue demandée.
 */
function showView(viewId) {
    const views = document.querySelectorAll('section.view');
    views.forEach(v => v.classList.remove('active'));
    const target = document.getElementById(viewId);
    if (target) {
        target.classList.add('active');
    }
    const backBtn = document.getElementById('btnBack');
    if (viewId === 'view-main-menu') {
        backBtn.classList.add('hidden');
    } else {
        backBtn.classList.remove('hidden');
    }
}

/**
 * Construit les champs de mensurations dans "Nouvelle saisie".
 */
function buildMeasureFields(settings) {
    const container = document.getElementById('measureFieldsContainer');
    container.innerHTML = '';

    const allMeasures = [];

    const defaultLabels = {
        'tour_epaules': 'Tour d\'épaules',
        'tour_poitrine': 'Tour de poitrine',
        'tour_bras': 'Tour de bras',
        'tour_avant_bras': 'Tour d\'avant bras',
        'tour_taille': 'Tour de taille',
        'tour_ventre': 'Tour de ventre',
        'tour_cuisse': 'Tour de cuisse',
        'tour_mollet': 'Tour de mollet',
        'tour_cou': 'Tour de cou',
        'tour_hanches': 'Tour de hanches',
        'tour_poignets': 'Tour de poignets'
    };

    Object.keys(settings.defaultMeasures).forEach(key => {
        if (settings.defaultMeasures[key]) {
            allMeasures.push({ id: key, label: defaultLabels[key] || key });
        }
    });

    const splitLabels = {
        'tour_bras_g': 'Tour de bras G',
        'tour_bras_d': 'Tour de bras D',
        'tour_avant_bras_g': 'Tour d\'avant bras G',
        'tour_avant_bras_d': 'Tour d\'avant bras D',
        'tour_poignet_g': 'Tour de poignet G',
        'tour_poignet_d': 'Tour de poignet D',
        'tour_cuisse_g': 'Tour de cuisse G',
        'tour_cuisse_d': 'Tour de cuisse D',
        'tour_mollet_g': 'Tour de mollet G',
        'tour_mollet_d': 'Tour de mollet D'
    };

    Object.keys(settings.splitMeasures).forEach(key => {
        if (settings.splitMeasures[key]) {
            allMeasures.push({ id: key, label: splitLabels[key] || key });
        }
    });

    settings.customMeasures.forEach(name => {
        const id = 'custom_' + name.toLowerCase().replace(/\s+/g, '_');
        allMeasures.push({ id: id, label: name });
    });

    if (allMeasures.length === 0) {
        const p = document.createElement('p');
        p.textContent = 'Aucune mensuration active. Active des champs dans "Réglage initial".';
        p.style.fontSize = '0.9rem';
        p.style.color = '#bbb';
        container.appendChild(p);
        return;
    }

    const grid = document.createElement('div');
    grid.className = 'measure-grid';

    allMeasures.forEach(m => {
        const wrap = document.createElement('div');
        wrap.className = 'measure-field';

        const label = document.createElement('label');
        label.setAttribute('for', 'field_' + m.id);
        label.textContent = m.label;

        const input = document.createElement('input');
        input.type = 'number';
        input.step = '0.1';
        input.id = 'field_' + m.id;
        input.dataset.measureId = m.id;
        input.inputMode = 'decimal';

        wrap.appendChild(label);
        wrap.appendChild(input);
        grid.appendChild(wrap);
    });

    container.appendChild(grid);
}

/**
 * Construit la vue "Réglage initial".
 */
function buildSettingsView(settings) {
    const defaultContainer = document.getElementById('defaultMeasuresList');
    const splitContainer = document.getElementById('splitMeasuresList');
    const customContainer = document.getElementById('customMeasuresList');

    defaultContainer.innerHTML = '';
    splitContainer.innerHTML = '';
    customContainer.innerHTML = '';

    const defaultLabels = {
        'tour_epaules': 'Tour d\'épaules',
        'tour_poitrine': 'Tour de poitrine',
        'tour_bras': 'Tour de bras',
        'tour_avant_bras': 'Tour d\'avant bras',
        'tour_taille': 'Tour de taille',
        'tour_ventre': 'Tour de ventre',
        'tour_cuisse': 'Tour de cuisse',
        'tour_mollet': 'Tour de mollet',
        'tour_cou': 'Tour de cou',
        'tour_hanches': 'Tour de hanches',
        'tour_poignets': 'Tour de poignets'
    };

    const splitLabels = {
        'tour_bras_g': 'Tour de bras G',
        'tour_bras_d': 'Tour de bras D',
        'tour_avant_bras_g': 'Tour d\'avant bras G',
        'tour_avant_bras_d': 'Tour d\'avant bras D',
        'tour_poignet_g': 'Tour de poignet G',
        'tour_poignet_d': 'Tour de poignet D',
        'tour_cuisse_g': 'Tour de cuisse G',
        'tour_cuisse_d': 'Tour de cuisse D',
        'tour_mollet_g': 'Tour de mollet G',
        'tour_mollet_d': 'Tour de mollet D'
    };

    const defaultGrid = document.createElement('div');
    defaultGrid.className = 'measure-checkbox-grid';
    Object.keys(settings.defaultMeasures).forEach(key => {
        const item = document.createElement('div');
        item.className = 'measure-checkbox-item';

        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.id = 'cb_' + key;
        cb.checked = !!settings.defaultMeasures[key];
        cb.dataset.type = 'default';
        cb.dataset.key = key;

        const label = document.createElement('label');
        label.setAttribute('for', cb.id);
        label.textContent = defaultLabels[key] || key;

        item.appendChild(cb);
        item.appendChild(label);
        defaultGrid.appendChild(item);
    });
    defaultContainer.appendChild(defaultGrid);

    const splitGrid = document.createElement('div');
    splitGrid.className = 'measure-checkbox-grid';
    Object.keys(settings.splitMeasures).forEach(key => {
        const item = document.createElement('div');
        item.className = 'measure-checkbox-item';

        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.id = 'cb_' + key;
        cb.checked = !!settings.splitMeasures[key];
        cb.dataset.type = 'split';
        cb.dataset.key = key;

        const label = document.createElement('label');
        label.setAttribute('for', cb.id);
        label.textContent = splitLabels[key] || key;

        item.appendChild(cb);
        item.appendChild(label);
        splitGrid.appendChild(item);
    });
    splitContainer.appendChild(splitGrid);

    settings.customMeasures.forEach(name => {
        const row = document.createElement('div');
        row.className = 'draft-item';

        const span = document.createElement('span');
        span.textContent = name;

        const btnDel = document.createElement('button');
        btnDel.type = 'button';
        btnDel.className = 'btn-remove';
        btnDel.textContent = 'Supprimer';
        btnDel.addEventListener('click', function () {
            removeCustomMeasure(name);
        });

        row.appendChild(span);
        row.appendChild(btnDel);
        customContainer.appendChild(row);
    });

    defaultContainer.addEventListener('change', onSettingsCheckboxChange);
    splitContainer.addEventListener('change', onSettingsCheckboxChange);
}

/**
 * Gère la logique des cases par défaut vs dissociées.
 */
function onSettingsCheckboxChange(e) {
    const target = e.target;
    if (!target || target.type !== 'checkbox') return;

    const type = target.dataset.type;
    const key = target.dataset.key;

    const settings = loadSettings();

    if (type === 'default') {
        settings.defaultMeasures[key] = target.checked;

        if (key === 'tour_bras') {
            settings.splitMeasures['tour_bras_g'] = false;
            settings.splitMeasures['tour_bras_d'] = false;
            const cbG = document.getElementById('cb_tour_bras_g');
            const cbD = document.getElementById('cb_tour_bras_d');
            if (cbG) cbG.checked = false;
            if (cbD) cbD.checked = false;
        }
        if (key === 'tour_avant_bras') {
            settings.splitMeasures['tour_avant_bras_g'] = false;
            settings.splitMeasures['tour_avant_bras_d'] = false;
            const cbG = document.getElementById('cb_tour_avant_bras_g');
            const cbD = document.getElementById('cb_tour_avant_bras_d');
            if (cbG) cbG.checked = false;
            if (cbD) cbD.checked = false;
        }
        if (key === 'tour_cuisse') {
            settings.splitMeasures['tour_cuisse_g'] = false;
            settings.splitMeasures['tour_cuisse_d'] = false;
            const cbG = document.getElementById('cb_tour_cuisse_g');
            const cbD = document.getElementById('cb_tour_cuisse_d');
            if (cbG) cbG.checked = false;
            if (cbD) cbD.checked = false;
        }
        if (key === 'tour_mollet') {
            settings.splitMeasures['tour_mollet_g'] = false;
            settings.splitMeasures['tour_mollet_d'] = false;
            const cbG = document.getElementById('cb_tour_mollet_g');
            const cbD = document.getElementById('cb_tour_mollet_d');
            if (cbG) cbG.checked = false;
            if (cbD) cbD.checked = false;
        }
        if (key === 'tour_poignets') {
            settings.splitMeasures['tour_poignet_g'] = false;
            settings.splitMeasures['tour_poignet_d'] = false;
            const cbG = document.getElementById('cb_tour_poignet_g');
            const cbD = document.getElementById('cb_tour_poignet_d');
            if (cbG) cbG.checked = false;
            if (cbD) cbD.checked = false;
        }
    } else if (type === 'split') {
        const checked = target.checked;
        settings.splitMeasures[key] = checked;

        if (key === 'tour_bras_g' || key === 'tour_bras_d') {
            const cbG = document.getElementById('cb_tour_bras_g');
            const cbD = document.getElementById('cb_tour_bras_d');
            if (checked) {
                if (cbG) cbG.checked = true;
                if (cbD) cbD.checked = true;
                settings.splitMeasures['tour_bras_g'] = true;
                settings.splitMeasures['tour_bras_d'] = true;
                settings.defaultMeasures['tour_bras'] = false;
                const cbGlobal = document.getElementById('cb_tour_bras');
                if (cbGlobal) cbGlobal.checked = false;
            }
        }
        if (key === 'tour_avant_bras_g' || key === 'tour_avant_bras_d') {
            const cbG = document.getElementById('cb_tour_avant_bras_g');
            const cbD = document.getElementById('cb_tour_avant_bras_d');
            if (checked) {
                if (cbG) cbG.checked = true;
                if (cbD) cbD.checked = true;
                settings.splitMeasures['tour_avant_bras_g'] = true;
                settings.splitMeasures['tour_avant_bras_d'] = true;
                settings.defaultMeasures['tour_avant_bras'] = false;
                const cbGlobal = document.getElementById('cb_tour_avant_bras');
                if (cbGlobal) cbGlobal.checked = false;
            }
        }
        if (key === 'tour_cuisse_g' || key === 'tour_cuisse_d') {
            const cbG = document.getElementById('cb_tour_cuisse_g');
            const cbD = document.getElementById('cb_tour_cuisse_d');
            if (checked) {
                if (cbG) cbG.checked = true;
                if (cbD) cbD.checked = true;
                settings.splitMeasures['tour_cuisse_g'] = true;
                settings.splitMeasures['tour_cuisse_d'] = true;
                settings.defaultMeasures['tour_cuisse'] = false;
                const cbGlobal = document.getElementById('cb_tour_cuisse');
                if (cbGlobal) cbGlobal.checked = false;
            }
        }
        if (key === 'tour_mollet_g' || key === 'tour_mollet_d') {
            const cbG = document.getElementById('cb_tour_mollet_g');
            const cbD = document.getElementById('cb_tour_mollet_d');
            if (checked) {
                if (cbG) cbG.checked = true;
                if (cbD) cbD.checked = true;
                settings.splitMeasures['tour_mollet_g'] = true;
                settings.splitMeasures['tour_mollet_d'] = true;
                settings.defaultMeasures['tour_mollet'] = false;
                const cbGlobal = document.getElementById('cb_tour_mollet');
                if (cbGlobal) cbGlobal.checked = false;
            }
        }
        if (key === 'tour_poignet_g' || key === 'tour_poignet_d') {
            const cbG = document.getElementById('cb_tour_poignet_g');
            const cbD = document.getElementById('cb_tour_poignet_d');
            if (checked) {
                if (cbG) cbG.checked = true;
                if (cbD) cbD.checked = true;
                settings.splitMeasures['tour_poignet_g'] = true;
                settings.splitMeasures['tour_poignet_d'] = true;
                settings.defaultMeasures['tour_poignets'] = false;
                const cbGlobal = document.getElementById('cb_tour_poignets');
                if (cbGlobal) cbGlobal.checked = false;
            }
        }
    }

    saveSettings(settings);
    buildMeasureFields(settings);
}

/**
 * Ajoute un champ personnalisé.
 */
function addCustomMeasure(name) {
    const trimmed = name.trim();
    if (!trimmed) return;
    const settings = loadSettings();
    if (!settings.customMeasures.includes(trimmed)) {
        settings.customMeasures.push(trimmed);
        saveSettings(settings);
        buildSettingsView(settings);
        buildMeasureFields(settings);
    }
}

/**
 * Supprime un champ personnalisé.
 */
function removeCustomMeasure(name) {
    const settings = loadSettings();
    settings.customMeasures = settings.customMeasures.filter(n => n !== name);
    saveSettings(settings);
    buildSettingsView(settings);
    buildMeasureFields(settings);
}

/**
 * Soumission de la nouvelle saisie.
 */
function handleNewEntrySubmit(e) {
    e.preventDefault();
    const dateInput = document.getElementById('entryDate');
    const weightInput = document.getElementById('entryWeight');

    const dateValue = dateInput.value;
    const weightValue = weightInput.value ? parseFloat(weightInput.value) : null;

    if (!dateValue) {
        alert('Merci de renseigner la date.');
        return;
    }

    const measures = {};
    const inputs = document.querySelectorAll('#measureFieldsContainer input[data-measure-id]');
    inputs.forEach(input => {
        const val = input.value;
        if (val !== '') {
            measures[input.dataset.measureId] = parseFloat(val);
        }
    });

    const entries = loadEntries();

    const existingIndex = entries.findIndex(e => e.date === dateValue);
    const entryData = {
        date: dateValue,
        weight: weightValue,
        measures: measures
    };

    if (existingIndex >= 0) {
        entries[existingIndex] = entryData;
    } else {
        entries.push(entryData);
    }

    saveEntries(entries);

    alert('Saisie enregistrée.');
    e.target.reset();
    document.getElementById('entryDate').value = getTodayDateString();
}

/**
 * Construit la liste des saisies.
 */
function buildEntriesList() {
    const entries = sortEntriesByDateDesc(loadEntries());
    const container = document.getElementById('entriesList');
    container.innerHTML = '';

    if (entries.length === 0) {
        const p = document.createElement('p');
        p.textContent = 'Aucune saisie pour le moment.';
        p.style.fontSize = '0.9rem';
        p.style.color = '#bbb';
        container.appendChild(p);
        return;
    }

    entries.forEach(entry => {
        const div = document.createElement('div');
        div.className = 'result-item';

        const title = document.createElement('strong');
        title.textContent = entry.date;

        const p = document.createElement('p');
        p.style.margin = '0';
        p.style.fontSize = '0.85rem';
        const weightStr = entry.weight != null ? `Poids: ${entry.weight} kg` : 'Poids: -';
        p.textContent = weightStr + ` • Mensurations: ${Object.keys(entry.measures).length}`;

        div.appendChild(title);
        div.appendChild(p);

        div.addEventListener('click', function () {
            if (confirm('Supprimer la saisie du ' + entry.date + ' ?')) {
                deleteEntry(entry.date);
            }
        });

        container.appendChild(div);
    });
}

/**
 * Supprime une saisie par date.
 */
function deleteEntry(date) {
    let entries = loadEntries();
    entries = entries.filter(e => e.date !== date);
    saveEntries(entries);
    buildEntriesList();
}

/**
 * Initialise les dates par défaut pour les stats.
 */
function initStatsDates() {
    const entries = sortEntriesByDateDesc(loadEntries());
    if (entries.length === 0) {
        document.getElementById('statsFromDate').value = '';
        document.getElementById('statsToDate').value = '';
        return;
    }
    const oldest = entries[entries.length - 1];
    const newest = entries[0];
    document.getElementById('statsFromDate').value = oldest.date;
    document.getElementById('statsToDate').value = newest.date;
}

/**
 * Calcule et affiche les tendances.
 */
function computeStats() {
    const fromDate = document.getElementById('statsFromDate').value;
    const toDate = document.getElementById('statsToDate').value;
    const container = document.getElementById('statsResults');
    container.innerHTML = '';

    if (!fromDate || !toDate) {
        container.textContent = 'Merci de sélectionner deux dates.';
        return;
    }

    const entries = loadEntries();
    const fromEntry = entries.find(e => e.date === fromDate);
    const toEntry = entries.find(e => e.date === toDate);

    if (!fromEntry || !toEntry) {
        container.textContent = 'Impossible de trouver les saisies pour ces dates.';
        return;
    }

    const rows = [];

    if (fromEntry.weight != null || toEntry.weight != null) {
        const diff = (toEntry.weight || 0) - (fromEntry.weight || 0);
        rows.push({ label: 'Poids (kg)', diff: diff });
    }

    const keys = new Set([
        ...Object.keys(fromEntry.measures || {}),
        ...Object.keys(toEntry.measures || {})
    ]);

    keys.forEach(key => {
        const valFrom = fromEntry.measures[key] || 0;
        const valTo = toEntry.measures[key] || 0;
        const diff = valTo - valFrom;
        rows.push({ label: key, diff: diff });
    });

    if (rows.length === 0) {
        container.textContent = 'Aucune donnée à comparer.';
        return;
    }

    rows.forEach(r => {
        const div = document.createElement('div');
        div.className = 'stats-row';
        if (r.diff > 0) div.classList.add('positive');
        if (r.diff < 0) div.classList.add('negative');
        const sign = r.diff > 0 ? '+' : '';
        div.textContent = `${r.label} : ${sign}${r.diff.toFixed(1)}`;
        container.appendChild(div);
    });
}

/**
 * Construit l'objet d'export JSON.
 */
function buildExportObject() {
    return {
        settings: loadSettings(),
        entries: loadEntries()
    };
}

/**
 * Télécharge un fichier JSON avec les données. [web:16][web:17][web:20][web:23]
 */
function exportDataAsJson() {
    const data = buildExportObject();
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'husky-measure-log-data.json';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 0);
}

/**
 * Importe des données JSON depuis un fichier. [web:52][web:53][web:50]
 */
function importDataFromJsonFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const content = e.target.result;
            const data = JSON.parse(content);
            if (data.settings) {
                saveSettings(data.settings);
            }
            if (data.entries) {
                saveEntries(data.entries);
            }
            alert('Données importées avec succès.');
            const settings = loadSettings();
            buildSettingsView(settings);
            buildMeasureFields(settings);
            buildEntriesList();
            initStatsDates();
        } catch (err) {
            console.error('Erreur import JSON', err);
            alert('Fichier invalide.');
        }
    };
    reader.readAsText(file);
}

/**
 * Initialise l'application.
 */
function initApp() {
    const settings = loadSettings();
    buildMeasureFields(settings);
    buildSettingsView(settings);
    buildEntriesList();
    initStatsDates();

    document.getElementById('entryDate').value = getTodayDateString();

    document.getElementById('btnNewEntry').addEventListener('click', function () {
        showView('view-new-entry');
    });
    document.getElementById('btnInitialSettings').addEventListener('click', function () {
        showView('view-initial-settings');
    });
    document.getElementById('btnManageEntries').addEventListener('click', function () {
        buildEntriesList();
        showView('view-manage-entries');
    });
    document.getElementById('btnStats').addEventListener('click', function () {
        initStatsDates();
        showView('view-stats');
    });

    document.getElementById('btnBack').addEventListener('click', function () {
        showView('view-main-menu');
    });
    document.getElementById('appTitle').addEventListener('click', function () {
        showView('view-main-menu');
    });

    document.getElementById('newEntryForm').addEventListener('submit', handleNewEntrySubmit);

    document.getElementById('btnSaveSettings').addEventListener('click', function () {
        alert('Réglages initiaux sauvegardés.');
    });

    document.getElementById('btnAddCustomMeasure').addEventListener('click', function () {
        const input = document.getElementById('newCustomMeasureName');
        addCustomMeasure(input.value);
        input.value = '';
    });

    document.getElementById('btnComputeStats').addEventListener('click', computeStats);

    document.getElementById('btnExportJson').addEventListener('click', exportDataAsJson);

    document.getElementById('importJsonInput').addEventListener('change', function () {
        const file = this.files[0];
        importDataFromJsonFile(file);
        this.value = '';
    });

    const logo = document.getElementById('huskyLogo');
    if (logo) {
        logo.addEventListener('click', function () {
            window.location.href = 'index.html';
        });
    }
}

// Démarrage de l'application quand le DOM est prêt.
document.addEventListener('DOMContentLoaded', initApp);
