<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: "NotificationData",
    required: ["message", "description", "action"],
    properties: [
        new OA\Property(property: "message", type: "string", example: "Atualização de sistema"),
        new OA\Property(property: "description", type: "string", example: "O sistema foi atualizado para a versão 2.3."),
        new OA\Property(
            property: "action",
            description: "Dados de ação adicionais (objeto JSON). Pode conter campos como 'type', 'target', etc.",
            type: "object",
            additionalProperties: new OA\AdditionalProperties(type: "string")
        )
    ]
)]
#[OA\Schema(
    schema: "Notification",
    required: ["id", "type", "notifiableType", "notifiableId", "data", "createdAt"],
    properties: [
        new OA\Property(property: "id", type: "string", format: "uuid", example: "311d5e06-7fcf-4a33-b79f-0f2c9e15173c"),
        new OA\Property(property: "type", type: "string", example: "App\\Notifications\\SystemNotification"),
        new OA\Property(property: "notifiableType", type: "string", example: "App\\Models\\User"),
        new OA\Property(property: "notifiableId", type: "integer", example: 123),
        new OA\Property(property: "data", ref: "#/components/schemas/NotificationData"),
        new OA\Property(property: "readAt", type: "string", format: "date-time", nullable: true, example: "2025-11-06T10:15:00Z"),
        new OA\Property(property: "createdAt", type: "string", format: "date-time", example: "2025-11-06T10:15:00Z")
    ]
)]
class NotificationResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'notifiableType' => $this->notifiable_type,
            'notifiableId' => $this->notifiable_id,
            'data' => $this->data,
            'readAt' => $this->read_at,
            'createdAt' => $this->created_at
        ];
    }
}
