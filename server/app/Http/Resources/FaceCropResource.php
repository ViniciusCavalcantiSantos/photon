<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: "FaceCrop",
    required: ["id", "eventId", "originalImageId", "boxX", "boxY", "boxW", "boxH", "dismissed"],
    properties: [
        new OA\Property(property: "id", type: "integer", example: 2),
        new OA\Property(property: "eventId", type: "integer", example: 90),
        new OA\Property(property: "originalImageId", type: "string", example: "01kabknvc1fy2cvgen915mb0t3"),
        new OA\Property(property: "boxX", type: "integer", example: 1388),
        new OA\Property(property: "boxY", type: "integer", example: 195),
        new OA\Property(property: "boxW", type: "integer", example: 440),
        new OA\Property(property: "boxH", type: "integer", example: 195),
        new OA\Property(property: "bestClientId", type: "integer", nullable: true, example: null),
        new OA\Property(property: "bestConfidence", type: "number", format: "float", nullable: true, example: null),
        new OA\Property(property: "dismissed", description: "0 para false, 1 para true", type: "integer", example: 0),
        new OA\Property(property: "createdAt", type: "string", format: "date-time", example: "2025-11-18T13:50:17.000000Z"),
        new OA\Property(property: "updatedAt", type: "string", format: "date-time", example: "2025-11-18T13:50:17.000000Z")
    ]
)]
class FaceCropResource extends JsonResource
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
            'eventId' => $this->event_id,
            'originalImageId' => $this->original_image_id,
            'boxX' => $this->box_x,
            'boxY' => $this->box_y,
            'boxW' => $this->box_w,
            'boxH' => $this->box_h,
            'bestClientId' => $this->best_client_id,
            'bestConfidence' => $this->best_confidence,
            'dismissed' => $this->dismissed,
            'createdAt' => $this->created_at,
            'updatedAt' => $this->updated_at
        ];
    }
}
