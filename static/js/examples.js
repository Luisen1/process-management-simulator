// Datos de ejemplo que muestran claramente la diferencia entre algoritmos
const exampleData = {
    fcfs_vs_sjf: {
        name: "FCFS vs SJF - Diferencia Clara",
        description: "Procesos que muestran claramente cómo SJF optimiza el tiempo de espera",
        processes: [
            { pid: "P1", arrival_time: 0, burst_time: 8 },
            { pid: "P2", arrival_time: 1, burst_time: 2 },
            { pid: "P3", arrival_time: 2, burst_time: 1 },
            { pid: "P4", arrival_time: 3, burst_time: 4 }
        ],
        expected_order: {
            FCFS: ["P1", "P2", "P3", "P4"],
            SJF: ["P3", "P2", "P4", "P1"]
        }
    },
    convoy_effect: {
        name: "Efecto Convoy",
        description: "Muestra cómo un proceso largo puede causar el efecto convoy en FCFS",
        processes: [
            { pid: "P1", arrival_time: 0, burst_time: 20 },
            { pid: "P2", arrival_time: 1, burst_time: 1 },
            { pid: "P3", arrival_time: 2, burst_time: 1 },
            { pid: "P4", arrival_time: 3, burst_time: 1 }
        ],
        expected_order: {
            FCFS: ["P1", "P2", "P3", "P4"],
            SJF: ["P2", "P3", "P4", "P1"]
        }
    },
    your_reference: {
        name: "Valores de Referencia",
        description: "Los valores exactos de tu tabla de referencia",
        processes: [
            { pid: "P1", arrival_time: 2, burst_time: 6 },
            { pid: "P2", arrival_time: 0, burst_time: 2 },
            { pid: "P3", arrival_time: 3, burst_time: 8 },
            { pid: "P4", arrival_time: 1, burst_time: 3 }
        ],
        expected_order: {
            FCFS: ["P2", "P4", "P1", "P3"],
            SJF: ["P2", "P4", "P1", "P3"]
        }
    }
};

// Función para cargar datos de ejemplo
function loadExampleData(exampleKey) {
    const example = exampleData[exampleKey];
    if (!example) return;
    
    // Confirmar antes de cargar
    if (processes.length > 0) {
        if (!confirm(`¿Desea reemplazar los ${processes.length} procesos actuales con el ejemplo "${example.name}"?`)) {
            return;
        }
    }
    
    // Limpiar procesos actuales
    resetScheduler().then(() => {
        // Mostrar información del ejemplo
        showMessage(`📖 Cargando ejemplo: ${example.name} - ${example.description}`, 'info');
        
        // Agregar procesos del ejemplo
        example.processes.forEach(async (proc, index) => {
            setTimeout(async () => {
                document.getElementById('pid').value = proc.pid;
                document.getElementById('arrival-time').value = proc.arrival_time;
                document.getElementById('burst-time').value = proc.burst_time;
                
                // Simular envío del formulario
                await addProcessInternal(proc.pid, proc.arrival_time, proc.burst_time);
                
                // Si es el último proceso, mostrar información adicional
                if (index === example.processes.length - 1) {
                    setTimeout(() => {
                        const currentAlg = document.getElementById('current-algorithm').textContent;
                        const expectedOrder = example.expected_order[currentAlg];
                        if (expectedOrder) {
                            showMessage(
                                `🎯 Orden esperado para ${currentAlg}: ${expectedOrder.join(' → ')}`, 
                                'info'
                            );
                        }
                    }, 500);
                }
            }, index * 300); // Delay entre procesos para mejor visualización
        });
    });
}

// Función auxiliar para agregar proceso sin usar el formulario
async function addProcessInternal(pid, arrival_time, burst_time) {
    try {
        const response = await fetch('/add_process', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                pid: pid,
                arrival_time: arrival_time,
                burst_time: burst_time
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            processes.push({ pid, arrival_time, burst_time });
            updateProcessList();
        } else {
            showMessage(result.message, 'error');
        }
    } catch (error) {
        showMessage(`Error al agregar proceso ${pid}: ${error.message}`, 'error');
    }
}

// Crear botones de ejemplo cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    createExampleButtons();
});

function createExampleButtons() {
    // Buscar o crear contenedor para ejemplos
    let examplesContainer = document.getElementById('examples-container');
    if (!examplesContainer) {
        examplesContainer = document.createElement('div');
        examplesContainer.id = 'examples-container';
        examplesContainer.className = 'examples-section';
        
        // Insertar después del selector de algoritmo
        const algorithmSection = document.querySelector('.algorithm-selector');
        algorithmSection.parentNode.insertBefore(examplesContainer, algorithmSection.nextSibling);
    }
    
    examplesContainer.innerHTML = `
        <div class="examples-header">
            <h3><i class="fas fa-book"></i> Ejemplos Predefinidos</h3>
            <p>Carga ejemplos que muestran claramente las diferencias entre algoritmos</p>
        </div>
        <div class="examples-buttons">
            <button onclick="loadExampleData('fcfs_vs_sjf')" class="example-btn btn-primary">
                <i class="fas fa-balance-scale"></i> FCFS vs SJF
            </button>
            <button onclick="loadExampleData('convoy_effect')" class="example-btn btn-warning">
                <i class="fas fa-truck"></i> Efecto Convoy
            </button>
            <button onclick="loadExampleData('your_reference')" class="example-btn btn-success">
                <i class="fas fa-table"></i> Valores de Referencia
            </button>
        </div>
    `;
}