import axios from "axios";

const BASE_URL = "https://gz2qfy74t0.execute-api.us-east-1.amazonaws.com/dev";

export const fetchAllQuotes = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/quotes`);
    const data = response.data;
    return data.quotes || [];
  } catch (error) {
    console.error("Error fetching quotes:", error);
    throw error;
  }
};

export const deleteQuote = async (id) => {
  try {
    await axios.delete(`${BASE_URL}/quotes/${id}`);
  } catch (error) {
    console.error("Error deleting quotes:", error);
    throw error;
  }
};
