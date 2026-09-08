<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Services\PaymentService;
use Throwable;

/**
 * Enterprise Payment Verification & Webhook Controller
 * Handles IntaSend payment confirmations, STK queries, and event callbacks.
 */
class PaymentController
{
    private PaymentService $paymentService;

    public function __construct()
    {
        $this->paymentService = new PaymentService();
    }

    public function verify(Request $request): void
    {
        try {
            $data = $request->body();
            $invoiceId = (string)($data['invoice_id'] ?? $request->query('invoice_id'));

            if (empty($invoiceId)) {
                Response::error('Invoice ID is required for payment verification.', 400);
                return;
            }

            $result = $this->paymentService->verifyPayment($invoiceId);

            Response::success($result, 'Payment inquiry completed');
        } catch (Throwable $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    public function webhook(Request $request): void
    {
        try {
            $data = $request->body();
            $processed = $this->paymentService->handleWebhook($data);

            Response::success([
                'received'  => true,
                'processed' => $processed,
            ], 'Webhook acknowledged');
        } catch (Throwable $e) {
            Response::error($e->getMessage(), 500);
        }
    }
}
