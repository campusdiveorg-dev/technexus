<?php
declare(strict_types=1);

namespace App\Core\Middleware;

use App\Core\Request;
use App\Core\Response;

/**
 * Enterprise Rate Limiting Middleware
 * Throttles excessive incoming traffic to prevent DDoS and brute-force credential stuffing.
 */
class RateLimitMiddleware
{
    private int $maxRequests;
    private int $decaySeconds;
    private string $storageDir;

    public function __construct(int $maxRequests = 60, int $decaySeconds = 60)
    {
        $this->maxRequests = $maxRequests;
        $this->decaySeconds = $decaySeconds;
        $this->storageDir = sys_get_temp_dir() . '/marketplace_ratelimits';

        if (!is_dir($this->storageDir)) {
            @mkdir($this->storageDir, 0775, true);
        }
    }

    public function handle(Request $request): void
    {
        $ip = $request->clientIp();
        $key = md5("{$ip}:" . $request->path());
        $file = "{$this->storageDir}/rl_{$key}.json";

        $now = time();
        $hits = [];

        if (file_exists($file)) {
            $content = file_get_contents($file);
            $stored = json_decode($content ?: '[]', true);
            if (is_array($stored)) {
                // Filter out timestamps older than decay period
                $cutoff = $now - $this->decaySeconds;
                $hits = array_filter($stored, fn($ts) => $ts > $cutoff);
            }
        }

        if (count($hits) >= $this->maxRequests) {
            header('Retry-After: ' . $this->decaySeconds);
            Response::error('Too many requests. Please slow down and try again later.', 429, null, 'RATE_LIMIT_EXCEEDED');
            return;
        }

        $hits[] = $now;
        @file_put_contents($file, json_encode(array_values($hits)), LOCK_EX);

        header("X-RateLimit-Limit: {$this->maxRequests}");
        header('X-RateLimit-Remaining: ' . max(0, $this->maxRequests - count($hits)));
    }
}
