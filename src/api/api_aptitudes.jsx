import axios from "axios";

const API_URL = "http://localhost:8000/api/aptitudes/";

const getHeaders = () => {
  const accessToken = localStorage.getItem("access");

  return {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };
};

export const getAptitudes = async () => {
  return await axios.get(API_URL, { headers: getHeaders() });
};

