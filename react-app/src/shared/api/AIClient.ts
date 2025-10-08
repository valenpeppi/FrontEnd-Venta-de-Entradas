import axios from "axios";

/**
 * Envía el mensaje del usuario al backend de IA,
 * incluyendo una instrucción de contexto para que el bot
 * hable sobre TicketApp y no de temas genéricos.
 */
export const sendMessageToAI = async (message: string): Promise<string> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000); //  25 segundos de espera

  try {
    const response = await axios.post(
      "http://localhost:3000/api/ai",
      {
        message: `
Eres el asistente oficial de **TicketApp**, una plataforma para comprar entradas a eventos en línea (recitales, partidos, obras de teatro, etc.).
Tu función es ayudar al usuario a:
- Buscar eventos disponibles,
- Explicar cómo comprar entradas,
- Resolver dudas sobre pagos (Mercado Pago y Stripe),
- Explicar cómo ver sus tickets en la sección *Mis Entradas*.

Responde siempre en tono natural y en español, mencionando pasos dentro del sitio si corresponde.
Si el usuario pregunta algo fuera de contexto (por ejemplo, sobre política o temas personales), redirígelo amablemente a hablar de eventos o de TicketApp.

El usuario pregunta: "${message}"
        `,
      },
      {
        signal: controller.signal,
        timeout: 25000, 
      }
    );

    return response.data.reply || "⚠️ El asistente no respondió correctamente.";
  } catch (error: any) {
    if (axios.isCancel(error) || error.name === "AbortError") {
      console.warn("⚠️ Timeout alcanzado en conexión con OpenRouter.");
      return "⚠️ El asistente está tardando más de lo esperado. Intentalo nuevamente en unos segundos.";
    }

    console.error("❌ Error al conectar con el backend IA:", error.message);
    return "⚠️ Hubo un problema al comunicarme con el asistente.";
  } finally {
    clearTimeout(timeout);
  }
};
