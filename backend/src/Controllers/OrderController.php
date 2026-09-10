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
            $query = (string)(
                $request->query('id') ?? 
                ($request->query('order_id') ?? 
                ($request->query('orderId') ?? 
                ($request->query('phone') ?? 
                ($request->query('customer') ?? $request->input('id')))))
            );

            if (empty($query)) {
                Response::error('Receipt ID or Customer Number is required.', 400);
                return;
            }

            $order = $this->orderService->getOrder($query);

            if (!$order) {
                Response::notFound("No receipt found matching '{$query}'. Please check the reference or phone number.");
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

    public function delete(Request $request): void
    {
        try {
            $data = $request->body();
            $orderId = (string)($data['order_id'] ?? $request->query('id') ?? '');

            if (empty($orderId)) {
                Response::error('Receipt / Order ID is required for deletion.', 400);
                return;
            }

            $orderRepo = new \App\Repositories\OrderRepository();
            $deleted = $orderRepo->delete($orderId);

            if (!$deleted) {
                Response::notFound("Receipt '{$orderId}' not found or already deleted.");
                return;
            }

            \App\Core\Logger::info('Receipt deleted by client', ['order_id' => $orderId]);

            Response::success(['order_id' => $orderId], 'Receipt deleted permanently.');
        } catch (Throwable $e) {
            Response::error($e->getMessage(), 500);
        }
    }
}
