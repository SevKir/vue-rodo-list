export async function request(path = '', method, body) {
    const url = `https://jsonplaceholder.typicode.com/${path}`;
    const data = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
    };
    if (body) {
        data.body = body;
    }

    const res = await fetch(url, data).catch((e) => {
        throw new Error(`Сервер недоступен: ${e.message}`);
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
    }

    return await res.json();
}

