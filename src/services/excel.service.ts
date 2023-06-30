import { ItemI } from "../types/repositories";
import { fetchItemByID } from "./assets.service";
import { StructurePageI } from "./sites.service";

export const mapImagesDataForExcel = (
  imagesData: any[],
  repositoryName: string
) => {
  return imagesData.map((asset: any) => {
    return {
      id: asset?.id,
      name: asset?.name,
      description: asset?.description,
      type: asset?.type,
      language: asset?.language,
      fields_image_alt: asset?.fields?.image_alt,
      repository: repositoryName,
      edited: false,
    };
  });
};

export const mapPagesDataForExcel = (
  pagesData: ItemI[],
  repositoryName: string,
  probableUrlGeneration?: {
    structurePages: StructurePageI[];
    baseURL: string;
  }
) => {
  const sanitizedBaseUrl = probableUrlGeneration?.baseURL.endsWith("/")
    ? probableUrlGeneration?.baseURL.slice(0, -1)
    : probableUrlGeneration?.baseURL;

  return pagesData.map((asset: Partial<ItemI>) => {
    const pageUrl = probableUrlGeneration?.structurePages.find((page) =>
      asset.name
        ? page.name.toLowerCase().includes(asset.name.toLowerCase())
        : false
    )?.pageUrl;

    const probableUrl = pageUrl
      ? [sanitizedBaseUrl, asset.language?.toLowerCase(), pageUrl]
          .filter(Boolean)
          .join("/")
      : "";

    console.log('PAGE', asset)

    return {
      id: asset.id,
      name: asset.name,
      description: asset.description,
      type: asset.type,
      slug: asset.slug,
      probableUrl,
      fields_descriptions: asset?.fields?.descriptions,
      fields_meta_title: asset?.fields?.meta_title,
      fields_page_title: asset?.fields?.page_title,
      fields_page_subtitle: asset?.fields?.page_subtitle,
      fields_canonical: asset?.fields?.canonical,
      fields_keywords: asset?.fields?.keywords,
      fields_teaser_summary: asset?.fields?.teaser_summary,
      fields_teaser_title: asset?.fields?.teaser_title,
      fields_html_content: asset?.fields?.html_content,
      teaser_media_id: asset?.fields?.teaser_media?.id,
      language: asset?.language,
      repository: repositoryName,
      fields_flag_regionalize: asset?.fields?.flag_regionalize,
      edited: false,
    };
  });
};
