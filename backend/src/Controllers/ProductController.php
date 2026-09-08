<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Repositories\ProductRepository;
use Throwable;

/**
 * Enterprise Public Products Controller
 * Supplies storefront catalog search, category filtering, and product details.
 */
class ProductController
{
    private ProductRepository $productRepo;

    public function __construct()
    {
        $this->productRepo = new ProductRepository();
    }

    public function listProducts(Request $request): void
    {
        try {
            $limit = min(100, max(1, (int)$request->query('limit', 50)));
            $offset = max(0, (int)$request->query('offset', 0));

            $products = $this->productRepo->getAllActive($limit, $offset);

            Response::success([
                'products' => $products,
                'count'    => count($products),
                'limit'    => $limit,
                'offset'   => $offset,
            ]);
        } catch (Throwable $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    public function getProduct(Request $request): void
    {
        try {
            $id = (string)($request->query('id') ?? $request->param('id'));
            if (empty($id)) {
                Response::error('Product ID is required.', 400);
                return;
            }

            $product = $this->productRepo->getById($id);
            if (!$product) {
                Response::notFound('Product not found.');
                return;
            }

            Response::success(['product' => $product]);
        } catch (Throwable $e) {
            Response::error($e->getMessage(), 500);
        }
    }
}
