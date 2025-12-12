import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import axios from 'axios';
import { formatLongDate, formatTime } from '@/shared/utils/dateFormatter';
import type { PurchasedTicket } from '@/types/purchase';


interface UserInfo {
    name: string;
    dni?: string | number;
}

export const PdfService = {
    generateTicketPdf: async (ticket: PurchasedTicket, user: UserInfo | null) => {
        const isNonEnumeratedTicket = (tk: PurchasedTicket) =>
        (tk.sectorType
            ? tk.sectorType.toLowerCase() === 'nonenumerated'
            : tk.seatNumber == null);

        const nonEnum = isNonEnumeratedTicket(ticket);

        const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' });
        const pageWidth = pdf.internal.pageSize.getWidth();
        let y = 60;

        pdf.setFontSize(24);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(79, 70, 229);
        pdf.text('TicketApp - Entrada Oficial', pageWidth / 2, y, { align: 'center' });
        y += 25;

        pdf.setDrawColor(79, 70, 229);
        pdf.setLineWidth(1);
        pdf.line(40, y, pageWidth - 40, y);
        y += 35;

        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(0, 0, 0);
        pdf.text(ticket.eventName, pageWidth / 2, y, { align: 'center' });
        y += 20;

        pdf.setDrawColor(79, 70, 229);
        pdf.setLineWidth(0.8);
        const titleWidth = pdf.getTextWidth(ticket.eventName);
        pdf.line(pageWidth / 2 - titleWidth / 2 - 5, y, pageWidth / 2 + titleWidth / 2 + 5, y);
        y += 30;

        const printLabel = (label: string, value: string | number) => {
            const xStart = 60;
            const gap = 7;
            const labelText = `${label}:`;
            const labelWidth = pdf.getTextWidth(labelText);

            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(79, 70, 229);
            pdf.text(labelText, xStart, y);

            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(0, 0, 0);
            pdf.text(String(value), xStart + labelWidth + gap, y);

            y += 22;
        };

        printLabel('Fecha', formatLongDate(ticket.date));
        printLabel('Hora', formatTime(ticket.date));
        printLabel('Lugar', ticket.location);
        printLabel('Sector', ticket.sectorName);

        if (!nonEnum) {
            printLabel('Asiento', ticket.seatNumber ?? 'Sin asignar');
            printLabel('ID Ticket', ticket.idTicket);
        }

        y += 20;

        pdf.setDrawColor(200, 200, 200);
        pdf.setLineWidth(0.5);
        pdf.line(40, y, pageWidth - 40, y);
        y += 25;

        if (ticket.imageUrl) {
            try {
                const response = await axios.get(ticket.imageUrl, { responseType: 'blob' });
                const imgData = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(response.data);
                });

                const imgWidth = pageWidth - 100;
                const imgHeight = 160;
                pdf.addImage(imgData, 'JPEG', 50, y, imgWidth, imgHeight);
                y += imgHeight + 30;
            } catch (error) {
                console.warn('Error al cargar imagen para PDF:', error);
            }
        }

        const qrData = nonEnum
            ? `venta:${ticket.idSale}-evento:${ticket.eventId}`
            : `ticket:${ticket.idTicket}-venta:${ticket.idSale}`;

        try {
            const qrImg = await QRCode.toDataURL(qrData, {
                errorCorrectionLevel: 'M',
                type: 'image/png',
                width: 140,
                margin: 1
            });
            pdf.addImage(qrImg, 'PNG', pageWidth / 2 - 70, y, 140, 140);
        } catch (error) {
            console.warn('Error generating QR code:', error);
        }
        y += 170;

        pdf.setDrawColor(79, 70, 229);
        pdf.setLineWidth(0.8);
        pdf.line(40, y, pageWidth - 40, y);
        y += 40;

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(16);
        pdf.setTextColor(79, 70, 229);
        pdf.text('¡Gracias por tu compra!', pageWidth / 2, y, { align: 'center' });
        y += 25;

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(13);
        pdf.setTextColor(0, 0, 0);
        if (user?.name) {
            pdf.text(`Usuario: ${user.name}   DNI: ${user.dni || ''}`, pageWidth / 2, y, { align: 'center' });
            y += 20;
        }

        pdf.setFontSize(12);
        pdf.setTextColor(90, 90, 90);
        pdf.text('Conserva este PDF como comprobante oficial de tu entrada.', pageWidth / 2, y, { align: 'center' });

        pdf.save(`entrada-${ticket.eventName.replace(/\s+/g, '-')}-${ticket.idSale}${nonEnum ? '' : `-${ticket.idTicket}`}.pdf`);
    }
};
