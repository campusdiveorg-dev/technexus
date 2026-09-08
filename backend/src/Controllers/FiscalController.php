<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Services\KraEtimsService;
use Throwable;

/**
 * Enterprise Fiscalization Controller
 * Handles electronic tax invoice fiscalization and KRA QR generation.
 */
class FiscalController
{
    private KraEtimsService $kraService;

    public function __construct()
    {
        $this->kraService = new KraEtimsService();
    }

    public function fiscalize(Request $request): void
    {
        try {
            $data = $request->body();
            $orderId = (string)($data['order_id'] ?? '');

            if (empty($orderId)) {
                Response::error('Order ID is required for fiscalization.', 400);
                return;
            }

            $totalAmount = (float)($data['total_amount'] ?? 0.0);
            $customer = [
                'name'  => $data['customer_name'] ?? null,
                'email' => $data['customer_email'] ?? null,
            ];

            $fiscalData = $this->kraService->fiscalizeOrder($orderId, $totalAmount, $customer);

            Response::success([
                'order_id' => $orderId,
                'fiscal'   => $fiscalData,
            ], 'Order successfully fiscalized with KRA eTIMS');
        } catch (Throwable $e) {
            Response::error($e->getMessage(), 500);
        }
    }
}
