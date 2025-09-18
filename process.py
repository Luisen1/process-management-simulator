class Process:
    """Clase que representa un proceso en el sistema."""
    
    def __init__(self, pid, arrival_time, burst_time):
        self.pid = pid
        self.arrival_time = arrival_time
        self.burst_time = burst_time
        self.completion_time = 0
        self.turnaround_time = 0
        self.waiting_time = 0
        self.start_time = 0
        
    def calculate_times(self, completion_time):
        """Calcula los tiempos CT, TT y WT del proceso."""
        self.completion_time = completion_time
        self.turnaround_time = self.completion_time - self.arrival_time
        self.waiting_time = self.turnaround_time - self.burst_time
        
    def to_dict(self):
        """Convierte el proceso a diccionario para JSON."""
        return {
            'pid': self.pid,
            'arrival_time': self.arrival_time,
            'burst_time': self.burst_time,
            'completion_time': self.completion_time,
            'turnaround_time': self.turnaround_time,
            'waiting_time': self.waiting_time,
            'start_time': self.start_time
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
            'convoy_effect_info': self.analyze_convoy_effect()
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
            
    def reset(self):
        """Reinicia el scheduler."""
        self.processes = []
        self.execution_order = []
        self.gantt_chart = []


class SchedulerFactory:
    """Factory para crear diferentes tipos de schedulers."""
    
    @staticmethod
    def create_scheduler(algorithm_type):
        """Crea un scheduler basado en el tipo de algoritmo."""
        if algorithm_type.upper() == 'FCFS':
            return FCFSScheduler()
        else:
            raise ValueError(f"Algoritmo {algorithm_type} no soportado aún.")
