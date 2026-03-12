import sys
import os
from PyQt6.QtWidgets import QApplication, QPushButton

from ui.main_window import VisMatWindow
from core.domain_manager import DomainManager
from domains.mathematics import MathematicsDomain

def main():
    app = QApplication(sys.argv)
    
    # Load stylesheet
    style_path = os.path.join(os.path.dirname(__file__), 'ui', 'styles.qss')
    if os.path.exists(style_path):
        with open(style_path, 'r') as f:
            app.setStyleSheet(f.read())
            
    # Create UI
    window = VisMatWindow()
    
    # Setup App Logic
    domain_manager = DomainManager(window)
    domain_manager.register(MathematicsDomain())
    
    # Inject navigation buttons
    for d_name in domain_manager.get_registered_names():
        btn = QPushButton(d_name)
        btn.setObjectName("NavButton")
        # Lambda requires setting default kwarg to capture name correctly
        btn.clicked.connect(lambda checked, name=d_name: domain_manager.switch_to(name))
        window.nav_layout.insertWidget(window.nav_layout.count() - 1, btn)
        
    # Start on Mathematics initially
    domain_manager.switch_to("Mathematics")
    
    window.show()
    sys.exit(app.exec())

if __name__ == "__main__":
    main()
