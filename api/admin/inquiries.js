import { handleAdminSignups } from "../../server/early-access.js";

export default {
  async fetch(request) {
    return handleAdminSignups(request);
  },
};
