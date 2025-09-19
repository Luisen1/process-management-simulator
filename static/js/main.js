// Variables globales
let processes = [];
let currentResults = null;
let currentQuantum = 3;

// Elementos del DOM
const processForm = document.getElementById('process-form');
const scheduleBtn = document.getElementById('schedule-btn');
const resetBtn = document.getElementById('reset-btn');
const changeAlgorithmBtn = document.getElementById('change-algorithm-btn');
const algorithSelect = document.getElementById('algorithm-select');
const messagesDiv = document.getElementById('messages');
const addedProcessesDiv = document.getElementById('added-processes');
const resultsSection = document.getElementById('results-section');

// Elementos específicos de Round Robin
const quantumControl = document.getElementById('quantum-control');
const quantumInput = document.getElementById('quantum-input');
const setQuantumBtn = document.getElementById('set-quantum-btn');
const currentQuantumSpan = document.getElementById('current-quantum');

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    loadCurrentState();
    
    processForm.addEventListener('submit', addProcess);
    scheduleBtn.addEventListener('click', scheduleProcesses);
    resetBtn.addEventListener('click', resetScheduler);
    changeAlgorithmBtn.addEventListener('click', changeAlgorithm);
    
    // Event listener para Round Robin
    if (setQuantumBtn) {
        setQuantumBtn.addEventListener('click', setQuantum);
    }
    
    // Event listener para cambio de algoritmo
    algorithSelect.addEventListener('change', function() {
        updateAlgorithmInterface(this.value);
    });
});

// Función para mostrar mensajes
function showMessage(text, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.innerHTML = `
        <i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'success' ? 'check-circle' : 'info-circle'}"></i>
        ${text}
    `;
    
    messagesDiv.appendChild(messageDiv);
    
    // Auto-remove después de 5 segundos
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
        }
    }, 5000);
    
    // Scroll al mensaje
    messageDiv.scrollIntoView({ behavior: 'smooth' });
}

// Función para añadir proceso
async function addProcess(event) {
    event.preventDefault();
    
    const formData = new FormData(processForm);
    const processData = {
        pid: formData.get('pid').trim(),
        arrival_time: formData.get('arrival_time'),
        burst_time: formData.get('burst_time')
    };
    
    try {
        const response = await fetch('/add_process', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(processData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showMessage(result.message, 'success');
            processForm.reset();
            loadCurrentState();
        } else {
            showMessage(result.message, 'error');
        }
    } catch (error) {
        showMessage(`Error de conexión: ${error.message}`, 'error');
    }
}

// Función para ejecutar planificación
async function scheduleProcesses() {
    try {
        const response = await fetch('/schedule', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            showMessage(result.message, 'success');
            currentResults = result.results;
            displayResults(result.results);
        } else {
            showMessage(result.message, 'error');
        }
    } catch (error) {
        showMessage(`Error de conexión: ${error.message}`, 'error');
    }
}

// Función para reiniciar scheduler
async function resetScheduler() {
    if (!confirm('¿Está seguro de que desea reiniciar? Se perderán todos los procesos añadidos.')) {
        return;
    }
    
    try {
        const response = await fetch('/reset', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            showMessage(result.message, 'success');
            processes = [];
            currentResults = null;
            updateProcessList();
            hideResults();
        } else {
            showMessage(result.message, 'error');
        }
    } catch (error) {
        showMessage(`Error de conexión: ${error.message}`, 'error');
    }
}

// Función para cambiar algoritmo
async function changeAlgorithm() {
    const selectedAlgorithm = algorithSelect.value;
    const requestData = { algorithm: selectedAlgorithm };
    
    // Si es Round Robin, incluir el quantum actual
    if (selectedAlgorithm === 'RR') {
        requestData.quantum = currentQuantum;
    }
    
    try {
        const response = await fetch('/change_algorithm', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showMessage(result.message, 'success');
            document.getElementById('current-algorithm').textContent = selectedAlgorithm;
            processes = [];
            currentResults = null;
            updateProcessList();
            hideResults();
            
            // Actualizar interfaz según el algoritmo
            updateAlgorithmInterface(selectedAlgorithm);
            
            // Mostrar mensaje específico sobre las diferencias
            showAlgorithmDifferences(selectedAlgorithm);
        } else {
            showMessage(result.message, 'error');
        }
    } catch (error) {
        showMessage(`Error de conexión: ${error.message}`, 'error');
    }
}

// Función para configurar quantum
async function setQuantum() {
    const quantum = parseInt(quantumInput.value);
    
    if (!quantum || quantum <= 0) {
        showMessage('El quantum debe ser un número entero positivo', 'error');
        return;
    }
    
    try {
        const response = await fetch('/set_quantum', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ quantum: quantum })
        });
        
        const result = await response.json();
        
        if (result.success) {
            currentQuantum = quantum;
            currentQuantumSpan.textContent = `Quantum actual: ${quantum}`;
            showMessage(result.message, 'success');
        } else {
            showMessage(result.message, 'error');
        }
    } catch (error) {
        showMessage(`Error de conexión: ${error.message}`, 'error');
    }
}

// Función para mostrar diferencias del algoritmo
function showAlgorithmDifferences(algorithm) {
    let message = '';
    if (algorithm === 'SJF') {
        message = `🔄 Cambiado a SJF: Los procesos se ordenarán por <strong>Burst Time</strong> (BT), no por Arrival Time (AT). 
                   Esto optimiza el tiempo de espera pero puede causar "starvation" en procesos largos.`;
    } else if (algorithm === 'FCFS') {
        message = `🔄 Cambiado a FCFS: Los procesos se ordenarán por <strong>Arrival Time</strong> (AT), respetando el orden de llegada. 
                   Es justo pero puede tener el "efecto convoy".`;
    } else if (algorithm === 'RR') {
        message = `🔄 Cambiado a Round Robin: Los procesos se ejecutarán en turnos de <strong>${currentQuantum} unidades de tiempo</strong>. 
                   Es preemptivo y equitativo, pero genera cambios de contexto. Puedes ajustar el quantum según necesites.`;
    }
    
    if (message) {
        setTimeout(() => {
            showMessage(message, 'info');
        }, 500);
    }
}

// Función para cargar estado actual
async function loadCurrentState() {
    try {
        const response = await fetch('/get_current_state');
        const state = await response.json();
        
        processes = state.processes || [];
        document.getElementById('current-algorithm').textContent = state.algorithm;
        algorithSelect.value = state.algorithm;
        
        // Cargar quantum si está disponible
        if (state.quantum !== null && state.quantum !== undefined) {
            currentQuantum = state.quantum;
            if (quantumInput) quantumInput.value = currentQuantum;
            if (currentQuantumSpan) currentQuantumSpan.textContent = `Quantum actual: ${currentQuantum}`;
        }
        
        updateProcessList();
        updateAlgorithmInterface(state.algorithm);
    } catch (error) {
        showMessage(`Error al cargar estado: ${error.message}`, 'error');
    }
}

// Función para actualizar lista de procesos
function updateProcessList() {
    if (processes.length === 0) {
        addedProcessesDiv.innerHTML = '<p class="no-processes">No hay procesos añadidos aún.</p>';
        scheduleBtn.disabled = true;
    } else {
        const processHtml = processes.map(p => `
            <div class="process-item">
                <span class="process-id">${p.pid}</span>
                <span class="process-details">AT: ${p.arrival_time}, BT: ${p.burst_time}</span>
            </div>
        `).join('');
        
        addedProcessesDiv.innerHTML = processHtml;
        scheduleBtn.disabled = false;
    }
}

// Función para mostrar resultados
function displayResults(results) {
    const currentAlgorithm = document.getElementById('current-algorithm').textContent;
    
    resultsSection.style.display = 'block';
    
    // Mostrar tabla de resultados
    displayResultsTable(results.processes);
    
    // Mostrar diagrama de Gantt
    displayGanttChart(results.gantt_chart);
    
    // Mostrar métricas
    displayMetrics(results);
    
    // Mostrar estadísticas si están disponibles
    if (results.statistics) {
        console.log('Mostrando estadísticas para:', currentAlgorithm, results.statistics);
        displayStatistics(results.statistics);
    } else {
        console.log('No hay estadísticas disponibles para:', currentAlgorithm);
        // Ocultar la sección de estadísticas si no hay datos
        const statisticsSection = document.getElementById('statistics-section');
        if (statisticsSection) {
            statisticsSection.style.display = 'none';
        }
    }
    
    // Mostrar análisis específico del algoritmo
    if (currentAlgorithm === 'SJF') {
        showSJFAnalysis(results.processes);
    } else if (currentAlgorithm === 'FCFS') {
        showFCFSAnalysis(results);
    } else if (currentAlgorithm === 'RR') {
        showRRAnalysis(results);
    }
    
    // Scroll a resultados
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

// Función para análisis específico de SJF
function showSJFAnalysis(processes) {
    const sortedByBT = [...processes].sort((a, b) => a.burst_time - b.burst_time);
    const executionOrder = processes.map(p => p.pid).join(' → ');
    const btOrder = sortedByBT.map(p => `${p.pid}(BT:${p.burst_time})`).join(' → ');
    
    setTimeout(() => {
        showMessage(
            `📊 SJF: Ordenado por BT: ${btOrder} | Ejecutado: ${executionOrder}`, 
            'info'
        );
    }, 1000);
}

// Función para análisis específico de FCFS
function showFCFSAnalysis(results) {
    const convoyInfo = results.convoy_effect_info || 'No se detectó efecto convoy';
    setTimeout(() => {
        showMessage(
            `📊 FCFS: ${convoyInfo}`, 
            'info'
        );
    }, 1000);
}

// Función para mostrar tabla de resultados
function displayResultsTable(processes) {
    const tbody = document.querySelector('#results-table tbody');
    const quantumColumn = document.getElementById('quantum-column');
    const ntatColumn = document.getElementById('ntat-column');
    
    tbody.innerHTML = '';
    
    const currentAlgorithm = document.getElementById('current-algorithm').textContent;
    
    // Mostrar/ocultar columnas específicas para Round Robin
    if (quantumColumn && ntatColumn) {
        if (currentAlgorithm === 'RR') {
            quantumColumn.style.display = 'table-cell';
            ntatColumn.style.display = 'table-cell';
        } else {
            quantumColumn.style.display = 'none';
            ntatColumn.style.display = 'none';
        }
    }
    
    processes.forEach(process => {
        const row = document.createElement('tr');
        
        // Aplicar clases específicas para algoritmos
        const atClass = currentAlgorithm === 'SJF' ? 'at-column' : '';
        const btClass = currentAlgorithm === 'SJF' ? 'bt-column' : '';
        
        let rowHTML = `
            <td class="process-cell">${process.pid}</td>
            <td class="${atClass}">${process.arrival_time}</td>
            <td class="${btClass}">${process.burst_time}</td>
            <td>${process.completion_time}</td>
            <td>${process.turnaround_time}</td>
            <td>${process.waiting_time}</td>
        `;
        
        // Añadir columnas específicas para Round Robin
        if (currentAlgorithm === 'RR') {
            const quantumUsed = process.quantum_used || 0;
            const ntat = process.normalized_turnaround_time || 0;
            rowHTML += `<td class="quantum-cell">${quantumUsed}</td>`;
            rowHTML += `<td class="ntat-cell">${ntat}</td>`;
        }
        
        row.innerHTML = rowHTML;
        tbody.appendChild(row);
    });
}

// Función para mostrar diagrama de Gantt
function displayGanttChart(ganttData) {
    const ganttChart = document.getElementById('gantt-chart');
    const ganttTimeline = document.getElementById('gantt-timeline');
    
    // Limpiar contenido previo
    ganttChart.innerHTML = '';
    ganttTimeline.innerHTML = '';
    
    // Calcular tiempo total
    const totalTime = Math.max(...ganttData.map(item => item.end));
    
    // Crear contenedor para indicadores de llegada
    const arrivalIndicators = document.createElement('div');
    arrivalIndicators.className = 'arrival-indicators';
    arrivalIndicators.style.cssText = `
        position: relative;
        height: 25px;
        margin-bottom: 5px;
        border-bottom: 2px solid #3498db;
        background: linear-gradient(to right, rgba(52, 152, 219, 0.1) 0%, rgba(52, 152, 219, 0.05) 100%);
    `;
    
    // Obtener información de llegada de procesos desde currentResults
    if (currentResults && currentResults.processes) {
        const processArrivalInfo = new Map();
        currentResults.processes.forEach(process => {
            processArrivalInfo.set(process.pid, {
                arrival_time: process.arrival_time,
                color: getProcessColor(process.pid)
            });
        });
        
        // Crear indicadores de llegada únicos
        const addedArrivals = new Set();
        processArrivalInfo.forEach((info, pid) => {
            const arrivalTime = info.arrival_time;
            const arrivalKey = `${arrivalTime}`;
            
            if (!addedArrivals.has(arrivalKey)) {
                addedArrivals.add(arrivalKey);
                
                // Obtener todos los procesos que llegan en este tiempo
                const processesAtTime = Array.from(processArrivalInfo.entries())
                    .filter(([p, i]) => i.arrival_time === arrivalTime)
                    .map(([p, i]) => p);
                
                const arrow = document.createElement('div');
                arrow.className = 'arrival-arrow';
                arrow.style.cssText = `
                    position: absolute;
                    left: ${(arrivalTime / totalTime) * 100}%;
                    top: -2px;
                    width: 0;
                    height: 0;
                    border-left: 8px solid transparent;
                    border-right: 8px solid transparent;
                    border-top: 12px solid #e74c3c;
                    transform: translateX(-50%);
                    z-index: 10;
                `;
                arrow.title = `Llegada en t=${arrivalTime}: ${processesAtTime.join(', ')}`;
                
                // Etiqueta con el número del proceso directamente en la flecha
                const processLabel = document.createElement('div');
                processLabel.className = 'process-number-label';
                processLabel.style.cssText = `
                    position: absolute;
                    left: ${(arrivalTime / totalTime) * 100}%;
                    top: -20px;
                    font-size: 11px;
                    font-weight: bold;
                    color: #e74c3c;
                    transform: translateX(-50%);
                    white-space: nowrap;
                    text-shadow: 1px 1px 2px rgba(255,255,255,0.9);
                    background: rgba(255,255,255,0.8);
                    padding: 1px 4px;
                    border-radius: 3px;
                    border: 1px solid #e74c3c;
                `;
                // Mostrar los números de proceso separados por coma si hay múltiples
                processLabel.textContent = processesAtTime.join(',');
                
                arrivalIndicators.appendChild(arrow);
                arrivalIndicators.appendChild(processLabel);
            }
        });
    }
    
    // Agregar indicadores de llegada al contenedor principal
    ganttChart.parentNode.insertBefore(arrivalIndicators, ganttChart);
    
    // Crear barras del diagrama de Gantt
    ganttData.forEach((item, index) => {
        const bar = document.createElement('div');
        bar.className = item.type === 'idle' ? 'gantt-bar gantt-idle' : 'gantt-bar gantt-process';
        
        // Calcular porcentaje de ancho
        const widthPercent = (item.duration / totalTime) * 100;
        bar.style.width = `${widthPercent}%`;
        
        // Contenido de la barra
        if (item.type === 'process') {
            bar.innerHTML = `
                <span class="gantt-label">${item.pid}</span>
                <span class="gantt-duration">${item.duration}</span>
            `;
            bar.style.backgroundColor = getProcessColor(item.pid);
        } else {
            bar.innerHTML = `<span class="gantt-label">Idle</span>`;
        }
        
        // Tooltip mejorado
        if (item.type === 'process' && currentResults && currentResults.processes) {
            const processInfo = currentResults.processes.find(p => p.pid === item.pid);
            const arrivalTime = processInfo ? processInfo.arrival_time : 'N/A';
            bar.title = `${item.pid}: ${item.start} - ${item.end} (${item.duration} unidades)\nLlegada: t=${arrivalTime}`;
        } else {
            bar.title = `${item.type === 'process' ? item.pid : 'Idle'}: ${item.start} - ${item.end} (${item.duration} unidades)`;
        }
        
        ganttChart.appendChild(bar);
    });
    
    // Crear timeline
    const timelineSteps = Math.min(totalTime + 1, 20); // Máximo 20 marcas
    const stepSize = totalTime / (timelineSteps - 1);
    
    for (let i = 0; i < timelineSteps; i++) {
        const timeValue = Math.round(i * stepSize);
        const timeMarker = document.createElement('div');
        timeMarker.className = 'timeline-marker';
        timeMarker.textContent = timeValue;
        timeMarker.style.left = `${(timeValue / totalTime) * 100}%`;
        ganttTimeline.appendChild(timeMarker);
    }
}

// Función para generar color único para cada proceso
function getProcessColor(pid) {
    const colors = [
        '#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6',
        '#1abc9c', '#34495e', '#e67e22', '#95a5a6', '#8e44ad'
    ];
    
    // Hash simple del PID para obtener color consistente
    let hash = 0;
    for (let i = 0; i < pid.length; i++) {
        hash = pid.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
}

// Función para ocultar resultados
function hideResults() {
    resultsSection.style.display = 'none';
    
    // También ocultar la sección de estadísticas
    const statisticsSection = document.getElementById('statistics-section');
    if (statisticsSection) {
        statisticsSection.style.display = 'none';
    }
}

// Función para actualizar la interfaz según el algoritmo
function updateAlgorithmInterface(algorithm) {
    const body = document.body;
    const fcfsInfo = document.getElementById('fcfs-info');
    const sjfInfo = document.getElementById('sjf-info');
    const rrInfo = document.getElementById('rr-info');
    
    // Remover clases previas
    body.classList.remove('sjf-mode', 'fcfs-mode', 'rr-mode');
    
    // Ocultar todas las secciones de información
    if (fcfsInfo) fcfsInfo.style.display = 'none';
    if (sjfInfo) sjfInfo.style.display = 'none';
    if (rrInfo) rrInfo.style.display = 'none';
    
    // Mostrar/ocultar control de quantum
    if (quantumControl) {
        if (algorithm === 'RR') {
            quantumControl.style.display = 'block';
        } else {
            quantumControl.style.display = 'none';
        }
    }
    
    // Aplicar configuración específica del algoritmo
    if (algorithm === 'SJF') {
        body.classList.add('sjf-mode');
        if (sjfInfo) sjfInfo.style.display = 'block';
        
        // Mostrar advertencia sobre reordenamiento
        showSJFWarning();
    } else if (algorithm === 'FCFS') {
        body.classList.add('fcfs-mode');
        if (fcfsInfo) fcfsInfo.style.display = 'block';
    } else if (algorithm === 'RR') {
        body.classList.add('rr-mode');
        if (rrInfo) rrInfo.style.display = 'block';
        
        // Mostrar información de Round Robin
        showRRInfo();
    }
}

// Función para mostrar advertencia de SJF
function showSJFWarning() {
    // Remover advertencia previa si existe
    const existingWarning = document.querySelector('.sjf-reorder-indicator');
    if (existingWarning) {
        existingWarning.remove();
    }
    
    // Crear nueva advertencia
    const warning = document.createElement('div');
    warning.className = 'sjf-reorder-indicator';
    warning.innerHTML = `
        <i class="fas fa-sort-amount-down"></i>
        <strong>Algoritmo SJF Activo:</strong> Los procesos se ordenarán por Burst Time (BT), 
        ignorando el Arrival Time (AT). Esto puede causar "starvation" en procesos largos.
    `;
    
    // Insertar antes de la sección de resultados
    const resultsSection = document.getElementById('results-section');
    resultsSection.parentNode.insertBefore(warning, resultsSection);
}

// Función para mostrar información de Round Robin
function showRRInfo() {
    // Remover información previa si existe
    const existingInfo = document.querySelector('.rr-info-indicator');
    if (existingInfo) {
        existingInfo.remove();
    }
    
    // Crear nueva información
    const info = document.createElement('div');
    info.className = 'rr-info-indicator';
    info.innerHTML = `
        <i class="fas fa-sync-alt"></i>
        <strong>Algoritmo Round Robin Activo:</strong> Los procesos se ejecutarán en turnos de ${currentQuantum} unidades. 
        Es preemptivo y equitativo. Ajusta el quantum para optimizar el rendimiento.
    `;
    
    // Insertar antes de la sección de resultados
    const resultsSection = document.getElementById('results-section');
    resultsSection.parentNode.insertBefore(info, resultsSection);
}

// Función para mostrar métricas (actualizada para SJF)
function displayMetrics(results) {
    document.getElementById('avg-waiting-time').textContent = 
        results.average_waiting_time.toFixed(2) + ' unidades';
    
    document.getElementById('avg-turnaround-time').textContent = 
        results.average_turnaround_time.toFixed(2) + ' unidades';
    
    // Mostrar información específica del algoritmo
    const analysisText = results.algorithm_analysis || results.convoy_effect_info || 'N/A';
    document.getElementById('convoy-effect').textContent = analysisText;
}

// Función para mostrar estadísticas detalladas
function displayStatistics(statistics) {
    const statisticsSection = document.getElementById('statistics-section');
    const statisticsTable = document.getElementById('statistics-table');
    
    if (!statisticsSection || !statisticsTable) return;
    
    const tbody = statisticsTable.querySelector('tbody');
    tbody.innerHTML = '';
    
    // Definir nombres amigables para las métricas
    const metricNames = {
        'arrival_time': 'Tiempo de Llegada (AT)',
        'burst_time': 'Tiempo de Ráfaga (BT)',
        'completion_time': 'Tiempo de Finalización (CT)',
        'turnaround_time': 'Tiempo de Turnaround (TT)',
        'waiting_time': 'Tiempo de Espera (WT)',
        'quantum_used': 'Quantum Usado (QU)',
        'normalized_turnaround_time': 'Tiempo Normalizado (NTAT)'
    };
    
    // Crear filas para cada métrica
    Object.entries(statistics).forEach(([metric, stats]) => {
        const row = document.createElement('tr');
        const metricDisplayName = metricNames[metric] || metric;
        
        row.innerHTML = `
            <td><strong>${metricDisplayName}</strong></td>
            <td>${stats.mean}</td>
            <td>${stats.std_dev}</td>
            <td>${stats.min}</td>
            <td>${stats.max}</td>
        `;
        tbody.appendChild(row);
    });
    
    // Mostrar la sección de estadísticas
    statisticsSection.style.display = 'block';
}

// Función para análisis específico de Round Robin
function showRRAnalysis(results) {
    // Obtener información de Round Robin del análisis
    const analysis = results.analysis || '';
    const contextSwitches = analysis.match(/(\d+) cambios de contexto/) ? 
                           analysis.match(/(\d+) cambios de contexto/)[1] : 'N/A';
    
    setTimeout(() => {
        showMessage(
            `⚙️ Round Robin: Quantum ${currentQuantum} | ${contextSwitches} cambios de contexto | ${analysis}`, 
            'info'
        );
    }, 1000);
}
