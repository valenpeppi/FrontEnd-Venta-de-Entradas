import axios from "axios";

export const sendMessageToAI = async (message: string): Promise<string> => {
  try {
    const response = await axios.post("http://localhost:3000/api/ai", { message });
    return response.data.reply;
  } catch (error) {
    console.error("Error al conectar con el backend IA:", error);
    return "Lo siento, hubo un problema al comunicarme con el asistente.";
  }
};
