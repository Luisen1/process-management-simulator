# 🖥️ Simulador de Gestión de Procesos

Una aplicación web interactiva desarrollada en **Flask** que simula algoritmos de planificación de procesos para sistemas operativos. Implementa los algoritmos **FCFS**, **SJF** y **Round Robin** con visualizaciones en tiempo real y análisis estadístico completo.

## ✨ Características Principales

### 🎯 Algoritmos Implementados
- **FCFS (First-Come, First-Served)**: Algoritmo justo que respeta el orden de llegada
- **SJF (Shortest Job First)**: Algoritmo óptimo que prioriza procesos con menor tiempo de ráfaga
- **Round Robin**: Algoritmo preemptivo con quantum configurable y análisis de eficiencia

### 📊 Visualizaciones Interactivas
- **Diagramas de Gantt**: Representación visual de la ejecución de procesos
- **Tablas de Resultados**: Métricas detalladas (AT, BT, CT, TT, WT, QU)
- **📈 Estadísticas Avanzadas**: Medias, desviaciones estándar, mínimos y máximos
- **Indicadores Visuales**: Diferenciación por colores según el algoritmo

### 🛠️ Funcionalidades Avanzadas
- **⚙️ Quantum Configurable**: Control dinámico del quantum para Round Robin (1-20)
- **📊 Análisis Estadístico**: Cálculo automático de medias y desviaciones estándar
- **🔄 Context Switching**: Contador y análisis de cambios de contexto en RR
- **Ejemplos Predefinidos**: Casos que demuestran claramente las diferencias entre algoritmos
- **Cambio Dinámico**: Alternancia entre algoritmos sin reiniciar la aplicación
- **Análisis Automático**: Detección del efecto convoy y análisis de rendimiento
- **Interfaz Responsiva**: Compatible con dispositivos móviles y de escritorio

## 🚀 Instalación y Configuración

### Prerrequisitos
- **Python 3.7+**
- **pip** (gestor de paquetes de Python)

### 1. Clonar el Repositorio
```bash
git clone https://github.com/Luisen1/process-management-simulator.git
cd process-management-simulator
```

### 2. Crear Entorno Virtual (Recomendado)
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 3. Instalar Dependencias
```bash
pip install -r requirements.txt
```

### 4. Ejecutar la Aplicación
```bash
python app.py
```

### 5. Acceder a la Aplicación
Abrir el navegador y visitar: `http://127.0.0.1:5000`

## 📖 Guía de Uso

### Añadir Procesos
1. **PID**: Identificador único del proceso (ej: P1, P2, P3)
2. **Arrival Time (AT)**: Momento en que el proceso llega al sistema
3. **Burst Time (BT)**: Tiempo que el proceso necesita para completarse

### Cambiar Algoritmo
- Utiliza el selector de algoritmos para alternar entre **FCFS** y **SJF**
- La interfaz se actualiza automáticamente mostrando información específica

### Ejemplos Predefinidos
- **FCFS vs SJF**: Demuestra las diferencias fundamentales entre algoritmos
- **Efecto Convoy**: Muestra cómo procesos largos afectan a los cortos en FCFS
- **Valores de Referencia**: Datos específicos para validación académica

## 🧮 Métricas Calculadas

### Tiempos Fundamentales
- **AT (Arrival Time)**: Tiempo de llegada al sistema
- **BT (Burst Time)**: Tiempo de ejecución requerido
- **CT (Completion Time)**: Tiempo de finalización
- **TT (Turnaround Time)**: Tiempo total en el sistema (CT - AT)
- **WT (Waiting Time)**: Tiempo en cola de espera (TT - BT)

### Métricas de Rendimiento
- **Tiempo Promedio de Espera**: Media de todos los tiempos de espera
- **Tiempo Promedio de Turnaround**: Media de todos los tiempos de turnaround
- **Análisis de Eficiencia**: Comparación entre algoritmos

## 🎨 Diferencias Visuales

### FCFS (First-Come, First-Served)
- 🟦 **Interfaz Azul**: Representa orden y justicia
- 📝 **Ordenamiento**: Por Arrival Time (AT)
- ⚖️ **Características**: Justo pero puede ser ineficiente

### SJF (Shortest Job First)
- 🟩 **Elementos Verdes**: Burst Time resaltado
- 🔴 **Elementos Rojos**: Arrival Time (ignorado en ordenamiento)
- ⚡ **Características**: Eficiente pero injusto

## 📁 Estructura del Proyecto

```
process-management-simulator/
├── app.py                 # Aplicación Flask principal
├── process.py            # Lógica de algoritmos de scheduling
├── requirements.txt      # Dependencias del proyecto
├── README.md            # Documentación del proyecto
├── static/
│   ├── css/
│   │   └── style.css    # Estilos CSS responsivos
│   └── js/
│       ├── main.js      # Lógica principal del frontend
│       └── examples.js  # Ejemplos predefinidos
└── templates/
    └── index.html       # Plantilla HTML principal
```

## 🔧 Arquitectura Técnica

### Backend (Flask)
- **Patrón Factory**: Para creación de schedulers
- **API RESTful**: Endpoints para gestión de procesos
- **Separación de Responsabilidades**: Lógica de negocio independiente

### Frontend
- **JavaScript Vanilla**: Sin dependencias externas
- **CSS Grid/Flexbox**: Layout responsivo moderno
- **Fetch API**: Comunicación asíncrona con el backend

### Algoritmos
- **FCFS**: Ordenamiento por arrival_time
- **SJF**: Ordenamiento por burst_time
- **Cálculos Específicos**: Métodos diferenciados para cada algoritmo

## 🎓 Casos de Uso Educativos

### Demostración de Conceptos
- **Efecto Convoy**: Cómo procesos largos bloquean a los cortos
- **Starvation**: Procesos largos que nunca se ejecutan en SJF
- **Trade-offs**: Justicia vs Eficiencia en sistemas operativos

### Ejemplos Recomendados
1. **Convoy Effect**: P1(AT=0,BT=20), P2(AT=1,BT=1), P3(AT=2,BT=1)
2. **SJF Optimization**: P1(AT=0,BT=8), P2(AT=1,BT=2), P3(AT=2,BT=1)
3. **Fair vs Efficient**: Comparar métricas entre ambos algoritmos

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Para contribuir:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

**Luis Enrique** - Estudiante de Sistemas Operativos  
*8vo Semestre - Entregable de Materia Sistemas Operativos - Punto 4.1*