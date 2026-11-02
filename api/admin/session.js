import { handleAdminSession } from "../../server/early-access.js";

export default {
  async fetch(request) {
    return handleAdminSession(request);
  },
};
