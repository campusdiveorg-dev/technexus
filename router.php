<?php
/**
 * Railway PHP Router Script
 * Replaces Apache .htaccess URL rewriting for Railway's built-in PHP server.
 * 
 * Routes:
 *  - /api/* → api/index.php (backend API gateway)
 *  - Static files → served directly
 *  - Everything else → blocked or passed through
 */

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = ltrim($uri, '/');

// ── Security: Block access to sensitive directories & files ──────────
$blocked = ['backend/', '.git/', 'db/', '.env', 'package.json', 'vite.config'];
foreach ($blocked as $pattern) {
    if (str_starts_with($uri, $pattern) || $uri === ltrim($pattern, '/')) {
        http_response_code(403);
        echo json_encode(['error' => 'Forbidden']);
        exit;
    }
}

// ── Route /api/* to api/index.php ───────────────────────────────────
if (str_starts_with($uri, 'api/') || $uri === 'api') {
    // Pass Authorization & Admin PIN headers to PHP
    if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $_SERVER['HTTP_AUTHORIZATION'] = $_SERVER['HTTP_AUTHORIZATION'];
    }
    require_once __DIR__ . '/api/index.php';
    exit;
}

// ── Serve existing static files (css, js, images, etc.) ─────────────
$filePath = __DIR__ . '/' . $uri;
if ($uri !== '' && file_exists($filePath) && is_file($filePath)) {
    return false; // Let PHP built-in server handle it
}

// ── Fallback: serve index.html for SPA routes (if serving frontend) ──
// NOTE: On Railway (backend-only), this won't be reached.
// The frontend is served separately by Vercel.
http_response_code(404);
echo json_encode(['error' => 'Not found', 'path' => '/' . $uri]);
