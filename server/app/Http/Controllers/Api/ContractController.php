<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ContractRequest;
use App\Http\Resources\ContractResource;
use App\Models\Contract;
use App\Models\ContractCategory;
use App\Services\ContractService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use OpenApi\Attributes as OA;

class ContractController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    #[OA\Get(
        path: '/api/contracts',
        summary: 'Lista contratos',
        security: [['sanctum' => []]],
        tags: ['Contracts'],
        parameters: [
            new OA\QueryParameter(name: 'per_page', required: false, description: 'Itens por página', schema: new OA\Schema(type: 'integer')),
            new OA\QueryParameter(name: 'search', required: false, description: 'Termo de busca', schema: new OA\Schema(type: 'string'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Contratos retornados')
        ]
    )]
    public function index(Request $request)
    {
        $organizationId = auth()->user()->organization_id;
        $perPage = $request->integer('per_page', 15);
        $searchTerm = $request->string('search');

        $contractsQuery = Contract
            ::where('organization_id', $organizationId)
            ->with(['category', 'address', 'graduationDetail'])
            ->latest();

        $contractsQuery->when($searchTerm->isNotEmpty(), function ($query, $term) {
            $query->where('searchable', "LIKE", "%{$term}%");
        });

        $contracts = $contractsQuery->paginate($perPage);
        return response()->json([
            'status' => 'success',
            'message' => __('Contracts retrieved successfully'),
            'contracts' => ContractResource::collection($contracts),
            'meta' => [
                'total' => $contracts->total(),
                'current_page' => $contracts->currentPage(),
                'last_page' => $contracts->lastPage(),
                'per_page' => $contracts->perPage(),
                'from' => $contracts->firstItem(),
                'to' => $contracts->lastItem(),
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    #[OA\Post(
        path: '/api/contracts',
        summary: 'Cria um novo contrato',
        security: [['sanctum' => []]],
        tags: ['Contracts'],
        responses: [
            new OA\Response(response: 200, description: 'Contrato criado'),
            new OA\Response(response: 422, description: 'Erro de validação')
        ]
    )]
    public function store(ContractRequest $request, ContractService $contractService)
    {
        Gate::authorize('create', Contract::class);

        try {
            $contract = $contractService->createContract($request);
            $contract->load('category', 'address', 'graduationDetail');
            return response()->json([
                'status' => 'success',
                'message' => __('Contract created'),
                'contract' => new ContractResource($contract)
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
        path: '/api/contracts/{contract}',
        summary: 'Exibe os detalhes de um contrato',
        security: [['sanctum' => []]],
        tags: ['Contracts'],
        parameters: [
            new OA\PathParameter(name: 'contract', required: true, description: 'ID do contrato', schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Detalhes do contrato')
        ]
    )]
    public function show(Contract $contract)
    {
        Gate::authorize('view', $contract);

        return response()->json([
            'status' => 'success',
            'message' => __('Contract retrieved'),
            'contract' => new ContractResource($contract)
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    #[OA\Put(
        path: '/api/contracts/{contract}',
        summary: 'Atualiza um contrato',
        security: [['sanctum' => []]],
        tags: ['Contracts'],
        parameters: [
            new OA\PathParameter(name: 'contract', required: true, description: 'ID do contrato', schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Contrato atualizado')
        ]
    )]
    public function update(ContractRequest $request, Contract $contract, ContractService $contractService)
    {
        Gate::authorize('update', $contract);

        try {
            $contract = $contractService->updateContract($contract, $request);
            $contract->load('category', 'address', 'graduationDetail');
            return response()->json([
                'status' => 'success',
                'message' => __('Contract updated'),
                'contract' => new ContractResource($contract)
            ]);

        } catch (\Exception $e) {
            var_dump($e->getMessage());
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
        path: '/api/contracts/{contract}',
        summary: 'Remove um contrato',
        security: [['sanctum' => []]],
        tags: ['Contracts'],
        parameters: [
            new OA\PathParameter(name: 'contract', required: true, description: 'ID do contrato', schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Contrato deletado')
        ]
    )]
    public function destroy(Contract $contract)
    {
        Gate::authorize('delete', $contract);

        if (!$contract->delete()) {
            return response()->json([
                'status' => 'error',
                'message' => __('Could not perform action')
            ], 500);
        }

        return response()->json([
            'status' => 'success',
            'message' => __('Contract deleted')
        ]);
    }

    #[OA\Get(
        path: '/api/contracts/categories',
        summary: 'Lista as categorias de contrato',
        security: [['sanctum' => []]],
        tags: ['Contracts'],
        responses: [
            new OA\Response(response: 200, description: 'Categorias retornadas')
        ]
    )]
    public function getCategories()
    {
        $categories = ContractCategory::all()->map(function ($category) {
            return [
                'name' => __($category->name),
                'slug' => $category->slug,
            ];
        });
        return response()->json([
            'status' => 'success',
            'message' => __('All categories obtained'),
            'categories' => $categories
        ]);
    }
}
