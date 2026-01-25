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

const RAW_EXERCISES_DATA = `Développé couché (barre);Grand pectoral, Triceps brachial;Deltoïde antérieur, Dentelé antérieur;Banc plat, Grande barre droite
Développé couché (haltères);Grand pectoral, Triceps brachial;Deltoïde antérieur, Dentelé antérieur;Banc plat, Haltères
Développé couché (Jammer Arm);Grand pectoral, Triceps brachial;Deltoïde antérieur, Dentelé antérieur;Banc plat, Jammer Arm
Écarté couché (haltères);Grand pectoral;Deltoïde antérieur, Petit pectoral;Banc plat, Haltères
Pull-over;Grand dorsal, Grand pectoral;Triceps (longue portion), Dentelé;Banc plat, Haltère
Développé incliné (barre);Grand pectoral (faisceau claviculaire), Triceps;Deltoïde antérieur;Banc inclinable, Grande barre droite
Développé incliné (haltères);Grand pectoral (faisceau claviculaire), Triceps;Deltoïde antérieur;Banc inclinable, Haltères
Développé incliné (Jammer Arm);Grand pectoral, Triceps brachial;Deltoïde antérieur, Dentelé antérieur;Banc plat, Jammer Arm
Développé décliné (barre);Grand pectoral (faisceau sternal), Triceps;Deltoïde antérieur;Banc déclinable, Grande barre droite
Développé décliné (haltères);Grand pectoral (faisceau sternal), Triceps;Deltoïde antérieur;Banc déclinable, Haltères
Développé décliné (Jammer Arm);Grand pectoral, Triceps brachial;Deltoïde antérieur, Dentelé antérieur;Banc plat, Jammer Arm
Pompes;Grand pectoral, Triceps;Deltoïde antérieur, Gainage;Tapis de sol
Dips aux barres parallèles;Triceps, Grand pectoral;Deltoïde antérieur;Barres dips
Développé militaire (barre);Deltoïdes, Triceps;Trapèzes;Banc inclinable/plat (assis), Grande barre droite
Développé militaire (haltères);Deltoïdes, Triceps;Trapèzes;Banc inclinable/plat (assis), Haltères
Développé militaire (Jammer Arm);Deltoïdes, Triceps;Trapèzes;Banc inclinable/plat (assis), Jammer Arm
Élévations latérales;Deltoïde latéral;Trapèzes, Supra-épineux;Haltères
Élévations latérales (poulie);Deltoïde latéral;Trapèzes, Supra-épineux;Poulie reglable
Élévations frontales;Deltoïde antérieur;Grand pectoral, Trapèzes;Haltères, Grande barre droite
Élévations frontales (poulie);Deltoïde antérieur;Grand pectoral, Trapèzes;Poulie
Face Pull;Deltoïde postérieur, Trapèze inférieur;Rhomboïdes, Rotateurs externes;Poulie réglable (haute), Corde
Shrugs (barre);Trapèze supérieur;Trapèze moyen, Rhomboïdes;Grande barre droite, Haltères
Shrugs (haltères);Trapèze supérieur;Trapèze moyen, Rhomboïdes;Haltères
Rowing barre buste penché;Grand dorsal, Trapèze moyen, Rhomboïdes;Biceps, Deltoïde postérieur, Lombaires;Grande barre droite
Rowing haltère unilatéral;Grand dorsal, Trapèze, Rhomboïdes;Biceps, Deltoïde postérieur;Banc plat, Haltère
Rowing à la poulie basse;Grand dorsal, Trapèze, Rhomboïdes;Biceps, Deltoïde postérieur;Poulie basse, Grande barre
Tirage vertical (Pull-down);Grand dorsal, Grand rond;Biceps, Deltoïde postérieur, Trapèze;Poulie haute, Grande barre
Tirage vertical (Unilateral);Grand dorsal;Biceps;Poulie haute, Poignée
Tractions supination (Pull-ups);Grand dorsal, Biceps brachial;Trapèze, Deltoïde postérieur, Rhomboïdes;Barre traction
Tractions pronation (Chin-ups);Grand dorsal, Grand rond;Biceps, Deltoïde postérieur, Trapèze;Barre traction
Tractions prise neutre;Grand dorsal, Biceps;Deltoïde postérieur, Trapèze;Barre traction (si poignées parallèles)
Good Morning;Ischio-jambiers, Fessiers, Lombaires;Grand dorsal, Adducteurs;Grande barre droite
Squat (barre libre);Quadriceps, Fessiers, Ischio-jambiers;Lombaires, Abdominaux, Mollets;Grande barre droite
Squat avant;Quadriceps, Fessiers;Lombaires, Abdominaux, Ischio-jambiers;Grande barre droite
Squat bulgare (fentes arrière);Quadriceps, Fessiers;Ischio-jambiers, Mollets, Gainage;Banc plat, Haltères
Fentes marchées;Quadriceps, Fessiers;Ischio-jambiers, Mollets, Gainage;Haltères
Hip Thrust;Grand fessier, Ischio-jambiers;Lombaires, Adducteurs;Banc plat, Grande barre droite/Haltère
Pont fessier;Grand fessier, Ischio-jambiers;Lombaires, Adducteurs;Tapis de sol, Haltère optionnel
Crunch abdos;Grand droit de l'abdomen;Obliques, Pyramidal;Tapis de sol
Crunch oblique;Obliques;Grand droit de l'abdomen;Tapis de sol
Relevé de jambes suspendu;Grand droit (bas), Ilio-psoas;Obliques, Quadriceps;Barre traction
Planche abdominale;Grand droit, Transverse, Obliques;Épaules, Fessiers, Quadriceps;Tapis de sol
Planche latérale;Obliques, Transverse;Deltoïde, Fessiers;Tapis de sol
Mountain Climbers;Grand droit, Transverse, Ilio-psoas;Épaules, Pectoraux, Quadriceps;Tapis de sol
Russian Twist;Obliques, Grand droit;Transverse, Ilio-psoas;Tapis de sol, Haltère optionnel
Curl barre EZ;Biceps brachial;Brachial antérieur, Long supinateur;Barre EZ
Curl haltères;Biceps brachial;Brachial antérieur, Long supinateur;Haltères
Curl marteau;Brachial antérieur, Long supinateur;Biceps brachial;Haltères
Curl poulie basse;Biceps brachial;Brachial antérieur, Long supinateur;Poulie basse + Barre
Curl marteau poulie basse;Brachial antérieur, Long supinateur;Biceps brachial;Poulie basse + Corde
Curl concentré;Biceps brachial;Brachial antérieur;Banc plat, Haltère
Curl sur banc incliné;Biceps brachial;Brachial antérieur;Banc inclinable, Haltères
Extensions triceps à la poulie;Triceps brachial;Aucun principal;Poulie haute, Corde/Petite barre
Kick-back;Triceps brachial;Deltoïde postérieur;Banc plat, Haltère
Barre au front (Skullcrusher);Triceps brachial (longue portion);Grand pectoral, Deltoïde antérieur;Banc plat, Barre EZ ou haltères
Développé couché prise serrée;Triceps brachial;Grand pectoral, Deltoïde antérieur;Banc plat, Grande barre droite
Curl inversé;Long supinateur, Extenseurs de l'avant-bras;Biceps brachial;Grande barre droite, Barre EZ
Flexions de poignets;Fléchisseurs des avant-bras;Aucun;Banc plat, Haltères
Extensions de poignets;Extenseurs des avant-bras;Aucun;Banc plat, Haltères
Tirage horizontal à la poulie;Grand dorsal, Rhomboïdes;Biceps, Deltoïde postérieur;Poulie basse, Poignée/Grande barre
Extension des lombaires;Lombaires, Fessiers;Ischio-jambiers;Banc à lombaires (si disponible) ou Banc plat
Superman;Lombaires, Fessiers;Trapèze, Deltoïde postérieur;Tapis de sol
Donkey Kick;Grand fessier;Ischio-jambiers, Lombaires;Sangle de cheville, Poulie basse
Fire Hydrant;Moyen fessier, Petit fessier;Lombaires, Abdominaux;Aucun (Tapis de sol)
Sissy Squat;Quadriceps;Grand droit de l'abdomen (gainage);Support pour équilibre
Step-up;Quadriceps, Fessiers;Ischio-jambiers, Gainage;Banc plat/stable, Haltères
Burpees;Corps entier;Gainage;Tapis de sol
Pompes en T;Pectoraux, Deltoïdes, Obliques;Triceps, Gainage;Tapis de sol
Rowing à un bras à la poulie;Grand dorsal, Rhomboïdes;Biceps, Deltoïde postérieur;Poulie basse, Poignée
Pull-over à la poulie haute;Grand dorsal, Grand pectoral;Triceps, Dentelé;Poulie haute, Grande barre droite
Rack Pull;Trapèzes, Ischio-jambiers, Fessiers, Lombaires;Grand dorsal, Avant-bras;Grande barre droite (et supports)
Renegade Row;Grand dorsal, Biceps, Gainage;Deltoïde postérieur, Triceps;Haltères lourds
Goblet Squat;Quadriceps, Fessiers;Grand droit de l'abdomen, Ischio-jambiers;Haltère
Lunges statiques;Quadriceps, Fessiers;Ischio-jambiers, Mollets;Haltères ou barre
Crunch à la poulie haute;Grand droit de l'abdomen;Obliques;Poulie haute, Corde
Rotation du buste à la poulie;Obliques, Grand droit;Transverse;Poulie haute, Corde
Sit-ups;Grand droit de l'abdomen;Ilio-psoas, Obliques;Tapis de sol, Banc à abdos optionnel
Élévations latérales à la poulie;Deltoïde latéral;Trapèze, Supra-épineux;Poulie basse, Poignée
Extension triceps avec haltère;Triceps brachial;Aucun principal;Haltère, Banc plat
Rowing Yates;Grand dorsal, Biceps, Trapèze inférieur;Deltoïde postérieur;Grande barre droite
Gainage dorsal (Bird-Dog);Lombaires, Grand dorsal, Fessiers;Deltoïdes, Gainage;Tapis de sol
Développé couché prise inversée;Triceps brachial, Grand pectoral;Deltoïde antérieur;Banc plat, Grande barre droite
Écarté incliné (haltères);Grand pectoral (faisceau claviculaire);Deltoïde antérieur;Banc inclinable, Haltères
Tirage vertical prise marteau;Grand dorsal, Brachial antérieur;Biceps, Deltoïde postérieur;Poulie haute, Poignée neutre
Extension des triceps à la poulie basse;Triceps brachial;Aucun principal;Poulie basse, Corde
Flexions lombaires au banc;Lombaires;Fessiers, Ischio-jambiers;Banc plat (ancrage aux chevilles)
Élévations de mollets debout;Triceps sural (mollets);Soléaire;Step ou marche, Haltères
Élévations de mollets assis;Soléaire;Gastrocnémien;Banc plat, Haltères sur les cuisses
Développé militaire à la poulie;Deltoïdes, Triceps;Trapèzes;Poulie basse (assis), Petite barre
Curl en pronation à la poulie;Brachial antérieur, Long supinateur;Biceps;Poulie basse, Petite barre droite
Abduction de hanche à la poulie;Moyen fessier, Petit fessier;Tenseur du fascia lata;Poulie basse, Sangle de cheville
Adduction de hanche à la poulie;Adducteurs;Pectiné, Gracile;Poulie basse, Sangle de cheville
Développé couché à la poulie (bas);Grand pectoral (faisceau sternal), Triceps;Deltoïde antérieur;Poulies basses (deux), Poignées
Écarté à la poulie (crossover);Grand pectoral;Deltoïde antérieur;Poulies hautes (deux), Poignées
Presse Jammer Arm (similaire développé);Épaules, Triceps ou Pectoraux (selon angle);Trapèzes, Dentelé;Jammer arm
Rowing horizontal Jammer Arm;Grand dorsal, Rhomboïdes;Biceps, Deltoïde postérieur;Jammer arm
Tirage vertical Jammer Arm;Grand dorsal, Grand rond;Biceps, Deltoïde postérieur;Jammer arm
Squat partiel (Pin Squat) dans Jammer;Quadriceps, Fessiers, Ischio-jambiers;Lombaires, Gainage;Jammer arm (avec butoirs)
Flexion des jambes allongé (Leg Curl) au sol;Ischio-jambiers;Mollets;Tapis de sol, partenaire ou tapis glissant
Extension de jambes assis (simulée);Quadriceps;Aucun;Banc plat, Haltère entre les pieds
Lever de jambe latéral;Moyen fessier, Petit fessier;Obliques, Tenseur du fascia lata;Tapis de sol, Haltère optionnel à la cheville
Lever de jambe sur le côté (adduction);Adducteurs;Grand droit de l'abdomen;Tapis de sol
Planche avec traction de genou (Spiderman);Obliques, Grand droit, Ilio-psoas;Deltoïdes, Pectoraux;Tapis de sol
Enroulement vertébral (Roll-up);Grand droit de l'abdomen;Ilio-psoas, Obliques;Tapis de sol
Extension inverse (Back Extension) sur banc;Lombaires, Fessiers;Ischio-jambiers;Banc plat (ancrage aux chevilles)
Développé prisemarteau (haltères);Grand pectoral, Triceps, Biceps (stabilisation);Deltoïde antérieur;Banc plat, Haltères
Rowing vertical (Upright Row);Trapèze supérieur, Deltoïdes;Biceps, Avant-bras;Grande barre droite, Haltères`;
