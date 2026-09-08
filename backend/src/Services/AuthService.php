<?php
declare(strict_types=1);

namespace App\Services;

use App\Repositories\SellerRepository;
use App\Repositories\CommissionRepository;
use App\Core\Security\Jwt;
use App\Core\Security\Sanitizer;
use App\Core\Env;
use Exception;

/**
 * Enterprise Authentication & Security Service
 * Implements Bcrypt password hashing (cost 12), token signing, and session security.
 */
class AuthService
{
    private SellerRepository $sellerRepo;
    private CommissionRepository $commRepo;

    public function __construct()
    {
        $this->sellerRepo = new SellerRepository();
        $this->commRepo = new CommissionRepository();
    }

    public function register(array $data): array
    {
        $email = Sanitizer::email($data['email'] ?? null);
        if (!$email) {
            throw new Exception('A valid business email address is required.');
        }

        $password = $data['password'] ?? '';
        if (strlen($password) < 6) {
            throw new Exception('Password must contain at least 6 characters.');
        }

        $storeName = trim($data['store_name'] ?? '');
        if (empty($storeName)) {
            throw new Exception('Store or business name is required.');
        }

        // Check if email already registered
        $existing = $this->sellerRepo->findByEmail($email);
        if ($existing) {
            throw new Exception('A merchant account with this email already exists. Please log in.');
        }

        $category = $data['category'] ?? 'Accessories';
        $commissionRate = $this->commRepo->getRateByCategory($category);

        $passwordHash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
        $sellerId = Sanitizer::uuid();

        $this->sellerRepo->create([
            'id'              => $sellerId,
            'store_name'      => $storeName,
            'full_name'       => $data['full_name'] ?? $storeName,
            'email'           => $email,
            'password_hash'   => $passwordHash,
            'phone'           => $data['phone'] ?? null,
            'category'        => $category,
            'commission_rate' => $commissionRate,
            'logo_url'        => $data['logo_url'] ?? null,
        ]);

        $sellerProfile = $this->sellerRepo->findById($sellerId);
        $token = $this->generateToken($sellerProfile);

        return [
            'token'  => $token,
            'seller' => $sellerProfile,
        ];
    }

    public function login(string $email, string $password): array
    {
        $cleanEmail = Sanitizer::email($email);
        if (!$cleanEmail || empty($password)) {
            throw new Exception('Invalid email or password provided.');
        }

        $seller = $this->sellerRepo->findByEmail($cleanEmail);
        if (!$seller) {
            throw new Exception('No merchant found with that email address.');
        }

        if (!password_verify($password, $seller['password_hash'])) {
            throw new Exception('Invalid credentials. Check your password and try again.');
        }

        if (empty($seller['is_active'])) {
            throw new Exception('Merchant account is suspended. Contact Byte Tech operations.');
        }

        $token = $this->generateToken($seller);

        unset($seller['password_hash']);

        return [
            'token'  => $token,
            'seller' => $seller,
        ];
    }

    public function generateToken(array $seller): string
    {
        $secret = Env::getString('JWT_SECRET', 'bitetechltd_production_jwt_secret_2026_super_secure');

        $payload = [
            'sub'        => $seller['id'],
            'email'      => $seller['email'],
            'store_name' => $seller['store_name'],
            'category'   => $seller['category'] ?? 'General',
            'role'       => 'seller',
            'iat'        => time(),
            'exp'        => time() + (7 * 86400), // 7 days
        ];

        return Jwt::encode($payload, $secret);
    }
}
