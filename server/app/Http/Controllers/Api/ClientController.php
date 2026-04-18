<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ClientPublicRequest;
use App\Http\Requests\ClientRequest;
use App\Http\Resources\ClientResource;
use App\Models\Client;
use App\Models\ClientRegisterLink;
use App\Services\ClientService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use OpenApi\Attributes as OA;

class ClientController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    #[OA\Get(
        path: '/api/clients',
        summary: 'Lista clientes',
        security: [['sanctum' => []]],
        tags: ['Clients'],
        parameters: [
            new OA\QueryParameter(name: 'per_page', required: false, description: 'Itens por página', schema: new OA\Schema(type: 'integer')),
            new OA\QueryParameter(name: 'search', required: false, description: 'Termo de busca', schema: new OA\Schema(type: 'string'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Clientes retornados')
        ]
    )]
    public function index(Request $request)
    {
        $organizationId = auth()->user()->organization_id;
        $perPage = $request->input('per_page', 15);
        $searchTerm = $request->input('search');

        $clientsQuery = Client
            ::where('organization_id', $organizationId)
            ->with(['address'])
            ->latest();

        $clientsQuery->when($searchTerm, function ($query, $term) {
            $query->where('searchable', "LIKE", "%{$term}%");
        });

        $clients = $clientsQuery->paginate($perPage);
        return response()->json([
            'status' => 'success',
            'message' => __('Clients retrieved successfully'),
            'clients' => ClientResource::collection($clients),
            'meta' => [
                'total' => $clients->total(),
                'current_page' => $clients->currentPage(),
                'last_page' => $clients->lastPage(),
                'per_page' => $clients->perPage(),
                'from' => $clients->firstItem(),
                'to' => $clients->lastItem(),
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    #[OA\Post(
        path: '/api/clients',
        summary: 'Cria um novo cliente',
        security: [['sanctum' => []]],
        tags: ['Clients'],
        responses: [
            new OA\Response(response: 200, description: 'Cliente criado'),
            new OA\Response(response: 422, description: 'Erro de validação')
        ]
    )]
    public function store(ClientRequest $request, ClientService $clientService)
    {
        Gate::authorize('create', Client::class);

        try {
            $client = $clientService->createClient($request);
            $client->load('address');
            return response()->json([
                'status' => 'success',
                'message' => __('Client created'),
                'client' => new ClientResource($client)
            ]);
        } catch (ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => __('Could not perform action')
            ]);
        }
    }

    #[OA\Post(
        path: '/api/public/clients/register/{linkId}',
        summary: 'Registra um cliente via link público',
        tags: ['Clients'],
        parameters: [
            new OA\PathParameter(name: 'linkId', required: true, description: 'ID codificado em base64 do link', schema: new OA\Schema(type: 'string'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Cliente cadastrado com sucesso')
        ]
    )]
    public function storePublic(string $linkIdEncoded, ClientPublicRequest $request, ClientService $clientService)
    {
        $linkId = base64_decode($linkIdEncoded);
        $link = ClientRegisterLink::find($linkId);

        if ($link->used_registers >= $link->max_registers) {
            return response()->json([
                'status' => 'error',
                'message' => __('Maximum number of registers reached')
            ]);
        }

        try {
            $client = $clientService->createClient($request, $link->organization_id);
            $link->used_registers += 1;
            $link->save();

            $client->load('address');
            return response()->json([
                'status' => 'success',
                'message' => __('Client created'),
                'client' => new ClientResource($client)
            ]);
        } catch (ValidationException $e) {
            throw $e;
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
        path: '/api/clients/{client}',
        summary: 'Exibe detalhes do cliente',
        security: [['sanctum' => []]],
        tags: ['Clients'],
        parameters: [
            new OA\PathParameter(name: 'client', required: true, description: 'ID do cliente', schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Cliente recuperado')
        ]
    )]
    public function show(Client $client)
    {
        Gate::authorize('view', $client);

        $client->load('address');
        return response()->json([
            'status' => 'success',
            'message' => __('Client retrieved'),
            'client' => new ClientResource($client)
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    #[OA\Put(
        path: '/api/clients/{client}',
        summary: 'Atualiza os dados de um cliente',
        security: [['sanctum' => []]],
        tags: ['Clients'],
        parameters: [
            new OA\PathParameter(name: 'client', required: true, description: 'ID do cliente', schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Cliente atualizado')
        ]
    )]
    public function update(ClientRequest $request, Client $client, ClientService $clientService)
    {
        Gate::authorize('update', $client);

        try {
            $client = $clientService->updateClient($client, $request);
            $client->load('address');
            return response()->json([
                'status' => 'success',
                'message' => __('Client updated'),
                'client' => new ClientResource($client)
            ]);
        } catch (ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => __('Could not perform action')
            ]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    #[OA\Delete(
        path: '/api/clients/{client}',
        summary: 'Remove um cliente',
        security: [['sanctum' => []]],
        tags: ['Clients'],
        parameters: [
            new OA\PathParameter(name: 'client', required: true, description: 'ID do cliente', schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Cliente removido')
        ]
    )]
    public function destroy(ClientService $clientService, Client $client)
    {
        Gate::authorize('delete', $client);

        try {
            $clientService->deleteClient($client);

            return response()->json([
                'status' => 'success',
                'message' => __('Client deleted')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => __('Could not perform action')
            ], 500);
        }
    }

    #[OA\Post(
        path: '/api/clients/links',
        summary: 'Gera um link de cadastro público de clientes',
        security: [['sanctum' => []]],
        tags: ['Clients'],
        responses: [
            new OA\Response(response: 201, description: 'Link criado')
        ]
    )]
    public function generateLink(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|min:3|max:80',
            'require_address' => 'required|boolean',
            'require_guardian_if_minor' => 'required|boolean',
            'max_registers' => 'required|integer|min:1|max:999',
            'assignments' => 'sometimes|array',
            'assignments.*' => 'integer|exists:events,id',
        ]);
        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors()->first()
            ], 422);
        }
        $validated = $validator->validated();
        try {
            $registerLink = ClientRegisterLink::create([
                ...$validated,
                'default_assignments' => $validated['assignments'] ?? null,
                'organization_id' => auth()->user()->organization_id,
            ]);

            return response()->json([
                'status' => 'success',
                'message' => __('Link created'),
                'link_id' => base64_encode($registerLink->id),
            ], 201);

        } catch (\Exception $e) {
            Log::error('Falha ao criar link de cadastro: '.$e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => __('Could not generate link')
            ], 500);
        }
    }

    #[OA\Get(
        path: '/api/clients/links/{linkId}',
        summary: 'Recupera as informações de um link público',
        security: [['sanctum' => []]],
        tags: ['Clients'],
        parameters: [
            new OA\PathParameter(name: 'linkId', required: true, description: 'ID codificado em base64', schema: new OA\Schema(type: 'string'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Informações do link')
        ]
    )]
    public function getLinkInfo($linkIdEncoded)
    {
        $linkId = base64_decode($linkIdEncoded);
        $link = ClientRegisterLink::find($linkId);

        if (!$link) {
            return response()->json([
                'status' => 'error',
                'message' => __('Not Found'),
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'message' => __('link retrieved successfully'),
            'linkInfo' => [
                'id' => $linkIdEncoded,
                'title' => $link->title,
                'maxRegisters' => $link->max_registers,
                'requireAddress' => $link->require_address,
                'requireGuardianIfMinor' => $link->require_guardian_if_minor,
                'defaultLanguage' => $link->organization->users->first()->address->country,
            ]
        ]);
    }
}
