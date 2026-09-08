<?php
declare(strict_types=1);

namespace App\Repositories;

use App\Core\Database;
use App\Core\Security\Sanitizer;

/**
 * Enterprise Product Repository
 * Handles catalog items, stock updates, seller product inventories, and search queries.
 */
class ProductRepository
{
    public function getBySeller(string $sellerId): array
    {
        $sql = 'SELECT id, seller_id, name, category, price, commission_rate, description, image_url, specs, tag, stock, is_active, created_at
                FROM products
                WHERE seller_id = ?
                ORDER BY created_at DESC';

        return Database::select($sql, [$sellerId]);
    }

    public function getById(string $id): ?array
    {
        $sql = 'SELECT p.*, s.store_name, s.full_name as seller_name
                FROM products p
                LEFT JOIN sellers s ON p.seller_id = s.id
                WHERE p.id = ? LIMIT 1';

        return Database::selectOne($sql, [$id]);
    }

    public function create(array $data): string
    {
        $id = $data['id'] ?? ('prod-' . bin2hex(random_bytes(6)));
        $sellerId = $data['seller_id'] ?? null;
        $name = Sanitizer::string($data['name'] ?? '');
        $category = Sanitizer::string($data['category'] ?? 'Accessories');
        $price = Sanitizer::price($data['price'] ?? 0);
        $commissionRate = (float)($data['commission_rate'] ?? 0.10);
        $description = Sanitizer::string($data['description'] ?? '', 1000);
        $imageUrl = $data['image_url'] ?? '';
        $specs = Sanitizer::string($data['specs'] ?? '', 255);
        $tag = Sanitizer::string($data['tag'] ?? 'NEW', 30);
        $stock = Sanitizer::int($data['stock'] ?? 50);
        $isActive = 1;

        $sql = 'INSERT INTO products (id, seller_id, name, category, price, commission_rate, description, image_url, specs, tag, stock, is_active)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE 
                    name = VALUES(name),
                    category = VALUES(category),
                    price = VALUES(price),
                    stock = VALUES(stock),
                    description = VALUES(description),
                    specs = VALUES(specs),
                    image_url = VALUES(image_url)';

        Database::execute($sql, [
            $id,
            $sellerId,
            $name,
            $category,
            $price,
            $commissionRate,
            $description,
            $imageUrl,
            $specs,
            $tag,
            $stock,
            $isActive
        ]);

        return $id;
    }

    public function delete(string $id, ?string $sellerId = null): bool
    {
        if ($sellerId) {
            $sql = 'DELETE FROM products WHERE id = ? AND seller_id = ?';
            return Database::execute($sql, [$id, $sellerId]) > 0;
        }

        $sql = 'DELETE FROM products WHERE id = ?';
        return Database::execute($sql, [$id]) > 0;
    }

    public function getAllActive(int $limit = 100, int $offset = 0): array
    {
        $sql = 'SELECT p.*, s.store_name, s.full_name as seller_name
                FROM products p
                LEFT JOIN sellers s ON p.seller_id = s.id
                WHERE p.is_active = 1
                ORDER BY p.created_at DESC
                LIMIT ? OFFSET ?';

        // PDO requires integers for LIMIT/OFFSET
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare($sql);
        $stmt->bindValue(1, $limit, \PDO::PARAM_INT);
        $stmt->bindValue(2, $offset, \PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function decrementStock(string $productId, int $qty): void
    {
        $sql = 'UPDATE products SET stock = GREATEST(0, stock - ?) WHERE id = ?';
        Database::execute($sql, [$qty, $productId]);
    }
}
