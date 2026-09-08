<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Services\OrderService;
use Throwable;

/**
 * Enterprise Order Controller
 * Handles atomic order placement, multi-vendor commission splits, and tax receipt lookups.
 */
class OrderController
{
    private OrderService $orderService;

    public function __construct()
    {
        $this->orderService = new OrderService();
    }

    public function create(Request $request): void
    {
        try {
            $payload = $request->body();
            $order = $this->orderService->createOrder($payload);

            Response::success([
                'order'    => $order,
                'order_id' => $order['id'],
            ], 'Order placed successfully', 201);
        } catch (Throwable $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    public function get(Request $request): void
    {
        try {
            $orderId = (string)($request->query('id') ?? $request->input('id'));

            if (empty($orderId)) {
                Response::error('Order ID is required.', 400);
                return;
            }

            $order = $this->orderService->getOrder($orderId);

            if (!$order) {
                Response::notFound("Order '{$orderId}' not found.");
                return;
            }

            // Normalization for receipt page compatibility
            $vatInfo = $order['vat_breakdown'] ?? [];
            $order['total'] = (float)$order['total_amount'];
            $order['subtotal'] = $vatInfo['subtotal'] ?? round($order['total'] / 1.16, 2);
            $order['vat'] = $vatInfo['vat_amount'] ?? round($order['total'] - $order['subtotal'], 2);

            Response::success([
                'order' => $order,
            ]);
        } catch (Throwable $e) {
            Response::error($e->getMessage(), 500);
        }
    }
}
