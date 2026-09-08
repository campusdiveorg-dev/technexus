<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Services\AuthService;
use Throwable;

/**
 * Enterprise Authentication Controller
 * Handles merchant registration and secure JWT login.
 */
class AuthController
{
    private AuthService $authService;

    public function __construct()
    {
        $this->authService = new AuthService();
    }

    public function register(Request $request): void
    {
        try {
            $data = $request->body();
            $result = $this->authService->register($data);

            Response::success($result, 'Merchant registered successfully', 201);
        } catch (Throwable $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    public function login(Request $request): void
    {
        try {
            $data = $request->body();
            $email = (string)($data['email'] ?? '');
            $password = (string)($data['password'] ?? '');

            $result = $this->authService->login($email, $password);

            Response::success($result, 'Login successful');
        } catch (Throwable $e) {
            Response::error($e->getMessage(), 401);
        }
    }
}
