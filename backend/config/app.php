<?php
declare(strict_types=1);

use App\Core\Env;

return [
    'app' => [
        'name'        => Env::getString('APP_NAME', 'Byte Tech Ltd'),
        'env'         => Env::getString('APP_ENV', 'development'),
        'debug'       => Env::getBool('APP_DEBUG', true),
        'url'         => Env::getString('APP_URL', 'http://localhost/marketplace_project'),
        'timezone'    => 'Africa/Nairobi',
        'currency'    => 'KES',
        'vat_rate'    => 0.16, // Kenyan VAT standard rate (16%)
    ],

    'security' => [
        'jwt_secret'     => Env::getString('JWT_SECRET', 'bitetechltd_production_jwt_secret_2026_super_secure'),
        'jwt_expires_in' => Env::getString('JWT_EXPIRES_IN', '7d'),
        'admin_pin'      => Env::getString('ADMIN_PIN', 'TN2026'),
        'cors_origins'   => [
            'http://localhost:5173',
            'http://localhost:3000',
            'http://localhost:8000',
            'http://127.0.0.1:5173',
            'http://127.0.0.1:3000',
            'http://localhost',
        ],
    ],

    'intasend' => [
        'publishable_key' => Env::getString('INTASEND_PUBLISHABLE_KEY', ''),
        'secret_key'      => Env::getString('INTASEND_SECRET_KEY', ''),
        'is_live'         => Env::getBool('INTASEND_IS_LIVE', false),
        'api_base_url'    => Env::getBool('INTASEND_IS_LIVE', false)
            ? 'https://payment.intasend.com/api/v1'
            : 'https://sandbox.intasend.com/api/v1',
    ],

    'cloudinary' => [
        'cloud_name'    => Env::getString('CLOUDINARY_CLOUD_NAME', ''),
        'api_key'       => Env::getString('CLOUDINARY_API_KEY', ''),
        'api_secret'    => Env::getString('CLOUDINARY_API_SECRET', ''),
        'upload_preset' => Env::getString('CLOUDINARY_UPLOAD_PRESET', 'bitetechltd_uploads'),
    ],

    'kra' => [
        'enabled'       => Env::getBool('KRA_ENABLED', false),
        'pin'           => Env::getString('KRA_PIN', 'P051234567Z'),
        'branch_id'     => Env::getString('KRA_BRANCH_ID', '00'),
        'device_serial' => Env::getString('KRA_DEVICE_SERIAL', 'KRA-VSCU-001'),
        'api_url'       => Env::getString('KRA_API_URL', 'https://etims-api.kra.go.ke/etims-api'),
        'api_key'       => Env::getString('KRA_API_KEY', ''),
    ],
];
