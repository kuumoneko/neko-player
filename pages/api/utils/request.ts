export function parse_body(body: any) {
    if (typeof body === "string") {
        return JSON.parse(body);
    }
    else {
        return body;
    }
}