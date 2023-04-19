import { z } from "zod";

export interface RepositoryI {
  id: string;
  name: string;
  description: string;
  repositoryType: string;
  createdBy: string;
  createdDate: {
    value: string;
    timezone: string;
  };
  updatedBy: string;
  updatedDate: {
    value: string;
    timezone: string;
  };
  autoTagEnabled: boolean;
  notReadyEnabled: boolean;
  roleName: string;
  advancedVideoEnabled: boolean;
  customDigitalAssetsEnabled: boolean;
  links: {
    rel: string;
    href: string;
  }[];
}

interface ItemLink {
  href: string;
  rel: string;
  method: string;
  mediaType: string;
}

export interface ItemTab {
  id: string;
  type: string;
  typeCategory: string;
  links: ItemLink[];
}

export interface ItemI {
  translatable: true;
  description: string;
  language: string;
  type: string;
  fileExtension: string;
  repositoryId: string;
  name: string;
  id: string;
  links: ItemLink[];
  fields: {
    page_banner: any;
    page_title: string;
    keywords: string;
    teaserMedia: {
      id: string;
      type: string;
      typeCategory: string;
      links: ItemLink[];
      tabs: ItemTab[];
    };
    fields_productpage_pdf_generator: string;
    descriptions: string;
    productCategory: string;
    full_width: boolean;
    html_content: string;
    learnMoreLabel: string;
    model: string;
    download_pdf: string;
    associated_pages: string;
    sku: string;
    gallery: Gallery[];
    utm_content: string;
    youtube_embed_link: string;
    horizontal_sections_style: string;
    meta_title: string;
    header_title: string;
    utm_campaign: string;
    eloqua_page_type: string;
    flag_regionalize: boolean;
    horizontal_sections: string;
    weight: string;
    canonical: string;
    technology: string;
    footer_title: string;
    header_media: HeaderMedia;
    utm_term: null;
    teaser_title: string;
    teaser_summary: string;
    cta_links: CtaLink[];
    dictionary: null;
    downloadpdf_link: null;
    header_description: null;
    background_color_of_sections: null;
    page_subtitle: string;
    pdf_generate: null;
    switch_off_zoom: null;
    utm_source: null;
  };
  slug: string;
}

export const ItemSchema = z.object({
  translatable: z.boolean(),
  description: z.string(),
  language: z.string(),
  type: z.string(),
  fileExtension: z.string(),
  repositoryId: z.string(),
  name: z.string(),
  id: z.string(),
});

export const ItemsSchema = z.array(ItemSchema.passthrough());

interface Gallery {
  id: string;
  type: string;
  typeCategory: string;
  links: ItemLink[];
}

export interface HeaderMedia {
  id: string;
  type: string;
  typeCategory: string;
  links: ItemLink[];
}

export interface CtaLink {
  id: string;
  type: string;
  typeCategory: string;
  links: ItemLink[];
}
