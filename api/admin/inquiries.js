import { handleAdminInquiries } from "../../server/inquiries.js";

export default {
  async fetch(request) {
    return handleAdminInquiries(request);
  },
};
