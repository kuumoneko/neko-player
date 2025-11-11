
export enum LocalStorageKeys {
    pin = "pin",
    download_queue = "download_queue",
}

export default async function fetch_profile(mode: "get" | "write" = "get", key: LocalStorageKeys, value?: any) {
    const data = (typeof value === 'string') ? value : JSON.stringify(value);
    const res = await fetch("/api/user/profile", { method: "POST", headers:{'Authorization':`Bearer ${localStorage.getItem("access_token") ?? ""}`}, body: JSON.stringify({ mode: mode, key: key, data: data }) });
    const result = await res.json();
    if (result.access_token.length > 0){
        localStorage.setItem("access_token", result.access_token);
    }
    return result.data;
}