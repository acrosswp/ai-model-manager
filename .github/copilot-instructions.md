# AI Assistant Manager - AI Coding Instructions

## Architecture Overview

This is a **modern WordPress plugin boilerplate** using PSR-4 namespacing (`AI_Assistant_Manager\`) with a custom autoloader and webpack-based asset compilation. The plugin follows a **singleton pattern** with a centralized hook loader system.

### Core Components

- **`includes/main.php`**: Singleton main class that orchestrates the entire plugin lifecycle
- **`includes/Autoloader.php`**: Custom PSR-4 autoloader (replaces composer autoloader for plugin classes)
- **`includes/loader.php`**: Centralized hook registration system - all WordPress hooks go through this
- **`admin/` & `public/`**: Separate namespaces for admin-only and public-facing functionality

### Key Architectural Patterns

**Singleton Pattern**: Main class uses `Main::instance()` - always check existing implementation
**Hook Loader**: Never register hooks directly - use `$this->loader->add_action()` and `$this->loader->add_filter()`
**Namespace Mapping**: `Includes\` → `includes/`, `Admin\` → `admin/`, `Public\` → `public/`

## Development Workflow

### Asset Compilation (Critical)
```bash
npm run start    # Development with watch mode
npm run build    # Production build for release
```

**Asset Loading Pattern**: Each Main.php loads webpack-generated `.asset.php` files:
```php
$this->js_asset_file = include \AI_ASSISTANT_MANAGER_PLUGIN_PATH . 'build/js/backend.asset.php';
```

### Plugin Creation Workflow
Use `./init-plugin.sh` to scaffold new plugins - it performs bulk find/replace across all files, updates namespaces, class names, and creates repository structure.

## Code Conventions

### Constants & Namespacing
- **Global constants**: Use `\AI_ASSISTANT_MANAGER_*` prefix (note the backslash for global scope)
- **Class instantiation**: Always use full namespaces or imports
- **Security**: Every file starts with `defined( 'ABSPATH' ) || exit;`

### Hook Registration Pattern
```php
// WRONG - Never register hooks directly
add_action( 'init', array( $this, 'method' ) );

// CORRECT - Always use the loader
$this->loader->add_action( 'init', $this, 'method' );
```

### WordPress Function Preferences
- Use `untrailingslashit()` instead of `rtrim( $path, '/' )`
- Use `null === $var` instead of `is_null( $var )`
- Use `require` (not `require_once`) for asset files that return arrays

## File Structure Rules

### Asset Organization
- **Source**: `src/js/`, `src/scss/`, `src/media/`
- **Build**: `build/js/`, `build/css/`, `build/media/`
- **Webpack config**: Handles multiple entry points for frontend/backend separation

### Component Structure
```
admin/Main.php          # Admin-specific functionality
admin/partials/         # Admin UI components
public/Main.php         # Public-facing functionality
includes/               # Core plugin classes
├── main.php           # Main orchestrator
├── loader.php         # Hook management
├── Autoloader.php  # Custom autoloader
├── activator.php      # Plugin activation
└── deactivator.php    # Plugin deactivation
```

## Composer Integration

The plugin uses **dual autoloading**:
1. **Custom autoloader** for plugin classes (`Autoloader.php`)
2. **Composer autoloader** for third-party dependencies

### Adding Dependencies
Per README.md, use specific WPBoilerplate packages:
```bash
composer require wpboilerplate/wpb-updater-checker-github  # GitHub updates
composer require wpboilerplate/wpb-register-blocks         # Block registration
```

## Version Management

- **Plugin header**: Update version in main plugin file
- **package.json**: Keep in sync for npm builds
- **SemVer**: Start at 0.0.1, use semantic versioning

## Deployment

### GitHub Actions
- **`build-zip.yml`**: Triggers on main branch push, creates release zip
- **`wordpress-plugin-deploy.yml`**: Deploys to WordPress.org on tag push

### Build Process
1. `npm run build` - Compiles assets
2. Creates zip excluding dev files (via `.distignore`)
3. Deploys to WordPress.org repository

## Common Gotchas

- **Constant scope**: Use `\CONSTANT_NAME` in namespaced files
- **Asset loading**: Include webpack `.asset.php` files for dependency management
- **Hook timing**: Register admin menu on `init`, not `plugins_loaded` to avoid translation issues
- **Text domain**: Use `load_plugin_textdomain()` on `init` hook, not earlier
