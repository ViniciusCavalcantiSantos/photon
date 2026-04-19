<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Mail\EmailConfirmation;
use App\Mail\EmailPasswordReset;
use App\Models\EmailVerification;
use App\Models\Organization;
use App\Models\User;
use App\Models\UserSocialIdentity;
use App\Notifications\SystemNotification;
use App\Services\ImageAnalysis\ImagePreparationService;
use App\Services\StoragePathService;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use OpenApi\Attributes as OA;

class AuthController extends Controller
{
    private function getProvidersAvailable(): array
    {
        $available = [];

        if (config('services.google.client_id') && config('services.google.client_secret')) {
            $available[] = 'google';
        }

        if (config('services.microsoft.client_id') && config('services.microsoft.client_secret')) {
            $available[] = 'microsoft';
        }


        if (config('services.linkedin.client_id') && config('services.linkedin.client_secret')) {
            $available[] = 'linkedin';
        }

        return $available;
    }

    #[OA\Get(
        path: '/api/auth/available-providers',
        summary: 'Lista os provedores de autenticação social disponíveis',
        tags: ['Auth'],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Provedores disponíveis',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'status', type: 'string', example: 'success'),
                        new OA\Property(property: 'message', type: 'string', example: 'Available providers obtained successfully'),
                        new OA\Property(
                            property: 'providers',
                            type: 'array',
                            items: new OA\Items(type: 'string', example: 'google')
                        )
                    ]
                )
            )
        ]
    )]
    public function availableProviders()
    {
        return response()->json([
            'status' => 'success',
            'message' => 'Available providers obtained successfully',
            'providers' => $this->getProvidersAvailable()
        ]);
    }

    #[OA\Get(
        path: '/api/auth/{provider}/redirect',
        summary: 'Redireciona para o provedor de autenticação (OAuth)',
        tags: ['Auth'],
        parameters: [
            new OA\PathParameter(name: 'provider', required: true, description: 'Nome do provedor (ex: google)', schema: new OA\Schema(type: 'string'))
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'URL de redirecionamento gerada',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'status', type: 'string', example: 'success'),
                        new OA\Property(property: 'message', type: 'string', example: 'Url obtained successfully'),
                        new OA\Property(property: 'url', type: 'string', format: 'uri')
                    ]
                )
            ),
            new OA\Response(
                response: 400,
                description: 'Provedor inválido',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'status', type: 'string', example: 'error'),
                        new OA\Property(property: 'message', type: 'string', example: 'Provider not supported')
                    ]
                )
            )
        ]
    )]
    public function redirectToProvider($provider)
    {
        if (!in_array($provider, $this->getProvidersAvailable())) {
            return response()->json([
                'status' => 'error',
                'message' => __('Provider not supported')
            ], 400);
        }

        $currentLocale = App::getLocale();
        session()->put('auth_social_locale', $currentLocale);
        session()->save();

        return response()->json([
            'status' => 'success',
            'message' => __('Url obtained successfully'),
            'url' => Socialite::driver($provider)->stateless()->redirect()->getTargetUrl(),
        ]);
    }

    #[OA\Get(
        path: '/api/auth/{provider}/callback',
        summary: 'Callback do provedor de autenticação',
        tags: ['Auth'],
        parameters: [
            new OA\PathParameter(name: 'provider', required: true, description: 'Nome do provedor (ex: google)', schema: new OA\Schema(type: 'string'))
        ],
        responses: [
            new OA\Response(response: 302, description: 'Redirecionamento para o app')
        ]
    )]
    public function handleProviderCallback($provider)
    {
        if (session()->has('auth_social_locale')) {
            App::setLocale(session()->get('auth_social_locale'));
        }

        if (!in_array($provider, $this->getProvidersAvailable())) {
            return redirect(config('app.url_client') . '/signin?error=invalid_provider');
        }

        try {
            $providerUser = Socialite::driver($provider)->stateless()->user();
        } catch (\Exception $e) {
            return redirect(config('app.url_client') . '/signin?error=auth_failed');
        }

        $socialIdentity = UserSocialIdentity
            ::where('provider_name', $provider)
            ->where('provider_id', $providerUser->getId())
            ->first();
        $avatarUrl = $providerUser->getAvatar();

        if ($socialIdentity) {
            $user = $socialIdentity->user;
        } else {
            $user = User::where('email', $providerUser->getEmail())->first();
            if ($user) {
                $user->socialIdentities()->create([
                    'provider_name' => $provider,
                    'provider_id' => $providerUser->getId(),
                ]);
            } else {
                $user = DB::transaction(function () use ($providerUser, $provider) {
                    $organization = Organization::create();

                    $newUser = User::create([
                        'organization_id' => $organization->id,
                        'name' => $providerUser->getName(),
                        'email' => $providerUser->getEmail(),
                        'email_verified_at' => now(),
                        'password' => Hash::make(Str::random(32)),
                    ]);

                    $newUser->socialIdentities()->create([
                        'provider_name' => $provider,
                        'provider_id' => $providerUser->getId(),
                    ]);

                    return $newUser;
                });

                $user->notify(new SystemNotification(
                    __('Welcome to :name', ['name' => config('app.name')]),
                    __('We are thrilled to have you on board. Feel free to explore and let us know if you need any help.')
                ));
            }
        }

        if ($avatarUrl && !$user->profile) {
            try {
                $response = Http::get($avatarUrl);
                if ($response->failed()) {
                    throw new \Exception("It was not possible to obtain the social media avatar.");
                }
                $file = $response->body();
                $processed = ImagePreparationService::from($file)->fitBytes();

                $width = $processed->width();
                $height = $processed->height();
                $bytes = $processed->getAsBytes();
                $ext = $processed->getExtension();
                $mime = $processed->getMimetype();

                $filepath = StoragePathService::getUserProfilePath($user->id, "profile.{$ext}");
                Storage::put($filepath, $bytes);

                $user->profile()->updateOrCreate([
                    'organization_id' => $user->organization_id,
                    'path' => $filepath,
                    'disk' => 's3',
                    'size' => strlen($bytes),
                    'width' => $width,
                    'height' => $height,
                    'mime_type' => $mime,
                ]);
            } catch (ConnectionException | \Exception $e) {
                Log::error("Falha ao processar avatar social: {$e->getMessage()}", [
                    'user_id' => $user->id,
                    'url' => $avatarUrl,
                    'trace' => $e->getTraceAsString(),
                ]);
            }
        }

        Auth::login($user, true);
        return redirect(config('app.url_client') . '/app')
            ->withCookie(
                'logged_in',
                '1',
                60 * 24 * 7,
                '/',
                null,
                true,
                false,
                false,
                'Lax'
            );
    }

    #[OA\Post(
        path: '/api/auth/send-code',
        summary: 'Envia o código de verificação para o email',
        tags: ['Auth'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(ref: '#/components/schemas/AuthSendCodeRequest')
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Código enviado',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'status', type: 'string', example: 'success'),
                        new OA\Property(property: 'message', type: 'string', example: 'Code sent successfully')
                    ]
                )
            )
        ]
    )]
    public function sendCode(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|max:255|unique:users',
        ]);
        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors()->first()
            ], 422);
        }

        try {
            $code = strtoupper(Str::random(6));

            if ($request->input('type') === 'token') {
                EmailVerification::updateOrCreate(
                    ['email' => $request->email],
                    ['code' => $code, 'verified_at' => null]
                );
            } else {
                $request->session()->put('confirmation_code', $code);
                $request->session()->put('confirmation_email', $request->email);
            }

            Mail::to($request->email)->send(new EmailConfirmation($code));

            return response()->json([
                'status' => 'success',
                'message' => __('Code sent successfully'),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => __('We had a problem sending your email, please try again later'),
            ], 500);
        }
    }

    #[OA\Post(
        path: '/api/auth/send-recovery-link',
        summary: 'Envia o link de recuperação de senha',
        tags: ['Auth'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(ref: '#/components/schemas/AuthSendRecoveryLinkRequest')
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Link enviado com sucesso',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'status', type: 'string', example: 'success'),
                        new OA\Property(property: 'message', type: 'string', example: 'Code sent successfully')
                    ]
                )
            )
        ]
    )]
    public function sendRecoveryLink(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|max:255',
        ]);
        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors()->first()
            ], 422);
        }

        try {
            $user = User::where('email', $request->email)->first();
            if (!$user) {
                return response()->json([
                    'status' => 'error',
                    'message' => __("We can't find a user with that e-mail address"),
                ]);
            }

            $token = $user->currentAccessToken();
            if (!$token) {
                $token = Password::createToken($user);
            }

            Mail::to($request->email)->send(new EmailPasswordReset($user, $token));

            return response()->json([
                'status' => 'success',
                'message' => __('Code sent successfully'),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => __('We had a problem sending your email, please try again later'),
            ], 500);
        }
    }

    #[OA\Post(
        path: '/api/auth/validate-recovery-token',
        summary: 'Valida o token de recuperação de senha',
        tags: ['Auth'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(ref: '#/components/schemas/AuthValidateRecoveryTokenRequest')
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Token válido',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'status', type: 'string', example: 'success'),
                        new OA\Property(property: 'message', type: 'string', example: 'Token validated successfully')
                    ]
                )
            )
        ]
    )]
    public function validateRecoveryToken(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'token' => 'required|size:64',
            'email' => 'required|email|max:255',
        ]);
        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors()->first()
            ], 422);
        }

        try {
            $user = User::where('email', $request->email)->first();
            if (!$user) {
                return response()->json([
                    'status' => 'error',
                    'message' => __("We can't find a user with that e-mail address"),
                ]);
            }

            $status = Password::tokenExists($user, $request->token);
            if (!$status) {
                return response()->json([
                    'status' => 'error',
                    'message' => __('Token not found or has expired'),
                ]);
            }

            return response()->json([
                'status' => 'success',
                'message' => __('Token validated successfully'),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => __('We had a problem sending your email, please try again later'),
            ], 500);
        }
    }

    #[OA\Post(
        path: '/api/auth/change-password',
        summary: 'Altera a senha do usuário',
        tags: ['Auth'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(ref: '#/components/schemas/AuthChangePasswordRequest')
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Senha alterada',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'status', type: 'string', example: 'success'),
                        new OA\Property(property: 'message', type: 'string', example: 'Your password was successfully changed')
                    ]
                )
            )
        ]
    )]
    public function changePassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'token' => 'required|size:64',
            'email' => 'required|email|max:255',
            'password' => 'required|string|min:6|confirmed',
        ]);
        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors()->first()
            ], 422);
        }

        try {
            $status = Password::reset(
                $request->only('email', 'password', 'password_confirmation', 'token'),
                function ($user, $password) {
                    $user->forceFill([
                        'password' => Hash::make($password),
                    ])->save();

                    event(new PasswordReset($user));
                }
            );

            if ($status !== Password::PasswordReset) {
                return response()->json([
                    'status' => 'error',
                    'message' => __('Password reset link has expired. Please request a new one'),
                ]);
            }

            return response()->json([
                'status' => 'success',
                'message' => __('Your password was successfully changed'),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => __('We had a problem sending your email, please try again later'),
            ], 500);
        }
    }

    #[OA\Post(
        path: '/api/auth/confirm-code',
        summary: 'Confirma o código enviado para o email',
        tags: ['Auth'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(ref: '#/components/schemas/AuthConfirmCodeRequest')
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Código confirmado',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'status', type: 'string', example: 'success'),
                        new OA\Property(property: 'message', type: 'string', example: 'Email verified successfully')
                    ]
                )
            )
        ]
    )]
    public function confirmCode(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|max:255|unique:users',
            'code' => 'required|string|size:6|alpha_num',
        ]);
        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors()->first()
            ], 422);
        }

        try {
            if ($request->input('type') === 'token') {
                $verification = EmailVerification::where('email', $request->email)
                    ->where('code', $request->code)
                    ->first();

                if (!$verification) {
                    return response()->json([
                        'status' => 'error',
                        'message' => __('The verification code entered is invalid'),
                    ], 422);
                }

                $verification->update(['verified_at' => now()]);
            } else {
                $attempts = $request->session()->get('confirmation_attempts', 0);
                $attemptsMax = config('auth.max_email_confirmation_attempts');
                if ($attempts >= $attemptsMax) {
                    return response()->json([
                        'status' => 'max_attempts',
                        'message' => __('Maximum number of attempts reached'),
                    ], 422);
                }

                $code = $request->code;
                $email = $request->email;

                $codeSession = $request->session()->get('confirmation_code');
                $emailSession = $request->session()->get('confirmation_email');
                if (!$codeSession || !$emailSession) {
                    return response()->json([
                        'status' => 'error',
                        'message' => __('Verification code has expired'),
                    ], 422);
                }

                $request->session()->put('confirmation_attempts', $attempts + 1);
                if ($code !== $codeSession || $email !== $emailSession) {
                    return response()->json([
                        'status' => 'error',
                        'message' => __('The verification code entered is invalid'),
                    ], 422);
                }

                $request->session()->put('email_verified_at', now()->toDateTimeString());
            }

            return response()->json([
                'status' => 'success',
                'message' => __('Email verified successfully'),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => __('We were unable to confirm your code, please try again later'),
            ], 500);
        }
    }

    #[OA\Post(
        path: '/api/auth/register',
        summary: 'Registra um novo usuário',
        tags: ['Auth'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(ref: '#/components/schemas/AuthRegisterRequest')
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Usuário registrado',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'status', type: 'string', example: 'success'),
                        new OA\Property(property: 'message', type: 'string', example: 'Registration completed successfully'),
                        new OA\Property(property: 'user', ref: '#/components/schemas/User'),
                        new OA\Property(property: 'token', type: 'string', nullable: true, example: '1|tokenstring')
                    ]
                )
            )
        ]
    )]
    public function register(Request $request): JsonResponse
    {
        if ($request->input('type') !== 'token') {
            $request->merge([
                'email' => $request->session()->get('confirmation_email'),
                'email_verified_at' => $request->session()->get('email_verified_at'),
            ]);
        } else {
            // Validate if the email was verified in the database
            $verification = EmailVerification::where('email', $request->email)
                ->whereNotNull('verified_at')
                ->first();

            if (!$verification) {
                return response()->json([
                    'status' => 'error',
                    'message' => __('Email not verified'),
                ], 422);
            }

            $request->merge([
                'email_verified_at' => $verification->verified_at->format('Y-m-d H:i:s'),
            ]);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6|confirmed',
            'email_verified_at' => 'required|date_format:Y-m-d H:i:s'
        ]);
        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors()->first()
            ], 422);
        }

        $validated = $validator->validated();

        try {
            $user = DB::transaction(function () use ($validated) {
                $organization = Organization::create();
                $user = User::create([
                    'organization_id' => $organization->id,
                    'name' => $validated['name'],
                    'email' => $validated['email'],
                    'email_verified_at' => $validated['email_verified_at'],
                    'password' => Hash::make($validated['password']),
                ]);

                $user->notify(new SystemNotification(
                    __('Welcome to :name', ['name' => config('app.name')]),
                    __('We are thrilled to have you on board. Feel free to explore and let us know if you need any help.')
                ));

                return $user;
            });
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'We had a problem creating your new account, please try again later',
            ], 422);
        }

        if ($request->input('type') === 'token') {
            $token = $user->createToken('api-token')->plainTextToken;
            return response()->json([
                'status' => 'success',
                'message' => __('Registration completed successfully'),
                'user' => new UserResource($user),
                'token' => $token,
            ]);
        }

        Auth::login($user);

        return response()->json([
            'status' => 'success',
            'message' => __('Registration completed successfully'),
            'user' => new UserResource($user),
        ])->cookie(
            'logged_in',
            '1',
            240,
            '/',
            null,
            true,
            false,
            false,
            'Lax'
        );
    }

    #[OA\Post(
        path: '/api/auth/login',
        summary: 'Realiza login na aplicação',
        tags: ['Auth'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(ref: '#/components/schemas/AuthLoginRequest')
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Login efetuado com sucesso',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'status', type: 'string', example: 'success'),
                        new OA\Property(property: 'message', type: 'string', example: 'Login successfully'),
                        new OA\Property(property: 'user', ref: '#/components/schemas/User'),
                        new OA\Property(property: 'token', type: 'string', nullable: true, example: '1|tokenstring')
                    ]
                )
            )
        ]
    )]
    public function login(Request $request): JsonResponse
    {
        $isTokenMode = $request->input('type') === 'token';

        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
            'remember_me' => 'boolean',
            'device_name' => 'string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors()->first()
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'status' => 'error',
                'message' => __('Email or Password is incorrect'),
            ], 401);
        }

        $user->load('address');

        if ($isTokenMode) {
            $deviceName = $request->device_name ?? 'web';
            $token = $user->createToken($deviceName)->plainTextToken;

            return response()->json([
                'status' => 'success',
                'message' => __('Login successfully'),
                'user' => new UserResource($user),
                'token' => $token,
            ]);
        }

        Auth::login($user, $request->boolean('remember_me'));
        $request->session()->regenerate();

        $minutes = $request->boolean('remember_me')
            ? 60 * 24 * 7
            : 60 * 2;

        return response()->json([
            'status' => 'success',
            'message' => __('Login successfully'),
            'user' => new UserResource($user),
        ])->cookie(
            'logged_in',
            '1',
            $minutes,
            '/',
            null,
            true,
            false,
            false,
            'Lax'
        );
    }

    #[OA\Get(
        path: '/api/me',
        summary: 'Current authenticated user',
        description: 'Retorna o usuário autenticado.',
        security: [['sanctum' => []]],
        tags: ['Auth'],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Successful response',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'status', type: 'string', example: 'success'),
                        new OA\Property(property: 'message', type: 'string', example: 'User successfully obtained'),
                        new OA\Property(property: 'user', ref: '#/components/schemas/User')
                    ]
                )
            )
        ]
    )]
    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'message' => __('User successfully obtained'),
            'user' => new UserResource($request->user()),
        ]);
    }

    #[OA\Post(
        path: '/api/logout',
        summary: 'Realiza logout e invalida o token',
        security: [['sanctum' => []]],
        tags: ['Auth'],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Logout efetuado com sucesso',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'status', type: 'string', example: 'success'),
                        new OA\Property(property: 'message', type: 'string', example: 'Logout successfully')
                    ]
                )
            )
        ]
    )]
    public function logout(Request $request): \Illuminate\Http\JsonResponse
    {
        // Delete the Sanctum token if the request was authenticated via Bearer
        $currentToken = $request->user()->currentAccessToken();
        if ($currentToken && method_exists($currentToken, 'delete')) {
            $currentToken->delete();
        }

        // Always invalidate the session — even in token mode, direct browser→API
        // calls create a Laravel session that would otherwise keep re-authenticating.
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'status' => 'success',
            'message' => __('Logout successfully'),
        ])->cookie(
            'logged_in',
            '',
            -1,
            '/',
            null,
            true,
            false,
            false,
            'Lax'
        );
    }
}
