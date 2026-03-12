from PyQt6.QtWidgets import QWidget, QVBoxLayout, QLabel, QSlider
from PyQt6.QtCore import Qt
import pyqtgraph as pg
import numpy as np

from core.domain import DomainBase

class MathematicsDomain(DomainBase):
    """
    A parametric curve visualizer demonstrating expandability.
    Formula: x(t) = sin(a*t), y(t) = sin(b*t) (Lissajous curves)
    """
    def __init__(self):
        super().__init__()
        # State variables
        self.freq_a = 5.0
        self.freq_b = 4.0
        self.phase = np.pi / 2
        
        # UI References
        self.label_a = None
        self.label_b = None
        self.label_phase = None
        
        # Render item reference
        self.curve = None
        
    def get_name(self) -> str:
        return "Mathematics"
        
    def get_formula_display(self) -> str:
        return "x(t) = sin(A·t + \\phi), y(t) = sin(B·t)"
        
    def build_controls(self, parent_layout: QVBoxLayout) -> None:
        """Create the sliders for A, B, and Phase."""
        # Clean existing widgets if domain is reloaded
        while parent_layout.count():
            item = parent_layout.takeAt(0)
            widget = item.widget()
            if widget:
                widget.deleteLater()
                
        # --- Parameter A ---
        self.label_a = QLabel(f"Frequency A: {self.freq_a:.1f}")
        slider_a = QSlider(Qt.Orientation.Horizontal)
        slider_a.setMinimum(1)
        slider_a.setMaximum(20)
        slider_a.setValue(int(self.freq_a))
        slider_a.valueChanged.connect(self._on_a_changed)
        
        parent_layout.addWidget(self.label_a)
        parent_layout.addWidget(slider_a)
        
        # --- Parameter B ---
        self.label_b = QLabel(f"Frequency B: {self.freq_b:.1f}")
        slider_b = QSlider(Qt.Orientation.Horizontal)
        slider_b.setMinimum(1)
        slider_b.setMaximum(20)
        slider_b.setValue(int(self.freq_b))
        slider_b.valueChanged.connect(self._on_b_changed)
        
        parent_layout.addWidget(self.label_b)
        parent_layout.addWidget(slider_b)

        # --- Phase ---
        self.label_phase = QLabel(f"Phase (\\phi): {self.phase:.2f}")
        slider_phase = QSlider(Qt.Orientation.Horizontal)
        slider_phase.setMinimum(0)
        slider_phase.setMaximum(628) # 0 to 2*PI scaled up
        slider_phase.setValue(int(self.phase * 100))
        slider_phase.valueChanged.connect(self._on_phase_changed)
        
        parent_layout.addWidget(self.label_phase)
        parent_layout.addWidget(slider_phase)
        
        parent_layout.addStretch()

    # Callbacks for sliders
    def _on_a_changed(self, val):
        self.freq_a = float(val)
        self.label_a.setText(f"Frequency A: {self.freq_a:.1f}")
        self.on_control_changed()

    def _on_b_changed(self, val):
        self.freq_b = float(val)
        self.label_b.setText(f"Frequency B: {self.freq_b:.1f}")
        self.on_control_changed()

    def _on_phase_changed(self, val):
        self.phase = val / 100.0
        self.label_phase.setText(f"Phase (\\phi): {self.phase:.2f}")
        self.on_control_changed()

    def calculate_data(self):
        """Uses numpy to calculate the Lissajous coordinates."""
        t = np.linspace(0, 2 * np.pi, 2000)
        x = np.sin(self.freq_a * t + self.phase)
        y = np.sin(self.freq_b * t)
        return x, y

    def render(self, stage):
        """Draws the data onto pyqtgraph plot."""
        plot_widget = stage.get_plot()
        x, y = self.calculate_data()
        
        if self.curve is None:
            # Create a neon-blue glass line, glowing effect can be faked with thickness/alpha
            pen = pg.mkPen(color=(79, 172, 254), width=3) 
            self.curve = plot_widget.plot(x, y, pen=pen)
            
            # Lock the view bounds so the curve sweeps without the camera jittering
            plot_widget.setXRange(-1.1, 1.1, padding=0)
            plot_widget.setYRange(-1.1, 1.1, padding=0)
        else:
            self.curve.setData(x, y)
