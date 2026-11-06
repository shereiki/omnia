import { handleEarlyAccess } from "../server/early-access.js";

export default {
  async fetch(request) {
    return handleEarlyAccess(request);
  },
};
