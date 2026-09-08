<?php
declare(strict_types=1);

namespace App\Services;

use App\Repositories\CommissionRepository;

/**
 * Enterprise Commission & Financial Calculation Service
 * Calculates platform margins, partner payouts, and Kenyan tax components.
 */
class CommissionService
{
    private CommissionRepository $commRepo;

    public function __construct()
    {
        $this->commRepo = new CommissionRepository();
    }

    public function calculateItemFinancials(string $category, float $unitPrice, int $quantity): array
    {
        $rate = $this->commRepo->getRateByCategory($category);
        $totalPrice = round($unitPrice * $quantity, 2);
        $platformFee = round($totalPrice * $rate, 2);
        $sellerEarning = round($totalPrice - $platformFee, 2);

        return [
            'commission_rate' => $rate,
            'unit_price'      => $unitPrice,
            'quantity'        => $quantity,
            'total_price'     => $totalPrice,
            'platform_fee'    => $platformFee,
            'seller_earning'  => $sellerEarning,
        ];
    }

    public function computeVatBreakdown(float $grandTotal): array
    {
        // 16% standard Kenyan VAT (inclusive in retail pricing)
        $vatRate = 0.16;
        $subtotal = round($grandTotal / (1 + $vatRate), 2);
        $vatAmount = round($grandTotal - $subtotal, 2);

        return [
            'subtotal'    => $subtotal,
            'vat_rate'    => '16%',
            'vat_amount'  => $vatAmount,
            'grand_total' => $grandTotal,
        ];
    }
}
