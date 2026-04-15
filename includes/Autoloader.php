<?php
/**
 * Class AI_Model_Preferences\Includes\Autoloader
 *
 * @since 0.0.1
 * @package AI_Model_Preferences
 */

namespace AI_Model_Preferences\Includes;

// Exit if accessed directly
defined( 'ABSPATH' ) || exit;

/**
 * Plugin class autoloader.
 *
 * This autoloader will automatically load classes from the plugin's namespace
 * using PSR-4 naming convention.
 *
 * @since 0.0.1
 */
class Autoloader {

	/**
	 * Plugin root namespace.
	 *
	 * @since 0.0.1
	 * @var string
	 */
	private $root_ns;

	/**
	 * Plugin directory path.
	 *
	 * @since 0.0.1
	 * @var string
	 */
	private $plugin_path;

	/**
	 * Namespace to directory mapping.
	 *
	 * @since 0.0.1
	 * @var array<string, string>
	 */
	private $namespace_map;

	/**
	 * Constructor.
	 *
	 * @since 0.0.1
	 *
	 * @param string $root_ns     Plugin root namespace.
	 * @param string $plugin_path Plugin directory path.
	 */
	public function __construct( string $root_ns, string $plugin_path ) {
		$this->root_ns     = rtrim( $root_ns, '\\' ) . '\\';
		$this->plugin_path = untrailingslashit( $plugin_path ) . '/';

		// Define namespace to directory mapping
		$this->namespace_map = array(
			'Includes\\' => 'includes/',
			'Admin\\'    => 'admin/',
			'Public\\'   => 'public/',
		);
	}

	/**
	 * Attempts to autoload the given PHP class.
	 *
	 * This method should be registered using spl_autoload_register().
	 *
	 * @since 0.0.1
	 *
	 * @param string $class_name PHP class name.
	 */
	public function autoload( string $class_name ): void {
		// Bail if class is not part of the plugin.
		if ( strpos( $class_name, $this->root_ns ) !== 0 ) {
			return;
		}

		// Remove the base namespace from the class name
		$relative_class = substr( $class_name, strlen( $this->root_ns ) );

		// Find the appropriate directory for this namespace
		$file_path = '';
		foreach ( $this->namespace_map as $namespace => $directory ) {
			if ( strpos( $relative_class, $namespace ) === 0 ) {
				// Remove the namespace prefix and convert to file path
				$class_file = substr( $relative_class, strlen( $namespace ) );
				$class_file = str_replace( '\\', '/', $class_file );

				// Build the full file path
				$file_path = $this->plugin_path . $directory . $class_file . '.php';
				break;
			}
		}

		// If no namespace mapping found, try the default includes directory
		if ( empty( $file_path ) ) {
			$class_file = str_replace( '\\', '/', $relative_class );
			$file_path  = $this->plugin_path . 'includes/' . $class_file . '.php';
		}

		// Load the file if it exists
		if ( file_exists( $file_path ) ) {
			require_once $file_path;
		}
	}
}
