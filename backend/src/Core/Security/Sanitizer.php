<?php
declare(strict_types=1);

namespace App\Core\Security;

/**
 * Enterprise Input Sanitizer & Security Utilities
 * Protects against SQLi, XSS, Header Injections, and malformed inputs.
 */
class Sanitizer
{
    /**
     * Generate cryptographically secure UUID v4
     */
    public static function uuid(): string
    {
        $data = random_bytes(16);
        $data[6] = chr((ord($data[6]) & 0x0f) | 0x40); // set version to 0100
        $data[8] = chr((ord($data[8]) & 0x3f) | 0x80); // set bits 6-7 to 10
        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
    }

    /**
     * Generates a branded, unique receipt/order ID starting with BT01 (e.g. BT01-0712345678-A1B2)
     */
    public static function generateOrderId(string $prefix = 'BT01', ?string $customerPhone = null): string
    {
        $custPart = '';
        if ($customerPhone) {
            $digits = preg_replace('/\D/', '', $customerPhone);
            if (str_starts_with($digits, '254') && strlen($digits) >= 12) {
                $custPart = '0' . substr($digits, 3);
            } elseif (!empty($digits)) {
                $custPart = $digits;
            }
        }

        $random = strtoupper(bin2hex(random_bytes(2)));
        if (!empty($custPart)) {
            return "{$prefix}-{$custPart}-{$random}";
        }

        $date = date('Ymd');
        return "{$prefix}-{$date}-{$random}";
    }

    /**
     * Clean and strip unsafe characters
     */
    public static function string(?string $input, int $maxLength = 255): string
    {
        if ($input === null) {
            return '';
        }
        $clean = trim($input);
        $clean = htmlspecialchars($clean, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
        return mb_substr($clean, 0, $maxLength, 'UTF-8');
    }

    /**
     * Validate and normalize email
     */
    public static function email(?string $email): ?string
    {
        if ($email === null) {
            return null;
        }
        $clean = strtolower(trim($email));
        return filter_var($clean, FILTER_VALIDATE_EMAIL) ? $clean : null;
    }

    /**
     * Normalize Kenyan phone number to 254XXXXXXXXX format
     */
    public static function kenyanPhone(?string $phone): string
    {
        if ($phone === null) {
            return '';
        }
        $digits = preg_replace('/\D/', '', $phone);
        if (str_starts_with($digits, '0') && strlen($digits) === 10) {
            return '254' . substr($digits, 1);
        }
        if (str_starts_with($digits, '254') && strlen($digits) === 12) {
            return $digits;
        }
        if (strlen($digits) === 9) {
            return '254' . $digits;
        }
        return $digits;
    }

    /**
     * Safely cast and bound float prices
     */
    public static function price(mixed $price, float $min = 0.0, float $max = 10000000.0): float
    {
        $val = (float)filter_var($price, FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION);
        return max($min, min($max, round($val, 2)));
    }

    /**
     * Safely cast and bound integers (e.g. stock, quantity)
     */
    public static function int(mixed $val, int $min = 0, int $max = 100000): int
    {
        $v = (int)$val;
        return max($min, min($max, $v));
    }
}
