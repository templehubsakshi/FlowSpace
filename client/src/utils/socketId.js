// Holds the current Socket.IO connection id so api.js can send it as the
// X-Socket-Id header. The server then skips THIS tab when it broadcasts the
// result of the request (this tab already updated itself from the REST
// response), while all other tabs/users still get the live update.
let currentSocketId = null;

export const setSocketId = (id) => { currentSocketId = id || null; };
export const getSocketId = () => currentSocketId;
