<?php
/**
 * Railway PHP Router Script
 * Handles URL routing for Railway's built-in PHP server.
 * Replaces Apache .htaccess mod_rewrite for the Railway environment.
 */

// Startup diagnostics — only shown on direct /health or if APP_DEBUG is true
ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);

$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/');
$uri = ltrim($uri, '/');

// ── Security: Block access to sensitive directories & files ──────────
$blocked = [
    'backend/', '.git/', 'db/', 'node_modules/',
    '.env', 'package.json', 'package-lock.json',
    'vite.config.mjs', 'composer.json', 'composer.lock',
];
foreach ($blocked as $pattern) {
    if ($uri === $pattern || str_starts_with($uri, $pattern)) {
        http_response_code(403);
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Forbidden']);
        exit;
    }
}

// ── Pass critical headers to PHP ────────────────────────────────────
// PHP built-in server doesn't forward Authorization automatically
if (!empty($_SERVER['HTTP_AUTHORIZATION'])) {
    putenv('HTTP_AUTHORIZATION=' . $_SERVER['HTTP_AUTHORIZATION']);
}
if (!empty($_SERVER['HTTP_X_ADMIN_PIN'])) {
    putenv('HTTP_X_ADMIN_PIN=' . $_SERVER['HTTP_X_ADMIN_PIN']);
}

// ── Route /api/* to api/index.php ───────────────────────────────────
if ($uri === 'api' || str_starts_with($uri, 'api/')) {
    require_once __DIR__ . '/api/index.php';
    exit;
}

// ── Serve existing static files directly ────────────────────────────
$filePath = __DIR__ . '/' . $uri;
if ($uri !== '' && is_file($filePath)) {
    return false; // PHP built-in server serves the file
}

// ── Root: quick health ping ─────────────────────────────────────────
if ($uri === '' || $uri === 'health') {
    header('Content-Type: application/json');
    echo json_encode([
        'status' => 'ok',
        'service' => 'Byte Tech API',
        'php' => PHP_VERSION,
        'time' => date('c'),
    ]);
    exit;
}

// ── 404 fallback ─────────────────────────────────────────────────────
http_response_code(404);
header('Content-Type: application/json');
echo json_encode(['error' => 'Not found', 'path' => '/' . $uri]);
