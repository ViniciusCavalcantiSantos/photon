<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\LocationController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Symfony\Component\Process\Process;

Route::get('/locations/countries', [LocationController::class, 'getCountries']);
Route::get('/locations/countries/{country_cca2}/states', [LocationController::class, 'getStates']);
Route::get(
    '/locations/countries/{country_cca2}/states/{state_code}/cities',
    [LocationController::class, 'getCities']
);

Route::post('/public/clients/register/{linkId}', [ClientController::class, 'storePublic']);

Route::post('/deploy/webhook', function (Request $request) {
    $githubSecret = config('app.github_webhook_secret');

    if (!$githubSecret) {
        Log::error('DEPLOY ABORTADO: GITHUB_WEBHOOK_SECRET não está configurado.');
        abort(500, 'Webhook secret não configurado no servidor.');
    }

    $signature = $request->header('X-Hub-Signature-256');

    $hash = 'sha256=' . hash_hmac('sha256', $request->getContent(), $githubSecret);
    if (!hash_equals($signature, $hash)) {
        Log::warning('DEPLOY RECUSADO: Assinatura do webhook inválida.');
        abort(403, 'Assinatura inválida.');
    }

    $scriptPath = '/usr/pr/deploy.sh';

    Log::info('>>> INICIANDO DEPLOY AUTOMÁTICO VIA WEBHOOK <<<');
    $process = new Process(['sudo', '-u', 'pruser', '/bin/bash', $scriptPath]);
    $process->run();

    if (!$process->isSuccessful()) {
        Log::error('Falha no deploy automático.', [
            'exit_code' => $process->getExitCode(),
            'output' => $process->getOutput(),
            'error_output' => $process->getErrorOutput(),
        ]);
        return response()->json(['status' => 'falha', 'output' => $process->getErrorOutput()], 500);
    }

    Log::info('Deploy executado com sucesso.', ['output' => $process->getOutput()]);

    return response()->json(['status' => 'sucesso', 'output' => $process->getOutput()]);
});
