from core.domain import DomainBase

class DomainManager:
    """
    Handles registering domains, initializing them, and tying them back to the main UI loop.
    """
    def __init__(self, main_window):
        self.main_window = main_window
        self.domains = {}
        self.active_domain: DomainBase = None

    def register(self, domain_instance: DomainBase):
        name = domain_instance.get_name()
        # Inject callback into domain so it can tell the UI to re-render
        domain_instance.request_update_callback = self._request_render
        self.domains[name] = domain_instance
        
    def get_registered_names(self):
        return list(self.domains.keys())

    def switch_to(self, domain_name: str):
        if domain_name not in self.domains:
            print(f"[Error] Domain '{domain_name}' not found.")
            return
            
        self.active_domain = self.domains[domain_name]
        
        # 1. Update Header UI
        self.main_window.domain_title.setText(self.active_domain.get_name())
        self.main_window.formula_display.setText(self.active_domain.get_formula_display())
        
        # 2. Rebuild Controls UI
        self.active_domain.build_controls(self.main_window.controls_content_layout)
        
        # 3. Clear Stage
        self.main_window.stage_view.clear()
        
        # Reset curve cache to force recreation in new view
        if hasattr(self.active_domain, 'curve'):
            self.active_domain.curve = None
            
        # 4. Render Initial State
        self._request_render()

    def _request_render(self):
        """Called whenever a control changes or domain is switched."""
        if self.active_domain:
            self.active_domain.render(self.main_window.stage_view)
