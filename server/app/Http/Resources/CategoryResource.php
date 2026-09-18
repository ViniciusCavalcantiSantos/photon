<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: "ContractCategory",
    required: ["name", "slug"],
    properties: [
        new OA\Property(property: "name", type: "string", example: "Formatura"),
        new OA\Property(property: "slug", type: "string", example: "formatura")
    ]
)]
class CategoryResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'name' => __($this->name),
            'slug' => $this->slug,
        ];
    }
}
