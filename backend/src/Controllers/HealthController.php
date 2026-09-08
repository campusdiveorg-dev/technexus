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
        $diagnostics = [
            'status'      => 'HEALTHY',
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
                'status'  => 'UNKNOWN',
                'host'    => Env::getString('TIDB_HOST', 'N/A'),
                'latency' => '0ms',
                'tables'  => [],
            ],
            'integrations' => [
                'intasend_live'  => Env::getBool('INTASEND_IS_LIVE', false),
                'cloudinary_set' => !empty(Env::getString('CLOUDINARY_CLOUD_NAME', '')),
                'kra_enabled'    => Env::getBool('KRA_ENABLED', false),
            ],
        ];

        // 1. Test database ping and table inspection
        try {
            $dbStart = microtime(true);
            $pdo = Database::getConnection();
            $pdo->query('SELECT 1');
            $dbDuration = round((microtime(true) - $dbStart) * 1000, 2);

            $diagnostics['database']['status'] = 'CONNECTED';
            $diagnostics['database']['latency'] = "{$dbDuration}ms";

            $stmt = $pdo->query('SHOW TABLES');
            $tables = $stmt->fetchAll(\PDO::FETCH_COLUMN);
            $diagnostics['database']['tables'] = $tables;
        } catch (Throwable $e) {
            $diagnostics['status'] = 'DEGRADED';
            $diagnostics['database']['status'] = 'DISCONNECTED';
            $diagnostics['database']['error'] = $e->getMessage();
        }

        $totalLatency = round((microtime(true) - $startTime) * 1000, 2);
        $diagnostics['system_latency'] = "{$totalLatency}ms";

        $statusCode = $diagnostics['status'] === 'HEALTHY' ? 200 : 503;
        Response::json($diagnostics, $statusCode);
    }

    public function logs(Request $request): void
    {
        // Require admin PIN or debug mode
        $pin = $request->header('x-admin-pin') ?? $request->query('pin');
        $expectedPin = Env::getString('ADMIN_PIN', 'TN2026');

        if (!$pin || !hash_equals($expectedPin, (string)$pin)) {
            Response::forbidden('Master admin PIN required to inspect system logs.');
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
