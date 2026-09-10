<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Repositories\OrderRepository;
use App\Repositories\SellerRepository;
use App\Repositories\CommissionRepository;
use Throwable;

/**
 * Enterprise Admin Control Center Controller
 * Supplies executive financial telemetry, merchant auditing, and commission matrix adjustments.
 */
class AdminController
{
    private OrderRepository $orderRepo;
    private SellerRepository $sellerRepo;
    private CommissionRepository $commRepo;

    public function __construct()
    {
        $this->orderRepo = new OrderRepository();
        $this->sellerRepo = new SellerRepository();
        $this->commRepo = new CommissionRepository();
    }

    public function summary(Request $request): void
    {
        try {
            $platformTotals = $this->orderRepo->getPlatformTotals();
            $sellers = $this->sellerRepo->getAll();

            Response::success([
                'platformTotals' => $platformTotals,
                'sellers'        => $sellers,
            ]);
        } catch (Throwable $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    public function orders(Request $request): void
    {
        try {
            $limit = min(100, max(1, (int)$request->query('limit', 50)));
            $recentOrders = $this->orderRepo->getRecentOrders($limit);

            Response::success([
                'orders' => $recentOrders,
                'count'  => count($recentOrders),
            ]);
        } catch (Throwable $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    public function commissions(Request $request): void
    {
        try {
            $rates = $this->commRepo->getAll();
            Response::success(['rates' => $rates]);
        } catch (Throwable $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    public function updateCommission(Request $request): void
    {
        try {
            $data = $request->body();
            $category = (string)($data['category'] ?? '');
            $rate = (float)($data['rate'] ?? 0.10);
            $label = $data['label'] ?? null;

            if (empty($category)) {
                Response::error('Category is required.', 400);
                return;
            }

            $this->commRepo->setRate($category, $rate, $label);

            Response::success([
                'category' => $category,
                'rate'     => $rate,
            ], 'Commission rate updated successfully');
        } catch (Throwable $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    public function toggleSellerStatus(Request $request): void
    {
        try {
            $data = $request->body();
            $sellerId = (string)($data['seller_id'] ?? '');
            $isActive = isset($data['is_active']) ? (int)$data['is_active'] : 1;

            if (empty($sellerId)) {
                Response::error('Seller ID is required.', 400);
                return;
            }

            $this->sellerRepo->updateStatus($sellerId, $isActive);

            Response::success([
                'seller_id' => $sellerId,
                'is_active' => $isActive,
                'status'    => $isActive ? 'Active' : 'Suspended',
            ], 'Merchant status updated successfully');
        } catch (Throwable $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    public function updateSellerRate(Request $request): void
    {
        try {
            $data = $request->body();
            $sellerId = (string)($data['seller_id'] ?? '');
            $rate = (float)($data['commission_rate'] ?? 0.10);

            if (empty($sellerId)) {
                Response::error('Seller ID is required.', 400);
                return;
            }

            $this->sellerRepo->updateCommissionRate($sellerId, $rate);

            Response::success([
                'seller_id'       => $sellerId,
                'commission_rate' => $rate,
            ], 'Merchant commission rate updated successfully');
        } catch (Throwable $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    public function deleteSeller(Request $request): void
    {
        try {
            $data = $request->body();
            $sellerId = (string)($data['seller_id'] ?? $request->query('seller_id') ?? $request->query('id') ?? '');

            if (empty($sellerId)) {
                Response::error('Seller ID is required for deletion.', 400);
                return;
            }

            $deleted = $this->sellerRepo->delete($sellerId);
            if (!$deleted) {
                Response::error('Merchant not found or could not be removed.', 404);
                return;
            }

            \App\Core\Logger::info('Merchant deleted by Admin', ['seller_id' => $sellerId]);

            Response::success([
                'seller_id' => $sellerId,
            ], 'Merchant deleted permanently from the platform.');
        } catch (Throwable $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    public function deleteProduct(Request $request): void
    {
        try {
            $data = $request->body();
            $productId = (string)($data['product_id'] ?? $request->query('id') ?? '');

            if (empty($productId)) {
                Response::error('Product ID is required for deletion.', 400);
                return;
            }

            $deleted = $this->productRepo->delete($productId);
            if (!$deleted) {
                Response::error('Product not found.', 404);
                return;
            }

            \App\Core\Logger::info('Product deleted by Admin', ['product_id' => $productId]);

            Response::success(['product_id' => $productId], 'Product deleted permanently.');
        } catch (Throwable $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    public function deleteOrder(Request $request): void
    {
        try {
            $data = $request->body();
            $orderId = (string)($data['order_id'] ?? $request->query('order_id') ?? $request->query('id') ?? '');

            if (empty($orderId)) {
                Response::error('Order ID is required for deletion.', 400);
                return;
            }

            $deleted = $this->orderRepo->delete($orderId);
            if (!$deleted) {
                Response::error('Order not found or could not be removed.', 404);
                return;
            }

            \App\Core\Logger::info('Order deleted by Admin', ['order_id' => $orderId]);

            Response::success(['order_id' => $orderId], 'Order deleted permanently from the platform.');
        } catch (Throwable $e) {
            Response::error($e->getMessage(), 500);
        }
    }
}
