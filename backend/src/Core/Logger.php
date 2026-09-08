<?php
declare(strict_types=1);

namespace App\Core;

/**
 * Enterprise Structured Logger
 * Tracks request correlation IDs, ISO-8601 timestamps, log levels, and context.
 * Enables effortless troubleshooting and production observability.
 */
class Logger
{
    public const DEBUG    = 'DEBUG';
    public const INFO     = 'INFO';
    public const WARNING  = 'WARNING';
    public const ERROR    = 'ERROR';
    public const CRITICAL = 'CRITICAL';

    private static ?string $logDir = null;
    private static ?string $traceId = null;

    public static function init(string $logDir): void
    {
        self::$logDir = rtrim($logDir, DIRECTORY_SEPARATOR . '/');
        if (!is_dir(self::$logDir)) {
            @mkdir(self::$logDir, 0775, true);
        }
    }

    public static function setTraceId(string $traceId): void
    {
        self::$traceId = $traceId;
    }

    public static function getTraceId(): string
    {
        if (self::$traceId === null) {
            self::$traceId = 'req_' . bin2hex(random_bytes(8));
        }
        return self::$traceId;
    }

    public static function log(string $level, string $message, array $context = []): void
    {
        if (self::$logDir === null) {
            self::init(dirname(__DIR__, 2) . '/logs');
        }

        $date = date('Y-m-d');
        $logFile = self::$logDir . "/app-{$date}.log";

        $record = [
            'timestamp' => date('c'),
            'trace_id'  => self::getTraceId(),
            'level'     => strtoupper($level),
            'message'   => $message,
            'context'   => $context,
            'client_ip' => $_SERVER['REMOTE_ADDR'] ?? 'CLI',
            'uri'       => $_SERVER['REQUEST_URI'] ?? 'CLI',
        ];

        $line = json_encode($record, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . PHP_EOL;

        @file_put_contents($logFile, $line, FILE_APPEND | LOCK_EX);
    }

    public static function debug(string $message, array $context = []): void
    {
        self::log(self::DEBUG, $message, $context);
    }

    public static function info(string $message, array $context = []): void
    {
        self::log(self::INFO, $message, $context);
    }

    public static function warning(string $message, array $context = []): void
    {
        self::log(self::WARNING, $message, $context);
    }

    public static function error(string $message, array $context = []): void
    {
        self::log(self::ERROR, $message, $context);
    }

    public static function critical(string $message, array $context = []): void
    {
        self::log(self::CRITICAL, $message, $context);
    }

    /**
     * Reads recent logs for devops health and diagnostic inspection
     */
    public static function getRecentLogs(int $limit = 50): array
    {
        if (self::$logDir === null) {
            self::init(dirname(__DIR__, 2) . '/logs');
        }

        $date = date('Y-m-d');
        $logFile = self::$logDir . "/app-{$date}.log";

        if (!file_exists($logFile)) {
            return [];
        }

        $lines = file($logFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        if ($lines === false) {
            return [];
        }

        $recent = array_slice($lines, -$limit);
        $parsed = [];
        foreach ($recent as $line) {
            $data = json_decode($line, true);
            if ($data !== null) {
                $parsed[] = $data;
            }
        }

        return array_reverse($parsed);
    }
}
