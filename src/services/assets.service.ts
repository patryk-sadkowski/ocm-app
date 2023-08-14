import { ItemI, ItemSchema, ItemsSchema } from "../types/repositories";
import { z } from "zod";

import axiosClient from "./api.service";

export const fetchAllItems = async () => {
  const { data } = await axiosClient.get("/items");

  return data;
};

export const fetchAllItemsOfTypeFromRepositoryIdScroll = async (
  repositoryId: string,
  types: string[],
  updateProgress?: (v: string) => void
) => {
  const limit = 500;

  const ResponseSchema = z.object({
    hasMore: z.boolean(),
    offset: z.number(),
    count: z.number(),
    limit: z.number(),
    items: ItemsSchema,
    scrollId: z.string().optional(),
  });

  let items: any[] = [];

  // loop through all types using foreach
  for (const type of types) {
    let scrollId = "";
    while (true) {
      const scrollParam = scrollId ? `&scrollId=${scrollId}` : "scroll=true";

      const data = await axiosClient.get(
        `/items?limit=${limit}&q=repositoryId eq "${repositoryId}" AND (type eq "${type}")&${scrollParam}&scrollTTL=5000`
      );

      const parsedData = ResponseSchema.passthrough().parse(data?.data);

      items = [...items, ...parsedData.items].flatMap((i) => i);

      if (parsedData.count <= 0 || !parsedData.scrollId) {
        break;
      }

      scrollId = parsedData.scrollId;

      updateProgress &&
        updateProgress(
          `${items.filter((i) => i.type === type).length} / ${
            parsedData.limit
          } (${type})`
        );
    }
  }

  return items;
};

export const fetchAllItemsOfTypeFromRepositoryIdLimits = async (
  repositoryId: string,
  types: string[]
) => {
  const limit = 500;

  const ResponseSchema = z.object({
    hasMore: z.boolean(),
    offset: z.number(),
    count: z.number(),
    limit: z.number(),
    items: ItemsSchema,
  });

  let items: any[] = [];

  // loop through all types using foreach
  for (const type of types) {
    // get all items using response fields limit (total), offset (pagination) and hasMore (boolean)
    let hasMore = true;
    let offset = 0;

    while (hasMore) {
      const data = await axiosClient.get(
        `/items?limit=${limit}&offset=${offset}&q=repositoryId eq "${repositoryId}" AND (type eq "${type}")`
      );

      const parsedData = ResponseSchema.passthrough().parse(data?.data);
      items = [...items, ...parsedData.items];
      hasMore = parsedData.hasMore;
      offset += limit;
    }
  }

  return items.flatMap((i) => i);
};

export const fetchAllItemsOfTypeFromRepositoryId = async (
  repositoryId: string,
  types: string[]
): Promise<ItemI[]> => {
  const data = await Promise.all(
    types.map((type) =>
      axiosClient.get(
        `/items?limit=10000&q=repositoryId eq "${repositoryId}" AND (type eq "${type}")`
      )
    )
  );

  const flatData = data.flatMap((d) => d.data.items);
  return flatData;
};

export const fetchAllItemsFromRepositoryById = async (id: string) => {
  const { data } = await axiosClient(
    `/items?orderBy=updatedDate:desc&totalResults=true&includeAdditionalData=true&links=none&fields=id,name,type,updatedDate,updatedBy,status,fileGroup,translatable,language,varSetId,languageIsMaster,versionInfo,isPublished,repositoryId,changes,typeCategory,advancedVideoInfo,lockInfo,scheduled,workflowInstances,fileExtension,connectorFileInfo&returnMaster=true&aggs={%22name%22:%22item_count_per_category%22,%22field%22:%22id%22}&limit=1000&offset=0&q=repositoryId%20eq%20%22${id}%22`
  );

  return data.items;
};

export const fetchItemByID = async (id: string) => {
  const { data } = await axiosClient.get(`/items/${id}`);

  return data;
};

export const fetchAllItemsFromRepoWithChineseLang = async (repoID: string) => {
  const { data } = await axiosClient.get(
    `/items?limit=10000&q=repositoryId%20eq%20%22${repoID}%22%20AND%20(language%20eq%20%22zh-CN%22)`
  );

  return data;
};

export const fetchAllItemsFromReposWithChineseLang = async (
  repoIDs: Array<string>
): Promise<any> => {
  const items = [];
  let fetchedRepos = 0;

  for (let index = 0; index < repoIDs.length; index++) {
    try {
      const ID = repoIDs[index];
      const { items: repoItems } = await fetchAllItemsFromRepoWithChineseLang(
        ID
      );
      fetchedRepos++;
      items.push(...repoItems);
      console.clear();
      console.log(`Fetched ${fetchedRepos} from ${repoIDs.length}`);
    } catch (error) {
      console.error(`Attempt: ${index}. ${(error as Error).message}`);
    }
  }

  return items;
};

export const updateItem = async (itemID: string, payload: any) => {
  try {
    const currentItem = await fetchItemByID(itemID);
    const newFields = { ...currentItem.fields, ...payload.fields };
    const newPayload = { ...payload, fields: newFields };
    const { data } = await axiosClient.put(
      `/items/${itemID}`,
      JSON.stringify({ ...currentItem, ...newPayload }),
      {
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      }
    );
    return data;
  } catch (error) {
    console.log(error);
    console.error((error as Error).message);
    return false;
  }
};

export const updateItems = async (
  items: Array<{ itemID: string; payload: any }>
) => {
  for (let index = 0; index < items.length; index++) {
    const { itemID, payload } = items[index];
    try {
      await updateItem(itemID, payload);
    } catch (error) {
      console.error((error as Error).message);
      return false;
    }
  }

  return true;
};

export const filterAssetsWithChineseNames = (assets: Array<any>) => {
  const reg = new RegExp("[^a-zA-Z0-9$&+,:;=?@#|'<>.^*()%!-_ ]", "g");
  return assets.filter((asset) => reg.exec(asset.name) !== null);
};

export const getItemVariations = async (id: string): Promise<Array<any>> => {
  const { data } = await axiosClient(`items/${id}/variations`);
  return data.data[0].items;
};

export const getReferencedByForAsset = async (
  assetId: string,
  funcToExecuteAfter?: () => void
) => {
  // https://ircxprd01-iroraclecloud.cec.ocp.oraclecloud.com/content/management/api/v1.1/items/COREC007579556A1448AA96ACDC05E45059A?expand=relationships&includeAdditionalData=false&links=none
  const { data } = await axiosClient(
    `/items/${assetId}?expand=relationships&includeAdditionalData=false&links=none`
  );

  // console.log('DATA', data);
  funcToExecuteAfter && funcToExecuteAfter();

  // const ResponseSchema = z.object({
  //   hasMore: z.boolean(),
  //   offset: z.number(),
  //   count: z.number(),
  //   limit: z.number(),
  //   items: ItemsSchema,
  // });

  return data;
};

type GenericItemPayload = {
  name: string;
  type: string;
  description?: string;
  slug?: string;
  repositoryId: string;
  language: string;
  translatable?: boolean;
  [key: string]: any;
};

export const createItem = async <T extends GenericItemPayload>(item: T) => {
  const { data } = await axiosClient.post(`/items`, JSON.stringify(item), {
    headers: {
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
    },
  });

  return data;
};

/** Not tested, could not work */
export const deleteItem = async (itemID: string) => {
  const data = await axiosClient.delete(`/items/${itemID}`);
  return data.status === 204;
};

export const deleteItems = async (itemIds: string[]) => {
  //   {
  //     "q": "id eq \"CORE93913F50FF28434FB451EA6EFA7A1BE1\" OR id eq \"CORECF7D2A6D5F534DDE955C25B458904AB5\" OR id eq \"CORED9DD6D184F8E45AE8A65B5312341F28C\" OR id eq \"CORE8C7CF211417C4B0C86AF3D316685BBF4\" OR id eq \"CORE492D654DD81E4D84964D53B95D2F6E74\"",
  //     "operations": {
  //         "deleteItems": {
  //             "value": true
  //         }
  //     }
  // }

  const data = await axiosClient.post(
    `/bulkItemsOperations`,
    JSON.stringify({
      operations: {
        deleteItems: {
          value: true,
        },
      },
      q: `id eq "${itemIds.join('" OR id eq "')}"`,
    }),
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return data.status === 200;
};
