<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: "EventType",
    required: ["id", "name", "category"],
    properties: [
        new OA\Property(property: "id", type: "integer", example: 3),
        new OA\Property(property: "name", type: "string", example: "Ensaio"),
        new OA\Property(property: "category", ref: "#/components/schemas/ContractCategory")
    ]
)]
#[OA\Schema(
    schema: "Event",
    required: ["id", "contractId", "eventDate", "type", "totalImages", "totalSize", "createdAt", "autoAssignClients"],
    properties: [
        new OA\Property(property: "id", type: "integer", example: 12),
        new OA\Property(property: "contractId", type: "integer", example: 5),
        new OA\Property(property: "title", type: "string", format: "date", example: "Salão Nobre – 13/12"),
        new OA\Property(property: "eventDate", type: "string", format: "date", example: "2025-11-06"),
        new OA\Property(property: "startTime", type: "string", format: "time", nullable: true, example: "14:30"),
        new OA\Property(property: "description", type: "string", nullable: true, example: "Cobertura da formatura"),
        new OA\Property(property: "createdAt", type: "string", format: "date-time", example: "2025-11-06T12:00:00Z"),
        new OA\Property(property: "contract", ref: "#/components/schemas/Contract", nullable: true),
        new OA\Property(property: "totalImages", type: "integer", example: 120),
        new OA\Property(property: "totalSize", description: "bytes", type: "integer", example: 34567890),
        new OA\Property(property: "autoAssignClients", description: "Informa se o evento vai atribuir clientes automaticamente", type: "boolean", example: false),
        new OA\Property(property: "type", ref: "#/components/schemas/EventType")
    ]
)]
class EventResource extends JsonResource
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
            'contractId' => $this->contract_id,
            'title' => $this->title,
            'eventDate' => $this->event_date->format('Y-m-d'),
            'startTime' => $this->start_time?->format('H:i'),
            'description' => $this->description,
            'createdAt' => $this->created_at->toIso8601String(),
            'contract' => new ContractResource($this->whenLoaded('contract')),
            'totalImages' => $this->images_count,
            'totalSize' => (int) $this->images_bytes,
            'autoAssignClients' => (bool) $this->auto_assign_clients,
            'type' => $this->whenLoaded('type', function ($type) {
                $type->load('category');
                return [
                    'id' => $type->id,
                    'name' => __($type->name),
                    'category' => new CategoryResource($type->category),
                ];
            }),
        ];
    }
}
