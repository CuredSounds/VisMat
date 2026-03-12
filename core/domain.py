from abc import ABC, abstractmethod
from typing import Dict, Any

class DomainBase(ABC):
    """
    Base class that every STEM topic must inherit from.
    Ensures expandability across the application.
    """
    
    @abstractmethod
    def get_name(self) -> str:
        """Return the display name of the domain (e.g., 'Mathematics')"""
        pass
        
    @abstractmethod
    def get_formula_display(self) -> str:
        """Return a string representing the math formula to show in the header"""
        pass

    @abstractmethod
    def build_controls(self, parent_layout) -> None:
        """
        Create and add UI widgets (sliders, inputs) to the parent_layout.
        This must also connect widget signals to self.on_control_changed().
        """
        pass
        
    @abstractmethod
    def calculate_data(self) -> Any:
        """
        Perform the heavy calculations using numpy/scipy (or engines).
        Return the raw data needed for rendering.
        """
        pass

    @abstractmethod
    def render(self, stage) -> None:
        """
        Take data and draw it onto the VisualizationStage (pyqtgraph).
        """
        pass
        
    # Standard callback when any control changes
    def on_control_changed(self):
        # We need a reference back to the main app to trigger a re-render.
        # This will be injected by the domain manager.
        if hasattr(self, 'request_update_callback'):
            self.request_update_callback()
