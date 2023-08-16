import axiosClient from "./api.service";

export const getAllChannels = async () => {
  const data = await axiosClient.get(`/channels`);
  return data?.data;
};
