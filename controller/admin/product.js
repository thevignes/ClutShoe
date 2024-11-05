const { MongoDBCollectionNamespace } = require('mongodb')
const Product = require ('../../models/product')

const User = require('../../models/userModel')
const fs = require ('fs')
const Sharp = require('sharp')
const path = require('path')
const Category = require('../../models/category')



const ProductList = async (req,res)=>{
    try {
        const products = await Product.find().populate('category', 'name');

        res.render('product',{products})
    } catch (error) {
         console.log(error)
         res.status(500).send('Server Error')
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
        // const product = req.body
        const {productName,description,price,images,size,category,regularPrice,salePrice,colors,review,quantity,isListed,stock,status} = req.body
        console.log(req.body)
        // const { category: categoryName } = req.body;
        // Check if the product already exists
        const productExist = await Product.findOne({ productName });

        if (productExist) {
            return res.status(400).json({ error: 'Product already exists' });
        }

        // Array to store image filenames
        const uploadImages = [];

        // Handle file uploads using multer
        if (req.files && req.files.length > 0) {
            for (let i = 0; i < req.files.length; i++) {
                
                const originalImagePath = req.files[i].path;
                console.log(originalImagePath,"its wwwww")
                const resizedImagesPath = path.join( 'public','public','uploads','re-image', req.files[i].filename);
                const resizedFilename = Date.now()+req.files[i].filename 
                const rePath =  path.join( 'public','public','uploads','re-image', resizedFilename);
                console.log(resizedImagesPath,"its also")
                
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

        // Find category by name
        const categoryData = await Category.findOne({ name: category });
        if (!categoryData) {
            return res.status(404).json({ error: 'Category not found' });
        }
      
        // Create a new product with all details

        const newProduct = new Product({
            productName,
            price,
            description,
            images : uploadImages,
            category:categoryData?._id,
            regularPrice,
            salePrice,
            quantity,
            size,
            colors,
            isListed,
            stock,
            review,
            status
        });
    
            
        // Save product to the database
        await newProduct.save();
        // console.log("Product added successfully:", newProduct);
        return res.redirect('/admin/addProduct');  // Redirect after success
    } catch (error) {
        console.log('Error saving product:', error);
        return res.status(500).json({ error: 'An error occurred while saving the product' });
    }
};  
        
        const editProduct = async (req, res) => {
            try {
            //   const product = req.body.
              

              const id = req.params.id;
              const updatedProductData = req.body;
              const pro = await Product.findById(id)
              




              const product = await Product.findByIdAndUpdate(id,updatedProductData,{new:true});
              if (!product) {
                return res.status(404).send({ message: "Product not found" });
              }
          
              // console.log(category, " is edited");
          
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

        const data = req.body;
        console.log('Data received for update:', data);

        // Check if another product with the same name exists
        const existingProduct = await Product.findOne({
            productName: data.productName,
            _id: { $ne: id }
        });

        if (existingProduct) {
            return res.status(400).send({ message: "Product already exists" });
        }
        const uploadImages = [];

        // Handle file uploads using multer
        if (req.files && req.files.length > 0) {
            for (let i = 0; i < req.files.length; i++) {
                
                const originalImagePath = req.files[i].path;
                console.log(originalImagePath,"its wwwww")
                const resizedImagesPath = path.join( 'public','public','uploads','re-image', req.files[i].filename);
                const resizedFilename = Date.now()+req.files[i].filename 
                const rePath =  path.join( 'public','public','uploads','re-image', resizedFilename);
                console.log(resizedImagesPath,"its also")
                
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

        // Build the update object
        const updateField = {
            productName: data.productName || product.productName,
            description: data.description || product.description,
            category: data.category || product.category,
            regularPrice: data.regularPrice || product.regularPrice,
            salePrice: data.salePrice || product.salePrice,
            quantity: data.quantity || product.quantity,
        };

        // Update product in the database
        if (uploadImages.length > 0) {
            // If there are new images, push them into the existing array
            await Product.findByIdAndUpdate(id, {
                $set: updateField,
                $push: { images: { $each: uploadImages } } // Ensure 'images' matches your model's field name
            }, { new: true });
        } else {
            // If no new images, just update the product details
            await Product.findByIdAndUpdate(id, { $set: updateField }, { new: true });
        }

        console.log('Product edited successfully:', updateField);
        res.redirect('/admin/product');

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