<?php
declare(strict_types=1);

namespace App\Core\Middleware;

use App\Core\Request;

/**
 * Enterprise CORS (Cross-Origin Resource Sharing) Middleware.
 * Permits secure frontend communication from Vite, Vercel, or custom domains.
 */
class CorsMiddleware
{
    private array $allowedOrigins;

    public function __construct(array $allowedOrigins = [])
    {
        $this->allowedOrigins = $allowedOrigins;
    }

    public function handle(Request $request): void
    {
        header('Vary: Origin');
        $origin = $request->header('origin');

        if ($origin) {
            $isAllowed = !empty($this->allowedOrigins) && in_array($origin, $this->allowedOrigins, true);
            if ($isAllowed) {
                header("Access-Control-Allow-Origin: {$origin}");
                header('Access-Control-Allow-Credentials: true');
            } elseif (empty($this->allowedOrigins)) {
                // If no origins configured, allow wildcard without credentials
                header('Access-Control-Allow-Origin: *');
            }
        }

        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Admin-Pin, X-Requested-With, Accept, Origin');
        header('Access-Control-Max-Age: 86400'); // Cache preflight 24h

        // Handle browser pre-flight OPTIONS request
        if ($request->method() === 'OPTIONS') {
            http_response_code(204);
            exit;
        }
    }
}
