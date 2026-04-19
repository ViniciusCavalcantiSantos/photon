<?php

namespace App\Http\Controllers;

/**
 * @OA\Info(
 *     version="1.0.0",
 *     title="Vinmo API",
 *     description="Complete API documentation for Vinmo. For Swagger authentication, call `/api/auth/login` or `/api/auth/register` with `type=token`, then authorize with `Bearer <token>`."
 * )
 *
 * @OA\Server(
 *     url="/",
 *     description="Current application host"
 * )
 *
 * @OA\SecurityScheme(
 *     securityScheme="sanctum",
 *     type="http",
 *     scheme="bearer",
 *     bearerFormat="Bearer token",
 *     description="Sanctum bearer token. Generate it via `/api/auth/login` or `/api/auth/register` with `type=token`."
 * )
 *
 * @OA\SecurityScheme(
 *     securityScheme="sessionAuth",
 *     type="apiKey",
 *     in="cookie",
 *     name="laravel_session",
 *     description="Laravel session cookie for browser-based authentication."
 * )
 */
class SwaggerController extends Controller
{
    //
}
