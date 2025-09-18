# Simulador de Planificación de Procesos

Una aplicación web desarrollada en Flask para simular y visualizar algoritmos de planificación de procesos del sistema operativo.

## Características

### ✅ Implementado
- **Algoritmo FCFS (First-Come, First-Served)**
- **Interfaz web interactiva** con formularios dinámicos
- **Diagrama de Gantt visual** que muestra la ejecución de procesos
- **Tabla de resultados** con todos los tiempos calculados
- **Métricas de rendimiento** (tiempo promedio de espera, turnaround, análisis de convoy effect)
- **Diseño responsive** que funciona en dispositivos móviles

### 🔜 Próximamente
- Algoritmo SJF (Shortest Job First)
- Algoritmo Round Robin

## Instalación y Uso

### Prerequisitos
- Python 3.7 o superior
- pip (gestor de paquetes de Python)

### Instalación

1. **Clonar o descargar el proyecto**
   ```bash
   cd process-management-simulator
   ```

2. **Crear entorno virtual (recomendado)**
   ```bash
   python -m venv venv
   ```

3. **Activar entorno virtual**
   - Windows:
     ```bash
     venv\Scripts\activate
     ```
   - Linux/macOS:
     ```bash
     source venv/bin/activate
     ```

4. **Instalar dependencias**
   ```bash
   pip install flask
   ```

### Ejecución

1. **Ejecutar la aplicación**
   ```bash
   python app.py
   ```

2. **Abrir navegador**
   - Ir a: http://localhost:5000

## Uso de la Aplicación

### 1. Añadir Procesos
- Ingresa el ID del proceso (ej: P1, P2, P3)
- Especifica el Tiempo de Llegada (AT)
- Especifica el Tiempo de Ráfaga (BT)
- Haz clic en "Añadir Proceso"

### 2. Ejecutar Planificación
- Una vez añadidos los procesos, haz clic en "Ejecutar Planificación"
- La aplicación calculará y mostrará:
  - Diagrama de Gantt visual
  - Tabla con todos los tiempos calculados
  - Métricas de rendimiento

### 3. Interpretar Resultados

#### Columnas de la tabla:
- **Proceso**: ID del proceso
- **AT**: Arrival Time (tiempo de llegada)
- **BT**: Burst Time (tiempo de ráfaga)
- **CT**: Completion Time (tiempo de finalización)
- **TT**: Turnaround Time (tiempo total en el sistema)
- **WT**: Waiting Time (tiempo de espera)

#### Fórmulas:
- **CT**: Se calcula según el orden de ejecución FCFS
- **TT = CT - AT**: Tiempo total que el proceso está en el sistema
- **WT = TT - BT**: Tiempo que el proceso espera antes de ejecutarse

## Estructura del Proyecto

```
process-management-simulator/
├── app.py                 # Aplicación Flask principal
├── process.py            # Clases de procesos y algoritmos
├── templates/
│   └── index.html        # Interfaz web principal
├── static/
│   ├── css/
│   │   └── style.css     # Estilos de la aplicación
│   └── js/
│       └── main.js       # Funcionalidad JavaScript
└── README.md            # Este archivo
```

## Algoritmo FCFS

**First-Come, First-Served** es el algoritmo de planificación más simple:

### Características:
- Los procesos se ejecutan en orden de llegada
- No es preemptivo (un proceso no puede ser interrumpido)
- Simple de implementar y entender
- Puede sufrir del "Convoy Effect"

### Convoy Effect:
Ocurre cuando procesos largos llegan primero y retrasan significativamente a los procesos cortos que llegan después, causando:
- Aumento en el tiempo promedio de espera
- Reducción en la eficiencia del sistema
- Mala experiencia para procesos cortos

## Desarrollo y Extensibilidad

La aplicación está diseñada para ser fácilmente extensible:

### Añadir nuevos algoritmos:

1. **Crear nueva clase scheduler** en `process.py`:
   ```python
   class SJFScheduler:
       def __init__(self):
           # Implementación
       
       def schedule(self):
           # Lógica del algoritmo
   ```

2. **Actualizar SchedulerFactory** en `process.py`:
   ```python
   @staticmethod
   def create_scheduler(algorithm_type):
       if algorithm_type.upper() == 'SJF':
           return SJFScheduler()
   ```

3. **Añadir opción en HTML** (templates/index.html):
   ```html
   <option value="SJF">SJF (Shortest Job First)</option>
   ```

### Estructura de clases:
- **Process**: Representa un proceso individual
- **FCFSScheduler**: Implementa el algoritmo FCFS
- **SchedulerFactory**: Factory pattern para crear schedulers
- **Flask App**: API REST para la interfaz web

## Tecnologías Utilizadas

- **Backend**: Python 3.x, Flask
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Diseño**: CSS Grid, Flexbox, Gradientes
- **Iconos**: Font Awesome
- **Arquitectura**: MVC pattern, Factory pattern


## Licencia

Este proyecto es de código abierto y está disponible para uso educativo.

## Soporte

Si encuentras algún problema o tienes sugerencias, por favor abre un issue en el repositorio.
## 👥 Author

- **Luis Enrique Hernández Valbuena** - [@Luisen1](https://github.com/Luisen1)