import { handleEarlyAccessDetails } from "../../server/early-access.js";

export default {
  async fetch(request) {
    return handleEarlyAccessDetails(request);
  },
};
