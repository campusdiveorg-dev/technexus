<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Core\Database;
use App\Core\Logger;
use App\Core\Env;
use Throwable;

/**
 * Enterprise Diagnostic & Observability Controller
 * Provides real-time health-checks, latency telemetry, and log inspection
 * for zero-friction DevOps troubleshooting.
 */
class HealthController
{
    public function check(Request $request): void
    {
        $startTime = microtime(true);
        $isProduction = Env::getString('APP_ENV', 'production') === 'production';
        $headerPin = $request->header('x-admin-pin');
        $expectedPin = Env::getString('ADMIN_PIN', 'TN2026');
        $isAdmin = $headerPin && hash_equals($expectedPin, $headerPin);

        $dbStatus = 'UNKNOWN';
        $dbLatency = '0ms';
        $tables = [];

        try {
            $dbStart = microtime(true);
            $pdo = Database::getConnection();
            $pdo->query('SELECT 1');
            $dbDuration = round((microtime(true) - $dbStart) * 1000, 2);
            $dbStatus = 'CONNECTED';
            $dbLatency = "{$dbDuration}ms";

            // Only inspect tables if admin or non-production
            if ($isAdmin || !$isProduction) {
                $stmt = $pdo->query('SHOW TABLES');
                $tables = $stmt->fetchAll(\PDO::FETCH_COLUMN);
            }
        } catch (Throwable $e) {
            $dbStatus = 'DISCONNECTED';
            $dbError = $isAdmin || !$isProduction ? $e->getMessage() : 'Database connection error';
        }

        $totalLatency = round((microtime(true) - $startTime) * 1000, 2);
        $status = ($dbStatus === 'CONNECTED') ? 'HEALTHY' : 'DEGRADED';

        if ($isProduction && !$isAdmin) {
            // Production public view: Safe, minimal telemetry
            $diagnostics = [
                'status'         => $status,
                'timestamp'      => date('c'),
                'database'       => $dbStatus,
                'system_latency' => "{$totalLatency}ms",
            ];
        } else {
            // Detailed diagnostic telemetry for authorized admins or local development
            $diagnostics = [
                'status'      => $status,
                'timestamp'   => date('c'),
                'environment' => Env::getString('APP_ENV', 'production'),
                'php'         => [
                    'version'      => PHP_VERSION,
                    'memory_usage' => round(memory_get_usage(true) / 1024 / 1024, 2) . ' MB',
                    'peak_memory'  => round(memory_get_peak_usage(true) / 1024 / 1024, 2) . ' MB',
                    'extensions'   => [
                        'pdo_mysql' => extension_loaded('pdo_mysql'),
                        'openssl'   => extension_loaded('openssl'),
                        'mbstring'  => extension_loaded('mbstring'),
                        'curl'      => extension_loaded('curl'),
                    ],
                ],
                'database'    => [
                    'status'  => $dbStatus,
                    'host'    => Env::getString('TIDB_HOST', 'N/A'),
                    'latency' => $dbLatency,
                    'tables'  => $tables,
                    'error'   => $dbError ?? null,
                ],
                'integrations' => [
                    'intasend_live'  => Env::getBool('INTASEND_IS_LIVE', false),
                    'cloudinary_set' => !empty(Env::getString('CLOUDINARY_CLOUD_NAME', '')),
                    'kra_enabled'    => Env::getBool('KRA_ENABLED', false),
                ],
                'system_latency' => "{$totalLatency}ms",
            ];
        }

        $statusCode = ($status === 'HEALTHY') ? 200 : 503;
        Response::json($diagnostics, $statusCode);
    }

    public function logs(Request $request): void
    {
        // Enforce admin PIN exclusively via cryptographic header
        $pin = $request->header('x-admin-pin');
        $expectedPin = Env::getString('ADMIN_PIN', 'TN2026');

        if (!$pin || !hash_equals($expectedPin, (string)$pin)) {
            Response::forbidden('Master admin PIN required in X-Admin-Pin header to inspect system logs.');
            return;
        }

        $limit = min(200, max(1, (int)$request->query('limit', 50)));
        $recentLogs = Logger::getRecentLogs($limit);

        Response::success([
            'count' => count($recentLogs),
            'logs'  => $recentLogs,
        ], 'Recent application logs retrieved');
    }
}
