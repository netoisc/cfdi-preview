
import React from 'react';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CFDIData } from '@/pages/Index';

interface CFDIViewerProps {
  data: CFDIData;
}

export const CFDIViewer: React.FC<CFDIViewerProps> = ({ data }) => {
  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount);
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: data.moneda || 'MXN'
    }).format(num);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getTipoComprobanteText = (tipo: string) => {
    const tipos: { [key: string]: string } = {
      'I': 'Ingreso',
      'E': 'Egreso',
      'T': 'Traslado',
      'N': 'Nómina',
      'P': 'Pago'
    };
    return tipos[tipo] || tipo;
  };

  return (
    <Card className="max-w-4xl mx-auto bg-white shadow-lg">
      {/* Header */}
      <div className="bg-blue-600 text-white p-6 rounded-t-lg">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Comprobante Fiscal Digital por Internet
            </h1>
            <p className="text-blue-100">
              {getTipoComprobanteText(data.tipoDeComprobante)} • Versión {data.version}
            </p>
          </div>
          <div className="text-right">
            {data.serie && (
              <p className="text-lg">
                <span className="text-blue-200">Serie:</span> {data.serie}
              </p>
            )}
            {data.folio && (
              <p className="text-lg">
                <span className="text-blue-200">Folio:</span> {data.folio}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Fecha y UUID */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Fecha de Emisión</h3>
            <p className="text-gray-900">{formatDate(data.fecha)}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">UUID</h3>
            <p className="text-gray-900 font-mono text-sm break-all">
              {data.timbreFiscal.uuid}
            </p>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Emisor y Receptor */}
        <div className="grid md:grid-cols-2 gap-8 mb-6">
          {/* Emisor */}
          <div>
            <h3 className="font-bold text-lg text-gray-800 mb-3 pb-2 border-b border-gray-200">
              Emisor
            </h3>
            <div className="space-y-2">
              <div>
                <span className="font-semibold text-gray-600">RFC:</span>
                <p className="text-gray-900 font-mono">{data.emisor.rfc}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-600">Nombre:</span>
                <p className="text-gray-900">{data.emisor.nombre}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-600">Régimen Fiscal:</span>
                <p className="text-gray-900">{data.emisor.regimenFiscal}</p>
              </div>
            </div>
          </div>

          {/* Receptor */}
          <div>
            <h3 className="font-bold text-lg text-gray-800 mb-3 pb-2 border-b border-gray-200">
              Receptor
            </h3>
            <div className="space-y-2">
              <div>
                <span className="font-semibold text-gray-600">RFC:</span>
                <p className="text-gray-900 font-mono">{data.receptor.rfc}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-600">Nombre:</span>
                <p className="text-gray-900">{data.receptor.nombre}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-600">Uso CFDI:</span>
                <p className="text-gray-900">{data.receptor.usoCFDI}</p>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Conceptos */}
        <div className="mb-6">
          <h3 className="font-bold text-lg text-gray-800 mb-4">Conceptos</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">
                    Cantidad
                  </th>
                  <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">
                    Unidad
                  </th>
                  <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">
                    Descripción
                  </th>
                  <th className="border border-gray-200 px-4 py-3 text-right font-semibold text-gray-700">
                    Valor Unitario
                  </th>
                  <th className="border border-gray-200 px-4 py-3 text-right font-semibold text-gray-700">
                    Importe
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.conceptos.map((concepto, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-200 px-4 py-3">
                      {concepto.cantidad}
                    </td>
                    <td className="border border-gray-200 px-4 py-3">
                      {concepto.unidad || concepto.claveUnidad}
                    </td>
                    <td className="border border-gray-200 px-4 py-3">
                      <div>
                        <p className="font-medium">{concepto.descripcion}</p>
                        <p className="text-sm text-gray-500">
                          Clave: {concepto.claveProdServ}
                        </p>
                      </div>
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-right">
                      {formatCurrency(concepto.valorUnitario)}
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-right font-semibold">
                      {formatCurrency(concepto.importe)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Impuestos y Totales */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Impuestos */}
          {data.impuestos && data.impuestos.traslados && data.impuestos.traslados.length > 0 && (
            <div>
              <h3 className="font-bold text-lg text-gray-800 mb-4">Impuestos</h3>
              <div className="space-y-2">
                {data.impuestos.traslados.map((impuesto, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <span className="font-medium">{impuesto.impuesto}</span>
                      <span className="text-sm text-gray-600 ml-2">
                        ({parseFloat(impuesto.tasaOCuota) * 100}%)
                      </span>
                    </div>
                    <span className="font-semibold">
                      {formatCurrency(impuesto.importe)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Totales */}
          <div>
            <h3 className="font-bold text-lg text-gray-800 mb-4">Totales</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="font-medium">Subtotal:</span>
                <span className="font-semibold">{formatCurrency(data.subTotal)}</span>
              </div>
              {data.impuestos?.totalImpuestosTrasladados && (
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="font-medium">Impuestos:</span>
                  <span className="font-semibold">
                    {formatCurrency(data.impuestos.totalImpuestosTrasladados)}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center p-4 bg-blue-50 border border-blue-200 rounded">
                <span className="font-bold text-lg text-blue-800">Total:</span>
                <span className="font-bold text-xl text-blue-800">
                  {formatCurrency(data.total)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Timbre Fiscal */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-bold text-lg text-green-800 mb-3">Timbre Fiscal Digital</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold text-green-700">Fecha de Timbrado:</span>
              <p className="text-green-900">{formatDate(data.timbreFiscal.fechaTimbrado)}</p>
            </div>
            <div>
              <span className="font-semibold text-green-700">No. Certificado SAT:</span>
              <p className="text-green-900 font-mono">{data.timbreFiscal.noCertificadoSAT}</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
