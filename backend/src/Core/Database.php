<?php
declare(strict_types=1);

namespace App\Core;

use PDO;
use PDOException;
use Exception;

/**
 * Enterprise Resilient Database Connection Manager.
 * Handles TiDB Serverless SSL, connection health checks, automated transactions,
 * and high-performance prepared statements.
 */
class Database
{
    private static ?PDO $pdo = null;
    private static array $config = [];

    public static function init(array $config): void
    {
        self::$config = $config;
    }

    public static function getConnection(): PDO
    {
        if (self::$pdo !== null) {
            return self::$pdo;
        }

        return self::connect();
    }

    public static function ping(): bool
    {
        try {
            $pdo = self::getConnection();
            $stmt = $pdo->query('SELECT 1');
            return $stmt !== false;
        } catch (PDOException) {
            self::$pdo = null;
            return false;
        }
    }

    private static function connect(): PDO
    {
        $cfg = self::$config['connections']['mysql'] ?? [];
        if (empty($cfg)) {
            $configFile = dirname(__DIR__, 2) . '/config/database.php';
            if (file_exists($configFile)) {
                $loaded = require $configFile;
                $cfg = $loaded['connections']['mysql'] ?? [];
            }
        }

        $host = $cfg['host'] ?? '127.0.0.1';
        $port = (int)($cfg['port'] ?? 3306);
        $dbname = $cfg['database'] ?? '';
        $charset = $cfg['charset'] ?? 'utf8mb4';
        $user = $cfg['username'] ?? '';
        $pass = $cfg['password'] ?? '';
        $options = $cfg['options'] ?? [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];

        // Apply SSL configuration for TiDB Serverless or Cloud instances
        if (!empty($cfg['ssl']['enabled'])) {
            $options[PDO::MYSQL_ATTR_SSL_CA] = true;
            if (isset($cfg['ssl']['verify_cert'])) {
                $options[PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT] = $cfg['ssl']['verify_cert'];
            }
        }

        $dsn = "mysql:host={$host};port={$port};dbname={$dbname};charset={$charset}";

        try {
            self::$pdo = new PDO($dsn, $user, $pass, $options);
            return self::$pdo;
        } catch (PDOException $e) {
            Logger::error('Database connection failed', [
                'host'  => $host,
                'port'  => $port,
                'db'    => $dbname,
                'error' => $e->getMessage()
            ]);
            throw new Exception('Database service temporarily unavailable. System operations notified.', 503);
        }
    }

    /**
     * Executes queries within an ACID transaction automatically rolling back on failure.
     */
    public static function transaction(callable $callback): mixed
    {
        $pdo = self::getConnection();
        $pdo->beginTransaction();

        try {
            $result = $callback($pdo);
            $pdo->commit();
            return $result;
        } catch (Exception $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            throw $e;
        }
    }

    /**
     * Helper for SELECT queries returning multiple rows
     */
    public static function select(string $sql, array $params = []): array
    {
        $stmt = self::getConnection()->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    /**
     * Helper for SELECT queries returning a single row
     */
    public static function selectOne(string $sql, array $params = []): ?array
    {
        $stmt = self::getConnection()->prepare($sql);
        $stmt->execute($params);
        $row = $stmt->fetch();
        return $row === false ? null : $row;
    }

    /**
     * Helper for INSERT queries returning the last insert ID or row count
     */
    public static function insert(string $sql, array $params = []): int
    {
        $pdo = self::getConnection();
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $lastId = $pdo->lastInsertId();
        return $lastId ? (int)$lastId : $stmt->rowCount();
    }

    /**
     * Helper for UPDATE or DELETE queries returning affected row count
     */
    public static function execute(string $sql, array $params = []): int
    {
        $stmt = self::getConnection()->prepare($sql);
        $stmt->execute($params);
        return $stmt->rowCount();
    }
}
