
import React, { useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { CFDIData } from '@/pages/Index';

interface FileUploadProps {
  onFileUpload: (data: CFDIData) => void;
  onError: (error: string) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, onError }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseCFDI = (xmlContent: string): CFDIData => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
    
    // Check for parsing errors
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      throw new Error('El archivo XML no está bien formado');
    }

    // Find the root comprobante element (could have different namespaces)
    const comprobante = xmlDoc.querySelector('Comprobante, comprobante') || 
                       xmlDoc.querySelector('[*|localName="Comprobante"]') ||
                       xmlDoc.documentElement;
    
    if (!comprobante) {
      throw new Error('No se encontró el elemento Comprobante en el XML');
    }

    // Check for TimbreFiscalDigital to validate it's a CFDI
    const timbreFiscal = xmlDoc.querySelector('TimbreFiscalDigital, tfd\\:TimbreFiscalDigital, [*|localName="TimbreFiscalDigital"]');
    if (!timbreFiscal) {
      throw new Error('Este XML no parece ser un CFDI válido (no se encontró TimbreFiscalDigital)');
    }

    // Extract emisor data
    const emisorElement = comprobante.querySelector('Emisor, emisor, [*|localName="Emisor"]');
    if (!emisorElement) {
      throw new Error('No se encontró información del emisor');
    }

    // Extract receptor data
    const receptorElement = comprobante.querySelector('Receptor, receptor, [*|localName="Receptor"]');
    if (!receptorElement) {
      throw new Error('No se encontró información del receptor');
    }

    // Extract conceptos
    const conceptosElements = comprobante.querySelectorAll('Concepto, concepto, [*|localName="Concepto"]');
    if (conceptosElements.length === 0) {
      throw new Error('No se encontraron conceptos en el CFDI');
    }

    // Extract impuestos if they exist
    const impuestosElement = comprobante.querySelector('Impuestos, impuestos, [*|localName="Impuestos"]');
    const trasladosElements = impuestosElement?.querySelectorAll('Traslado, traslado, [*|localName="Traslado"]') || [];

    const cfdiData: CFDIData = {
      version: comprobante.getAttribute('Version') || comprobante.getAttribute('version') || '4.0',
      serie: comprobante.getAttribute('Serie') || comprobante.getAttribute('serie') || undefined,
      folio: comprobante.getAttribute('Folio') || comprobante.getAttribute('folio') || undefined,
      fecha: comprobante.getAttribute('Fecha') || comprobante.getAttribute('fecha') || '',
      tipoDeComprobante: comprobante.getAttribute('TipoDeComprobante') || comprobante.getAttribute('tipoDeComprobante') || '',
      moneda: comprobante.getAttribute('Moneda') || comprobante.getAttribute('moneda') || 'MXN',
      subTotal: comprobante.getAttribute('SubTotal') || comprobante.getAttribute('subTotal') || '0',
      total: comprobante.getAttribute('Total') || comprobante.getAttribute('total') || '0',
      emisor: {
        rfc: emisorElement.getAttribute('Rfc') || emisorElement.getAttribute('rfc') || '',
        nombre: emisorElement.getAttribute('Nombre') || emisorElement.getAttribute('nombre') || '',
        regimenFiscal: emisorElement.getAttribute('RegimenFiscal') || emisorElement.getAttribute('regimenFiscal') || ''
      },
      receptor: {
        rfc: receptorElement.getAttribute('Rfc') || receptorElement.getAttribute('rfc') || '',
        nombre: receptorElement.getAttribute('Nombre') || receptorElement.getAttribute('nombre') || '',
        usoCFDI: receptorElement.getAttribute('UsoCFDI') || receptorElement.getAttribute('usoCFDI') || ''
      },
      conceptos: Array.from(conceptosElements).map(concepto => ({
        claveProdServ: concepto.getAttribute('ClaveProdServ') || concepto.getAttribute('claveProdServ') || '',
        cantidad: concepto.getAttribute('Cantidad') || concepto.getAttribute('cantidad') || '1',
        claveUnidad: concepto.getAttribute('ClaveUnidad') || concepto.getAttribute('claveUnidad') || '',
        unidad: concepto.getAttribute('Unidad') || concepto.getAttribute('unidad') || undefined,
        descripcion: concepto.getAttribute('Descripcion') || concepto.getAttribute('descripcion') || '',
        valorUnitario: concepto.getAttribute('ValorUnitario') || concepto.getAttribute('valorUnitario') || '0',
        importe: concepto.getAttribute('Importe') || concepto.getAttribute('importe') || '0'
      })),
      impuestos: impuestosElement ? {
        totalImpuestosTrasladados: impuestosElement.getAttribute('TotalImpuestosTrasladados') || 
                                  impuestosElement.getAttribute('totalImpuestosTrasladados') || undefined,
        traslados: Array.from(trasladosElements).map(traslado => ({
          impuesto: traslado.getAttribute('Impuesto') || traslado.getAttribute('impuesto') || '',
          tipoFactor: traslado.getAttribute('TipoFactor') || traslado.getAttribute('tipoFactor') || '',
          tasaOCuota: traslado.getAttribute('TasaOCuota') || traslado.getAttribute('tasaOCuota') || '',
          importe: traslado.getAttribute('Importe') || traslado.getAttribute('importe') || ''
        }))
      } : undefined,
      timbreFiscal: {
        uuid: timbreFiscal.getAttribute('UUID') || timbreFiscal.getAttribute('uuid') || '',
        fechaTimbrado: timbreFiscal.getAttribute('FechaTimbrado') || timbreFiscal.getAttribute('fechaTimbrado') || '',
        selloCFD: timbreFiscal.getAttribute('SelloCFD') || timbreFiscal.getAttribute('selloCFD') || '',
        noCertificadoSAT: timbreFiscal.getAttribute('NoCertificadoSAT') || timbreFiscal.getAttribute('noCertificadoSAT') || ''
      }
    };

    return cfdiData;
  };

  const processFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.xml')) {
      onError('Por favor selecciona un archivo XML válido');
      return;
    }

    setIsProcessing(true);
    
    try {
      const content = await file.text();
      const cfdiData = parseCFDI(content);
      onFileUpload(cfdiData);
    } catch (error) {
      console.error('Error processing CFDI:', error);
      onError(error instanceof Error ? error.message : 'Error al procesar el archivo CFDI');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  return (
    <Card className={`p-8 border-2 border-dashed transition-all ${
      isDragOver 
        ? 'border-blue-400 bg-blue-50' 
        : 'border-gray-300 hover:border-gray-400'
    }`}>
      <div
        className="text-center cursor-pointer"
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onClick={() => fileInputRef.current?.click()}
      >
        <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        
        {isProcessing ? (
          <div>
            <p className="text-lg font-medium text-gray-700 mb-2">
              Procesando archivo CFDI...
            </p>
            <div className="animate-pulse bg-blue-200 h-2 rounded-full"></div>
          </div>
        ) : (
          <div>
            <p className="text-lg font-medium text-gray-700 mb-2">
              {isDragOver ? 'Suelta el archivo aquí' : 'Arrastra tu archivo XML de CFDI aquí'}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              o haz clic para seleccionar un archivo
            </p>
            <div className="text-xs text-gray-400">
              Solo archivos XML de CFDI válidos
            </div>
          </div>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".xml"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </Card>
  );
};
