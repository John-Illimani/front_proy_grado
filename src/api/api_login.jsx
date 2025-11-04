// api_login.jsx
import axios from "axios";


export const postLogin = async (credentials) => {
  return await axios.post("http://localhost:8000/api/login/", credentials, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};
