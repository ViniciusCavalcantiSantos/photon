<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Cache;
use PragmaRX\Countries\Package\Countries;
use OpenApi\Attributes as OA;

class LocationController extends Controller
{
    private Countries $countries;

    public function __construct()
    {
        $this->countries = new Countries();
    }

    #[OA\Get(
        path: '/api/locations/countries',
        summary: 'Obtém a lista de países',
        tags: ['Locations'],
        responses: [
            new OA\Response(response: 200, description: 'Lista de países obtida')
        ]
    )]
    public function getCountries()
    {
        $lang = app()->getLocale();
        $langMap = config('localization.pragmarx_lang_map');

        $translationKey = $langMap[$lang] ?? 'eng';

        $countries = Cache::remember("countries_list_{$translationKey}", 86400 * 7,
            function () use ($translationKey) {
                return $this->countries->all()
                    ->filter(function ($country) {
                        return $country->independent === true;
                    })
                    ->sortBy('name.common')
                    ->map(function ($country) use ($translationKey) {
                        $nativeName = optional($country->name->native)->first()->common;
                        $translatedName = data_get(
                            $country,
                            "translations.{$translationKey}.common"
                        ) ?? $country->name->common;

                        return [
                            'value' => $country->cca2,
                            'label' => $country->extra->emoji.' '.$translatedName.($nativeName ? " ({$nativeName})" : ''),
                        ];
                    })->values()->toArray();
            });


        return response()->json([
            'status' => 'success',
            'message' => 'All countries obtained',
            'countries' => $countries,
        ]);
    }

    #[OA\Get(
        path: '/api/locations/countries/{country_cca2}/states',
        summary: 'Obtém a lista de estados de um país',
        tags: ['Locations'],
        parameters: [
            new OA\PathParameter(name: 'country_cca2', required: true, description: 'Código CCA2 do país (ex: BR)', schema: new OA\Schema(type: 'string'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Lista de estados obtida'),
            new OA\Response(response: 404, description: 'País não encontrado')
        ]
    )]
    public function getStates($country_cca2)
    {
        $states = Cache::remember("states_list_{$country_cca2}", 86400 * 7,
            function () use ($country_cca2) {
                $country = $this->countries->where('cca2', strtoupper($country_cca2))->first();
                if ($country->isEmpty()) {
                    return null;
                }

                $states = $country->hydrateStates()->states;
                if ($states->isEmpty()) {
                    return null;
                }

                return $states->map(function ($state) {
                    return [
                        'value' => $state['postal'],
                        'label' => $state['name'],
                    ];
                })->sortBy('label')->values()->toArray();
            });

        if ($states === null) {
            return response()->json([
                'status' => 'error',
                'message' => __('Not Found'),
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'All states obtained',
            'states' => $states,
        ]);
    }

    #[OA\Get(
        path: '/api/locations/countries/{country_cca2}/states/{state_code}/cities',
        summary: 'Obtém a lista de cidades de um estado',
        tags: ['Locations'],
        parameters: [
            new OA\PathParameter(name: 'country_cca2', required: true, description: 'Código CCA2 do país (ex: BR)', schema: new OA\Schema(type: 'string')),
            new OA\PathParameter(name: 'state_code', required: true, description: 'Código do estado (ex: SP)', schema: new OA\Schema(type: 'string'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Lista de cidades obtida'),
            new OA\Response(response: 404, description: 'País ou estado não encontrado')
        ]
    )]
    public function getCities($country_cca2, $state_code)
    {
        $cities = Cache::remember("cities_list_{$country_cca2}_{$state_code}", 86400 * 7,
            function () use ($country_cca2, $state_code) {
                $country = $this->countries->where('cca2', strtoupper($country_cca2))->first();
                if ($country->isEmpty()) {
                    return null;
                }

                $state = $country->hydrateStates()->states->where('postal', $state_code)->first();
                if ($state->isEmpty()) {
                    return null;
                }

                $cities = $state->hydrate('cities')->cities;
                if ($cities->isEmpty()) {
                    return [];
                }

                return $cities->map(function ($city) {
                    return [
                        'value' => $city['name'],
                        'label' => $city['name'],
                    ];
                })->sortBy('label')->values()->toArray();
            });


        if ($cities === null) {
            return response()->json([
                'status' => 'error',
                'message' => __('Not Found'),
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'message' => __('All cities obtained'),
            'cities' => $cities,
        ]);
    }
}
