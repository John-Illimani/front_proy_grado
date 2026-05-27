import axios from "axios";

const API_URL = "http://108.181.172.191:10041/api/aptitudes/";

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

