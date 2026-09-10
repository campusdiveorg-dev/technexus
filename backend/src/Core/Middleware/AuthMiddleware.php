<?php
declare(strict_types=1);

namespace App\Core\Middleware;

use App\Core\Request;
use App\Core\Response;
use App\Core\Security\Jwt;
use App\Core\Env;

/**
 * Merchant Authentication Middleware
 * Validates cryptographic JWT Bearer tokens for merchant portal operations.
 */
class AuthMiddleware
{
    public function handle(Request $request): void
    {
        $token = $request->bearerToken();

        if (!$token) {
            Response::unauthorized('Authentication token missing. Please log in.');
            return;
        }

        $secret = Env::getString('JWT_SECRET', 'bitetechltd_production_jwt_secret_2026_super_secure');
        $payload = Jwt::decode($token, $secret);

        if (!$payload || !isset($payload['sub'])) {
            Response::unauthorized('Invalid or expired authentication session.');
            return;
        }

        // Attach authenticated seller to request context
        $request->setAttribute('seller', $payload);
        $request->setAttribute('seller_id', $payload['sub']);
    }
}
