import pyqtgraph as pg
from PyQt6.QtWidgets import QWidget, QVBoxLayout

class VisualizationStage(QWidget):
    """
    A wrapper for the pyqtgraph view. 
    It will be instantiated inside the main window and handed over to domains to draw on.
    """
    def __init__(self, parent=None):
        super().__init__(parent)
        self.layout = QVBoxLayout(self)
        self.layout.setContentsMargins(0, 0, 0, 0)
        
        # Configure pyqtgraph global settings for modern look
        pg.setConfigOption('background', 'transparent')
        pg.setConfigOption('foreground', '#ffffff')
        pg.setConfigOptions(antialias=True)
        
        # Create a PlotWidget as the default view
        self.plot_widget = pg.PlotWidget()
        self.plot_widget.hideAxis('bottom')
        self.plot_widget.hideAxis('left')
        
        # Remove bordering/padding in the graph itself
        self.plot_widget.setMenuEnabled(False)
        self.plot_widget.setMouseEnabled(x=True, y=True)
        
        self.layout.addWidget(self.plot_widget)
        
    def get_plot(self):
        return self.plot_widget
    
    def clear(self):
        self.plot_widget.clear()
