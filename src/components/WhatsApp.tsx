import { WhatsAppIcon } from "./icons/WhatsApp";

interface WhatsAppHTMLProps {
  numberPhone: string;
}

export const WhatsAppHTML = ({ numberPhone }: WhatsAppHTMLProps) => {
  return (
    <div>
      <a
        href={`https://api.whatsapp.com/send?phone=${numberPhone}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-green-600 font-semibold hover:underline hover:text-green-700 transition-colors"
      >
        <WhatsAppIcon />
        Consulta con tu asesor.
      </a>
    </div>
  );
};
