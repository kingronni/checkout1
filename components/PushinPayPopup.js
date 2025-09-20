import { useState } from 'react';
import { FU5 as CloseIcon } from '../js/795d4814-f0fa062bec795e7e.js';
import { C3L as CopyIcon } from '../js/ee560e2c-3b7da12dd36bd970.js';

export default function PushinPayPopup({ isOpen, onClose, value }) {
  const [pixData, setPixData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const generatePix = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/pushinpay.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          value: Math.round(value * 100) // Converte para centavos
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao gerar PIX');
      }

      setPixData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyPixCode = async () => {
    if (pixData?.pix_code) {
      try {
        await navigator.clipboard.writeText(pixData.pix_code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Erro ao copiar:', err);
      }
    }
  };

  const handleClose = () => {
    setPixData(null);
    setError(null);
    setCopied(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            Pagamento via PIX
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <CloseIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Valor */}
          <div className="text-center mb-6">
            <p className="text-gray-600 mb-2">Valor a pagar:</p>
            <p className="text-3xl font-bold text-green-600">
              R$ {value.toFixed(2).replace('.', ',')}
            </p>
          </div>

          {!pixData && !loading && !error && (
            <div className="text-center">
              <button
                onClick={generatePix}
                className="bg-primary text-white px-8 py-3 rounded-xl font-medium hover:bg-opacity-90 transition-all"
              >
                Gerar PIX
              </button>
            </div>
          )}

          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Gerando código PIX...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
              <p className="text-red-600 font-medium mb-2">Erro</p>
              <p className="text-red-500 text-sm">{error}</p>
              <button
                onClick={generatePix}
                className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {pixData && (
            <div className="space-y-6">
              {/* QR Code */}
              {pixData.qr_code && (
                <div className="text-center">
                  <p className="text-gray-600 mb-4">Escaneie o QR Code:</p>
                  <div className="bg-white p-4 rounded-xl border-2 border-gray-200 inline-block">
                    <img
                      src={`data:image/png;base64,${pixData.qr_code}`}
                      alt="QR Code PIX"
                      className="w-48 h-48 mx-auto"
                    />
                  </div>
                </div>
              )}

              {/* Código PIX */}
              {pixData.pix_code && (
                <div>
                  <p className="text-gray-600 mb-2 text-center">
                    Ou copie o código PIX:
                  </p>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <code className="text-sm text-gray-800 break-all flex-1 mr-3">
                        {pixData.pix_code}
                      </code>
                      <button
                        onClick={copyPixCode}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                          copied
                            ? 'bg-green-100 text-green-700'
                            : 'bg-primary text-white hover:bg-opacity-90'
                        }`}
                      >
                        <CopyIcon className="w-4 h-4" />
                        {copied ? 'Copiado!' : 'Copiar'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Instruções */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h3 className="font-medium text-blue-800 mb-2">
                  Como pagar:
                </h3>
                <ol className="text-sm text-blue-700 space-y-1">
                  <li>1. Abra o app do seu banco</li>
                  <li>2. Escolha a opção PIX</li>
                  <li>3. Escaneie o QR Code ou cole o código</li>
                  <li>4. Confirme o pagamento</li>
                </ol>
              </div>

              {/* Informações adicionais */}
              {pixData.expires_at && (
                <div className="text-center text-sm text-gray-500">
                  <p>Este PIX expira em: {new Date(pixData.expires_at).toLocaleString('pt-BR')}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-6">
          <div className="flex items-center justify-center text-sm text-gray-500">
            <img src="/images/safe.2680cafb.svg" alt="Seguro" className="w-5 h-5 mr-2" />
            Pagamento 100% seguro via PushinPay
          </div>
        </div>
      </div>
    </div>
  );
}