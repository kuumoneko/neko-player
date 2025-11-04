import { convert } from "@/lib/pass"

export default async function register(username: string, password: string) {
    const result = await fetch("/api/user/signup", {
        method: "POST",
        body: JSON.stringify({
            username, password: convert(password)
        })
    })

    if (!result.ok) {
        alert("Register failed")
    }

    return await result.json();
}