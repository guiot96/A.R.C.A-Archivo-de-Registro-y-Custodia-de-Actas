import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import type { Acta, Block, BlockchainVerification, DashboardStats, ErrorResponse, HealthStatus, UploadActaBody } from "./api.schemas";
import { customFetch } from "../custom-fetch";
import type { ErrorType, BodyType } from "../custom-fetch";
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
/**
 * Returns server health status
 * @summary Health check
 */
export declare const getHealthCheckUrl: () => string;
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * Returns all registered electoral records
 * @summary List all actas
 */
export declare const getListActasUrl: () => string;
export declare const listActas: (options?: RequestInit) => Promise<Acta[]>;
export declare const getListActasQueryKey: () => readonly ["/api/actas"];
export declare const getListActasQueryOptions: <TData = Awaited<ReturnType<typeof listActas>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listActas>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listActas>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListActasQueryResult = NonNullable<Awaited<ReturnType<typeof listActas>>>;
export type ListActasQueryError = ErrorType<unknown>;
/**
 * @summary List all actas
 */
export declare function useListActas<TData = Awaited<ReturnType<typeof listActas>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listActas>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * Returns full detail of a single acta
 * @summary Get acta detail
 */
export declare const getGetActaUrl: (id: number) => string;
export declare const getActa: (id: number, options?: RequestInit) => Promise<Acta>;
export declare const getGetActaQueryKey: (id: number) => readonly [`/api/actas/${number}`];
export declare const getGetActaQueryOptions: <TData = Awaited<ReturnType<typeof getActa>>, TError = ErrorType<ErrorResponse>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getActa>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getActa>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetActaQueryResult = NonNullable<Awaited<ReturnType<typeof getActa>>>;
export type GetActaQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Get acta detail
 */
export declare function useGetActa<TData = Awaited<ReturnType<typeof getActa>>, TError = ErrorType<ErrorResponse>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getActa>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * Upload an electoral record image (multipart/form-data), runs OCR, generates SHA256 hash, and adds to blockchain. Fields mesa_id (string) and image (file) required.
 * @summary Upload an acta image
 */
export declare const getUploadActaUrl: () => string;
export declare const uploadActa: (uploadActaBody: UploadActaBody, options?: RequestInit) => Promise<Acta>;
export declare const getUploadActaMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof uploadActa>>, TError, {
        data: BodyType<UploadActaBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof uploadActa>>, TError, {
    data: BodyType<UploadActaBody>;
}, TContext>;
export type UploadActaMutationResult = NonNullable<Awaited<ReturnType<typeof uploadActa>>>;
export type UploadActaMutationBody = BodyType<UploadActaBody>;
export type UploadActaMutationError = ErrorType<ErrorResponse>;
/**
 * @summary Upload an acta image
 */
export declare const useUploadActa: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof uploadActa>>, TError, {
        data: BodyType<UploadActaBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof uploadActa>>, TError, {
    data: BodyType<UploadActaBody>;
}, TContext>;
/**
 * Returns counts of actas by status
 * @summary Dashboard statistics
 */
export declare const getGetDashboardStatsUrl: () => string;
export declare const getDashboardStats: (options?: RequestInit) => Promise<DashboardStats>;
export declare const getGetDashboardStatsQueryKey: () => readonly ["/api/dashboard/stats"];
export declare const getGetDashboardStatsQueryOptions: <TData = Awaited<ReturnType<typeof getDashboardStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDashboardStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getDashboardStats>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetDashboardStatsQueryResult = NonNullable<Awaited<ReturnType<typeof getDashboardStats>>>;
export type GetDashboardStatsQueryError = ErrorType<unknown>;
/**
 * @summary Dashboard statistics
 */
export declare function useGetDashboardStats<TData = Awaited<ReturnType<typeof getDashboardStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDashboardStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * Checks if the blockchain ledger is intact and unmodified
 * @summary Verify blockchain integrity
 */
export declare const getVerifyBlockchainUrl: () => string;
export declare const verifyBlockchain: (options?: RequestInit) => Promise<BlockchainVerification>;
export declare const getVerifyBlockchainQueryKey: () => readonly ["/api/blockchain/verify"];
export declare const getVerifyBlockchainQueryOptions: <TData = Awaited<ReturnType<typeof verifyBlockchain>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof verifyBlockchain>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof verifyBlockchain>>, TError, TData> & {
    queryKey: QueryKey;
};
export type VerifyBlockchainQueryResult = NonNullable<Awaited<ReturnType<typeof verifyBlockchain>>>;
export type VerifyBlockchainQueryError = ErrorType<unknown>;
/**
 * @summary Verify blockchain integrity
 */
export declare function useVerifyBlockchain<TData = Awaited<ReturnType<typeof verifyBlockchain>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof verifyBlockchain>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * Returns all blocks in the blockchain ledger
 * @summary List blockchain blocks
 */
export declare const getListBlocksUrl: () => string;
export declare const listBlocks: (options?: RequestInit) => Promise<Block[]>;
export declare const getListBlocksQueryKey: () => readonly ["/api/blockchain/blocks"];
export declare const getListBlocksQueryOptions: <TData = Awaited<ReturnType<typeof listBlocks>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listBlocks>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listBlocks>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListBlocksQueryResult = NonNullable<Awaited<ReturnType<typeof listBlocks>>>;
export type ListBlocksQueryError = ErrorType<unknown>;
/**
 * @summary List blockchain blocks
 */
export declare function useListBlocks<TData = Awaited<ReturnType<typeof listBlocks>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listBlocks>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export {};
//# sourceMappingURL=api.d.ts.map