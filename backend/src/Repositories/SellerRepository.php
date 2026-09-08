<?php
declare(strict_types=1);

namespace App\Repositories;

use App\Core\Database;
use App\Core\Security\Sanitizer;

/**
 * Enterprise Seller Data Repository
 * Encapsulates database queries for merchant accounts, authentication, and stats.
 */
class SellerRepository
{
    public function findByEmail(string $email): ?array
    {
        $sql = 'SELECT * FROM sellers WHERE email = ? LIMIT 1';
        return Database::selectOne($sql, [$email]);
    }

    public function findById(string $id): ?array
    {
        $sql = 'SELECT id, store_name, full_name, email, phone, category, commission_rate, logo_url, is_active, created_at FROM sellers WHERE id = ? LIMIT 1';
        return Database::selectOne($sql, [$id]);
    }

    public function create(array $data): string
    {
        $id = $data['id'] ?? Sanitizer::uuid();
        $storeName = Sanitizer::string($data['store_name'] ?? '');
        $fullName = Sanitizer::string($data['full_name'] ?? '');
        $email = Sanitizer::email($data['email'] ?? '') ?? '';
        $passwordHash = $data['password_hash'] ?? '';
        $phone = Sanitizer::kenyanPhone($data['phone'] ?? null);
        $category = Sanitizer::string($data['category'] ?? 'General');
        $commissionRate = (float)($data['commission_rate'] ?? 0.12);
        $logoUrl = $data['logo_url'] ?? null;
        $isActive = 1;

        $sql = 'INSERT INTO sellers (id, store_name, full_name, email, password_hash, phone, category, commission_rate, logo_url, is_active)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

        Database::insert($sql, [
            $id,
            $storeName,
            $fullName,
            $email,
            $passwordHash,
            $phone,
            $category,
            $commissionRate,
            $logoUrl,
            $isActive
        ]);

        return $id;
    }

    public function getAll(): array
    {
        $sql = 'SELECT s.id, s.store_name, s.full_name, s.email, s.phone, s.category, s.commission_rate, s.is_active, s.created_at,
                       COALESCE(SUM(oi.total_price), 0) AS gmv,
                       COUNT(DISTINCT oi.order_id) AS orders_count
                FROM sellers s
                LEFT JOIN order_items oi ON s.id = oi.seller_id
                GROUP BY s.id
                ORDER BY s.created_at DESC';

        return Database::select($sql);
    }

    public function getActiveCount(): int
    {
        $sql = 'SELECT COUNT(*) as total FROM sellers WHERE is_active = 1';
        $row = Database::selectOne($sql);
        return (int)($row['total'] ?? 0);
    }

    public function getSellerStats(string $sellerId): array
    {
        $sql = 'SELECT 
                    COALESCE(SUM(oi.total_price), 0) as gross_sales,
                    COALESCE(SUM(oi.seller_earning), 0) as net_earnings,
                    COALESCE(SUM(oi.platform_fee), 0) as total_commission_paid,
                    COUNT(DISTINCT oi.order_id) as total_orders
                FROM order_items oi
                JOIN orders o ON oi.order_id = o.id
                WHERE oi.seller_id = ? AND o.status = "paid"';

        $row = Database::selectOne($sql, [$sellerId]);
        if (!$row || (empty($row['gross_sales']) && empty($row['total_orders']))) {
            // Also check all orders if none are marked paid yet
            $allSql = 'SELECT 
                        COALESCE(SUM(oi.total_price), 0) as gross_sales,
                        COALESCE(SUM(oi.seller_earning), 0) as net_earnings,
                        COALESCE(SUM(oi.platform_fee), 0) as total_commission_paid,
                        COUNT(DISTINCT oi.order_id) as total_orders
                    FROM order_items oi
                    WHERE oi.seller_id = ?';
            $row = Database::selectOne($allSql, [$sellerId]);
        }

        return [
            'gross_sales'           => (float)($row['gross_sales'] ?? 0),
            'net_earnings'          => (float)($row['net_earnings'] ?? 0),
            'total_commission_paid' => (float)($row['total_commission_paid'] ?? 0),
            'total_orders'          => (int)($row['total_orders'] ?? 0),
        ];
    }

    public function updateStatus(string $sellerId, int $isActive): bool
    {
        $sql = 'UPDATE sellers SET is_active = ? WHERE id = ?';
        return Database::execute($sql, [$isActive, $sellerId]) > 0;
    }

    public function updateCommissionRate(string $sellerId, float $rate): bool
    {
        $cleanRate = max(0.01, min(0.50, round($rate, 4)));
        $sql = 'UPDATE sellers SET commission_rate = ? WHERE id = ?';
        return Database::execute($sql, [$cleanRate, $sellerId]) > 0;
    }

    public function delete(string $sellerId): bool
    {
        // Delete seller's products first to maintain relational integrity
        Database::execute('DELETE FROM products WHERE seller_id = ?', [$sellerId]);

        // Delete seller record
        $sql = 'DELETE FROM sellers WHERE id = ?';
        return Database::execute($sql, [$sellerId]) > 0;
    }
}
