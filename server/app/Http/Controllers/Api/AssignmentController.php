<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\ReconcilePendingFaces;
use App\Models\Client;
use App\Models\PendingFaceReconciliation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use OpenApi\Attributes as OA;

class AssignmentController extends Controller
{

    /**
     * Store a newly created resource in storage.
     */
    #[OA\Post(
        path: '/api/clients/{client}/assignments',
        summary: 'Atribui eventos a um cliente',
        security: [['sanctum' => []]],
        tags: ['Assignments'],
        parameters: [
            new OA\PathParameter(name: 'client', required: true, description: 'ID do cliente', schema: new OA\Schema(type: 'integer'))
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'assignments', type: 'array', items: new OA\Items(type: 'integer'), description: 'Array de IDs dos eventos')
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Atribuições atualizadas'),
            new OA\Response(response: 422, description: 'Erro de validação')
        ]
    )]
    public function store(Request $request, Client $client)
    {
        $validator = Validator::make($request->all(), [
            'assignments' => 'array',
            'assignments.*' => 'integer|exists:events,id',
        ], [
            'assignments.*.exists' => __('The selected event was not found in the system'),
        ]);
        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors()->first()
            ], 422);
        }
        $validated = $validator->validated();

        try {
            $before = $client->events()->pluck('events.id')->all();
            $client->events()->sync($validated['assignments']);
            $after = $client->events()->pluck('events.id')->all();

            $added = array_values(array_diff($after, $before));

            if (!empty($added)) {
                $this->signalReconcileForEvents($added);
            }

            return response()->json([
                'status' => 'success',
                'message' => __('Assignments updated')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => __('Could not perform action')
            ]);
        }
    }

    private function signalReconcileForEvents(array $eventIds, int $delaySeconds = 1): void
    {
        $eventIds = array_values(array_unique(array_filter($eventIds)));

        foreach ($eventIds as $eventId) {
            PendingFaceReconciliation::firstOrCreate([
                'event_id' => $eventId,
                'image_id' => null,
                'reason' => 'client_linked',
            ]);

            ReconcilePendingFaces::dispatch($eventId)
                ->delay(now()->addSeconds($delaySeconds));
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    #[OA\Post(
        path: '/api/clients/assignments/bulk',
        summary: 'Atribui eventos em lote para múltiplos clientes',
        security: [['sanctum' => []]],
        tags: ['Assignments'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'client_ids', type: 'array', items: new OA\Items(type: 'integer'), description: 'Array de IDs dos clientes'),
                    new OA\Property(property: 'assignments', type: 'array', items: new OA\Items(type: 'integer'), description: 'Array de IDs dos eventos a serem atribuídos')
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Atribuições atualizadas em lote'),
            new OA\Response(response: 422, description: 'Erro de validação')
        ]
    )]
    public function storeBulk(Request $request)
    {
        $validator = $this->validateBulk($request);
        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors()->first()
            ], 422);
        }
        $validated = $validator->validated();

        try {
            foreach ($validated['client_ids'] as $clientId) {
                $client = Client::find($clientId);
                $client->events()->syncWithoutDetaching($validated['assignments']);
            }

            $this->signalReconcileForEvents($validated['assignments']);

            return response()->json([
                'status' => 'success',
                'message' => __('Assignments updated')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => __('Could not perform action')
            ]);
        }
    }

    public function validateBulk(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'client_ids' => 'required|array',
            'client_ids.*' => 'integer|exists:clients,id',
            'assignments' => 'required|array',
            'assignments.*' => 'integer|exists:events,id',
        ], [
            'client_ids.*.exists' => __('The selected client was not found in the system'),
            'assignments.*.exists' => __('The selected event was not found in the system'),
        ]);

        return $validator;
    }

    /**
     * Store a newly created resource in storage.
     */
    #[OA\Delete(
        path: '/api/clients/assignments/bulk',
        summary: 'Remove atribuições de eventos em lote para múltiplos clientes',
        security: [['sanctum' => []]],
        tags: ['Assignments'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'client_ids', type: 'array', items: new OA\Items(type: 'integer'), description: 'Array de IDs dos clientes'),
                    new OA\Property(property: 'assignments', type: 'array', items: new OA\Items(type: 'integer'), description: 'Array de IDs dos eventos a serem removidos')
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Atribuições removidas em lote'),
            new OA\Response(response: 422, description: 'Erro de validação')
        ]
    )]
    public function destroyBulk(Request $request)
    {
        $validator = $this->validateBulk($request);
        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors()->first()
            ], 422);
        }
        $validated = $validator->validated();

        try {
            foreach ($validated['client_ids'] as $clientId) {
                $client = Client::find($clientId);
                $client->events()->detach($validated['assignments']);
            }

            return response()->json([
                'status' => 'success',
                'message' => __('Assignments updated')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => __('Could not perform action')
            ]);
        }
    }

    /**
     * Display the specified resource.
     */
    #[OA\Get(
        path: '/api/clients/{client}/assignments',
        summary: 'Lista os IDs dos eventos atribuídos a um cliente',
        security: [['sanctum' => []]],
        tags: ['Assignments'],
        parameters: [
            new OA\PathParameter(name: 'client', required: true, description: 'ID do cliente', schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Atribuições recuperadas com sucesso')
        ]
    )]
    public function show(Client $client)
    {
        return response()->json([
            'status' => 'success',
            'message' => __('Assignments retrieved'),
            'assignments' => $client->events()->pluck('event_id')->toArray()
        ]);
    }
}
