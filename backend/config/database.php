<?php
declare(strict_types=1);

use App\Core\Env;

return [
    'default' => 'mysql',

    'connections' => [
        'mysql' => [
            'driver'    => 'mysql',
            'host'      => Env::getString('TIDB_HOST', 'gateway01.ap-northeast-1.prod.aws.tidbcloud.com'),
            'port'      => Env::getInt('TIDB_PORT', 4000),
            'database'  => Env::getString('TIDB_DATABASE', 'technexus'),
            'username'  => Env::getString('TIDB_USER', '3BB3gc3SrPmbGo4.root'),
            'password'  => Env::getString('TIDB_PASSWORD', 'A66F3daf4gBH57mk'),
            'charset'   => 'utf8mb4',
            'collation' => 'utf8mb4_unicode_ci',
            'ssl'       => [
                'enabled'     => true,
                'ca'          => true,
                'verify_cert' => false, // TiDB cloud uses public CA
            ],
            'options'   => [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
                PDO::ATTR_TIMEOUT            => 10,
            ],
        ],
    ],
];
