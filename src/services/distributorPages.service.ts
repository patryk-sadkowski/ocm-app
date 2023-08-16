import { AxiosError } from "axios";
import _ from "lodash";
import { createItem } from "./assets.service";

export const EMPTY_DISTRIBUTOR_NAME_STRING = "EMPTY-DISTRIBUTOR-NAME" as const;
const IR_ADDRESS_TYPE = "IR-Address-v1" as const;
const IR_STICKY_CTA_TYPE = "IR-StickyCTA-v1" as const;
const IR_DICTIONARY_TYPE = "IR-Dictionary-v1" as const;
const IR_IMAGE_TYPE = "IR-Image-v1" as const;
const UNKNOWN_TYPE = "UNKNOWN_TYPE" as const;

/** This is the DISPLAY NAME / value pairs */
type OCMLocationPageFieldsDisplayNames = {
  MetaTitle?: string;
  Descriptions?: string;
  "Background Image"?: string;
  "Company Name"?: string;
  "Header Company Name"?: string;
  CTAs?: string;
  "Label Location Summary"?: string;
  "Location Summary"?: string;
  "Label Abous Us"?: string;
  "Label About Us"?: string;
  "About Us"?: string;
  Monday?: string;
  "Monday (Is 24 Hours)"?: string | boolean;
  "Monday (Is Closed)"?: string | boolean;
  Tuesday?: string;
  "Tuesday (Is 24 Hours)"?: string | boolean;
  "Tuesday (Is Closed)"?: string | boolean;
  Wednesday?: string;
  "Wednesday (Is 24 Hours)"?: string | boolean;
  "Wednesday (Is Closed)"?: string | boolean;
  Thursday?: string;
  "Thursday (Is 24 Hours)"?: string | boolean;
  "Thursday (Is Closed)"?: string | boolean;
  Friday?: string;
  "Friday (Is 24 Hours)"?: string | boolean;
  "Friday (Is Closed)"?: string | boolean;
  Saturday?: string;
  "Saturday (Is 24 Hours)"?: string | boolean;
  "Saturday (Is Closed)"?: string | boolean;
  Sunday?: string;
  "Sunday (Is 24 Hours)"?: string | boolean;
  "Sunday (Is Closed)"?: string | boolean;
  "Label Areas Covered"?: string;
  "Areas Covered"?: string;
  "Label Related Products/Services"?: string;
  "Related Products/Services"?: string;
  "Label Locations"?: string;
  "Related Locations"?: string;
  Dictionary?: string;
};

type OCMAddressFieldsDisplayNames = {
  addressName?: string;
  address1?: string;
  address2?: string;
  city?: string;
  zip?: string;
  country?: string;
  distributor?: string;
  addressType?: string;
  partnerLevel?: string;
  latitude?: string;
  longitude?: string;
  territoryCountry?: string;
  territoryState?: string;
  mainPhone?: string;
  secondPhone?: string;
  tollFree?: string;
  email?: string;
  websiteUrl?: string;
  productCategory?: string;
  brand?: string;
};

const locationPageDisplayFieldNames: OCMLocationPageFieldsDisplayNames = {
  MetaTitle: "meta_title",
  "About Us": "about_us",
  "Background Image": "background_image",
  "Company Name": "company_name",
  "Header Company Name": "header_company_name_",
  Descriptions: "descriptions",
  CTAs: "ctas",
  "Label Location Summary": "label_location_summary",
  "Location Summary": "location_summary",
  "Label Abous Us": "label_about_us",
  "Label About Us": "label_about_us",
  Monday: "monday",
  "Monday (Is 24 Hours)": "is_24_hours",
  "Monday (Is Closed)": "is_closed",
  Tuesday: "tuesday",
  "Tuesday (Is 24 Hours)": "is_24_hours_tuesday",
  "Tuesday (Is Closed)": "is_closed_tuesday",
  Wednesday: "Wednesday",
  "Wednesday (Is 24 Hours)": "is_24_hours_wednesday_",
  "Wednesday (Is Closed)": "is_closed_wednesday",
  Thursday: "thursday",
  "Thursday (Is 24 Hours)": "is_24_hours_thursday",
  "Thursday (Is Closed)": "is_closed_thursday",
  Friday: "friday",
  "Friday (Is 24 Hours)": "Is 24 Hours",
  "Friday (Is Closed)": "is_closed_friday",
  Saturday: "saturday",
  "Saturday (Is 24 Hours)": "is_24_hours_saturday",
  "Saturday (Is Closed)": "is_closed_saturday",
  Sunday: "sunday",
  "Sunday (Is 24 Hours)": "is_24_hours_sunday",
  "Sunday (Is Closed)": "is_closed_sunday",
  "Label Areas Covered": "label_areas_covered",
  "Areas Covered": "areas_covered",
  "Label Related Products/Services": "label_related_products-services",
  "Related Products/Services": "related_products_services",
  "Label Locations": "label_locations",
  "Related Locations": "",
  Dictionary: "dictionary",
};

const addressDisplayFieldNames: OCMAddressFieldsDisplayNames = {
  addressName: "address_name",
  address1: "address1",
  address2: "address2",
  city: "city",
  zip: "zip",
  country: "country",
  distributor: "distributor",
  addressType: "address_type",
  partnerLevel: "partner_level_",
  latitude: "latitude",
  longitude: "longitude",
  territoryCountry: "territory_-_country_",
  territoryState: "territory_-_state",
  mainPhone: "main_phone",
  secondPhone: "second_phone",
  tollFree: "toll_free",
  email: "email",
  websiteUrl: "website_url",
  productCategory: "product_category",
  brand: "brand",
};

type OCMAddressFieldsApiNames = {
  address_name: string;
  address1: string;
  address2: string;
  city: string;
  zip: string;
  country: string;
  distributor: string;
  address_type: string;
  partner_level_: string;
  latitude: number;
  longitude: number;
  "territory_-_country_": string;
  "territory_-_state": string;
  main_phone: string;
  second_phone: string;
  toll_free: string;
  email: string;
  website_url: string;
  product_category: string;
  brand: string;
};

type OCMLocationPageFieldsApiNames = {
  meta_title: string;
  about_us: string;
  background_image: string;
  company_name: string;
  header_company_name_: string;
  descriptions: string;
  ctas: string;
  label_location_summary: string;
  location_summary: string;
  label_about_us: string;
  monday: string[];
  is_24_hours: boolean;
  is_closed: boolean;
  tuesday: string[];
  is_24_hours_tuesday: boolean;
  is_closed_tuesday: boolean;
  wednesday: string[];
  is_24_hours_wednesday: boolean;
  is_closed_wednesday: boolean;
  thursday: string[];
  is_24_hours_thursday: boolean;
  is_closed_thursday: boolean;
  friday: string[];
  "Is 24 Hours": boolean;
  is_closed_friday: boolean;
  saturday: string[];
  is_24_hours_saturday: boolean;
  is_closed_saturday: boolean;
  sunday: string[];
  is_24_hours_sunday: boolean;
  is_closed_sunday: boolean;
  label_areas_covered: string;
  areas_covered: string;
  "label_related_products-services": string;
  related_products_services: string[];
  label_locations: string;
  related_locations: string;
  dictionary: string;
};

export const getMappedDistributorPages = (
  unprocessedAssetsFromExcel: any[]
) => {
  const ocmFieldNames = unprocessedAssetsFromExcel[0];

  const mappedData = unprocessedAssetsFromExcel
    .map((row) => {
      const keys = Object.keys(row);
      const assetType = row["Asset Type"];
      const url = row["URL"];

      const addressFields: OCMAddressFieldsDisplayNames = {};
      const locationPageFields: OCMLocationPageFieldsDisplayNames = {};
      const keysThatBlankShouldHaveDefaultValue: (keyof OCMLocationPageFieldsDisplayNames)[] =
        [
          "Monday (Is Closed)",
          "Monday (Is 24 Hours)",
          "Tuesday (Is Closed)",
          "Tuesday (Is 24 Hours)",
          "Wednesday (Is Closed)",
          "Wednesday (Is 24 Hours)",
          "Thursday (Is Closed)",
          "Thursday (Is 24 Hours)",
          "Friday (Is Closed)",
          "Friday (Is 24 Hours)",
          "Saturday (Is Closed)",
          "Saturday (Is 24 Hours)",
          "Sunday (Is Closed)",
          "Sunday (Is 24 Hours)",
        ];

      keys.forEach((key) => {
        if (ocmFieldNames[key] && key.toLowerCase().includes("ir-address")) {
          const ocmFieldName = ocmFieldNames[key] as keyof typeof addressFields;
          addressFields[ocmFieldName] = row[key];
        }

        if (
          ocmFieldNames[key] &&
          key.toLowerCase().includes("ir-locationpage")
        ) {
          const ocmFieldName = ocmFieldNames[
            key
          ] as keyof typeof locationPageFields;
          locationPageFields[ocmFieldName] = row[key];
        }
      });

      // Add default values
      keysThatBlankShouldHaveDefaultValue.forEach((key) => {
        if (!locationPageFields[key]) {
          locationPageFields[key] = false as any;
        }
      });

      const mappedPageLocationFields: OCMLocationPageFieldsApiNames =
        Object.fromEntries(
          Object.entries(locationPageFields).map(([key, value]) => {
            const keyTyped = key as keyof typeof locationPageFields;

            const mappedValue = mapLocationPageValue(keyTyped, value);

            return [
              locationPageDisplayFieldNames[
                key as keyof typeof locationPageFields
              ],
              mappedValue,
            ];
          })
        );

      const mappedAddressFields: OCMAddressFieldsApiNames = Object.fromEntries(
        Object.entries(addressFields).map(([key, value]) => {
          return [
            addressDisplayFieldNames[key as keyof typeof addressFields],
            value,
          ];
        })
      );

      const fields =
        Object.keys(addressFields).length > 0
          ? mappedAddressFields
          : mappedPageLocationFields;

      return {
        assetType: assetType as string,
        url: url as string,
        fields: fields || {},
      };
    })
    .filter(({ assetType }) => !assetType.toLowerCase().includes("asset-type"));

  const linkedAssets = mappedData
    .filter((asset) => asset.assetType.toLowerCase().includes("page"))
    .map((page) => {
      const assetName = page.url.split("/").pop();
      const url = page.url;
      const addresses = mappedData
        .filter(
          (a) =>
            (a.assetType as string).toLowerCase().includes("ir-address") &&
            a.url === url
        )
        .map((address, i) => ({
          ...address,
          fields: address.fields as OCMAddressFieldsApiNames,
          assetName:
            (address.fields as OCMAddressFieldsApiNames).address_name ||
            `${assetName}-address-${i}`,
        }));

      return {
        ...page,
        internalId: Math.random().toString(36).substring(2, 9),
        fields: page.fields as OCMLocationPageFieldsApiNames,
        addresses: addresses,
        assetName: assetName || EMPTY_DISTRIBUTOR_NAME_STRING,
      };
    });

  console.log("MAPPED", linkedAssets);

  return linkedAssets;
};

/** Converts key-value pair into something that should work with OCM item create API */
const mapLocationPageValue = (
  key: keyof typeof locationPageDisplayFieldNames,
  value: any
) => {
  if (key === value) {
    return value;
  }

  if (
    key === "Monday (Is 24 Hours)" ||
    key === "Monday (Is Closed)" ||
    key === "Tuesday (Is 24 Hours)" ||
    key === "Tuesday (Is Closed)" ||
    key === "Wednesday (Is 24 Hours)" ||
    key === "Wednesday (Is Closed)" ||
    key === "Thursday (Is 24 Hours)" ||
    key === "Thursday (Is Closed)" ||
    key === "Friday (Is 24 Hours)" ||
    key === "Friday (Is Closed)" ||
    key === "Saturday (Is 24 Hours)" ||
    key === "Saturday (Is Closed)" ||
    key === "Sunday (Is 24 Hours)" ||
    key === "Sunday (Is Closed)"
  ) {
    return !!value;
  }

  if (key === "Background Image") {
    return mapIds(value).map((backgroundImageId: string) => ({
      id: backgroundImageId,
      type: IR_IMAGE_TYPE,
    }));
  }

  if (key === "CTAs") {
    return mapIds(value).map((ctaId: string) => ({
      id: ctaId,
      type: IR_STICKY_CTA_TYPE,
    }));
  }

  if (key === "Dictionary") {
    return {
      id: value,
      type: IR_DICTIONARY_TYPE,
    };
  }

  if (key === "Related Products/Services") {
    return mapIds(value).map((relatedProductId: string) => ({
      id: relatedProductId,
    }));
  }

  if (
    key === "Monday" ||
    key === "Tuesday" ||
    key === "Wednesday" ||
    key === "Thursday" ||
    key === "Friday" ||
    key === "Saturday" ||
    key === "Sunday"
  ) {
    return value.includes(";")
      ? value.replace(/ /g, "").split(";")
      : value.replace(/ /g, "").split(",");
  }

  return value;
};

const mapIds = (value: string) => {
  return value.includes(",")
    ? value.replace(/ /g, "").split(",")
    : value.replace(/ /g, "").split(";");
};

export const importDistributorPageToOcm = async ({
  distributorPage,
  repositoryId,
  language,
  channelId
}: {
  distributorPage: ReturnType<typeof getMappedDistributorPages>[0];
  repositoryId: string;
  language: string;
  channelId: string
}) => {
  const addressesOcmIds = (
    await Promise.all(
      distributorPage.addresses.map(async (address) => {
        const addressOcmId = await importAddressToOcm({
          address,
          repositoryId,
          language,
          channelId
        });

        return addressOcmId;
      })
    )
  ).map((addressAssetId) => ({ id: addressAssetId, type: IR_ADDRESS_TYPE }));

  try {
    const distributorPageImportRes = await createItem({
      name: distributorPage.assetName,
      type: distributorPage.assetType,
      description: distributorPage.url,
      repositoryId,
      language,
      fields: {
        ..._.omit(distributorPage.fields, ["url"]),
        /** Workaround - looks like there can be only one address */
        address: addressesOcmIds[0],
      },
    }, [channelId]);

    return {
      distributorPageId: (distributorPageImportRes as { id: string }).id,
      addressesOcmIds,
    };
  } catch (err) {
    console.log("DISTRIBUTOR PAGE IMPORT ERROR", err);
    return {
      distributorPageId: null,
      addressesOcmIds,
      error: err as AxiosError,
    };
  }
};

const importAddressToOcm = async ({
  address,
  repositoryId,
  language,
  channelId
}: {
  address: ReturnType<typeof getMappedDistributorPages>[0]["addresses"][0];
  repositoryId: string;
  language: string;
  channelId: string;
}): Promise<string> => {
  const res = await createItem({
    name: address.assetName,
    type: address.assetType,
    description: "Address asset created from Excel import",
    repositoryId,
    language,
    fields: address.fields,
  }, [channelId]);

  if (res.id) {
    return res.id;
  }

  throw new Error("Could not create address");
};
