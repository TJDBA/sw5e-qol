# SW5E Quality of Life Module

A Foundry VTT v11+ module that enhances combat and action workflows for the SW5E (Star Wars 5th Edition) system, providing streamlined dialogs, smart chat cards, and automated resource tracking.

## 🎯 Features

- **Enhanced Workflow Engine**: Streamlined attack, damage, save, and effect workflows
- **Smart Chat Cards**: Interactive cards with in-place updates and chaining
- **Universal Dice Engine**: Advanced dice rolling with advantage, rerolls, and custom modifiers
- **Resource Management**: Track Force Points, Tech Points, ammo, and consumables
- **State Persistence**: Workflow state management with undo/redo capabilities
- **Modular Design**: Clean architecture for easy extension and maintenance

## 🚀 Installation

1. **Download**: Get the latest release from the [releases page](https://github.com/your-username/sw5e-qol/releases)
2. **Install**: Extract to your Foundry VTT `modules` folder
3. **Enable**: Activate the module in your world's module settings
4. **Configure**: Set up your preferences in the module configuration

## 📋 Requirements

- **Foundry VTT**: Version 11.0 or higher
- **System**: dnd5e system (required for SW5E compatibility)
- **Optional**: Dice So Nice module for enhanced dice animations

## 🏗️ Architecture

The module follows a clean, modular architecture:

```
sw5e-qol/
├── scripts/
│   ├── core/           # Core functionality (dice, state, actors)
│   ├── workflow/       # Workflow engine and actions
│   ├── ui/            # User interface components
│   ├── data/          # Data management and persistence
│   └── integrations/  # SW5E system integration
├── templates/          # Handlebars templates
├── styles/            # CSS stylesheets
└── lang/              # Internationalization
```

### Core Systems

- **Dice Engine**: Universal dice rolling with formula parsing and validation
- **State Manager**: Workflow state management with history and undo support
- **Workflow Orchestrator**: Main controller for action workflows
- **Action Workflows**: Specialized handlers for attack, damage, save, and effect actions

## 🎮 Usage

### Starting a Workflow

```javascript
// Start an attack workflow
const result = await game.SW5EQoL.startWorkflow('attack', {
    actor: game.actors.get('actor-id'),
    targets: canvas.tokens.controlled,
    attackFormula: '1d20+5'
});
```

### Continuing a Workflow

```javascript
// Continue with damage after attack
const damageResult = await game.SW5EQoL.chainToNextWorkflow(
    result.workflowId, 
    'damage', 
    { damageFormula: '1d8+3' }
);
```

### Checking Status

```javascript
// Get workflow status
const status = game.SW5EQoL.getWorkflowStatus(workflowId);

// Get all active workflows
const active = game.SW5EQoL.getActiveWorkflows();
```

## ⚙️ Configuration

The module provides several configuration options:

- **Auto-Intercept**: Automatically intercept SW5E actions
- **Quick Execute**: Enable quick execution for common actions
- **Tooltips**: Display helpful tooltips in dialogs
- **Undo System**: Enable action undo/redo functionality
- **Resource Tracking**: Track character resources automatically
- **Dice Animations**: Enable Dice So Nice integration

## 🔧 Development

### Project Structure

The module is organized into logical functional areas:

- **Core**: Fundamental systems (dice, state, actors, utilities)
- **Workflow**: Action workflow management and execution
- **UI**: User interface components and dialogs
- **Data**: Configuration, persistence, and data management
- **Integrations**: SW5E system-specific functionality

### Building from Source

1. **Clone**: `git clone https://github.com/your-username/sw5e-qol.git`
2. **Navigate**: `cd sw5e-qol`
3. **Install**: No build tools required - pure ES modules
4. **Test**: Load in Foundry VTT development environment

### Adding New Workflows

1. Create a new action class in `scripts/workflow/actions/`
2. Implement the required interface methods
3. Register the workflow in the orchestrator
4. Add UI components and templates

### Code Style

- **Indentation**: Use tabs (not spaces)
- **Naming**: Use descriptive names with consistent casing
- **Documentation**: JSDoc comments for all public methods
- **Error Handling**: Comprehensive error handling with user feedback

## 🐛 Troubleshooting

### Common Issues

1. **Module not loading**: Check Foundry VTT version compatibility
2. **Workflows not working**: Verify dnd5e system is active
3. **UI not displaying**: Check browser console for JavaScript errors
4. **Settings not saving**: Ensure proper permissions in your world

### Debug Mode

Enable debug logging in the module configuration to see detailed workflow information in the browser console.

### Getting Help

- **Issues**: Report bugs on the [GitHub issues page](https://github.com/your-username/sw5e-qol/issues)
- **Discussions**: Join the conversation on [GitHub discussions](https://github.com/your-username/sw5e-qol/discussions)
- **Documentation**: Check the [wiki](https://github.com/your-username/sw5e-qol/wiki) for detailed guides

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes
4. **Test** thoroughly
5. **Submit** a pull request

### Development Guidelines

- Follow the existing code style and architecture
- Add tests for new functionality
- Update documentation for any changes
- Ensure compatibility with Foundry VTT v11+

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Foundry VTT Team**: For the excellent virtual tabletop platform
- **SW5E Community**: For the Star Wars 5th Edition system
- **Contributors**: Everyone who helps improve this module

## 📈 Roadmap

### Version 0.2.0
- [ ] Complete UI component library
- [ ] Enhanced dialog system
- [ ] Chat card rendering system
- [ ] Basic workflow integration

### Version 0.3.0
- [ ] Resource management system
- [ ] Target management and validation
- [ ] Effect application system
- [ ] Undo/redo functionality

### Version 1.0.0
- [ ] Full workflow automation
- [ ] Advanced customization options
- [ ] Performance optimizations
- [ ] Comprehensive testing suite

## 📞 Support

- **GitHub**: [Repository](https://github.com/your-username/sw5e-qol)
- **Issues**: [Bug Reports](https://github.com/your-username/sw5e-qol/issues)
- **Discussions**: [Community Support](https://github.com/your-username/sw5e-qol/discussions)

---

**May the Force be with you!** ⚡ 
