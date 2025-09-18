from flask import Flask, render_template, request, jsonify
from process import SchedulerFactory
import json

app = Flask(__name__)

# Variable global para mantener el estado del scheduler
current_scheduler = None
current_algorithm = 'FCFS'
current_quantum = 3  # Quantum por defecto para Round Robin

@app.route('/')
def index():
    """Página principal de la aplicación."""
    return render_template('index.html', current_algorithm=current_algorithm)

@app.route('/add_process', methods=['POST'])
def add_process():
    """Endpoint para añadir un proceso."""
    global current_scheduler
    
    try:
        data = request.json
        pid = data.get('pid')
        arrival_time = int(data.get('arrival_time'))
        burst_time = int(data.get('burst_time'))
        
        # Validaciones
        if not pid or arrival_time < 0 or burst_time <= 0:
            return jsonify({
                'success': False, 
                'message': 'Datos inválidos. Verifique que todos los campos sean correctos.'
            })
        
        # Crear scheduler si no existe
        if current_scheduler is None:
            if current_algorithm == 'RR':
                current_scheduler = SchedulerFactory.create_scheduler(current_algorithm, quantum=current_quantum)
            else:
                current_scheduler = SchedulerFactory.create_scheduler(current_algorithm)
        
        # Verificar que el PID no exista ya
        existing_pids = [p.pid for p in current_scheduler.processes]
        if pid in existing_pids:
            return jsonify({
                'success': False, 
                'message': f'El proceso {pid} ya existe. Use un ID diferente.'
            })
        
        # Añadir proceso
        current_scheduler.add_process(pid, arrival_time, burst_time)
        
        return jsonify({
            'success': True, 
            'message': f'Proceso {pid} añadido correctamente.',
            'process_count': len(current_scheduler.processes)
        })
        
    except Exception as e:
        return jsonify({
            'success': False, 
            'message': f'Error al añadir proceso: {str(e)}'
        })

@app.route('/schedule', methods=['POST'])
def schedule_processes():
    """Endpoint para ejecutar el algoritmo de scheduling."""
    global current_scheduler
    
    try:
        if current_scheduler is None or not current_scheduler.processes:
            return jsonify({
                'success': False, 
                'message': 'No hay procesos para programar. Añada al menos un proceso.'
            })
        
        # Ejecutar el algoritmo
        current_scheduler.schedule()
        
        # Obtener resultados
        results = current_scheduler.get_results()
        
        return jsonify({
            'success': True,
            'results': results,
            'message': f'Scheduling completado usando {current_algorithm}'
        })
        
    except Exception as e:
        return jsonify({
            'success': False, 
            'message': f'Error al ejecutar scheduling: {str(e)}'
        })

@app.route('/reset', methods=['POST'])
def reset_scheduler():
    """Endpoint para reiniciar el scheduler."""
    global current_scheduler
    
    try:
        if current_scheduler:
            current_scheduler.reset()
        current_scheduler = None
        
        return jsonify({
            'success': True, 
            'message': 'Scheduler reiniciado correctamente.'
        })
        
    except Exception as e:
        return jsonify({
            'success': False, 
            'message': f'Error al reiniciar: {str(e)}'
        })

@app.route('/change_algorithm', methods=['POST'])
def change_algorithm():
    """Endpoint para cambiar el algoritmo de scheduling."""
    global current_algorithm, current_scheduler, current_quantum
    
    try:
        data = request.json
        new_algorithm = data.get('algorithm', 'FCFS').upper()
        quantum = data.get('quantum', current_quantum)  # Obtener quantum si se proporciona
        
        # Verificar si el algoritmo es soportado
        supported_algorithms = ['FCFS', 'SJF', 'RR']  # Round Robin añadido
        if new_algorithm not in supported_algorithms:
            return jsonify({
                'success': False, 
                'message': f'Algoritmo {new_algorithm} no soportado. Algoritmos disponibles: {", ".join(supported_algorithms)}'
            })
        
        # Validar quantum para Round Robin
        if new_algorithm == 'RR':
            if not isinstance(quantum, int) or quantum <= 0:
                return jsonify({
                    'success': False,
                    'message': 'Para Round Robin, el quantum debe ser un entero positivo.'
                })
            current_quantum = quantum
        
        current_algorithm = new_algorithm
        
        # Reiniciar scheduler si existe
        if current_scheduler:
            current_scheduler.reset()
        current_scheduler = None
        
        return jsonify({
            'success': True, 
            'message': f'Algoritmo cambiado a {current_algorithm}.' + 
                      (f' Quantum configurado a {current_quantum}.' if new_algorithm == 'RR' else '') +
                      ' Scheduler reiniciado.'
        })
        
    except Exception as e:
        return jsonify({
            'success': False, 
            'message': f'Error al cambiar algoritmo: {str(e)}'
        })

@app.route('/get_current_state')
def get_current_state():
    """Endpoint para obtener el estado actual del scheduler."""
    global current_scheduler, current_algorithm, current_quantum
    
    try:
        state = {
            'algorithm': current_algorithm,
            'quantum': current_quantum if current_algorithm == 'RR' else None,
            'process_count': len(current_scheduler.processes) if current_scheduler else 0,
            'processes': []
        }
        
        if current_scheduler and current_scheduler.processes:
            state['processes'] = [
                {
                    'pid': p.pid,
                    'arrival_time': p.arrival_time,
                    'burst_time': p.burst_time
                } for p in current_scheduler.processes
            ]
        
        return jsonify(state)
        
    except Exception as e:
        return jsonify({
            'algorithm': current_algorithm,
            'quantum': current_quantum if current_algorithm == 'RR' else None,
            'process_count': 0,
            'processes': [],
            'error': str(e)
        })

@app.route('/set_quantum', methods=['POST'])
def set_quantum():
    """Endpoint para configurar el quantum de Round Robin."""
    global current_quantum, current_scheduler
    
    try:
        data = request.json
        quantum = int(data.get('quantum', 3))
        
        # Validar quantum
        if quantum <= 0 or quantum > 20:
            return jsonify({
                'success': False,
                'message': 'El quantum debe estar entre 1 y 20'
            })
        
        current_quantum = quantum
        
        # Si hay un scheduler RR activo, reiniciarlo con el nuevo quantum
        if current_scheduler and current_algorithm == 'RR':
            current_scheduler.reset()
            current_scheduler = SchedulerFactory.create_scheduler('RR', quantum=current_quantum)
        
        return jsonify({
            'success': True,
            'message': f'Quantum configurado a {quantum} unidades. Scheduler reiniciado.',
            'quantum': quantum
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error al configurar quantum: {str(e)}'
        })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
