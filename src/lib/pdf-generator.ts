import { jsPDF } from 'jspdf'
import 'jspdf-autotable'

interface CardDetails {
  title: string
  description: string
  startDate: Date
  endDate: Date
  location?: string
  capacity?: number
  imageUrl?: string
  design?: {
    template: string
    [key: string]: any
  }
}

const addImage = async (doc: jsPDF, imageUrl: string) => {
  if (!imageUrl) return 0;
  
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });

    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = base64;
    });

    const aspectRatio = img.width / img.height;
    const maxWidth = 170;
    const width = Math.min(maxWidth, img.width);
    const height = width / aspectRatio;

    doc.addImage(base64, 'JPEG', 20, 30, width, height);
    return height + 40; // Return the height plus padding
  } catch (error) {
    console.error('Error adding image to PDF:', error);
    return 0;
  }
};

const applyDesignTemplate = (doc: jsPDF, design?: { template: string }) => {
  switch (design?.template) {
    case 'modern':
      doc.setTextColor(33, 33, 33);
      doc.setFont('helvetica', 'normal');
      break;
    case 'classic':
      doc.setTextColor(0, 0, 0);
      doc.setFont('times', 'normal');
      break;
    case 'minimalist':
      doc.setTextColor(51, 51, 51);
      doc.setFont('helvetica', 'light');
      break;
    case 'creative':
      doc.setTextColor(89, 0, 179);
      doc.setFont('helvetica', 'bold');
      break;
    case 'tech':
      doc.setTextColor(0, 128, 255);
      doc.setFont('courier', 'normal');
      break;
    default:
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
  }
};

export const generateCardPDF = async (card: CardDetails, type: 'event' | 'activity') => {
  const doc = new jsPDF()
  
  // Apply design template
  applyDesignTemplate(doc, card.design);

  // Add title
  doc.setFontSize(24)
  doc.text(card.title, 20, 20)

  let yPosition = 30;

  // Add image if exists
  if (card.imageUrl) {
    const imageHeight = await addImage(doc, card.imageUrl);
    yPosition += imageHeight;
  }

  // Add details
  doc.setFontSize(12)
  doc.text(`${type.charAt(0).toUpperCase() + type.slice(1)} Details:`, 20, yPosition)

  const details = [
    ['Start Date:', new Date(card.startDate).toLocaleString()],
    ['End Date:', new Date(card.endDate).toLocaleString()],
    ['Location:', card.location || 'Not specified'],
    ['Capacity:', card.capacity?.toString() || 'Unlimited'],
  ]

  // @ts-ignore (jspdf-autotable types are not properly recognized)
  doc.autoTable({
    startY: yPosition + 5,
    head: [],
    body: details,
    theme: 'plain',
    styles: { fontSize: 12, cellPadding: 5 },
    columnStyles: {
      0: { fontStyle: 'bold' },
    },
  })

  // Add description
  if (card.description) {
    doc.text('Description:', 20, doc.lastAutoTable.finalY + 20)
    const splitDescription = doc.splitTextToSize(card.description, 170)
    doc.text(splitDescription, 20, doc.lastAutoTable.finalY + 30)
  }

  // Generate download
  doc.save(`${card.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${type}.pdf`)
}
