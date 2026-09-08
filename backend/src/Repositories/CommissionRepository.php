<?php
declare(strict_types=1);

namespace App\Repositories;

use App\Core\Database;
use App\Core\Security\Sanitizer;

/**
 * Enterprise Commission Matrix Repository
 * Manages category fee schedules and dynamic platform margins.
 */
class CommissionRepository
{
    private static array $defaultRates = [
        'Laptops'     => 0.12,
        'Audio'       => 0.08,
        'Gaming'      => 0.15,
        'Phones'      => 0.10,
        'Monitors'    => 0.10,
        'Accessories' => 0.08,
        'Default'     => 0.10,
    ];

    public function getAll(): array
    {
        $sql = 'SELECT category, rate, label, updated_at FROM commission_rates ORDER BY category ASC';
        $rows = Database::select($sql);

        if (empty($rows)) {
            $formatted = [];
            foreach (self::$defaultRates as $cat => $rate) {
                $formatted[] = [
                    'category'   => $cat,
                    'rate'       => $rate,
                    'label'      => "{$cat} Standard Fee",
                    'updated_at' => date('Y-m-d H:i:s'),
                ];
            }
            return $formatted;
        }

        return $rows;
    }

    public function getRateByCategory(string $category): float
    {
        $sql = 'SELECT rate FROM commission_rates WHERE LOWER(category) = LOWER(?) LIMIT 1';
        $row = Database::selectOne($sql, [$category]);

        if ($row && isset($row['rate'])) {
            return (float)$row['rate'];
        }

        // Check in-memory fallback defaults
        foreach (self::$defaultRates as $cat => $rate) {
            if (strcasecmp($cat, $category) === 0) {
                return $rate;
            }
        }

        return self::$defaultRates['Default'];
    }

    public function setRate(string $category, float $rate, ?string $label = null): bool
    {
        $cat = Sanitizer::string($category);
        $cleanRate = max(0.01, min(0.50, round($rate, 4))); // 1% to 50%
        $lbl = $label ? Sanitizer::string($label) : "{$cat} Commission";

        $sql = 'INSERT INTO commission_rates (category, rate, label)
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE rate = VALUES(rate), label = VALUES(label)';

        return Database::execute($sql, [$cat, $cleanRate, $lbl]) > 0;
    }
}
