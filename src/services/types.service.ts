import { AssetTypeI } from "../types/types";
import axiosClient from "./api.service";

export const fetchAllTypes = async (): Promise<AssetTypeI[] | undefined> => {
  const { data } = await axiosClient.get("/types");

  return data?.items;
};

export const getAllTypes = async () => {
  const allAssetTypes = await fetchAllTypes();
  return allAssetTypes;
};

export const getPagesTypes = async () => {
  const allAssetTypes = await fetchAllTypes();
  const pagesTypes = allAssetTypes?.filter((assetType: AssetTypeI) =>
    assetType.name.toLowerCase().includes("page")
  );
  return pagesTypes;
};
