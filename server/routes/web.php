<?php

use App\Http\Controllers\Api\AssignmentController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\ContractController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\EventPhotoController;
use App\Http\Controllers\Api\ImageController;
use App\Http\Controllers\Api\NotificationController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::prefix('/api')->group(function () {
    // --- AUTHENTICATION ---
    Route::prefix('/auth')->group(function () {
        Route::post('/send-code', [AuthController::class, 'sendCode']);
        Route::post('/send-recovery-link', [AuthController::class, 'sendRecoveryLink']);
        Route::post('/validate-recovery-token', [AuthController::class, 'validateRecoveryToken']);
        Route::post('/change-password', [AuthController::class, 'changePassword']);
        Route::post('/confirm-code', [AuthController::class, 'confirmCode']);

        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);

        Route::get('/available-providers', [AuthController::class, 'availableProviders']);
        Route::get('/{provider}/redirect', [AuthController::class, 'redirectToProvider']);
        Route::get('/{provider}/callback', [AuthController::class, 'handleProviderCallback']);
    });

    // --- IMAGES ---
    Route::prefix('/images/{image}')->group(function () {
        Route::get('/', [ImageController::class, 'show'])->name('images.show');
        Route::delete('/', [ImageController::class, 'destroy'])->name('images.delete');

        Route::get('/download', [ImageController::class, 'download'])->name('images.download');
        Route::get('/metadata', [ImageController::class, 'metadata'])->name('images.metadata');
        Route::get('/clients', [ImageController::class, 'clientOnImage'])->name('images.clients');
        Route::get('/clients/{client}/crop', [ImageController::class, 'getClientCrop'])->name('images.clients.crop');
    });

    // --- PROTECTED ROUTES ---
    Route::middleware('auth:sanctum')->group(function () {
        /* USUÁRIO */
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']); // 👈 aqui

        /* CONTRATOS */
        Route::get('/contracts/categories', [ContractController::class, 'getCategories']);
        Route::apiResource('/contracts', ContractController::class);

        /* EVENTOS */
        Route::get('events/types/{contract}', [EventController::class, 'getEventTypes']);
        Route::apiResource('/events', EventController::class);
        Route::get('events/{event}/images', [EventController::class, 'getImages']);
        Route::apiResource('/events/photos', EventPhotoController::class);

        /* CLIENTES */
        Route::apiResource('/clients', ClientController::class);
        Route::get('/clients/links/{linkId}', [ClientController::class, 'getLinkInfo']);
        Route::post('/clients/links', [ClientController::class, 'generateLink']);

        /* ATRIBUIÇÃO DOS CLIENTES */
        Route::get('clients/{client}/assignments', [AssignmentController::class, 'show']);
        Route::post('clients/{client}/assignments', [AssignmentController::class, 'store']);
        Route::post('clients/assignments/bulk', [AssignmentController::class, 'storeBulk']);
        Route::delete('clients/assignments/bulk', [AssignmentController::class, 'destroyBulk']);

        Route::prefix('/notifications')->group(function () {
            Route::get('/sse-ticket', [NotificationController::class, 'getSseTicket']);

            Route::get('/', [NotificationController::class, 'index']);
            Route::delete('/{id}/dismiss', [NotificationController::class, 'dismiss']);
            Route::post('/{id}/read', [NotificationController::class, 'read']);
            Route::post('/read-all', [NotificationController::class, 'readAll']);
            Route::get('/stream', [NotificationController::class, 'stream']);
        });
    });
});
