<?php
declare(strict_types=1);

namespace App\Core;

use Throwable;

/**
 * Enterprise Lightweight High-Performance Router.
 * Handles HTTP method matching, parameterized paths, and middleware pipelines.
 */
class Router
{
    private array $routes = [];
    private array $globalMiddleware = [];

    public function use(object|string $middleware): self
    {
        $this->globalMiddleware[] = $middleware;
        return $this;
    }

    public function get(string $path, callable|array $handler, array $middleware = []): self
    {
        return $this->addRoute('GET', $path, $handler, $middleware);
    }

    public function post(string $path, callable|array $handler, array $middleware = []): self
    {
        return $this->addRoute('POST', $path, $handler, $middleware);
    }

    public function put(string $path, callable|array $handler, array $middleware = []): self
    {
        return $this->addRoute('PUT', $path, $handler, $middleware);
    }

    public function delete(string $path, callable|array $handler, array $middleware = []): self
    {
        return $this->addRoute('DELETE', $path, $handler, $middleware);
    }

    public function any(string $path, callable|array $handler, array $middleware = []): self
    {
        foreach (['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] as $method) {
            $this->addRoute($method, $path, $handler, $middleware);
        }
        return $this;
    }

    private function addRoute(string $method, string $path, callable|array $handler, array $middleware): self
    {
        $this->routes[] = [
            'method'     => strtoupper($method),
            'path'       => $this->normalizePath($path),
            'handler'    => $handler,
            'middleware' => $middleware,
        ];
        return $this;
    }

    private function normalizePath(string $path): string
    {
        $path = trim($path, '/');
        // Ensure standard /api/ prefix
        if (!str_starts_with($path, 'api/')) {
            $path = 'api/' . $path;
        }
        return '/' . $path;
    }

    public function dispatch(Request $request): void
    {
        try {
            // Run global middleware stack
            foreach ($this->globalMiddleware as $mw) {
                $instance = is_string($mw) ? new $mw() : $mw;
                $instance->handle($request);
            }

            $reqMethod = $request->method();
            $reqPath = '/' . trim($request->path(), '/');

            // Find matching route
            foreach ($this->routes as $route) {
                if ($route['method'] !== $reqMethod) {
                    continue;
                }

                $params = $this->matchPath($route['path'], $reqPath);
                if ($params !== false) {
                    $request->setRouteParams($params);

                    // Run route-specific middleware
                    foreach ($route['middleware'] as $mw) {
                        $instance = is_string($mw) ? new $mw() : $mw;
                        $instance->handle($request);
                    }

                    // Execute handler
                    $handler = $route['handler'];
                    if (is_array($handler) && count($handler) === 2) {
                        [$controllerClass, $actionMethod] = $handler;
                        $controller = new $controllerClass();
                        $controller->$actionMethod($request);
                        return;
                    }

                    if (is_callable($handler)) {
                        call_user_func($handler, $request);
                        return;
                    }
                }
            }

            // Route not found
            Response::notFound("Endpoint '{$reqMethod} {$reqPath}' not found on this server.");
        } catch (Throwable $e) {
            Logger::critical('Unhandled exception during request execution', [
                'message' => $e->getMessage(),
                'file'    => $e->getFile(),
                'line'    => $e->getLine(),
                'trace'   => $e->getTraceAsString(),
            ]);

            $isDebug = Env::getBool('APP_DEBUG', false);
            Response::error(
                $isDebug ? $e->getMessage() : 'An internal processing error occurred.',
                500,
                $isDebug ? ['file' => $e->getFile(), 'line' => $e->getLine()] : null,
                'INTERNAL_SERVER_ERROR'
            );
        }
    }

    private function matchPath(string $routePattern, string $actualPath): false|array
    {
        // 1. Direct equality
        if ($routePattern === $actualPath) {
            return [];
        }

        // 2. Normalize both with / without /marketplace_project or subdirectory
        $cleanActual = preg_replace('#^.*?/(api/.*)$#i', '/$1', $actualPath);
        if ($cleanActual && $cleanActual !== $actualPath) {
            if ($routePattern === $cleanActual) {
                return [];
            }
        } else {
            $cleanActual = $actualPath;
        }

        // 3. Regex matching for :param (e.g. /api/orders/:id)
        $pattern = preg_replace('#:([a-zA-Z0-9_]+)#', '(?P<$1>[^/]+)', $routePattern);
        $pattern = '#^' . $pattern . '$#';

        if (preg_match($pattern, $cleanActual, $matches)) {
            $params = [];
            foreach ($matches as $k => $v) {
                if (is_string($k)) {
                    $params[$k] = $v;
                }
            }
            return $params;
        }

        return false;
    }
}
