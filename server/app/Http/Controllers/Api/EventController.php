<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\EventRequest;
use App\Http\Resources\EventResource;
use App\Http\Resources\ImageResource;
use App\Models\Contract;
use App\Models\Event;
use App\Models\EventType;
use App\Services\EventService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use OpenApi\Attributes as OA;

class EventController extends Controller
{
    #[OA\Get(
        path: '/api/events',
        summary: 'Lista eventos',
        security: [['sanctum' => []]],
        tags: ['Events'],
        parameters: [
            new OA\QueryParameter(name: 'per_page', required: false, description: 'Itens por página', schema: new OA\Schema(type: 'integer')),
            new OA\QueryParameter(name: 'search', required: false, description: 'Termo de busca', schema: new OA\Schema(type: 'string')),
            new OA\QueryParameter(name: 'with_contract', required: false, description: 'Carrega o contrato relacionado', schema: new OA\Schema(type: 'boolean'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Eventos retornados')
        ]
    )]
    public function index(Request $request)
    {
        $organizationId = auth()->user()->organization_id;
        $perPage = $request->integer('per_page', 15);
        $searchTerm = $request->string('search');
        $load = ['type'];
        $withContract = $request->boolean('with_contract');
        if ($withContract) {
            $load[] = 'contract';
        }

        $eventsQuery = Event
            ::where('events.organization_id', $organizationId)
            ->with($load)
            ->withCount([
                'images as images_count' => function ($q) {
                    $q->where('type', 'original');
                }
            ])
            ->withSum([
                'images as images_bytes' => function ($q) {
                    $q->where('type', 'original');
                }
            ], 'size')
            ->latest();

        $eventsQuery->when($searchTerm->isNotEmpty(), function ($query) use ($searchTerm, $withContract) {
            $query->where(function ($q) use ($searchTerm, $withContract) {
                $term = "%{$searchTerm}%";
                $q->where('searchable', 'LIKE', $term);

                if ($withContract) {
                    $q->orWhereHas('contract', function ($q2) use ($term) {
                        $q2->where('searchable', 'LIKE', $term);
                    });
                }
            });
        });

        $events = $eventsQuery->paginate($perPage);
        return response()->json([
            'status' => 'success',
            'message' => __('Events retrieved successfully'),
            'events' => EventResource::collection($events),
            'meta' => [
                'total' => $events->total(),
                'current_page' => $events->currentPage(),
                'last_page' => $events->lastPage(),
                'per_page' => $events->perPage(),
                'from' => $events->firstItem(),
                'to' => $events->lastItem(),
            ],
        ]);
    }

    #[OA\Post(
        path: '/api/events',
        summary: 'Cria um novo evento',
        security: [['sanctum' => []]],
        tags: ['Events'],
        responses: [
            new OA\Response(response: 200, description: 'Evento criado')
        ]
    )]
    public function store(EventRequest $request, EventService $eventService)
    {
        Gate::authorize('create', Event::class);

        try {
            $event = $eventService->createEvent($request);
            $event->load('type');
            return response()->json([
                'status' => 'success',
                'message' => __('Event created'),
                'event' => new EventResource($event)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => __('Could not perform action')
            ]);
        }
    }

    #[OA\Get(
        path: '/api/events/{event}',
        summary: 'Exibe os detalhes de um evento',
        security: [['sanctum' => []]],
        tags: ['Events'],
        parameters: [
            new OA\PathParameter(name: 'event', required: true, description: 'ID do evento', schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Detalhes do evento')
        ]
    )]
    public function show(Request $request, Event $event)
    {
        Gate::authorize('view', $event);

        $load = ['type'];
        if ($request->boolean('with_contract')) {
            $load[] = 'contract';
            $load[] = 'contract.category';
        }

        $event = Event::query()
            ->whereKey($event->getKey())
            ->with($load)
            ->withCount([
                'images as images_count' => fn($q) => $q->where('type', 'original'),
            ])
            ->withSum([
                'images as images_bytes' => fn($q) => $q->where('type', 'original'),
            ], 'size')
            ->firstOrFail();

        return response()->json([
            'status' => 'success',
            'message' => __('Event retrieved'),
            'event' => new EventResource($event),
        ]);
    }

    #[OA\Put(
        path: '/api/events/{event}',
        summary: 'Atualiza um evento',
        security: [['sanctum' => []]],
        tags: ['Events'],
        parameters: [
            new OA\PathParameter(name: 'event', required: true, description: 'ID do evento', schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Evento atualizado')
        ]
    )]
    public function update(EventRequest $request, EventService $eventService, Event $event)
    {
        Gate::authorize('update', $event);

        try {
            $event = $eventService->updateEvent($event, $request);
            $event->load('type');
            return response()->json([
                'status' => 'success',
                'message' => __('Event updated'),
                'event' => new EventResource($event)
            ]);
        } catch (\Exception $e) {
            var_dump($e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => __('Could not perform action')
            ]);
        }
    }

    #[OA\Delete(
        path: '/api/events/{event}',
        summary: 'Remove um evento',
        security: [['sanctum' => []]],
        tags: ['Events'],
        parameters: [
            new OA\PathParameter(name: 'event', required: true, description: 'ID do evento', schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Evento removido')
        ]
    )]
    public function destroy(Event $event)
    {
        Gate::authorize('delete', $event);

        if (!$event->delete()) {
            return response()->json([
                'status' => 'error',
                'message' => __('Could not perform action')
            ], 500);
        }

        return response()->json([
            'status' => 'success',
            'message' => __('Event deleted')
        ]);
    }

    #[OA\Get(
        path: '/api/events/types/{contract}',
        summary: 'Retorna os tipos de evento permitidos para um contrato',
        security: [['sanctum' => []]],
        tags: ['Events'],
        parameters: [
            new OA\PathParameter(name: 'contract', required: true, description: 'ID do contrato', schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Tipos de evento retornados')
        ]
    )]
    public function getEventTypes(\Request $request, Contract $contract)
    {
        Gate::authorize('view', $contract);

        $eventTypes = EventType
            ::where('category_id', $contract->category_id)
            ->get()
            ->map(function ($eventType) {
                return [
                    'id' => $eventType->id,
                    'name' => __($eventType->name),
                ];
            });

        return response()->json([
            'status' => 'success',
            'message' => __('Event types retrieved'),
            'eventTypes' => $eventTypes
        ]);
    }

    #[OA\Get(
        path: '/api/events/{event}/images',
        summary: 'Retorna as imagens de um evento',
        security: [['sanctum' => []]],
        tags: ['Events'],
        parameters: [
            new OA\PathParameter(name: 'event', required: true, description: 'ID do evento', schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Imagens retornadas')
        ]
    )]
    public function getImages(Event $event)
    {
        Gate::authorize('view', $event);

        $images = $event
            ->images()
            ->originals()
            ->with([
                'versions' => fn($q) => $q->whereIn('type', ['web', 'thumb']),
                'clientsOnThisImage'
            ])
            ->get();

        foreach ($images as $image) {
            $image->clients_on_image_count = $image->clientsOnThisImage->unique()->count();
        }

        return response()->json([
            'status' => 'success',
            'message' => __('Event images retrieved'),
            'images' => ImageResource::collection($images)
        ]);
    }
}
