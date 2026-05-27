// api_login.jsx
import axios from "axios";


export const postLogin = async (credentials) => {
  return await axios.post("http://108.181.172.191:10041/api/login/", credentials, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};
