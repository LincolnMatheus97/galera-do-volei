import QRCode from "react-qr-code";
import { Inscricao } from "@/types";

interface QRCodeCardProps {
    inscricao: Inscricao;
    nomeEvento: string;
}

export function QRCodeCard({ inscricao, nomeEvento }: QRCodeCardProps) {
    // O valor do QR é o código hash único gerado pelo backend
    const qrValue = inscricao.qrCode || "INVALID";

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 flex flex-col items-center text-center max-w-sm mx-auto">
            <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900">Cartão de Acesso</h3>
                <p className="text-sm text-gray-500">{nomeEvento}</p>
            </div>

            <div className="bg-white p-2 rounded-lg border-2 border-dashed border-gray-300 mb-4">
                <QRCode 
                    value={qrValue} 
                    size={180} 
                    viewBox={`0 0 256 256`}
                />
            </div>

            <p className="text-xs text-gray-400 font-mono break-all mb-4">
                {qrValue}
            </p>

            <div className="w-full bg-green-50 p-3 rounded-lg">
                <p className="text-sm font-semibold text-green-800">
                    Status: {inscricao.status.toUpperCase()}
                </p>
                <p className="text-xs text-green-600 mt-1">
                    Apresente este código na entrada.
                </p>
            </div>
        </div>
    );
}