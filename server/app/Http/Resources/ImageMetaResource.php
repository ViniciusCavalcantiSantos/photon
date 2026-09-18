<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: "ImageMeta",
    description: "Metadados EXIF e técnicos da imagem",
    properties: [
        new OA\Property(
            property: "camera",
            type: "object",
            properties: [
                new OA\Property(property: "make", type: "string", example: "Canon"),
                new OA\Property(property: "model", type: "string", example: "Canon EOS 6D Mark II"),
                new OA\Property(property: "lens", type: "string", example: "EF85mm f/1.8 USM"),
                new OA\Property(property: "software", type: "string", example: "Adobe Lightroom Classic 14.5"),
                new OA\Property(property: "capturedAt", type: "string", example: "2025-08-03 21:30:33")
            ]
        ),
        new OA\Property(
            property: "exposure",
            type: "object",
            properties: [
                new OA\Property(property: "exposureProgram", type: "string", example: "1"),
                new OA\Property(property: "exposureTime", type: "string", example: "1/160"),
                new OA\Property(property: "fNumber", type: "string", example: "f/2.5"),
                new OA\Property(property: "iso", type: "integer", example: 320),
                new OA\Property(property: "focalLength", type: "string", example: "85mm"),
                new OA\Property(property: "flash", type: "integer", example: 9)
            ]
        ),
        new OA\Property(
            property: "location",
            type: "object",
            properties: [
                new OA\Property(property: "latitude", type: "number", example: -8.3312),
                new OA\Property(property: "longitude", type: "number", example: -36.4201)
            ]
        ),
        new OA\Property(property: "other", description: "Metadados adicionais não padronizados", type: "object")
    ]
)]
class ImageMetaResource extends JsonResource
{
    /**
     * @param  Request  $request
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        $flat = [];
        foreach ($this->resource as $meta) {
            $flat[$meta->key] = $meta->value;
        }

        $data = [
            'camera' => $this->cameraGroup($flat),
            'exposure' => $this->exposureGroup($flat),
            'location' => $this->locationGroup($flat),
            'other' => $this->otherGroup($flat),
        ];

        return array_filter($data, fn($value) => !empty($value));
    }

    protected function cameraGroup(array $flat): array
    {
        return array_filter([
            'make' => $flat['IFD0.Make'] ?? null,
            'model' => $flat['IFD0.Model'] ?? null,
            'lens' => $flat['EXIF.UndefinedTag:0xA434'] ?? null,
            'software' => $flat['IFD0.Software'] ?? null,
            'capturedAt' => $flat['EXIF.DateTimeOriginal'] ?? ($flat['IFD0.DateTime'] ?? null),
        ]);
    }

    protected function exposureGroup(array $flat): array
    {
        return array_filter([
            'exposureProgram' => $flat['EXIF.ExposureProgram'] ?? null,
            'exposureTime' => $flat['EXIF.ExposureTime'] ?? null,
            'fNumber' => $flat['EXIF.FNumber'] ?? null,
            'iso' => $flat['EXIF.ISOSpeedRatings'] ?? null,
            'focalLength' => $flat['EXIF.FocalLength'] ?? null,
            'flash' => $flat['EXIF.Flash'] ?? null,
        ]);
    }

    protected function locationGroup(array $flat): array
    {
        return array_filter([
            'latitude' => $flat['GPS.GPSLatitude'] ?? null,
            'longitude' => $flat['GPS.GPSLongitude'] ?? null,
        ]);
    }

    protected function otherGroup(array $flat): array
    {
        $known = [
            'IFD0.Make', 'IFD0.Model', 'IFD0.Software', 'IFD0.DateTime',
            'EXIF.DateTimeOriginal', 'EXIF.ExposureProgram', 'EXIF.ExposureTime',
            'EXIF.FNumber', 'EXIF.ISOSpeedRatings', 'EXIF.FocalLength', 'EXIF.Flash',
            'EXIF.UndefinedTag:0xA434', 'GPS.GPSLatitude', 'GPS.GPSLongitude',
        ];

        $other = [];
        foreach ($flat as $key => $value) {
            if (in_array($key, $known, true)) {
                continue;
            }

            if (str_starts_with($key, 'UndefinedTag')) {
                continue;
            }

            $other[$key] = $value;
        }

        return $other;
    }
}
