const { MongoDBCollectionNamespace } = require('mongodb')
const Product = require ('../../models/product')

const User = require('../../models/userModel')
const fs = require ('fs')
const Sharp = require('sharp')
const path = require('path')
const Category = require('../../models/categoryModel')



const ProductList = async (req,res)=>{
    try {
        const currentPage = parseInt(req.query.page ) || 1
        const itemsPerPage = 6;

        const totalProduct = await Product.countDocuments();
        
        const totalPages = Math.ceil(totalProduct/itemsPerPage);
        console.log(totalPages);
        console.log(currentPage);
        const skip = (currentPage-1)*itemsPerPage;
        
        const products = await Product.find()
            .populate({
                path: 'category',
                select: 'name'
            })
            .skip(skip)
            .limit(itemsPerPage);

        res.render('product',{products,currentPage,totalPages});
    } catch (error) {
         console.log(error);
         res.status(500).send('Server Error');
    }
    
}

const AddProductPage = async (req,res) => {
   
        try {
            const category = await Category.find({isListed:true})
            res.render('addProduct',{
                cate:category
            })
        } catch (error) {
             console.log(error)
             res.status(500).send('Server Error')
            
        }
    
}




const addProduct = async (req, res) => {
            
    try {
        console.log("Processing the product addition...");
  
        const {
            productName, 
            description, 
            price, 
            images, 
            sizes, 
            quantities,
            category, 
            regularPrice, 
            salePrice, 
            colors, 
            review, 
            isListed, 
            stock, 
            status
        } = req.body;
        
        console.log(req.body);
   
        const productExist = await Product.findOne({ productName });
        if (productExist) {
            return res.status(400).json({ error: 'Product already exists' });
        }

        const uploadImages = [];
        if (req.files && req.files.length > 0) {
            for (let i = 0; i < req.files.length; i++) {
                const originalImagePath = req.files[i].path;
                const resizedImagesPath = path.join('public', 'public', 'uploads', 're-image', req.files[i].filename);
                const resizedFilename = Date.now() + req.files[i].filename;
                const rePath = path.join('public', 'public', 'uploads', 're-image', resizedFilename);
                
                const supportedFormats = ['image/jpeg', 'image/png', 'image/webp'];
                if (!supportedFormats.includes(req.files[i].mimetype)) {
                    return res.status(400).json({ error: 'Unsupported image format' });
                }

                try {
                    await Sharp(resizedImagesPath)
                        .resize({ width: 440, height: 440 })
                        .toFile(rePath); 
                } catch (sharpError) {
                    console.log('Error processing image with Sharp:', sharpError);
                    return res.status(500).json({ error: 'Error processing image' });
                }

                uploadImages.push(resizedFilename); 
            }
        }

        const categoryData = await Category.findOne({ name: category });
        if (!categoryData) {
            return res.status(404).json({ error: 'Category not found' });
        }

        // Process sizes and quantities
        let sizeQuantitiesArray = [];
        if (Array.isArray(sizes) && Array.isArray(quantities)) {
            sizeQuantitiesArray = sizes.map((size, index) => ({
                size: Number(size),
                quantity: Number(quantities[index] || 0)
            }));
        } else if (typeof sizes === 'string' && typeof quantities === 'string') {
            sizeQuantitiesArray = [{
                size: Number(sizes),
                quantity: Number(quantities || 0)
            }];
        }

        // Calculate total stock from size quantities
        const totalStock = sizeQuantitiesArray.reduce((sum, item) => sum + item.quantity, 0);

        const newProduct = new Product({
            productName,
            description,
            images: uploadImages,
            category: categoryData?._id,
            regularPrice,
            salePrice,
            sizes: sizeQuantitiesArray,
            colors,
            isListed,
            stock: totalStock,
            review,
            status
        });
    
        await newProduct.save();
        return res.redirect('/admin/addProduct'); 
    } catch (error) {
        console.log('Error saving product:', error);
        return res.status(500).json({ error: 'An error occurred while saving the product' });
    }
};  
        
        const editProduct = async (req, res) => {
            try {
              

              const id = req.params.id;
              const updatedProductData = req.body;
              const pro = await Product.findById(id)
              




              const product = await Product.findByIdAndUpdate(id,updatedProductData,{new:true});
              if (!product) {
                return res.status(404).send({ message: "Product not found" });
              }
          
          
              return res.redirect('/admin/product '); 
            } catch (error) {
              return res.status(500).send({ error: "Internal server error" });
            }
          };
          
const editProductPage = async (req, res) => {
    try {
        const id = req.params.id;
        const product = await Product.findById(id)
        const categoryData = await Category.find();
        console.log('The ID is: ', id, 'and the product is: ', product);
        if (!product) {
            return res.status(404).send({ message: "Product not found" });
        }

        console.log("Product id:", id);
        console.log("Fetched Product:", product);

      
        return res.render('editProduct', { product,cate:categoryData});
    } catch (error) {
        console.error('Error fetching product:', error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};

const UpdateProduct = async (req, res) => {
    try {
        console.log('Product is being processed for editing');

        const id = req.params.id;
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).send({ message: "Product not found" });
        }

        const {
            productName,
            description,
            regularPrice,
            salePrice,
            sizes,
            quantities,
            colors,
            status,
            isListed
        } = req.body;

        // Process sizes and quantities
        let sizeQuantitiesArray = [];
        if (Array.isArray(sizes) && Array.isArray(quantities)) {
            sizeQuantitiesArray = sizes.map((size, index) => ({
                size: Number(size),
                quantity: Number(quantities[index] || 0)
            }));
        } else if (typeof sizes === 'string' && typeof quantities === 'string') {
            sizeQuantitiesArray = [{
                size: Number(sizes),
                quantity: Number(quantities || 0)
            }];
        }

        // Calculate total stock from size quantities
        const totalStock = sizeQuantitiesArray.reduce((sum, item) => sum + item.quantity, 0);

        // Update the product with new values
        product.productName = productName;
        product.description = description;
        product.regularPrice = regularPrice;
        product.salePrice = salePrice;
        product.sizes = sizeQuantitiesArray;
        product.colors = colors;
        product.status = status;
        product.isListed = isListed;
        product.stock = totalStock;

        // Handle image uploads if any
        if (req.files && req.files.length > 0) {
            const uploadImages = [];
            for (let i = 0; i <req.files.length; i++) {
                const resizedFilename = Date.now() + req.files[i].filename;
                const rePath = path.join('public', 'public', 'uploads', 're-image', resizedFilename);
                
                try {
                    await Sharp(req.files[i].path)
                        .resize({ width: 440, height: 440 })
                        .toFile(rePath);
                    uploadImages.push(resizedFilename);
                } catch (sharpError) {
                    console.log('Error processing image with Sharp:', sharpError);
                    return res.status(500).json({ error: 'Error processing image' });
                }
            }
            product.images = uploadImages;
        }

        await product.save();
        return res.redirect('/admin/product');
    } catch (error) {
        console.error('Error updating product:', error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};


const removeImage = async (req, res) => {
    try {
        const { id } = req.params;
        const { imageName } = req.query;

        console.log('Received product ID:', id);
        console.log('Received imageName:', imageName);

        const product = await Product.findById(id);
        if (!product) {
            console.log('Product not found');
            return res.status(404).send({ message: "Product not found" });
        }

        console.log('Product found:', product);

        product.images = product.images.filter(image => image.trim().toLowerCase() !== imageName.trim().toLowerCase());

        console.log('Updated images:', product.images);


        await product.save();

        res.redirect(`/admin/editProduct/${id}`);
    } catch (error) {
        console.error('Error removing image:', error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};



const productList = async (req, res) => {
    const id = req.params.id;
    try {
      const updateProduct = await Product.findByIdAndUpdate(id,
         { isListed: true }, { new: true });
      res.redirect('/admin/product');
      console.log("The listed product is:", updateProduct, id);
    } catch (error) {
      console.log(error);
      res.status(500).send('Server error. Please try again.');
    }
  };
  
  const unListProduct = async (req, res) => {
    const id = req.params.id;
    try {
      const updateProduct = await Product.findByIdAndUpdate(id, { isListed: false }, { new: true });
      res.redirect('/admin/product'); 
      console.log("The unlisted product is:", updateProduct, id);
    } catch (error) {
      console.log(error);
      res.status(500).send('Server error. Please try again.');
    }
  };

  
module.exports = {
    ProductList,
    AddProductPage,
    addProduct,
    editProduct,
    editProductPage,
    unListProduct,
    productList,
    UpdateProduct,
    // deleteSingleImage
    removeImage
    

    
 
}