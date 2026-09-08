<?php
declare(strict_types=1);

namespace App\Core;

/**
 * Enterprise PSR-4 Autoloader
 * Zero external dependencies. High performance class mapper.
 */
class Autoloader
{
    private static string $prefix = 'App\\';
    private static string $baseDir = '';
    private static bool $registered = false;

    public static function register(string $baseDir): void
    {
        if (self::$registered) {
            return;
        }

        self::$baseDir = rtrim($baseDir, DIRECTORY_SEPARATOR . '/') . DIRECTORY_SEPARATOR;

        spl_autoload_register([__CLASS__, 'loadClass'], true, true);
        self::$registered = true;
    }

    public static function loadClass(string $class): bool
    {
        // Check if the class uses the namespace prefix
        $len = strlen(self::$prefix);
        if (strncmp(self::$prefix, $class, $len) !== 0) {
            return false;
        }

        // Get the relative class name
        $relativeClass = substr($class, $len);

        // Replace the namespace prefix with the base directory, replace namespace
        // separators with directory separators in the relative class name, append with .php
        $file = self::$baseDir . str_replace('\\', DIRECTORY_SEPARATOR, $relativeClass) . '.php';

        if (is_file($file)) {
            require_once $file;
            return true;
        }

        return false;
    }
}
