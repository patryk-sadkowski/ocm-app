import axiosClient from "./api.service";

export interface SiteI {
  id: string;
  name: string;
}

interface GetSitesResponse {
  totalResults: number;
  limit: number;
  count: number;
  hasMore: boolean;
  offset: number;
  items: SiteI[];
}

export const getSiteURL = (siteName: string) => {
  const server = localStorage.getItem("server") || "";
  return `https://${server.toLowerCase()}-iroraclecloud.ocecdn.oraclecloud.com/site/${siteName.toLowerCase()}/`;
};

export const getManagementBaseURL = () => {
  const server = localStorage.getItem("server") || "";
  return `https://${server.toLowerCase()}-iroraclecloud.cec.ocp.oraclecloud.com/sites/management/api/v1`;
};

export const getSites = async (): Promise<GetSitesResponse> => {
  const { data } = await axiosClient.get(
    '/sites?q=members[name eq "@me"]&fields=name,id&limit=100',
    {
      baseURL: getManagementBaseURL(),
    }
  );
  return data;
};

export const getSiteVanityDomain = async (
  id: string,
  siteName: string
): Promise<any> => {
  try {
    const { data } = await axiosClient.get(`/sites/${id}/vanityDomain`, {
      baseURL: getManagementBaseURL(),
    });

    return data.name;
  } catch (err) {
    return getSiteURL(siteName);
  }
};

export interface StructurePageI {
  id: string;
  name: string;
  pageUrl: string;
}

export const getStructureJSON = async (baseSiteURL: string) => {
  try {
    // Download data using fetch, not axios (because of CORS extension)
    const baseURL = baseSiteURL.startsWith("http")
      ? baseSiteURL
      : `https://${baseSiteURL}`;
    const response = await fetch(`${baseURL}/structure.json`);
    const data = await response.json();
    return (data?.base?.pages as StructurePageI[]) || [];
  } catch (err) {
    return [];
  }
};
