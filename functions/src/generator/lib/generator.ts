import * as ejs from "ejs";
import * as markdownToPDf from "markdown-pdf";
import * as os from "os";

import ConventionEn from "../templates/convention_en";
import ConventionFr from "../templates/convention_fr";
import InvoiceFr from "../templates/invoice_fr";
import ProformaInvoiceFr from "../templates/proforma_invoice_fr";

function getSponsoringFees(sponsoring: string): [string, number, number] {
  switch (sponsoring) {
    case "Party":
      return ["cinq milles euros", 5000, 4];
    case "Bronze":
      return ["deux milles euros", 2000, 4];
    case "Silver":
      return ["cinq milles euros", 5000, 6];
    case "Gold":
      return ["neuf milles euros", 9000, 10];

    default:
      return ["douze milles", 1200, 12];
  }
}

function generateFile(config: any, fileName: string, fileFr: any, settings: any, invoiceType: any) {
  const getOfficialName = () => {
    if (!!config.officialName) {
      return config.officialName;
    }
    return config.name;
  };
  const DATE = new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date());

  const [SPONSORING_TEXT, SPONSORING_NUMBER, NUMBER_PLACE] = getSponsoringFees(config.sponsoring);
  return new Promise((resolve, reject) => {
    const data = {
      COMPANY: getOfficialName(),
      SIRET: config.siret,
      COMPANY_ADDRESS: config.address,
      COMPANY_CP: config.zipCode,
      COMPANY_CITY: config.city,
      COMPANY_PERSON: config.representant,
      CONTACT: config.representant,
      ROLE: config.role,
      DEVFEST_EDITION: settings.convention.edition,
      NUMBER_PLACE,
      SPONSORING: config.sponsoring,
      PO: config.PO,
      SPONSORING_TEXT,
      SPONSORING_NUMBER,
      START_DATE: settings.convention.startdate,
      END_DATE: settings.convention.enddate,
      DATE,
      GDG_CP: settings.gdg.zipcode,
      GDG_ADDRESS: settings.gdg.address,
      GDG_CITY: settings.gdg.city,
      INVOICE_NUMBER: config.invoiceNumber,
      INVOICE_TYPE: invoiceType,
    };
    try {
      console.log("Generator:", "generate " + fileName);
      const str = ejs.render(fileFr, data);
      markdownToPDf({
        paperBorder: "3cm",
      })
        .from.string(str)
        .to(os.tmpdir() + "/" + fileName, () => {
          resolve(fileName);
        });
    } catch (e) {
      console.log("Generator:", "error when generating " + fileName, e);

      reject(e);
    }
  });
}

export function generateProformaInvoice(config: any, settings: any) {
  return generateFile(config, `proforma_invoice_${config.id}.pdf`, ProformaInvoiceFr, settings, "FACTURE PRO FORMA");
}
export function generateDevis(config: any, settings: any) {
  return generateFile(config, `devis_${config.id}.pdf`, ProformaInvoiceFr, settings, "DEVIS");
}
export function generateDepositInvoice(config: any, settings: any) {
  return generateFile(config, `deposit_invoice_${config.id}.pdf`, ProformaInvoiceFr, settings, "FACTURE ACCOMPTE 100%");
}
export function generateInvoice(config: any, settings: any) {
  return generateFile(config, `invoice_${config.id}.pdf`, InvoiceFr, settings, "");
}
export function generateConvention(config: any, settings: any) {
  return generateFile(
    config,
    `convention_${config.id}.pdf`,
    config.lang === "fr" ? ConventionFr : ConventionEn,
    settings,
    ""
  );
}
