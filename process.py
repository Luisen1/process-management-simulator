class Process:
    """Clase que representa un proceso en el sistema."""
    
    def __init__(self, pid, arrival_time, burst_time):
        self.pid = pid
        self.arrival_time = arrival_time
        self.burst_time = burst_time
        self.remaining_time = burst_time  # Para Round Robin
        self.completion_time = 0
        self.turnaround_time = 0
        self.waiting_time = 0
        self.start_time = 0
        self.quantum_used = 0  # Número total de quantums utilizados
        
    def calculate_times(self, completion_time):
        """Calcula los tiempos CT, TT y WT del proceso."""
        self.completion_time = completion_time
        self.turnaround_time = self.completion_time - self.arrival_time
        self.waiting_time = self.turnaround_time - self.burst_time
        
    def calculate_times_sjf(self, completion_time):
        """Calcula los tiempos para SJF donde TT = CT."""
        self.completion_time = completion_time
        # En SJF según tu tabla, TT parece ser igual a CT
        self.turnaround_time = self.completion_time  
        # WT es TT - BT 
        self.waiting_time = self.turnaround_time - self.burst_time
        
    def calculate_times_rr(self, completion_time):
        """Calcula los tiempos para Round Robin."""
        self.completion_time = completion_time
        self.turnaround_time = self.completion_time - self.arrival_time
        self.waiting_time = self.turnaround_time - self.burst_time
        # Calcular NTAT (Normalized Turnaround Time) = TAT/BT
        self.normalized_turnaround_time = round(self.turnaround_time / self.burst_time, 2) if self.burst_time > 0 else 0
        
    def to_dict(self):
        """Convierte el proceso a diccionario para JSON."""
        return {
            'pid': self.pid,
            'arrival_time': self.arrival_time,
            'burst_time': self.burst_time,
            'completion_time': self.completion_time,
            'turnaround_time': self.turnaround_time,
            'waiting_time': self.waiting_time,
            'start_time': self.start_time,
            'quantum_used': getattr(self, 'quantum_used', 0),  # Para compatibilidad
            'normalized_turnaround_time': getattr(self, 'normalized_turnaround_time', 0)  # NTAT
        }


class FCFSScheduler:
    """Implementación del algoritmo First-Come, First-Served (FCFS)."""
    
    def __init__(self):
        self.processes = []
        self.execution_order = []
        self.gantt_chart = []
        
    def add_process(self, pid, arrival_time, burst_time):
        """Añade un proceso a la lista."""
        process = Process(pid, arrival_time, burst_time)
        self.processes.append(process)
        
    def schedule(self):
        """Ejecuta el algoritmo FCFS y calcula todos los tiempos."""
        if not self.processes:
            return
            
        # Ordenar procesos por tiempo de llegada (FCFS)
        self.processes.sort(key=lambda p: p.arrival_time)
        
        current_time = 0
        self.gantt_chart = []
        
        for process in self.processes:
            # Si el proceso llega después del tiempo actual, esperamos
            if process.arrival_time > current_time:
                # Añadir tiempo idle al diagrama de Gantt
                if current_time < process.arrival_time:
                    self.gantt_chart.append({
                        'type': 'idle',
                        'start': current_time,
                        'end': process.arrival_time,
                        'duration': process.arrival_time - current_time
                    })
                current_time = process.arrival_time
            
            # Tiempo de inicio del proceso
            process.start_time = current_time
            
            # Tiempo de finalización
            process.completion_time = current_time + process.burst_time
            
            # Calcular tiempos
            process.calculate_times(process.completion_time)
            
            # Añadir al diagrama de Gantt
            self.gantt_chart.append({
                'type': 'process',
                'pid': process.pid,
                'start': current_time,
                'end': process.completion_time,
                'duration': process.burst_time
            })
            
            # Actualizar tiempo actual
            current_time = process.completion_time
            
        # Ordenar por orden de ejecución para mostrar
        self.execution_order = self.processes.copy()
        
    def get_results(self):
        """Retorna los resultados del scheduling."""
        return {
            'processes': [p.to_dict() for p in self.processes],
            'gantt_chart': self.gantt_chart,
            'average_waiting_time': self.calculate_average_waiting_time(),
            'average_turnaround_time': self.calculate_average_turnaround_time(),
            'convoy_effect_info': self.analyze_convoy_effect(),
            'statistics': self.calculate_statistics()
        }
        
    def calculate_average_waiting_time(self):
        """Calcula el tiempo promedio de espera."""
        if not self.processes:
            return 0
        total_waiting_time = sum(p.waiting_time for p in self.processes)
        return total_waiting_time / len(self.processes)
        
    def calculate_average_turnaround_time(self):
        """Calcula el tiempo promedio de turnaround."""
        if not self.processes:
            return 0
        total_turnaround_time = sum(p.turnaround_time for p in self.processes)
        return total_turnaround_time / len(self.processes)
        
    def analyze_convoy_effect(self):
        """Analiza el efecto convoy en el scheduling FCFS."""
        if len(self.processes) < 2:
            return "No hay suficientes procesos para analizar el efecto convoy."
            
        long_processes = [p for p in self.processes if p.burst_time > 10]
        if long_processes:
            return f"Convoy Effect detectado: {len(long_processes)} proceso(s) largo(s) pueden causar retrasos significativos."
        else:
            return "No se detectó efecto convoy significativo."
            
    def calculate_statistics(self):
        """
        Calcula estadísticas completas (media y desviación estándar).
        
        Returns:
            dict: Diccionario con medias y desviaciones estándar de todas las métricas
        """
        if not self.processes:
            return {}
        
        import math
        
        # Extraer todas las métricas
        arrival_times = [p.arrival_time for p in self.processes]
        burst_times = [p.burst_time for p in self.processes]
        completion_times = [p.completion_time for p in self.processes]
        turnaround_times = [p.turnaround_time for p in self.processes]
        waiting_times = [p.waiting_time for p in self.processes]
        
        def calculate_mean_std(values):
            """Calcula media y desviación estándar de una lista de valores."""
            if not values:
                return 0, 0
            
            mean = sum(values) / len(values)
            
            if len(values) == 1:
                return mean, 0
            
            variance = sum((x - mean) ** 2 for x in values) / len(values)
            std_dev = math.sqrt(variance)
            
            return mean, std_dev
        
        # Calcular estadísticas para cada métrica
        stats = {}
        metrics = {
            'arrival_time': arrival_times,
            'burst_time': burst_times,
            'completion_time': completion_times,
            'turnaround_time': turnaround_times,
            'waiting_time': waiting_times
        }
        
        for metric_name, values in metrics.items():
            mean, std_dev = calculate_mean_std(values)
            stats[metric_name] = {
                'mean': round(mean, 2),
                'std_dev': round(std_dev, 2),
                'min': min(values) if values else 0,
                'max': max(values) if values else 0
            }
        
        return stats
            
    def reset(self):
        """Reinicia el scheduler."""
        self.processes = []
        self.execution_order = []
        self.gantt_chart = []


class SJFScheduler:
    """Implementación del algoritmo Shortest Job First (SJF)."""
    
    def __init__(self):
        self.processes = []
        self.execution_order = []
        self.gantt_chart = []
        
    def add_process(self, pid, arrival_time, burst_time):
        """Añade un proceso a la lista."""
        process = Process(pid, arrival_time, burst_time)
        self.processes.append(process)
        
    def schedule(self):
        """Ejecuta el algoritmo SJF y calcula todos los tiempos."""
        if not self.processes:
            return
            
        # SJF ordena por Burst Time (tiempo de ráfaga) independientemente del AT
        # En caso de empate en BT, ordenar por PID para consistencia
        self.processes.sort(key=lambda p: (p.burst_time, p.pid))
        
        current_time = 0
        self.gantt_chart = []
        
        for i, process in enumerate(self.processes):
            # En SJF puro, no consideramos el arrival time para el ordenamiento
            # pero sí lo mostramos en la tabla para evidenciar la "injusticia"
            
            # Tiempo de inicio del proceso (inmediatamente después del anterior)
            process.start_time = current_time
            
            # Tiempo de finalización
            process.completion_time = current_time + process.burst_time
            
            # Calcular tiempos con método específico para SJF
            process.calculate_times_sjf(process.completion_time)
            
            # Añadir al diagrama de Gantt
            self.gantt_chart.append({
                'type': 'process',
                'pid': process.pid,
                'start': current_time,
                'end': process.completion_time,
                'duration': process.burst_time,
                'original_arrival_time': process.arrival_time,  # Para mostrar la injusticia
                'order': i + 1  # Orden de ejecución en SJF
            })
            
            # Actualizar tiempo actual
            current_time = process.completion_time
            
        # Ordenar por orden de ejecución para mostrar
        self.execution_order = self.processes.copy()
        
    def get_results(self):
        """Retorna los resultados del scheduling."""
        return {
            'processes': [p.to_dict() for p in self.processes],
            'gantt_chart': self.gantt_chart,
            'average_waiting_time': self.calculate_average_waiting_time(),
            'average_turnaround_time': self.calculate_average_turnaround_time(),
            'algorithm_analysis': self.analyze_sjf_characteristics(),
            'statistics': self.calculate_statistics()
        }
        
    def calculate_average_waiting_time(self):
        """Calcula el tiempo promedio de espera."""
        if not self.processes:
            return 0
        total_waiting_time = sum(p.waiting_time for p in self.processes)
        return total_waiting_time / len(self.processes)
        
    def calculate_average_turnaround_time(self):
        """Calcula el tiempo promedio de turnaround."""
        if not self.processes:
            return 0
        total_turnaround_time = sum(p.turnaround_time for p in self.processes)
        return total_turnaround_time / len(self.processes)
        
    def analyze_sjf_characteristics(self):
        """Analiza las características específicas del algoritmo SJF."""
        if len(self.processes) < 2:
            return "No hay suficientes procesos para analizar las características de SJF."
        
        # Crear orden original (como fueron añadidos) vs orden de ejecución SJF
        original_order = sorted(self.processes, key=lambda p: p.pid)  # Por ID para mostrar orden natural
        execution_order = self.processes  # Ya ordenado por burst_time
        
        analysis = []
        
        # Mostrar el reordenamiento por BT
        analysis.append(f"🔄 REORDENAMIENTO SJF:")
        analysis.append(f"📝 Procesos por BT: {[(p.pid, f'BT={p.burst_time}') for p in execution_order]}")
        
        # Verificar si el orden cambió respecto al orden natural
        natural_order_pids = [p.pid for p in original_order]
        execution_order_pids = [p.pid for p in execution_order]
        
        if natural_order_pids != execution_order_pids:
            analysis.append(f"⚠️ Orden natural: {natural_order_pids}")
            analysis.append(f"⚡ Orden SJF: {execution_order_pids}")
        
        # Identificar procesos que fueron "saltados"
        for i, process in enumerate(execution_order):
            if process.arrival_time > 0:  # Si llegó después del tiempo 0
                earlier_processes = [p for p in self.processes if p.arrival_time < process.arrival_time and p.burst_time > process.burst_time]
                if earlier_processes:
                    earlier_pids = [p.pid for p in earlier_processes]
                    analysis.append(f"🏃‍♂️ {process.pid} (BT={process.burst_time}) ejecutó antes que {earlier_pids} (llegaron primero)")
        
        # Analizar ventajas de SJF
        analysis.append("✅ Minimiza tiempo promedio de espera")
        analysis.append("⚠️ Puede causar starvation en procesos largos")
        
        return " | ".join(analysis)
        
    def calculate_statistics(self):
        """
        Calcula estadísticas completas (media y desviación estándar).
        
        Returns:
            dict: Diccionario con medias y desviaciones estándar de todas las métricas
        """
        if not self.processes:
            return {}
        
        import math
        
        # Extraer todas las métricas
        arrival_times = [p.arrival_time for p in self.processes]
        burst_times = [p.burst_time for p in self.processes]
        completion_times = [p.completion_time for p in self.processes]
        turnaround_times = [p.turnaround_time for p in self.processes]
        waiting_times = [p.waiting_time for p in self.processes]
        
        def calculate_mean_std(values):
            """Calcula media y desviación estándar de una lista de valores."""
            if not values:
                return 0, 0
            
            mean = sum(values) / len(values)
            
            if len(values) == 1:
                return mean, 0
            
            variance = sum((x - mean) ** 2 for x in values) / len(values)
            std_dev = math.sqrt(variance)
            
            return mean, std_dev
        
        # Calcular estadísticas para cada métrica
        stats = {}
        metrics = {
            'arrival_time': arrival_times,
            'burst_time': burst_times,
            'completion_time': completion_times,
            'turnaround_time': turnaround_times,
            'waiting_time': waiting_times
        }
        
        for metric_name, values in metrics.items():
            mean, std_dev = calculate_mean_std(values)
            stats[metric_name] = {
                'mean': round(mean, 2),
                'std_dev': round(std_dev, 2),
                'min': min(values) if values else 0,
                'max': max(values) if values else 0
            }
        
        return stats
        
    def reset(self):
        """Reinicia el scheduler."""
        self.processes = []
        self.execution_order = []
        self.gantt_chart = []


class SchedulerFactory:
    """Factory para crear diferentes tipos de schedulers."""
    
    @staticmethod
    def create_scheduler(algorithm_type, quantum=None):
        """Crea un scheduler basado en el tipo de algoritmo."""
        if algorithm_type.upper() == 'FCFS':
            return FCFSScheduler()
        elif algorithm_type.upper() == 'SJF':
            return SJFScheduler()
        elif algorithm_type.upper() == 'RR':
            return RoundRobinScheduler(quantum)
        else:
            raise ValueError(f"Algoritmo {algorithm_type} no soportado aún.")


class RoundRobinScheduler:
    """
    Implementación del algoritmo Round Robin (RR) con quantum variable.
    
    Round Robin es un algoritmo preemptivo que asigna a cada proceso un quantum
    (tiempo fijo) para ejecutarse. Si el proceso no termina en su quantum,
    es interrumpido y enviado al final de la cola.
    
    Características:
    - Preemptivo: Los procesos pueden ser interrumpidos
    - Justo: Todos los procesos reciben tiempo de CPU por igual
    - Quantum variable: El usuario puede configurar el quantum
    - Context Switching: Cambios frecuentes entre procesos
    """
    
    def __init__(self, quantum=4):
        """
        Inicializa el scheduler Round Robin.
        
        Args:
            quantum (int): Tiempo de quantum para cada proceso (por defecto 4)
        """
        self.processes = []
        self.execution_order = []
        self.gantt_chart = []
        self.quantum = quantum if quantum and quantum > 0 else 4
        
    def add_process(self, pid, arrival_time, burst_time):
        """Añade un proceso a la lista."""
        process = Process(pid, arrival_time, burst_time)
        self.processes.append(process)
        
    def schedule(self):
        """
        Ejecuta el algoritmo Round Robin.
        
        El algoritmo funciona de la siguiente manera:
        1. Los procesos se ordenan por tiempo de llegada
        2. Se utiliza una cola circular (Ready Queue)
        3. Cada proceso ejecuta por máximo 'quantum' unidades
        4. Si el proceso no termina, va al final de la cola
        5. Se continúa hasta que todos los procesos terminen
        """
        if not self.processes:
            return
            
        # Ordenar procesos por tiempo de llegada
        self.processes.sort(key=lambda p: (p.arrival_time, p.pid))
        
        # Cola de procesos listos
        ready_queue = []
        completed_processes = []
        current_time = 0
        self.gantt_chart = []
        
        # Índice para rastrear procesos que aún no han llegado
        process_index = 0
        
        # Agregar procesos que llegan en tiempo 0
        while process_index < len(self.processes) and self.processes[process_index].arrival_time <= current_time:
            ready_queue.append(self.processes[process_index])
            process_index += 1
        
        while ready_queue or process_index < len(self.processes):
            if not ready_queue:
                # No hay procesos listos, avanzar tiempo hasta el próximo proceso
                next_arrival = self.processes[process_index].arrival_time
                if next_arrival > current_time:
                    # Añadir tiempo idle al diagrama de Gantt
                    self.gantt_chart.append({
                        'type': 'idle',
                        'start': current_time,
                        'end': next_arrival,
                        'duration': next_arrival - current_time
                    })
                    current_time = next_arrival
                
                # Agregar procesos que llegan en este momento
                while process_index < len(self.processes) and self.processes[process_index].arrival_time <= current_time:
                    ready_queue.append(self.processes[process_index])
                    process_index += 1
                continue
            
            # Tomar el primer proceso de la cola
            current_process = ready_queue.pop(0)
            
            # Marcar tiempo de inicio si es la primera vez que ejecuta
            if current_process.remaining_time == current_process.burst_time:
                current_process.start_time = current_time
            
            # Calcular tiempo de ejecución (mínimo entre quantum y tiempo restante)
            execution_time = min(self.quantum, current_process.remaining_time)
            
            # Actualizar tiempo de ejecución
            current_process.remaining_time -= execution_time
            current_process.quantum_used += 1  # Incrementar quantums utilizados
            
            # Añadir al diagrama de Gantt
            self.gantt_chart.append({
                'type': 'process',
                'pid': current_process.pid,
                'start': current_time,
                'end': current_time + execution_time,
                'duration': execution_time,
                'quantum_number': current_process.quantum_used,
                'remaining_time': current_process.remaining_time
            })
            
            # Avanzar tiempo actual
            current_time += execution_time
            
            # Agregar nuevos procesos que llegaron durante la ejecución
            while process_index < len(self.processes) and self.processes[process_index].arrival_time <= current_time:
                ready_queue.append(self.processes[process_index])
                process_index += 1
            
            # Verificar si el proceso terminó
            if current_process.remaining_time == 0:
                # Proceso completado
                current_process.calculate_times_rr(current_time)
                completed_processes.append(current_process)
            else:
                # Proceso no terminado, regresa al final de la cola
                ready_queue.append(current_process)
        
        # Reordenar procesos según el orden original para mostrar resultados
        process_dict = {p.pid: p for p in self.processes}
        completed_dict = {p.pid: p for p in completed_processes}
        
        # Actualizar procesos originales con los datos calculados
        for process in self.processes:
            if process.pid in completed_dict:
                completed = completed_dict[process.pid]
                process.completion_time = completed.completion_time
                process.turnaround_time = completed.turnaround_time
                process.waiting_time = completed.waiting_time
                process.start_time = completed.start_time
                process.quantum_used = completed.quantum_used
        
        self.execution_order = self.processes.copy()
        
    def get_results(self):
        """Retorna los resultados del scheduling con estadísticas."""
        results = {
            'processes': [p.to_dict() for p in self.processes],
            'gantt_chart': self.gantt_chart,
            'average_waiting_time': self.calculate_average_waiting_time(),
            'average_turnaround_time': self.calculate_average_turnaround_time(),
            'algorithm_analysis': self.analyze_round_robin(),
            'quantum': self.quantum,
            'statistics': self.calculate_statistics()
        }
        return results
        
    def calculate_average_waiting_time(self):
        """Calcula el tiempo promedio de espera."""
        if not self.processes:
            return 0
        total_waiting_time = sum(p.waiting_time for p in self.processes)
        return total_waiting_time / len(self.processes)
        
    def calculate_average_turnaround_time(self):
        """Calcula el tiempo promedio de turnaround."""
        if not self.processes:
            return 0
        total_turnaround_time = sum(p.turnaround_time for p in self.processes)
        return total_turnaround_time / len(self.processes)
        
    def calculate_statistics(self):
        """
        Calcula estadísticas completas (media y desviación estándar).
        
        Returns:
            dict: Diccionario con medias y desviaciones estándar de todas las métricas
        """
        if not self.processes:
            return {}
        
        import math
        
        # Extraer todas las métricas
        arrival_times = [p.arrival_time for p in self.processes]
        burst_times = [p.burst_time for p in self.processes]
        completion_times = [p.completion_time for p in self.processes]
        turnaround_times = [p.turnaround_time for p in self.processes]
        waiting_times = [p.waiting_time for p in self.processes]
        quantum_used = [p.quantum_used for p in self.processes]
        normalized_turnaround_times = [getattr(p, 'normalized_turnaround_time', 0) for p in self.processes]
        
        def calculate_mean_std(values):
            """Calcula media y desviación estándar de una lista de valores."""
            if not values:
                return 0, 0
            
            mean = sum(values) / len(values)
            
            if len(values) == 1:
                return mean, 0
            
            variance = sum((x - mean) ** 2 for x in values) / len(values)
            std_dev = math.sqrt(variance)
            
            return mean, std_dev
        
        # Calcular estadísticas para cada métrica
        stats = {}
        metrics = {
            'arrival_time': arrival_times,
            'burst_time': burst_times,
            'completion_time': completion_times,
            'turnaround_time': turnaround_times,
            'waiting_time': waiting_times,
            'quantum_used': quantum_used,
            'normalized_turnaround_time': normalized_turnaround_times
        }
        
        for metric_name, values in metrics.items():
            mean, std_dev = calculate_mean_std(values)
            stats[metric_name] = {
                'mean': round(mean, 2),
                'std_dev': round(std_dev, 2),
                'min': min(values) if values else 0,
                'max': max(values) if values else 0
            }
        
        return stats
        
    def analyze_round_robin(self):
        """Analiza las características específicas del algoritmo Round Robin."""
        if not self.processes:
            return "No hay procesos para analizar."
        
        analysis = []
        
        # Analizar quantum efficiency
        total_quantum_used = sum(p.quantum_used for p in self.processes)
        total_execution_time = sum(p.burst_time for p in self.processes)
        
        # Context switches (cambios de contexto)
        context_switches = len([g for g in self.gantt_chart if g['type'] == 'process']) - len(self.processes)
        
        analysis.append(f"Quantum={self.quantum} unidades")
        analysis.append(f"Total quantums utilizados: {total_quantum_used}")
        analysis.append(f"Context switches: {context_switches}")
        
        # Analizar eficiencia del quantum
        if self.quantum >= max(p.burst_time for p in self.processes):
            analysis.append("⚠️ Quantum muy grande - comportamiento similar a FCFS")
        elif self.quantum == 1:
            analysis.append("⚠️ Quantum muy pequeño - muchos context switches")
        else:
            analysis.append("✅ Quantum balanceado - buen comportamiento Round Robin")
            
        return " | ".join(analysis)
        
    def reset(self):
        """Reinicia el scheduler."""
        self.processes = []
        self.execution_order = []
        self.gantt_chart = []
