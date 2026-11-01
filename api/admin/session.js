import { handleAdminSession } from "../../server/inquiries.js";

export default {
  async fetch(request) {
    return handleAdminSession(request);
  },
};
