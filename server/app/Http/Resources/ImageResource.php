<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: "URLs",
    properties: [
        new OA\Property(property: "original", type: "string", format: "uri", example: "https://s3.amazonaws.com/bucket/image.jpg"),
        new OA\Property(property: "web", type: "string", format: "uri", example: "https://s3.amazonaws.com/bucket/image_webp.webp"),
        new OA\Property(property: "thumb", type: "string", format: "uri", example: "https://s3.amazonaws.com/bucket/image_thum_webp")
    ]
)]
#[OA\Schema(
    schema: "OriginalImageInfo",
    required: ["name", "size", "width", "height", "mimeType"],
    properties: [
        new OA\Property(property: "name", type: "string", example: "IMG_1234"),
        new OA\Property(property: "size", description: "Tamanho em bytes da imagem original (se houver)", type: "integer", nullable: true, example: 2456789),
        new OA\Property(property: "width", description: "Largura da imagem original", type: "integer", example: 1980),
        new OA\Property(property: "height", description: "Altura da imagem original", type: "integer", example: 1080),
        new OA\Property(property: "mimeType", type: "string", example: "image/jpeg")
    ]
)]
#[OA\Schema(
    schema: "Image",
    required: ["id", "url", "type", "size", "mimeType", "createdAt", "updatedAt"],
    properties: [
        new OA\Property(property: "id", type: "string", example: "01J5Q8V6WZ3QC4FJ0V5E5VQ7R9"),
        new OA\Property(property: "url", type: "string", format: "uri", example: "https://s3.amazonaws.com/bucket/image.jpg"),
        new OA\Property(property: "urls", ref: "#/components/schemas/URLs"),
        new OA\Property(property: "type", description: "Versão da imagem (ex: original, web, thumb)", type: "string", example: "original"),
        new OA\Property(property: "size", description: "Tamanho em bytes", type: "integer", example: 2456789),
        new OA\Property(property: "width", description: "Largura da imagem", type: "integer", example: 1980),
        new OA\Property(property: "height", description: "Altura da imagem", type: "integer", example: 1080),
        new OA\Property(property: "mimeType", type: "string", example: "image/jpeg"),
        new OA\Property(property: "original", ref: "#/components/schemas/OriginalImageInfo"),
        new OA\Property(property: "createdAt", type: "string", example: "2025-11-06 10:15:00"),
        new OA\Property(property: "updatedAt", type: "string", example: "2025-11-06 10:20:00"),
        new OA\Property(property: "clientsOnImageCount", description: "Quantidade de clientes detectados na imagem", type: "integer", nullable: true, example: 3)
    ]
)]
class ImageResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $data = [
            'id' => $this->id,
            'url' => $this->url,
            'type' => $this->type,
            'size' => (int) $this->size,
            'width' => (int) $this->width,
            'height' => (int) $this->height,
            'mimeType' => $this->mime_type,
            'createdAt' => $this->created_at->format('Y-m-d H:i:s'),
            'updatedAt' => $this->updated_at->format('Y-m-d H:i:s')
        ];

        if ($this->parent_id) {
            $data['original'] = [
                'name' => $this->original->original_name,
                'size' => $this->original->size,
                'width' => $this->original->width,
                'height' => $this->original->height,
                'mimeType' => $this->original->mime_type,
            ];
        } else {
            $data['original'] = [
                'name' => $this->original_name,
                'size' => $this->size,
                'width' => $this->width,
                'height' => $this->height,
                'mimeType' => $this->mime_type,
            ];
        }

        if ($this->clients_on_image_count !== null) {
            $data['clientsOnImageCount'] = (int) $this->clients_on_image_count;
        }

        $data['urls'] = $this->urls;

        return $data;
    }
}
