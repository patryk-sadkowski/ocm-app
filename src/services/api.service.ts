import axios from "axios";

enum Constants {
  TOKEN = "token",
}

// get token from localStorage
const getToken = () => {
  return localStorage.getItem("token");
};

export const getServer = () => {
  return localStorage.getItem("server");
};

const token = getToken();
const authorization = `Bearer ${token}`;
const baseURL = `https://${
  getServer() || ""
}-iroraclecloud.cec.ocp.oraclecloud.com/`;
const apiURL = "content/management/api/v1.1";

const axiosClient = axios.create({
  baseURL: `${baseURL}${apiURL}`,
  headers: {
    common: {
      authorization,
    },
  },
});



export const updateAxiosTokenAndServer = (token: string, server: string) => {
  const authorization = `Bearer ${token}`;
  axiosClient.defaults.headers.common.authorization = authorization;
  axiosClient.defaults.baseURL = `https://${server.toLowerCase()}-iroraclecloud.cec.ocp.oraclecloud.com/${apiURL}`;
};

export default axiosClient;
