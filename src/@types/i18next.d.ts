import "i18next";
import resources from "../locales/en.json";

declare module "i18next" {
  interface CustomTypeOptions {
    resources: typeof resources;
  }
}
