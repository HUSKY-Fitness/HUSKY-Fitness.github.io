/**
 * HUSKY Training Log - Logic Complete
 * - WAKE LOCK
 * - GIF / WEBP Support
 * - 5 DEFAULT WORKOUTS (Push, Pull, Upper, Legs 1, Legs 2)
 * - CIRCUIT RESTART
 */
'use strict';

const app = {
    data: { exercises: [], workouts: [], circuits: [], logs: [] },
    state: { 
        currentView: 'view-menu', 
        activeExerciseId: null, 
        activeWorkoutId: null, 
        mode: 'free', 
        editingWorkoutId: null, 
        tempWorkoutStructure: [],
        
        timerInterval: null,
        timerRemaining: 0,
        activeTimerBtn: null,

        activeCircuit: null,
        circuitState: { isRunning: false, stepIndex: -1, mode: 'ready', timeRemaining: 0, intervalId: null },
        tempCircuitStructure: [],
        
        wakeLock: null
    },

    init: function() {
        try {
            const se = localStorage.getItem('husky_exercises'); if (se) this.data.exercises = JSON.parse(se); else { this.parseRawData(); this.saveData('exercises'); }
            const sw = localStorage.getItem('husky_workouts'); if (sw) this.data.workouts = JSON.parse(sw);
            const sl = localStorage.getItem('husky_logs'); if (sl) this.data.logs = JSON.parse(sl);
            const sc = localStorage.getItem('husky_circuits'); if (sc) this.data.circuits = JSON.parse(sc);
            
            // Création données par défaut si vide
            if (this.data.circuits.length === 0 && this.data.exercises.length > 0) this.createDefaultCircuit();
            if (this.data.workouts.length === 0 && this.data.exercises.length > 0) this.createDefaultWorkouts();

        } catch (e) { console.error(e); }
        const btnBack = document.getElementById('btn-back'); if(btnBack) btnBack.addEventListener('click', () => this.handleBack());
    },

    // --- WAKE LOCK API ---
    enableWakeLock: async function() { if ('wakeLock' in navigator) { try { this.state.wakeLock = await navigator.wakeLock.request('screen'); } catch (err) { console.log("Wake Lock error:", err); } } },
    disableWakeLock: function() { if (this.state.wakeLock) { this.state.wakeLock.release().then(() => { this.state.wakeLock = null; }); } },

    parseRawData: function() {
        if (typeof RAW_EXERCISES_DATA === 'undefined') return;
        const lines = RAW_EXERCISES_DATA.split('\n'); let idCounter = 1;
        lines.forEach(line => {
            if (line.trim() === "") return; const parts = line.split(';');
            if (parts.length >= 4) { this.data.exercises.push({ id: idCounter++, name: parts[0].trim(), primary: parts[1].trim(), secondary: parts[2].trim(), material: parts[3].trim() }); }
        });
    },

    // --- DEFAULT DATA CREATION ---

    getExIdByName: function(namePart) {
        const ex = this.data.exercises.find(e => e.name.toLowerCase().includes(namePart.toLowerCase()));
        return ex ? ex.id : null;
    },

    createDefaultWorkouts: function() {
        const defs = [
            {
                name: "PUSH (Poussée)",
                keys: ["Developpe militaire (jammer arm)", "Extension triceps poulie haute", "Elevations laterales unilaterale poulie", "Presse jammer arm (incliné)", "Extension triceps poulie"]
            },
            {
                name: "PULL (Tirage)",
                keys: ["Traction", "Curl haltere debout banc incline", "Tirage horizontal", "Curl marteau poulie basse", "Face pull"]
            },
            {
                name: "UPPER (Haut du corps)",
                keys: ["Developpe couche barre", "Curl haltere debout banc incline", "Extension triceps poulie haute", "Elevations laterales unilaterale poulie", "Tirage vertical poitrine", "Face pull"]
            },
            {
                name: "LEGS 1",
                keys: ["Squat bulgare halteres", "Montees sur banc", "Leg curl allonge", "Extension mollets assis barre", "Face pull", "Flexion du cou", "Extension du cou"]
            },
            {
                name: "LEGS 2",
                keys: ["Souleve de terre avec machine", "Montees sur banc", "Abduction de hanche a la poulie", "Leg curl allonge", "Shrug barre", "Rowing vertical (upright row)"]
            }
        ];

        defs.forEach(def => {
            const ids = [];
            def.keys.forEach(k => {
                const foundId = this.getExIdByName(k);
                if (foundId) ids.push(foundId);
            });
            if (ids.length > 0) {
                this.data.workouts.push({ id: Date.now() + Math.random(), name: def.name, exercises: ids });
            }
        });
        this.saveData('workouts');
    },


    createDefaultCircuit: function() {
        // Définition des circuits par défaut
        const definitions = [
            {
                name: "Circuit Abdos 3 minutes",
                // Temps Effort / Temps Repos
                work: 30, rest: 15,
                // Mots clés pour trouver les exercices
                exercises: ["Crunch au sol", "Releve jambes chaise romaine abdominaux", "Bear plank avec kickback", "Mountain climber"]
            },
            {
                name: "Circuit Cardio / Full Body 6 minutes",
                work: 45, rest: 15,
                exercises: ["Air Squat", "Bear plank avec kickback", "Mountain climber", "Squat statique", "Fentes avant", "Pompe"] 
            },
            {
                name: "Circuit Avant bras 6 minutes",
                work: 40, rest: 20,
                exercises: ["Bobine andrieu", "Wrist curl pronation", "Wrist curl supination", "Curl inverse barre", "Hand Grip","Marche du fermier"]
            }
        ];

        definitions.forEach(def => {
            const circuitExs = [];
            def.exercises.forEach(nameKey => { 
                const id = this.getExIdByName(nameKey); 
                // Vérifie que l'exo existe et n'est pas déjà dans ce circuit
                if(id && !circuitExs.find(c => c.exerciseId === id)) {
                    circuitExs.push({ exerciseId: id, workTime: def.work, restTime: def.rest }); 
                }
            });
            
            // On ajoute le circuit seulement si on a trouvé des exercices correspondants
            if (circuitExs.length > 0) {
                this.data.circuits.push({ 
                    id: Date.now() + Math.floor(Math.random() * 1000), // Petit random pour éviter doublon d'ID si boucle rapide
                    name: def.name, 
                    exercises: circuitExs 
                });
            }
        });

        this.saveData('circuits');
    },



    saveData: function(key) {
        if (key === 'exercises') localStorage.setItem('husky_exercises', JSON.stringify(this.data.exercises));
        if (key === 'workouts') localStorage.setItem('husky_workouts', JSON.stringify(this.data.workouts));
        if (key === 'logs') localStorage.setItem('husky_logs', JSON.stringify(this.data.logs));
        if (key === 'circuits') localStorage.setItem('husky_circuits', JSON.stringify(this.data.circuits));
    },

    exportData: function() {
        const d = { date: new Date().toISOString(), exercises: this.data.exercises, workouts: this.data.workouts, logs: this.data.logs, circuits: this.data.circuits };
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(d)); const a = document.createElement('a'); a.href = dataStr; a.download = "husky_training_backup.json"; document.body.appendChild(a); a.click(); a.remove();
    },

    importData: function(inputElement) {
        const file = inputElement.files[0]; if (!file) return; const reader = new FileReader();
        reader.onload = (e) => { try { const imported = JSON.parse(e.target.result); if (imported.exercises && confirm("Remplacer les données actuelles ?")) { this.data.exercises = imported.exercises; this.data.workouts = imported.workouts || []; this.data.logs = imported.logs || []; this.data.circuits = imported.circuits || []; this.saveData('exercises'); this.saveData('workouts'); this.saveData('logs'); this.saveData('circuits'); location.reload(); } } catch (err) { alert("Erreur fichier"); } }; reader.readAsText(file);
    },

    navTo: function(viewId, contextData = null) {
        this.stopTimer(); this.stopCircuit(); // Nettoyage
        
        document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
        let targetHtmlId = `view-${viewId}`;
        if (viewId === 'free-training' || viewId === 'manage-exercises') targetHtmlId = 'view-exercise-list';
        
        const target = document.getElementById(targetHtmlId); if(target) target.classList.add('active');
        this.state.currentView = viewId;

        const btnBack = document.getElementById('btn-back'); const title = document.getElementById('page-title'); const search = document.getElementById('search-exercise');
        if (viewId === 'menu') { if(btnBack) btnBack.classList.add('hidden'); if(title) title.innerText = "HUSKY TRAINING LOG"; } else { if(btnBack) btnBack.classList.remove('hidden'); }
        if ((viewId === 'free-training' || viewId === 'manage-exercises') && search) search.value = "";

        switch(viewId) {
            case 'free-training': this.state.mode = 'free'; if(title) title.innerText = "LIBRE"; document.getElementById('btn-add-exercise-action').classList.add('hidden'); this.renderExerciseList('exercise-list-container', true); break;
            case 'manage-exercises': this.state.mode = 'manage_ex'; if(title) title.innerText = "EXERCICES"; document.getElementById('btn-add-exercise-action').classList.remove('hidden'); this.renderExerciseList('exercise-list-container', false); break;
            case 'exercise-detail': this.state.activeExerciseId = contextData.id; if(title) title.innerText = "EN COURS"; this.renderExerciseDetail(contextData); break;
            case 'daily-summary': if(title) title.innerText = "BILAN JOUR"; this.renderDailySummary(); break;
            case 'saved-workouts': if(title) title.innerText = "PROGRAMMES"; this.renderSavedWorkoutsList(); break;
            case 'workout-runner': this.state.mode = 'runner'; this.state.activeWorkoutId = contextData.id; if(title) title.innerText = contextData.name.toUpperCase(); this.renderWorkoutRunner(contextData); break;
            case 'manage-workouts': this.state.mode = 'manage_workout'; if(title) title.innerText = "GESTION PRG"; this.renderManageWorkoutsList(); break;
            case 'workout-editor': if(title) title.innerText = "EDITEUR PRG"; this.renderWorkoutEditor(contextData); break;
            case 'exercise-creator': if(title) title.innerText = "NOUVEAU"; document.getElementById('new-ex-name').value = ""; break;
            case 'saved-circuits': if(title) title.innerText = "CIRCUITS"; this.renderSavedCircuitsList(); break;
            case 'manage-circuits': if(title) title.innerText = "GESTION CIRC"; this.renderManageCircuitsList(); break;
            case 'circuit-editor': if(title) title.innerText = "EDITEUR CIRC"; this.renderCircuitEditor(contextData); break;
            case 'circuit-runner': if(title) title.innerText = "EN COURS"; this.initCircuitRunner(contextData); break;
        }
    },

    handleBack: function() {
        const current = this.state.currentView;
        if (current === 'exercise-detail') {
            if (this.state.mode === 'runner') { const w = this.data.workouts.find(x => x.id === this.state.activeWorkoutId); this.navTo('workout-runner', w); } else this.navTo('free-training');
        } 
        else if (current === 'workout-runner') this.navTo('saved-workouts');
        else if (current === 'workout-editor') this.navTo('manage-workouts');
        else if (current === 'exercise-creator') this.navTo('manage-exercises');
        else if (current === 'circuit-runner') this.navTo('saved-circuits');
        else if (current === 'circuit-editor') this.navTo('manage-circuits');
        else this.navTo('menu');
    },

    // --- HELPER IMAGE LOADER (GIF puis WEBP) ---
    loadImageSmart: function(imgElement, containerElement, exName) {
        if (!exName) return;
        const normalizeFilename = (name) => name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
        const baseName = normalizeFilename(exName);
        
        // Essai 1: GIF
        imgElement.src = `gif/${baseName}.gif`;
        containerElement.style.display = 'block';

        imgElement.onerror = function() {
            // Essai 2: WEBP si le GIF plante
            this.onerror = function() {
                // Tout a échoué
                containerElement.style.display = 'none';
            };
            this.src = `gif/${baseName}.webp`;
        };
    },

    // ... (renderExerciseList, filterExercises Identiques) ...
    renderExerciseList: function(containerId, clickToTrain) { const c = document.getElementById(containerId); if(!c) return; c.innerHTML = ""; [...this.data.exercises].sort((a,b) => a.name.localeCompare(b.name)).forEach(ex => { const div = document.createElement('div'); div.className = 'result-item'; div.dataset.search = (ex.name + " " + ex.primary).toLowerCase(); let html = `<strong>${ex.name}</strong><div style="font-size:0.8rem; color:#ccc;">${ex.primary}</div>`; if (!clickToTrain && this.state.mode === 'manage_ex') html += `<div style="margin-top:5px; text-align:right;"><button class="btn-remove" onclick="event.stopPropagation(); app.deleteExercise(${ex.id})">Supprimer</button></div>`; div.innerHTML = html; div.onclick = () => { if (clickToTrain) this.navTo('exercise-detail', ex); }; c.appendChild(div); }); },
    filterExercises: function() { const q = document.getElementById('search-exercise').value.toLowerCase(); document.querySelectorAll('#exercise-list-container .result-item').forEach(item => item.classList.toggle('hidden', !(item.dataset.search || "").includes(q))); },
    
    renderExerciseDetail: function(exercise) { 
        document.getElementById('detail-exercise-name').innerText = exercise.name; document.getElementById('detail-exercise-muscles').innerText = "Muscles: " + exercise.primary; document.getElementById('detail-exercise-material').innerText = "Matériel: " + exercise.material; 
        
        // Utilisation du nouveau loader
        const gifContainer = document.getElementById('exercise-gif-container'); 
        const gifImage = document.getElementById('exercise-gif-image'); 
        this.loadImageSmart(gifImage, gifContainer, exercise.name);

        const historyDiv = document.getElementById('history-content'); const historyLogs = this.data.logs.filter(l => l.exerciseId === exercise.id).sort((a,b) => b.date - a.date); if (historyLogs.length > 0) { const last = historyLogs[0]; const date = new Date(last.date).toLocaleDateString('fr-FR'); let html = `<div style="margin-bottom:5px; color:var(--primary-color)">Le ${date} :</div>`; last.sets.forEach((s, i) => { if(s.weight || s.reps) html += `<div style="margin-left:10px;">Set ${i+1}: <strong>${s.weight}kg</strong> x <strong>${s.reps}</strong></div>`; }); historyDiv.innerHTML = html; } else historyDiv.innerText = "Première session !"; const setsContainer = document.getElementById('sets-container'); setsContainer.innerHTML = ""; const today = new Date().setHours(0,0,0,0); let currentSessionLog = this.data.logs.find(l => l.exerciseId === exercise.id && l.date >= today); let existingSets = currentSessionLog ? currentSessionLog.sets : []; for(let i=0; i<5; i++) { const savedData = existingSets[i] || { weight: '', reps: '', rpe: 'moyen' }; const row = document.createElement('div'); row.className = 'set-row'; row.innerHTML = `<span class="set-label">#${i+1}</span><input type="number" placeholder="kg" id="set-weight-${i}" value="${savedData.weight}"><input type="number" placeholder="reps" id="set-reps-${i}" value="${savedData.reps}"><select id="set-rpe-${i}"><option value="moyen">Moyen</option><option value="echec">Echec</option></select>`; setsContainer.appendChild(row); } 
    },
    
    // ... (Timers simple et Summary) ...
    startTimer: function(seconds, btnElement) { this.state.timerRemaining += seconds; if (this.state.activeTimerBtn && this.state.activeTimerBtn !== btnElement) { this.state.activeTimerBtn.classList.remove('active-timer'); this.resetSingleButtonText(this.state.activeTimerBtn); } this.state.activeTimerBtn = btnElement; this.updateTimerDisplay(); btnElement.classList.add('active-timer'); if (!this.state.timerInterval) { this.state.timerInterval = setInterval(() => { this.state.timerRemaining--; if (this.state.timerRemaining > 0) this.updateTimerDisplay(); else { this.stopTimer(); btnElement.innerText = "Terminé !"; if ("vibrate" in navigator) navigator.vibrate([200]); setTimeout(() => { if (!this.state.timerInterval) this.resetTimerButtons(); }, 2000); } }, 1000); } },
    updateTimerDisplay: function() { if (this.state.activeTimerBtn) { const m = Math.floor(this.state.timerRemaining / 60); const s = this.state.timerRemaining % 60; this.state.activeTimerBtn.innerText = m > 0 ? `${m}m ${s}s` : `${s}s`; } },
    stopTimer: function() { if (this.state.timerInterval) clearInterval(this.state.timerInterval); this.state.timerInterval = null; this.state.timerRemaining = 0; this.state.activeTimerBtn = null; this.resetTimerButtons(); },
    resetTimerButtons: function() { document.querySelectorAll('.btn-timer').forEach(btn => { btn.classList.remove('active-timer'); this.resetSingleButtonText(btn); }); },
    resetSingleButtonText: function(btn) { const labels = ["30s", "60s", "2m", "3m"]; const index = Array.from(document.querySelectorAll('.btn-timer')).indexOf(btn); if (index >= 0) btn.innerText = labels[index]; },
    finishCurrentExercise: function() { this.handleBack(); },
    renderDailySummary: function() { const c = document.getElementById('daily-summary-container'); c.innerHTML = ""; const todayStart = new Date().setHours(0,0,0,0); const dailyLogs = this.data.logs.filter(l => l.date >= todayStart); if(dailyLogs.length===0) return c.innerHTML = "<div style='text-align:center;color:#888'>Aucun exercice</div>"; dailyLogs.forEach(log => { const ex = this.data.exercises.find(e => e.id === log.exerciseId); if(ex) { const div = document.createElement('div'); div.className = 'card-highlight'; div.innerHTML = `<h3>${ex.name}</h3>` + log.sets.filter(s=>s.weight||s.reps).map((s,i)=>`<div>Série ${i+1}: ${s.weight}kg x ${s.reps}</div>`).join(''); c.appendChild(div); } }); },

    // --- LOGIQUE CIRCUIT ---
    renderSavedCircuitsList: function() { const c = document.getElementById('saved-circuits-list'); c.innerHTML = ""; if (this.data.circuits.length === 0) { c.innerHTML = "<div style='text-align:center; padding:20px'>Aucun circuit.</div>"; return; } this.data.circuits.forEach(circ => { const div = document.createElement('div'); div.className = 'result-item'; div.innerHTML = `<strong>${circ.name}</strong><span style="font-size:0.8rem; color:#aaa">${circ.exercises.length} exercices</span>`; div.onclick = () => this.navTo('circuit-runner', circ); c.appendChild(div); }); },
    renderManageCircuitsList: function() { const c = document.getElementById('manage-circuits-list'); c.innerHTML = ""; this.data.circuits.forEach(circ => { const div = document.createElement('div'); div.className = 'result-item draft-item'; div.innerHTML = `<div><strong>${circ.name}</strong></div><div><button class="btn-small" onclick="event.stopPropagation(); app.editCircuit(${circ.id})">Edit</button><button class="btn-remove" onclick="event.stopPropagation(); app.deleteCircuit(${circ.id})">X</button></div>`; c.appendChild(div); }); },
    createNewCircuit: function() { this.state.editingCircuitId = null; this.state.tempCircuitStructure = []; this.navTo('circuit-editor', null); },
    editCircuit: function(id) { const c = this.data.circuits.find(x => x.id === id); this.state.editingCircuitId = id; this.state.tempCircuitStructure = JSON.parse(JSON.stringify(c.exercises)); this.navTo('circuit-editor', c); },
    deleteCircuit: function(id) { if(confirm("Supprimer ?")) { this.data.circuits = this.data.circuits.filter(c => c.id !== id); this.saveData('circuits'); this.renderManageCircuitsList(); } },
    renderCircuitEditor: function(circuit) { const n = document.getElementById('editor-circuit-name'); if(n) n.value = circuit ? circuit.name : ""; this.renderCircuitSelectedList(); const c = document.getElementById('circuit-search-list'); c.innerHTML = ""; [...this.data.exercises].sort((a,b) => a.name.localeCompare(b.name)).forEach(ex => { const div = document.createElement('div'); div.className = 'result-item'; div.dataset.search = ex.name.toLowerCase(); div.innerHTML = `<strong>${ex.name}</strong>`; div.onclick = () => { this.state.tempCircuitStructure.push({ exerciseId: ex.id, workTime: 30, restTime: 15 }); this.renderCircuitSelectedList(); }; c.appendChild(div); }); },
    renderCircuitSelectedList: function() { const c = document.getElementById('circuit-selected-list'); c.innerHTML = ""; this.state.tempCircuitStructure.forEach((item, idx) => { const ex = this.data.exercises.find(e => e.id === item.exerciseId); const div = document.createElement('div'); div.className = 'result-item'; div.innerHTML = `<div style="display:flex; justify-content:space-between;"><strong>${idx+1}. ${ex.name}</strong><button class="btn-remove" style="padding:2px 8px; font-size:0.7rem;" onclick="app.removeCircuitItem(${idx})">X</button></div><div class="circuit-item-config"><label>Effort:</label><input type="number" class="circuit-input-small" value="${item.workTime}" onchange="app.updateCircuitItem(${idx}, 'workTime', this.value)">s<label style="margin-left:10px">Repos:</label><input type="number" class="circuit-input-small" value="${item.restTime}" onchange="app.updateCircuitItem(${idx}, 'restTime', this.value)">s</div>`; c.appendChild(div); }); },
    updateCircuitItem: function(idx, field, val) { this.state.tempCircuitStructure[idx][field] = parseInt(val); },
    removeCircuitItem: function(idx) { this.state.tempCircuitStructure.splice(idx, 1); this.renderCircuitSelectedList(); },
    filterCircuitEditorExercises: function() { const q = document.getElementById('search-circuit-editor').value.toLowerCase(); document.querySelectorAll('#circuit-search-list .result-item').forEach(item => item.classList.toggle('hidden', !(item.dataset.search || "").includes(q))); },
    saveCircuitStructure: function() { const n = document.getElementById('editor-circuit-name').value; if (!n) return alert("Nom requis"); if (this.state.tempCircuitStructure.length === 0) return alert("Circuit vide"); if (this.state.editingCircuitId) { const c = this.data.circuits.find(x => x.id === this.state.editingCircuitId); c.name = n; c.exercises = this.state.tempCircuitStructure; } else { this.data.circuits.push({ id: Date.now(), name: n, exercises: this.state.tempCircuitStructure }); } this.saveData('circuits'); this.navTo('manage-circuits'); },

    // --- RUNNER CIRCUIT (Updated Restart) ---
    initCircuitRunner: function(circuit) {
        this.enableWakeLock();
        this.state.activeCircuit = circuit;
        this.state.circuitState = { isRunning: false, stepIndex: -1, mode: 'ready', timeRemaining: 5, intervalId: null };
        document.getElementById('circuit-runner-title').innerText = circuit.name;
        document.getElementById('btn-circuit-toggle').innerText = "▶ Start";
        this.updateCircuitUI();
    },

    toggleCircuitState: function() {
        // RESTART LOGIC
        if (this.state.circuitState.mode === 'finished') {
            this.initCircuitRunner(this.state.activeCircuit); // Re-init
            // Auto start after re-init
            this.state.circuitState.isRunning = true;
            document.getElementById('btn-circuit-toggle').innerText = "⏸ Pause";
            this.state.circuitState.intervalId = setInterval(() => this.tickCircuit(), 1000);
            return;
        }
        
        if (this.state.circuitState.isRunning) {
            clearInterval(this.state.circuitState.intervalId);
            this.state.circuitState.isRunning = false;
            document.getElementById('btn-circuit-toggle').innerText = "▶ Reprendre";
            document.getElementById('circuit-status-text').innerText = "PAUSE";
        } else {
            this.state.circuitState.isRunning = true;
            document.getElementById('btn-circuit-toggle').innerText = "⏸ Pause";
            this.state.circuitState.intervalId = setInterval(() => this.tickCircuit(), 1000);
            if(this.state.circuitState.mode === 'ready') this.updateCircuitUI();
        }
    },

    tickCircuit: function() {
        this.state.circuitState.timeRemaining--;
        if (this.state.circuitState.timeRemaining < 0) this.nextCircuitStep();
        else {
            const m = Math.floor(this.state.circuitState.timeRemaining / 60);
            const s = this.state.circuitState.timeRemaining % 60;
            document.getElementById('circuit-timer-display').innerText = `${m}:${s < 10 ? '0'+s : s}`;
        }
    },

    nextCircuitStep: function() {
        const cs = this.state.circuitState; const circuit = this.state.activeCircuit;
        if (cs.mode === 'ready' || cs.mode === 'rest') {
            cs.stepIndex++; if (cs.stepIndex >= circuit.exercises.length) { this.finishCircuit(); return; }
            cs.mode = 'work'; cs.timeRemaining = circuit.exercises[cs.stepIndex].workTime;
            if ("vibrate" in navigator) navigator.vibrate([300]);
        } else if (cs.mode === 'work') {
            if (cs.stepIndex >= circuit.exercises.length - 1) { this.finishCircuit(); return; }
            cs.mode = 'rest'; cs.timeRemaining = circuit.exercises[cs.stepIndex].restTime;
            if ("vibrate" in navigator) navigator.vibrate([100, 50, 100]);
        }
        this.updateCircuitUI();
    },

    skipCircuitStep: function() { this.nextCircuitStep(); },
    getCircuitExObj: function(idx) {
        if (!this.state.activeCircuit || !this.state.activeCircuit.exercises[idx]) return null;
        const id = this.state.activeCircuit.exercises[idx].exerciseId;
        return this.data.exercises.find(e => e.id === id);
    },

    updateCircuitUI: function() {
        const cs = this.state.circuitState;
        const box = document.getElementById('circuit-timer-box');
        const timerDisplay = document.getElementById('circuit-timer-display');
        const statusText = document.getElementById('circuit-status-text');
        const currentExText = document.getElementById('circuit-current-ex');
        const nextExText = document.getElementById('circuit-next-ex');
        const gifImg = document.getElementById('circuit-gif-image');
        const gifCont = document.getElementById('circuit-visual-container');
        const materialInfo = document.getElementById('circuit-material-info');

        const m = Math.floor(cs.timeRemaining / 60); const s = cs.timeRemaining % 60;
        timerDisplay.innerText = `${m}:${s < 10 ? '0'+s : s}`;
        box.className = 'circuit-timer-box';

        let targetEx = null;

        if (cs.mode === 'ready') {
            box.classList.add('mode-ready'); statusText.innerText = "PRÊT ?";
            targetEx = this.getCircuitExObj(0);
            currentExText.innerText = targetEx ? targetEx.name : ""; nextExText.innerText = "";
        } else if (cs.mode === 'work') {
            box.classList.add('mode-work'); statusText.innerText = "EFFORT";
            targetEx = this.getCircuitExObj(cs.stepIndex);
            currentExText.innerText = targetEx ? targetEx.name : "";
            const nextEx = this.getCircuitExObj(cs.stepIndex + 1);
            nextExText.innerText = nextEx ? `Repos puis : ${nextEx.name}` : "Dernier exercice !";
        } else if (cs.mode === 'rest') {
            box.classList.add('mode-rest'); statusText.innerText = "REPOS";
            targetEx = this.getCircuitExObj(cs.stepIndex + 1);
            currentExText.innerText = targetEx ? `À suivre : ${targetEx.name}` : "Fini après ça"; nextExText.innerText = "";
        } else if (cs.mode === 'finished') {
            box.classList.add('mode-ready'); statusText.innerText = "TERMINÉ";
            timerDisplay.innerText = "BRAVO"; currentExText.innerText = ""; nextExText.innerText = "";
            document.getElementById('btn-circuit-toggle').innerText = "Recommencer"; // Feedback visuel
            gifCont.style.display = 'none'; return;
        }

        if (targetEx) {
            gifCont.style.display = 'block';
            materialInfo.innerText = targetEx.material || "Aucun";
            // Utilisation loader pour UI Circuit
            this.loadImageSmart(gifImg, gifCont, targetEx.name);
        } else {
            gifCont.style.display = 'none';
        }
    },

    finishCircuit: function() {
        clearInterval(this.state.circuitState.intervalId);
        this.state.circuitState.mode = 'finished';
        this.updateCircuitUI();
        if ("vibrate" in navigator) navigator.vibrate([200, 100, 200, 100, 500]);
        this.disableWakeLock();
    },

    stopCircuit: function() { if (this.state.circuitState.intervalId) clearInterval(this.state.circuitState.intervalId); this.disableWakeLock(); },

    // ... (Reste inchangé) ...
    createNewWorkout: function() { this.state.editingWorkoutId = null; this.state.tempWorkoutStructure = []; this.navTo('workout-editor', null); },
    editWorkout: function(id) { const w = this.data.workouts.find(x => x.id === id); this.state.editingWorkoutId = id; this.state.tempWorkoutStructure = [...w.exercises]; this.navTo('workout-editor', w); },
    deleteWorkout: function(id) { if(confirm("Supprimer ?")) { this.data.workouts = this.data.workouts.filter(w => w.id !== id); this.saveData('workouts'); this.renderManageWorkoutsList(); } },
    renderWorkoutEditor: function(workout) { const n = document.getElementById('editor-workout-name'); if(n) n.value = workout ? workout.name : ""; const c = document.getElementById('editor-exercise-list'); if(!c) return; c.innerHTML = ""; [...this.data.exercises].sort((a,b) => a.name.localeCompare(b.name)).forEach(ex => { const div = document.createElement('div'); div.className = 'result-item'; div.dataset.search = (ex.name + " " + ex.primary).toLowerCase(); if (this.state.tempWorkoutStructure.includes(ex.id)) div.classList.add('selected-item'); div.innerHTML = `<strong>${ex.name}</strong><div style="font-size:0.8rem;color:#777">${ex.primary}</div>`; div.onclick = () => { if (this.state.tempWorkoutStructure.includes(ex.id)) { this.state.tempWorkoutStructure = this.state.tempWorkoutStructure.filter(id => id !== ex.id); div.classList.remove('selected-item'); } else { this.state.tempWorkoutStructure.push(ex.id); div.classList.add('selected-item'); } }; c.appendChild(div); }); },
    filterEditorExercises: function() { const q = document.getElementById('search-editor').value.toLowerCase(); document.querySelectorAll('#editor-exercise-list .result-item').forEach(item => item.classList.toggle('hidden', !(item.dataset.search || "").includes(q))); },
    saveWorkoutStructure: function() { const n = document.getElementById('editor-workout-name').value; if (!n) return alert("Nom requis"); if (this.state.tempWorkoutStructure.length === 0) return alert("Vide"); if (this.state.editingWorkoutId) { const w = this.data.workouts.find(x => x.id === this.state.editingWorkoutId); w.name = n; w.exercises = this.state.tempWorkoutStructure; } else { this.data.workouts.push({ id: Date.now(), name: n, exercises: this.state.tempWorkoutStructure }); } this.saveData('workouts'); this.navTo('manage-workouts'); },
    openExerciseCreator: function() { this.navTo('exercise-creator'); },
    saveCustomExercise: function() { const n = document.getElementById('new-ex-name').value; if(!n) return alert("Nom requis"); this.data.exercises.push({ id: Date.now(), name: n, primary: document.getElementById('new-ex-muscles').value, secondary: "", material: document.getElementById('new-ex-material').value }); this.saveData('exercises'); this.navTo('manage-exercises'); },
    deleteExercise: function(id) { if(confirm("Supprimer ?")) { this.data.exercises = this.data.exercises.filter(e => e.id !== id); this.saveData('exercises'); this.renderExerciseList('exercise-list-container', false); } },
    renderSavedWorkoutsList: function() { const c = document.getElementById('workouts-list-container'); if(!c) return; c.innerHTML = ""; if (this.data.workouts.length === 0) { c.innerHTML = "<div style='text-align:center; color:#777;'>Aucun programme.</div>"; return; } this.data.workouts.forEach(w => { const div = document.createElement('div'); div.className = 'result-item'; div.innerHTML = `<strong>${w.name}</strong><span style="font-size:0.85rem; color:#aaa">${w.exercises.length} exercices</span>`; div.onclick = () => this.navTo('workout-runner', w); c.appendChild(div); }); },
    renderWorkoutRunner: function(workout) { const c = document.getElementById('runner-exercises-list'); if(!c) return; c.innerHTML = ""; const todayStart = new Date().setHours(0,0,0,0); workout.exercises.forEach(exId => { const exObj = this.data.exercises.find(e => e.id === exId); if (!exObj) return; const isDone = this.data.logs.some(l => l.exerciseId === exId && l.date >= todayStart); const div = document.createElement('div'); div.className = `result-item ${isDone ? 'status-done' : 'status-todo'}`; div.innerHTML = `<strong>${exObj.name}</strong>`; div.onclick = () => this.navTo('exercise-detail', exObj); c.appendChild(div); }); },
    renderManageWorkoutsList: function() { const c = document.getElementById('manage-workouts-list'); if(!c) return; c.innerHTML = ""; this.data.workouts.forEach(w => { const div = document.createElement('div'); div.className = 'result-item draft-item'; div.innerHTML = `<div><strong>${w.name}</strong></div><div><button class="btn-small" onclick="event.stopPropagation(); app.editWorkout(${w.id})">Edit</button><button class="btn-remove" onclick="event.stopPropagation(); app.deleteWorkout(${w.id})">X</button></div>`; c.appendChild(div); }); }
};

window.addEventListener('load', function() { if(typeof app !== 'undefined') app.init(); });

const RAW_EXERCISES_DATA = `Air squat;Quadriceps, Grand fessier;Ischio-jambiers, Adducteurs, Mollets, Érecteurs du rachis;Aucun
Traction;Grand dorsal, Biceps, Rhomboïdes;Deltoïdes postérieurs, Trapèzes inférieurs, Abdominaux;Barre de traction
Donkey kick;Grand fessier;Ischio-jambiers (supérieur), Érecteurs du rachis (stabilisation);Aucun (ou anneau de cheville)
Extension hanche poulie basse;Grand fessier;Ischio-jambiers, Érecteurs du rachis;Poulie basse, Courroie cheville
Extension mollets assis barre;Gastrocnémien (mollet);Soléaire (mollet);Barre, Banc
Extension mollets assis machine;Gastrocnémien, Soléaire;Jambier postérieur;Machine à mollets assis
Extension mollets barre debout;Gastrocnémien;Soléaire;Barre, Step (optionnel)
Extension mollets sur marche;Gastrocnémien, Soléaire;Jambier postérieur;Marche/Step, Halteres (optionnel)
Fente avant barre femme;Quadriceps, Grand fessier;Ischio-jambiers, Adducteurs, Mollets, Érecteurs du rachis;Barre
Fentes avant;Quadriceps, Grand fessier;Ischio-jambiers, Adducteurs, Mollets, Abdominaux (stabilisation);Aucun (ou poids du corps)
Fentes avant kettlebell;Quadriceps, Grand fessier;Ischio-jambiers, Adducteurs, Érecteurs du rachis, Abdominaux;Kettlebell
Fentes croisees;Grand fessier, Adducteurs;Quadriceps, Ischio-jambiers;Aucun (ou poids du corps)
Fire hydratant;Moyen fessier, Petit fessier;Tenseur du fascia lata, Carré des lombes (stabilisation);Aucun
Front squat avec halteres;Quadriceps;Grand fessier, Ischio-jambiers, Érecteurs du rachis, Abdominaux;Halteres
Good morning exercice;Ischio-jambiers, Grand fessier;Érecteurs du rachis, Adducteurs;Barre (ou poids du corps)
Hack squat;Quadriceps;Grand fessier, Ischio-jambiers;Machine Hack squat
Hips thrust;Grand fessier;Ischio-jambiers, Adducteurs, Érecteurs du rachis;Banc, Barre/Haltère
Homme faisant un squat avec barre;Quadriceps, Grand fessier;Ischio-jambiers, Adducteurs, Érecteurs du rachis, Abdominaux;Barre
Leg curl allonge;Ischio-jambiers;Mollets;Machine Leg curl
Leg curl assis machine;Ischio-jambiers;Mollets;Machine Leg curl assis
Leg curl inverse machine tirage vertical;Ischio-jambiers;Mollets, Grand fessier;Machine à poulie haute
Leg extension;Quadriceps;Muscle couturier (Sartorius);Machine Leg extension
Marche du fermier avec kettlebells;Trapèzes (supérieur), Avant-bras, Deltoïdes;Trapèzes moyen/inférieur, Abdominaux, Quadriceps, Fessiers;Kettlebells
Montees sur banc;Quadriceps, Grand fessier;Ischio-jambiers, Mollets, Abdominaux (stabilisation);Banc, Halteres (optionnel)
Presse a cuisses inclinee;Quadriceps, Grand fessier;Ischio-jambiers, Adducteurs;Machine Presse à cuisses
Presse a cuisses verticale;Quadriceps;Grand fessier, Ischio-jambiers;Machine Presse verticale
Souleve de terre;Ischio-jambiers, Grand fessier, Érecteurs du rachis;Trapèzes, Avant-bras, Fessiers, Adducteurs;Barre
Squat barre devant front;Quadriceps;Grand fessier, Ischio-jambiers, Érecteurs du rachis, Abdominaux;Barre
Squat bulgare halteres;Quadriceps, Grand fessier;Ischio-jambiers, Mollets, Abdominaux (stabilisation);Halteres, Banc
Squat goblet;Quadriceps;Grand fessier, Ischio-jambiers, Abdominaux, Érecteurs du rachis;Haltère/Kettlebell
Squat pistol;Quadriceps, Grand fessier;Ischio-jambiers, Mollets, Abdominaux (stabilisation);Aucun (ou poids du corps)
Squat statique contre mur;Quadriceps, Grand fessier;Ischio-jambiers, Adducteurs, Érecteurs du rachis;Mur (et éventuellement medecine ball)
Squat sur banc;Quadriceps, Grand fessier;Ischio-jambiers, Adducteurs, Érecteurs du rachis;Banc
Zercher deadlift;Quadriceps, Grand fessier, Érecteurs du rachis;Ischio-jambiers, Trapèzes, Avant-bras, Abdominaux;Barre
Zercher squat;Quadriceps, Grand fessier;Ischio-jambiers, Érecteurs du rachis, Abdominaux;Barre
Bear plank avec kickback;Grand fessier, Abdominaux (transverse, droits);Deltoïdes, Triceps, Ischio-jambiers (supérieur);Aucun
Ciseaux;Droit de l'abdomen (bas), Obliques;Flexeurs de la hanche (Psoas, Iliaque);Aucun
Crunch au sol;Droit de l'abdomen (haut);Obliques;Aucun
Crunch papillon butterfly sit ups;Droit de l'abdomen (haut);Obliques, Flexeurs de la hanche;Aucun
Crunch poulie haute;Droit de l'abdomen;Obliques;Poulie haute, Cordage
Exercice abdos bicyclette;Droit de l'abdomen, Obliques;Flexeurs de la hanche;Aucun
Flexions laterales haltere;Obliques (interne/externe);Carré des lombes, Droit de l'abdomen;Haltère
Gainage ours bear plank;Abdominaux (transverse, droits), Deltoïdes;Grand dorsal, Quadriceps, Triceps;Aucun
Mountain climber;Abdominaux (transverse, droits), Deltoïdes, Pectoraux;Quadriceps, Ischio-jambiers, Flexeurs de la hanche;Aucun
Planche abdos;Abdominaux (transverse, droits), Obliques;Deltoïdes, Grand dorsal, Quadriceps;Aucun
Planche inversee abdos;Grand dorsal, Deltoïdes postérieurs, Fessiers;Triceps, Ischio-jambiers, Mollets;Aucun
Planche laterale obliques;Obliques, Abdominaux transverses;Deltoïdes, Moyen fessier, Adducteurs;Aucun
Releve de genoux suspendu;Flexeurs de la hanche (Psoas, Iliaque), Droit de l'abdomen (bas);Obliques, Adducteurs;Barre de traction
Releve de jambes assis;Droit de l'abdomen (bas), Flexeurs de la hanche;Obliques;Banc
Releve jambes chaise romaine abdominaux;Droit de l'abdomen (bas), Flexeurs de la hanche;Obliques, Adducteurs;Chaise romaine
Rotation buste debout poulie;Obliques, Abdominaux transverses;Grand droit, Deltoïdes;Poulie haute
Rotations russes obliques;Obliques, Abdominaux transverses;Droit de l'abdomen;Aucun (ou medecine ball)
Russian twist avec developpe epaule;Obliques, Deltoïdes;Droit de l'abdomen, Trapèzes;Halteres
Chin up traction supination;Grand dorsal, Biceps brachial (longue tête), Brachial;Trapèzes inférieurs, Rhomboïdes, Deltoïdes postérieurs;Barre de traction
Curl allonge a la poulie;Biceps brachial;Brachial, Brachioradial;Poulie basse, Barre droite/EZ
Curl au pupitre barre ez larry scott;Biceps brachial (tête courte);Brachial, Brachioradial;Banc Larry Scott, Barre EZ
Curl barre;Biceps brachial;Brachial, Brachioradial;Barre droite/EZ
Curl biceps alterne sur banc incline;Biceps brachial (longue tête);Brachial, Brachioradial;Banc incliné, Halteres
Curl biceps avec halteres alterne;Biceps brachial;Brachial, Brachioradial;Halteres
Curl biceps poulie basse;Biceps brachial;Brachial, Brachioradial;Poulie basse, Barre/poignée
Curl concentre;Biceps brachial;Brachial, Brachioradial;Haltère, Banc
Curl haltere debout banc incline;Biceps brachial (longue tête);Brachial, Brachioradial;Banc incliné, Halteres
Curl haltere incline;Biceps brachial (longue tête);Brachial, Brachioradial;Banc incliné, Halteres
Curl haltere prise marteau pupitre;Brachioradial, Brachial;Biceps brachial;Banc à prédicateur, Haltère
Curl haltere prise neutre;Brachioradial, Brachial;Biceps brachial;Halteres
Curl incline poulie;Biceps brachial;Brachial, Brachioradial;Banc incliné, Poulie basse
Curl inverse barre;Brachioradial, Extenseurs de l'avant-bras;Brachial, Biceps brachial (tête courte);Barre droite
Waiter curl;Biceps brachial (tête courte - pic), Brachial;Brachioradial, Deltoïdes antérieurs (stabilisation);Haltère
Bent over row avec halteres;Grand dorsal, Rhomboïdes, Trapèzes moyen/inférieur;Deltoïdes postérieurs, Biceps, Érecteurs du rachis;Halteres
Bird dog;Érecteurs du rachis, Grand fessier;Deltoïdes, Grand dorsal, Abdominaux;Aucun
Dead hang suspension passive;Grand dorsal, Trapèzes inférieurs, Avant-bras;Abdominaux, Deltoïdes;Barre de traction
Overhead shrug;Trapèzes (supérieur), Angulaire de l'omoplate;Deltoïdes, Triceps (stabilisation);Barre/Halteres
Pull over barre;Grand dorsal, Grand pectoral (sternal);Triceps (longue tête), Dentelé antérieur, Intercostaux;Barre, Banc
Pull over poulie;Grand dorsal;Grand pectoral (sternal), Triceps (longue tête), Dentelé;Poulie haute, Barre droite
Pullover avec deux halteres;Grand dorsal, Grand pectoral (sternal);Triceps (longue tête), Dentelé antérieur;Haltère, Banc
Pullover haltere;Grand dorsal, Grand pectoral (sternal);Triceps (longue tête), Dentelé antérieur;Haltère, Banc
Rowing barre;Grand dorsal, Rhomboïdes, Trapèzes moyen/inférieur;Deltoïdes postérieurs, Biceps, Érecteurs du rachis;Barre
Rowing buste penche avec elastique;Grand dorsal, Rhomboïdes;Deltoïdes postérieurs, Biceps, Érecteurs du rachis;Elastique
Rowing haltere un bras;Grand dorsal, Rhomboïdes, Trapèzes;Deltoïdes postérieurs, Biceps, Érecteurs du rachis;Haltère, Banc
Rowing halteres banc incline prise neutre;Grand dorsal, Rhomboïdes, Trapèzes;Deltoïdes postérieurs, Biceps, Grand rond;Banc incliné, Halteres
Rowing horizontal bande elastique;Grand dorsal, Rhomboïdes;Deltoïdes postérieurs, Biceps;Elastique, point d'ancrage
Seal row halteres;Grand dorsal, Rhomboïdes, Trapèzes moyen/inférieur;Deltoïdes postérieurs, Biceps;Banc haut (ou plat), Halteres
Shrug barre;Trapèzes (supérieur);Angulaire de l'omoplate, Trapèzes moyen;Barre
Shrug poulie haussement epaules;Trapèzes (supérieur);Angulaire de l'omoplate;Poulie basse
Shrugs avec halteres;Trapèzes (supérieur);Angulaire de l'omoplate;Halteres
Souleve de terre avec machine;Ischio-jambiers, Grand fessier, Érecteurs du rachis;Trapèzes, Avant-bras;Machine dédiée (ex: Smith)
Superman;Érecteurs du rachis, Grand fessier;Trapèzes moyen/inférieur, Deltoïdes postérieurs;Aucun
Tirage horizontal poulie;Grand dorsal, Rhomboïdes, Trapèzes moyen/inférieur;Deltoïdes postérieurs, Biceps, Grand rond;Machine à poulie basse, Barre
Tirage horizontal prise large;Grand dorsal (largeur), Rhomboïdes;Deltoïdes postérieurs, Biceps, Grand rond;Machine à poulie basse, Barre large
Tirage incline poulie haute;Grand dorsal (partie basse), Rhomboïdes;Deltoïdes postérieurs, Biceps, Trapèzes;Poulie haute, Banc incliné
Tirage vertical poitrine;Grand dorsal (largeur);Biceps, Deltoïdes postérieurs, Trapèzes inférieurs;Machine à poulie haute, Barre large
Tirage vertical prise inversee;Grand dorsal (épaisseur), Biceps;Deltoïdes postérieurs, Trapèzes inférieurs, Brachial;Machine à poulie haute, Barre prise marteau
Tirage vertical prise serree;Grand dorsal (épaisseur), Biceps;Deltoïdes postérieurs, Trapèzes inférieurs, Grand rond;Machine à poulie haute, Barre étroite
Traction assiste elastique;Grand dorsal, Biceps, Rhomboïdes;Deltoïdes postérieurs, Trapèzes inférieurs, Abdominaux;Barre de traction, Elastique
Traction assistee avec banc;Grand dorsal, Biceps, Rhomboïdes;Deltoïdes postérieurs, Trapèzes inférieurs;Machine à traction assistée
Traction prise neutre;Grand dorsal (épaisseur), Biceps, Brachial;Deltoïdes postérieurs, Rhomboïdes, Trapèzes inférieurs;Barre de traction parallèle
Developpe arnold;Deltoïdes (antérieur, médial), Trapèzes (supérieur);Deltoïde postérieur, Triceps;Halteres, Banc
Developpe epaule halteres;Deltoïdes antérieur, Triceps;Deltoïdes médial, Trapèzes (supérieur), Grand pectoral (claviculaire);Halteres, Banc
Developpe epaule unilateral avec elastique;Deltoïdes antérieur, Triceps;Deltoïdes médial, Trapèzes (supérieur), Abdominaux (stabilisation);Elastique
Developpe epaules assis avec elastique;Deltoïdes antérieur, Triceps;Deltoïdes médial, Trapèzes (supérieur);Elastique, Banc
Developpe epaules assis dumbbell z press;Deltoïdes antérieur, Triceps;Deltoïdes médial, Abdominaux (stabilisation);Halteres
Developpe epaules avec elastique;Deltoïdes antérieur, Triceps;Deltoïdes médial, Trapèzes (supérieur);Elastique
Developpe epaules smith machine;Deltoïdes antérieur, Triceps;Deltoïdes médial, Trapèzes (supérieur);Smith machine
Developpe militaire;Deltoïdes antérieur, Triceps;Deltoïdes médial, Trapèzes (supérieur), Grand pectoral (claviculaire);Barre (debout/assis)
Ecarte arriere elastique;Deltoïdes postérieurs, Rhomboïdes, Trapèzes moyen;Grand dorsal, Trapèzes inférieur;Elastique
Elevation frontale allongee a la barre;Deltoïdes antérieur;Grand pectoral (claviculaire), Trapèzes (supérieur);Barre, Banc incliné
Elevation frontale banc incline;Deltoïdes antérieur;Grand pectoral (claviculaire), Trapèzes (supérieur);Banc incliné, Haltère/Barre
Elevations frontales;Deltoïdes antérieur;Grand pectoral (claviculaire), Trapèzes (supérieur), Biceps (stabilisation);Halteres/Barre/Elastique
Elevations laterales;Deltoïdes médial;Trapèzes (supérieur), Deltoïde antérieur, Muscle sus-épineux;Halteres/Elastique
Elevations laterales unilaterale poulie;Deltoïdes médial;Trapèzes (supérieur), Deltoïde antérieur;Poulie basse
Face pull;Deltoïdes postérieurs, Rhomboïdes, Trapèzes moyen/inférieur;Grand rond, Trapèzes inférieur;Poulie haute, Cordage
Oiseau assis sur banc;Deltoïdes postérieurs;Rhomboïdes, Trapèzes moyen, Grand rond;Banc, Halteres
Oiseau avec elastique;Deltoïdes postérieurs;Rhomboïdes, Trapèzes moyen;Elastique
Pec deck inverse;Deltoïdes postérieurs, Rhomboïdes;Trapèzes moyen, Grand rond;Machine Pec deck
Presse epaule;Deltoïdes antérieur, Triceps;Deltoïdes médial, Trapèzes (supérieur), Grand pectoral (claviculaire);Barre/Halteres/Machine
Rotation externe epaule poulie;Muscle sus-épineux, Infra-épineux, Petit rond;Trapèzes inférieur;Poulie basse, Poignée
Rotation externe vertical epaule haltere;Infra-épineux, Petit rond;Muscle sus-épineux;Haltère
Thruster;Quadriceps, Deltoïdes antérieur, Triceps;Grand fessier, Deltoïdes médial, Trapèzes, Abdominaux;Barre/Halteres
Tirage menton avec elastique;Deltoïdes médial, Trapèzes (supérieur);Deltoïdes antérieur, Biceps, Avant-bras;Elastique
Tirage menton machine guidee;Deltoïdes médial, Trapèzes (supérieur);Deltoïdes antérieur, Biceps;Machine guidée (ex: Smith)
Developpe couche halteres;Grand pectoral (sternal/claviculaire), Triceps;Deltoïdes antérieur;Banc plat, Halteres
Developpe couche larsen;Grand pectoral, Triceps;Deltoïdes antérieur, Dentelé antérieur;Banc, Barre (pas d'appui pieds)
Developpe couche prise inversee;Grand pectoral (sternal), Triceps (partie médiale/latérale);Deltoïdes antérieur, Dentelé antérieur;Barre, Banc
Developpe couche serre avec halteres;Grand pectoral (sternal), Triceps;Deltoïdes antérieur;Banc plat, Halteres (prise serrée)
Developpe couche barre;Grand pectoral (sternal), Triceps;Deltoïdes antérieur, Dentelé antérieur;Barre/Halteres, Banc plat
Developpe debout pectoraux elastique;Grand pectoral, Deltoïdes antérieur;Triceps, Dentelé antérieur;Elastique
Developpe decline avec elastique;Grand pectoral (inférieur), Triceps;Deltoïdes antérieur;Elastique, Banc décliné
Developpe decline barre;Grand pectoral (inférieur), Triceps;Deltoïdes antérieur, Dentelé antérieur;Banc décliné, Barre
Developpe decline halteres;Grand pectoral (inférieur), Triceps;Deltoïdes antérieur;Banc décliné, Halteres
Developpe incline barre;Grand pectoral (claviculaire), Triceps;Deltoïdes antérieur, Dentelé antérieur;Banc incliné, Barre
Developpe incline halteres;Grand pectoral (claviculaire), Triceps;Deltoïdes antérieur;Banc incliné, Halteres
Developpe incline machine convergente;Grand pectoral (claviculaire);Deltoïdes antérieur, Triceps;Machine convergente inclinée
Dips pectoraux;Grand pectoral (sternal/inférieur), Triceps;Deltoïdes antérieur, Dentelé antérieur;Barres parallèles
Ecarte couche haltere;Grand pectoral (sternal);Deltoïdes antérieur, Dentelé antérieur, Biceps (stabilisation);Banc plat, Halteres
Ecarte poulie vis a vis pectoraux;Grand pectoral (sternal), surtout partie externe;Deltoïdes antérieur, Dentelé antérieur;Deux poulies basses, poignées
Ecarte unilateral a la poulie;Grand pectoral (sternal);Deltoïdes antérieur, Dentelé antérieur, Abdominaux (stabilisation);Poulie basse, Poignée
Ecartes bande elastique bilateral;Grand pectoral;Deltoïdes antérieur, Dentelé antérieur;Elastique
Ecartes decline avec halteres;Grand pectoral (inférieur);Deltoïdes antérieur, Dentelé antérieur;Banc décliné, Halteres
Hyght dumbell fly;Grand pectoral (claviculaire);Deltoïdes antérieur, Dentelé antérieur;Banc incliné, Halteres (mouvement écarté)
Pullover haltere;Grand pectoral (sternal), Grand dorsal;Triceps (longue tête), Dentelé antérieur;Haltère, Banc
Barre front;Deltoïdes antérieur, Grand pectoral (claviculaire);Triceps, Trapèzes (supérieur);Barre
Developpe couche prise serree smith machine;Triceps, Grand pectoral (sternal - partie interne);Deltoïdes antérieur;Smith machine, Banc plat
Dips sur banc;Triceps, Grand pectoral (inférieur);Deltoïdes antérieur;Deux bancs (ou chaise)
Dips triceps;Triceps;Grand pectoral (inférieur), Deltoïdes antérieur, Dentelé antérieur;Barres parallèles
Extension horizontale poulie;Triceps (vaste latéral/médial);Grand pectoral (stabilisation);Poulie basse, Cordage/Barre
Extension triceps banc incline halteres;Triceps (longue tête);-;Banc incliné, Haltère
Extension triceps derriere tete avec elastique;Triceps (longue tête);Grand dorsal, Deltoïdes postérieurs (stabilisation);Elastique
Extension triceps haltere un bras;Triceps;-;Haltère
Extension triceps incline poulie basse;Triceps (longue tête);-;Banc incliné, Poulie basse, Cordage
Extension triceps poulie haute corde;Triceps (vaste latéral/médial);-;Poulie haute, Cordage
Extension triceps poulie haute;Triceps;Grand pectoral (stabilisation), Avant-bras;Poulie haute, Barre
Extension triceps verticale elastique;Triceps;-;Elastique
Extension verticale assis barre;Triceps (longue tête);-;Banc, Barre EZ/droite
Extension verticale triceps poulie basse;Triceps (longue tête);-;Banc, Poulie basse, Barre EZ
Extensions concentres des triceps poulie;Triceps (vaste latéral);-;Poulie haute, Poignée
Extensions des triceps assis avec haltere;Triceps (longue tête);-;Banc, Haltère
Extensions triceps couche halteres;Triceps (longue tête);Grand pectoral (stabilisation);Banc plat, Halteres
Extensions triceps decline halteres;Triceps (vaste latéral/médial);Grand pectoral (stabilisation);Banc décliné, Halteres
Extensions triceps planche;Triceps, Grand pectoral, Deltoïdes antérieur;Abdominaux, Dentelé antérieur;Aucun (poids du corps)
Kickback alterne assis;Triceps;Deltoïdes postérieurs, Érecteurs du rachis;Halteres, Banc
Kickback;Triceps (vaste latéral);Deltoïdes postérieurs, Grand dorsal;Haltère, Banc
Pompe;Grand pectoral, Triceps, Deltoïdes antérieur;Dentelé antérieur, Abdominaux, Érecteurs du rachis;Aucun
Ecarte a la poulie (crossover);Grand pectoral (sternal);Deltoïdes antérieur, Dentelé antérieur;Deux poulies hautes/basses
Developpe prise marteau (halteres);Deltoïdes antérieur/médial, Triceps;Grand pectoral (claviculaire), Trapèzes;Halteres
Developpe militaire (jammer arm);Deltoïdes antérieur, Triceps;Grand pectoral (claviculaire), Trapèzes, Quadriceps (si debout);Machine Jammer Arm
Elevations laterales (poulie);Deltoïdes médial;Trapèzes (supérieur), Deltoïde antérieur;Poulie basse
Elevations frontales (poulie);Deltoïdes antérieur;Grand pectoral (claviculaire), Trapèzes (supérieur);Poulie basse
Developpe militaire a la poulie;Deltoïdes antérieur, Triceps;Deltoïdes médial, Trapèzes;Poulie basse, Banc
Elevations laterales a la poulie;Deltoïdes médial;Trapèzes (supérieur), Deltoïde antérieur;Deux poulies basses
Presse jammer arm (incliné);Pectoraux;Triceps, Deltoïdes, Dentelé antérieur;Machine Jammer Arm
Tirage vertical (unilateral);Grand dorsal, Biceps;Deltoïdes postérieurs, Rhomboïdes, Trapèzes inférieurs;Poulie haute, Poignée
Tractions pronation (chin-ups);Grand dorsal, Biceps, Brachial;Rhomboïdes, Deltoïdes postérieurs, Trapèzes inférieurs;Barre de traction
Rowing horizontal jammer arm;Grand dorsal, Rhomboïdes, Trapèzes;Deltoïdes postérieurs, Biceps, Érecteurs du rachis;Machine Jammer Arm (horizontal)
Tirage vertical jammer arm;Grand dorsal, Biceps;Deltoïdes postérieurs, Rhomboïdes, Trapèzes inférieurs;Machine Jammer Arm (vertical)
Rowing yates;Grand dorsal (partie basse), Trapèzes, Biceps;Deltoïdes postérieurs, Érecteurs du rachis;Barre (prise supination)
Tirage vertical prise marteau;Grand dorsal (épaisseur), Biceps, Brachial;Deltoïdes postérieurs, Rhomboïdes, Grand rond;Machine à poulie haute, poignées neutres
Rack pull;Érecteurs du rachis, Grand fessier, Ischio-jambiers (supérieur);Trapèzes, Avant-bras, Quadriceps (début);Barre, Supports (rack)
Pull-over a la poulie haute;Grand dorsal, Grand pectoral (sternal);Triceps (longue tête), Dentelé antérieur;Poulie haute, Barre droite
Pont fessier;Grand fessier, Ischio-jambiers;Adducteurs, Érecteurs du rachis;Aucun (ou barre/haltère sur bassin)
Sissy squat;Quadriceps (partie basse - vaste médial);Grand fessier (stabilisation), Abdominaux, Érecteurs du rachis;Aucun (ou support)
Extension des jambes assis (simulee);Quadriceps;-;Aucun (poids du corps isométrique)
Flexion des jambes allonge (leg curl) au sol;Ischio-jambiers;Mollets;Aucun (ou ballon suisse)
Extension inverse (back extension) sur banc;Érecteurs du rachis, Grand fessier;Ischio-jambiers, Adducteurs;Banc à lombaires/hyperextension
Flexions lombaires au banc;Érecteurs du rachis;Grand fessier, Ischio-jambiers;Banc à lombaires
Abduction de hanche a la poulie;Moyen fessier, Petit fessier;Tenseur du fascia lata;Poulie basse, Courroie cheville
Lever de jambe lateral (abduction);Moyen fessier, Petit fessier;Tenseur du fascia lata;Aucun
Lever de jambe sur le cote (adduction);Adducteurs;Grand droit de l'abdomen (stabilisation);Aucun
Squat partiel (pin squat) dans jammer;Quadriceps, Grand fessier (sur amplitude réduite);Ischio-jambiers, Érecteurs du rachis, Abdominaux;Machine Jammer Arm, butoirs
Crunch oblique;Obliques;Droit de l'abdomen;Aucun
Sit-ups;Droit de l'abdomen, Psoas;Obliques;Aucun
Enroulement vertebral (roll-up);Droit de l'abdomen, Abdominaux transverses;Obliques, Psoas;Aucun
Planche avec traction de genou (spiderman);Obliques, Abdominaux transverses, Deltoïdes;Grand droit, Grand pectoral, Quadriceps;Aucun
Curl marteau poulie basse;Brachioradial, Brachial;Biceps brachial;Poulie basse, Cordage/poignées
Curl inverse;Brachioradial, Extenseurs de l'avant-bras;Brachial, Biceps brachial (tête courte);Barre/Halteres
Curl en pronation a la poulie;Brachioradial, Extenseurs de l'avant-bras;Brachial;Poulie basse, Barre droite
Extension des triceps a la poulie basse;Triceps;-;Poulie basse, Barre/Cordage
Flexions de poignets;Fléchisseurs des avant-bras (Fléchisseurs du carpe);-;Barre/Halteres
Extensions de poignets;Extenseurs des avant-bras (Extenseurs du carpe);-;Barre/Halteres
Burpees;Grand pectoral, Triceps, Deltoïdes, Quadriceps;Ischio-jambiers, Fessiers, Abdominaux, Cardio;Aucun
Renegade row;Grand dorsal, Rhomboïdes, Deltoïdes postérieurs, Abdominaux;Triceps, Biceps, Grand pectoral (stabilisation);Halteres
Bobine Andrieu;Avant bras;-;Bobine andrieu
Hand Grip;Avant bras, Main;-;Hand Grip
Wrist curl pronation;Avant bras, poignet;-;Halteres
Wrist curl supination;Avant bras, poignet;-;Halteres
Flexion du cou;Cou;-;Aucun, Harnais de cou + poulie haute
Extension du cou;Nuque;-;Aucun, Harnais de cou + poids
Rowing vertical (upright row);Deltoïdes médial, Trapèzes (supérieur);Deltoïdes antérieur, Biceps, Angulaire de l'omoplate;Barre EZ/Halteres/Elastique`;
