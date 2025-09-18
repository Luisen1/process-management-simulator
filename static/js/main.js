// Variables globales
let processes = [];
let currentResults = null;

// Elementos del DOM
const processForm = document.getElementById('process-form');
const scheduleBtn = document.getElementById('schedule-btn');
const resetBtn = document.getElementById('reset-btn');
const changeAlgorithmBtn = document.getElementById('change-algorithm-btn');
const algorithSelect = document.getElementById('algorithm-select');
const messagesDiv = document.getElementById('messages');
const addedProcessesDiv = document.getElementById('added-processes');
const resultsSection = document.getElementById('results-section');

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    loadCurrentState();
    
    processForm.addEventListener('submit', addProcess);
    scheduleBtn.addEventListener('click', scheduleProcesses);
    resetBtn.addEventListener('click', resetScheduler);
    changeAlgorithmBtn.addEventListener('click', changeAlgorithm);
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
    
    try {
        const response = await fetch('/change_algorithm', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ algorithm: selectedAlgorithm })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showMessage(result.message, 'success');
            document.getElementById('current-algorithm').textContent = selectedAlgorithm;
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

// Función para cargar estado actual
async function loadCurrentState() {
    try {
        const response = await fetch('/get_current_state');
        const state = await response.json();
        
        processes = state.processes || [];
        document.getElementById('current-algorithm').textContent = state.algorithm;
        algorithSelect.value = state.algorithm;
        
        updateProcessList();
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
    resultsSection.style.display = 'block';
    
    // Mostrar tabla de resultados
    displayResultsTable(results.processes);
    
    // Mostrar diagrama de Gantt
    displayGanttChart(results.gantt_chart);
    
    // Mostrar métricas
    displayMetrics(results);
    
    // Scroll a resultados
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

// Función para mostrar tabla de resultados
function displayResultsTable(processes) {
    const tbody = document.querySelector('#results-table tbody');
    tbody.innerHTML = '';
    
    processes.forEach(process => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="process-cell">${process.pid}</td>
            <td>${process.arrival_time}</td>
            <td>${process.burst_time}</td>
            <td>${process.completion_time}</td>
            <td>${process.turnaround_time}</td>
            <td>${process.waiting_time}</td>
        `;
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
        
        // Tooltip
        bar.title = `${item.type === 'process' ? item.pid : 'Idle'}: ${item.start} - ${item.end} (${item.duration} unidades)`;
        
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

// Función para mostrar métricas
function displayMetrics(results) {
    document.getElementById('avg-waiting-time').textContent = 
        results.average_waiting_time.toFixed(2) + ' unidades';
    
    document.getElementById('avg-turnaround-time').textContent = 
        results.average_turnaround_time.toFixed(2) + ' unidades';
    
    document.getElementById('convoy-effect').textContent = 
        results.convoy_effect_info;
}

// Función para ocultar resultados
function hideResults() {
    resultsSection.style.display = 'none';
}
