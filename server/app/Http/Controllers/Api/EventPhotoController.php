<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\EventPhotoRequest;
use App\Http\Resources\ImageResource;
use App\Models\Event;
use App\Services\EventPhotoService;
use Illuminate\Validation\ValidationException;
use OpenApi\Attributes as OA;

class EventPhotoController extends Controller
{
    #[OA\Post(
        path: '/api/events/photos',
        summary: 'Faz o upload de uma foto para o evento',
        security: [['sanctum' => []]],
        tags: ['EventPhotos'],
        responses: [
            new OA\Response(response: 200, description: 'Foto salva com sucesso')
        ]
    )]
    public function store(EventPhotoRequest $request, EventPhotoService $eventService)
    {
        $eventId = $request->input('event_id');
        $event = Event::find($eventId);

        if (!$event) {
            return response()->json([
                'status' => 'error',
                'message' => __('Not Found')
            ], 404);
        }

        try {
            $image = $eventService->uploadPhoto($request, $event);
            $event->load('type');
            return response()->json([
                'status' => 'success',
                'message' => __('Photo uploaded'),
                'image' => new ImageResource($image)
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
}
