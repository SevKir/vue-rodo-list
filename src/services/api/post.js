import { request } from "./fertch";

function post(path, data) {
    const body = JSON.stringify(data);
    return request(path,'POST', body);
}

export function addTodo(data) {
    return post('todos', data);
}
