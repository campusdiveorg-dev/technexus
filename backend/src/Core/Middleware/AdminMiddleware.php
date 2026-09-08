<?php
declare(strict_types=1);

namespace App\Core\Middleware;

use App\Core\Request;
use App\Core\Response;
use App\Core\Env;

/**
 * Master Admin Control Center Middleware
 * Enforces cryptographic PIN verification for system-wide auditing and financial metrics.
 */
class AdminMiddleware
{
    public function handle(Request $request): void
    {
        $headerPin = $request->header('x-admin-pin');

        if (!$headerPin) {
            Response::forbidden('Master admin PIN required.');
            return;
        }

        $expectedPin = Env::getString('ADMIN_PIN', 'TN2026');

        if (!hash_equals($expectedPin, $headerPin)) {
            Response::forbidden('Invalid master admin PIN.');
            return;
        }

        $request->setAttribute('is_admin', true);
    }
}
