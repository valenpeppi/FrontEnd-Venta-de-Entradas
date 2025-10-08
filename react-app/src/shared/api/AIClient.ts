import axios from "axios";

export const sendMessageToAI = async (message: string): Promise<string> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000); 

  try {
    const response = await axios.post(
      "http://localhost:3000/api/ai",
      { message },
      {
        signal: controller.signal,
        timeout: 10000, 
      }
    );

    if (response.data?.reply) {
      return response.data.reply;
    } else {
      return "⚠️ El asistente no devolvió ninguna respuesta.";
    }
  } catch (error: any) {
    if (axios.isCancel(error) || error.name === "AbortError") {
      return "⚠️ El asistente tardó demasiado en responder. Intentalo nuevamente.";
    }

    console.error("❌ Error al conectar con el backend IA:", error.message);
    return "⚠️ Hubo un problema al comunicarme con el asistente.";
  } finally {
    clearTimeout(timeout);
  }
};
