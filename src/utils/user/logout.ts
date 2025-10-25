export default async function logout(username: string) {
    const result = await fetch("/api/user/logout", {
        method: "POST",
        body: JSON.stringify({
            username
        }),
        credentials: "include"
    })

    if (!result.ok) {
        alert("Login failed")
    }

    return await result.json();
}