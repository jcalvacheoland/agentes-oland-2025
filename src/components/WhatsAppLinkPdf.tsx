import { WhatsAppIcon } from "./icons/WhatsApp";

interface WhatsAppHTMLProps {
  numberPhone?: string|null;
  nombre?: string|null;
  pdfUrl: string;
  version: number;
}

export const WhatsAppLinkPdf = ({
  numberPhone,
  nombre,
  pdfUrl,
  version,
}: WhatsAppHTMLProps) => {
  const mensaje = encodeURIComponent(
    `Hola ${nombre}, te envío la cotización . Puedes verla aquí: ${pdfUrl}`
  );

  return (
    <a
      href={`https://api.whatsapp.com/send?phone=${numberPhone}&text=${mensaje}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-medium transition-all"
    >
      <WhatsAppIcon />
      Enviar por WhatsApp
    </a>
  );
};
