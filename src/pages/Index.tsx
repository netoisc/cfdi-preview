
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { FileUpload } from '@/components/FileUpload';
import { CFDIViewer } from '@/components/CFDIViewer';

export interface CFDIData {
  version: string;
  serie?: string;
  folio?: string;
  fecha: string;
  tipoDeComprobante: string;
  moneda: string;
  subTotal: string;
  total: string;
  emisor: {
    rfc: string;
    nombre: string;
    regimenFiscal: string;
  };
  receptor: {
    rfc: string;
    nombre: string;
    usoCFDI: string;
  };
  conceptos: Array<{
    claveProdServ: string;
    cantidad: string;
    claveUnidad: string;
    unidad?: string;
    descripcion: string;
    valorUnitario: string;
    importe: string;
  }>;
  impuestos?: {
    totalImpuestosTrasladados?: string;
    traslados?: Array<{
      impuesto: string;
      tipoFactor: string;
      tasaOCuota: string;
      importe: string;
    }>;
  };
  timbreFiscal: {
    uuid: string;
    fechaTimbrado: string;
    selloCFD: string;
    noCertificadoSAT: string;
  };
}

const Index = () => {
  const [cfdiData, setCfdiData] = useState<CFDIData | null>(null);
  const [error, setError] = useState<string>('');

  const handleFileUpload = (data: CFDIData) => {
    setCfdiData(data);
    setError('');
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setCfdiData(null);
  };

  const handleReset = () => {
    setCfdiData(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Visor de CFDI
          </h1>
          <p className="text-lg text-gray-600">
            Arrastra y suelta tu archivo XML de CFDI para visualizar la factura
          </p>
        </div>

        {!cfdiData ? (
          <div className="max-w-2xl mx-auto">
            <FileUpload onFileUpload={handleFileUpload} onError={handleError} />
            {error && (
              <Card className="mt-4 p-4 border-red-200 bg-red-50">
                <p className="text-red-700">{error}</p>
              </Card>
            )}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="mb-4 text-center">
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Subir otro CFDI
              </button>
            </div>
            <CFDIViewer data={cfdiData} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
