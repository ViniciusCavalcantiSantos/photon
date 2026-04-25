<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\NotificationResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;
use OpenApi\Attributes as OA;

class NotificationController extends Controller
{
    #[OA\Get(
        path: '/api/notifications/sse-ticket',
        summary: 'Obtém um ticket para conexão Server-Sent Events (SSE)',
        security: [['sanctum' => []]],
        tags: ['Notifications'],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Ticket obtido com sucesso',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'status', type: 'string', example: 'success'),
                        new OA\Property(property: 'message', type: 'string', example: 'Ticket obtained successfully'),
                        new OA\Property(property: 'ticket', type: 'string', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000')
                    ]
                )
            )
        ]
    )]
    public function getSseTicket(Request $request)
    {
        $ticket = Str::uuid()->toString();
        $userId = $request->user()->id;

        Redis::setex("sse_auth:{$ticket}", 60, $userId);

        return response()->json([
            'status' => 'success',
            'message' => 'Ticket obtained successfully',
            'ticket' => $ticket,
        ]);
    }

    #[OA\Get(
        path: '/api/notifications',
        summary: 'Lista as notificações do usuário',
        security: [['sanctum' => []]],
        tags: ['Notifications'],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Notificações obtidas com sucesso',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'status', type: 'string', example: 'success'),
                        new OA\Property(property: 'message', type: 'string', example: 'Notifications obtained successfully'),
                        new OA\Property(
                            property: 'notifications',
                            type: 'array',
                            items: new OA\Items(ref: '#/components/schemas/Notification')
                        ),
                        new OA\Property(
                            property: 'meta',
                            type: 'object',
                            properties: [
                                new OA\Property(property: 'total', type: 'integer', example: 100),
                                new OA\Property(property: 'current_page', type: 'integer', example: 1),
                                new OA\Property(property: 'last_page', type: 'integer', example: 10),
                                new OA\Property(property: 'per_page', type: 'integer', example: 10),
                                new OA\Property(property: 'from', type: 'integer', example: 1),
                                new OA\Property(property: 'to', type: 'integer', example: 10),
                            ]
                        )
                    ]
                )
            )
        ]
    )]
    public function index(Request $request)
    {
        return response()->json([
            'status' => 'success',
            'message' => 'Notifications obtained successfully',
            'notifications' => NotificationResource::collection($request->user()->notifications()->paginate(10))
        ]);
    }

    #[OA\Post(
        path: '/api/notifications/{id}/read',
        summary: 'Marca uma notificação como lida',
        security: [['sanctum' => []]],
        tags: ['Notifications'],
        parameters: [
            new OA\PathParameter(name: 'id', required: true, description: 'ID da notificação', schema: new OA\Schema(type: 'string'))
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Notificação marcada como lida',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'status', type: 'string', example: 'success'),
                        new OA\Property(property: 'message', type: 'string', example: 'Notifications updated successfully')
                    ]
                )
            )
        ]
    )]
    public function read(Request $request, $id)
    {
        $notification = $request->user()->notifications()->findOrFail($id);
        $notification->markAsRead();

        return response()->json([
            'status' => 'success',
            'message' => 'Notifications updated successfully',
        ]);
    }

    #[OA\Post(
        path: '/api/notifications/read-all',
        summary: 'Marca todas as notificações como lidas',
        security: [['sanctum' => []]],
        tags: ['Notifications'],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Notificações atualizadas com sucesso',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'status', type: 'string', example: 'success'),
                        new OA\Property(property: 'message', type: 'string', example: 'Notifications updated successfully')
                    ]
                )
            )
        ]
    )]
    public function readAll(Request $request)
    {
        $request->user()->unreadNotifications->markAsRead();
        return response()->json([
            'status' => 'success',
            'message' => 'Notifications updated successfully',
        ]);
    }

    #[OA\Delete(
        path: '/api/notifications/{id}/dismiss',
        summary: 'Remove uma notificação',
        security: [['sanctum' => []]],
        tags: ['Notifications'],
        parameters: [
            new OA\PathParameter(name: 'id', required: true, description: 'ID da notificação', schema: new OA\Schema(type: 'string'))
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Notificação removida com sucesso',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'status', type: 'string', example: 'success'),
                        new OA\Property(property: 'message', type: 'string', example: 'Notification dismissed successfully')
                    ]
                )
            )
        ]
    )]
    public function dismiss(Request $request, $id)
    {
        $request->user()->notifications()->find($id)?->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Notification dismissed successfully',
        ]);
    }

    #[OA\Get(
        path: '/api/notifications/stream',
        summary: 'Stream de notificações via SSE',
        security: [['sanctum' => []]],
        tags: ['Notifications'],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Stream estabelecida',
                content: new OA\MediaType(mediaType: 'text/event-stream')
            )
        ]
    )]
    public function stream(Request $request)
    {
        set_time_limit(0);
        session_write_close();

        $userId = $request->user()->id;

        return new StreamedResponse(function () use ($userId) {
            // Headers iniciais do SSE
            echo ":" . str_repeat(" ", 2048) . "\n";
            echo "retry: 2000\n\n";
            if (ob_get_level() > 0) {
                ob_flush();
            }
            flush();

            $channel = 'sse:user:' . $userId;

            try {
                // Fica "preso" aqui escutando o Redis. Zero uso de CPU enquanto espera.
                // Requer que o 'read_write_timeout' do Redis esteja alto ou -1 (infinito)
                Redis::subscribe([$channel], function ($message) {
                    echo "data: $message\n\n";

                    if (ob_get_level() > 0) {
                        ob_flush();
                    }
                    flush();
                });
            } catch (\Exception $e) {
            }
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'Connection' => 'keep-alive',
            'X-Accel-Buffering' => 'no',
        ]);
    }
}
