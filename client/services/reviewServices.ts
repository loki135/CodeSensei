// services/reviewService.ts

import axios from "axios";

export const reviewCode = async (code: string, reviewType: string) => {
  const response = await axios.post("/api/code/review", {
    code,
    reviewType,
  });

  return response.data;
};
