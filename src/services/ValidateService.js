import { GoogleGenerativeAI } from "@google/generative-ai";

// Configura tu API Key (deberías tenerla en variables de entorno)
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

// Función auxiliar para convertir ArrayBuffer a base64 de manera eficiente
function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    const chunkSize = 8192; // Procesar en chunks para evitar stack overflow
    
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize);
      binary += String.fromCharCode.apply(null, chunk);
    }
    
    return btoa(binary);
  }

async function validarAyudantia(file, curso) {
  try {
    console.log("Validando ayudantía para el curso:", curso);
    // 1. Convertir el archivo a base64 o usar directamente
    // Gemini puede trabajar con archivos directamente en el frontend
    
    // 2. Configurar el modelo
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash", // o "gemini-1.5-flash" si el otro no está disponible
      generationConfig: { responseMimeType: "application/json" }
    });

    // 3. Convertir el archivo a base64 para enviarlo
    const arrayBuffer = await file.arrayBuffer();
    const base64Data = arrayBufferToBase64(arrayBuffer);

    // 4. Crear el Prompt
    const prompt = `
      Analiza este certificado de ayudantía de la Pontificia Universidad Católica de Chile.
      Extrae la siguiente información y devuélvela estrictamente en formato JSON:
      1. "nombre_completo": Nombre del estudiante.
      2. "rut": RUT o identificación del estudiante.
      3. "cursos": Un arreglo (array) de objetos con los cursos donde fue ayudante. 
         Cada objeto debe tener: "sigla" (ej: IIC2143), "nombre_curso", "semestre" y "anio".
      
      Si el documento no es un certificado válido o no contiene ayudantías, devuelve un campo "es_valido": false.
      
      IMPORTANTE: Verifica si el curso "${curso}" (o su sigla) aparece en la lista de cursos del certificado.
    `;

    // 5. Generar el contenido usando el archivo
    console.log("Procesando documento con Gemini...");
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: "application/pdf",
        },
      },
    ]);

    const response = await result.response;
    const textoJson = response.text();
    
    // 6. Parsear el resultado
    const datos = JSON.parse(textoJson);
    console.log("\n--- RESULTADO DE LA VALIDACIÓN ---\n");
    console.log(datos);

    // 7. Validar si fue ayudante del curso
    const curso_buscado = curso; // El curso que quieres validar
    const fueAyudante = datos.cursos?.some(c => 
      c.sigla === curso_buscado || 
      c.sigla?.toUpperCase() === curso_buscado.toUpperCase() ||
      c.nombre_curso?.toLowerCase().includes(curso_buscado.toLowerCase())
    );

    if (fueAyudante) {
        return { validado: true, datos };
    } else {
        return { validado: false, datos };
    }

  } catch (error) {
    console.error("Error en validación:", error);
    return { validado: false, error: error.message };
  }
}

export default validarAyudantia;