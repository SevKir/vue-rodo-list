import { request } from "./fertch";

function get(path) {
    return request(path, 'GET');
}

export function getTodos() {
    return get('todos');
}


