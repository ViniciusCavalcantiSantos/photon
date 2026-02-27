<?php

use App\Http\Middleware\LanguageSelector;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\HttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        channels: __DIR__ . '/../routes/channels.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->append(LanguageSelector::class);
        // Pre-auth routes called by the Next.js server proxy (no Bearer token yet)
        $middleware->validateCsrfTokens(except: ['api/auth/*']);
        // Authenticated routes in token mode: exempt when Bearer token is present
        $middleware->web(prepend: [\App\Http\Middleware\VerifyCsrfToken::class]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->renderable(function (AuthenticationException $e, $request) {
            return response()->json([
                'status' => 'not_authenticated',
                'message' => 'Usuário não autenticado.',
            ], 401);
        });

        $exceptions->renderable(function (AccessDeniedHttpException $e, $request) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'status' => 'forbidden',
                    'message' => $e->getMessage() ?: 'Ação não autorizada.',
                ], 403);
            }

            return null;
        });

        $exceptions->renderable(function (ValidationException $e, $request) {
            if ($request->expectsJson() || $request->is('api/*')) {
                $firstError = collect($e->errors())->first()[0];

                return response()->json([
                    'status' => 'error',
                    'message' => $firstError,
                    'errors' => $e->errors(),
                ], 422);
            }

            return null;
        });

        $exceptions->renderable(function (HttpException $e, $request) {
            if ($e->getStatusCode() === 419) {

                if ($request->expectsJson() || $request->is('api/*')) {
                    return response()->json([
                        'status' => 'csrf_mismatch',
                        'message' => $e->getMessage()
                    ], 419);
                }
            }

            return null;
        });
    })->create();
