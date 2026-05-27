import axios from "axios";



export const postHeaderHomeMarcelo = async (access, videoData) => {
  try {
    const response = await axios.post(
      "http://108.181.172.191:10041/api/videos/",
      videoData, // { title, description, url }
      {
        headers: {
          Authorization: `Bearer ${access}`, // JWT
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error al enviar token:", error);
    throw error;
  }
};

