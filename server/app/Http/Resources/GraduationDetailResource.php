<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: "GraduationDetails",
    required: ["type", "institutionName", "className", "shift", "conclusionYear"],
    properties: [
        new OA\Property(property: "type", type: "string", example: "university", enum: ["university", "school"]),
        new OA\Property(property: "institutionName", type: "string", example: "Universidade Federal de Pernambuco"),
        new OA\Property(property: "institutionAcronym", type: "string", nullable: true, example: "UFPE"),
        new OA\Property(property: "className", type: "string", example: "Turma 2025"),
        new OA\Property(property: "shift", type: "string", example: "night", enum: ["morning", "afternoon", "night", "full_time"]),
        new OA\Property(property: "conclusionYear", type: "integer", example: 2025),
        new OA\Property(property: "universityCourse", type: "string", nullable: true, example: "Sistemas de Informação"),
        new OA\Property(property: "schoolGradeLevel", type: "string", nullable: true, example: "high_school", enum: ["elementary_school", "middle_school", "high_school"])
    ]
)]
class GraduationDetailResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'type' => $this->type,
            'institutionName' => $this->institution_name,
            'institutionAcronym' => $this->institution_acronym,
            'className' => $this->class,
            'shift' => $this->shift,
            'conclusionYear' => $this->conclusion_year,
            'universityCourse' => $this->when($this->isUniversity(), $this->university_course),
            'schoolGradeLevel' => $this->when($this->isSchool(), $this->school_grade_level),
        ];
    }
}
