export default async function login(username: string, password: string) {
    const result = await fetch("/api/user/login", {
        method: "POST",
        body: JSON.stringify({
            username, password
        })
    })

    if (!result.ok) {
        alert("Login failed")
    }

    return await result.json();
}