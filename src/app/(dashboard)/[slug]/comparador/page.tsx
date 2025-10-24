import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { searchJustCotizacionByBitrixId } from '@/actions/cotizaciones.actions';

export default async function PageComparador({
  params,
}: {
  params: Promise<{ slug: string }>
}) {


  const { slug } = await params;
  const cotizacion = await searchJustCotizacionByBitrixId(slug);

  
  return (
    <div>
      <h1>Comparador: {slug}</h1>
      
      <Button asChild variant="oland" className="cursor-pointer">
        <Link href={`/${slug}`}>Volver a {slug}</Link>
      </Button>

      <h1>{cotizacion?.bitrixDealId}</h1>
    </div>
  )
}