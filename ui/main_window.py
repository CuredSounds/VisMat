from PyQt6.QtWidgets import (QMainWindow, QWidget, QVBoxLayout, QHBoxLayout, 
                             QLabel, QPushButton, QFrame, QScrollArea)
from PyQt6.QtCore import Qt

class VisMatWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("VisMat - STEM Visualizer")
        self.setMinimumSize(1200, 800)
        
        # Central Widget
        self.central_widget = QWidget()
        self.setCentralWidget(self.central_widget)
        
        # Main Layout (Horizontal: Sidebar + Content Area)
        self.main_layout = QHBoxLayout(self.central_widget)
        self.main_layout.setContentsMargins(0, 0, 0, 0)
        self.main_layout.setSpacing(0)
        
        self.setup_sidebar()
        self.setup_content_area()

    def setup_sidebar(self):
        # Sidebar Frame
        self.sidebar = QWidget()
        self.sidebar.setObjectName("Sidebar")
        self.sidebar.setFixedWidth(250)
        
        sidebar_layout = QVBoxLayout(self.sidebar)
        sidebar_layout.setContentsMargins(20, 30, 20, 30)
        sidebar_layout.setSpacing(15)
        
        # Brand
        brand_label = QLabel("VisMat")
        brand_label.setObjectName("BrandLabel")
        brand_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        sidebar_layout.addWidget(brand_label)
        
        # Domain Navigation
        self.nav_layout = QVBoxLayout()
        self.nav_layout.setSpacing(10)
        
        # Domains will be injected here by main.py using DomainManager
        
        self.nav_layout.addStretch() # Push everything up
        sidebar_layout.addLayout(self.nav_layout)
        
        # Footer
        footer_layout = QVBoxLayout()
        footer_layout.setSpacing(5)
        version_label = QLabel("v2.0.0-Desktop")
        version_label.setObjectName("FooterLabel")
        credit_label = QLabel("Designed with ❤️")
        credit_label.setObjectName("FooterLabel")
        
        version_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        credit_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        
        footer_layout.addWidget(version_label)
        footer_layout.addWidget(credit_label)
        sidebar_layout.addLayout(footer_layout)
        
        self.main_layout.addWidget(self.sidebar)

    def setup_content_area(self):
        # Main Content Area
        self.content_area = QWidget()
        self.content_area.setObjectName("ContentArea")
        content_layout = QVBoxLayout(self.content_area)
        content_layout.setContentsMargins(30, 30, 30, 30)
        content_layout.setSpacing(20)
        
        # Header (Domain Title + Formula)
        self.header = QWidget()
        self.header.setObjectName("HeaderGlass")
        header_layout = QHBoxLayout(self.header)
        
        self.domain_title = QLabel("Select a Domain")
        self.domain_title.setObjectName("DomainTitle")
        
        self.formula_display = QLabel("Formula loading...")
        self.formula_display.setObjectName("FormulaDisplay")
        self.formula_display.setAlignment(Qt.AlignmentFlag.AlignRight | Qt.AlignmentFlag.AlignVCenter)
        
        header_layout.addWidget(self.domain_title)
        header_layout.addWidget(self.formula_display)
        
        content_layout.addWidget(self.header)
        
        # Stage & Controls Split
        stage_controls_layout = QHBoxLayout()
        stage_controls_layout.setSpacing(20)
        
        # Visualization Stage
        # Initialize pyqtgraph wrapper instead of empty QWidget
        from core.stage import VisualizationStage
        self.stage_view = VisualizationStage()
        self.stage_view.setObjectName("StageGlass")
        
        stage_controls_layout.addWidget(self.stage_view, stretch=3) # Stage gets 3 parts of space
        
        # Controls Panel
        self.controls_panel = QWidget()
        self.controls_panel.setObjectName("ControlsGlass")
        self.controls_panel.setFixedWidth(350)
        
        controls_layout = QVBoxLayout(self.controls_panel)
        controls_label = QLabel("Controls")
        controls_label.setObjectName("ControlsTitle")
        controls_layout.addWidget(controls_label)
        
        # Scroll area for controls
        self.controls_scroll = QScrollArea()
        self.controls_scroll.setWidgetResizable(True)
        self.controls_scroll.setFrameShape(QFrame.Shape.NoFrame)
        self.controls_scroll.setStyleSheet("background: transparent;")
        
        self.controls_content = QWidget()
        self.controls_content.setStyleSheet("background: transparent;")
        self.controls_content_layout = QVBoxLayout(self.controls_content)
        self.controls_content_layout.addStretch()
        
        self.controls_scroll.setWidget(self.controls_content)
        controls_layout.addWidget(self.controls_scroll)
        
        stage_controls_layout.addWidget(self.controls_panel, stretch=1) # Controls get 1 part
        
        # Add to Content Layout
        content_layout.addLayout(stage_controls_layout)
        
        self.main_layout.addWidget(self.content_area)
