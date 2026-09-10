<?php
declare(strict_types=1);

namespace App\Core;

/**
 * Enterprise Standardized JSON Response Engine.
 * Enforces predictable API contracts, trace correlation IDs, and HTTP specifications.
 */
class Response
{
    private static array $defaultHeaders = [
        'Content-Type'                 => 'application/json; charset=utf-8',
        'X-Content-Type-Options'       => 'nosniff',
        'X-Frame-Options'              => 'SAMEORIGIN',
        'X-XSS-Protection'             => '1; mode=block',
        'Strict-Transport-Security'    => 'max-age=31536000; includeSubDomains',
        'Referrer-Policy'              => 'strict-origin-when-cross-origin',
        'Permissions-Policy'           => 'camera=(self), microphone=(), geolocation=()',
    ];

    public static function json(mixed $data, int $status = 200, array $headers = []): void
    {
        // Set HTTP status code
        http_response_code($status);

        // Send security and content headers
        $allHeaders = array_merge(self::$defaultHeaders, $headers);
        $allHeaders['X-Trace-Id'] = Logger::getTraceId();

        foreach ($allHeaders as $key => $val) {
            header("{$key}: {$val}");
        }

        echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        exit;
    }

    public static function success(mixed $data = null, string $message = 'Success', int $status = 200, array $meta = []): void
    {
        $payload = [
            'success'   => true,
            'status'    => $status,
            'message'   => $message,
            'data'      => $data,
            'meta'      => array_merge([
                'timestamp' => date('c'),
                'trace_id'  => Logger::getTraceId(),
            ], $meta),
        ];

        // Also merge top-level data fields if data is an associative array (for backwards frontend compatibility)
        if (is_array($data) && !array_is_list($data)) {
            $payload = array_merge($payload, $data);
        }

        self::json($payload, $status);
    }

    public static function error(
        string $message,
        int $status = 400,
        mixed $details = null,
        string $errorCode = 'REQUEST_ERROR'
    ): void {
        $payload = [
            'success'    => false,
            'status'     => $status,
            'error'      => $message,
            'error_code' => $errorCode,
            'meta'       => [
                'timestamp' => date('c'),
                'trace_id'  => Logger::getTraceId(),
            ]
        ];

        if ($details !== null) {
            $payload['details'] = $details;
        }

        // Log non-404 client/server errors for troubleshooting
        if ($status >= 500) {
            Logger::error($message, ['status' => $status, 'details' => $details]);
        } elseif ($status !== 404) {
            Logger::warning($message, ['status' => $status, 'details' => $details]);
        }

        self::json($payload, $status);
    }

    public static function unauthorized(string $message = 'Authentication required or token expired'): void
    {
        self::error($message, 401, null, 'UNAUTHORIZED');
    }

    public static function forbidden(string $message = 'Access denied'): void
    {
        self::error($message, 403, null, 'FORBIDDEN');
    }

    public static function notFound(string $message = 'Requested resource does not exist'): void
    {
        self::error($message, 404, null, 'NOT_FOUND');
    }

    public static function serverError(string $message = 'Internal server error occurred'): void
    {
        self::error($message, 500, null, 'INTERNAL_SERVER_ERROR');
    }
}
