import axios from "axios";

export const sendMessageToAI = async (message: string) => {
  const response = await axios.post("http://localhost:3001/api/ai", { message });
  return response.data.reply;
};
