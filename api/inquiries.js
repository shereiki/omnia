import { handleInquiry } from "../server/inquiries.js";

export default {
  async fetch(request) {
    return handleInquiry(request);
  },
};
