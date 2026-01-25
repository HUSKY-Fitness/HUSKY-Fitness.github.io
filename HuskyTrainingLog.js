/**
 * HUSKY Training Log - Logic Complete (with GIF & Reset)
 */
'use strict';

const app = {
    data: { exercises: [], workouts: [], logs: [] },
    state: { currentView: 'view-menu', activeExerciseId: null, activeWorkoutId: null, mode: 'free', editingWorkoutId: null, tempWorkoutStructure: [] },

    init: function() {
        try {
            const se = localStorage.getItem('husky_exercises');
            if (se) this.data.exercises = JSON.parse(se);
            else { this.parseRawData(); this.saveData('exercises'); }
            const sw = localStorage.getItem('husky_workouts');
            if (sw) this.data.workouts = JSON.parse(sw);
            const sl = localStorage.getItem('husky_logs');
            if (sl) this.data.logs = JSON.parse(sl);
        } catch (e) { console.error(e); }

        const btnBack = document.getElementById('btn-back');
        if(btnBack) btnBack.addEventListener('click', () => this.handleBack());
    },

    parseRawData: function() {
        if (typeof RAW_EXERCISES_DATA === 'undefined') return;
        const lines = RAW_EXERCISES_DATA.split('\n');
        let idCounter = 1;
        lines.forEach(line => {
            if (line.trim() === "") return;
            const parts = line.split(';');
            if (parts.length >= 4) {
                this.data.exercises.push({ id: idCounter++, name: parts[0].trim(), primary: parts[1].trim(), secondary: parts[2].trim(), material: parts[3].trim() });
            }
        });
    },

    saveData: function(key) {
        if (key === 'exercises') localStorage.setItem('husky_exercises', JSON.stringify(this.data.exercises));
        if (key === 'workouts') localStorage.setItem('husky_workouts', JSON.stringify(this.data.workouts));
        if (key === 'logs') localStorage.setItem('husky_logs', JSON.stringify(this.data.logs));
    },

    exportData: function() {
        const d = { date: new Date().toISOString(), exercises: this.data.exercises, workouts: this.data.workouts, logs: this.data.logs };
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(d));
        const a = document.createElement('a');
        a.href = dataStr; a.download = "husky_training_backup.json";
        document.body.appendChild(a); a.click(); a.remove();
    },

    importData: function(inputElement) {
        const file = inputElement.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const imported = JSON.parse(e.target.result);
                if (imported.exercises && imported.logs && confirm("Remplacer les données actuelles ?")) {
                    this.data.exercises = imported.exercises;
                    this.data.workouts = imported.workouts || [];
                    this.data.logs = imported.logs;
                    this.saveData('exercises'); this.saveData('workouts'); this.saveData('logs');
                    location.reload();
                }
            } catch (err) { alert("Erreur fichier"); }
        };
        reader.readAsText(file);
    },

    navTo: function(viewId, contextData = null) {
        document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
        let targetHtmlId = `view-${viewId}`;
        if (viewId === 'free-training' || viewId === 'manage-exercises') targetHtmlId = 'view-exercise-list';
        
        const target = document.getElementById(targetHtmlId);
        if(target) target.classList.add('active');
        this.state.currentView = viewId;

        const backBtn = document.getElementById('btn-back');
        const title = document.getElementById('page-title');
        const search = document.getElementById('search-exercise');

        if (viewId === 'menu') {
            if(backBtn) backBtn.classList.add('hidden');
            if(title) title.innerText = "HUSKY TRAINING LOG";
        } else {
            if(backBtn) backBtn.classList.remove('hidden');
        }

        if ((viewId === 'free-training' || viewId === 'manage-exercises') && search) search.value = "";

        switch(viewId) {
            case 'free-training':
                this.state.mode = 'free';
                if(title) title.innerText = "LIBRE";
                document.getElementById('btn-add-exercise-action').classList.add('hidden');
                this.renderExerciseList('exercise-list-container', true);
                break;
            case 'manage-exercises':
                this.state.mode = 'manage_ex';
                if(title) title.innerText = "EXERCICES";
                document.getElementById('btn-add-exercise-action').classList.remove('hidden');
                this.renderExerciseList('exercise-list-container', false);
                break;
            case 'exercise-detail':
                this.state.activeExerciseId = contextData.id;
                if(title) title.innerText = "EN COURS";
                this.renderExerciseDetail(contextData);
                break;
            case 'daily-summary':
                if(title) title.innerText = "BILAN JOUR";
                this.renderDailySummary();
                break;
            case 'saved-workouts':
                if(title) title.innerText = "PROGRAMMES";
                this.renderSavedWorkoutsList();
                break;
            case 'workout-runner':
                this.state.mode = 'runner';
                this.state.activeWorkoutId = contextData.id;
                if(title) title.innerText = contextData.name.toUpperCase();
                this.renderWorkoutRunner(contextData);
                break;
            case 'manage-workouts':
                this.state.mode = 'manage_workout';
                if(title) title.innerText = "GESTION";
                this.renderManageWorkoutsList();
                break;
            case 'workout-editor':
                if(title) title.innerText = "EDITEUR";
                this.renderWorkoutEditor(contextData); 
                break;
            case 'exercise-creator':
                if(title) title.innerText = "NOUVEAU";
                document.getElementById('new-ex-name').value = "";
                document.getElementById('new-ex-muscles').value = "";
                document.getElementById('new-ex-material').value = "";
                break;
        }
    },

    handleBack: function() {
        const current = this.state.currentView;
        if (current === 'exercise-detail') {
            if (this.state.mode === 'runner') {
                const w = this.data.workouts.find(x => x.id === this.state.activeWorkoutId);
                this.navTo('workout-runner', w);
            } else this.navTo('free-training');
        } 
        else if (current === 'workout-runner') this.navTo('saved-workouts');
        else if (current === 'workout-editor') this.navTo('manage-workouts');
        else if (current === 'exercise-creator') this.navTo('manage-exercises');
        else this.navTo('menu');
    },

    renderExerciseList: function(containerId, clickToTrain) {
        const c = document.getElementById(containerId);
        if(!c) return;
        c.innerHTML = "";
        [...this.data.exercises].sort((a,b) => a.name.localeCompare(b.name)).forEach(ex => {
            const div = document.createElement('div');
            div.className = 'result-item';
            div.dataset.search = (ex.name + " " + ex.primary).toLowerCase(); 
            let html = `<strong>${ex.name}</strong><div style="font-size:0.8rem; color:#ccc;">${ex.primary}</div><div style="font-size:0.75rem; color:#888; font-style:italic;">${ex.material}</div>`;
            if (!clickToTrain && this.state.mode === 'manage_ex') {
                html += `<div style="margin-top:5px; text-align:right;"><button class="btn-remove" onclick="event.stopPropagation(); app.deleteExercise(${ex.id})">Supprimer</button></div>`;
            }
            div.innerHTML = html;
            div.onclick = () => { if (clickToTrain) this.navTo('exercise-detail', ex); };
            c.appendChild(div);
        });
    },

    filterExercises: function() {
        const q = document.getElementById('search-exercise').value.toLowerCase();
        document.querySelectorAll('#exercise-list-container .result-item').forEach(item => {
            item.classList.toggle('hidden', !(item.dataset.search || "").includes(q));
        });
    },

    renderExerciseDetail: function(exercise) {
        document.getElementById('detail-exercise-name').innerText = exercise.name;
        document.getElementById('detail-exercise-muscles').innerText = "Muscles: " + exercise.primary;
        document.getElementById('detail-exercise-material').innerText = "Matériel: " + exercise.material;

        // --- GESTION GIF ---
        const gifContainer = document.getElementById('exercise-gif-container');
        const gifImage = document.getElementById('exercise-gif-image');
        // On construit le chemin : gif/NomExact.gif
        const gifPath = `gif/${exercise.name}.gif`;
        
        // On tente d'afficher. Si l'image charge, on affiche le conteneur. Sinon on le cache.
        gifImage.src = gifPath;
        gifImage.onload = function() { gifContainer.style.display = 'block'; };
        gifImage.onerror = function() { gifContainer.style.display = 'none'; };


        // --- HISTORIQUE ---
        const historyLogs = this.data.logs.filter(l => l.exerciseId === exercise.id).sort((a,b) => b.date - a.date);
        const historyDiv = document.getElementById('history-content');
        
        // Trouver le dernier log qui n'est pas "aujourd'hui" pour référence
        // (Ou simplement afficher le dernier log disponible pour simplifier)
        if (historyLogs.length > 0) {
            const last = historyLogs[0]; 
            const date = new Date(last.date).toLocaleDateString('fr-FR');
            let html = `<div style="margin-bottom:5px; color:var(--primary-color)">Le ${date} :</div>`;
            last.sets.forEach((s, i) => {
                if(s.weight || s.reps) {
                    let rpeText = s.rpe ? `(${s.rpe})` : '';
                    html += `<div style="margin-left:10px;">Set ${i+1}: <strong>${s.weight}kg</strong> x <strong>${s.reps}</strong> <span style="font-size:0.8rem; color:#aaa">${rpeText}</span></div>`;
                }
            });
            historyDiv.innerHTML = html;
        } else {
            historyDiv.innerText = "Première session pour cet exercice !";
        }

        // --- SAISIE (RESET LOGIQUE) ---
        const setsContainer = document.getElementById('sets-container');
        setsContainer.innerHTML = "";
        
        const today = new Date().setHours(0,0,0,0);
        // On cherche si on a DÉJÀ commencé cet exercice AUJOURD'HUI
        let currentSessionLog = this.data.logs.find(l => l.exerciseId === exercise.id && l.date >= today);
        
        // Si oui, on reprend les données. Si non, on part de zéro (RESET).
        let existingSets = currentSessionLog ? currentSessionLog.sets : [];

        for(let i=0; i<5; i++) {
            const setNum = i + 1;
            // Si pas de donnée existante pour ce set aujourd'hui, valeur vide
            const savedData = existingSets[i] || { weight: '', reps: '', rpe: 'moyen' };
            
            const row = document.createElement('div');
            row.className = 'set-row';
            row.innerHTML = `
                <span class="set-label">#${setNum}</span>
                <input type="number" placeholder="kg" id="set-weight-${i}" value="${savedData.weight}">
                <input type="number" placeholder="reps" id="set-reps-${i}" value="${savedData.reps}">
                <select id="set-rpe-${i}">
                    <option value="facile" ${savedData.rpe === 'facile' ? 'selected' : ''}>Facile</option>
                    <option value="moyen" ${savedData.rpe === 'moyen' ? 'selected' : ''}>Moyen</option>
                    <option value="proche_echec" ${savedData.rpe === 'proche_echec' ? 'selected' : ''}>Dur</option>
                    <option value="echec" ${savedData.rpe === 'echec' ? 'selected' : ''}>Echec</option>
                    <option value="degressif" ${savedData.rpe === 'degressif' ? 'selected' : ''}>Drop</option>
                </select>
            `;
            setsContainer.appendChild(row);
        }
    },

    finishCurrentExercise: function() {
        const exId = this.state.activeExerciseId;
        const setsData = [];
        let hasData = false;

        for(let i=0; i<5; i++) {
            const w = document.getElementById(`set-weight-${i}`).value;
            const r = document.getElementById(`set-reps-${i}`).value;
            const rpe = document.getElementById(`set-rpe-${i}`).value;
            if (w || r) hasData = true;
            setsData.push({ weight: w, reps: r, rpe: rpe });
        }

        if (hasData) {
            const todayStart = new Date().setHours(0,0,0,0);
            const now = Date.now();
            const existingIndex = this.data.logs.findIndex(l => l.exerciseId === exId && l.date >= todayStart);

            if (existingIndex >= 0) {
                this.data.logs[existingIndex].sets = setsData;
                this.data.logs[existingIndex].date = now;
            } else {
                this.data.logs.push({ date: now, exerciseId: exId, sets: setsData });
            }
            this.saveData('logs');
        }
        this.handleBack();
    },

    renderDailySummary: function() {
        const container = document.getElementById('daily-summary-container');
        if(!container) return;
        container.innerHTML = "";
        const todayStart = new Date().setHours(0,0,0,0);
        const dailyLogs = this.data.logs.filter(l => l.date >= todayStart);

        if (dailyLogs.length === 0) {
            container.innerHTML = "<div style='text-align:center; padding:20px; color:#888'>Aucun exercice aujourd'hui.</div>";
            return;
        }

        dailyLogs.forEach(log => {
            const ex = this.data.exercises.find(e => e.id === log.exerciseId);
            if (!ex) return;
            const div = document.createElement('div');
            div.className = 'card-highlight';
            let html = `<h3 style="color:var(--primary-color); margin-bottom:10px;">${ex.name}</h3>`;
            log.sets.forEach((s, i) => {
                if (s.weight || s.reps) {
                     html += `<div style="display:flex; justify-content:space-between; border-bottom:1px solid #333; padding:5px 0;"><span>Série ${i+1}</span><span><strong>${s.weight}kg</strong> x <strong>${s.reps}</strong></span><span style="font-size:0.8rem; color:#aaa; font-style:italic">${s.rpe}</span></div>`;
                }
            });
            html += `<div style="text-align:right; margin-top:10px;"><button class="btn-small" onclick="app.navTo('exercise-detail', {id: ${ex.id}, name: '${ex.name}', material: '${ex.material}', primary: '${ex.primary}'})">Modifier</button></div>`;
            div.innerHTML = html;
            container.appendChild(div);
        });
    },

    renderSavedWorkoutsList: function() {
        const c = document.getElementById('workouts-list-container');
        if(!c) return; c.innerHTML = "";
        if (this.data.workouts.length === 0) { c.innerHTML = "<div style='text-align:center; color:#777; padding:20px;'>Aucun programme.</div>"; return; }
        this.data.workouts.forEach(w => {
            const div = document.createElement('div'); div.className = 'result-item'; 
            div.innerHTML = `<strong>${w.name}</strong><span style="font-size:0.85rem; color:#aaa">${w.exercises.length} exercices</span>`;
            div.onclick = () => this.navTo('workout-runner', w);
            c.appendChild(div);
        });
    },

    renderWorkoutRunner: function(workout) {
        const c = document.getElementById('runner-exercises-list');
        if(!c) return; c.innerHTML = "";
        const todayStart = new Date().setHours(0,0,0,0);
        workout.exercises.forEach(exId => {
            const exObj = this.data.exercises.find(e => e.id === exId);
            if (!exObj) return;
            const isDone = this.data.logs.some(l => l.exerciseId === exId && l.date >= todayStart);
            const div = document.createElement('div');
            div.className = `result-item ${isDone ? 'status-done' : 'status-todo'}`;
            div.innerHTML = `<strong>${exObj.name}</strong><div style="font-size:0.8rem; color:#ccc;">${exObj.primary}</div>`;
            div.onclick = () => this.navTo('exercise-detail', exObj);
            c.appendChild(div);
        });
    },

    renderManageWorkoutsList: function() {
        const c = document.getElementById('manage-workouts-list');
        if(!c) return; c.innerHTML = "";
        this.data.workouts.forEach(w => {
            const div = document.createElement('div'); div.className = 'result-item draft-item';
            div.innerHTML = `<div><strong>${w.name}</strong></div><div><button class="btn-small" onclick="event.stopPropagation(); app.editWorkout(${w.id})">Edit</button><button class="btn-remove" onclick="event.stopPropagation(); app.deleteWorkout(${w.id})">X</button></div>`;
            c.appendChild(div);
        });
    },

    createNewWorkout: function() { this.state.editingWorkoutId = null; this.state.tempWorkoutStructure = []; this.navTo('workout-editor', null); },
    editWorkout: function(id) { const w = this.data.workouts.find(x => x.id === id); this.state.editingWorkoutId = id; this.state.tempWorkoutStructure = [...w.exercises]; this.navTo('workout-editor', w); },
    deleteWorkout: function(id) { if(confirm("Supprimer ?")) { this.data.workouts = this.data.workouts.filter(w => w.id !== id); this.saveData('workouts'); this.renderManageWorkoutsList(); } },
    
    renderWorkoutEditor: function(workout) {
        const n = document.getElementById('editor-workout-name'); if(n) n.value = workout ? workout.name : "";
        const c = document.getElementById('editor-exercise-list'); if(!c) return; c.innerHTML = "";
        [...this.data.exercises].sort((a,b) => a.name.localeCompare(b.name)).forEach(ex => {
            const div = document.createElement('div'); div.className = 'result-item';
            div.dataset.search = (ex.name + " " + ex.primary).toLowerCase();
            if (this.state.tempWorkoutStructure.includes(ex.id)) div.classList.add('selected-item');
            div.innerHTML = `<strong>${ex.name}</strong><div style="font-size:0.8rem;color:#777">${ex.primary}</div>`;
            div.onclick = () => {
                if (this.state.tempWorkoutStructure.includes(ex.id)) {
                    this.state.tempWorkoutStructure = this.state.tempWorkoutStructure.filter(id => id !== ex.id); div.classList.remove('selected-item');
                } else { this.state.tempWorkoutStructure.push(ex.id); div.classList.add('selected-item'); }
            };
            c.appendChild(div);
        });
    },

    filterEditorExercises: function() {
        const q = document.getElementById('search-editor').value.toLowerCase();
        document.querySelectorAll('#editor-exercise-list .result-item').forEach(item => item.classList.toggle('hidden', !(item.dataset.search || "").includes(q)));
    },

    saveWorkoutStructure: function() {
        const n = document.getElementById('editor-workout-name').value;
        if (!n) return alert("Nom requis");
        if (this.state.tempWorkoutStructure.length === 0) return alert("Sélection vide");
        if (this.state.editingWorkoutId) { const w = this.data.workouts.find(x => x.id === this.state.editingWorkoutId); w.name = n; w.exercises = this.state.tempWorkoutStructure; } 
        else { this.data.workouts.push({ id: Date.now(), name: n, exercises: this.state.tempWorkoutStructure }); }
        this.saveData('workouts'); this.navTo('manage-workouts');
    },

    openExerciseCreator: function() { this.navTo('exercise-creator'); },
    saveCustomExercise: function() {
        const n = document.getElementById('new-ex-name').value;
        const m = document.getElementById('new-ex-muscles').value;
        const mat = document.getElementById('new-ex-material').value;
        if(!n) return alert("Nom requis");
        this.data.exercises.push({ id: Date.now(), name: n, primary: m, secondary: "", material: mat });
        this.saveData('exercises'); this.navTo('manage-exercises');
    },
    deleteExercise: function(id) { if(confirm("Supprimer ?")) { this.data.exercises = this.data.exercises.filter(e => e.id !== id); this.saveData('exercises'); this.renderExerciseList('exercise-list-container', false); } }
};

window.addEventListener('load', function() { if(typeof app !== 'undefined') app.init(); });

const RAW_EXERCISES_DATA = `Air squat; Quadriceps, Grand Fessier ; Ischio-jambiers, Adducteurs, Mollets, Érecteurs du rachis ; Aucun 
Donkey kick; Grand Fessier ; Ischio-jambiers (portion supérieure), Érecteurs du rachis ; Aucun (ou élastique) 
Extension hanche poulie basse; Grand Fessier ; Ischio-jambiers, Érecteurs du rachis ; Machine à poulie basse, sangle 
Extension mollets assis barre; Gastrocnémien (mollet) ; Soléaire ; Barre, banc, step 
Extension mollets assis machine; Soléaire ; Gastrocnémien ; Machine à mollets assis 
Extension mollets barre debout; Gastrocnémien ; Soléaire ; Barre, rack, step 
Extension mollets sur marche; Gastrocnémien, Soléaire ; Jambier postérieur ; Step ou marche 
Fente avant barre femme; Quadriceps, Grand Fessier ; Ischio-jambiers, Adducteurs, Mollets, Érecteurs du rachis ; Barre, rack 
Fentes avant; Quadriceps, Grand Fessier ; Ischio-jambiers, Adducteurs, Mollets, Abdominaux (stabilisateurs) ; Aucun 
Fentes avant kettlebell; Quadriceps, Grand Fessier ; Ischio-jambiers, Adducteurs, Mollets, Épaules (stabilisation) ; Kettlebell(s) 
Fentes croisees; Grand Fessier, Adducteurs ; Quadriceps, Ischio-jambiers ; Aucun ou poids 
Fire hydratant; Moyen Fessier, Petit Fessier ; Tenseur du fascia lata, Érecteurs du rachis (stabilisation) ; Aucun (ou élastique) 
Front squat avec halteres; Quadriceps, Grand Fessier ; Ischio-jambiers, Adducteurs, Mollets, Érecteurs du rachis, Deltoïdes antérieurs ; Haltères 
Good morning exercice; Ischio-jambiers, Grand Fessier ; Érecteurs du rachis, Adducteurs ; Barre (ou haltère) 
Hack squat; Quadriceps ; Grand Fessier, Ischio-jambiers ; Machine Hack Squat 
Hips thrust; Grand Fessier ; Ischio-jambiers, Adducteurs ; Banc, barre/haltère/élastique 
Homme faisant un squat avec barre; Quadriceps, Grand Fessier ; Ischio-jambiers, Adducteurs, Mollets, Érecteurs du rachis ; Barre, rack 
Leg curl allonge; Ischio-jambiers ; Mollets ; Machine leg curl allongé 
Leg curl assis machine; Ischio-jambiers ; Mollets ; Machine leg curl assis 
Leg curl inverse machine tirage vertical; Ischio-jambiers ; Grand Fessier, Mollets ; Banc/Tapis, partenaire ou machine 
Leg extension; Quadriceps (vastes) ; Aucun (isolé) ; Machine leg extension 
Marche du fermier avec kettlebells; Avant-bras, Trapèzes, Quadriceps ; Grand Fessier, Ischio-jambiers, Abdominaux, Épaules ; Kettlebells ou haltères 
Montees sur banc; Quadriceps, Grand Fessier ; Ischio-jambiers, Mollets, Fessiers ; Banc, poids optionnel 
Presse a cuisses inclinee; Quadriceps, Grand Fessier ; Ischio-jambiers, Adducteurs ; Machine à presse inclinée 
Presse a cuisses verticale; Quadriceps ; Grand Fessier, Ischio-jambiers ; Machine à presse verticale 
Souleve de terre; Ischio-jambiers, Grand Fessier, Érecteurs du rachis ; Trapèzes, Avant-bras, Adducteurs, Quadriceps ; Barre et disques 
Squat barre devant front; Quadriceps ; Grand Fessier, Ischio-jambiers, Érecteurs du rachis, Deltoïdes antérieurs ; Barre, rack 
Squat bulgare halteres; Quadriceps, Grand Fessier ; Ischio-jambiers, Adducteurs, Mollets ; Haltères, banc 
Squat goblet; Quadriceps, Grand Fessier ; Ischio-jambiers, Adducteurs, Abdominaux, Deltoïdes antérieurs ; Haltère ou kettlebell 
Squat pistol; Quadriceps, Grand Fessier ; Ischio-jambiers, Adducteurs, Mollets, Abdominaux (stabilisation) ; Aucun (ou contre-poids) 
Squat statique contre murchaise; Quadriceps (endurance isométrique) ; Grand Fessier ; Mur, éventuellement ballon 
Squat sur banc; Quadriceps, Grand Fessier ; Ischio-jambiers, Adducteurs ; Banc, poids optionnel 
Zercher deadlift; Quadriceps, Grand Fessier, Érecteurs du rachis ; Ischio-jambiers, Trapèzes, Avant-bras, Biceps ; Barre 
Zercher squat; Quadriceps, Grand Fessier, Abdominaux ; Ischio-jambiers, Érecteurs du rachis, Deltoïdes antérieurs ; Barre, rack 
Bear plank avec kickback; Grand Droit, Obliques, Transverse ; Deltoïdes, Grand Fessier, Triceps ; Aucun 
Ciseaux; Grand Droit (partie basse), Obliques ; Psoas-il iaque (stabilisation) ; Tapis 
Crunch au sol; Grand Droit ; Obliques ; Tapis 
Crunch papillon butterfly sit ups; Grand Droit (partie haute) ; Obliques ; Tapis 
Crunch poulie haute; Grand Droit ; Obliques ; Machine à poulie haute, corde 
Exercice abdos bicyclette; Obliques, Grand Droit ; Fléchisseurs des hanches ; Tapis 
Flexions laterales haltere; Obliques (latéraux) ; Grand Droit, Carré des lombes ; Haltère 
Gainage ours bear plank; Grand Droit, Transverse, Obliques ; Deltoïdes, Quadriceps ; Tapis 
Mountain climber; Grand Droit, Obliques, Transverse ; Deltoïdes, Psoas, Quadriceps, Pectoraux ; Tapis 
Planche abdos; Transverse, Grand Droit, Obliques ; Deltoïdes, Épaules, Quadriceps ; Tapis 
Planche inversee abdos; Grand Droit, Fessiers, Ischio-jambiers ; Deltoïdes postérieurs, Triceps, Trapèzes ; Tapis 
Planche laterale obliques; Obliques, Transverse ; Deltoïdes, Adducteurs ; Tapis 
Releve de genoux suspendu; Grand Droit (partie basse), Obliques ; Fléchisseurs des hanches, Épaules ; Barre de traction 
Releve de jambes assis; Grand Droit (partie basse) ; Fléchisseurs des hanches ; Banc ou chaise 
Releve jambes chaise romaine abdominaux; Grand Droit (partie basse), Obliques ; Fléchisseurs des hanches ; Chaise romaine 
Rotation buste debout poulie; Obliques, Grand Droit ; Épaules, Dos (stabilisation) ; Machine à poulie 
Rotations russes obliques; Obliques, Grand Droit ; Transverse, Fléchisseurs des hanches ; Tapis, poids optionnel 
Russian twist avec developpe epaule; Obliques, Deltoïdes ; Grand Droit, Trapèzes, Triceps ; Haltères ou medecine ball 
Chin up traction supination; Grand Dorsal, Grand Rond ; Biceps (long et court), Brachial, Avant-bras ; Barre de traction 
Curl allonge a la poulie; Biceps (long et court) ; Brachial ; Poulie basse, barre EZ 
Curl au pupitre barre ez larry scott; Biceps (court) ; Brachial ; Banc Larry Scott, barre EZ/haltère 
Curl barre; Biceps (long et court) ; Brachial, Avant-bras ; Barre droite ou EZ 
Curl biceps alterne sur banc incline; Biceps (long) ; Brachial, Avant-bras ; Banc incliné, haltères 
Curl biceps avec halteres alterne; Biceps (long et court) ; Brachial, Avant-bras ; Haltères 
Curl biceps poulie basse; Biceps (long et court) ; Brachial ; Machine à poulie basse, barre 
Curl concentre; Biceps (pic) ; Brachial, Avant-bras ; Banc, haltère 
Curl haltere debout banc incline; Biceps (long) ; Brachial ; Banc incliné, haltères 
Curl haltere incline; Biceps (long) ; Brachial ; Banc incliné, haltères 
Curl haltere prise marteau pupitre; Brachial ; Biceps, Long supinateur ; Banc pupitre, haltère 
Curl haltere prise neutre; Brachial ; Biceps (long et court), Long supinateur ; Haltères 
Curl incline poulie; Biceps (long) ; Brachial ; Banc incliné, poulie basse 
Curl inverse barre; Brachial, Long supinateur, Extenseurs ; Biceps (faible) ; Barre 
Waiter curl; Biceps (long et court) ; Brachial, Deltoïdes antérieurs (stabilisation) ; Haltère 
Bent over row avec halteres; Grand Dorsal, Trapèzes moyen/inférieur, Rhomboïdes ; Deltoïdes postérieurs, Biceps, Érecteurs du rachis ; Haltères, banc 
Bird dog; Érecteurs du rachis, Grand Fessier ; Deltoïdes, Grand Dorsal (stabilisation) ; Tapis 
Chin up traction supination; Grand Dorsal, Grand Rond ; Biceps, Trapèzes, Rhomboïdes ; Barre de traction 
Dead hang suspension passive; Grand Dorsal, Avant-bras, Teres Major ; Trapèzes, Biceps (statique) ; Barre de traction 
Overhead shrug; Trapèzes supérieurs ; Deltoïdes, Triceps ; Barre ou haltères 
Planche inversee abdos; Grand Droit, Fessiers, Ischio-jambiers ; Deltoïdes postérieurs, Triceps, Trapèzes ; Tapis 
Pull over barre (1); Grand Dorsal, Grand Rond, Grand Pectoral (sternal) ; Triceps (longue tête), Dentelé antérieur ; Barre, banc 
Pull over barre; Grand Dorsal, Grand Rond ; Grand Pectoral, Triceps, Dentelé ; Machine à poulie haute 
Pull over poulie; Grand Dorsal, Grand Pectoral (sternal) ; Triceps, Dentelé antérieur ; Haltères, banc 
Pullover avec deux halteres; Grand Dorsal, Trapèzes moyen/inférieur, Rhomboïdes ; Deltoïdes postérieurs, Biceps, Érecteurs du rachis ; Barre 
Pullover haltere; Grand Dorsal, Rhomboïdes ; Deltoïdes postérieurs, Biceps ; Élastique 
Rowing barre; Grand Dorsal, Trapèzes, Rhomboïdes ; Deltoïdes postérieurs, Biceps, Érecteurs du rachis ; Haltère, banc 
Rowing buste penche avec elastique; Trapèzes moyen/inférieur, Rhomboïdes ; Deltoïdes postérieurs, Grand Dorsal ; Banc incliné, haltères 
Rowing haltere un bras; Grand Dorsal, Rhomboïdes ; Deltoïdes postérieurs, Biceps ; Élastique, point d'ancrage 
Rowing halteres banc incline prise neutre; Trapèzes moyen/inférieur, Rhomboïdes, Deltoïdes postérieurs ; Grand Dorsal, Biceps ; Banc surélevé, haltères 
Rowing horizontal bande elastique; Trapèzes supérieurs ; Levator scapulae, Épaules ; Barre 
Seal row halteres; Trapèzes supérieurs ; Levator scapulae ; Machine à poulie 
Shrug barre; Trapèzes supérieurs ; Levator scapulae ; Haltères 
Shrug poulie haussement epaules; Ischio-jambiers, Grand Fessier, Érecteurs du rachis ; Trapèzes, Avant-bras, Grand Dorsal ; Machine guidée (ex: Smith) 
Shrugs avec halteres; Érecteurs du rachis, Grand Fessier ; Deltoïdes postérieurs, Trapèzes ; Tapis 
Souleve de terre avec machine; Grand Dorsal, Rhomboïdes, Trapèzes moyen ; Deltoïdes postérieurs, Biceps, Grand Rond ; Machine à poulie basse 
Souleve de terre; Grand Dorsal (largeur) ; Rhomboïdes, Deltoïdes postérieurs, Biceps ; Machine à poulie basse 
Superman; Grand Dorsal (partie inférieure), Rhomboïdes ; Deltoïdes postérieurs, Biceps ; Machine à poulie haute 
Tirage horizontal poulie; Grand Dorsal, Grand Rond ; Trapèzes, Rhomboïdes, Biceps, Deltoïdes postérieurs ; Machine à lat-pulldown 
Tirage horizontal prise large; Grand Dorsal, Biceps ; Trapèzes, Rhomboïdes, Grand Rond ; Machine à lat-pulldown 
Tirage incline poulie haute; Grand Dorsal (épaisseur), Grand Rond ; Trapèzes, Rhomboïdes, Biceps, Deltoïdes postérieurs ; Machine à lat-pulldown 
Tirage vertical poitrine; Grand Dorsal, Rhomboïdes, Biceps ; Trapèzes, Deltoïdes postérieurs ; Barre de traction, élastique 
Tirage vertical prise inversee; Grand Dorsal, Rhomboïdes, Biceps ; Trapèzes, Deltoïdes postérieurs ; Machine à traction assistée ou banc 
Tirage vertical prise serree; Grand Dorsal, Grand Rond, Trapèzes ; Rhomboïdes, Biceps, Deltoïdes postérieurs ; Barre de traction 
Traction assiste elastique; Grand Dorsal, Grand Rond, Biceps ; Trapèzes, Rhomboïdes, Deltoïdes postérieurs ; Barre de traction parallèle 
Traction assistee avec banc; Deltoïdes antérieur, médial, postérieur ; Trapèzes, Triceps ; Haltères, banc 
Traction  dos; Deltoïdes antérieur et médial ; Trapèzes supérieurs, Triceps ; Haltères, banc 
Traction prise neutre; Deltoïdes antérieur ; Trapèzes, Triceps ; Élastique 
Developpe arnold; Deltoïdes antérieur et médial ; Trapèzes, Triceps ; Élastique, banc 
Developpe epaule halteres; Deltoïdes antérieur et médial, Stabilisateurs du tronc ; Trapèzes, Triceps ; Haltères 
Developpe epaule unilateral avec elastique; Deltoïdes antérieur et médial ; Trapèzes, Triceps ; Smith Machine, banc 
Developpe epaules assis avec elastique; Deltoïdes antérieur, Triceps ; Trapèzes, Grand Pectoral (claviculaire) ; Barre, rack 
Developpe epaules assis dumbbell z press; Deltoïdes postérieur ; Trapèzes, Rhomboïdes ; Élastique 
Developpe epaules avec elastique; Deltoïdes antérieur ; Grand Pectoral (claviculaire) ; Banc, barre légère 
Developpe epaules smith machine; Deltoïdes antérieur ; Grand Pectoral (claviculaire) ; Banc incliné, haltères 
Developpe militaire; Deltoïdes antérieur ; Grand Pectoral (claviculaire), Trapèzes ; Haltères, barre ou élastique 
Ecarte arriere elastique; Deltoïdes médial ; Deltoïdes antérieur, Trapèzes ; Haltères ou élastique 
Elevation frontale allongee a la barre; Deltoïdes médial ; Deltoïdes antérieur, Trapèzes ; Machine à poulie basse 
Elevation frontale banc incline; Deltoïdes postérieur, Trapèzes moyen/inférieur ; Rhomboïdes, Rotateurs externes ; Machine à poulie haute, corde 
Elevations frontales; Deltoïdes postérieur ; Trapèzes, Rhomboïdes ; Banc, haltères 
Elevations laterales; Deltoïdes postérieur ; Trapèzes, Rhomboïdes ; Élastique 
Elevations laterales unilaterale poulie; Deltoïdes postérieur ; Trapèzes, Rhomboïdes ; Machine pec deck 
Face pull; Deltoïdes antérieur et médial ; Trapèzes, Triceps ; Machine à presse épaules 
Oiseau assis sur banc; Infra-épineux, Teres Minor (Rotateur externe) ; Deltoïdes postérieur ; Poulie basse, poignée 
Oiseau avec elastique; Infra-épineux, Teres Minor ; Deltoïdes postérieur ; Haltère léger 
Pec deck inverse; Quadriceps, Grand Fessier, Deltoïdes antérieur ; Ischio-jambiers, Triceps, Mollets ; Barre ou haltères 
Presse epaule; Deltoïdes médial, Trapèzes supérieurs ; Deltoïdes antérieur, Biceps ; Élastique 
Rotation externe epaule poulie; Deltoïdes médial, Trapèzes supérieurs ; Deltoïdes antérieur, Biceps ; Machine guidée (ex: Smith) 
Rotation externe vertical epaule haltere; Grand Pectoral (sternal et claviculaire), Deltoïdes antérieur ; Triceps ; Banc plat, haltères 
Thruster; Grand Pectoral (sternal) ; Triceps, Deltoïdes antérieur ; Banc, barre, serre-jambes optionnel 
Tirage menton avec elastique; Grand Pectoral (sternal), Triceps ; Deltoïdes antérieur ; Barre, banc, partenaire 
Tirage menton machine guidee; Triceps, Grand Pectoral (sternal interne) ; Deltoïdes antérieur ; Barre, banc 
Developpe couche halteres; Grand Pectoral (sternal), Deltoïdes antérieur ; Triceps ; Barre, banc, rack 
Developpe couche larsen; Grand Pectoral (claviculaire), Deltoïdes antérieur ; Triceps ; Élastique ancré 
Developpe couche prise inversee; Grand Pectoral (partie inférieure) ; Triceps, Deltoïdes antérieur ; Banc décliné, élastique 
Developpe couche serre avec halteres; Grand Pectoral (partie inférieure) ; Triceps, Deltoïdes antérieur ; Banc décliné, barre, rack 
Developpe couche; Grand Pectoral (partie inférieure) ; Triceps, Deltoïdes antérieur ; Banc décliné, haltères 
Developpe debout pectoraux elastique; Grand Pectoral (claviculaire) ; Deltoïdes antérieur, Triceps ; Banc incliné, barre, rack 
Developpe decline avec elastique; Grand Pectoral (claviculaire) ; Deltoïdes antérieur, Triceps ; Banc incliné, haltères 
Developpe decline barre; Grand Pectoral (claviculaire) ; Deltoïdes antérieur, Triceps ; Machine convergente (ex: Hammer Strength) 
Developpe decline halteres; Grand Pectoral (sternal et inférieur), Triceps ; Deltoïdes antérieur ; Barres parallèles, poids optionnel 
Developpe incline barre; Grand Pectoral (sternal) ; Deltoïdes antérieur, Dentelé antérieur ; Banc plat, haltères 
Developpe incline halteres; Grand Pectoral (sternal) ; Deltoïdes antérieur, Dentelé ; Deux poulies basses, poignées 
Developpe incline machine convergente; Grand Pectoral (sternal) ; Deltoïdes antérieur, Dentelé ; Poulie basse, poignée 
Dips pectoraux; Grand Pectoral (sternal) ; Deltoïdes antérieur ; Élastique 
Ecarte couche haltere; Grand Pectoral (partie inférieure) ; Deltoïdes antérieur, Dentelé ; Banc décliné, haltères 
Ecarte poulie vis a vis pectoraux; Grand Pectoral (partie supérieure/claviculaire) ; Deltoïdes antérieur ; Banc, haltères 
Ecarte unilateral a la poulie; Grand Pectoral, Triceps, Deltoïdes antérieur ; Dentelé antérieur, Abdominaux (stabilisation) ; Aucun 
Ecartes bande elastique bilateral; Grand Pectoral (sternal), Grand Dorsal ; Dentelé antérieur, Triceps (longue tête) ; Banc, haltère 
Ecartes decline avec halteres; Triceps (3 chefs) ; Avant-bras ; Barre EZ, banc 
Hyght dumbell fly; Triceps, Grand Pectoral (interne) ; Deltoïdes antérieur ; Smith Machine, banc 
Pompe ; Triceps ; Grand Pectoral (inférieur), Deltoïdes antérieur ; Deux bancs ou chaise 
Pullover haltere; Triceps ; Deltoïdes antérieur, Grand Pectoral ; Barres parallèles 
Barre front; Triceps ; Aucun (isolé) ; Poulie basse, corde/barre 
Developpe couche prise serree smith machine; Triceps (longue tête) ; Aucun ; Banc incliné, haltères 
Dips sur banc; Triceps (longue tête) ; Aucun ; Élastique 
Dips triceps; Triceps (3 chefs) ; Aucun ; Haltère, banc optionnel 
Extension horizontale poulie; Triceps (3 chefs) ; Aucun ; Banc incliné, poulie basse, corde 
Extension triceps banc incline halteres; Triceps (latéral et médial) ; Aucun ; Poulie haute, corde 
Extension triceps derriere tete avec elastique; Triceps (3 chefs) ; Aucun ; Poulie haute, barre courte 
Extension triceps haltere un bras; Triceps (3 chefs) ; Aucun ; Élastique ancré en hauteur 
Extension triceps incline poulie basse; Triceps (3 chefs) ; Aucun ; Banc, barre EZ 
Extension triceps poulie haute corde; Triceps (3 chefs) ; Aucun ; Poulie basse, barre courte 
Extension triceps poulie haute; Triceps (isolation) ; Aucun ; Poulie haute, poignée simple 
Extension triceps verticale elastique; Triceps (3 chefs) ; Aucun ; Banc, haltère 
Extension verticale assis barre; Triceps (longue tête) ; Avant-bras ; Banc plat, haltères ou barre EZ 
Extension verticale triceps poulie basse; Triceps (3 chefs) ; Aucun ; Banc décliné, haltères 
Extensions concentres des triceps poulie; Triceps, Grand Pectoral (interne) ; Deltoïdes antérieur, Abdominaux ; Aucun 
Extensions des triceps assis avec haltere; Triceps ; Aucun ; Banc, haltères 
Extensions triceps couche halteres; Triceps ; Aucun ; Banc, haltère 
Extensions triceps decline halteres; Triceps, Grand Pectoral (interne) ; Deltoïdes antérieur, Abdominaux ; Aucun 
Extensions triceps planche;Grand Pectoral, Triceps;Deltoïde antérieur, Dentelé antérieur;Banc plat, Jammer Arm
Kickback alterne assis;Grand Pectoral, Triceps;Deltoïde antérieur, Dentelé antérieur;Banc plat, Jammer Arm
Kickback;Grand Pectoral, Triceps;Deltoïde antérieur, Dentelé antérieur;Banc plat, Jammer Arm
Pompe ;Grand Pectoral (faisceau sternal), Triceps;Deltoïde antérieur;Poulies basses (deux), Poignées
Écarté à la poulie (crossover);Grand Pectoral;Deltoïde antérieur;Poulies hautes (deux), Poignées
Développé prise marteau (haltères);Grand Pectoral, Triceps, Biceps (stabilisation);Deltoïde antérieur;Banc plat, Haltères
Développé militaire (Jammer Arm);Deltoïdes, Triceps;Trapèzes;Banc inclinable/plat (assis), Jammer Arm
Élévations latérales (poulie);Deltoïde latéral;Trapèzes, Supra-épineux;Poulie réglable
Élévations frontales (poulie);Deltoïde antérieur;Grand Pectoral, Trapèzes;Poulie
Développé militaire à la poulie;Deltoïdes, Triceps;Trapèzes;Poulie basse (assis), Petite barre
Élévations latérales à la poulie;Deltoïde latéral;Trapèzes, Supra-épineux;Poulie basse, Poignée
Presse Jammer Arm (selon angle);Épaules/Triceps ou Pectoraux;Trapèzes, Dentelé;Jammer Arm
Tirage vertical (Unilatéral);Grand Dorsal;Biceps;Poulie haute, Poignée
Tractions pronation (Chin-ups);Grand Dorsal, Grand Rond;Biceps, Deltoïde postérieur, Trapèze;Barre de traction
Rowing horizontal Jammer Arm;Grand Dorsal, Rhomboïdes;Biceps, Deltoïde postérieur;Jammer Arm
Tirage vertical Jammer Arm;Grand Dorsal, Grand Rond;Biceps, Deltoïde postérieur;Jammer Arm
Rowing Yates;Grand Dorsal, Biceps, Trapèze inférieur;Deltoïde postérieur;Grande barre droite
Tirage vertical prise marteau;Grand Dorsal, Brachial antérieur;Biceps, Deltoïde postérieur;Poulie haute, Poignée neutre
Rack Pull;Trapèzes, Ischio-jambiers, Fessiers, Lombaires;Grand Dorsal, Avant-bras;Grande barre droite (et supports)
Pull-over à la poulie haute;Grand Dorsal, Grand Pectoral;Triceps, Dentelé;Poulie haute, Grande barre droite
Pont fessier;Grand Fessier, Ischio-jambiers;Lombaires, Adducteurs;Tapis de sol, Haltère optionnel
Sissy Squat;Quadriceps;Grand Droit de l'abdomen (gainage);Support pour équilibre
Extension des jambes assis (simulée);Quadriceps;Aucun;Banc plat, Haltère entre les pieds
Flexion des jambes allongé (Leg Curl) au sol;Ischio-jambiers;Mollets;Tapis de sol, partenaire ou tapis glissant
Extension inverse (Back Extension) sur banc;Lombaires, Fessiers;Ischio-jambiers;Banc plat (ancrage aux chevilles)
Flexions lombaires au banc;Lombaires;Fessiers, Ischio-jambiers;Banc plat (ancrage aux chevilles)
Abduction de hanche à la poulie;Moyen Fessier, Petit Fessier;Tenseur du fascia lata;Poulie basse, Sangle de cheville
Adduction de hanche à la poulie;Adducteurs;Pectiné, Gracile;Poulie basse, Sangle de cheville
Lever de jambe latéral (abduction);Moyen Fessier, Petit Fessier;Obliques, Tenseur du fascia lata;Tapis de sol, Haltère optionnel
Lever de jambe sur le côté (adduction);Adducteurs;Grand Droit de l'abdomen;Tapis de sol
Squat partiel (Pin Squat) dans Jammer;Quadriceps, Fessiers, Ischio-jambiers;Lombaires, Gainage;Jammer Arm (avec butoirs)
Crunch oblique;Obliques;Grand Droit de l'abdomen;Tapis de sol
Sit-ups;Grand Droit de l'abdomen;Ilio-psoas, Obliques;Tapis de sol, Banc à abdos optionnel
Enroulement vertébral (Roll-up);Grand Droit de l'abdomen;Ilio-psoas, Obliques;Tapis de sol
Planche avec traction de genou (Spiderman);Obliques, Grand Droit, Ilio-psoas;Deltoïdes, Pectoraux;Tapis de sol
Curl marteau poulie basse;Brachial antérieur, Long supinateur;Biceps brachial;Poulie basse, Corde
Curl inversé;Long supinateur, Extenseurs de l'avant-bras;Biceps brachial;Grande barre droite, Barre EZ
Curl en pronation à la poulie;Brachial antérieur, Long supinateur;Biceps;Poulie basse, Petite barre droite
Extension des triceps à la poulie basse;Triceps brachial;Aucun principal;Poulie basse, Corde
Flexions de poignets;Fléchisseurs des avant-bras;Aucun;Banc plat, Haltères
Extensions de poignets;Extenseurs des avant-bras;Aucun;Banc plat, Haltères
Burpees;Corps entier;Gainage;Tapis de sol
Pompes en T;Pectoraux, Deltoïdes, Obliques;Triceps, Gainage;Tapis de sol
Renegade Row;Grand Dorsal, Biceps, Gainage;Deltoïde postérieur, Triceps;Haltères lourds
Rowing vertical (Upright Row);Trapèze supérieur, Deltoïdes;Biceps, Avant-bras;Grande barre droite, Haltères`;
