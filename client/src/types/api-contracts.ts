import type { paths } from "@/types/api";

type HttpMethod = "get" | "post" | "put" | "patch" | "delete";
type SuccessStatusCode = 200 | 201 | 202 | 204;
type ApiEnvelopeKeys = "status" | "message";
type Simplify<T> = { [Key in keyof T]: T[Key] } & {};

type PathOperation<
  Path extends keyof paths,
  Method extends keyof paths[Path] & HttpMethod,
> = NonNullable<paths[Path][Method]>;

type OperationResponses<
  Path extends keyof paths,
  Method extends keyof paths[Path] & HttpMethod,
> = PathOperation<Path, Method> extends { responses: infer Responses }
  ? Responses
  : never;

type SuccessResponse<
  Path extends keyof paths,
  Method extends keyof paths[Path] & HttpMethod,
> = OperationResponses<Path, Method>[Extract<
  keyof OperationResponses<Path, Method>,
  SuccessStatusCode
>];

type JsonResponseContent<Response> = Response extends {
  content: { "application/json": infer Content };
}
  ? Content
  : never;

export type ApiSuccessResponse<
  Path extends keyof paths,
  Method extends keyof paths[Path] & HttpMethod,
> = JsonResponseContent<SuccessResponse<Path, Method>>;

export type ApiPayload<
  Path extends keyof paths,
  Method extends keyof paths[Path] & HttpMethod,
> = Simplify<Required<Omit<ApiSuccessResponse<Path, Method>, ApiEnvelopeKeys>>>;

export type AssignClientResponse = ApiPayload<
  "/api/clients/{client}/assignments",
  "post"
>;
export type AssignClientBulkResponse = ApiPayload<
  "/api/clients/assignments/bulk",
  "post"
>;
export type FetchAssignmentsResponse = ApiPayload<
  "/api/clients/{client}/assignments",
  "get"
>;
export type UnassignClientBulkResponse = ApiPayload<
  "/api/clients/assignments/bulk",
  "delete"
>;

export type ChangePasswordResponse = ApiPayload<
  "/api/auth/change-password",
  "post"
>;
export type ConfirmCodeResponse = ApiPayload<"/api/auth/confirm-code", "post">;
export type FetchAvailableProvidersResponse = ApiPayload<
  "/api/auth/available-providers",
  "get"
>;
export type FetchCurrentUserResponse = ApiPayload<"/api/me", "get">;
export type LoginResponse = ApiPayload<"/api/auth/login", "post">;
export type RegisterResponse = ApiPayload<"/api/auth/register", "post">;
export type SendCodeResponse = ApiPayload<"/api/auth/send-code", "post">;
export type SendRecoveryLinkResponse = ApiPayload<
  "/api/auth/send-recovery-link",
  "post"
>;
export type SocialRedirectResponse = ApiPayload<
  "/api/auth/{provider}/redirect",
  "get"
>;
export type ValidateRecoveryTokenResponse = ApiPayload<
  "/api/auth/validate-recovery-token",
  "post"
>;

export type CreateClientResponse = ApiPayload<"/api/clients", "post">;
export type CreatePublicClientResponse = ApiPayload<
  "/api/public/clients/register/{linkId}",
  "post"
>;
export type FetchClientResponse = ApiPayload<"/api/clients/{client}", "get">;
export type FetchClientsResponse = ApiPayload<"/api/clients", "get">;
export type RemoveClientResponse = ApiPayload<"/api/clients/{client}", "delete">;
export type UpdateClientResponse = ApiPayload<"/api/clients/{client}", "put">;
export type CreateClientLinkResponse = ApiPayload<"/api/clients/links", "post">;
type RawFetchClientLinkResponse = ApiPayload<
  "/api/clients/links/{linkId}",
  "get"
>;
export type FetchClientLinkResponse = Simplify<
  Omit<RawFetchClientLinkResponse, "linkInfo"> & {
    linkInfo: Required<NonNullable<RawFetchClientLinkResponse["linkInfo"]>>;
  }
>;

export type CreateContractResponse = ApiPayload<"/api/contracts", "post">;
export type FetchContractCategoriesResponse = ApiPayload<
  "/api/contracts/categories",
  "get"
>;
export type FetchContractsResponse = ApiPayload<"/api/contracts", "get">;
export type RemoveContractResponse = ApiPayload<
  "/api/contracts/{contract}",
  "delete"
>;
export type UpdateContractResponse = ApiPayload<
  "/api/contracts/{contract}",
  "put"
>;

export type CreateEventResponse = ApiPayload<"/api/events", "post">;
export type FetchEventResponse = ApiPayload<"/api/events/{event}", "get">;
export type FetchEventImagesResponse = ApiPayload<
  "/api/events/{event}/images",
  "get"
>;
export type FetchEventTypesResponse = ApiPayload<
  "/api/events/types/{contract}",
  "get"
>;
export type FetchEventsResponse = ApiPayload<"/api/events", "get">;
export type RemoveEventResponse = ApiPayload<"/api/events/{event}", "delete">;
export type UpdateEventResponse = ApiPayload<"/api/events/{event}", "put">;
export type UploadEventPhotoResponse = ApiPayload<"/api/events/photos", "post">;

export type FetchClientCropResponse = ApiPayload<
  "/api/images/{image}/clients/{client}/crop",
  "get"
>;
export type FetchImageClientsResponse = ApiPayload<
  "/api/images/{image}/clients",
  "get"
>;
export type FetchImageMetadataResponse = ApiPayload<
  "/api/images/{image}/metadata",
  "get"
>;
export type RemoveImageResponse = ApiPayload<"/api/images/{image}", "delete">;

export type FetchCitiesResponse = ApiPayload<
  "/api/locations/countries/{country_cca2}/states/{state_code}/cities",
  "get"
>;
export type FetchCountriesResponse = ApiPayload<
  "/api/locations/countries",
  "get"
>;
export type FetchStatesResponse = ApiPayload<
  "/api/locations/countries/{country_cca2}/states",
  "get"
>;

export type DismissNotificationResponse = ApiPayload<
  "/api/notifications/{id}/dismiss",
  "delete"
>;
export type FetchNotificationsResponse = ApiPayload<"/api/notifications", "get">;
export type ReadNotificationResponse = ApiPayload<
  "/api/notifications/{id}/read",
  "post"
>;
