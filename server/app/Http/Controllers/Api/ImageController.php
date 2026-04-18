<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ClientResource;
use App\Http\Resources\FaceCropMatchResource;
use App\Http\Resources\ImageMetaResource;
use App\Models\Client;
use App\Models\FaceCropMatch;
use App\Models\Image;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;
use OpenApi\Attributes as OA;

class ImageController extends Controller
{
    #[OA\Get(
        path: '/api/images/{image}',
        summary: 'Exibe uma imagem',
        tags: ['Images'],
        parameters: [
            new OA\PathParameter(name: 'image', required: true, description: 'ID da imagem', schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Stream da imagem')
        ]
    )]
    public function show(Request $request, Image $image): StreamedResponse
    {
        $disk = Storage::disk($image->disk);
        $path = $image->path;

        if (!$disk->exists($path)) {
            abort(404);
        }

        $size = $disk->size($path);

        if ($image->size !== $size) {
            $image->update(['size' => $size]);
        }

        return new StreamedResponse(
            function () use ($disk, $path) {
                $stream = $disk->readStream($path);
                fpassthru($stream);
                if (is_resource($stream)) {
                    fclose($stream);
                }
            },
            200,
            [
                'Content-Type' => $image->mime_type ?? 'application/octet-stream',
                'Content-Disposition' => 'inline; filename="'.basename($path).'"',
                'Content-Length' => $image->size, 'X-Accel-Buffering' => 'no'
            ]
        );
    }

    #[OA\Get(
        path: '/api/images/{image}/download',
        summary: 'Baixa a imagem original',
        tags: ['Images'],
        parameters: [
            new OA\PathParameter(name: 'image', required: true, description: 'ID da imagem', schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Download da imagem')
        ]
    )]
    public function download(Request $request, Image $image)
    {
        $disk = Storage::disk($image->disk);
        if ($image->parent_id) {
            $image = $image->original()->first();
        }

        return $disk->download($image->path, basename($image->original_name));
    }


    #[OA\Get(
        path: '/api/images/{image}/metadata',
        summary: 'Recupera os metadados da imagem',
        tags: ['Images'],
        parameters: [
            new OA\PathParameter(name: 'image', required: true, description: 'ID da imagem', schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Metadados recuperados')
        ]
    )]
    public function metadata(Image $image)
    {
        if ($image->parent_id) {
            $image = $image->original()->first();
        }

        return response()->json([
            'status' => 'success',
            'message' => __('Event images retrieved'),
            'metadata' => new ImageMetaResource($image->metas)
        ]);
    }

    #[OA\Get(
        path: '/api/images/{image}/clients',
        summary: 'Retorna a lista de clientes identificados em uma imagem',
        tags: ['Images'],
        parameters: [
            new OA\PathParameter(name: 'image', required: true, description: 'ID da imagem', schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Clientes recuperados')
        ]
    )]
    public function clientOnImage(Image $image)
    {
        $image = $image->parent_id ? $image->original : $image;

        return response()->json([
            'status' => 'success',
            'message' => __('Client on image retrieved successfully'),
            'clients' => ClientResource::collection($image->clientsOnThisImage)
        ]);
    }


    #[OA\Get(
        path: '/api/images/{image}/clients/{client}/crop',
        summary: 'Obtém o recorte do rosto do cliente na imagem',
        tags: ['Images'],
        parameters: [
            new OA\PathParameter(name: 'image', required: true, description: 'ID da imagem', schema: new OA\Schema(type: 'integer')),
            new OA\PathParameter(name: 'client', required: true, description: 'ID do cliente', schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Recorte obtido')
        ]
    )]
    public function getClientCrop(Image $image, Client $client)
    {
        $image = $image->parent_id ? $image->original : $image;
        $faceCropMatch = FaceCropMatch::where('image_id', $image->id)->where('client_id', $client->id)->first();

        return response()->json([
            'status' => 'success',
            'message' => __('Client on image retrieved successfully'),
            'faceMatch' => new FaceCropMatchResource($faceCropMatch)
        ]);
    }

    #[OA\Delete(
        path: '/api/images/{image}',
        summary: 'Remove uma imagem',
        security: [['sanctum' => []]],
        tags: ['Images'],
        parameters: [
            new OA\PathParameter(name: 'image', required: true, description: 'ID da imagem', schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Imagem removida')
        ]
    )]
    public function destroy(Image $image)
    {
        if ($image->parent_id) {
            $image = $image->original()->first();
        }

        if (!$image->delete()) {
            return response()->json([
                'status' => 'error',
                'message' => __('Could not perform action')
            ], 500);
        }

        return response()->json([
            'status' => 'success',
            'message' => __('Image deleted')
        ]);
    }
}
