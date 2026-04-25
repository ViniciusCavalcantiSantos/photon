<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: "Contract",
    required: ["id", "code", "title", "category", "address", "createdAt"],
    properties: [
        new OA\Property(property: "id", type: "integer", example: 1),
        new OA\Property(property: "code", type: "string", example: "CONT-0001"),
        new OA\Property(property: "title", type: "string", example: "Formatura 3º Ano 2025"),
        new OA\Property(property: "createdAt", type: "string", format: "date-time", example: "2025-11-06T12:00:00Z"),
        new OA\Property(property: "category", ref: "#/components/schemas/ContractCategory"),
        new OA\Property(property: "address", ref: "#/components/schemas/CityAreaAddress"),
        new OA\Property(property: "graduationDetails", ref: "#/components/schemas/GraduationDetails", nullable: true)
    ]
)]
class ContractResource extends JsonResource
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
            'code' => $this->code,
            'title' => $this->title,
            'createdAt' => $this->created_at->toIso8601String(),
            'category' => new CategoryResource($this->whenLoaded('category')),
            'address' => new AddressResource($this->whenLoaded('address')),
            'graduationDetails' => new GraduationDetailResource($this->whenLoaded('graduationDetail')),
        ];
    }
}
