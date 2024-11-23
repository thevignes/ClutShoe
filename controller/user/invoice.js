const User = require('../../models/userModel')
const Order = require('../../models/order')
const pdfPDFDocument = require('pdfkit')
const fs = require('fs')
const path = require('path')

const generateInvoice = async (req,res)=>{
    try {
        console.log('Starting invoice generation for order ID:', req.params.id);
        const orderId = req.params.id;
        
        const order = await Order.findOne({ oid: orderId }).populate('products.productId');
        console.log('Order found:', order);

        if(!order){
            return res.status(404).json({message:"Order not found"});
        }

        const user = await User.findById(order.userId);
        console.log('User found:', user);

        if(!user){
            return res.status(404).json({message:"User not found"});
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=invoice-${order.oid}.pdf`);

       
        const pdfDoc = new pdfPDFDocument({
            size: 'A4',
            margins: { top: 50, bottom: 50, left: 50, right: 50 }
        });

        pdfDoc.pipe(res);

        // Try multiple logo paths and formats
        const logoPaths = [
            'c:/Users/vigne/OneDrive/Desktop/Myproject/public/public/evara-frontend/assets/imgs/shop/clutchshoe.jpg',
            'c:/Users/vigne/OneDrive/Desktop/Myproject/public/public/evara-frontend/assets/imgs/theme/logo.png',
            'c:/Users/vigne/OneDrive/Desktop/Myproject/public/logo.png'
        ];

        let logoLoaded = false;
        for (const logoPath of logoPaths) {
            if (logoLoaded) break;
            
            console.log('Attempting to load logo from:', logoPath);
            try {
                if (fs.existsSync(logoPath)) {
                    const imageData = fs.readFileSync(logoPath);
                    const dimensions = require('image-size')(logoPath);
                    console.log('Image dimensions:', dimensions);
                    
                    const width = 100;
                    const height = (width * dimensions.height) / dimensions.width;
                    
                    pdfDoc.image(imageData, 50, 45, { 
                        width: width,
                        height: height
                    });
                    logoLoaded = true;
                    console.log('Successfully loaded logo from:', logoPath);
                    break;
                }
            } catch(err) {
                console.error('Error loading logo from', logoPath, ':', err);
            }
        }

        if (!logoLoaded) {
            console.log('Could not load any logo, continuing without it');
        }

        pdfDoc.fontSize(20)
            .text('ClutchShoe', 160, 50)
            .fontSize(10)
            .text('Your Ultimate Shopping Destination', 160, 75)
            .text('www.ClutchShoe.com | support@ClutchShoe.com', 160, 90);

   
        pdfDoc.moveTo(50, 120)
            .lineTo(545, 120)
            .stroke();

        pdfDoc.fontSize(20)
            .text('INVOICE', 50, 140, { align: 'center' })
            .moveDown();

  
        pdfDoc.fontSize(10);
        
      
        pdfDoc.text('BILL TO:', 50, 180, { bold: true })
            .font('Helvetica')
            .text(`${order.address.Firstname} ${order.address.Lastname}`, 50, 195)
            .text(`${order.address.city}, ${order.address.state}`, 50, 210)
            .text(`${order.address.country} - ${order.address.pin}`, 50, 225);

        pdfDoc.text('INVOICE DETAILS:', 300, 180, { bold: true })
            .text(`Invoice No: ${order.oid}`, 300, 195)
            .text(`Date: ${new Date().toLocaleDateString()}`, 300, 210)
            .text(`Payment Method: ${order.paymentMethod}`, 300, 225);


        const tableTop = 270;
        const tableHeaders = ['Product', 'Quantity', 'Price', 'Total'];
        const columnWidths = [250, 70, 85, 85];
        

        pdfDoc.fillColor('#f6f6f6')
            .rect(50, tableTop, 495, 20)
            .fill()
            .fillColor('#000');


        pdfDoc.font('Helvetica-Bold');
        let xPosition = 60;
        tableHeaders.forEach((header, i) => {
            pdfDoc.text(header, xPosition, tableTop + 5);
            xPosition += columnWidths[i];
        });


        pdfDoc.font('Helvetica');
        let yPosition = tableTop + 25;

        order.products.forEach((item, index) => {
            const product = item.productId;
            if (product) {
             
                if (index % 2 === 0) {
                    pdfDoc.fillColor('#fcfcfc')
                        .rect(50, yPosition - 5, 495, 20)
                        .fill()
                        .fillColor('#000');
                }

                

                xPosition = 60;
                pdfDoc.text(product.productName, xPosition, yPosition, { width: 240 });
                xPosition += columnWidths[0];
                
                pdfDoc.text(item.quantity.toString(), xPosition, yPosition);
                xPosition += columnWidths[1];
                
                pdfDoc.text(`$${item.price.toFixed(2)}`, xPosition, yPosition);
                xPosition += columnWidths[2];
                
                pdfDoc.text(`${(item.quantity * item.price).toFixed(2)}`, xPosition, yPosition);
                
                yPosition += 20;
            }
        });

        pdfDoc.moveTo(50, yPosition + 10)
            .lineTo(545, yPosition + 10)
            .stroke();

        const totalSection = yPosition + 20;
        pdfDoc.font('Helvetica-Bold')
            .text('Subtotal:', 380, totalSection)
            .text('Discount:', 380, totalSection + 20)
            .text('Total Amount:', 380, totalSection + 40)
            .font('Helvetica')
            .text(`${(order.total + (order.discount || 0)).toFixed(2)}`, 480, totalSection)
            .text(`-${(order.DiscountAmount || 0).toFixed(2)}`, 480, totalSection + 20)
            .font('Helvetica-Bold')
            .text(`${order.total.toFixed(2)}`, 480, totalSection + 40);

        // const footerTop = pdfDoc.page.height - 100;
        // pdfDoc.font('Helvetica')
        //     .fontSize(10)
        //     .fillColor('#666')
        //     .text('Thank you for shopping with ClutchShoe!', 50, footerTop, { align: 'center' })
        //     .moveDown(0.5)
        //     .text('For any questions about this invoice, please contact', { align: 'center' })
        //     .text('support@ClutchShoe.com | +1 (555) 123-4567', { align: 'center' });

        // // Add page numbers
        // const pageCount = pdfDoc.bufferedPageRange().count;
        // for (let i = 0; i < pageCount; i++) {
        //     pdfDoc.switchToPage(i);
        //     pdfDoc.text(`Page ${i + 1} of ${pageCount}`, 50, pdfDoc.page.height - 50, {
        //         align: 'center',
        //         size: 8
        //     });
        // }

        pdfDoc.end();
        console.log('PDF generation completed');
    } catch(error) {
        console.error('Invoice generation error:', error);
        res.status(500).json({
            message: "Failed to generate invoice",
            error: error.message
        });
    }
}

module.exports = {
    generateInvoice
}