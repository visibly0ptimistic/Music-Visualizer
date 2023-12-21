<?php
/**
 * Plugin Name: 2D Music Visualizer
 * Plugin URI:  http://polymorphicheroes.com
 * Description: An interactive music-driven visualizer for WordPress.
 * Version:     1.0
 * Author:      Victor Ejiasi
 * Author URI:  http://polymorphicheroes.com
 * License:     GPL2
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: music-visualizer
 */

// Prevent direct file access
if (!defined('ABSPATH')) {
    exit;
}

// Check if the Music_Visualizer class exists before defining it
if (!class_exists('Music_Visualizer_2D')) {

    class Music_Visualizer_2D {
        /**
         * Constructor
         */
        public function __construct() {
            $this->init_hooks();
        }

        /**
         * Initialize hooks and actions
         */
        private function init_hooks() {
            add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
            add_shortcode('2D_Music_Visualizer', array($this, 'render_visualizer_shortcode'));
        }

        /**
         * Enqueue scripts and styles
         */
        public function enqueue_scripts() {
            wp_enqueue_style('visualizer-style', plugins_url('assets/css/style.css', __FILE__));
            wp_enqueue_script('visualizer-script', plugins_url('assets/js/visualizer.js', __FILE__), array('jquery'), false, true);

            // No longer enqueue the 'audio-upload-script' since file upload is handled client-side
        }

        /**
         * Render visualizer shortcode
         */
        public function render_visualizer_shortcode() {
            ob_start();
            include plugin_dir_path(__FILE__) . 'templates/visualizer-template.php';
            return ob_get_clean();
        }
    }

    // Initialize the plugin
    new Music_Visualizer_2D();
}