<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: "CityAreaAddress",
    required: ["granularity", "country", "state", "city"],
    properties: [
        new OA\Property(property: "granularity", type: "string", enum: ["city_area"], example: "city_area"),
        new OA\Property(property: "countryName", type: "string", example: "Brasil"),
        new OA\Property(property: "country", type: "string", example: "BR"),
        new OA\Property(property: "stateName", type: "string", example: "Pernambuco"),
        new OA\Property(property: "state", type: "string", example: "PE"),
        new OA\Property(property: "city", type: "string", example: "Recife")
    ]
)]
#[OA\Schema(
    schema: "FullAddress",
    required: ["granularity", "country", "state", "city", "street", "number", "neighborhood"],
    properties: [
        new OA\Property(property: "granularity", type: "string", enum: ["full_address"], example: "full_address"),
        new OA\Property(property: "countryName", type: "string", example: "Brasil"),
        new OA\Property(property: "country", type: "string", example: "BR"),
        new OA\Property(property: "stateName", type: "string", example: "Pernambuco"),
        new OA\Property(property: "state", type: "string", example: "PE"),
        new OA\Property(property: "city", type: "string", example: "Recife"),
        new OA\Property(property: "postalCode", type: "string", example: "10001-1234"),
        new OA\Property(property: "street", type: "string", example: "Rua das Flores"),
        new OA\Property(property: "number", type: "string", example: "123"),
        new OA\Property(property: "neighborhood", type: "string", example: "Centro"),
        new OA\Property(property: "complement", type: "string", nullable: true, example: "Apto 201")
    ]
)]
#[OA\Schema(
    schema: "Address",
    oneOf: [
        new OA\Schema(ref: "#/components/schemas/CityAreaAddress"),
        new OA\Schema(ref: "#/components/schemas/FullAddress")
    ],
    discriminator: new OA\Discriminator(
        propertyName: "granularity",
        mapping: [
            "city_area" => "#/components/schemas/CityAreaAddress",
            "full_address" => "#/components/schemas/FullAddress"
        ]
    )
)]
class AddressResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'granularity' => $this->granularity,
            'postalCode' => $this->postal_code ?? null,
            'street' => $this->street ?? null,
            'number' => $this->number ?? null,
            'neighborhood' => $this->neighborhood ?? null,
            'complement' => $this->complement ?? null,
            'city' => $this->city,
            'state' => $this->state,
            'stateName' => getStateName($this->country, $this->state),
            'country' => $this->country,
            'countryName' => getCountryName($this->country),
        ];
    }
}
