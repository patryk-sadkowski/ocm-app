import { AssetTypeI } from "../types/types";
import axiosClient from "./api.service";
import { z } from "zod";

export const fetchAllTypes = async () => {
  const limit = 500;

  const ResponseSchema = z.object({
    hasMore: z.boolean(),
    offset: z.number(),
    count: z.number(),
    limit: z.number(),
    items: z.any(),
  });

  let items: any[] = [];

  let hasMore = true;
  let offset = 0;

  while (hasMore) {
    const data = await axiosClient.get(
      `/types?limit=${limit}&offset=${offset}`
    );

    const parsedData = ResponseSchema.passthrough().parse(data?.data);
    items = [...items, ...parsedData.items];
    hasMore = parsedData.hasMore;
    offset += limit;
  }

  return items.flatMap((i) => i);
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
