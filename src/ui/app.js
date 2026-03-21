// BloomDB IDE Main Application

class BloomDBIDE {
    constructor() {
        this.canvas = document.getElementById('pipeline-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.components = [];
        this.connections = [];
        this.selectedComponent = null;
        this.draggedComponent = null;
        this.isDragging = false;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupCanvas();
        this.render();
        window.bloomDBIDE = this; // Make available for drag-drop
    }

    setupEventListeners() {
        // Canvas events
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));

        // Component palette drag
        document.querySelectorAll('.component').forEach(comp => {
            comp.addEventListener('dragstart', this.handleDragStart.bind(this));
        });

        // AI Assistant
        document.getElementById('ask-ai').addEventListener('click', this.handleAIQuery.bind(this));

        // Header buttons
        document.getElementById('new-pipeline').addEventListener('click', this.newPipeline.bind(this));
        document.getElementById('load-pipeline').addEventListener('click', this.loadPipeline.bind(this));
        document.getElementById('save-pipeline').addEventListener('click', this.savePipeline.bind(this));
    }

    setupCanvas() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
    }

    handleDragStart(e) {
        e.dataTransfer.setData('text/plain', e.target.dataset.type);
    }

    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Check if clicking on a component (now handled by DOM events)
        // Reset selection if clicking on empty canvas
        if (e.target === this.canvas) {
            this.selectedComponent = null;
            this.render();
        }
    }

    handleMouseMove(e) {
        if (this.isDragging && this.draggedComponent) {
            const rect = this.canvas.getBoundingClientRect();
            this.draggedComponent.x = e.clientX - rect.left - this.draggedComponent.width / 2;
            this.draggedComponent.y = e.clientY - rect.top - this.draggedComponent.height / 2;
            this.render();
        }
    }

    // Mouse up now handled by DOM events on components

    // Component hit testing now handled by DOM

    addComponent(type, x, y) {
        const component = {
            id: Date.now(),
            type: type,
            x: x - 50,
            y: y - 25,
            width: 100,
            height: 50,
            inputs: [],
            outputs: []
        };

        // Configure based on type
        switch (type) {
            case 'data-source':
                component.outputs = ['data'];
                break;
            case 'probabilistic-filter':
                component.inputs = ['data'];
                component.outputs = ['filtered_data'];
                break;
            case 'uncertainty-aggregator':
                component.inputs = ['data'];
                component.outputs = ['aggregated'];
                break;
            case 'ai-suggester':
                component.inputs = ['data'];
                component.outputs = ['suggestions'];
                break;
            case 'data-sink':
                component.inputs = ['data'];
                break;
        }

        this.components.push(component);
        this.render();
    }

    handleAIQuery() {
        const query = document.getElementById('ai-query').value;
        if (query.trim()) {
            this.getAISuggestions(query);
        }
    }

    async getAISuggestions(query) {
        // Enhanced AI suggestions based on query analysis
        let suggestions = [];

        if (query.toLowerCase().includes('join') || query.toLowerCase().includes('merge')) {
            suggestions = [
                "Use probabilistic outer joins to handle uncertain relationships with confidence scores",
                "Consider fuzzy matching for entity resolution in uncertain datasets",
                "Apply Bayesian networks for relationship probability estimation"
            ];
        } else if (query.toLowerCase().includes('missing') || query.toLowerCase().includes('null')) {
            suggestions = [
                "Implement multiple imputation using probabilistic models",
                "Use expectation-maximization algorithm for missing data",
                "Consider Markov chain Monte Carlo for uncertainty propagation"
            ];
        } else if (query.toLowerCase().includes('filter') || query.toLowerCase().includes('threshold')) {
            suggestions = [
                "Apply confidence-based filtering with adjustable thresholds",
                "Use probabilistic ranking instead of binary filtering",
                "Implement soft constraints for flexible data selection"
            ];
        } else if (query.toLowerCase().includes('aggregate') || query.toLowerCase().includes('group')) {
            suggestions = [
                "Use probabilistic aggregation with confidence intervals",
                "Consider weighted averaging for uncertain group operations",
                "Apply Dempster-Shafer theory for combining uncertain evidence"
            ];
        } else {
            suggestions = [
                "Consider using probabilistic joins for uncertain data relationships",
                "Add confidence thresholds to filter out low-probability results",
                "Use Bayesian inference for missing value imputation",
                "Implement uncertainty propagation through your pipeline",
                "Consider possible worlds semantics for comprehensive uncertainty handling"
            ];
        }

        const suggestionsDiv = document.getElementById('ai-suggestions');
        suggestionsDiv.innerHTML = suggestions.map(s => `<p>• ${s}</p>`).join('');

        // Add click handlers for suggestions
        suggestionsDiv.querySelectorAll('p').forEach(p => {
            p.style.cursor = 'pointer';
            p.addEventListener('click', () => {
                document.getElementById('ai-query').value = p.textContent.substring(2);
            });
        });
    }

    newPipeline() {
        this.components = [];
        this.connections = [];
        // Clear DOM components
        const canvasContainer = document.querySelector('.canvas-container');
        const componentElements = canvasContainer.querySelectorAll('.component-on-canvas');
        componentElements.forEach(element => element.remove());
        this.render();
    }

    loadPipeline() {
        // TODO: Implement pipeline loading
        console.log('Load pipeline functionality to be implemented');
    }

    savePipeline() {
        // TODO: Implement pipeline saving
        console.log('Save pipeline functionality to be implemented');
    }

    render() {
        // Clear canvas for connections
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw connections
        this.connections.forEach(conn => {
            this.drawConnection(conn);
        });

        // Update DOM components
        this.components.forEach(component => {
            this.drawComponent(component);
        });

        // Remove DOM elements for deleted components
        const canvasContainer = document.querySelector('.canvas-container');
        const componentElements = canvasContainer.querySelectorAll('.component-on-canvas');
        componentElements.forEach(element => {
            const componentId = parseInt(element.id.replace('component-', ''));
            if (!this.components.find(c => c.id === componentId)) {
                element.remove();
            }
        });
    }

    drawComponent(component) {
        const canvasContainer = document.querySelector('.canvas-container');

        // Check if DOM element already exists
        let element = document.getElementById(`component-${component.id}`);
        if (!element) {
            element = document.createElement('div');
            element.id = `component-${component.id}`;
            element.className = 'component-on-canvas';
            element.style.left = `${component.x}px`;
            element.style.top = `${component.y}px`;
            element.style.width = `${component.width}px`;
            element.style.height = `${component.height}px`;

            // Add label
            const label = document.createElement('div');
            label.className = 'component-label';
            label.textContent = component.type.replace('-', ' ');
            element.appendChild(label);

            // Add ports
            component.inputs.forEach((input, index) => {
                const port = document.createElement('div');
                port.className = 'port input';
                port.style.top = `${(100 / (component.inputs.length + 1)) * (index + 1)}%`;
                element.appendChild(port);
            });

            component.outputs.forEach((output, index) => {
                const port = document.createElement('div');
                port.className = 'port output';
                port.style.top = `${(100 / (component.outputs.length + 1)) * (index + 1)}%`;
                element.appendChild(port);
            });

            // Add event listeners for interaction
            element.addEventListener('mousedown', (e) => {
                this.selectedComponent = component;
                this.draggedComponent = component;
                this.isDragging = true;
                element.classList.add('selected');
                this.render();
                e.stopPropagation();
            });

            element.addEventListener('mousemove', (e) => {
                if (this.isDragging && this.draggedComponent === component) {
                    const rect = canvasContainer.getBoundingClientRect();
                    const newX = e.clientX - rect.left - component.width / 2;
                    const newY = e.clientY - rect.top - component.height / 2;
                    component.x = Math.max(0, Math.min(newX, canvasContainer.offsetWidth - component.width));
                    component.y = Math.max(0, Math.min(newY, canvasContainer.offsetHeight - component.height));
                    element.style.left = `${component.x}px`;
                    element.style.top = `${component.y}px`;
                }
            });

            element.addEventListener('mouseup', () => {
                this.isDragging = false;
                this.draggedComponent = null;
            });

            canvasContainer.appendChild(element);
        }

        // Update selection state
        if (this.selectedComponent === component) {
            element.classList.add('selected');
        } else {
            element.classList.remove('selected');
        }
    }

    // Ports are now handled in drawComponent with DOM elements

    drawConnection(connection) {
        // TODO: Implement connection drawing
    }
}

// Initialize the IDE when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BloomDBIDE();
});

// Handle drag and drop from palette to canvas
document.addEventListener('dragover', (e) => {
    e.preventDefault();
});

document.addEventListener('drop', (e) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('text/plain');
    if (type) {
        const rect = document.getElementById('pipeline-canvas').getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // This would need to be called on the IDE instance
        // For now, we'll add a global reference
        if (window.bloomDBIDE) {
            window.bloomDBIDE.addComponent(type, x, y);
        }
    }
});