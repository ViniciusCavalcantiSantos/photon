<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: "ClientProfileImage",
    required: ["original", "web", "thumb"],
    properties: [
        new OA\Property(property: "original", type: "string", format: "uri", example: "https://.../original.jpg"),
        new OA\Property(property: "web", type: "string", format: "uri", example: "https://.../web.jpg"),
        new OA\Property(property: "thumb", type: "string", format: "uri", example: "https://.../thumb.jpg")
    ]
)]
#[OA\Schema(
    schema: "ClientGuardian",
    required: ["name", "type"],
    properties: [
        new OA\Property(property: "name", type: "string", example: "Maria da Silva"),
        new OA\Property(property: "type", type: "string", example: "mother", enum: ["mother","father","grandmother","grandfather","uncle","aunt","sister","brother","godmother","godfather","other"]),
        new OA\Property(property: "email", type: "string", format: "email", nullable: true, example: "mae@example.com"),
        new OA\Property(property: "phone", type: "string", nullable: true, example: "+55 81 99999-9999")
    ]
)]
#[OA\Schema(
    schema: "Client",
    required: ["id", "profile", "name", "createdAt"],
    properties: [
        new OA\Property(property: "id", type: "integer", example: 10),
        new OA\Property(property: "code", type: "string", example: "CLI-0001"),
        new OA\Property(property: "name", type: "string", example: "João dos Testes"),
        new OA\Property(property: "profile", ref: "#/components/schemas/ClientProfileImage"),
        new OA\Property(property: "birthdate", type: "string", format: "date", nullable: true, example: "2015-03-25"),
        new OA\Property(property: "phone", type: "string", nullable: true, example: "+55 81 98888-7777"),
        new OA\Property(property: "createdAt", type: "string", format: "date-time", example: "2025-11-06T12:00:00Z"),
        new OA\Property(property: "address", ref: "#/components/schemas/FullAddress", nullable: true),
        new OA\Property(property: "guardian", ref: "#/components/schemas/ClientGuardian", nullable: true)
    ]
)]
class ClientResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $array = [
            'id' => $this->id,
            'code' => $this->code,
            'name' => $this->name,
            'profile' => [
                'original' => $this->image->url,
                'web' => optional($this->image->getVersion('web'))->url ?? $this->image->url,
                'thumb' => optional($this->image->getVersion('thumb'))->url ?? $this->image->url,
            ],
            'birthdate' => $this->birthdate?->format('Y-m-d'),
            'phone' => $this->phone,
            'createdAt' => $this->created_at->toIso8601String(),
            'address' => new AddressResource($this->whenLoaded('address')),
        ];

        if ($this->guardian_name) {
            $array = array_merge($array, [
                'guardian' => [
                    'name' => $this->guardian_name,
                    'type' => $this->guardian_type,
                    'email' => $this->guardian_email,
                    'phone' => $this->guardian_phone,
                ],
            ]);
        }

        return $array;
    }
}
