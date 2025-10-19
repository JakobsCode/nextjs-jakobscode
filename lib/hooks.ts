import { useQuery } from "@tanstack/react-query";
import { authClient } from "./auth-client";
import { ApiKey } from "./utils";

async function fetchApiKeys(): Promise<ApiKey[]> {
    const { data, error } = await authClient.apiKey.list()
    if (error) throw new Error(error.message ?? "Fehler beim Laden der API-Keys")
    return data
}

export const useApiKeys = () => {
    return useQuery<ApiKey[]>({
        queryKey: ["apiKeys"],
        queryFn: fetchApiKeys,
        staleTime: 1000 * 60, // 1 Minute
        refetchInterval: 1000 * 15, // Alle 15 Sekunden
    });
};