# VisMat MATLAB Integration Guide

VisMat's architecture supports plugging in dedicated compute engines instead of relying solely on Python's NumPy/SciPy stack. This ensures the application can be expanded to leverage specialized tools like MATLAB for extremely complex physics or engineering simulations.

## Connecting MATLAB to Python

MathWorks provides an official package to execute MATLAB from within Python. 

### Prerequisites
1. You must have **MATLAB** installed on the same machine.
2. Ensure you have a compatible Python version (MATLAB versions dictate which Python versions are supported).

### Installation
You install the engine directly from your MATLAB installation path, not from PyPI.

1. Activate the VisMat Python virtual environment:
   ```bash
   source venv/bin/activate
   ```
2. Navigate to your MATLAB installation's external python engine directory. For example, on macOS:
   ```bash
   cd "/Applications/MATLAB_R2023b.app/extern/engines/python"
   ```
   *(Adjust the R2023b to your actual installed version).*
3. Install the engine into the environment:
   ```bash
   python setup.py install
   ```

## Creating a Compute Engine Interface

To maintain VisMat's modularity, we abstract the math engine behind an interface. This allows domains to request calculations without caring if it runs in Python or MATLAB.

### 1. `engines/compute.py`

```python
from abc import ABC, abstractmethod

class ComputeEngine(ABC):
    @abstractmethod
    def calculate_lissajous(self, freq_a, freq_b, phase, points=2000):
        pass
        
class NumpyEngine(ComputeEngine):
    def calculate_lissajous(self, freq_a, freq_b, phase, points=2000):
        import numpy as np
        t = np.linspace(0, 2 * np.pi, points)
        return np.sin(freq_a * t + phase), np.sin(freq_b * t)

class MatlabEngine(ComputeEngine):
    def __init__(self):
        import matlab.engine
        print("Starting MATLAB engine...")
        self.eng = matlab.engine.start_matlab()
        
    def calculate_lissajous(self, freq_a, freq_b, phase, points=2000):
        # Pass variables to MATLAB workspace
        self.eng.workspace['freq_a'] = float(freq_a)
        self.eng.workspace['freq_b'] = float(freq_b)
        self.eng.workspace['phase'] = float(phase)
        self.eng.workspace['points'] = float(points)
        
        # Execute MATLAB code securely
        self.eng.eval("t = linspace(0, 2*pi, points);", nargout=0)
        self.eng.eval("x = sin(freq_a * t + phase);", nargout=0)
        self.eng.eval("y = sin(freq_b * t);", nargout=0)
        
        # Pull arrays back to Python
        x = self.eng.workspace['x']
        y = self.eng.workspace['y']
        
        # matlab arrays must be converted back to flat python lists/numpy arrays for pyqtgraph
        return list(x[0]), list(y[0])
        
    def __del__(self):
        # Shut down MATLAB when destroying the engine
        if hasattr(self, 'eng'):
            self.eng.quit()
```

### 2. Updating Domains to Use the Engine

Instead of raw numpy code in your domain class, you inject the engine:

```python
# domains/mathematics.py
class MathematicsDomain(DomainBase):
    def __init__(self, engine: ComputeEngine):
        super().__init__()
        self.engine = engine
        # ... other init stuff ...
        
    def calculate_data(self):
        # The domain no longer cares if this takes 0ms in Numpy or 500ms in MATLAB
        x, y = self.engine.calculate_lissajous(
            self.freq_a, 
            self.freq_b, 
            self.phase
        )
        return x, y
```

### 3. Application Startup (`main.py`)

When starting the application, you decide which engine to initialize.

```python
from engines.compute import NumpyEngine, MatlabEngine

# Try to use MATLAB if requested, fallback to Numpy
engine = NumpyEngine() 
try:
    import matlab.engine 
    # engine = MatlabEngine() # Uncomment to force MATLAB
except ImportError:
    print("MATLAB engine not found. Falling back to Numpy.")

domain_manager.register(MathematicsDomain(engine))
```

## Performance Warning
Passing large arrays back and forth between Python and the MATLAB engine can introduce latency. For high-frame-rate visualizations (60fps), it is often better to use Python/Numpy. Use MATLAB exclusively when you need access to its specialized toolboxes (Simulink, Aerospace, Control Systems) that do not have Python equivalents.
