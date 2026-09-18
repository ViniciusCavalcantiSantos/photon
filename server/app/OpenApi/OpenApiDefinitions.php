<?php

namespace App\OpenApi;

use OpenApi\Attributes as OA;

#[OA\Tag(name: 'Auth', description: 'Authentication and current-user endpoints')]
#[OA\Tag(name: 'Locations', description: 'Countries, states, and cities lookup endpoints')]
#[OA\Tag(name: 'Contracts', description: 'Contract management endpoints')]
#[OA\Tag(name: 'Events', description: 'Event management endpoints')]
#[OA\Tag(name: 'EventPhotos', description: 'Event photo upload endpoints')]
#[OA\Tag(name: 'Clients', description: 'Client management endpoints')]
#[OA\Tag(name: 'Assignments', description: 'Client-to-event assignment endpoints')]
#[OA\Tag(name: 'Images', description: 'Image retrieval and metadata endpoints')]
#[OA\Tag(name: 'Notifications', description: 'User notification endpoints')]
#[OA\Schema(
    schema: 'PaginationMeta',
    required: ['total', 'current_page', 'last_page', 'per_page', 'from', 'to'],
    properties: [
        new OA\Property(property: 'total', type: 'integer', example: 100),
        new OA\Property(property: 'current_page', type: 'integer', example: 1),
        new OA\Property(property: 'last_page', type: 'integer', example: 10),
        new OA\Property(property: 'per_page', type: 'integer', example: 15),
        new OA\Property(property: 'from', type: 'integer', nullable: true, example: 1),
        new OA\Property(property: 'to', type: 'integer', nullable: true, example: 15),
    ]
)]
#[OA\Schema(
    schema: 'ValidationErrorResponse',
    required: ['status', 'message', 'errors'],
    properties: [
        new OA\Property(property: 'status', type: 'string', example: 'error'),
        new OA\Property(property: 'message', type: 'string', example: 'The email field is required.'),
        new OA\Property(
            property: 'errors',
            type: 'object',
            additionalProperties: new OA\AdditionalProperties(
                type: 'array',
                items: new OA\Items(type: 'string')
            )
        ),
    ]
)]
#[OA\Schema(
    schema: 'UnauthorizedResponse',
    required: ['status', 'message'],
    properties: [
        new OA\Property(property: 'status', type: 'string', example: 'not_authenticated'),
        new OA\Property(property: 'message', type: 'string', example: 'Usuário não autenticado.'),
    ]
)]
#[OA\Schema(
    schema: 'ForbiddenResponse',
    required: ['status', 'message'],
    properties: [
        new OA\Property(property: 'status', type: 'string', example: 'forbidden'),
        new OA\Property(property: 'message', type: 'string', example: 'Ação não autorizada.'),
    ]
)]
#[OA\Schema(
    schema: 'AuthSendCodeRequest',
    required: ['email'],
    properties: [
        new OA\Property(property: 'email', type: 'string', format: 'email', example: 'user@example.com'),
        new OA\Property(
            property: 'type',
            type: 'string',
            nullable: true,
            enum: ['token', 'session'],
            example: 'token',
            description: 'Use `token` when testing through Swagger and you want the follow-up auth flow to return a bearer token.'
        ),
    ]
)]
#[OA\Schema(
    schema: 'AuthSendRecoveryLinkRequest',
    required: ['email'],
    properties: [
        new OA\Property(property: 'email', type: 'string', format: 'email', example: 'user@example.com'),
    ]
)]
#[OA\Schema(
    schema: 'AuthValidateRecoveryTokenRequest',
    required: ['email', 'token'],
    properties: [
        new OA\Property(property: 'email', type: 'string', format: 'email', example: 'user@example.com'),
        new OA\Property(property: 'token', type: 'string', minLength: 64, maxLength: 64, example: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'),
    ]
)]
#[OA\Schema(
    schema: 'AuthChangePasswordRequest',
    required: ['email', 'token', 'password', 'password_confirmation'],
    properties: [
        new OA\Property(property: 'email', type: 'string', format: 'email', example: 'user@example.com'),
        new OA\Property(property: 'token', type: 'string', minLength: 64, maxLength: 64, example: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'),
        new OA\Property(property: 'password', type: 'string', format: 'password', minLength: 6, example: 'secret123'),
        new OA\Property(property: 'password_confirmation', type: 'string', format: 'password', minLength: 6, example: 'secret123'),
    ]
)]
#[OA\Schema(
    schema: 'AuthConfirmCodeRequest',
    required: ['email', 'code'],
    properties: [
        new OA\Property(property: 'email', type: 'string', format: 'email', example: 'user@example.com'),
        new OA\Property(property: 'code', type: 'string', minLength: 6, maxLength: 6, example: 'ABC123'),
        new OA\Property(
            property: 'type',
            type: 'string',
            nullable: true,
            enum: ['token', 'session'],
            example: 'token',
            description: 'Use `token` when confirming the code for a token-based registration flow.'
        ),
    ]
)]
#[OA\Schema(
    schema: 'AuthRegisterRequest',
    required: ['name', 'email', 'password', 'password_confirmation'],
    properties: [
        new OA\Property(property: 'name', type: 'string', maxLength: 255, example: 'Vinicius'),
        new OA\Property(property: 'email', type: 'string', format: 'email', example: 'vinicius@example.com'),
        new OA\Property(property: 'password', type: 'string', format: 'password', minLength: 6, example: 'secret123'),
        new OA\Property(property: 'password_confirmation', type: 'string', format: 'password', minLength: 6, example: 'secret123'),
        new OA\Property(
            property: 'type',
            type: 'string',
            nullable: true,
            enum: ['token', 'session'],
            example: 'token',
            description: 'Use `token` to get a bearer token response that can be pasted into the Swagger Authorize dialog.'
        ),
    ]
)]
#[OA\Schema(
    schema: 'AuthLoginRequest',
    required: ['email', 'password'],
    properties: [
        new OA\Property(property: 'email', type: 'string', format: 'email', example: 'vinicius@example.com'),
        new OA\Property(property: 'password', type: 'string', format: 'password', example: 'secret123'),
        new OA\Property(property: 'remember_me', type: 'boolean', default: false, example: true),
        new OA\Property(property: 'device_name', type: 'string', nullable: true, maxLength: 255, example: 'swagger-ui'),
        new OA\Property(
            property: 'type',
            type: 'string',
            nullable: true,
            enum: ['token', 'session'],
            example: 'token',
            description: 'Use `token` in Swagger so login returns a Sanctum token. Then click Authorize and paste `Bearer <token>`.'
        ),
    ]
)]
#[OA\Schema(
    schema: 'ClientFormRequest',
    required: ['name', 'profile'],
    properties: [
        new OA\Property(property: 'code', type: 'string', nullable: true, maxLength: 20, example: 'CLI-0001'),
        new OA\Property(property: 'name', type: 'string', maxLength: 60, example: 'João dos Testes'),
        new OA\Property(property: 'profile', type: 'string', format: 'binary', description: 'Image file up to 25 MB'),
        new OA\Property(property: 'birthdate', type: 'string', format: 'date', nullable: true, example: '2010-03-25'),
        new OA\Property(property: 'phone', type: 'string', nullable: true, maxLength: 20, example: '+55 81 98888-7777'),
        new OA\Property(property: 'inform_address', type: 'boolean', default: false, example: true),
        new OA\Property(property: 'postal_code', type: 'string', nullable: true, maxLength: 12, example: '50000-000'),
        new OA\Property(property: 'street', type: 'string', nullable: true, maxLength: 120, example: 'Rua das Flores'),
        new OA\Property(property: 'number', type: 'string', nullable: true, maxLength: 10, example: '123'),
        new OA\Property(property: 'neighborhood', type: 'string', nullable: true, maxLength: 40, example: 'Centro'),
        new OA\Property(property: 'complement', type: 'string', nullable: true, maxLength: 120, example: 'Apto 201'),
        new OA\Property(property: 'city', type: 'string', nullable: true, maxLength: 40, example: 'Recife'),
        new OA\Property(property: 'state', type: 'string', nullable: true, maxLength: 12, example: 'PE'),
        new OA\Property(property: 'country', type: 'string', nullable: true, minLength: 2, maxLength: 2, example: 'BR'),
        new OA\Property(property: 'inform_guardian', type: 'boolean', default: false, example: true),
        new OA\Property(property: 'guardian_name', type: 'string', nullable: true, maxLength: 60, example: 'Maria da Silva'),
        new OA\Property(property: 'guardian_type', type: 'string', nullable: true, enum: ['mother', 'father', 'grandmother', 'grandfather', 'uncle', 'aunt', 'sister', 'brother', 'godmother', 'godfather', 'other'], example: 'mother'),
        new OA\Property(property: 'guardian_email', type: 'string', format: 'email', nullable: true, maxLength: 60, example: 'mae@example.com'),
        new OA\Property(property: 'guardian_phone', type: 'string', nullable: true, maxLength: 20, example: '+55 81 97777-6666'),
        new OA\Property(property: 'assignments', type: 'array', nullable: true, items: new OA\Items(type: 'integer'), example: [1, 2]),
    ]
)]
#[OA\Schema(
    schema: 'ClientUpdateFormRequest',
    properties: [
        new OA\Property(property: 'code', type: 'string', nullable: true, maxLength: 20, example: 'CLI-0001'),
        new OA\Property(property: 'name', type: 'string', maxLength: 60, example: 'João dos Testes'),
        new OA\Property(property: 'profile', type: 'string', format: 'binary', nullable: true, description: 'Optional image file up to 25 MB'),
        new OA\Property(property: 'birthdate', type: 'string', format: 'date', nullable: true, example: '2010-03-25'),
        new OA\Property(property: 'phone', type: 'string', nullable: true, maxLength: 20, example: '+55 81 98888-7777'),
        new OA\Property(property: 'inform_address', type: 'boolean', default: false, example: true),
        new OA\Property(property: 'postal_code', type: 'string', nullable: true, maxLength: 12, example: '50000-000'),
        new OA\Property(property: 'street', type: 'string', nullable: true, maxLength: 120, example: 'Rua das Flores'),
        new OA\Property(property: 'number', type: 'string', nullable: true, maxLength: 10, example: '123'),
        new OA\Property(property: 'neighborhood', type: 'string', nullable: true, maxLength: 40, example: 'Centro'),
        new OA\Property(property: 'complement', type: 'string', nullable: true, maxLength: 120, example: 'Apto 201'),
        new OA\Property(property: 'city', type: 'string', nullable: true, maxLength: 40, example: 'Recife'),
        new OA\Property(property: 'state', type: 'string', nullable: true, maxLength: 12, example: 'PE'),
        new OA\Property(property: 'country', type: 'string', nullable: true, minLength: 2, maxLength: 2, example: 'BR'),
        new OA\Property(property: 'inform_guardian', type: 'boolean', default: false, example: true),
        new OA\Property(property: 'guardian_name', type: 'string', nullable: true, maxLength: 60, example: 'Maria da Silva'),
        new OA\Property(property: 'guardian_type', type: 'string', nullable: true, enum: ['mother', 'father', 'grandmother', 'grandfather', 'uncle', 'aunt', 'sister', 'brother', 'godmother', 'godfather', 'other'], example: 'mother'),
        new OA\Property(property: 'guardian_email', type: 'string', format: 'email', nullable: true, maxLength: 60, example: 'mae@example.com'),
        new OA\Property(property: 'guardian_phone', type: 'string', nullable: true, maxLength: 20, example: '+55 81 97777-6666'),
        new OA\Property(property: 'assignments', type: 'array', nullable: true, items: new OA\Items(type: 'integer'), example: [1, 2]),
    ]
)]
#[OA\Schema(
    schema: 'ClientPublicRegisterFormRequest',
    required: ['name', 'profile', 'birthdate', 'phone'],
    properties: [
        new OA\Property(property: 'code', type: 'string', nullable: true, maxLength: 20, example: 'CLI-0001'),
        new OA\Property(property: 'name', type: 'string', maxLength: 60, example: 'João dos Testes'),
        new OA\Property(property: 'profile', type: 'string', format: 'binary', description: 'Image file up to 25 MB'),
        new OA\Property(property: 'birthdate', type: 'string', format: 'date', example: '2010-03-25'),
        new OA\Property(property: 'phone', type: 'string', maxLength: 20, example: '+55 81 98888-7777'),
        new OA\Property(property: 'postal_code', type: 'string', nullable: true, maxLength: 12, example: '50000-000'),
        new OA\Property(property: 'street', type: 'string', nullable: true, maxLength: 120, example: 'Rua das Flores'),
        new OA\Property(property: 'number', type: 'string', nullable: true, maxLength: 10, example: '123'),
        new OA\Property(property: 'neighborhood', type: 'string', nullable: true, maxLength: 40, example: 'Centro'),
        new OA\Property(property: 'complement', type: 'string', nullable: true, maxLength: 120, example: 'Apto 201'),
        new OA\Property(property: 'city', type: 'string', nullable: true, maxLength: 40, example: 'Recife'),
        new OA\Property(property: 'state', type: 'string', nullable: true, maxLength: 12, example: 'PE'),
        new OA\Property(property: 'country', type: 'string', nullable: true, minLength: 2, maxLength: 2, example: 'BR'),
        new OA\Property(property: 'guardian_name', type: 'string', nullable: true, maxLength: 60, example: 'Maria da Silva'),
        new OA\Property(property: 'guardian_type', type: 'string', nullable: true, enum: ['mother', 'father', 'grandmother', 'grandfather', 'uncle', 'aunt', 'sister', 'brother', 'godmother', 'godfather', 'other'], example: 'mother'),
        new OA\Property(property: 'guardian_email', type: 'string', format: 'email', nullable: true, maxLength: 60, example: 'mae@example.com'),
        new OA\Property(property: 'guardian_phone', type: 'string', nullable: true, maxLength: 20, example: '+55 81 97777-6666'),
    ]
)]
#[OA\Schema(
    schema: 'ClientGenerateLinkRequest',
    required: ['title', 'require_address', 'require_guardian_if_minor', 'max_registers'],
    properties: [
        new OA\Property(property: 'title', type: 'string', minLength: 3, maxLength: 80, example: 'Cadastro Formatura 2026'),
        new OA\Property(property: 'require_address', type: 'boolean', example: true),
        new OA\Property(property: 'require_guardian_if_minor', type: 'boolean', example: true),
        new OA\Property(property: 'max_registers', type: 'integer', minimum: 1, maximum: 999, example: 100),
        new OA\Property(property: 'assignments', type: 'array', nullable: true, items: new OA\Items(type: 'integer'), example: [1, 2]),
    ]
)]
#[OA\Schema(
    schema: 'ContractCreateRequest',
    required: ['title', 'country', 'state', 'city', 'category', 'code'],
    properties: [
        new OA\Property(property: 'title', type: 'string', maxLength: 180, example: 'Formatura 3º Ano 2026'),
        new OA\Property(property: 'country', type: 'string', minLength: 2, maxLength: 2, example: 'BR'),
        new OA\Property(property: 'state', type: 'string', maxLength: 12, example: 'PE'),
        new OA\Property(property: 'city', type: 'string', maxLength: 40, example: 'Recife'),
        new OA\Property(property: 'category', type: 'string', example: 'graduation', description: 'Contract category slug'),
        new OA\Property(property: 'code', type: 'string', maxLength: 40, example: 'CONT-2026-01'),
        new OA\Property(property: 'type', type: 'string', nullable: true, enum: ['university', 'school'], example: 'university', description: 'Required when category is `graduation`.'),
        new OA\Property(property: 'institution_name', type: 'string', nullable: true, maxLength: 180, example: 'Universidade Federal do Recife'),
        new OA\Property(property: 'institution_acronym', type: 'string', nullable: true, maxLength: 20, example: 'UFR'),
        new OA\Property(property: 'class', type: 'string', nullable: true, maxLength: 40, example: 'Turma A'),
        new OA\Property(property: 'shift', type: 'string', nullable: true, enum: ['morning', 'afternoon', 'night', 'full_time'], example: 'night'),
        new OA\Property(property: 'conclusion_year', type: 'string', nullable: true, pattern: '^[0-9]{4}$', example: '2026'),
        new OA\Property(property: 'university_course', type: 'string', nullable: true, maxLength: 120, example: 'Computer Science'),
        new OA\Property(property: 'school_grade_level', type: 'string', nullable: true, enum: ['elementary_school', 'middle_school', 'high_school'], example: 'high_school'),
    ]
)]
#[OA\Schema(
    schema: 'ContractUpdateRequest',
    properties: [
        new OA\Property(property: 'title', type: 'string', maxLength: 180, example: 'Formatura 3º Ano 2026'),
        new OA\Property(property: 'country', type: 'string', minLength: 2, maxLength: 2, example: 'BR'),
        new OA\Property(property: 'state', type: 'string', maxLength: 12, example: 'PE'),
        new OA\Property(property: 'city', type: 'string', maxLength: 40, example: 'Recife'),
        new OA\Property(property: 'code', type: 'string', maxLength: 40, example: 'CONT-2026-01'),
        new OA\Property(property: 'type', type: 'string', nullable: true, enum: ['university', 'school'], example: 'university', description: 'Required for graduation contracts.'),
        new OA\Property(property: 'institution_name', type: 'string', nullable: true, maxLength: 180, example: 'Universidade Federal do Recife'),
        new OA\Property(property: 'institution_acronym', type: 'string', nullable: true, maxLength: 20, example: 'UFR'),
        new OA\Property(property: 'class', type: 'string', nullable: true, maxLength: 40, example: 'Turma A'),
        new OA\Property(property: 'shift', type: 'string', nullable: true, enum: ['morning', 'afternoon', 'night', 'full_time'], example: 'night'),
        new OA\Property(property: 'conclusion_year', type: 'string', nullable: true, pattern: '^[0-9]{4}$', example: '2026'),
        new OA\Property(property: 'university_course', type: 'string', nullable: true, maxLength: 120, example: 'Computer Science'),
        new OA\Property(property: 'school_grade_level', type: 'string', nullable: true, enum: ['elementary_school', 'middle_school', 'high_school'], example: 'high_school'),
    ]
)]
#[OA\Schema(
    schema: 'EventCreateRequest',
    required: ['contract', 'title', 'event_type', 'event_date'],
    properties: [
        new OA\Property(property: 'contract', type: 'integer', example: 5),
        new OA\Property(property: 'title', type: 'string', maxLength: 180, example: 'Baile de Formatura'),
        new OA\Property(property: 'event_type', type: 'integer', example: 3),
        new OA\Property(property: 'event_date', type: 'string', format: 'date', example: '2026-12-13'),
        new OA\Property(property: 'event_start_time', type: 'string', nullable: true, pattern: '^(?:[01][0-9]|2[0-3]):[0-5][0-9]$', example: '19:30'),
        new OA\Property(property: 'description', type: 'string', nullable: true, maxLength: 300, example: 'Cobertura completa do baile'),
        new OA\Property(property: 'auto_assign_clients', type: 'boolean', nullable: true, example: true),
    ]
)]
#[OA\Schema(
    schema: 'EventUpdateRequest',
    properties: [
        new OA\Property(property: 'contract', type: 'integer', example: 5),
        new OA\Property(property: 'title', type: 'string', maxLength: 180, example: 'Baile de Formatura'),
        new OA\Property(property: 'event_type', type: 'integer', example: 3),
        new OA\Property(property: 'event_date', type: 'string', format: 'date', example: '2026-12-13'),
        new OA\Property(property: 'event_start_time', type: 'string', nullable: true, pattern: '^(?:[01][0-9]|2[0-3]):[0-5][0-9]$', example: '19:30'),
        new OA\Property(property: 'description', type: 'string', nullable: true, maxLength: 300, example: 'Cobertura completa do baile'),
        new OA\Property(property: 'auto_assign_clients', type: 'boolean', nullable: true, example: true),
    ]
)]
#[OA\Schema(
    schema: 'EventPhotoUploadRequest',
    required: ['event_id', 'photo'],
    properties: [
        new OA\Property(property: 'event_id', type: 'integer', example: 12),
        new OA\Property(property: 'photo', type: 'string', format: 'binary', description: 'Image file up to 25 MB'),
    ]
)]
class OpenApiDefinitions
{
}
