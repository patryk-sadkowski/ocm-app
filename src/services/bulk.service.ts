import axiosClient from "./api.service";

export const setItemAsTranslatedById = async (id: string) => {
  const { data } = await axiosClient.post(
    "/bulkItemsOperations",
    JSON.stringify({
      q: `id eq \"${id}\"`,
      operations: {
        setAsTranslated: {
          value: true,
        },
      },
    }),
    {
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
    }
  );

  return data;
};

export const publishItemById = async (id: string) => {
  const { data } = await axiosClient.post(
    "/bulkItemsOperations",
    JSON.stringify({
      q: `id eq \"${id}\"`,
      operations: {
        publish: {
          options: {
            unlockAfterPublish: true,
          },
        },
      },
    }),
    {
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
    }
  );

  return data;
};
