<?php
declare(strict_types=1);

/**
 * Byte Tech Ltd Marketplace — Enterprise API Gateway & Front Controller
 * 
 * High performance, zero-dependency REST API for Customer Storefront,
 * Merchant Dashboard, and Admin Control Center.
 */

// 1. Register PSR-4 Autoloader
require_once dirname(__DIR__) . '/backend/src/Core/Autoloader.php';
\App\Core\Autoloader::register(dirname(__DIR__) . '/backend/src');

use App\Core\Env;
use App\Core\Database;
use App\Core\Logger;
use App\Core\Request;
use App\Core\Router;
use App\Core\Middleware\CorsMiddleware;
use App\Core\Middleware\AuthMiddleware;
use App\Core\Middleware\AdminMiddleware;
use App\Core\Middleware\RateLimitMiddleware;
use App\Controllers\AuthController;
use App\Controllers\SellerController;
use App\Controllers\ProductController;
use App\Controllers\OrderController;
use App\Controllers\FiscalController;
use App\Controllers\AdminController;
use App\Controllers\PaymentController;
use App\Controllers\HealthController;

// 2. Load Environment Variables & Configurations
$projectRoot = dirname(__DIR__);
Env::load("{$projectRoot}/.env");

$appConfig = require "{$projectRoot}/backend/config/app.php";
$dbConfig = require "{$projectRoot}/backend/config/database.php";

// Set timezone
date_default_timezone_set($appConfig['app']['timezone'] ?? 'Africa/Nairobi');

// 3. Initialize Core Subsystems
Database::init($dbConfig);
Logger::init("{$projectRoot}/backend/logs");

// 4. Instantiate Request & Router
$request = new Request();
$router = new Router();

// 5. Global Middleware: CORS & Preflight handling
$router->use(new CorsMiddleware($appConfig['security']['cors_origins'] ?? []));

// ─────────────────────────────────────────────────────────────
// ROUTE REGISTRATION
// ─────────────────────────────────────────────────────────────

// ── Diagnostics & Telemetry ──
$router->get('/api/health', [HealthController::class, 'check']);
$router->get('/api/health/logs', [HealthController::class, 'logs']);

// ── Merchant Authentication (Rate Limited) ──
$rateLimiter = new RateLimitMiddleware(30, 60);
$router->post('/api/sellers/register', [AuthController::class, 'register'], [$rateLimiter]);
$router->post('/api/sellers/login', [AuthController::class, 'login'], [$rateLimiter]);

// ── Merchant Portal (JWT Protected) ──
$authMiddleware = new AuthMiddleware();
$router->get('/api/sellers/dashboard', [SellerController::class, 'dashboard'], [$authMiddleware]);
$router->get('/api/sellers/products', [SellerController::class, 'getProducts'], [$authMiddleware]);
$router->post('/api/sellers/products', [SellerController::class, 'addProduct'], [$authMiddleware]);
$router->post('/api/sellers/products/stock', [SellerController::class, 'updateStock'], [$authMiddleware]);
$router->delete('/api/sellers/products', [SellerController::class, 'deleteProduct'], [$authMiddleware]);
$router->post('/api/sellers/products/delete', [SellerController::class, 'deleteProduct'], [$authMiddleware]);
$router->post('/api/sellers/payout', [SellerController::class, 'requestPayout'], [$authMiddleware]);

// ── Storefront Orders & Checkout ──
$router->post('/api/orders/create', [OrderController::class, 'create']);
$router->get('/api/orders/get', [OrderController::class, 'get']);
$router->post('/api/orders/fiscalize', [FiscalController::class, 'fiscalize']);

// ── Public Storefront Catalog ──
$router->get('/api/products', [ProductController::class, 'listProducts']);
$router->get('/api/products/detail', [ProductController::class, 'getProduct']);

// ── Payment Verification & Gateway Webhooks ──
$router->post('/api/payments/verify', [PaymentController::class, 'verify']);
$router->post('/api/payments/webhook', [PaymentController::class, 'webhook']);

// ── Admin Control Center (PIN Protected) ──
$adminMiddleware = new AdminMiddleware();
$router->get('/api/admin/summary', [AdminController::class, 'summary'], [$adminMiddleware]);
$router->get('/api/admin/orders', [AdminController::class, 'orders'], [$adminMiddleware]);
$router->get('/api/admin/commissions', [AdminController::class, 'commissions'], [$adminMiddleware]);
$router->post('/api/admin/commissions', [AdminController::class, 'updateCommission'], [$adminMiddleware]);
$router->post('/api/admin/sellers/status', [AdminController::class, 'toggleSellerStatus'], [$adminMiddleware]);
$router->post('/api/admin/sellers/rate', [AdminController::class, 'updateSellerRate'], [$adminMiddleware]);
$router->post('/api/admin/sellers/delete', [AdminController::class, 'deleteSeller'], [$adminMiddleware]);
$router->delete('/api/admin/sellers', [AdminController::class, 'deleteSeller'], [$adminMiddleware]);
$router->delete('/api/admin/products', [AdminController::class, 'deleteProduct'], [$adminMiddleware]);

// 6. Dispatch the request
$router->dispatch($request);
